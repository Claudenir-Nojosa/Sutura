// app/api/transcricoes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import db from "@/lib/db";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const transcricao = await db.transcricao.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!transcricao) {
      return NextResponse.json(
        { error: "Transcrição não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(transcricao);
  } catch (error) {
    console.error("Erro ao buscar transcrição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
