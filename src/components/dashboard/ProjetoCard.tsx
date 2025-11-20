// components/ProjetoCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  FileText,
  Image,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Tag,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormEditarProjeto } from "./FormEditarProjeto";

interface ProjetoCardProps {
  projeto: any;
  onEdit: () => void;
}

export function ProjetoCard({ projeto, onEdit }: ProjetoCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const progresso = () => {
    const etapas = [
      projeto.etapaSEO,
      projeto.etapaThumbnail,
      projeto.etapaScript,
      projeto.etapaEdicao,
      projeto.etapaPublicacao,
    ];
    const concluidas = etapas.filter((etapa) => etapa?.concluido).length;
    return Math.round((concluidas / etapas.length) * 100);
  };

  const getEtapaIcon = (etapa: any) => {
    if (etapa?.concluido)
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    if (etapa && Object.keys(etapa).length > 1)
      return <Clock className="h-3 w-3 text-blue-500" />;
    return <XCircle className="h-3 w-3 text-gray-400" />;
  };

  const getEtapaStatus = (etapa: any) => {
    if (etapa?.concluido) return { texto: "Concluído", cor: "text-green-600" };
    if (etapa && Object.keys(etapa).length > 1)
      return { texto: "Em Progresso", cor: "text-blue-600" };
    return { texto: "Não Iniciado", cor: "text-gray-500" };
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-0 bg-transparent">
        {/* Thumbnail Container */}
        <div
          className="relative aspect-video bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => projeto.etapaThumbnail?.url && setShowThumbnail(true)}
        >
          {projeto.etapaThumbnail?.url ? (
            <img
              src={projeto.etapaThumbnail.url}
              alt={`Thumbnail - ${projeto.titulo}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-500">Sem thumbnail</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/80">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
              style={{ width: `${progresso()}%` }}
            ></div>
          </div>

          {/* Hover Overlay - Apenas ícone de zoom quando tem thumbnail */}
          {projeto.etapaThumbnail?.url && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Eye className="h-8 w-8 text-white" />
            </div>
          )}

          {/* Progress Badge */}
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-black/80 text-white text-xs"
            >
              {progresso()}%
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
            {projeto.titulo}
          </h3>

          {/* Description */}
          {projeto.descricao && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {projeto.descricao}
            </p>
          )}

          {/* Etapas Status */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              {/* SEO */}
              <div title="SEO">{getEtapaIcon(projeto.etapaSEO)}</div>
              {/* Thumbnail */}
              <div title="Thumbnail">
                {getEtapaIcon(projeto.etapaThumbnail)}
              </div>
              {/* Script */}
              <div title="Script">{getEtapaIcon(projeto.etapaScript)}</div>
              {/* Edição */}
              <div title="Edição">{getEtapaIcon(projeto.etapaEdicao)}</div>
              {/* Publicação */}
              <div title="Publicação">
                {getEtapaIcon(projeto.etapaPublicacao)}
              </div>
            </div>

            {/* Menu de Ações CORRIGIDO */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Projeto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metadata */}
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
            <span className="capitalize">{projeto.statusGeral}</span>
            <span>
              Atualizado{" "}
              {new Date(projeto.updatedAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{projeto.titulo}</DialogTitle>
            <DialogDescription>Detalhes completos do projeto</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thumbnail */}
              <div className="lg:col-span-1">
                <div
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
                  onClick={() =>
                    projeto.etapaThumbnail?.url && setShowThumbnail(true)
                  }
                >
                  {projeto.etapaThumbnail?.url ? (
                    <img
                      src={projeto.etapaThumbnail.url}
                      alt={`Thumbnail - ${projeto.titulo}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Metadados */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Descrição</h3>
                  <p className="text-muted-foreground">
                    {projeto.descricao || "Nenhuma descrição fornecida."}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">URL do Vídeo</h3>
                  <p className="text-muted-foreground">
                    {projeto.urlVideo || "Nenhuma URL fornecida."}
                  </p>
                </div>

                {/* Status das Etapas */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Progresso das Etapas
                  </h3>
                  <div className="space-y-2">
                    {[
                      { nome: "SEO", etapa: projeto.etapaSEO },
                      { nome: "Thumbnail", etapa: projeto.etapaThumbnail },
                      { nome: "Script", etapa: projeto.etapaScript },
                      { nome: "Edição", etapa: projeto.etapaEdicao },
                      { nome: "Publicação", etapa: projeto.etapaPublicacao },
                    ].map(({ nome, etapa }) => (
                      <div
                        key={nome}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{nome}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs ${getEtapaStatus(etapa).cor}`}
                          >
                            {getEtapaStatus(etapa).texto}
                          </span>
                          {getEtapaIcon(etapa)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags SEO */}
            {projeto.etapaSEO?.tags && projeto.etapaSEO.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags SEO
                </h3>
                <div className="flex flex-wrap gap-2">
                  {projeto.etapaSEO.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Script */}
            {projeto.etapaScript?.conteudo && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Script
                </h3>
                <div className="bg-muted rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                    {projeto.etapaScript.conteudo}
                  </pre>
                </div>
              </div>
            )}

            {/* Informações de Publicação */}
            {projeto.etapaPublicacao?.urlPublicada && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Publicação</h3>
                <div className="space-y-2">
                  <p>
                    <strong>URL Publicada:</strong>{" "}
                    <a
                      href={projeto.etapaPublicacao.urlPublicada}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {projeto.etapaPublicacao.urlPublicada}
                    </a>
                  </p>
                  {projeto.etapaPublicacao.dataPublicacao && (
                    <p>
                      <strong>Data de Publicação:</strong>{" "}
                      {new Date(
                        projeto.etapaPublicacao.dataPublicacao
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Observações de Edição */}
            {projeto.etapaEdicao?.observacoes && (
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Observações de Edição
                </h3>
                <p className="text-muted-foreground">
                  {projeto.etapaEdicao.observacoes}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Fechar
            </Button>
            <Button
              onClick={onEdit}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Projeto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>

          <FormEditarProjeto
            projeto={projeto}
            onSuccess={() => {
              setShowEditModal(false);
              onEdit();
            }}
            onClose={() => setShowEditModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal da Thumbnail em Tela Cheia */}
      <Dialog open={showThumbnail} onOpenChange={setShowThumbnail}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/90 border-0">
          <div className="relative">
            <img
              src={projeto.etapaThumbnail?.url}
              alt={`Thumbnail - ${projeto.titulo}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
