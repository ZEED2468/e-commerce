"use server";

import { products as dummyProducts } from "../../data/product";
import { NormalizedProductFilters } from "@/lib/utils/query";

// Transform dummy data to match your expected types
const transformDummyProduct = (product: { id: number; title: string; subtitle: string; price: number; imageSrc: string }) => ({
  id: String(product.id),
  name: product.title,
  imageUrl: product.imageSrc,
  minPrice: product.price,
  maxPrice: product.price,
  createdAt: new Date(),
  subtitle: product.subtitle,
});

type ProductListItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  createdAt: Date;
  subtitle?: string | null;
};

export type GetAllProductsResult = {
  products: ProductListItem[];
  totalCount: number;
};

export async function getAllProducts(filters: NormalizedProductFilters): Promise<GetAllProductsResult> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let filteredProducts = dummyProducts.map(transformDummyProduct);

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.subtitle && product.subtitle.toLowerCase().includes(searchTerm))
    );
  }

  // Apply price filters
  if (filters.priceMin !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      product.minPrice !== null && product.minPrice >= filters.priceMin!
    );
  }
  
  if (filters.priceMax !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      product.maxPrice !== null && product.maxPrice <= filters.priceMax!
    );
  }

  // Apply sorting
  if (filters.sort === "price_asc") {
    filteredProducts.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
  } else if (filters.sort === "price_desc") {
    filteredProducts.sort((a, b) => (b.maxPrice || 0) - (a.maxPrice || 0));
  } else if (filters.sort === "newest") {
    filteredProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Apply pagination
  const totalCount = filteredProducts.length;
  const startIndex = (filters.page - 1) * filters.limit;
  const endIndex = startIndex + filters.limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    totalCount,
  };
}

// Types for single product view
export type FullProduct = {
  product: {
    id: string;
    name: string;
    description: string;
    brandId: string | null;
    categoryId: string | null;
    genderId: string | null;
    isPublished: boolean;
    defaultVariantId: string | null;
    createdAt: Date;
    updatedAt: Date;
    brand?: { id: string; name: string; slug: string; logoUrl: string | null } | null;
    category?: { id: string; name: string; slug: string; parentId: string | null } | null;
    gender?: { id: string; label: string; slug: string } | null;
  };
  variants: Array<{
    id: string;
    productId: string;
    sku: string;
    price: string;
    salePrice: string | null;
    colorId: string;
    sizeId: string;
    inStock: boolean;
    weight: string | null;
    dimensions: string | null;
    createdAt: Date;
    color?: { id: string; name: string; slug: string; hexCode: string } | null;
    size?: { id: string; name: string; slug: string; sortOrder: number } | null;
  }>;
  images: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    url: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
};

export async function getProduct(productId: string): Promise<FullProduct | null> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const dummyProduct = dummyProducts.find(p => String(p.id) === productId);
  
  if (!dummyProduct) {
    return null;
  }

  // Create mock variants and images
  const mockVariant = {
    id: `variant-${productId}-1`,
    productId: productId,
    sku: `SKU-${productId}`,
    price: String(dummyProduct.price),
    salePrice: null,
    colorId: "color-1",
    sizeId: "size-1",
    inStock: true,
    weight: null,
    dimensions: null,
    createdAt: new Date(),
    color: {
      id: "color-1",
      name: "Black",
      slug: "black",
      hexCode: "#000000",
    },
    size: {
      id: "size-1",
      name: "M",
      slug: "m",
      sortOrder: 1,
    },
  };

  const mockImage = {
    id: `image-${productId}-1`,
    productId: productId,
    variantId: null,
    url: dummyProduct.imageSrc,
    sortOrder: 0,
    isPrimary: true,
  };

  return {
    product: {
      id: productId,
      name: dummyProduct.title,
      description: `This is a detailed description for ${dummyProduct.title}. ${dummyProduct.subtitle}`,
      brandId: "brand-1",
      categoryId: "category-1", 
      genderId: "gender-1",
      isPublished: true,
      defaultVariantId: mockVariant.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      brand: {
        id: "brand-1",
        name: "Premium Brand",
        slug: "premium-brand",
        logoUrl: null,
      },
      category: {
        id: "category-1",
        name: "Footwear",
        slug: "footwear",
        parentId: null,
      },
      gender: {
        id: "gender-1",
        label: "Unisex",
        slug: "unisex",
      },
    },
    variants: [mockVariant],
    images: [mockImage],
  };
}

export type Review = {
  id: string;
  author: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
};

export type RecommendedProduct = {
  id: string;
  title: string;
  price: number | null;
  imageUrl: string;
};

export async function getProductReviews(_productId: string): Promise<Review[]> {
  // Return empty reviews array
  return [];
}

export async function getRecommendedProducts(_productId: string): Promise<RecommendedProduct[]> {
  // Return empty recommendations array
  return [];
}