// app/api/transcricoes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [transcricoes, total] = await Promise.all([
      db.transcricao.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          videoId: true,
          titulo: true,
          canal: true,
          duracao: true,
          thumbnail: true,
          views: true,
          createdAt: true,
          transcricao: false, // Não retornar o texto completo na listagem
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.transcricao.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      transcricoes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar transcrições:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
