import Link from "next/link";
import { products } from "../../../../data/product";
import CartContent from "@/components/CartContent";

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return undefined;
  return `${price.toFixed(2)}`;
}

function NotFoundBlock() {
  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-light-300 bg-light-100 p-8 text-center">
      <h1 className="text-heading-3 text-dark-900">Product not found</h1>
      <p className="mt-2 text-body text-dark-700">The product you're looking for doesn't exist or may have been removed.</p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-dark-900 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
        >
          Back to Products
        </Link>
      </div>
    </section>
  );
}

export default async function CartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Find the selected product from your data
  const selectedProduct = products.find(p => p.id === Number(id));
  if (!selectedProduct) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <nav className="py-4 text-caption text-dark-700">
          <Link href="/" className="hover:underline">Home</Link> /{" "}
          <span className="text-dark-900">Cart</span>
        </nav>
        <NotFoundBlock />
      </main>
    );
  }

  return <CartContent selectedProduct={selectedProduct} />;
}