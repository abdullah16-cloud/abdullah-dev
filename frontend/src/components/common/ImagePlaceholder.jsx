import React from 'react';
import './ImagePlaceholder.css';

/**
 * Reusable image placeholder block for unverified or pending motorcycle assets.
 * Avoids hotlinking, layout shifts, or copyright infringement.
 */
function ImagePlaceholder({
  label = 'Image Placeholder',
  subText = 'Authorized photo pending',
  aspectRatio = '16 / 10',
  className = '',
}) {
  return (
    <div
      className={`image-placeholder-block ${className}`}
      style={{ aspectRatio }}
      role="img"
      aria-label={`${label} - ${subText}`}
    >
      <svg
        className="image-placeholder-icon"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Wheels */}
        <circle cx="16" cy="46" r="10" />
        <circle cx="48" cy="46" r="10" />
        {/* Hubs */}
        <circle cx="16" cy="46" r="3" fill="currentColor" />
        <circle cx="48" cy="46" r="3" fill="currentColor" />
        {/* Frame / Body */}
        <path d="M16 46L24 34L36 34L48 46" />
        <path d="M24 34L30 20L42 20" />
        <path d="M42 20L48 46" />
        <path d="M30 34L34 46" />
        {/* Handlebars & Seat */}
        <path d="M42 20L46 16H42" />
        <path d="M22 26C25 26 29 27 34 27" strokeWidth="3" />
      </svg>
      <span className="image-placeholder-label">{label}</span>
      {subText && <span className="image-placeholder-sub">{subText}</span>}
    </div>
  );
}

export default ImagePlaceholder;
