// app/api/projetos-video/[id]/route.ts
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const projeto = await db.projetoVideo.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Converter JSON fields para objetos
    const projetoFormatado = {
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
    };

    return NextResponse.json(projetoFormatado);
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { titulo, descricao, urlVideo, statusGeral } = await request.json();

    const projeto = await db.projetoVideo.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    const projetoAtualizado = await db.projetoVideo.update({
      where: {
        id: params.id,
      },
      data: {
        titulo,
        descricao,
        urlVideo,
        statusGeral,
      },
    });

    return NextResponse.json({ projeto: projetoAtualizado });
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const projeto = await db.projetoVideo.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    await db.projetoVideo.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Projeto deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
