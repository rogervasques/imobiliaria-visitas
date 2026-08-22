'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, X, Link as LinkIcon, RefreshCw, Sparkles, FileImage } from 'lucide-react';
import { uploadImovelFoto, UploadProgressInfo } from '@/lib/storage';
import { formatBytes } from '@/lib/imageOptimizer';
import { Button } from './Button';

interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ label = 'Foto de Capa do Imóvel', value, onChange, disabled }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [progressInfo, setProgressInfo] = useState<UploadProgressInfo>({
    status: 'idle',
    progress: 0,
  });
  const [stats, setStats] = useState<{
    originalSize?: number;
    compressedSize?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    try {
      const result = await uploadImovelFoto(file, (info) => {
        setProgressInfo(info);
      });

      setStats({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
      });

      onChange(result.url);
    } catch (error) {
      console.error('Falha ao processar e enviar foto:', error);
      alert('Houve um erro ao comprimir e enviar a imagem. Tente novamente.');
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
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    setStats(null);
    setProgressInfo({ status: 'idle', progress: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isProcessing = progressInfo.status === 'optimizing' || progressInfo.status === 'uploading';

  return (
    <div className="space-y-2">
      {/* Cabeçalho com Abas (Upload vs URL) */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <FileImage className="w-4 h-4 text-emerald-500" />
          {label}
        </label>
        
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mode === 'upload'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Upload do Computador
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mode === 'url'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Colar Link (URL)
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <LinkIcon className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            disabled={disabled}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            disabled={disabled || isProcessing}
          />

          {value ? (
            /* Preview da Imagem Carregada */
            <div className="relative group rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-900/50 bg-slate-50 dark:bg-slate-900/50 p-3">
              <div className="flex flex-col sm:flex-row items-center gap-3.5">
                <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt="Preview do Imóvel"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
                    WebP HD
                  </div>
                </div>

                <div className="flex-1 w-full space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Imagem otimizada e pronta</span>
                  </div>

                  {stats && stats.originalSize && stats.compressedSize ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 px-2.5 py-1.5 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>
                        Reduzida de <strong>{formatBytes(stats.originalSize)}</strong> para{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {formatBytes(stats.compressedSize)}
                        </strong>{' '}
                        ({Math.round((1 - stats.compressedSize / stats.originalSize) * 100)}% menor)
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 truncate max-w-[280px]">
                      {value}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs h-7 px-2 text-slate-600 dark:text-slate-300"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Trocar foto
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="text-xs h-7 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Área de Drag & Drop */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-center ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-emerald-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/60'
              } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
            >
              {isProcessing ? (
                <div className="w-full max-w-xs space-y-3 py-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                    <span>{progressInfo.message || 'Processando imagem...'}</span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressInfo.progress}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Otimizando dimensões (1920px) e comprimindo em WebP...
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 shadow-xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Clique para escolher
                    </span>{' '}
                    ou arraste uma foto aqui
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    JPG, PNG ou WEBP • Compressão automática para &lt; 500KB
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
