import React from "react";
import { Card } from "@/components";
import { products } from "../../data/product";

const Home = async () => {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 sm:mb-10  lg:mb-8
     lg:mt-8 ">
      <section aria-labelledby="latest" className="pb-12 sm:mt-8">
        <h2 id="latest" className="my-4 text-heading-3 text-white">
          Available Products
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card
              key={p.id}
              title={p.title}
              subtitle={p.subtitle}
              imageSrc={p.imageSrc}
              price={p.price}
              href={`/carts/${p.id}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;