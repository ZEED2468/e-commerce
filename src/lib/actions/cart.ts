"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Define cart item type
export interface CartItem {
  variantId: string;
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

// Get cart from cookies
export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('cart');
  
  if (!cartCookie) {
    return [];
  }
  
  try {
    return JSON.parse(cartCookie.value);
  } catch {
    return [];
  }
}

// Save cart to cookies
async function saveCart(cart: CartItem[]) {
  const cookieStore = await cookies();
  cookieStore.set('cart', JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

// Add item to cart with product details
export async function addToCartWithDetails(
  variantId: string,
  quantity: number = 1,
  productDetails: {
    productId: string;
    name: string;
    price: number;
    image: string;
  }
) {
  try {
    const cart = await getCart();
    const existingItemIndex = cart.findIndex(item => item.variantId === variantId);
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push({
        variantId,
        productId: productDetails.productId,
        quantity,
        name: productDetails.name,
        price: productDetails.price,
        image: productDetails.image
      });
    }
    
    await saveCart(cart);
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Add item to cart (will fetch product details)
export async function addToCart(variantId: string, quantity: number = 1) {
  try {
    const productDetails = await getProductByVariantId(variantId);
    
    if (!productDetails) {
      throw new Error('Product not found');
    }
    
    await addToCartWithDetails(variantId, quantity, productDetails);
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Remove item from cart
export async function removeFromCart(variantId: string) {
  const cart = await getCart();
  const filteredCart = cart.filter(item => item.variantId !== variantId);
  await saveCart(filteredCart);
}

// Update item quantity
export async function updateCartItemQuantity(variantId: string, quantity: number) {
  const cart = await getCart();
  const itemIndex = cart.findIndex(item => item.variantId === variantId);
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    await saveCart(cart);
  }
}

// Get cart total count
export async function getCartCount(): Promise<number> {
  const cart = await getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Get cart total price
export async function getCartTotal(): Promise<number> {
  const cart = await getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export async function clearCart() {
  const cookieStore = await cookies();
  cookieStore.delete('cart');
}
async function getProductByVariantId(variantId: string) {

  try {
    return {
      productId: 'placeholder-product-id',
      name: 'Product Name',
      price: 139.99,
      image: '/placeholder-image.jpg'
    };
    
  } catch (error) {
    console.error('Error fetching product by variant ID:', error);
    return null;
  }
}