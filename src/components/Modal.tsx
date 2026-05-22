"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // Opcional (se não enviado, age apenas como informativo/alerta)
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  variant?: "danger" | "success" | "warning";
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Confirmar",
  variant = "warning",
}: ModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: "bg-red-50 text-red-600",
      btn: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
    },
    success: {
      bg: "bg-green-50 text-green-600",
      btn: "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white",
    },
    warning: {
      bg: "bg-orange-50 text-orange-600",
      btn: "bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white",
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 font-medium">{description}</p>
          )}
          {children && <div className="text-left w-full">{children}</div>}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all border border-gray-200"
          >
            {onConfirm ? "Cancelar" : "Fechar"}
          </button>

          {onConfirm && (
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${variantStyles[variant].btn}`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
