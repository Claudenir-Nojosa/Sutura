// components/FormSEO.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface FormSEOProps {
  projeto: any;
  onSuccess: () => void;
}

export function FormSEO({ projeto, onSuccess }: FormSEOProps) {
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    titulo: projeto.etapaSEO?.titulo || "",
    descricao: projeto.etapaSEO?.descricao || "",
    tags: projeto.etapaSEO?.tags || [],
    concluido: projeto.etapaSEO?.concluido || false,
  });

  const adicionarTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removerTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/projetos-video/${projeto.id}/seo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

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
          <Label htmlFor="titulo-seo">Título para SEO *</Label>
          <Input
            id="titulo-seo"
            placeholder="Título otimizado para busca..."
            value={formData.titulo}
            onChange={(e) =>
              setFormData({ ...formData, titulo: e.target.value })
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            Ideal: 50-60 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao-seo">Descrição para SEO</Label>
          <Textarea
            id="descricao-seo"
            placeholder="Descrição otimizada para aparecer nos resultados de busca..."
            value={formData.descricao}
            onChange={(e) =>
              setFormData({ ...formData, descricao: e.target.value })
            }
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Ideal: 120-160 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Adicionar tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), adicionarTag())
              }
            />
            <Button type="button" onClick={adicionarTag} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag: any, index: any) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removerTag(tag)}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="concluido-seo"
            checked={formData.concluido}
            onChange={(e) =>
              setFormData({ ...formData, concluido: e.target.checked })
            }
            className="rounded border-gray-300"
          />
          <Label htmlFor="concluido-seo" className="text-sm font-medium">
            Marcar SEO como concluído
          </Label>
        </div>
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
          {loading ? "Salvando..." : "Salvar SEO"}
        </Button>
      </div>
    </form>
  );
}
