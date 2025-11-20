// app/dashboard/transcricao/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  Youtube,
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Copy,
  Share2,
  User,
  Eye,
  Sparkles,
  AudioLines,
  Brain,
  Database,
  CloudDownload,
} from "lucide-react";

interface TranscriptionState {
  status: "Parado" | "Baixando" | "Transcrevendo" | "Concluído" | "Erro";
  progress: number;
  currentStep?: string;
  transcript?: string;
  error?: string;
  videoInfo?: {
    title: string;
    duration: string;
    thumbnail: string;
    channel: string;
    viewCount: string;
  };
}

interface TranscricaoSalva {
  id: string;
  videoId: string;
  titulo: string;
  canal: string;
  duracao: string;
  thumbnail: string;
  views: string;
  createdAt: string;
}

export default function TranscricaoPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcricoesSalvas, setTranscricoesSalvas] = useState<
    TranscricaoSalva[]
  >([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [transcriptionState, setTranscriptionState] =
    useState<TranscriptionState>({
      status: "Parado",
      progress: 0,
    });

  // Função para carregar histórico
  const carregarHistorico = async () => {
    setCarregandoHistorico(true);
    try {
      const response = await fetch("/api/transcricoes?limit=5");
      if (response.ok) {
        const data = await response.json();
        setTranscricoesSalvas(data.transcricoes);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  // Carregar histórico quando o componente montar
  useEffect(() => {
    carregarHistorico();
  }, []);

  const extractVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    return extractVideoId(url) !== null;
  };

  // Progresso real baseado no status
  const updateProgress = (
    status: TranscriptionState["status"],
    step?: string
  ) => {
    switch (status) {
      case "Baixando":
        setTranscriptionState((prev) => ({
          ...prev,
          status: "Baixando",
          progress: 30,
          currentStep: step || "Baixando áudio do YouTube...",
        }));
        break;
      case "Transcrevendo":
        setTranscriptionState((prev) => ({
          ...prev,
          status: "Transcrevendo",
          progress: 70,
          currentStep: step || "Transcrevendo com IA...",
        }));
        break;
      case "Concluído":
        setTranscriptionState((prev) => ({
          ...prev,
          status: "Concluído",
          progress: 100,
          currentStep: "Transcrição concluída!",
        }));
        break;
      case "Erro":
        setTranscriptionState((prev) => ({
          ...prev,
          status: "Erro",
          progress: 0,
          currentStep: "Erro no processamento",
        }));
        break;
    }
  };

  const handleTranscribe = async () => {
    if (!validateYouTubeUrl(youtubeUrl)) {
      setTranscriptionState({
        status: "Erro",
        progress: 0,
        error: "URL do YouTube inválida",
      });
      return;
    }

    // Reset state
    setTranscriptionState({
      status: "Baixando",
      progress: 10,
      currentStep: "Iniciando conexão com YouTube...",
    });

    try {
      // Primeira fase: Download
      updateProgress("Baixando", "Conectando ao YouTube...");

      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProgress("Baixando", "Extraindo informações do vídeo...");

      await new Promise((resolve) => setTimeout(resolve, 800));
      updateProgress("Baixando", "Baixando áudio...");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtubeUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao processar o vídeo");
      }

      // Segunda fase: Processamento
      updateProgress("Transcrevendo", "Processando áudio...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateProgress("Transcrevendo", "Transcrevendo com Whisper AI...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateProgress("Transcrevendo", "Formatando texto...");

      const data = await response.json();

      // Terceira fase: Salvamento
      updateProgress("Transcrevendo", "Salvando no banco de dados...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setTranscriptionState({
        status: "Concluído",
        progress: 100,
        transcript: data.transcript,
        videoInfo: data.videoInfo,
        currentStep: "Transcrição salva com sucesso!",
      });

      // Recarregar histórico após transcrição bem-sucedida
      if (!data.fromCache) {
        carregarHistorico();
      }
    } catch (error) {
      console.error("Erro:", error);
      setTranscriptionState({
        status: "Erro",
        progress: 0,
        error:
          error instanceof Error ? error.message : "Erro ao processar o vídeo",
        currentStep: "Falha no processamento",
      });
    }
  };

  // Adicione esta função para carregar uma transcrição salva
  const carregarTranscricaoSalva = async (id: string) => {
    try {
      setTranscriptionState({
        status: "Baixando",
        progress: 40,
        currentStep: "Carregando transcrição salva...",
      });

      const response = await fetch(`/api/transcricoes/${id}`);
      if (response.ok) {
        const data = await response.json();

        setTranscriptionState({
          status: "Concluído",
          progress: 100,
          transcript: data.transcricao,
          videoInfo: {
            title: data.titulo,
            duration: data.duracao,
            thumbnail: data.thumbnail,
            channel: data.canal,
            viewCount: data.views,
          },
          currentStep: "Transcrição carregada do histórico",
        });

        // Scroll para a seção de resultados
        document
          .getElementById("resultados")
          ?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Erro ao carregar transcrição:", error);
      setTranscriptionState({
        status: "Erro",
        progress: 0,
        error: "Erro ao carregar transcrição",
      });
    }
  };

  const handleCopyTranscript = async () => {
    if (transcriptionState.transcript) {
      try {
        await navigator.clipboard.writeText(transcriptionState.transcript);
        // Você pode adicionar um toast aqui
        console.log("Transcrição copiada!");
      } catch (error) {
        console.error("Erro ao copiar:", error);
      }
    }
  };

  const handleDownloadTranscript = () => {
    if (transcriptionState.transcript) {
      const blob = new Blob([transcriptionState.transcript], {
        type: "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcricao-${transcriptionState.videoInfo?.title || "video"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setYoutubeUrl("");
    setTranscriptionState({
      status: "Parado",
      progress: 0,
    });
  };

  const getStatusIcon = () => {
    switch (transcriptionState.status) {
      case "Baixando":
        return <Download className="h-5 w-5 animate-pulse" />;
      case "Transcrevendo":
        return <FileText className="h-5 w-5 animate-pulse" />;
      case "Concluído":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Erro":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

const getStatusColor = () => {
  switch (transcriptionState.status) {
    case "Baixando":
      return "bg-gradient-to-r from-red-500 to-orange-500 text-white";
    case "Transcrevendo":
      return "bg-gradient-to-r from-red-500 to-orange-500 text-white";
    case "Concluído":
      return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
    case "Erro":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500";
  }
};

const getStepIcon = () => {
  switch (transcriptionState.status) {
    case "Baixando":
      return transcriptionState.progress < 20 ? 
        <CloudDownload className="h-6 w-6 text-red-500 animate-bounce" /> :
        <AudioLines className="h-6 w-6 text-red-500 animate-pulse" />;
    case "Transcrevendo":
      return transcriptionState.progress < 80 ?
        <Brain className="h-6 w-6 text-red-500 animate-pulse" /> :
        <Database className="h-6 w-6 text-red-500 animate-pulse" />;
    case "Concluído":
      return <Sparkles className="h-6 w-6 text-green-500" />;
    default:
      return <Loader2 className="h-6 w-6 animate-spin text-red-500" />;
  }
};

  const getProgressColor = () => {
    if (transcriptionState.status === "Erro") return "bg-red-500";
    if (transcriptionState.progress < 40) return "bg-blue-500";
    if (transcriptionState.progress < 80) return "bg-purple-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Transcrição de Vídeos
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Cole o link do YouTube e transforme o áudio em texto com IA
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              URL do YouTube
            </CardTitle>
            <CardDescription>
              Cole o link do vídeo que deseja transcrever
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full"
                disabled={
                  transcriptionState.status === "Baixando" ||
                  transcriptionState.status === "Transcrevendo"
                }
              />
              {youtubeUrl && !validateYouTubeUrl(youtubeUrl) && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  URL do YouTube inválida
                </p>
              )}
            </div>

            <Button
              onClick={handleTranscribe}
              disabled={
                !youtubeUrl ||
                !validateYouTubeUrl(youtubeUrl) ||
                transcriptionState.status === "Baixando" ||
                transcriptionState.status === "Transcrevendo"
              }
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {getStatusIcon()}
              <span className="ml-2">
                {transcriptionState.status === "Parado" &&
                  "Iniciar Transcrição"}
                {transcriptionState.status === "Baixando" && "Processando..."}
                {transcriptionState.status === "Transcrevendo" &&
                  "Processando..."}
                {transcriptionState.status === "Concluído" &&
                  "Transcrição Concluída"}
                {transcriptionState.status === "Erro" && "Tentar Novamente"}
              </span>
            </Button>

            {transcriptionState.status !== "Parado" && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
              >
                Novo Vídeo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Progress & Results */}
        <Card className="bg-card/50 backdrop-blur-sm" id="resultados">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progresso</span>
              {transcriptionState.videoInfo && (
                <Badge variant="secondary" className={getStatusColor()}>
                  {transcriptionState.status}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Info */}
            {transcriptionState.videoInfo && (
              <div className="flex gap-3 p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-200/20">
                <img
                  src={transcriptionState.videoInfo.thumbnail}
                  alt="Thumbnail"
                  className="w-16 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {transcriptionState.videoInfo.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {transcriptionState.videoInfo.channel}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {transcriptionState.videoInfo.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {transcriptionState.videoInfo.viewCount} views
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Visualization */}
            {(transcriptionState.status === "Baixando" ||
              transcriptionState.status === "Transcrevendo") && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {/* Main Progress Card */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-200/20">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {getStepIcon()}
                      <div className="absolute -inset-1 bg-red-500/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        {transcriptionState.currentStep}
                      </span>
                      <span className="text-sm font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        {transcriptionState.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 ease-out"
                        style={{ width: `${transcriptionState.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={`text-center p-3 rounded-lg border transition-all duration-300 ${
                      transcriptionState.progress >= 20
                        ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-300 shadow-sm"
                        : "bg-muted/30 border-muted"
                    }`}
                  >
                    <div className="relative inline-block">
                      <CloudDownload
                        className={`h-5 w-5 mx-auto mb-2 transition-colors ${
                          transcriptionState.progress >= 20
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      />
                      {transcriptionState.progress >= 20 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium block transition-colors ${
                        transcriptionState.progress >= 20
                          ? "text-red-700"
                          : "text-muted-foreground"
                      }`}
                    >
                      Conexão
                    </span>
                    <span
                      className={`text-xs transition-colors ${
                        transcriptionState.progress >= 20
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      YouTube
                    </span>
                  </div>

                  <div
                    className={`text-center p-3 rounded-lg border transition-all duration-300 ${
                      transcriptionState.progress >= 60
                        ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-300 shadow-sm"
                        : "bg-muted/30 border-muted"
                    }`}
                  >
                    <div className="relative inline-block">
                      <Brain
                        className={`h-5 w-5 mx-auto mb-2 transition-colors ${
                          transcriptionState.progress >= 60
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      />
                      {transcriptionState.progress >= 60 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium block transition-colors ${
                        transcriptionState.progress >= 60
                          ? "text-red-700"
                          : "text-muted-foreground"
                      }`}
                    >
                      IA
                    </span>
                    <span
                      className={`text-xs transition-colors ${
                        transcriptionState.progress >= 60
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      Processamento
                    </span>
                  </div>

                  <div
                    className={`text-center p-3 rounded-lg border transition-all duration-300 ${
                      transcriptionState.progress >= 90
                        ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-300 shadow-sm"
                        : "bg-muted/30 border-muted"
                    }`}
                  >
                    <div className="relative inline-block">
                      <Database
                        className={`h-5 w-5 mx-auto mb-2 transition-colors ${
                          transcriptionState.progress >= 90
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      />
                      {transcriptionState.progress >= 90 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium block transition-colors ${
                        transcriptionState.progress >= 90
                          ? "text-red-700"
                          : "text-muted-foreground"
                      }`}
                    >
                      Salvamento
                    </span>
                    <span
                      className={`text-xs transition-colors ${
                        transcriptionState.progress >= 90
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      Banco de Dados
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {transcriptionState.status === "Baixando"
                      ? "🎯 Conectando e extraindo áudio do YouTube..."
                      : "🎯 Processando transcrição com IA..."}
                  </p>
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="text-xs bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-medium">
                      {transcriptionState.progress < 30 &&
                        "🔗 Estabelecendo conexão..."}
                      {transcriptionState.progress >= 30 &&
                        transcriptionState.progress < 70 &&
                        "📥 Baixando e processando..."}
                      {transcriptionState.progress >= 70 &&
                        transcriptionState.progress < 90 &&
                        "🤖 Transcrevendo com IA..."}
                      {transcriptionState.progress >= 90 &&
                        "💾 Salvando resultados..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {transcriptionState.status === "Erro" && (
              <Alert
                variant="destructive"
                className="animate-in fade-in duration-500 border-red-200 bg-red-50"
              >
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {transcriptionState.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Transcript */}
            {transcriptionState.status === "Concluído" &&
              transcriptionState.transcript && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyTranscript}
                      className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownloadTranscript}
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-red-100">
                    <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed text-foreground">
                      {transcriptionState.transcript}
                    </pre>
                  </div>

                  <div className="text-xs text-center">
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-medium">
                     Transcrição concluída com sucesso
                    </span>
                    <span className="text-muted-foreground ml-2">
                      • Pode conter pequenos erros
                    </span>
                  </div>
                </div>
              )}

            {/* Empty State */}
            {transcriptionState.status === "Parado" &&
              !transcriptionState.videoInfo && (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-4">
                    <FileText className="h-16 w-16 mx-auto text-red-300/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent opacity-20">
                      <FileText className="h-16 w-16 mx-auto" />
                    </div>
                  </div>
                  <p className="text-lg font-medium mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Nenhuma transcrição iniciada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cole uma URL do YouTube e clique em "Iniciar Transcrição"
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Card className="text-center bg-card/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Download className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold">Extrai Áudio</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Converte vídeos em áudio de alta qualidade
            </p>
          </CardContent>
        </Card>

        <Card className="text-center bg-card/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold">Transcreve com IA</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Usa Whisper AI para transcrição precisa
            </p>
          </CardContent>
        </Card>

        <Card className="text-center bg-card/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <CheckCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold">Salvamento Automático</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Todas as transcrições salvas no banco de dados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Transcrições */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Histórico de Transcrições</span>
            <Button
              variant="outline"
              size="sm"
              onClick={carregarHistorico}
              disabled={carregandoHistorico}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${carregandoHistorico ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </CardTitle>
          <CardDescription>
            Suas transcrições recentes salvas automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carregandoHistorico ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                Carregando...
              </p>
            </div>
          ) : transcricoesSalvas.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma transcrição salva ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transcricoesSalvas.map((transcricao) => (
                <div
                  key={transcricao.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors group"
                  onClick={() => carregarTranscricaoSalva(transcricao.id)}
                >
                  <img
                    src={transcricao.thumbnail}
                    alt={transcricao.titulo}
                    className="w-12 h-9 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-blue-600 transition-colors">
                      {transcricao.titulo}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{transcricao.canal}</span>
                      <span>{transcricao.duracao}</span>
                      <span>{transcricao.views} views</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(transcricao.createdAt).toLocaleDateString(
                      "pt-BR"
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
