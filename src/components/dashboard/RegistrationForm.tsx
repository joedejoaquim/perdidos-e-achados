import React, { useState } from "react";
import { ItemService } from "@/services/item.service";
import { ItemCategory } from "@/types";

interface RegistrationFormProps {
  userId: string;
  onSuccess?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  userId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "document" as ItemCategory,
    location: "",
    latitude: 0,
    longitude: 0,
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: "document", label: "RG / Documento de Identidade" },
    { value: "cpf", label: "CPF" },
    { value: "cnh", label: "CNH / Habilitação" },
    { value: "credit_card", label: "Cartão Bancário" },
    { value: "passport", label: "Passaporte" },
    { value: "other", label: "Outro" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files].slice(0, 5)); // Máximo 5 fotos
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Criar o item
      const itemData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        finder_id: userId,
        status: "open" as const,
        reward_value: 0,
      };

      const item = await ItemService.createItem(userId, itemData);

      // Upload de fotos
      if (photos.length > 0) {
        await ItemService.uploadItemPhotos(item.id, photos);
      }

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        category: "document",
        location: "",
        latitude: 0,
        longitude: 0,
      });
      setPhotos([]);

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao registrar documento"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-primary/5 dark:bg-primary/10 p-6 md:p-8 rounded-2xl border-2 border-dashed border-primary/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Registrar Documento
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Encontrou algo? Vamos ajudar a devolver ao dono!
          </p>
        </div>
        <button
          type="submit"
          form="registration-form"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
        >
          <span className="text-lg">⊕</span>
          {isLoading ? "Salvando..." : "Nova Ocorrência"}
        </button>
      </div>

      {/* Mensagens de Feedback */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300">
            ✅ Documento registrado com sucesso! +20 XP
          </p>
        </div>
      )}

      {/* Formulário */}
      <form id="registration-form" onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              {/* Tipo de Documento */}
              <div>
                <label className="block text-sm font-bold mb-1.5 text-slate-900 dark:text-white">
                  Tipo de Documento
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-bold mb-1.5 text-slate-900 dark:text-white">
                  Nome no Documento (Opcional)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Maria Oliveira Santos"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Localização */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold mb-1.5 text-slate-900 dark:text-white">
                  Localização
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                    📍
                  </span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Bairro, Rua ou Ponto de Ref."
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Photos */}
            <div className="space-y-4">
              <label className="block text-sm font-bold mb-1.5 text-slate-900 dark:text-white">
                Foto do Documento (Frente)
                {photos.length > 0 && ` - ${photos.length}/5`}
              </label>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl h-48 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 transition-colors cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={photos.length >= 5}
                  className="hidden"
                  id="photo-input"
                />
                <label
                  htmlFor="photo-input"
                  className="w-full h-full cursor-pointer flex flex-col items-center justify-center group-hover:opacity-75 transition-opacity"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">
                    📸
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    Clique ou arraste para enviar
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase">
                    PNG, JPG até 5MB
                  </p>
                </label>
              </div>

              {/* Photo Preview */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden h-20 bg-slate-200 dark:bg-slate-800"
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-white text-xl">✕</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
              Sua privacidade e segurança são prioridade. Ocultaremos dados
              sensíveis automaticamente.
            </p>
            <button
              type="button"
              className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-8 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap"
            >
              Salvar Rascunho
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
