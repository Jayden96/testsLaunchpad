import { unstable_noStore as noStore } from 'next/cache';
import { rewriteImageUrl, shouldUseCDN } from '../cdn/cdn-helpers';

export function strapiImage(url: string): string {
  noStore();
  
  // Use CDN rewrite helper
  const rewrittenUrl = rewriteImageUrl(url);
  if (rewrittenUrl) return rewrittenUrl;
  
  // Fallback to original logic
  if (url.startsWith('/')) {
    if (
      !process.env.NEXT_PUBLIC_API_URL &&
      document?.location.host.endsWith('.strapidemo.com')
    ) {
      return `https://${document.location.host.replace('client-', 'api-')}${url}`;
    }

    return process.env.NEXT_PUBLIC_API_URL + url;
  }
  return url;
}
