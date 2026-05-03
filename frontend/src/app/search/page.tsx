import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = resolvedSearchParams.q?.trim() ?? "";
  const products = query ? await getProducts({ query }) : [];

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">
        Resultats pour "{query || "tout"}"
      </h2>

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
          Aucun produit ne correspond a votre recherche.
        </div>
      )}
    </div>
  );
}
