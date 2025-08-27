"use client";

import Link from "next/link";
import { Minus, Plus, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

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

interface CartItemProps {
  item: CartItem;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
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

// Define the selected product structure
interface SelectedProduct {
  id: number | string;
  title: string;
  price: number;
  imageSrc: string;
}

function CartItemComponent({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-light-300">
      <div className="w-16 h-16 bg-light-200 rounded-lg flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          width={64}
          height={64}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-body-medium text-dark-900 font-medium">{item.name}</h3>
        <p className="text-caption text-dark-500 mt-1">{item.sku}</p>
        
        <div className="flex items-center gap-3 mt-2">
          <span className="text-caption text-dark-700">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
              className="w-6 h-6 rounded-full border border-light-400 flex items-center justify-center text-dark-700 hover:bg-light-100"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-body text-dark-900 min-w-[2rem] text-center">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="w-6 h-6 rounded-full border border-light-400 flex items-center justify-center text-dark-700 hover:bg-light-100"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-body-medium text-dark-900 font-medium">
          {formatPrice(item.price * item.quantity)}
        </span>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function CartContent({ selectedProduct }: { selectedProduct?: SelectedProduct }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const processedProductRef = useRef<string | null>(null);

  // Function to get cart from cookies
  const getCartFromCookies = (): CartItem[] => {
    if (typeof window !== 'undefined') {
      const cartCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('cart='));
      
      if (cartCookie) {
        try {
          const cartData: CartCookieItem[] = JSON.parse(decodeURIComponent(cartCookie.split('=')[1]));
          return cartData.map((item: CartCookieItem) => ({
            id: item.variantId || item.id,
            name: item.name,
            sku: `SKU-${item.variantId || item.id}`,
            price: item.price,
            quantity: item.quantity,
            image: item.image || '/placeholder-image.jpg'
          }));
        } catch {
          return [];
        }
      }
    }
    return [];
  };

  // Function to save cart to cookies
  const saveCartToCookies = (items: CartItem[]) => {
    const cartData = items.map(item => ({
      variantId: item.id,
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    
    document.cookie = `cart=${encodeURIComponent(JSON.stringify(cartData))}; expires=${expires.toUTCString()}; path=/`;
    
    // Trigger cart update event for navbar
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  // Load cart on mount and handle selectedProduct
  useEffect(() => {
    const existingCart = getCartFromCookies();
    
    // If there's a selectedProduct and we haven't processed it yet
    if (selectedProduct && processedProductRef.current !== selectedProduct.id.toString()) {
      const productId = selectedProduct.id.toString();
      processedProductRef.current = productId;
      
      const existingItemIndex = existingCart.findIndex(item => item.id === productId);
      
      let newCart;
      
      if (existingItemIndex !== -1) {
        // Product already exists in cart - increase quantity
        newCart = existingCart.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Product doesn't exist - add as new item
        const newItem: CartItem = {
          id: productId,
          name: selectedProduct.title,
          sku: `SKU-${productId}`,
          price: selectedProduct.price,
          quantity: 1,
          image: selectedProduct.imageSrc
        };
        newCart = [...existingCart, newItem];
      }
      
      setCartItems(newCart);
      saveCartToCookies(newCart);
    } else if (!selectedProduct) {
      // No selectedProduct - just load existing cart
      setCartItems(existingCart);
    }
    
    setIsLoading(false);
  }, [selectedProduct]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    saveCartToCookies(updatedItems);
  };
  
  const handleRemove = (id: string) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    saveCartToCookies(updatedItems);
  };
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.00;
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-dark-700">Loading cart...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
      <nav className="py-4 text-caption text-dark-700">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        <span className="text-dark-900">Cart</span>
      </nav>

      <div className="min-h-screen">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2">
            {/* Header with Continue Shopping on same line */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-heading-3 text-dark-900">My Cart</h2>
              {cartItems.length > 0 && (
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 text-body-medium text-black transition hover:text-dark-700 focus:outline-none focus-visible:underline"
                >
                  <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                  <span>Continue Shopping</span>
                </Link>
              )}
            </div>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-dark-700 mb-4">Your cart is empty</p>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 bg-dark-900 text-white px-6 py-3 rounded-full hover:opacity-90 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Summary - Right Side */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 text-dark-900 border border-light-300">
                <h3 className="text-heading-4 text-dark-900 mb-6">Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-body text-dark-700">Total Items</span>
                    <span className="text-body text-dark-900">{totalItems}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-body text-dark-700">Subtotal</span>
                    <span className="text-body text-dark-900">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-body text-dark-700">Estimated Delivery & Handling</span>
                    <span className="text-body text-dark-900">{formatPrice(deliveryFee)}</span>
                  </div>
                  
                  <hr className="border-light-300" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-body-medium text-dark-900 font-medium">Total</span>
                    <span className="text-body-medium text-dark-900 font-medium">{formatPrice(total)}</span>
                  </div>
                </div>
                
                <Link href="/payment" className="block w-full mt-6">
                  <button className="w-full bg-dark-900 text-white py-3 px-6 rounded-full text-body-medium font-medium hover:opacity-90 transition">
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}