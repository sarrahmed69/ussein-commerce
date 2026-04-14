"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
export default function ProduitFormRedirect() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (id === "nouveau") router.replace("/vendor/produits/nouveau");
    else router.replace("/vendor/produits/" + id + "/modifier");
  }, [id]);
  return null;
}