/**
 * Utilitário compartilhado para capturar o SVG do bodygraph como imagem PNG.
 *
 * A captura aguarda o carregamento real da imagem (img.decode/onload) em vez de
 * depender de um único requestAnimationFrame ou timeout fixo.
 */

export interface CaptureBodyGraphOptions {
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
}

const DEFAULT_OPTIONS: Required<CaptureBodyGraphOptions> = {
  width: 330,
  height: 620,
  scale: 2,
  backgroundColor: '#FFFFFF',
};

export async function captureBodyGraphAsImage(
  options: CaptureBodyGraphOptions = {}
): Promise<string | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const svgElement = document.querySelector('.bodygraph-svg') as SVGElement;
    if (!svgElement) {
      console.warn('Bodygraph SVG not found');
      return null;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        // Espera explícita pelo decode completo da imagem
        img
          .decode()
          .then(() => {
            const canvas = document.createElement('canvas');
            canvas.width = opts.width * opts.scale;
            canvas.height = opts.height * opts.scale;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.fillStyle = opts.backgroundColor;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.scale(opts.scale, opts.scale);
              ctx.drawImage(img, 0, 0, opts.width, opts.height);
            }

            const dataUrl = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve(dataUrl);
          })
          .catch((err) => {
            console.error('Error decoding bodygraph image:', err);
            URL.revokeObjectURL(url);
            resolve(null);
          });
      };

      img.onerror = () => {
        console.error('Error loading bodygraph SVG as image');
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    });
  } catch (error) {
    console.error('Error capturing bodygraph:', error);
    return null;
  }
}
