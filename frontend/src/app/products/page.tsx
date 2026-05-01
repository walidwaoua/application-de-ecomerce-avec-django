import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">Notre selection</h2>
      <div className="row g-4">
        {products.map((product) => (
          <div key={product.id} className="col-sm-6 col-md-4 col-lg-3">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
