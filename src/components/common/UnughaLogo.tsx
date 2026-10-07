import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../services/db';
import { AppSettings } from '../../types';
import { DEFAULT_UNUGHA_LOGO_BASE64 } from '../../assets/unugha_logo_base64';

interface UnughaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  src?: string;
}

/**
 * Logo Resmi Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap
 * Mendukung logo kustom yang diunggah pengguna atau logo resmi bawaan UNUGHA.
 * Otomatis reaktif terhadap perubahan pengaturan dan mendukung sub-path GitHub Pages.
 */
export const UnughaLogo: React.FC<UnughaLogoProps> = ({
  className = 'w-9 h-9',
  size,
  showText = false,
  src
}) => {
  const [settings, setSettings] = useState<AppSettings>(() => db.getSettings());
  const [imageError, setImageError] = useState(false);

  // Subscribe to realtime changes in db settings (e.g. when admin changes logo)
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setSettings(db.getSettings());
    });
    return unsub;
  }, []);

  const rawUrl = src !== undefined ? src : (settings.app_logo_url || 'logo.png');

  // Reset image error state whenever URL source changes
  useEffect(() => {
    setImageError(false);
  }, [rawUrl]);

  // Resolve URL for relative paths, external URLs, and Vite base path (GitHub Pages)
  const effectiveLogoUrl = useMemo(() => {
    if (!rawUrl || !rawUrl.trim() || rawUrl === 'logo.png' || rawUrl === '/logo.png') {
      return DEFAULT_UNUGHA_LOGO_BASE64;
    }
    const trimmed = rawUrl.trim();
    // Data URIs, blob URIs, or full external URLs
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    // Relative paths e.g. "/logo.png" or "logo.png"
    const cleanPath = trimmed.replace(/^\.?\//, '');
    const base = import.meta.env.BASE_URL || './';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return `${normalizedBase}${cleanPath}`;
  }, [rawUrl]);

  const style = size ? { width: size, height: size } : undefined;

  const displaySrc = imageError ? DEFAULT_UNUGHA_LOGO_BASE64 : (effectiveLogoUrl || DEFAULT_UNUGHA_LOGO_BASE64);

  return (
    <div className={`inline-flex items-center gap-2.5 ${showText ? '' : 'shrink-0'}`}>
      <img
        src={displaySrc}
        alt="Logo Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap"
        className={`${className} shrink-0 object-contain drop-shadow-md rounded-md`}
        style={style}
        onError={() => {
          if (!imageError) setImageError(true);
        }}
      />
      {showText && (
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>KAS INFORMATIKA</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
              UNUGHA
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">FMIKOM</span>
            <span>•</span>
            <span>Informatika UNUGHA Cilacap</span>
          </div>
        </div>
      )}
    </div>
  );
};
