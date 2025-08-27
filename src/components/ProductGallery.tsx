import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getProduct } from "@/lib/actions/product";
import Image from "next/image";

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return undefined;
  return `$${price.toFixed(2)}`;
}

function NotFoundBlock() {
  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-light-300 bg-light-100 p-8 text-center">
      <h1 className="text-heading-3 text-dark-900">Product not found</h1>
      <p className="mt-2 text-body text-dark-700">The product you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
      <div className="mt-6">
        <Link
          href="/products"
          className="inline-block rounded-full bg-black text-white border border-white px-6 py-3 text-body-medium transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
        >
          Browse Products
        </Link>
      </div>
    </section>
  );
}

async function AlsoLikeSection({ productId }: { productId: string }) {
  return null; // Removed recommendations
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProduct(id);

  if (!data) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <nav className="py-4 text-caption text-dark-700">
          <Link href="/" className="hover:underline">Home</Link> / <Link href="/products" className="hover:underline">Products</Link> /{" "}
          <span className="text-dark-900">Not found</span>
        </nav>
        <NotFoundBlock />
      </main>
    );
  }

  const { product, variants, images } = data;

  // Get the default variant for pricing
  const defaultVariant = variants.find((v) => v.id === product.defaultVariantId) || variants[0];
  
  // Get the main product image from images array
  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const mainImage = primaryImage?.url || "/books/books-1.jpg"; // fallback image

  const displayPrice = defaultVariant?.price ? Number(defaultVariant.price) : null;
  const salePrice = defaultVariant?.salePrice ? Number(defaultVariant.salePrice) : null;
  const compareAt = salePrice ? displayPrice : null;

  const discount =
    compareAt && salePrice && compareAt > salePrice
      ? Math.round(((compareAt - salePrice) / compareAt) * 100)
      : null;

  const subtitle =
    product.gender?.label ? `${product.gender.label} books` : undefined;

  return (
<main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 bg-black">
      <nav className="py-4 text-caption text-white">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/products" className="hover:underline">Products</Link> /{" "}
        <span className="text-white">{product.name}</span>
      </nav>

<section className="grid grid-cols-1 gap-10 mb-16 sm:mb-20 lg:grid-cols-2 lg:mb-16 bg-black">
        {/* Simple Product Image */}
<div className="flex justify-center">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-xl bg-dark-700">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 mb-8">
<header className="flex flex-col gap-2">
            <h1 className="text-heading-2 text-white">{product.name}</h1>
            {subtitle && <p className="text-body text-white">{subtitle}</p>}
          </header>

<div className="flex items-center gap-3">
            <p className="text-lead text-white">{formatPrice(salePrice || displayPrice)}</p>
            {compareAt && salePrice && (
              <>
                <span className="text-body text-white line-through">{formatPrice(compareAt)}</span>
                {discount !== null && (
                  <span className="rounded-full border border-white px-2 py-1 text-caption text-[--color-green]">
                    {discount}% off
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-12 sm:mb-16">
            <button className="flex items-center justify-center gap-2 rounded-full bg-black text-white border border-white px-6 py-4 text-body-medium transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]">
              <ShoppingBag className="h-5 w-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}