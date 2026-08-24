'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Building2,
} from 'lucide-react';

interface ImovelGaleriaLightboxProps {
  isOpen: boolean;
  fotos: string[];
  initialIndex?: number;
  imovelTitulo?: string;
  imovelCodigo?: string;
  onClose: () => void;
}

export function ImovelGaleriaLightbox({
  isOpen,
  fotos = [],
  initialIndex = 0,
  imovelTitulo = 'Imóvel',
  imovelCodigo,
  onClose,
}: ImovelGaleriaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const listaFotos = Array.isArray(fotos) ? fotos.filter(Boolean) : [];

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    if (listaFotos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % listaFotos.length);
    setIsZoomed(false);
  }, [listaFotos.length]);

  const handlePrev = useCallback(() => {
    if (listaFotos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + listaFotos.length) % listaFotos.length);
    setIsZoomed(false);
  }, [listaFotos.length]);

  // Navegação por teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || listaFotos.length === 0) return null;

  const currentFoto = listaFotos[currentIndex] || listaFotos[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
        <div className="flex items-center gap-2 min-w-0">
          {imovelCodigo && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 font-mono text-xs font-bold shrink-0">
              {imovelCodigo}
            </span>
          )}
          <h3 className="font-bold text-sm sm:text-base truncate">{imovelTitulo}</h3>
          <span className="text-xs text-slate-400 font-mono ml-2 shrink-0">
            ({currentIndex + 1} de {listaFotos.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={() => setIsZoomed((prev) => !prev)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title={isZoomed ? 'Reduzir Zoom' : 'Ampliar Imagem'}
          >
            {isZoomed ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer"
            title="Fechar Galeria (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Área Principal de Visualização ── */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Seta Anterior */}
        {listaFotos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-all hover:scale-110 cursor-pointer"
            title="Foto anterior (Seta esquerda)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Imagem Central */}
        <div
          onClick={() => setIsZoomed((prev) => !prev)}
          className={`relative max-w-full max-h-full flex items-center justify-center transition-all duration-300 cursor-zoom-in ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100'
          }`}
        >
          {currentFoto ? (
            <img
              src={currentFoto}
              alt={`${imovelTitulo} - Foto ${currentIndex + 1}`}
              className="max-h-[75vh] sm:max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />
          ) : (
            <div className="w-80 h-80 flex flex-col items-center justify-center text-slate-500 bg-slate-900 rounded-2xl">
              <Building2 className="w-16 h-16 mb-2" />
              <p className="text-xs font-semibold">Sem foto disponível</p>
            </div>
          )}
        </div>

        {/* Seta Próxima */}
        {listaFotos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-all hover:scale-110 cursor-pointer"
            title="Próxima foto (Seta direita)"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* ── Miniaturas na Barra Inferior ── */}
      {listaFotos.length > 1 && (
        <div className="p-3 bg-gradient-to-t from-black/90 to-transparent z-10">
          <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-4xl mx-auto py-1 px-2 no-scrollbar">
            {listaFotos.map((url, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={url + idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 scale-105 shadow-md ring-2 ring-emerald-500/50'
                      : 'border-white/20 opacity-50 hover:opacity-90 hover:border-white/50'
                  }`}
                >
                  <img src={url} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 bg-black/70 text-[9px] font-mono text-white px-1">
                    {idx + 1}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
