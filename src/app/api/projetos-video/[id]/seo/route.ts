// app/api/projetos-video/[id]/seo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import db from "@/lib/db";

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { titulo, descricao, tags, concluido } = await request.json();

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

    // Atualizar etapa SEO
    const etapaSEO = {
      titulo: titulo || "",
      descricao: descricao || "",
      tags: tags || [],
      concluido: concluido || false,
    };

    const projetoAtualizado = await db.projetoVideo.update({
      where: {
        id: params.id,
      },
      data: {
        etapaSEO: JSON.stringify(etapaSEO),
        // Atualizar status geral se necessário
        statusGeral: calcularStatusGeral(projeto, { etapaSEO }),
      },
    });

    return NextResponse.json({ projeto: projetoAtualizado });
  } catch (error) {
    console.error("Erro ao atualizar SEO:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função auxiliar para calcular status geral
function calcularStatusGeral(projeto: any, etapasAtualizadas: any) {
  const etapas = {
    seo: etapasAtualizadas.etapaSEO || JSON.parse(projeto.etapaSEO as string),
    thumbnail: JSON.parse(projeto.etapaThumbnail as string),
    script: JSON.parse(projeto.etapaScript as string),
    edicao: JSON.parse(projeto.etapaEdicao as string),
    publicacao: JSON.parse(projeto.etapaPublicacao as string),
  };

  const etapasConcluidas = Object.values(etapas).filter(
    (etapa: any) => etapa.concluido
  ).length;
  const totalEtapas = Object.keys(etapas).length;

  if (etapasConcluidas === totalEtapas) return "concluido";
  if (etapasConcluidas > 0) return "em_andamento";
  return "rascunho";
}
