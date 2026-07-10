# PokerAdmin (PokerDash 2026) - Regras Arquiteturais e Contexto de Agentes

Este documento tem como objetivo guiar agentes de IA e desenvolvedores sobre as regras de negócio cruciais deste projeto. Siga estritamente essas regras para evitar bugs em áreas sensíveis e já consolidadas do sistema.

## 1. Motor de Matemática (Dashboard & Rankings)
**Regra de Ouro:** O cálculo de Estatísticas Gerais de jogadores (`Investimento Total`, `Lucro Total`, `Sessões Totais`, e `ROI`) **NÃO** deve incluir mesas que ainda estão em andamento (`status: "ACTIVE"`).
- **Por quê?** Se uma mesa está ativa, o jogador já realizou o `BuyIn`, mas ainda não possui um `CashOut`. Somar isso resultaria num falso prejuízo imediato de 100% sobre o investimento.
- **Implementação Correta:** Nas queries do Prisma, filtre os `buyIns` e `cashOuts` com a condição `where: { session: { status: "CLOSED" } }`, ou filtre-os por status diretamente em memória no lado do servidor (como feito no `src/app/dashboard/page.tsx` e `src/app/rankings/page.tsx`).
- O Histórico de Sessões *pode* listar a sessão ativa (como "Em jogo"), mas seus valores não sobem para as métricas agregadas do jogador.

## 2. Invalidação de Cache no Next.js (App Router)
O projeto utiliza extensivamente a função `unstable_cache` para rankeamentos gerais e o componente Home. As tags principais são `['sessions']`, `['players']`, etc.
- Toda vez que uma sessão é **Criada**, **Fechada (Cashout)**, ou **Apagada**, é **OBRIGATÓRIO** rodar:
  ```typescript
  import { revalidateTag, revalidatePath } from "next/cache"
  revalidateTag("sessions")
  revalidatePath("/")
  ```
- O não cumprimento dessa regra fará com que o "Último Campeão" e o placar principal na Home não sejam atualizados em tempo real, gerando suporte dos usuários.

## 3. Regras de Layout e Tailwind CSS v4
Evite regras de largura responsiva que falham no Tailwind v4.
- **Não usar:** `max-w-md` ou similiares em modais centrais no Desktop, pois o Vercel pode renderizá-los com largura zerada ("espremer" o conteúdo verticalmente).
- **Solução:** Use valores fixos arbitrários para garantir proteção de UI, como `max-w-[400px]` em telas de Erro, Formulários Flutuantes (ex: `ForcePasswordChangeModal.tsx`).

## 4. Renderização de Avatares (Emoji vs Image URL)
O sistema aceita Emojis como foto de perfil. O campo `avatarUrl` pode conter um URL completo ou simplesmente "🤑".
- **Sempre valide:** Antes de usar a tag `<Image />` do Next.js ou `<img />`, faça uma verificação explícita `avatarUrl.startsWith("http") || avatarUrl.startsWith("/")`.
- Se for falso, renderize o avatarUrl dentro de uma `<div>` normal, pois ele é um Emoji ou texto. Inserir emojis no atributo `src` de imagens irá causar crash na renderização.

## 5. Role-Based Access Control (RBAC) Hierárquico
A segurança está baseada no `src/proxy.ts` (middleware) e na checagem explícita dos componentes.
- **ADMIN1 (MF):** Acesso completo, único capaz de deletar dados históricos sensíveis (ex: Apagar mesas passadas).
- **ADMIN2:** Consegue gerenciar as permissões dos demais usuários, acesso ao dashboard de controle.
- **ADMIN3:** Consegue gerenciar as finanças da mesa (Abrir Mesa, Buy-In, Re-Buy, Fechar Sessão).
- **USER:** Apenas leitura de suas próprias abas (Mesa atual, Meus Stats, Rankings).
- No Navbar (`BottomNavBar.tsx`), as abas confidenciais (ex: `/caixa` e `/admin`) devem ficar escondidas visualmente se a role não for suficiente.

---

*Estas diretrizes são blindagens. Ao atuar neste projeto, trate-as como verdades absolutas.*
