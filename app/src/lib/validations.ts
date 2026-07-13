import { z } from "zod"

export const buyInSchema = z.object({
  playerId: z.string({ message: "ID do jogador é obrigatório" }),
  amount: z.number({ message: "Valor do buy-in é obrigatório (deve ser um número)" })
    .positive("O valor do buy-in deve ser maior que zero"),
  type: z.enum(["DINHEIRO", "PIX", "FIADO"], { 
    message: "O tipo de pagamento é obrigatório e deve ser válido"
  }),
})

export const cashOutSchema = z.object({
  playerId: z.string({ message: "ID do jogador é obrigatório" }),
  chipValue: z.number({ message: "Valor final de fichas é obrigatório (deve ser um número)" })
    .min(0, "O valor de cashout não pode ser negativo"),
})

export const newSessionSchema = z.object({
  name: z.string({ message: "Nome da mesa é obrigatório" })
    .min(3, "Nome da mesa deve ter no mínimo 3 caracteres"),
  blinds: z.string().optional(),
  rakeType: z.enum(["FIXED", "PERCENT", "NONE"], { 
    message: "Tipo de rake é obrigatório" 
  }),
  rakePercent: z.number().min(0).max(100).optional().default(0),
  rakeFixed: z.number().min(0).optional().default(0),
  createdById: z.string({ message: "ID do criador é obrigatório" }),
})

export const profileSchema = z.object({
  phone: z.string().optional().refine(val => !val || /^\d{10,11}$/.test(val.replace(/\D/g, "")), {
    message: "Telefone inválido. Informe o DDD e o número"
  }),
  pixKey: z.string().max(100, "Chave Pix muito longa").optional(),
  avatarUrl: z.string().optional(),
})

export const playerSchema = z.object({
  name: z.string({ message: "Nome do jogador é obrigatório" })
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .trim(),
})
