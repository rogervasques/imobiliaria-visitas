'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  CheckCircle,
  X,
  Link as LinkIcon,
  RefreshCw,
  Sparkles,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from './Button';
import { supabase } from '@/lib/supabase';

interface LogoUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  helpText?: string;
}

export function LogoUpload({
  label = 'Logo da Imobiliária',
  value,
  onChange,
  disabled = false,
  helpText = 'Formatos recomendados: PNG ou SVG com fundo transparente. Altura máxima proporcional ajustada automaticamente.',
}: LogoUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');
    const isPng = file.type === 'image/png' || file.name.endsWith('.png');
    const isImage = file.type.startsWith('image/') || isSvg;

    if (!isImage) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, SVG, JPG, WEBP).');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop() || (isSvg ? 'svg' : 'png');
      const cleanFileName = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `logos/${cleanFileName}`;
      const mimeType = isSvg ? 'image/svg+xml' : file.type || (isPng ? 'image/png' : 'image/jpeg');

      const { error: uploadError } = await supabase.storage
        .from('imoveis-fotos')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true,
          contentType: mimeType,
        });

      if (uploadError) {
        console.error('Erro no Supabase Storage ao enviar logo:', uploadError);
        throw new Error(`Falha no upload da logo para o Supabase Storage: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('imoveis-fotos')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Não foi possível gerar a URL pública da logo.');
      }

      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      console.error('Erro ao processar logo:', err);
      alert(err?.message || 'Houve um erro ao enviar a logo para o Supabase Storage. Verifique a conexão e tente novamente.');
    } finally {
      setIsUploading(false);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2.5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <FileImage className="w-4 h-4 text-emerald-500" />
          {label}
        </label>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'upload'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Upload PNG / SVG
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'url'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Colar Link (URL)
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <LinkIcon className="w-4 h-4" />
            </div>
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://exemplo.com.br/logo-transparente.png"
              disabled={disabled}
              className="w-full pl-10 pr-3 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
          {value && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt="Preview da Logo"
                    className="max-h-8 max-w-[140px] w-auto h-auto object-contain"
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Logo carregada via URL
                </span>
              </div>
              <Button type="button" variant="danger" size="sm" onClick={handleClear}>
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Remover
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="image/png,image/svg+xml,image/webp,image/jpeg,.svg,.png"
            className="hidden"
            disabled={disabled || isUploading}
          />

          {value ? (
            /* Preview da Logo com Área Transparente / Ações */
            <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Visualizador da Logo */}
                <div className="flex items-center gap-4">
                  {/* Container com padrão checkerboard de transparência */}
                  <div
                    className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center min-w-[140px] min-h-[60px]"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={value}
                      alt="Logo da Imobiliária"
                      className="max-h-12 max-w-[200px] w-auto h-auto object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Logo Ativa e Configurada</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Substituirá o círculo de iniciais e o texto em todos os cabeçalhos.
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Trocar Logo
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleClear}
                    disabled={disabled || isUploading}
                    className="text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Área de Drag & Drop para envio */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/80 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isUploading
                    ? 'Processando imagem...'
                    : isDragging
                    ? 'Solte o arquivo de imagem aqui'
                    : 'Clique ou arraste a logo da imobiliária'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Suporta arquivos <strong>PNG</strong> ou <strong>SVG</strong> (com fundo transparente)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {helpText && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
          💡 {helpText}
        </p>
      )}
    </div>
  );
}
