import { useState } from "react";

function BrandLogo({ vectorOnly = false }) {
  const [imageError, setImageError] = useState(false);

  if (!vectorOnly && !imageError) {
    return (
      <img
        className="brand-logo"
        src="/logo.png"
        alt="Логотип"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <svg className="brand-logo" viewBox="0 0 980 560" role="img" aria-label="Логотип">
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16a8d7" />
          <stop offset="100%" stopColor="#19d47f" />
        </linearGradient>
      </defs>

      <path
        d="M182 390V265C182 236 166 217 141 203L81 168C58 155 48 140 48 115V85C48 62 62 49 86 36"
        fill="none"
        stroke="url(#brandGradient)"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M182 390V265C182 236 198 217 223 203L283 168C306 155 316 140 316 115V85C316 62 302 49 278 36"
        fill="none"
        stroke="url(#brandGradient)"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M182 390V434C182 474 213 505 252 505C287 505 309 486 328 452L424 282C435 260 466 260 478 281L525 359C537 380 567 379 578 358L642 244C655 220 689 221 701 244L736 306C748 328 779 327 791 306L841 220C851 202 871 190 892 190H915"
        fill="none"
        stroke="url(#brandGradient)"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points="960,190 943,220 909,220 892,190 909,160 943,160"
        fill="none"
        stroke="url(#brandGradient)"
        strokeWidth="24"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default BrandLogo;
