import Image from "next/image"

interface ChampionCardProps {
  champion: {
    name: string
    avatarUrl: string | null
    sessionName: string
    netResult: number
  } | null
}

export function ChampionCard({ champion }: ChampionCardProps) {
  if (!champion) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-6 apple-shadow flex flex-col border border-surface-variant/20 h-full">
        <div className="flex justify-between items-center mb-6 card-divider pb-3">
          <h3 className="text-title-md text-primary">Último Campeão</h3>
          <span className="material-symbols-outlined text-amber-500">
            workspace_premium
          </span>
        </div>
        <div className="flex flex-col items-center justify-center flex-grow py-8 text-secondary">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-30">
            emoji_events
          </span>
          <p className="text-body-sm">Nenhuma sessão finalizada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 apple-shadow flex flex-col border border-surface-variant/20 h-full">
      <div className="flex justify-between items-center mb-6 card-divider pb-3">
        <h3 className="text-title-md text-primary">Último Campeão</h3>
        <span className="material-symbols-outlined text-amber-500">
          workspace_premium
        </span>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow py-3">
        {champion.avatarUrl ? (
          champion.avatarUrl.startsWith("http") || champion.avatarUrl.startsWith("/") ? (
            <Image
              src={champion.avatarUrl}
              alt={champion.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full border-4 border-surface-variant/30 mb-3 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-secondary-container border-4 border-surface-variant/30 mb-3 flex items-center justify-center text-4xl shadow-sm">
              {champion.avatarUrl}
            </div>
          )
        ) : (
          <div className="w-24 h-24 rounded-full bg-surface-container-high border-4 border-surface-variant/30 mb-3 flex items-center justify-center">
            <span className="text-2xl font-bold text-secondary">
              {champion.name.charAt(0)}
            </span>
          </div>
        )}

        <h4 className="text-headline-lg-mobile text-primary text-center">
          {champion.name}
        </h4>
        <p className="text-body-sm text-secondary mb-4 text-center">
          Jogador mais lucrativo do último jogo <br/>
          ({champion.sessionName.replace('Sessão Oficial ', '')})
        </p>

        <div className="mt-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
          <p className="text-green-600 font-bold text-lg">
            +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(champion.netResult)}
          </p>
        </div>
      </div>
    </div>
  )
}
