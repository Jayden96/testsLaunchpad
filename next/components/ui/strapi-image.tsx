import { unstable_noStore as noStore } from 'next/cache';
import Image from 'next/image';
import { ComponentProps } from 'react';
import { rewriteImageUrl } from '../../lib/cdn/cdn-helpers';

interface StrapiImageProps
  extends Omit<ComponentProps<typeof Image>, 'src' | 'alt'> {
  src: string;
  alt: string | null;
}

export function getStrapiMedia(url: string | null) {
  if (url == null) return null;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('http') || url.startsWith('//')) return url;
  
  // Use CDN rewrite helper for better optimization
  return rewriteImageUrl(url);
}

export function StrapiImage({
  src,
  alt,
  className,
  ...rest
}: Readonly<StrapiImageProps>) {
  noStore();
  const imageUrl = getStrapiMedia(src);
  if (!imageUrl) return null;
  return (
    <Image
      src={imageUrl}
      alt={alt ?? 'No alternative text provided'}
      className={className}
      {...rest}
    />
  );
}
