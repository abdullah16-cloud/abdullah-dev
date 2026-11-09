import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'honda_bikes_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isInitialMount = useRef(true);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  // Persist cart to localStorage only when modified
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [items]);

  const addToCart = (bike, quantity = 1, selectedColor = null, showDrawer = true) => {
    if (!bike) return;
    const bikeId = bike.id || bike.slug || bike.internalId;

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((item) => item.id === bikeId);
      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      }

      const imageUrl =
        Array.isArray(bike.images) && bike.images.length > 0
          ? bike.images[0]
          : bike.imageUrl || `/images/bikes/${bike.slug || bike.id}.jpg`;

      const newItem = {
        id: bikeId,
        slug: bike.slug || bike.id,
        name: bike.name,
        category: bike.category || bike.categoryTitle || 'Motorcycle',
        pricePkr: bike.pricePkr !== null && bike.pricePkr !== undefined ? Number(bike.pricePkr) : null,
        imageUrl,
        selectedColor: selectedColor || (Array.isArray(bike.colors) && bike.colors[0]) || 'Standard',
        quantity,
      };

      return [...prevItems, newItem];
    });

    if (showDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const removeFromCart = (bikeId) => {
    setItems((prev) => prev.filter((item) => item.id !== bikeId));
  };

  const updateQuantity = (bikeId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bikeId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === bikeId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (bikeId) => {
    return items.some((item) => item.id === bikeId);
  };

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [items]);

  const cartTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.pricePkr) {
        return sum + item.pricePkr * (item.quantity || 1);
      }
      return sum;
    }, 0);
  }, [items]);

  const value = {
    items,
    cartItems: items,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
      cartCount: 0,
      cartTotal: 0,
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      isInCart: () => false,
      isDrawerOpen: false,
      openDrawer: () => {},
      closeDrawer: () => {},
      toggleDrawer: () => {},
    };
  }
  return context;
}
