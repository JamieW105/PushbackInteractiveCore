
"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
                style: {
                    background: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    backdropFilter: "blur(10px)"
                },
                className: "p-4 rounded-xl border border-white/10 shadow-xl"
            }}
        />
    )
}
