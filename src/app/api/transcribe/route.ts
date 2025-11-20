// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { auth } from "../../../../auth";
import db from "@/lib/db";

const execAsync = promisify(exec);

// Inicializar cliente da OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Caminho para o yt-dlp.exe (na raiz do projeto)
const ytDlpPath = path.join(process.cwd(), "yt-dlp.exe");

// Caminho para o FFmpeg e FFprobe
const ffmpegDir = "C:\\ffmpeg\\bin";
const ffmpegPath = path.join(ffmpegDir, "ffmpeg.exe");
const ffprobePath = path.join(ffmpegDir, "ffprobe.exe");

// Verificar se ambos existem
if (!fs.existsSync(ffmpegPath)) {
  console.warn("FFmpeg não encontrado em:", ffmpegPath);
}
if (!fs.existsSync(ffprobePath)) {
  console.warn("FFprobe não encontrado em:", ffprobePath);
}

// Diretório temporário para arquivos de áudio
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  let audioPath = "";

  try {
    // Verificar autenticação
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { youtubeUrl } = await request.json();
    console.log("Iniciando transcrição para:", youtubeUrl);

    // Verificar se o yt-dlp.exe existe
    if (!fs.existsSync(ytDlpPath)) {
      return NextResponse.json(
        { error: "yt-dlp.exe não encontrado na raiz do projeto" },
        { status: 500 }
      );
    }

    // Validar URL básica do YouTube
    if (!isValidYouTubeUrl(youtubeUrl)) {
      return NextResponse.json(
        { error: "URL do YouTube inválida" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "Não foi possível extrair o ID do vídeo" },
        { status: 400 }
      );
    }

    // Verificar se já existe transcrição para este vídeo
    const transcricaoExistente = await db.transcricao.findFirst({
      where: {
        videoId: videoId,
        userId: session.user.id,
      },
    });

    if (transcricaoExistente) {
      return NextResponse.json({
        transcript: transcricaoExistente.transcricao,
        videoInfo: {
          title: transcricaoExistente.titulo,
          duration: transcricaoExistente.duracao,
          thumbnail: transcricaoExistente.thumbnail,
          channel: transcricaoExistente.canal,
          viewCount: transcricaoExistente.views,
        },
        fromCache: true,
      });
    }

    // Obter informações do vídeo
    const videoInfo = await getVideoInfo(youtubeUrl);

    // Baixar e transcrever áudio
    audioPath = path.join(tempDir, `${videoId}.mp3`);
    const transcript = await downloadAndTranscribe(youtubeUrl, audioPath);

    // Salvar no banco de dados
    const transcricaoSalva = await db.transcricao.create({
      data: {
        userId: session.user.id,
        videoUrl: youtubeUrl,
        videoId: videoId,
        titulo: videoInfo.title,
        canal: videoInfo.channel,
        duracao: videoInfo.duration,
        duracaoSegundos: videoInfo.durationSeconds || null,
        thumbnail: videoInfo.thumbnail,
        views: videoInfo.viewCount,
        transcricao: transcript,
        idioma: "pt",
      },
    });

    console.log("Transcrição salva no banco de dados com ID:", transcricaoSalva.id);

    return NextResponse.json({
      transcript,
      videoInfo,
      fromCache: false,
    });
  } catch (error) {
    console.error("Erro na transcrição:", error);

    // Limpar arquivo temporário em caso de erro
    if (audioPath && fs.existsSync(audioPath)) {
      try {
        fs.unlinkSync(audioPath);
      } catch (e) {
        console.error("Erro ao limpar arquivo:", e);
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao processar o vídeo",
      },
      { status: 500 }
    );
  }
}


