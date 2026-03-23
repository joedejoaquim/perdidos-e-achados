import React, { useState, useEffect, useMemo } from "react";
import { Camera, CheckCircle2, ImagePlus, MapPin, PlusCircle, Trash2 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

import { ItemService } from "@/services/item.service";
import { ItemCategory } from "@/types";

interface RegistrationFormProps {
  onSuccess?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "document" as ItemCategory,
    city: "",
    state: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const photoPreviews = useMemo(
    () =>
      photos.map((photo, index) => ({
        id: `${photo.name}-${photo.lastModified}-${index}`,
        url: URL.createObjectURL(photo),
      })),
    [photos]
  );

  const categories = [
    { value: "document", label: "Documento" },
    { value: "electronic", label: "Eletronico" },
    { value: "key", label: "Chave" },
    { value: "other", label: "Outro" },
  ];

  useEffect(() => {
    return () => {
      photoPreviews.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [photoPreviews]);

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
    setPhotos((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "document",
      city: "",
      state: "",
    });
    setPhotos([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          city: formData.city,
          state: formData.state,
          reward_value: 0,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error || "Erro ao registrar item");
      }

      const item = payload.data;

      if (photos.length > 0) {
        const photoUrls = await ItemService.uploadItemPhotos(item.id, photos);

        if (photoUrls.length > 0) {
          await ItemService.updateItem(item.id, { photo_url: photoUrls[0] });
        }
      }

      setSuccess(true);
      resetForm();
      onSuccess?.();

      window.setTimeout(() => {
        setSuccess(false);
      }, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 dark:bg-primary/10 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Registrar Documento
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Encontrou algo? Registre no sistema com dados reais para acelerar a devolucao.
          </p>
        </div>
        <button
          type="submit"
          form="registration-form"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95 hover:bg-primary/90 disabled:opacity-50"
        >
          <PlusCircle className="h-5 w-5" />
          {isLoading ? "Salvando..." : "Nova ocorrencia"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {success && (
          <m.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <m.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Sucesso Total!</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Seu achado foi registrado e já está visível para a rede de proprietários.</p>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <m.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 2.2 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <form id="registration-form" onSubmit={handleSubmit}>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-900 dark:text-white">
                  Tipo de item
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-900 dark:text-white">
                  Identificacao do item
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: carteira preta, chave de carro, iPhone..."
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 transition-all placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-900 dark:text-white">
                    Cidade
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Ex: Sao Paulo"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-slate-900 transition-all placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-900 dark:text-white">
                    UF
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="SP"
                    required
                    maxLength={2}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 uppercase text-slate-900 transition-all placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-900 dark:text-white">
                  Descricao
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhes que ajudem o dono a reconhecer o item."
                  rows={5}
                  required
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 transition-all placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="mb-1.5 block text-sm font-bold text-slate-900 dark:text-white">
                Foto do item
                {photos.length > 0 && ` - ${photos.length}/5`}
              </label>

              <div className="group flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-800">
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
                  className="flex h-full w-full cursor-pointer flex-col items-center justify-center transition-opacity group-hover:opacity-75"
                >
                  <div className="rounded-full bg-white p-3 text-primary shadow-sm transition-transform group-hover:scale-110 dark:bg-slate-900">
                    <Camera className="h-7 w-7" />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Clique ou arraste para enviar
                  </p>
                  <p className="mt-1 text-[10px] uppercase text-slate-400 dark:text-slate-500">
                    PNG, JPG ate 5MB
                  </p>
                </label>
              </div>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="group relative h-20 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800"
                    >
                      <img
                        src={photo.url}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <ImagePlus className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Privacidade protegida
                    </p>
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Use fotos reais apenas para facilitar a identificacao. Evite expor dados
                      sensiveis do documento na imagem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
            <p className="max-w-xs text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              Sua privacidade e seguranca sao prioridade. Esta tela envia apenas dados reais do
              formulario para a API do sistema.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center whitespace-nowrap rounded-lg bg-primary/10 px-8 py-2.5 font-bold text-primary transition-all hover:bg-primary hover:text-white"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Limpar campos
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};


