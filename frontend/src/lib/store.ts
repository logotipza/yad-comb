import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastStore {
    toasts: ToastMessage[];
    addToast: (toast: Omit<ToastMessage, "id">) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

        // Auto-remove after 4 seconds
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, 4000);
    },
    removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Helper to use outside of React components easily
export const toast = {
    success: (title: string, message?: string) => useToastStore.getState().addToast({ type: "success", title, message }),
    error: (title: string, message?: string) => useToastStore.getState().addToast({ type: "error", title, message }),
    info: (title: string, message?: string) => useToastStore.getState().addToast({ type: "info", title, message }),
};