async function downloadAndTranscribe(
  youtubeUrl: string,
  audioPath: string
): Promise<string> {
  try {
    console.log("Baixando áudio com yt-dlp...");

    // Comando yt-dlp para baixar áudio em MP3 com FFmpeg explícito
    // Vamos usar --no-post-overwrites para evitar problemas com arquivos existentes
    const command = `"${ytDlpPath}" -x --audio-format mp3 --audio-quality 0 --ffmpeg-location "${ffmpegDir}" --no-post-overwrites -o "${audioPath}" "${youtubeUrl}"`;

    console.log("Executando comando:", command);

    const { stdout, stderr } = await execAsync(command);

    // Ignorar warnings, só falhar se for erro crítico
    if (stderr) {
      console.warn("Stderr do yt-dlp:", stderr);
      // Se tiver ERROR: (não apenas WARNING:), então falha
      if (stderr.includes("ERROR:") && !stderr.includes("WARNING:")) {
        throw new Error(stderr);
      }
    }
    console.log("Stdout do yt-dlp:", stdout);

    // Verificar se o arquivo foi criado (pode ter extensão diferente)
    let finalAudioPath = audioPath;
    if (!fs.existsSync(audioPath)) {
      const files = fs.readdirSync(tempDir);
      const audioFile = files.find(
        (file) =>
          file.startsWith(path.basename(audioPath, ".mp3")) &&
          (file.endsWith(".mp3") ||
            file.endsWith(".m4a") ||
            file.endsWith(".webm") ||
            file.endsWith(".opus"))
      );

      if (audioFile) {
        finalAudioPath = path.join(tempDir, audioFile);
        console.log("Arquivo encontrado com nome diferente:", finalAudioPath);
      } else {
        throw new Error("Arquivo de áudio não foi criado pelo yt-dlp");
      }
    }

    console.log(
      "Áudio baixado com sucesso, tamanho:",
      fs.statSync(finalAudioPath).size,
      "bytes"
    );

    // Verificar se o arquivo não está vazio
    if (fs.statSync(finalAudioPath).size === 0) {
      throw new Error("Arquivo de áudio vazio");
    }

    console.log("Iniciando transcrição com OpenAI...");
    const transcript = await transcribeWithOpenAI(finalAudioPath);
    return transcript;
  } catch (error) {
    console.error("Erro no download/transcrição:", error);
    throw error;
  }
}

async function transcribeWithOpenAI(audioPath: string): Promise<string> {
  try {
    console.log("Enviando áudio para OpenAI Whisper...");

    // Verificar se o arquivo existe e tem tamanho adequado
    const stats = fs.statSync(audioPath);
    if (stats.size === 0) {
      throw new Error("Arquivo de áudio está vazio");
    }

    // Criar stream do arquivo de áudio
    const audioStream = fs.createReadStream(audioPath);

    // Fazer a transcrição usando Whisper
    const response = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      response_format: "verbose_json",
      language: "pt",
      timestamp_granularities: ["segment"],
    });

    console.log("Transcrição recebida da OpenAI");

    // Formatar a transcrição com timestamps
    const formattedTranscript = formatTranscriptWithTimestamps(response);

    return formattedTranscript;
  } catch (error: any) {
    console.error("Erro na transcrição com OpenAI:", error);

    // Tentar fallback sem timestamps
    try {
      const audioStream = fs.createReadStream(audioPath);
      const fallbackResponse = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
        response_format: "text",
        language: "pt",
      });

      return `TRANSCRIÇÃO DO VÍDEO\n\n${fallbackResponse}\n\n---\n*Transcrição gerada automaticamente por Whisper AI*`;
    } catch (fallbackError: any) {
      throw new Error(`Falha na transcrição: ${fallbackError.message}`);
    }
  }
}

function formatTranscriptWithTimestamps(transcription: any): string {
  let formattedText = `TRANSCRIÇÃO DO VÍDEO\n\n`;

  if (transcription.segments && transcription.segments.length > 0) {
    transcription.segments.forEach((segment: any) => {
      const startTime = formatTimestamp(segment.start);
      const text = segment.text.trim();

      if (text && text !== "") {
        formattedText += `[${startTime}] ${text}\n\n`;
      }
    });
  } else if (transcription.text) {
    formattedText += transcription.text;
  }

  // Adicionar metadados
  formattedText += `---\n*Transcrição gerada automaticamente por Whisper AI*`;
  if (transcription.duration) {
    formattedText += `\n*Duração total: ${formatTimestamp(transcription.duration)}*`;
  }
  if (transcription.language) {
    formattedText += `\n*Idioma detectado: ${transcription.language}*`;
  }

  return formattedText;
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

async function getVideoInfo(youtubeUrl: string) {
  try {
    const command = `"${ytDlpPath}" --dump-json --no-download "${youtubeUrl}"`;
    const { stdout } = await execAsync(command);

    const info = JSON.parse(stdout);

    return {
      title: info.title || "Título não disponível",
      duration: formatDuration(info.duration || 0),
      durationSeconds: info.duration || 0,
      thumbnail: info.thumbnail || "",
      channel: info.uploader || "Canal não disponível",
      viewCount: formatViewCount(info.view_count?.toString() || "0"),
    };
  } catch (error) {
    console.error("Erro ao obter informações do vídeo:", error);

    const videoId = extractVideoId(youtubeUrl);
    return {
      title: "Vídeo do YouTube",
      duration: "--:--",
      durationSeconds: 0,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      channel: "YouTube",
      viewCount: "N/A",
    };
  }
}


function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return "--:--";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatViewCount(viewCount: string): string {
  try {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  } catch {
    return viewCount;
  }
}

function isValidYouTubeUrl(url: string): boolean {
  const regex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return regex.test(url);
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Configurar para evitar timeouts em vídeos longos
export const maxDuration = 300;
