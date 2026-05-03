import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">
        Bienvenue dans notre boutique
      </h2>

      {products.length > 0 ? (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product.id} className="col-sm-6 col-md-4 col-lg-3">
              <ProductCard product={product} showActions />
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center">
          Aucun produit disponible pour le moment.
        </div>
      )}
    </div>
  );
}
