import mysql from 'mysql2/promise';

const bikeUpdates = [
  { slug: 'honda-cd-70', name: 'Honda CD 70', pricePkr: 159900, engineCc: 72, availability: 'in_stock' },
  { slug: 'honda-cd-70-dream', name: 'Honda CD 70 Dream', pricePkr: 170900, engineCc: 72, availability: 'in_stock' },
  { slug: 'honda-pridor', name: 'Honda Pridor', pricePkr: 211900, engineCc: 100, availability: 'in_stock' },
  { slug: 'honda-cg-125', name: 'Honda CG 125', pricePkr: 238900, engineCc: 125, availability: 'in_stock' },
  { slug: 'honda-cg-125s', name: 'Honda CG 125S', pricePkr: 286900, engineCc: 125, availability: 'in_stock' },
  { slug: 'honda-cg-125s-gold', name: 'Honda CG 125S Gold', pricePkr: 296900, engineCc: 125, availability: 'in_stock' },
  { slug: 'honda-cb-125f', name: 'Honda CB 125F', pricePkr: 396900, engineCc: 125, availability: 'in_stock' },
  { slug: 'honda-cb-150f', name: 'Honda CB 150F', pricePkr: 499900, engineCc: 150, availability: 'in_stock' },
  { slug: 'honda-cg-150', name: 'Honda CG 150', pricePkr: 475000, engineCc: 150, availability: 'in_stock' }
];

async function updatePrices() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'honda_bikes_store'
  });

  console.log('Connected to MySQL successfully!');

  for (const b of bikeUpdates) {
    const imgPath = `/images/bikes/${b.slug}.jpg`;
    const [result] = await connection.execute(
      `UPDATE products 
       SET price_pkr = ?, 
           engine_cc = ?, 
           availability = ?,
           images = ?,
           is_verified = 1
       WHERE slug = ?`,
      [b.pricePkr, b.engineCc, b.availability, JSON.stringify([imgPath]), b.slug]
    );
    console.log(`Updated ${b.name}: PKR ${b.pricePkr.toLocaleString()} | ${b.engineCc}cc (affected: ${result.affectedRows})`);
  }

  await connection.end();
}

updatePrices()
  .then(() => {
    console.log('All motorcycle prices and engine specs updated successfully in MySQL!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to update bike prices:', err);
    process.exit(1);
  });
