import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const products = await getProducts({ category: decodedCategory });

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">{decodedCategory}</h2>
      {products.length > 0 ? (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product.id} className="col-sm-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center">
          Aucun produit trouve pour cette categorie.
        </div>
      )}
    </div>
  );
}
