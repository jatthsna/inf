import React, { useState } from 'react';
import { db } from '../../services/db';

interface UnughaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  src?: string;
}

/**
 * Logo Kas Mahasiswa (UNUGHA Cilacap)
 * Mendukung logo kustom yang diunggah pengguna atau logo bawaan UNUGHA.
 */
export const UnughaLogo: React.FC<UnughaLogoProps> = ({
  className = 'w-9 h-9',
  size,
  showText = false,
  src
}) => {
  const settings = db.getSettings();
  const effectiveLogoUrl = src || settings.app_logo_url;
  const [imageError, setImageError] = useState(false);

  const style = size ? { width: size, height: size } : undefined;

  // Render custom image logo if set
  if (effectiveLogoUrl && !imageError) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${showText ? '' : 'shrink-0'}`}>
        <img
          src={effectiveLogoUrl}
          alt="Logo Kas Informatika"
          className={`${className} shrink-0 object-contain drop-shadow-md rounded-md`}
          style={style}
          onError={() => setImageError(true)}
        />
        {showText && (
          <span className="font-bold text-sm text-white tracking-tight">KAS INFORMATIKA</span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${showText ? '' : 'shrink-0'}`}>
      <svg
        viewBox="0 0 500 500"
        className={`${className} shrink-0 drop-shadow-md`}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo UNUGHA Cilacap - FMIKOM Informatika"
      >
        <defs>
          {/* Subtle outer glow */}
          <filter id="unugha-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#10b981" floodOpacity="0.3" />
          </filter>

          {/* Green shield gradient */}
          <radialGradient id="shield-grad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="70%" stopColor="#0e652f" />
            <stop offset="100%" stopColor="#084720" />
          </radialGradient>

          {/* Gold star gradient */}
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Red flame gradient */}
          <linearGradient id="flame-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Text path for circular arch on right */}
          <path
            id="unugha-arch-text"
            d="M 270 95 A 185 185 0 0 1 425 350"
            fill="none"
          />
        </defs>

        {/* Shield Outer Border & Base (Traditional 5-corner lotus crest of UNUGHA) */}
        <path
          d="M 250 24
             C 272 56 312 40 338 52
             C 368 66 388 92 414 116
             C 436 136 470 162 472 196
             C 475 238 450 262 450 292
             C 450 326 474 360 464 394
             C 452 432 414 446 384 464
             C 346 486 304 496 250 472
             C 196 496 154 486 116 464
             C 86 446 48 432 36 394
             C 26 360 50 326 50 292
             C 50 262 25 238 28 196
             C 30 162 64 136 86 116
             C 112 92 132 66 162 52
             C 188 40 228 56 250 24 Z"
          fill="url(#shield-grad)"
          stroke="#000000"
          strokeWidth="11"
          strokeLinejoin="round"
          filter="url(#unugha-glow)"
        />

        {/* Inner thin shield contour */}
        <path
          d="M 250 36
             C 270 64 306 50 330 61
             C 358 74 376 98 400 120
             C 420 138 452 162 454 193
             C 457 232 434 254 434 282
             C 434 314 456 346 447 377
             C 436 412 402 425 374 442
             C 339 462 300 471 250 449
             C 200 471 161 462 126 442
             C 98 425 64 412 53 377
             C 44 346 66 314 66 282
             C 66 254 43 232 46 193
             C 48 162 80 138 100 120
             C 124 98 142 74 170 61
             C 194 50 230 64 250 36 Z"
          fill="none"
          stroke="#0b2e15"
          strokeWidth="2.5"
          opacity="0.6"
        />

        {/* Top Radiant Sunburst / Ray Lines */}
        <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.95">
          <line x1="250" y1="52" x2="250" y2="40" />
          <line x1="250" y1="126" x2="250" y2="138" />
          <line x1="213" y1="89" x2="201" y2="89" />
          <line x1="287" y1="89" x2="299" y2="89" />
          <line x1="224" y1="63" x2="215" y2="54" />
          <line x1="276" y1="63" x2="285" y2="54" />
          <line x1="224" y1="115" x2="215" y2="124" />
          <line x1="276" y1="115" x2="285" y2="124" />
        </g>

        {/* Top Central Golden Star (Bintang Utama) */}
        <polygon
          points="250,56 257,77 280,77 261,90 268,112 250,98 232,112 239,90 220,77 243,77"
          fill="url(#gold-grad)"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* Nahdlatul Ulama 9 Stars on the Left Arch (Bintang Sembilan) */}
        {/* Star 1 */}
        <polygon points="370,116 373,124 382,124 375,130 378,138 370,133 362,138 365,130 358,124 367,124" fill="url(#gold-grad)" stroke="#000" strokeWidth="1.2" />
        {/* Star 2 */}
        <polygon points="308,124 311,133 320,133 313,139 316,148 308,142 300,148 303,139 296,133 305,133" fill="url(#gold-grad)" stroke="#000" strokeWidth="1.3" />
        {/* Star 3 (Left side) */}
        <polygon points="208,120 211,128 220,128 213,134 216,142 208,137 200,142 203,134 196,128 205,128" fill="url(#gold-grad)" stroke="#000" strokeWidth="1.3" />
        {/* Star 4 */}
        <polygon points="160,140 163,149 173,149 165,155 168,164 160,158 152,164 155,155 147,149 157,149" fill="url(#gold-grad)" stroke="#000" strokeWidth="1.4" />
        {/* Star 5 */}
        <polygon points="126,174 129,183 139,183 131,189 134,198 126,192 118,198 121,189 113,183 123,183" fill="url(#gold-grad)" stroke="#000" strokeWidth="1.4" />
        {/* Star 6 */}
        <polygon points="106,220 109,230 119,230 111,236 114,246 106,240 98,246 101,236 93,230 103,230" fill="url(#gold-grad)" stroke="#000" strokeWidth="1.4" />
        {/* Star 7 */}
        <polygon points="98,272 101,282 111,282 103,288 106,298 98,292 90,298 93,288 85,282 95,282" fill="url(#gold-grad)" stroke="#000" strokeWidth="1.4" />
        {/* Star 8 */}
        <polygon points="104,324 107,334 117,334 109,340 112,350 104,344 96,350 99,340 91,334 101,334" fill="url(#gold-grad)" stroke="#000" strokeWidth="1.4" />
        {/* Star 9 */}
        <polygon points="126,370 129,380 139,380 131,386 134,396 126,390 118,396 121,386 113,380 123,380" fill="url(#gold-grad)" stroke="#000" strokeWidth="1.4" />

        {/* Right Arched Text: UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI */}
        <text fontSize="15.5" fontWeight="bold" fill="#000000" letterSpacing="2" fontFamily="sans-serif">
          <textPath href="#unugha-arch-text" startOffset="5%">
            UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI
          </textPath>
        </text>

        {/* Arabic Calligraphy Simulation: Jami'at Nahdlatul Ulama Al Ghazali */}
        <g fill="#000000">
          <path d="M 235 155 C 220 148 200 152 186 160 C 176 166 170 178 178 184 C 185 190 196 182 208 178 C 220 174 235 180 240 172 C 243 166 242 158 235 155 Z" />
          <path d="M 252 154 C 265 145 285 142 300 150 C 314 158 322 174 316 182 C 308 190 292 184 280 179 C 268 174 256 168 252 154 Z" />
          <path d="M 215 142 C 222 136 230 140 226 146 C 222 152 212 150 215 142 Z" />
          <path d="M 285 138 C 292 132 300 136 296 142 C 292 148 282 146 285 138 Z" />
        </g>

        {/* Central Globe (Bola Dunia Jagad NU) */}
        <circle
          cx="250"
          cy="282"
          r="98"
          fill="#1b8a41"
          stroke="#000000"
          strokeWidth="6"
        />
        {/* Globe Grid lines (latitude & longitude) */}
        <g fill="none" stroke="#000000" strokeWidth="3">
          {/* Equator & Latitudes */}
          <ellipse cx="250" cy="282" rx="98" ry="24" />
          <ellipse cx="250" cy="282" rx="98" ry="56" />
          <line x1="152" y1="282" x2="348" y2="282" strokeWidth="3.5" />
          {/* Longitudes */}
          <ellipse cx="250" cy="282" rx="26" ry="98" />
          <ellipse cx="250" cy="282" rx="64" ry="98" />
          <line x1="250" y1="184" x2="250" y2="380" strokeWidth="3.5" />
        </g>

        {/* Torch (Obor Berapi Merah / Suluh Pengetahuan) */}
        <g>
          {/* Torch Handle & Hand */}
          <path
            d="M 240 326
               L 260 326
               L 257 348
               C 255 354 245 354 243 348
               Z"
            fill="#1e293b"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Hand holding torch (tangan mengepal) */}
          <path
            d="M 238 310
               C 232 316 232 328 238 334
               C 246 340 254 340 262 334
               C 268 328 268 316 262 310
               Z"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="3.5"
          />
          <line x1="244" y1="316" x2="256" y2="316" stroke="#000" strokeWidth="2.5" />
          <line x1="243" y1="322" x2="257" y2="322" stroke="#000" strokeWidth="2.5" />
          <line x1="245" y1="328" x2="255" y2="328" stroke="#000" strokeWidth="2.5" />

          {/* Torch Bowl */}
          <path
            d="M 230 292
               C 230 306 270 306 270 292
               L 264 282
               L 236 282
               Z"
            fill="#334155"
            stroke="#000000"
            strokeWidth="3.5"
          />

          {/* Red Flaming Fire (Lidah Api Berkobar) */}
          <path
            d="M 250 205
               C 256 220 274 232 274 250
               C 274 260 266 268 268 282
               L 232 282
               C 234 268 226 260 226 250
               C 226 232 244 220 250 205 Z"
            fill="url(#flame-grad)"
            stroke="#000000"
            strokeWidth="4"
          />
          {/* Flame Inner Detail */}
          <path
            d="M 250 222
               C 254 234 262 244 260 258
               C 256 268 244 268 240 258
               C 238 244 246 234 250 222 Z"
            fill="#facc15"
            stroke="#991b1b"
            strokeWidth="2"
          />
        </g>

        {/* Open Book / Al-Qur'an (Kitab Terbuka) */}
        <g stroke="#000000" strokeWidth="3.5" strokeLinejoin="round">
          {/* Left Pages */}
          <path
            d="M 250 348
               L 198 322
               L 198 382
               L 250 412
               Z"
            fill="#ffffff"
          />
          {/* Left page thickness lines */}
          <line x1="202" y1="332" x2="246" y2="356" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="202" y1="344" x2="246" y2="368" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="202" y1="356" x2="246" y2="380" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="202" y1="368" x2="246" y2="392" stroke="#94a3b8" strokeWidth="1.8" />

          {/* Right Pages */}
          <path
            d="M 250 348
               L 302 322
               L 302 382
               L 250 412
               Z"
            fill="#ffffff"
          />
          {/* Right page thickness lines */}
          <line x1="298" y1="332" x2="254" y2="356" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="298" y1="344" x2="254" y2="368" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="298" y1="356" x2="254" y2="380" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="298" y1="368" x2="254" y2="392" stroke="#94a3b8" strokeWidth="1.8" />

          {/* Center Spine */}
          <line x1="250" y1="348" x2="250" y2="412" stroke="#000000" strokeWidth="4" />
        </g>

        {/* White Ribbon Banner with "UNUGHA" */}
        <g>
          {/* Ribbon Ends */}
          <path
            d="M 125 410 L 148 376 L 152 422 Z"
            fill="#e2e8f0"
            stroke="#000000"
            strokeWidth="3.5"
          />
          <path
            d="M 375 410 L 352 376 L 348 422 Z"
            fill="#e2e8f0"
            stroke="#000000"
            strokeWidth="3.5"
          />

          {/* Main Curved Banner */}
          <path
            d="M 142 390
               C 178 370 214 360 250 360
               C 286 360 322 370 358 390
               L 348 426
               C 316 408 284 398 250 398
               C 216 398 184 408 152 426
               Z"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* UNUGHA Banner Text */}
          <text
            x="250"
            y="390"
            textAnchor="middle"
            fontFamily="Impact, Arial Black, sans-serif"
            fontSize="26"
            letterSpacing="6"
            fill="#000000"
          >
            UNUGHA
          </text>
        </g>

        {/* CILACAP Text below the Banner */}
        <text
          x="250"
          y="442"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontWeight="bold"
          fontSize="24"
          letterSpacing="4"
          fill="#000000"
        >
          CILACAP
        </text>
      </svg>

      {showText && (
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>KAS INFORMATIKA</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
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
