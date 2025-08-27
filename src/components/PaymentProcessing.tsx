"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Define the expected structure for cart data from cookies
interface CartCookieItem {
  quantity: number;
}

export default function PaymentProcessing() {
  const [showSuccess, setShowSuccess] = useState(false);

  // Function to get cart count from cookies
  const getCartCount = () => {
    if (typeof window !== 'undefined') {
      const cart = document.cookie
        .split('; ')
        .find(row => row.startsWith('cart='));
      
      if (cart) {
        try {
          const cartData: CartCookieItem[] = JSON.parse(decodeURIComponent(cart.split('=')[1]));
          return cartData.reduce((total: number, item: CartCookieItem) => total + item.quantity, 0);
        } catch {
          return 0;
        }
      }
    }
    return 0;
  };

  // Function to clear cart from cookies
  const clearCart = () => {
    if (typeof window !== 'undefined') {
      // Remove cart cookie by setting it to expire in the past
      document.cookie = 'cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Trigger cart update event for navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  useEffect(() => {
    // Store initial cart count when component mounts
    getCartCount();

    // Show success message and clear cart after 10 seconds
    const timer = setTimeout(() => {
      setShowSuccess(true);
      
      // Add a small delay before clearing cart to ensure UI updates first
      setTimeout(() => {
        clearCart();
      }, 100);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
<nav className="py-4 text-caption text-white">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        <span className="text-white">Payment</span>
      </nav>

<div className="flex items-center justify-center pt-20 pb-32 bg-black">
        <div className="text-center max-w-md mx-auto">
          {!showSuccess ? (
            // Loading State
            <>
              <div className="mb-8">
                <div className="w-16 h-16 mx-auto border-4 border-dark-200 border-t-dark-900 rounded-full animate-spin"></div>
              </div>
              <h1 className="text-heading-3 text-white font-semibold mb-4">
                Processing Your Payment
              </h1>
<p className="text-body text-white">
                Please wait while we process your payment. This may take a few moments.
              </p>
            </>
          ) : (
            // Success State
            <>
              <div className="mb-8">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-heading-3 text-white font-semibold mb-4">
                Thank You!
              </h1>
<p className="text-body text-white mb-8">
                Your payment is being processed. You will receive a confirmation email shortly.
              </p>
              <Link
                href="/"
                className="inline-block bg-black !text-white !border-gray-300 px-6 py-3 rounded-lg text-body-medium font-medium hover:!bg-white hover:!text-black focus:!text-black transition-colors border"
              >
                Continue Shopping
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}