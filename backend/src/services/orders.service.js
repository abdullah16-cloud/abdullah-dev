import { config } from '../config/env.js';
import { pool } from '../db/pool.js';
import { withTransaction } from '../db/transaction.js';
import { AppError } from '../utils/AppError.js';
import { calculateOrderPricing } from '../utils/pricing.js';

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PK-${dateStr}-${randomSuffix}`;
}

export const ordersService = {
  async createOrder({ customer, items, userId = null }) {
    return await withTransaction(async (client) => {
      // 1. Fetch real product data from DB to ignore any client-sent prices
      const requestedSlugs = items.map((i) => i.productSlug);
      const productQuery = `
        SELECT id, slug, name, price_pkr, availability, track_inventory, stock_quantity, is_active
        FROM products
        WHERE slug = ANY($1)
        FOR SHARE
      `;
      const productRes = await client.query(productQuery, [requestedSlugs]);
      const productMap = new Map(productRes.rows.map((p) => [p.slug, p]));

      // 2. Validate all products exist and are active
      for (const item of items) {
        const dbProduct = productMap.get(item.productSlug);
        if (!dbProduct || !dbProduct.is_active) {
          throw new AppError(
            `Product '${item.productSlug}' is unavailable or no longer listed.`,
            400,
            'PRODUCT_UNAVAILABLE'
          );
        }
      }

      // 3. Atomically check and decrement stock if inventory tracking is enabled
      const itemsWithDbData = [];
      for (const item of items) {
        const dbProduct = productMap.get(item.productSlug);

        if (dbProduct.track_inventory) {
          const updateStockSql = `
            UPDATE products
            SET stock_quantity = stock_quantity - ?
            WHERE id = ? AND stock_quantity >= ?
          `;
          const stockRes = await client.query(updateStockSql, [item.quantity, dbProduct.id, item.quantity]);
          if ((stockRes.rowCount || 0) === 0) {
            throw new AppError(
              `Insufficient stock available for '${dbProduct.name}'.`,
              409,
              'OUT_OF_STOCK'
            );
          }
        }

        itemsWithDbData.push({
          productId: dbProduct.id,
          productSlug: dbProduct.slug,
          productName: dbProduct.name,
          selectedColor: item.selectedColor || null,
          quantity: item.quantity,
          unitPricePkr: dbProduct.price_pkr !== null ? parseFloat(dbProduct.price_pkr) : null,
        });
      }

      // 4. Calculate prices with integer math (never JS floats)
      const pricing = calculateOrderPricing(itemsWithDbData, config.DELIVERY_CHARGE_PKR);

      // 5. Insert order
      const orderNumber = generateOrderNumber();
      const insertOrderSql = `
        INSERT INTO orders (
          order_number, user_id, customer_name, customer_email, customer_phone,
          shipping_city, shipping_address, payment_method, status,
          subtotal_pkr, delivery_fee_pkr, total_pkr, customer_notes, is_demo_data
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'cod', 'pending', ?, ?, ?, ?, false)
      `;

      const orderRes = await client.query(insertOrderSql, [
        orderNumber,
        userId,
        customer.fullName,
        customer.email,
        customer.phone,
        customer.city,
        customer.address,
        pricing.subtotalPkr,
        pricing.deliveryFeePkr !== null ? pricing.deliveryFeePkr : 0,
        pricing.totalPkr,
        customer.notes || null,
      ]);
      const createdOrderId = orderRes.insertId || orderRes.rows?.[0]?.id;

      // 6. Insert order items snapshot
      const orderItemsToReturn = [];
      for (const item of pricing.items) {
        const insertItemSql = `
          INSERT INTO order_items (
            order_id, product_id, product_name, product_slug, selected_color,
            unit_price_pkr, quantity, line_total_pkr
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const itemRes = await client.query(insertItemSql, [
          createdOrderId,
          item.productId,
          item.productName,
          item.productSlug,
          item.selectedColor,
          item.unitPricePkr,
          item.quantity,
          item.lineTotalPkr,
        ]);
        const savedItemId = itemRes.insertId || itemRes.rows?.[0]?.id;
        orderItemsToReturn.push({
          id: savedItemId,
          productName: item.productName,
          productSlug: item.productSlug,
          selectedColor: item.selectedColor,
          unitPricePkr: item.unitPricePkr !== null ? parseFloat(item.unitPricePkr) : null,
          quantity: item.quantity,
          lineTotalPkr: item.lineTotalPkr !== null ? parseFloat(item.lineTotalPkr) : null,
        });
      }

      // 7. Initial Status History Audit
      const historySql = `
        INSERT INTO order_status_history (order_id, status, notes)
        VALUES (?, 'pending', 'Order request submitted via checkout.')
      `;
      await client.query(historySql, [createdOrderId]);

      return {
        orderNumber,
        status: 'pending',
        items: orderItemsToReturn,
        subtotalPkr: pricing.subtotalPkr,
        deliveryChargePkr: pricing.deliveryFeePkr,
        totalPkr: pricing.totalPkr,
        isPriceFinal: pricing.isPriceFinal,
        message:
          'Your order request has been received. The dealership will contact you to confirm price, delivery and registration details.',
      };
    });
  },

  async getMyOrders(userId, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS total FROM orders WHERE user_id = $1',
      [userId]
    );
    const totalCount = countRes.rows[0]?.total || 0;

    const ordersSql = `
      SELECT id, order_number, status, subtotal_pkr, delivery_fee_pkr, total_pkr,
             shipping_city, shipping_address, payment_method, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const ordersRes = await pool.query(ordersSql, [userId, limit, offset]);

    if (ordersRes.rows.length === 0) {
      return {
        orders: [],
        pagination: { total: 0, page, limit, totalPages: 1 },
      };
    }

    const orderIds = ordersRes.rows.map((o) => o.id);
    const itemsRes = await pool.query(
      `SELECT order_id, product_name, product_slug, selected_color, unit_price_pkr, quantity, line_total_pkr
       FROM order_items WHERE order_id = ANY($1)`,
      [orderIds]
    );

    const itemsByOrderId = new Map();
    itemsRes.rows.forEach((row) => {
      const list = itemsByOrderId.get(row.order_id) || [];
      list.push({
        productName: row.product_name,
        productSlug: row.product_slug,
        selectedColor: row.selected_color,
        unitPricePkr: row.unit_price_pkr !== null ? parseFloat(row.unit_price_pkr) : null,
        quantity: row.quantity,
        lineTotalPkr: row.line_total_pkr !== null ? parseFloat(row.line_total_pkr) : null,
      });
      itemsByOrderId.set(row.order_id, list);
    });

    const orders = ordersRes.rows.map((row) => ({
      orderNumber: row.order_number,
      status: row.status,
      subtotalPkr: row.subtotal_pkr !== null ? parseFloat(row.subtotal_pkr) : null,
      deliveryFeePkr: row.delivery_fee_pkr !== null ? parseFloat(row.delivery_fee_pkr) : null,
      totalPkr: row.total_pkr !== null ? parseFloat(row.total_pkr) : null,
      shippingCity: row.shipping_city,
      shippingAddress: row.shipping_address,
      paymentMethod: row.payment_method,
      createdAt: row.created_at,
      items: itemsByOrderId.get(row.id) || [],
    }));

    return {
      orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  async getMyOrderByNumber(userId, orderNumber) {
    const orderSql = `
      SELECT id, order_number, user_id, customer_name, customer_email, customer_phone,
             shipping_city, shipping_address, payment_method, status,
             subtotal_pkr, delivery_fee_pkr, total_pkr, customer_notes, created_at
      FROM orders
      WHERE order_number = $1
      LIMIT 1
    `;
    const result = await pool.query(orderSql, [orderNumber]);
    const order = result.rows[0];

    // Security check: if order does not exist OR does not belong to this user,
    // return 404 to avoid leaking existence of other users' orders.
    if (!order || String(order.user_id) !== String(userId)) {
      throw new AppError(`Order #${orderNumber} not found.`, 404, 'NOT_FOUND');
    }

    const itemsRes = await pool.query(
      `SELECT product_name, product_slug, selected_color, unit_price_pkr, quantity, line_total_pkr
       FROM order_items WHERE order_id = $1`,
      [order.id]
    );

    return {
      orderNumber: order.order_number,
      status: order.status,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingCity: order.shipping_city,
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      subtotalPkr: order.subtotal_pkr !== null ? parseFloat(order.subtotal_pkr) : null,
      deliveryFeePkr: order.delivery_fee_pkr !== null ? parseFloat(order.delivery_fee_pkr) : null,
      totalPkr: order.total_pkr !== null ? parseFloat(order.total_pkr) : null,
      customerNotes: order.customer_notes,
      createdAt: order.created_at,
      items: itemsRes.rows.map((r) => ({
        productName: r.product_name,
        productSlug: r.product_slug,
        selectedColor: r.selected_color,
        unitPricePkr: r.unit_price_pkr !== null ? parseFloat(r.unit_price_pkr) : null,
        quantity: r.quantity,
        lineTotalPkr: r.line_total_pkr !== null ? parseFloat(r.line_total_pkr) : null,
      })),
    };
  },
};
