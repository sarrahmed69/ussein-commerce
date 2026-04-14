"use client";
import { BsStar, BsStarFill } from "react-icons/bs";
import { motion } from "framer-motion";
import ProductLike from "./ProductLike";
import Image from "next/image";
import dummyProduct from "@/public/images/63ec6053e5b15cfafd550cbb_Rectangle 1436-3.png";

interface ProductCardProps {
  thumbnail?: boolean;
  animate?: boolean;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    shortDescription: string;
  };
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

const ProductCard = ({ thumbnail, product, animate }: ProductCardProps) => {
  return (
    <motion.div
      className="w-full max-w-full sm:max-w-[410px] sm:mr-6 hover:-translate-y-3 cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: animate ? 1 : 0.8, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      <div className="rounded-lg h-[320px] flex justify-center items-center relative overflow-hidden bg-gray-50">
        <Image src={dummyProduct} alt={product?.name || "Product Image"} loading="lazy" quality={100} className="hover:scale-[1.15]" />
        <ProductLike productId={product?.id.toString()} />
      </div>
      {!thumbnail && (
        <div className="px-2">
          <div className="flex justify-between items-center text-gray-700 text-lg font-semibold mt-3">
            <span className="truncate">{product?.name}</span>
            <span className="whitespace-nowrap text-primary text-base">{formatPrice(product?.price)}</span>
          </div>
          <p className="truncate text-sm text-gray-500 font-medium mt-1">{product?.shortDescription}</p>
          <div className="flex justify-start items-center gap-x-2 mt-2">
            <BsStarFill className="size-4 text-orange-400" />
            <BsStar className="size-4 text-gray-600" />
          </div>
        </div>
      )}
    </motion.div>
  );
};
export default ProductCard;