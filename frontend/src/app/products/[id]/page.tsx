import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";

type ProductDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  try {
    const product = await getProduct(params.id);
    const imageSrc = product.image ?? "/no-image.svg";

    return (
      <div className="container mt-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="row g-0">
            <div className="col-md-5 text-center bg-light p-4 d-flex align-items-center justify-content-center">
              <img
                src={imageSrc}
                alt={product.name}
                className="img-fluid rounded-4 shadow-sm border"
                style={{ maxHeight: "350px", width: "auto", objectFit: "contain" }}
              />
            </div>

            <div className="col-md-7 p-4">
              <h2 className="fw-bold mb-3">{product.name}</h2>
              <p className="text-muted">{product.description}</p>
              <hr />
              <div className="mb-3">
                <span className="fw-semibold">Prix :</span>{" "}
                <span className="text-success fs-5">{product.price} DH</span>
              </div>
              <div className="mb-3">
                <span className="fw-semibold">En stock :</span>{" "}
                {product.countInStock}
              </div>

              <form className="d-flex align-items-center gap-3 mt-4">
                <div>
                  <label htmlFor="quantity" className="form-label mb-0">
                    Quantite :
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min={1}
                    defaultValue={1}
                    className="form-control"
                    style={{ width: "100px" }}
                    required
                  />
                </div>

                <button type="button" className="btn btn-outline-primary" disabled>
                  <i className="fas fa-cart-plus me-1" /> Ajouter au panier
                </button>
              </form>

              <div className="mt-4">
                <Link href="/" className="btn btn-secondary">
                  ← Retour a la boutique
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
