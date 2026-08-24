'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle,
  X,
  Plus,
  Star,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Eye,
  Link as LinkIcon,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { uploadImovelFoto } from '@/lib/storage';
import { Button } from './Button';

interface MultiImageUploadProps {
  label?: string;
  fotos: string[];
  capaUrl?: string;
  onChange: (fotos: string[], capaUrl: string) => void;
  disabled?: boolean;
}

export function MultiImageUpload({
  label = 'Galeria de Fotos do Imóvel',
  fotos = [],
  capaUrl = '',
  onChange,
  disabled,
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [urlInput, setUrlInput] = useState('');
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lista normalizada de fotos
  const listaFotos = Array.isArray(fotos) ? fotos.filter(Boolean) : [];
  const fotoCapaEfetiva = capaUrl && listaFotos.includes(capaUrl) ? capaUrl : listaFotos[0] || '';

  // Processa upload de múltiplos arquivos
  const handleFilesUpload = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Por favor, selecione arquivos de imagem válidos (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: imageFiles.length });

    const novasUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      setUploadProgress({ current: i + 1, total: imageFiles.length });
      try {
        const result = await uploadImovelFoto(imageFiles[i]);
        if (result.url) {
          novasUrls.push(result.url);
        }
      } catch (err) {
        console.error(`Erro ao enviar foto ${imageFiles[i].name}:`, err);
      }
    }

    setIsUploading(false);

    if (novasUrls.length > 0) {
      const fotosAtualizadas = [...listaFotos, ...novasUrls];
      const novaCapa = fotoCapaEfetiva || fotosAtualizadas[0];
      onChange(fotosAtualizadas, novaCapa);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  // Adiciona via URL externa
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Por favor, insira uma URL válida iniciando com https://');
      return;
    }

    const fotosAtualizadas = [...listaFotos, url];
    const novaCapa = fotoCapaEfetiva || fotosAtualizadas[0];
    onChange(fotosAtualizadas, novaCapa);
    setUrlInput('');
  };

  // Define uma foto como capa (coloca como primeiro elemento ou atualiza capaUrl)
  const handleSetCapa = (url: string) => {
    const reordenadas = [url, ...listaFotos.filter((f) => f !== url)];
    onChange(reordenadas, url);
  };

  // Remove uma foto individual da galeria
  const handleRemoveFoto = (urlParaRemover: string) => {
    const fotosAtualizadas = listaFotos.filter((f) => f !== urlParaRemover);
    const novaCapa =
      fotoCapaEfetiva === urlParaRemover ? fotosAtualizadas[0] || '' : fotoCapaEfetiva;
    onChange(fotosAtualizadas, novaCapa);
  };

  // Move a foto para a esquerda
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const novasFotos = [...listaFotos];
    const temp = novasFotos[index];
    novasFotos[index] = novasFotos[index - 1];
    novasFotos[index - 1] = temp;
    onChange(novasFotos, novasFotos[0]);
  };

  // Move a foto para a direita
  const handleMoveRight = (index: number) => {
    if (index === listaFotos.length - 1) return;
    const novasFotos = [...listaFotos];
    const temp = novasFotos[index];
    novasFotos[index] = novasFotos[index + 1];
    novasFotos[index + 1] = temp;
    onChange(novasFotos, novasFotos[0]);
  };

  return (
    <div className="space-y-3">
      {/* Cabeçalho e Contador */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-emerald-500" />
          <span>{label}</span>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
            {listaFotos.length} {listaFotos.length === 1 ? 'foto' : 'fotos'}
          </span>
        </label>

        <span className="text-[11px] text-slate-400">
          A 1ª foto com a estrela é a <strong>Capa Principal</strong>
        </span>
      </div>

      {/* Zona de Drop & Seleção Múltipla */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 hover:border-emerald-400 hover:bg-slate-50'
        } ${disabled || isUploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesUpload(e.target.files);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Otimizando e enviando foto {uploadProgress.current} de {uploadProgress.total}...
              </p>
              <p className="text-[11px] text-slate-400">Comprimindo imagens automaticamente em alta qualidade.</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Clique para selecionar fotos ou arraste múltiplos arquivos aqui
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Suporta seleção múltipla • JPG, PNG, WEBP • Otimização automática
                </p>
              </div>

              <div className="pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <Plus className="w-3.5 h-3.5" /> Adicionar Fotos do Computador
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Adicionar via URL externa */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl(e);
              }
            }}
            placeholder="Ou cole uma URL externa de imagem (https://...)"
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="text-xs shrink-0"
        >
          <Plus className="w-3 h-3 mr-1" /> Adicionar Link
        </Button>
      </div>

      {/* Grid de Fotos Já Enviadas */}
      {listaFotos.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {listaFotos.map((url, idx) => {
              const isCapa = idx === 0 || url === fotoCapaEfetiva;

              return (
                <div
                  key={url + idx}
                  className={`group relative rounded-2xl overflow-hidden border bg-white dark:bg-slate-800 shadow-xs transition-all ${
                    isCapa
                      ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {/* Imagem */}
                  <div className="relative h-28 w-full bg-slate-100 dark:bg-slate-900">
                    <img
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Tag de Capa */}
                    {isCapa && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                        <Star className="w-3 h-3 fill-white" />
                        <span>CAPA</span>
                      </div>
                    )}

                    {/* Ordem */}
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </div>

                    {/* Botão de Zoom */}
                    <button
                      type="button"
                      onClick={() => setPreviewZoomUrl(url)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-opacity opacity-0 group-hover:opacity-100"
                      title="Visualizar em tamanho grande"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Barra de Ações Rápidas da Foto */}
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      {/* Mover para a esquerda */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveLeft(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Mover para a esquerda"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>

                      {/* Mover para a direita */}
                      <button
                        type="button"
                        disabled={idx === listaFotos.length - 1}
                        onClick={() => handleMoveRight(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Mover para a direita"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      {/* Definir como Capa */}
                      {!isCapa && (
                        <button
                          type="button"
                          onClick={() => handleSetCapa(url)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950 flex items-center gap-0.5"
                          title="Tornar esta foto a capa principal"
                        >
                          <Star className="w-2.5 h-2.5" /> Capa
                        </button>
                      )}
                    </div>

                    {/* Excluir Foto */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFoto(url)}
                      className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                      title="Excluir esta foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Simples de Preview Rápido da Foto Selecionada */}
      {previewZoomUrl && (
        <div
          onClick={() => setPreviewZoomUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-1 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewZoomUrl(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewZoomUrl}
              alt="Preview Zoom"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
