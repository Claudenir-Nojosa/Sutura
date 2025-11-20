// components/FormScript.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormScriptProps {
  projeto: any;
  onSuccess: () => void;
}

export function FormScript({ projeto, onSuccess }: FormScriptProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    conteudo: projeto.etapaScript?.conteudo || "",
    concluido: projeto.etapaScript?.concluido || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/projetos-video/${projeto.id}/script`, {
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="script-conteudo">Script do Vídeo</Label>
          <Textarea
            id="script-conteudo"
            placeholder="Escreva o script completo do seu vídeo aqui...
            
[00:00] Introdução
Olá pessoal, bem-vindos ao canal!

[00:15] Desenvolvimento
Hoje vamos falar sobre...

[02:30] Conclusão
Espero que tenham gostado!"
            value={formData.conteudo}
            onChange={(e) =>
              setFormData({ ...formData, conteudo: e.target.value })
            }
            className="min-h-[400px] font-mono text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="concluido-script"
            checked={formData.concluido}
            onChange={(e) =>
              setFormData({ ...formData, concluido: e.target.checked })
            }
            className="rounded border-gray-300"
          />
          <Label htmlFor="concluido-script" className="text-sm font-medium">
            Marcar script como concluído
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t mt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          {loading ? "Salvando..." : "Salvar Script"}
        </Button>
      </div>
    </form>
  );
}
