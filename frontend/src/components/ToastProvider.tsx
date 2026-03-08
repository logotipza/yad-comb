"use client";

import { useToastStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function ToastProvider() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className={`toast toast-${toast.type}`}
                        layout
                    >
                        <div className="toast-icon">
                            {toast.type === "success" && <CheckCircle2 size={20} />}
                            {toast.type === "error" && <AlertCircle size={20} />}
                            {toast.type === "info" && <Info size={20} />}
                        </div>

                        <div className="toast-content">
                            <h4 className="toast-title">{toast.title}</h4>
                            {toast.message && <p className="toast-message">{toast.message}</p>}
                        </div>

                        <button onClick={() => removeToast(toast.id)} className="toast-close">
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
