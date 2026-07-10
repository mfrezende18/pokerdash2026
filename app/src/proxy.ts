import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-for-development-only-change-it"
)

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de login
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/invite") ||
    pathname.includes("favicon") ||
    pathname.includes("fonts")
  ) {
    return NextResponse.next()
  }

  // Se não tem token e tentou acessar rota protegida
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = payload.role as string

    // Proteção da rota /admin
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN1" && role !== "ADMIN2" && role !== "ADMIN3") {
        // Redireciona usuários comuns que tentam acessar o painel admin
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Proteção da rota /caixa (Histórico)
    if (pathname.startsWith("/caixa")) {
      if (role !== "ADMIN1" && role !== "ADMIN2" && role !== "ADMIN3") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Token inválido ou expirado
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("session_token")
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
