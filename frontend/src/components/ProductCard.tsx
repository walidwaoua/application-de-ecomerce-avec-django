import Link from "next/link";
import { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  showActions?: boolean;
};

export function ProductCard({ product, showActions = false }: ProductCardProps) {
  const imageSrc = product.image ?? "/no-image.svg";

  return (
    <div className="card h-100 shadow-sm border-0 rounded-4">
      <img
        src={imageSrc}
        className="card-img-top rounded-top-4"
        style={{ height: "200px", objectFit: "cover" }}
        alt={product.name}
      />

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        {product.category ? (
          <p className="card-text text-muted">{product.category}</p>
        ) : null}
        <p className="fw-bold text-success">{product.price} DH</p>

        {showActions ? (
          <div className="mt-auto d-flex flex-column gap-2">
            <Link
              href={`/products/${product.id}`}
              className="btn btn-outline-secondary btn-sm"
            >
              Voir les details
            </Link>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              disabled
            >
              🛒 Ajouter au panier
            </button>

            <Link
              href={`/checkout?productId=${product.id}`}
              className="btn btn-success btn-sm"
            >
              Acheter
            </Link>
          </div>
        ) : (
          <Link
            href={`/products/${product.id}`}
            className="btn btn-outline-primary mt-auto"
          >
            Voir details
          </Link>
        )}
      </div>
    </div>
  );
}
