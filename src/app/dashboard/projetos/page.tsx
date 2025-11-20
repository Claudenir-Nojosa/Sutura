// app/dashboard/projetos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  FileText,
  Image,
  Search,
  Filter,
  Play,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { FormEditarProjeto } from "@/components/dashboard/FormEditarProjeto";
import { FormPublicacao } from "@/components/dashboard/FormPublicacao";
import { FormEdicao } from "@/components/dashboard/FormEdicao";
import { FormScript } from "@/components/dashboard/FormScript";
import { FormThumbnail } from "@/components/dashboard/FormThumbnail";
import { FormSEO } from "@/components/dashboard/FormSEO";
import { FormNovoProjeto } from "@/components/dashboard/FormNovoProjeto";
import { ProjetoCard } from "@/components/dashboard/ProjetoCard";

interface ProjetoVideo {
  id: string;
  titulo: string;
  descricao?: string;
  urlVideo?: string;
  statusGeral: "rascunho" | "em_andamento" | "concluido";
  etapaSEO: {
    titulo?: string;
    descricao?: string;
    tags: string[];
    concluido: boolean;
  };
  etapaThumbnail: {
    url?: string;
    arquivo?: string;
    concluido: boolean;
  };
  etapaScript: {
    conteudo?: string;
    concluido: boolean;
  };
  etapaEdicao: {
    concluido: boolean;
    observacoes?: string;
  };
  etapaPublicacao: {
    concluido: boolean;
    urlPublicada?: string;
    dataPublicacao?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<ProjetoVideo[]>([]);
  const [etapaAtiva, setEtapaAtiva] = useState<string>("geral");
  const [projetoEditando, setProjetoEditando] = useState<ProjetoVideo | null>(
    null
  );
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  // Carregar projetos
  const carregarProjetos = async () => {
    setCarregando(true);
    try {
      const response = await fetch("/api/projetos-video");
      if (response.ok) {
        const data = await response.json();
        setProjetos(data.projetos);
      }
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  // Filtrar projetos
  const projetosFiltrados = projetos.filter((projeto) => {
    const buscaMatch =
      projeto.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      projeto.descricao?.toLowerCase().includes(busca.toLowerCase());

    const statusMatch =
      filtroStatus === "todos" || projeto.statusGeral === filtroStatus;

    return buscaMatch && statusMatch;
  });

  // Estatísticas gerais
  const estatisticas = {
    total: projetos.length,
    rascunho: projetos.filter((p) => p.statusGeral === "rascunho").length,
    em_andamento: projetos.filter((p) => p.statusGeral === "em_andamento")
      .length,
    concluido: projetos.filter((p) => p.statusGeral === "concluido").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-500";
      case "em_andamento":
        return "bg-blue-500";
      case "rascunho":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "concluido":
        return "Concluído";
      case "em_andamento":
        return "Em Andamento";
      case "rascunho":
        return "Rascunho";
      default:
        return status;
    }
  };

  const getEtapaStatus = (etapa: any) => {
    if (etapa?.concluido)
      return {
        texto: "Concluído",
        cor: "text-green-600",
        icone: <CheckCircle className="h-4 w-4" />,
      };
    if (etapa && Object.keys(etapa).length > 1)
      return {
        texto: "Em Progresso",
        cor: "text-blue-600",
        icone: <Clock className="h-4 w-4" />,
      };
    return {
      texto: "Não Iniciado",
      cor: "text-gray-500",
      icone: <XCircle className="h-4 w-4" />,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Meus Projetos de Vídeo
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as etapas da produção dos seus vídeos
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
              <DialogDescription>
                Adicione um novo projeto de vídeo para gerenciar todas as etapas
                de produção.
              </DialogDescription>
            </DialogHeader>
            <FormNovoProjeto onSuccess={carregarProjetos} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
              </div>
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rascunho
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {estatisticas.rascunho}
                </p>
              </div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Em Andamento
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {estatisticas.em_andamento}
                </p>
              </div>
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Concluídos
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {estatisticas.concluido}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar projetos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Etapas */}
      <Tabs
        value={etapaAtiva}
        onValueChange={setEtapaAtiva}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="thumbnail">Thumbnail</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="edicao">Edição</TabsTrigger>
          <TabsTrigger value="publicacao">Publicação</TabsTrigger>
        </TabsList>

        {/* Conteúdo das Abas */}
        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Projetos</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os seus projetos de vídeo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projetosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Nenhum projeto encontrado
                  </p>
                  <p className="text-sm">
                    Crie seu primeiro projeto para começar
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projetosFiltrados.map((projeto) => (
                    <ProjetoCard
                      key={projeto.id}
                      projeto={projeto}
                      onEdit={() => setProjetoEditando(projeto)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de SEO</CardTitle>
              <CardDescription>
                Otimize título, descrição e tags para todos os vídeos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vídeo</TableHead>
                    <TableHead>Título SEO</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetosFiltrados.map((projeto) => (
                    <TableRow key={projeto.id}>
                      <TableCell className="font-medium">
                        {projeto.titulo}
                      </TableCell>
                      <TableCell>{projeto.etapaSEO?.titulo || "-"}</TableCell>
                      <TableCell>
                        {projeto.etapaSEO?.tags?.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="mr-1 mb-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {projeto.etapaSEO?.tags?.length > 3 && "..."}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getEtapaStatus(projeto.etapaSEO).icone}
                          <span
                            className={getEtapaStatus(projeto.etapaSEO).cor}
                          >
                            {getEtapaStatus(projeto.etapaSEO).texto}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Configurar SEO - {projeto.titulo}
                              </DialogTitle>
                            </DialogHeader>
                            <FormSEO
                              projeto={projeto}
                              onSuccess={carregarProjetos}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Thumbnail */}
        <TabsContent value="thumbnail">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Thumbnails</CardTitle>
              <CardDescription>
                Gerencie as thumbnails de todos os seus vídeos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vídeo</TableHead>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetosFiltrados.map((projeto) => (
                    <TableRow key={projeto.id}>
                      <TableCell className="font-medium">
                        {projeto.titulo}
                      </TableCell>
                      <TableCell>
                        {projeto.etapaThumbnail?.url ? (
                          <img
                            src={projeto.etapaThumbnail.url}
                            alt="Thumbnail"
                            className="w-16 h-9 object-cover rounded"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getEtapaStatus(projeto.etapaThumbnail).icone}
                          <span
                            className={
                              getEtapaStatus(projeto.etapaThumbnail).cor
                            }
                          >
                            {getEtapaStatus(projeto.etapaThumbnail).texto}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Image className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Configurar Thumbnail - {projeto.titulo}
                              </DialogTitle>
                            </DialogHeader>
                            <FormThumbnail
                              projeto={projeto}
                              onSuccess={carregarProjetos}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Script */}
        <TabsContent value="script">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Scripts</CardTitle>
              <CardDescription>
                Escreva e edite os scripts dos seus vídeos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vídeo</TableHead>
                    <TableHead>Prévia do Script</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetosFiltrados.map((projeto) => (
                    <TableRow key={projeto.id}>
                      <TableCell className="font-medium">
                        {projeto.titulo}
                      </TableCell>
                      <TableCell>
                        {projeto.etapaScript?.conteudo ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {projeto.etapaScript.conteudo.substring(0, 100)}...
                          </p>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getEtapaStatus(projeto.etapaScript).icone}
                          <span
                            className={getEtapaStatus(projeto.etapaScript).cor}
                          >
                            {getEtapaStatus(projeto.etapaScript).texto}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>
                                Editor de Script - {projeto.titulo}
                              </DialogTitle>
                            </DialogHeader>
                            <FormScript
                              projeto={projeto}
                              onSuccess={carregarProjetos}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Abas de Edição e Publicação (similares) */}
        <TabsContent value="edicao">
          <Card>
            <CardHeader>
              <CardTitle>Status de Edição</CardTitle>
              <CardDescription>
                Acompanhe o progresso da edição dos vídeos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vídeo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetosFiltrados.map((projeto) => (
                    <TableRow key={projeto.id}>
                      <TableCell className="font-medium">
                        {projeto.titulo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getEtapaStatus(projeto.etapaEdicao).icone}
                          <span
                            className={getEtapaStatus(projeto.etapaEdicao).cor}
                          >
                            {getEtapaStatus(projeto.etapaEdicao).texto}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {projeto.etapaEdicao?.observacoes || "-"}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Status de Edição - {projeto.titulo}
                              </DialogTitle>
                            </DialogHeader>
                            <FormEdicao
                              projeto={projeto}
                              onSuccess={carregarProjetos}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publicacao">
          <Card>
            <CardHeader>
              <CardTitle>Status de Publicação</CardTitle>
              <CardDescription>
                Controle a publicação dos seus vídeos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vídeo</TableHead>
                    <TableHead>URL Publicada</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetosFiltrados.map((projeto) => (
                    <TableRow key={projeto.id}>
                      <TableCell className="font-medium">
                        {projeto.titulo}
                      </TableCell>
                      <TableCell>
                        {projeto.etapaPublicacao?.urlPublicada ? (
                          <a
                            href={projeto.etapaPublicacao.urlPublicada}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {projeto.etapaPublicacao.urlPublicada}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getEtapaStatus(projeto.etapaPublicacao).icone}
                          <span
                            className={
                              getEtapaStatus(projeto.etapaPublicacao).cor
                            }
                          >
                            {getEtapaStatus(projeto.etapaPublicacao).texto}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Status de Publicação - {projeto.titulo}
                              </DialogTitle>
                            </DialogHeader>
                            <FormPublicacao
                              projeto={projeto}
                              onSuccess={carregarProjetos}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      {projetoEditando && (
        <Dialog
          open={!!projetoEditando}
          onOpenChange={() => setProjetoEditando(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Editar Projeto - {projetoEditando.titulo}
              </DialogTitle>
            </DialogHeader>
            <FormEditarProjeto
              projeto={projetoEditando}
              onSuccess={() => {
                setProjetoEditando(null);
                carregarProjetos();
              }}
              onClose={() => setProjetoEditando(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
