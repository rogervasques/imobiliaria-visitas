/**
 * Utilitário de Otimização e Compressão de Imagens no Navegador
 * 
 * - Redimensiona para no máximo 1920x1920 mantendo a proporção.
 * - Converte e comprime para WebP (com fallback para JPEG).
 * - Reduz arquivos pesados (ex: 15MB) para menos de 500KB mantendo alta qualidade visual.
 */

export interface OptimizedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  previewUrl: string;
}

export async function optimizeImage(
  file: File,
  maxDimension: number = 1920,
  maxSizeBytes: number = 500 * 1024 // 500 KB
): Promise<OptimizedImageResult> {
  const originalSize = file.size;

  // Se não for imagem, retorna o próprio arquivo
  if (!file.type.startsWith('image/')) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      width: 0,
      height: 0,
      previewUrl: URL.createObjectURL(file),
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // 1. Calcular novas dimensões respeitando a proporção (máx 1920px)
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      // 2. Criar canvas para redimensionar e desenhar
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
        return;
      }

      // Suavização de alta qualidade no redimensionamento
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // 3. Tentar exportar em WebP com qualidade 0.80
      let quality = 0.80;
      let format = 'image/webp';
      let extension = 'webp';

      const getBlob = (mimeType: string, q: number): Promise<Blob | null> => {
        return new Promise((res) => canvas.toBlob(res, mimeType, q));
      };

      let blob = await getBlob(format, quality);

      // Se o navegador não suportar WebP ou falhar, usar JPEG
      if (!blob || blob.type !== 'image/webp') {
        format = 'image/jpeg';
        extension = 'jpg';
        blob = await getBlob(format, quality);
      }

      // 4. Se o arquivo ainda for maior que o tamanho máximo (ex: > 500KB), reduzir qualidade progressivamente
      if (blob && blob.size > maxSizeBytes) {
        const qualitySteps = [0.72, 0.65, 0.55];
        for (const q of qualitySteps) {
          const smallerBlob = await getBlob(format, q);
          if (smallerBlob) {
            blob = smallerBlob;
            quality = q;
            if (blob.size <= maxSizeBytes) break;
          }
        }
      }

      if (!blob) {
        reject(new Error('Falha ao comprimir imagem.'));
        return;
      }

      // 5. Gerar novo File com nome limpo e extensão adequada
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const optimizedFileName = `${baseName}_optimized.${extension}`;
      const optimizedFile = new File([blob], optimizedFileName, {
        type: blob.type,
        lastModified: Date.now(),
      });

      const previewUrl = URL.createObjectURL(blob);

      resolve({
        file: optimizedFile,
        originalSize,
        compressedSize: blob.size,
        width,
        height,
        previewUrl,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Erro ao carregar imagem para compressão.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Formata bytes em formato legível (ex: 2.4 MB, 320 KB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
