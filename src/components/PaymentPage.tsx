"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return undefined;
  return `$${price.toFixed(2)}`;
}

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

// Define the expected structure for cart data from cookies
interface CartCookieItem {
  variantId?: string;
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
  });

  // Function to get cart from cookies
  const getCartFromCookies = (): CartItem[] => {
    if (typeof window !== "undefined") {
      const cartCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("cart="));

      if (cartCookie) {
        try {
          const cartData: CartCookieItem[] = JSON.parse(
            decodeURIComponent(cartCookie.split("=")[1])
          );
          return cartData.map((item: CartCookieItem) => ({
            id: item.variantId || item.id,
            name: item.name,
            sku: `SKU-${item.variantId || item.id}`,
            price: item.price,
            quantity: item.quantity,
            image: item.image || "/placeholder-image.jpg",
          }));
        } catch {
          return [];
        }
      }
    }
    return [];
  };

  useEffect(() => {
    const existingCart = getCartFromCookies();
    setCartItems(existingCart);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to payment processing page
    window.location.href = "/payment-processing";
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = 2.0;
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-dark-700">Loading payment...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
      <nav className="py-4 text-caption text-white">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-white">Checkout</span>
      </nav>

      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary - Left Side (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-black rounded-lg p-6 border border-dark-500">
              <h2 className="text-heading-4 text-white font-semibold mb-6">
                Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-body text-white">Total Items</span>
                  <span className="text-body text-white font-medium">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-body text-white">Subtotal</span>
                  <span className="text-body text-white font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-body text-white">
                    Estimated Delivery & Handling
                  </span>
                  <span className="text-body text-white font-medium">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>

                <hr className="border-dark-500" />

                <div className="flex justify-between items-center">
                  <span className="text-body-large text-white font-semibold">
                    Total
                  </span>
                  <span className="text-body-large text-white font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg p-6 border border-dark-500">
              <div className="mb-6">
                <h1 className="text-heading-3 text-white font-semibold mb-2">
                  Payment Details
                </h1>
                <p className="text-body text-dark-600">
                  Complete your purchase by providing your payment details
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-body-medium text-white font-medium mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none"
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderColor: '#999999',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    required
                  />
                </div>

                {/* Card Name */}
                <div>
                  <label
                    htmlFor="cardName"
                    className="block text-body-medium text-white font-medium mb-2"
                  >
                    Card Name
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none"
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderColor: '#999999',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    required
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label
                    htmlFor="cardNumber"
                    className="block text-body-medium text-white font-medium mb-2"
                  >
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 - 1234 - 1234 - 1234"
                    className="w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none"
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderColor: '#999999',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    required
                  />
                </div>

                {/* Expiry Date and CVV on same line */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block text-body-medium text-white font-medium mb-2"
                    >
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none"
                      style={{
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderColor: '#999999',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cvv"
                      className="block text-body-medium text-white font-medium mb-2"
                    >
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="CVV"
                      className="w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none"
                      style={{
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderColor: '#999999',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <label
                    htmlFor="billingAddress"
                    className="block text-body-medium text-white font-medium mb-2"
                  >
                    Billing Address
                  </label>
                  <input
                    type="text"
                    id="billingAddress"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    placeholder="12 SW Longer Str madeylia"
                    className="w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none"
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderColor: '#999999',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    required
                  />
                </div>

                {/* Total Amount before Pay button */}
                <div className="bg-light-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-body-large text-white font-semibold">
                      Total Amount
                    </span>
                    <span className="text-body-large text-white font-bold">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  type="submit" 
                  className="w-full !bg-black !text-white !border-gray-300 py-4 px-6 rounded-lg text-body-medium font-medium hover:!bg-white hover:!text-black focus:!text-black transition-colors border"
                >
                  Pay
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}