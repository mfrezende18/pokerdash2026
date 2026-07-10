import { NextResponse } from "next/server"
import { ZodError } from "zod"

export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function zodErrorResponse(error: any) {
  const messages = error.errors?.map((err: any) => err.message) || ["Erro de validação"]
  return NextResponse.json(
    { 
      error: "Erro de validação", 
      details: messages 
    },
    { status: 400 }
  )
}
