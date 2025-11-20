// components/FormPublicacao.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormPublicacaoProps {
  projeto: any;
  onSuccess: () => void;
}

export function FormPublicacao({ projeto, onSuccess }: FormPublicacaoProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    concluido: projeto.etapaPublicacao?.concluido || false,
    urlPublicada: projeto.etapaPublicacao?.urlPublicada || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/projetos-video/${projeto.id}/publicacao`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            dataPublicacao: formData.concluido
              ? new Date().toISOString()
              : null,
          }),
        }
      );

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Status da Publicação</Label>
          <Select
            value={formData.concluido ? "concluido" : "nao_publicado"}
            onValueChange={(value) =>
              setFormData({ ...formData, concluido: value === "concluido" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nao_publicado">Não Publicado</SelectItem>
              <SelectItem value="concluido">Publicado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.concluido && (
          <div className="space-y-2">
            <Label htmlFor="url-publicada">URL do Vídeo Publicado</Label>
            <Input
              id="url-publicada"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.urlPublicada}
              onChange={(e) =>
                setFormData({ ...formData, urlPublicada: e.target.value })
              }
            />
          </div>
        )}
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
          {loading ? "Salvando..." : "Salvar Status"}
        </Button>
      </div>
    </form>
  );
}
