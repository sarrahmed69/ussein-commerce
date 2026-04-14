"use client";
import dynamic from "next/dynamic";

const ProductsLayout = dynamic(() => import("@/components/common/layouts/products/ProductsLayout"), { ssr: false });

export default function Deals() {
  return <ProductsLayout />;
}