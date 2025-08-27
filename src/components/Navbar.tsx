"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// Define proper types for cart items
interface CartItem {
  quantity: number;
  [key: string]: unknown;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Function to get cart count from cookies (client-side)
  const getCartCount = () => {
    if (typeof window !== 'undefined') {
      const cart = document.cookie
        .split('; ')
        .find(row => row.startsWith('cart='));
      
      if (cart) {
        try {
          const cartData = JSON.parse(decodeURIComponent(cart.split('=')[1]));
          return cartData.reduce((total: number, item: CartItem) => total + item.quantity, 0);
        } catch {
          return 0;
        }
      }
    }
    return 0;
  };

  useEffect(() => {
    // Initial cart count load
    setCartCount(getCartCount());
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      setCartCount(getCartCount());
    };
    
    // Add event listener
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Also listen for page visibility changes to refresh cart count
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setCartCount(getCartCount());
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-dark-900 border-b border-dark-700">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link href="/" aria-label="LH" className="flex items-center">
          <Image src="/logo2.png" alt="LH" width={50} height={50} priority className="" />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link 
            href="/" 
            className="text-body text-light-100 transition-colors hover:text-light-300"
          >
            Products
          </Link>
          <Link 
            href="/cart" 
            className="text-body text-light-100 transition-colors hover:text-light-300"
          >
            Cart ({cartCount})
          </Link>
        </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md p-2 !bg-dark-900 !text-white border !border-dark-900 md:hidden hover:!bg-dark-900 active:!bg-dark-900 focus:!bg-dark-900"
            aria-controls="mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="flex flex-col gap-1">
              <span className={`block h-0.5 w-5 !bg-white transition-transform duration-200 ${open ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block h-0.5 w-5 !bg-white transition-opacity duration-200 ${open ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-5 !bg-white transition-transform duration-200 ${open ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
      </nav>

      <div
        id="mobile-menu"
        className={`border-t border-dark-700 bg-black md:hidden ${open ? "block" : "hidden"}`}
      >
        <div className="px-4 py-4 space-y-4">
          <Link 
            href="/" 
            className="block text-body text-white transition-colors hover:text-light-300"
            onClick={() => setOpen(false)}
          >
            Products
          </Link>
          <Link 
            href="/cart" 
            className="block text-body text-white transition-colors hover:text-light-300"
            onClick={() => setOpen(false)}
          >
            Cart ({cartCount})
          </Link>
        </div>
      </div>
    </header>
  );
}