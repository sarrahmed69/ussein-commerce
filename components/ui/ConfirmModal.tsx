"use client";
import { TbAlertTriangle } from "react-icons/tb";

interface Props {
  message: string;
  subMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ message, subMessage, confirmLabel = "Confirmer", cancelLabel = "Annuler", danger = false, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <div className={"w-14 h-14 rounded-2xl flex items-center justify-center " + (danger ? "bg-red-100" : "bg-yellow-100")}>
            <TbAlertTriangle className={danger ? "text-red-500" : "text-yellow-500"} size={28} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base">{message}</p>
            {subMessage && <p className="text-sm text-gray-500 mt-1">{subMessage}</p>}
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="flex-1 border border-gray-200 py-3 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={"flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-colors " + (danger ? "bg-red-500 hover:bg-red-600" : "bg-[#4a7c2f] hover:bg-[#1e2570]")}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}