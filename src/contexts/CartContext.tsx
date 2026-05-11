import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  processingDays: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  wishlist: string[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  isInCart: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  clearCart: () => void;
  getCartCount: () => number;
  getTotal: () => number;
  isOrderModalOpen: boolean;
  openOrderModal: () => void;
  closeOrderModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mf_cart';
const WISHLIST_STORAGE_KEY = 'mf_wishlist';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((item: CartItem) => {
    setItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const isInCart = useCallback((id: string) => {
    return items.some(i => i.id === id);
  }, [items]);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const isWishlisted = useCallback((id: string) => {
    return wishlist.includes(id);
  }, [wishlist]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getCartCount = useCallback(() => items.length, [items]);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const openOrderModal = useCallback(() => setIsOrderModalOpen(true), []);
  const closeOrderModal = useCallback(() => setIsOrderModalOpen(false), []);

  return (
    <CartContext.Provider value={{
      items,
      wishlist,
      addToCart,
      removeFromCart,
      isInCart,
      toggleWishlist,
      isWishlisted,
      clearCart,
      getCartCount,
      getTotal,
      isOrderModalOpen,
      openOrderModal,
      closeOrderModal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
