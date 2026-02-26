'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Product = {
  id: string; // This is the Price ID or pf_id
  productId: string;
  name: string;
  description: string | null;
  image: string;
  currency: string;
  amount: number;
  quantity?: number;
  metadata: Record<string, string>;
  variants?: Array<{
    id: number;
    catalog_variant_id?: number;
    external_id?: string;
    name: string;
    retail_price: string;
    currency: string;
    image?: string;
  }>;
};

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (priceId: string) => void;
  updateQuantity: (priceId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  cartTotal: number;
  hasVisitedCheckout: boolean;
  setHasVisitedCheckout: (val: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasVisitedCheckout, setHasVisitedCheckout] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setIsMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    const savedCart = localStorage.getItem('hyperslump-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }

    const savedCheckout = localStorage.getItem('hyperslump-checkout-visited');
    if (savedCheckout === 'true') {
      setHasVisitedCheckout(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('hyperslump-cart', JSON.stringify(cart));

      // If cart becomes empty, reset checkout visited status
      if (cart.length === 0 && hasVisitedCheckout) {
        setHasVisitedCheckout(false);
        localStorage.removeItem('hyperslump-checkout-visited');
      }
    }
  }, [cart, isMounted, hasVisitedCheckout]);

  useEffect(() => {
    if (isMounted) {
      if (hasVisitedCheckout) {
        localStorage.setItem('hyperslump-checkout-visited', 'true');
      } else {
        localStorage.removeItem('hyperslump-checkout-visited');
      }
    }
  }, [hasVisitedCheckout, isMounted]);

  const addToCart = (product: Product) => {
    // Only open the cart if it's the first item being added
    if (cart.length === 0) {
      setIsCartOpen(true);
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      // If DIGITAL, restrict to quantity 1
      if (exists && product.metadata?.type !== 'PHYSICAL') {
        return prev;
      }

      // If PHYSICAL, increment quantity
      if (exists) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(10, (item.quantity || 1) + 1) }
            : item
        );
      }

      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (priceId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== priceId));
  };

  const updateQuantity = (priceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(priceId);
      return;
    }
    setCart((prev) => prev.map(item =>
      item.id === priceId
        ? { ...item, quantity: item.metadata?.type === 'PHYSICAL' ? Math.min(10, quantity) : 1 }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setHasVisitedCheckout(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hyperslump-cart');
      localStorage.removeItem('hyperslump-checkout-visited');
    }
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.amount * (item.quantity || 1)), 0);

  // Avoid hydration mismatch by not rendering anything cart-related until mounted? 
  // No, we should render children, but maybe not the cart state dependent UI immediately if it flickers.
  // Actually context is fine, but accessing localStorage needs to be in useEffect (above).

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        cartTotal,
        hasVisitedCheckout,
        setHasVisitedCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
