import type { Context, Next } from 'koa';

export default (config: any, { strapi }: any) => {
  return async (ctx: Context, next: Next) => {
    if (ctx.method === 'GET') {
      // Rewrite response URLs to use CDN
      const originalSend = ctx.body;
      if (typeof originalSend === 'string' || Buffer.isBuffer(originalSend)) {
        // For binary responses, skip processing
      } else if (originalSend && typeof originalSend === 'object') {
        const rewriteObjectUrls = (obj: any) => {
          if (!obj || typeof obj !== 'object') return obj;
          
          if (Array.isArray(obj)) {
            return obj.map(rewriteObjectUrls);
          }
          
          const rewritten = { ...obj };
          
          // Rewrite URL fields
          if (rewritten.url && typeof rewritten.url === 'string') {
            const cdnUrl = process.env.CDN_URL;
            if (cdnUrl && rewritten.url.startsWith(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337')) {
              rewritten.url = rewritten.url.replace(
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
                cdnUrl
              );
            }
          }
          
          // Rewrite alternative text URLs if any
          Object.keys(rewritten).forEach(key => {
            if (typeof rewritten[key] === 'object') {
              rewritten[key] = rewriteObjectUrls(rewritten[key]);
            }
          });
          
          return rewritten;
        };
        
        ctx.body = rewriteObjectUrls(originalSend);
      }
    }
    
    await next();
  };
};