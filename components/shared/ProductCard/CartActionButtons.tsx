"use client";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { useCartStore } from "@/lib/zustand/cart-store";
interface CartActionButtonsProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    vendeur: string;
    whatsapp: string;
    vendorId?: string;
  };
  currentStock: number;
}
const CartActionButtons: React.FC<CartActionButtonsProps> = ({ product, currentStock }) => {
  const { addItem, updateQty, getQty } = useCartStore();
  const qty = getQty(product.id);
  const handleIncrease = () => {
    if (qty === 0) {
      addItem({ ...product, qty: 1, vendorId: product.vendorId ?? "" });
    } else if (qty < currentStock) {
      updateQty(product.id, 1);
    }
  };
  const handleDecrease = () => {
    if (qty > 0) updateQty(product.id, -1);
  };
  return (
    <div className="flex justify-between items-center gap-x-3.5 mt-3 rounded-full border border-primary py-1.5 px-5 w-fit">
      <button title="Diminuer" aria-label="Diminuer"
        className={`rounded-full ${qty === 0 ? "cursor-not-allowed opacity-50" : ""}`}
        onClick={handleDecrease} disabled={qty === 0}>
        <AiOutlineMinus />
      </button>
      <div className="cart-val min-w-[16px] text-center">{qty}</div>
      <button title="Augmenter" aria-label="Augmenter"
        className={`rounded-full ${qty >= currentStock ? "cursor-not-allowed opacity-50" : ""}`}
        onClick={handleIncrease} disabled={qty >= currentStock}>
        <AiOutlinePlus />
      </button>
    </div>
  );
};
export default CartActionButtons;