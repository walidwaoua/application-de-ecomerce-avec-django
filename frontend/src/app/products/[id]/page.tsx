import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getProduct, getProducts } from "@/lib/api";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  let product;

  try {
    product = await getProduct(id);
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const relatedProducts = product.category
    ? (await getProducts({ category: product.category }))
        .filter((item) => item.id !== product.id)
        .slice(0, 4)
    : [];

  const imageSrc = product.image ?? "/no-image.svg";
  const hasStock = product.countInStock > 0;

  return (
    <div className="container mt-4 mt-lg-5">
        <nav aria-label="Fil d'ariane" className="mb-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Accueil</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/products">Produits</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="card shadow-lg border-0 rounded-4 detail-card">
          <div className="row g-0 align-items-stretch">
            <div className="col-md-5 text-center bg-light p-4 d-flex align-items-center justify-content-center detail-image-wrap">
              <img
                src={imageSrc}
                alt={product.name}
                className="img-fluid rounded-4 shadow-sm border"
                style={{ maxHeight: "350px", width: "auto", objectFit: "contain" }}
              />
            </div>

            <div className="col-md-7 p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <h2 className="fw-bold mb-0">{product.name}</h2>
                <span className={`badge ${hasStock ? "text-bg-success" : "text-bg-danger"}`}>
                  {hasStock ? "En stock" : "Rupture"}
                </span>
              </div>

              <p className="text-muted mb-3">
                {product.description || "Aucune description pour ce produit."}
              </p>

              <hr />
              <div className="d-flex flex-wrap gap-4 mb-3">
                <div>
                  <span className="fw-semibold d-block">Prix</span>
                  <span className="text-success fs-4 fw-bold">{product.price} DH</span>
                </div>
                <div>
                  <span className="fw-semibold d-block">Disponibilite</span>
                  <span>{product.countInStock} unite(s)</span>
                </div>
                <div>
                  <span className="fw-semibold d-block">Categorie</span>
                  <span>{product.category || "Sans categorie"}</span>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-end gap-3 mt-4">
                <div>
                  <label htmlFor="quantity" className="form-label mb-0">
                    Quantite :
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min={1}
                    max={Math.max(product.countInStock, 1)}
                    defaultValue={1}
                    className="form-control"
                    style={{ width: "100px" }}
                    required
                    disabled={!hasStock}
                  />
                </div>

                <AddToCartButton productId={product.id} disabled={!hasStock} />

                <Link
                  href={`/checkout?productId=${product.id}`}
                  className={`btn btn-success ${!hasStock ? "disabled" : ""}`}
                  aria-disabled={!hasStock}
                >
                  Acheter maintenant
                </Link>
              </div>

              <div className="mt-4">
                <Link href="/" className="btn btn-secondary">
                  ← Retour a la boutique
                </Link>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="mt-5">
            <h4 className="fw-bold mb-3">Produits similaires</h4>
            <div className="row g-4">
              {relatedProducts.map((item) => (
                <div key={item.id} className="col-sm-6 col-md-4 col-lg-3">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
  );
}
