import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest rounded-3xl p-10 apple-shadow border border-surface-variant/20 max-w-md w-full text-center animate-slide-up">
        <div className="w-20 h-20 bg-surface-container-high rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary text-4xl">search_off</span>
        </div>
        <h1 className="text-display-lg text-primary mb-2">404</h1>
        <h2 className="text-headline-lg-mobile text-primary mb-3">Página não encontrada</h2>
        <p className="text-body-lg text-secondary mb-8">
          A página que você procura não existe ou foi removida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-sm">home</span>
          Voltar ao Início
        </Link>
      </div>
    </div>
  )
}
