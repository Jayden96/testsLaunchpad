import React from 'react';
import Image from 'next/image';
import { ComponentProps } from 'react';
import { generateCloudflareImageUrl } from '../../lib/cdn/cdn-helpers';

interface CloudflareOptimizedImageProps
  extends Omit<ComponentProps<typeof Image>, 'src' | 'alt'> {
  src: string;
  alt: string | null;
  optimizeWithCDN?: boolean;
  resizeOptions?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
    blur?: number;
  };
}

/**
 * Enhanced Image component that automatically optimizes images through Cloudflare CDN
 * Falls back to regular next/image when CDN is not available
 */
export function CloudflareOptimizedImage({
  src,
  alt,
  className,
  optimizeWithCDN = true,
  resizeOptions,
  ...rest
}: Readonly<CloudflareOptimizedImageProps>) {
  // Generate Cloudflare optimized URL if requested
  let optimizedSrc = src;
  
  if (optimizeWithCDN && resizeOptions) {
    optimizedSrc = generateCloudflareImageUrl(src, resizeOptions);
  }
  
  return (
    <Image
      src={optimizedSrc}
      alt={alt ?? 'No alternative text provided'}
      className={className}
      {...rest}
    />
  );
}

/**
 * Preset configurations for common image sizes
 */
export const IMAGE_PRESETS = {
  thumbnail: {
    width: 150,
    height: 150,
    quality: 70,
    format: 'webp' as const,
  },
  card: {
    width: 400,
    height: 300,
    quality: 80,
    format: 'webp' as const,
  },
  hero: {
    width: 1920,
    height: 1080,
    quality: 85,
    format: 'auto' as const,
  },
  product: {
    width: 800,
    height: 800,
    quality: 85,
    format: 'webp' as const,
  },
};