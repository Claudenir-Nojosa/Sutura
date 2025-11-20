// components/FormNovoProjeto.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormNovoProjetoProps {
  onSuccess: () => void;
}

export function FormNovoProjeto({ onSuccess }: FormNovoProjetoProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    urlVideo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/projetos-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        console.error("Erro ao criar projeto");
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título do Vídeo *</Label>
        <Input
          id="titulo"
          placeholder="Ex: Como usar React Hooks na prática"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          placeholder="Descreva brevemente o conteúdo do vídeo..."
          value={formData.descricao}
          onChange={(e) =>
            setFormData({ ...formData, descricao: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="urlVideo">URL do Vídeo (Opcional)</Label>
        <Input
          id="urlVideo"
          placeholder="https://www.youtube.com/watch?v=..."
          value={formData.urlVideo}
          onChange={(e) =>
            setFormData({ ...formData, urlVideo: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          {loading ? "Criando..." : "Criar Projeto"}
        </Button>
      </div>
    </form>
  );
}
