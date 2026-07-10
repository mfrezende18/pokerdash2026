"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest rounded-3xl p-10 apple-shadow border border-surface-variant/20 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-error-container rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <span className="material-symbols-outlined text-error text-3xl">error</span>
        </div>
        <h2 className="text-headline-lg-mobile text-primary mb-2">Algo deu errado</h2>
        <p className="text-body-lg text-secondary mb-6">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o administrador.
        </p>
        {error.digest && (
          <p className="text-mono-data text-secondary/50 mb-4">
            Código: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  )
}
