// components/FormEdicao.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormEdicaoProps {
  projeto: any;
  onSuccess: () => void;
}

export function FormEdicao({ projeto, onSuccess }: FormEdicaoProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    concluido: projeto.etapaEdicao?.concluido || false,
    observacoes: projeto.etapaEdicao?.observacoes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/projetos-video/${projeto.id}/edicao`, {
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
          <Label>Status da Edição</Label>
          <Select
            value={formData.concluido ? "concluido" : "em_andamento"}
            onValueChange={(value) =>
              setFormData({ ...formData, concluido: value === "concluido" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes-edicao">Observações</Label>
          <Textarea
            id="observacoes-edicao"
            placeholder="Anotações sobre a edição, pontos de atenção, etc..."
            value={formData.observacoes}
            onChange={(e) =>
              setFormData({ ...formData, observacoes: e.target.value })
            }
            rows={4}
          />
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
          {loading ? "Salvando..." : "Salvar Status"}
        </Button>
      </div>
    </form>
  );
}
