import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[28px] w-full max-w-lg p-6 md:p-7 shadow-xl border border-line relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
          <h3 className="text-lg font-bold tracking-tight text-ink">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-shell hover:bg-[#E8E7E4] text-ink flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}