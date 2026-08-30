import React from "react";

export default function ShieldLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 2 L36 8 V19 C36 29 29.5 36 20 39 C10.5 36 4 29 4 19 V8 Z"
        fill="url(#shieldGrad)"
      />
      <path
        d="M13 20.5 L18 25.5 L27.5 14.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="shieldGrad" x1="4" y1="2" x2="36" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4C5FD5" />
          <stop offset="1" stopColor="#0E9F6E" />
        </linearGradient>
      </defs>
    </svg>
  );
}
