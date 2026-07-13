import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-for-development-only-change-it"
)

export interface UserPayload {
  id: string
  role: string
  name?: string
  avatarUrl?: string | null
  requirePasswordChange?: boolean
}

export async function signToken(payload: UserPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserPayload
  } catch (error) {
    return null
  }
}

export async function getAuthSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  if (!token) return null
  const session = await verifyToken(token)
  if (!session) return null

  // If token says they need to change password, double check DB
  // This prevents multiple devices with old tokens from forcing it again
  if (session.requirePasswordChange) {
    const user = await prisma.user.findUnique({ 
      where: { id: session.id },
      select: { requirePasswordChange: true }
    })
    if (user && !user.requirePasswordChange) {
      session.requirePasswordChange = false
    }
  }

  return session
}
