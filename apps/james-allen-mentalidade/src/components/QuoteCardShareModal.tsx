import React, { useRef, useState } from 'react';
import { X, Share2, Copy, Download, Check, Sparkles } from 'lucide-react';

interface QuoteCardShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  title: string;
  quote: string;
}

export const QuoteCardShareModal: React.FC<QuoteCardShareModalProps> = ({
  isOpen,
  onClose,
  day,
  title,
  quote,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const shareText = `"${quote}"\n\n— James Allen (Dia ${day} · ${title})\nJornada 21 Dias de Mentalidade`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pensamento do Dia ${day} — James Allen`,
          text: shareText,
        });
      } catch {
        // Share dismissed
      }
    } else {
      handleCopyText();
    }
  };

  const handleDownloadImage = () => {
    setIsGeneratingImage(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set high-res dimensions (Instagram story / square format)
      canvas.width = 1080;
      canvas.height = 1080;

      // Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
      gradient.addColorStop(0, '#152538');
      gradient.addColorStop(1, '#0c1520');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Decorative outer border
      ctx.strokeStyle = 'rgba(184, 137, 62, 0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, 1000, 1000);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(184, 137, 62, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(55, 55, 970, 970);

      // Top Tag
      ctx.fillStyle = '#b8893e';
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`DIA ${day} · ${title.toUpperCase()}`, 540, 140);

      // Quote symbol
      ctx.fillStyle = 'rgba(184, 137, 62, 0.35)';
      ctx.font = 'italic 120px "Cormorant Garamond", Georgia, serif';
      ctx.fillText('“', 540, 260);

      // Main Quote (Multi-line wrap)
      ctx.fillStyle = '#f7f4ed';
      ctx.font = 'italic 500 46px "Cormorant Garamond", Georgia, serif';
      
      const words = quote.split(' ');
      let line = '';
      let y = 360;
      const maxWidth = 860;
      const lineHeight = 64;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, 540, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 540, y);

      // Author & Footer
      ctx.fillStyle = '#d4a574';
      ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('JAMES ALLEN', 540, 900);

      ctx.fillStyle = 'rgba(247, 244, 237, 0.6)';
      ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Jornada 21 Dias de Mentalidade', 540, 940);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `james-allen-dia-${day}-pensamento.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Error generating image:', e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div
      id="quote-card-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="quote-card-modal-container"
        className="w-full max-w-lg bg-white dark:bg-[#0f1419] sepia:bg-[#f0e8dc] rounded-2xl border border-slate-200 dark:border-[#1e2836] shadow-2xl p-5 sm:p-6 relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 rounded-full hover:bg-slate-100 dark:hover:bg-stone-800"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#b8893e] tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Cartão Pensamento do Dia
          </span>
          <h3 className="font-serif text-xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed]">
            Compartilhe esta sabedoria
          </h3>
        </div>

        {/* Visual Preview Card */}
        <div
          ref={cardRef}
          className="my-3 p-6 sm:p-8 rounded-xl bg-gradient-to-br from-[#18283d] to-[#0d1622] text-[#f7f4ed] border-2 border-[#b8893e]/40 shadow-lg text-center relative overflow-hidden"
        >
          <div className="absolute top-2 left-3 text-4xl text-[#b8893e]/30 font-serif">“</div>
          <div className="text-xs font-semibold tracking-widest text-[#b8893e] uppercase mb-4">
            Dia {day} · {title}
          </div>

          <p className="font-serif text-xl sm:text-2xl italic font-medium leading-relaxed my-4 text-[#fbf8f2]">
            "{quote}"
          </p>

          <div className="mt-6 pt-4 border-t border-[#b8893e]/20 flex flex-col items-center">
            <span className="font-sans font-semibold text-xs tracking-wider text-[#d4a574] uppercase">
              James Allen
            </span>
            <span className="text-[11px] text-stone-400 font-sans mt-0.5">
              Jornada de 21 Dias de Mentalidade
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-xs font-semibold hover:bg-[#152a45] active:scale-95 transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-[#b8893e]/50 text-[#b8893e] dark:text-[#e0ad5b] text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Imagem</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
