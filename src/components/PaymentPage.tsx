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

interface FormErrors {
  email?: string;
  cardName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  billingAddress?: string;
}

// Card type detection
const detectCardType = (number: string): string => {
  const cleaned = number.replace(/\s+/g, '').replace(/-/g, '');
  
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  
  return '';
};

// Format card number with hyphens
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s+/g, '').replace(/-/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join('-').substr(0, 19); // 4-4-4-4 format with hyphens
};

// Format expiry date MM/YY
const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
  }
  return cleaned;
};

// Validate email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Simple card number validation - just check first digit and length
const validateCardNumber = (number: string): boolean => {
  const cleaned = number.replace(/\s+/g, '').replace(/-/g, '');
  
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Just check if it starts with a valid first digit for major card types
  const firstDigit = cleaned.charAt(0);
  return ['3', '4', '5', '6'].includes(firstDigit);
};

// Validate expiry date
const validateExpiryDate = (expiry: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  
  const [month, year] = expiry.split('/');
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (monthNum < 1 || monthNum > 12) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;
  
  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return false;
  }
  
  return true;
};

// Validate CVV
const validateCVV = (cvv: string, cardType: string): boolean => {
  if (cardType === 'American Express') {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
};

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [cardType, setCardType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    let formattedValue = value;
    const newErrors = { ...errors };

    // Clear error for current field
    delete newErrors[name as keyof FormErrors];

    switch (name) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        const detectedType = detectCardType(formattedValue);
        setCardType(detectedType);
        break;
      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').substr(0, cardType === 'American Express' ? 4 : 3);
        break;
      case 'cardName':
        formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email address is not valid';
    }

    // Card name validation
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    } else if (formData.cardName.trim().length < 2) {
      newErrors.cardName = 'Enter a valid name';
    }

    // Card number validation
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Enter a valid card number';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = 'Enter a valid card expiry date';
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!validateCVV(formData.cvv, cardType)) {
      newErrors.cvv = `Enter a valid ${cardType === 'American Express' ? '4' : '3'}-digit CVV`;
    }

    // Billing address validation
    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    } else if (formData.billingAddress.trim().length < 10) {
      newErrors.billingAddress = 'Enter your complete billing address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to payment processing page
      window.location.href = "/payment-processing";
    } catch (error) {
      console.error('Payment failed:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
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
                    Delivery Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className={`w-full px-4 py-3 rounded-lg text-body bg-black placeholder-gray-400 focus:outline-none ${
                      errors.email ? 'border-red-500' : 'border-gray-600'
                    }`}
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderColor: errors.email ? '#ef4444' : '#999999',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Card Name */}
                <div>
                  <label
                    htmlFor="cardName"
                    className="block text-body-medium text-white font-medium mb-2"
                  >
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none`}
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderColor: errors.cardName ? '#ef4444' : '#999999',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    required
                  />
                  {errors.cardName && (
                    <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <label
                    htmlFor="cardNumber"
                    className="block text-body-medium text-white font-medium mb-2"
                  >
                    Card Number {cardType && <span className="text-white">- {cardType}</span>}
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234-1234-1234-1234"
                    maxLength={19}
                    className={`w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none`}
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderColor: errors.cardNumber ? '#ef4444' : '#999999',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    required
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
                  )}
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
                      maxLength={5}
                      className={`w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none`}
                      style={{
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderColor: errors.expiryDate ? '#ef4444' : '#999999',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      required
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="cvv"
                      className="block text-body-medium text-white font-medium mb-2"
                    >
                      CVV {cardType === 'American Express' ? '(4 digits)' : '(3 digits)'}
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder={cardType === 'American Express' ? '1234' : '123'}
                      maxLength={cardType === 'American Express' ? 4 : 3}
                      className={`w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none`}
                      style={{
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderColor: errors.cvv ? '#ef4444' : '#999999',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      required
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                    )}
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
                    className={`w-full px-4 py-3 rounded-lg text-body placeholder-gray-400 focus:outline-none`}
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderColor: errors.billingAddress ? '#ef4444' : '#999999',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    required
                  />
                  {errors.billingAddress && (
                    <p className="mt-1 text-sm text-red-500">{errors.billingAddress}</p>
                  )}
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
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg text-body-medium font-medium border transition-colors ${
                    isSubmitting
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-black text-white border-gray-300 hover:bg-white hover:text-black focus:text-black'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Pay'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}