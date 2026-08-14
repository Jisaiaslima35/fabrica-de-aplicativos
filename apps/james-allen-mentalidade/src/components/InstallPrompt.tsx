import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check visits count
    const visitCount = parseInt(localStorage.getItem('ja_visit_count') || '0', 10) + 1;
    localStorage.setItem('ja_visit_count', visitCount.toString());

    const isDismissed = localStorage.getItem('ja_install_dismissed');

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show if user has visited at least once and didn't dismiss
      if (!isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Fallback detection for mobile browsers without beforeinstallprompt trigger
    if (visitCount >= 2 && !isDismissed && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Manual instruction notice
      alert('Para instalar: no Safari (iOS) toque no ícone de Compartilhar e selecione "Adicionar à Tela de Início". No Android/Chrome, toque nos 3 pontinhos e "Instalar aplicativo".');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('ja_install_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div
      id="pwa-install-smart-banner"
      className="max-w-5xl mx-auto px-4 sm:px-6 pt-3"
    >
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#14263e] dark:from-[#1b2636] dark:to-[#0f1419] text-white border border-[#b8893e]/40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#b8893e] text-[#0f1419] flex items-center justify-center font-serif font-bold text-lg shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-white leading-tight flex items-center gap-1.5">
              <span>Instalar James Allen no celular</span>
              <span className="px-1.5 py-0.2 text-[9px] uppercase font-sans font-bold bg-[#b8893e] text-white rounded">PWA</span>
            </h4>
            <p className="text-[11px] text-stone-300">
              Acesso rápido diário e leitura 100% offline direto da sua tela de início.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#b8893e] hover:bg-[#a67b37] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg"
            aria-label="Dispensar banner de instalação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
