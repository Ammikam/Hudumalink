// src/components/ui/OptimizedImage.tsx
/**
 * Optimized Image Component with Cloudinary transformations
 * 
 * Automatically applies appropriate transformations based on use case
 * Supports lazy loading, blur placeholder, and responsive images
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';

type PresetType = 'inspiration' | 'cover' | 'avatar' | 'portfolio';
type SizeType = {
  inspiration: 'thumbnail' | 'card' | 'detail';
  cover: 'mobile' | 'desktop' | 'retina';
  avatar: 'small' | 'medium' | 'large';
  portfolio: 'thumbnail' | 'card' | 'full';
};

interface OptimizedImageProps {
  src: string;
  alt: string;
  preset: PresetType;
  size: SizeType[PresetType];
  className?: string;
  fallback?: string;
  showPlaceholder?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
  onClick?: () => void;
}

/**
 * Generate Cloudinary transformation URL
 */
function getCloudinaryUrl(
  originalUrl: string,
  width: number,
  height: number,
  quality: 'auto' | number = 'auto'
): string {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  const transformations = `w_${width},h_${height},c_fill,g_auto,q_${quality},f_auto`;
  return originalUrl.replace('/upload/', `/upload/${transformations}/`);
}

/**
 * Preset configurations (matches backend)
 */
const PRESETS = {
  inspiration: {
    thumbnail: { width: 400, height: 500 },
    card: { width: 800, height: 1000 },
    detail: { width: 1600, height: 2000 },
  },
  cover: {
    mobile: { width: 800, height: 400 },
    desktop: { width: 1600, height: 400 },
    retina: { width: 3200, height: 800 },
  },
  avatar: {
    small: { width: 48, height: 48 },
    medium: { width: 128, height: 128 },
    large: { width: 256, height: 256 },
  },
  portfolio: {
    thumbnail: { width: 400, height: 300 },
    card: { width: 800, height: 600 },
    full: { width: 1920, height: 1080 },
  },
};

export function OptimizedImage({
  src,
  alt,
  preset,
  size,
  className,
  fallback = '/placeholder-image.png',
  showPlaceholder = true,
  objectFit = 'cover',
  onClick,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Get dimensions for this preset/size combo
  const dimensions = (PRESETS[preset] as any)[size];
  if (!dimensions) {
    console.warn(`Invalid preset/size combo: ${preset}/${size}`);
    return null;
  }

  // Generate URLs
  const optimizedUrl = getCloudinaryUrl(src, dimensions.width, dimensions.height);
  const placeholderUrl = showPlaceholder
    ? getCloudinaryUrl(src, 40, 50, 20)
    : null;

  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  const finalSrc = error ? fallback : optimizedUrl;

  return (
    <div className={cn('relative overflow-hidden', className)} onClick={onClick}>
      {/* Blur Placeholder */}
      {showPlaceholder && placeholderUrl && !loaded && !error && (
        <img
          src={placeholderUrl}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full blur-lg scale-110 transition-opacity duration-300',
            loaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{ objectFit }}
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      <img
        src={finalSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        className={cn(
          'w-full h-full transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{ objectFit }}
      />

      {/* Loading State */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * Simple helper for non-Cloudinary images or when you want manual control
 */
export function SimpleImage({
  src,
  alt,
  className,
  objectFit = 'cover',
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain';
  onClick?: () => void;
}) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? '/placeholder-image.png' : src}
      alt={alt}
      className={className}
      style={{ objectFit }}
      onClick={onClick}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}