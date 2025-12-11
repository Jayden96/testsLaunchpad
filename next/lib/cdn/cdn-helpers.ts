/**
 * Cloudflare CDN helper utilities for image optimization
 */

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PRODUCTION_CDN_DOMAIN = 'cdn.theimpresion.com';

/**
 * Rewrite image URLs to use Cloudflare CDN
 * @param originalUrl - The original image URL
 * @returns CDN URL if applicable, otherwise original URL
 */
export function rewriteImageUrl(originalUrl: string | null): string | null {
  if (!originalUrl) return null;
  
  // If it's already a full URL and not our API, return as-is
  if (originalUrl.startsWith('http') && !originalUrl.includes('localhost') && !originalUrl.includes('.strapidemo.com')) {
    return originalUrl;
  }
  
  // If it's a data URL, return as-is
  if (originalUrl.startsWith('data:')) return originalUrl;
  
  // If it's an external CDN URL, return as-is
  if (originalUrl.includes(CDN_URL) || originalUrl.includes(PRODUCTION_CDN_DOMAIN)) {
    return originalUrl;
  }
  
  // Rewrite local uploads to use CDN
  if (originalUrl.startsWith('/')) {
    const cdnUrl = CDN_URL || `https://${PRODUCTION_CDN_DOMAIN}`;
    return `${cdnUrl}${originalUrl}`;
  }
  
  // For relative URLs, prefix with CDN
  const cdnUrl = CDN_URL || `https://${PRODUCTION_CDN_DOMAIN}`;
  if (!originalUrl.startsWith('http')) {
    return `${cdnUrl}${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}`;
  }
  
  return originalUrl;
}

/**
 * Optimized image configuration for Cloudflare CDN
 */
export const CDN_IMAGE_CONFIG = {
  // Enable modern formats for better compression
  formats: ['image/avif', 'image/webp'] as const,
  
  // Define responsive breakpoints
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const,
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384] as const,
  
  // Cache images for 30 days
  minimumCacheTTL: 60 * 60 * 24 * 30,
  
  // Allow SVG for logos and icons
  dangerouslyAllowSVG: true,
  
  // Security policy for images
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
};

/**
 * Get cache headers for optimal CDN performance
 */
export function getCDNCacheHeaders() {
  return {
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
    'CDN-Cache-Control': 'public, max-age=31536000', // Cloudflare specific
    'Vary': 'Accept',
  };
}

/**
 * Generate Cloudflare Image Resizing URL
 * @param imageUrl - Original image URL
 * @param options - Resize options
 * @returns Cloudflare optimized URL
 */
export function generateCloudflareImageUrl(
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
    blur?: number;
  } = {}
): string {
  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    blur
  } = options;
  
  // Add resize parameters for Cloudflare
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('f', format);
  if (blur) params.set('blur', blur.toString());
  
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}${params.toString()}`;
}

/**
 * Check if URL should use CDN optimization
 */
export function shouldUseCDN(url: string): boolean {
  if (!url) return false;
  
  // Always use CDN for our own images
  const isOwnImage = url.includes('localhost') || 
                    url.includes('.strapidemo.com') || 
                    url.startsWith('/');
  
  return isOwnImage && !!CDN_URL;
}