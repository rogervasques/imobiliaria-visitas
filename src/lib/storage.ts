import { supabase } from './supabase';
import { optimizeImage, OptimizedImageResult } from './imageOptimizer';

export interface UploadProgressInfo {
  status: 'idle' | 'optimizing' | 'uploading' | 'success' | 'error';
  progress: number;
  message?: string;
  originalSize?: number;
  compressedSize?: number;
}

export interface UploadResult {
  url: string;
  originalSize: number;
  compressedSize: number;
  optimizedFileName: string;
}

/**
 * Realiza a otimização da imagem no cliente e faz o upload para o Supabase Storage
 */
export async function uploadImovelFoto(
  file: File,
  onProgress?: (info: UploadProgressInfo) => void
): Promise<UploadResult> {
  try {
    // 1. Etapa de Otimização & Compressão
    onProgress?.({
      status: 'optimizing',
      progress: 25,
      message: 'Comprimindo e otimizando imagem...',
      originalSize: file.size,
    });

    const optimized: OptimizedImageResult = await optimizeImage(file, 1920, 500 * 1024);

    // 2. Etapa de Upload para o Supabase Storage
    onProgress?.({
      status: 'uploading',
      progress: 60,
      message: 'Enviando para o servidor seguro...',
      originalSize: optimized.originalSize,
      compressedSize: optimized.compressedSize,
    });

    const fileExt = optimized.file.name.split('.').pop() || 'webp';
    const cleanFileName = `imovel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `imoveis/${cleanFileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from('imoveis-fotos')
      .upload(filePath, optimized.file, {
        cacheControl: '31536000', // 1 ano de cache para alta performance
        upsert: true,
        contentType: optimized.file.type,
      });

    if (uploadError) {
      console.error('Erro ao fazer upload no Supabase Storage (imoveis-fotos):', uploadError);
      throw new Error(`Falha no upload para o Supabase Storage: ${uploadError.message}`);
    }

    // 3. Obter a URL pública permanente
    const { data: publicUrlData } = supabase.storage
      .from('imoveis-fotos')
      .getPublicUrl(filePath);

    const finalUrl = publicUrlData?.publicUrl;

    if (!finalUrl) {
      throw new Error('Não foi possível obter a URL pública permanente da imagem.');
    }

    onProgress?.({
      status: 'success',
      progress: 100,
      message: 'Upload concluído com sucesso!',
      originalSize: optimized.originalSize,
      compressedSize: optimized.compressedSize,
    });

    return {
      url: finalUrl,
      originalSize: optimized.originalSize,
      compressedSize: optimized.compressedSize,
      optimizedFileName: cleanFileName,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro ao processar imagem.';
    console.error('Erro no fluxo de upload:', error);
    onProgress?.({
      status: 'error',
      progress: 0,
      message: errorMsg,
    });
    throw error;
  }
}
