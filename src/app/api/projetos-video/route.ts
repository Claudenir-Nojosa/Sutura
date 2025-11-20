// app/api/projetos-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import db from "@/lib/db";


export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const projetos = await db.projetoVideo.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Converter JSON fields para objetos
    const projetosFormatados = projetos.map((projeto) => ({
      ...projeto,
      etapaSEO: projeto.etapaSEO
        ? JSON.parse(projeto.etapaSEO as string)
        : { tags: [], concluido: false },
      etapaThumbnail: projeto.etapaThumbnail
        ? JSON.parse(projeto.etapaThumbnail as string)
        : { concluido: false },
      etapaScript: projeto.etapaScript
        ? JSON.parse(projeto.etapaScript as string)
        : { concluido: false },
      etapaEdicao: projeto.etapaEdicao
        ? JSON.parse(projeto.etapaEdicao as string)
        : { concluido: false },
      etapaPublicacao: projeto.etapaPublicacao
        ? JSON.parse(projeto.etapaPublicacao as string)
        : { concluido: false },
    }));

    return NextResponse.json({ projetos: projetosFormatados });
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
     const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { titulo, descricao, urlVideo } = await request.json();

    if (!titulo) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    const projeto = await db.projetoVideo.create({
      data: {
        userId: session.user.id,
        titulo,
        descricao,
        urlVideo,
        statusGeral: "rascunho",
        // Inicializar etapas como JSON vazio
        etapaSEO: JSON.stringify({ tags: [], concluido: false }),
        etapaThumbnail: JSON.stringify({ concluido: false }),
        etapaScript: JSON.stringify({ concluido: false }),
        etapaEdicao: JSON.stringify({ concluido: false }),
        etapaPublicacao: JSON.stringify({ concluido: false }),
      },
    });

    return NextResponse.json({ projeto });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
