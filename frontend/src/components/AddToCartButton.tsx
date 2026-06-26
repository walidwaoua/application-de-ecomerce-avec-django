"use client";

import { useState, useRef } from "react";
import { addToCart } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAddToCart = async () => {
    setError(null);
    setSuccess(false);

    // Get the quantity from the input field in the parent form
    const quantityInput = document.querySelector(
      'input[name="quantity"]'
    ) as HTMLInputElement;
    const quantity = parseInt(quantityInput?.value || "1", 10);

    if (quantity < 1) {
      setError("Quantité invalide");
      return;
    }

    try {
      setLoading(true);
      await addToCart(productId, quantity);
      setSuccess(true);
      // Clear previous timeouts
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      // Reset success message after 3 seconds
      successTimeoutRef.current = setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to add item to cart";
      
      // Check if it's an authentication error (401)
      if (errorMsg.includes("401")) {
        router.push("/login");
        return;
      }
      
      setError(errorMsg);
      // Clear previous timeouts
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      // Reset error message after 5 seconds
      errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-outline-primary"
        disabled={disabled || loading}
        onClick={handleAddToCart}
      >
        <i className="fas fa-cart-plus me-1" />
        {loading ? "Ajout..." : "Ajouter au panier"}
      </button>

      {error && (
        <div className="alert alert-danger mb-0 small d-inline-block ps-2">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success mb-0 small d-inline-block ps-2">
          Ajouté au panier!
        </div>
      )}
    </>
  );
}
