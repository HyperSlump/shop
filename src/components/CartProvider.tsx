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
  locationEstimate: { country: string; region: string } | null;
  estimatedShipping: number | null;
  estimatedTax: number | null;
  isEstimatingShipping: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasVisitedCheckout, setHasVisitedCheckout] = useState(false);
  const [locationEstimate, setLocationEstimate] = useState<{ country: string; region: string } | null>(null);
  const [estimatedShipping, setEstimatedShipping] = useState<number | null>(null);
  const [estimatedTax, setEstimatedTax] = useState<number | null>(null);
  const [isEstimatingShipping, setIsEstimatingShipping] = useState(false);
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

    // Fetch geolocation
    const fetchGeo = async () => {
      try {
        const res = await fetch('/api/geo');
        if (res.ok) {
          const data = await res.json();
          setLocationEstimate(data);
        }
      } catch (e) {
        console.error('Failed to fetch geo', e);
      }
    };
    fetchGeo();
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('hyperslump-cart', JSON.stringify(cart));

      // If cart becomes empty, reset checkout visited status and shipping
      if (cart.length === 0) {
        setEstimatedShipping(null);
        setEstimatedTax(null);
        if (hasVisitedCheckout) {
          setHasVisitedCheckout(false);
          localStorage.removeItem('hyperslump-checkout-visited');
        }
      }
    }
  }, [cart, isMounted, hasVisitedCheckout]);

  // Handle estimated shipping
  useEffect(() => {
    const physicalItems = cart.filter(item => item.metadata?.type === 'PHYSICAL');
    if (!isMounted || physicalItems.length === 0 || !locationEstimate) {
      setEstimatedShipping(null);
      setEstimatedTax(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsEstimatingShipping(true);
      try {
        const res = await fetch('/api/printful/shipping-rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: {
              country_code: locationEstimate.country,
              state_code: locationEstimate.region,
            },
            items: cart
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.rates && data.rates.length > 0) {
            const sorted = [...data.rates].sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
            setEstimatedShipping(parseFloat(sorted[0].rate));
            if (typeof data.tax === 'number') {
              setEstimatedTax(data.tax);
            }
          }
        }
      } catch (e) {
        console.error('Failed to estimate shipping', e);
      } finally {
        setIsEstimatingShipping(false);
      }
    }, 1000); // Debounce to avoid too many requests

    return () => clearTimeout(timer);
  }, [cart, locationEstimate, isMounted]);

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
        locationEstimate,
        estimatedShipping,
        estimatedTax,
        isEstimatingShipping,
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
