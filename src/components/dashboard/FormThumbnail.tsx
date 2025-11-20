// components/FormThumbnail.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Upload } from "lucide-react";

interface FormThumbnailProps {
  projeto: any;
  onSuccess: () => void;
}

export function FormThumbnail({ projeto, onSuccess }: FormThumbnailProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    url: projeto.etapaThumbnail?.url || "",
    concluido: projeto.etapaThumbnail?.concluido || false,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simular upload - em produção, você enviaria para um servidor
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/projetos-video/${projeto.id}/thumbnail`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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
          <Label>Upload da Thumbnail</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {formData.url ? (
              <div className="space-y-4">
                <img
                  src={formData.url}
                  alt="Thumbnail preview"
                  className="mx-auto max-h-48 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, url: "" })}
                >
                  Remover Imagem
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Image className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-medium">
                      Clique para fazer upload
                    </span>
                    <span className="block text-sm text-gray-500">
                      ou arraste e solte
                    </span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url-thumbnail">Ou use URL da imagem</Label>
          <Input
            id="url-thumbnail"
            placeholder="https://exemplo.com/thumbnail.jpg"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="concluido-thumbnail"
            checked={formData.concluido}
            onChange={(e) =>
              setFormData({ ...formData, concluido: e.target.checked })
            }
            className="rounded border-gray-300"
          />
          <Label htmlFor="concluido-thumbnail" className="text-sm font-medium">
            Marcar thumbnail como concluída
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.url}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          {loading ? "Salvando..." : "Salvar Thumbnail"}
        </Button>
      </div>
    </form>
  );
}
