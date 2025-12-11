# Cloudflare CDN for Image Optimization - Setup Guide

This guide covers implementing Cloudflare CDN for efficient image delivery from Strapi to Next.js frontend, resolving 400 errors and optimizing performance.

## 🎯 Overview

- **Problem**: Images return 400 errors on Vercel despite working locally
- **Solution**: Set up Cloudflare CDN for global caching and optimization
- **Benefits**: Faster loading, reduced bandwidth, automatic format optimization

## 📋 Prerequisites

- Cloudflare account with Pro/Enterprise plan (for Image Optimization)
- Domain management access (to configure DNS)
- Cloudflare R2 account (for S3-compatible storage)
- Access to both Strapi and Next.js environments

## 🔧 Step 1: Cloudflare Account Setup

### 1.1 Enable Image Optimization
1. Log into your Cloudflare dashboard
2. Select your domain
3. Go to **Speed > Optimization**
4. Enable **Polish** and **Image Optimization**
5. Configure settings:
   - **Polish Mode**: Lossy (recommended) or Lossless
   - **Format**: Auto (to serve AVIF/WebP when supported)
   - **Quality**: 80-85 (good balance of quality vs size)

### 1.2 Configure Cache Rules
1. Go to **Caching > Configuration**
2. Set **Browser Cache TTL**: Respect Existing Headers
3. Go to **Caching > Page Rules** (or **Rules > Cache Rules**)
4. Create rule for `/uploads/*`:
   - **Expression**: `(http.request.uri.path matches "^/uploads/.*")`
   - **Settings**: Cache Level = Cache Everything, Edge Cache TTL = 1 month

### 1.3 Enable Origin Pull (Alternative to R2)
If using existing Strapi uploads without R2:
1. Create a CNAME record: `cdn.yourdomain.com` → `your-strapi-domain.com`
2. In Cloudflare, add this as an origin
3. Configure page rules to cache the origin

## 🔧 Step 2: Cloudflare R2 Storage Setup

### 2.1 Create R2 Bucket
1. Go to **R2 > Buckets** in Cloudflare dashboard
2. Create bucket named `images` (or your preferred name)
3. Enable public access
4. Note your **Account ID** and **Bucket name**

### 2.2 Generate API Keys
1. Go to **My Profile > API Tokens**
2. Create custom token with permissions:
   - **Account**: Cloudflare R2:Edit, Cloudflare R2:Read
3. Note the **Access Key ID** and **Secret Access Key**

## 🔧 Step 3: DNS Configuration

### 3.1 Point CDN Domain to Cloudflare
Add DNS records in your domain registrar or DNS provider:
```
Type: CNAME
Name: cdn
Target: your-domain.com
TTL: Auto
```

Or use a subdomain:
```
Type: CNAME  
Name: images
Target: cdn.your-domain.com
TTL: Auto
```

### 3.2 Proxy through Cloudflare
In Cloudflare DNS settings:
- Enable **Proxy** (orange cloud) for CDN records
- This enables Cloudflare's caching and optimization

## 🔧 Step 4: Environment Variables

### 4.1 Next.js Environment (.env.local)
```bash
# Required for CDN image serving
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
IMAGE_HOSTNAME=cdn.yourdomain.com

# Keep existing
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
PREVIEW_SECRET=your-preview-secret
```

### 4.2 Strapi Environment (.env)
```bash
# Cloudflare R2 Configuration
CDN_URL=https://cdn.yourdomain.com
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_BUCKET_NAME=images

# Keep existing
CLIENT_URL=https://yourdomain.com
PREVIEW_SECRET=your-preview-secret
```

## 🔧 Step 5: Code Configuration

### 5.1 Strapi Configuration (strapi/config/plugins.ts)
Already configured with AWS S3 provider pointing to Cloudflare R2.

### 5.2 Next.js Configuration (next/next.config.mjs)
Already configured with:
- CDN domain patterns in remotePatterns
- Optimized image formats (AVIF/WebP)
- Responsive breakpoints
- Cache settings

### 5.3 Image URL Rewriting
All image utilities automatically rewrite URLs to use CDN when available.

## 🧪 Step 6: Testing and Verification

### 6.1 Local Testing
```bash
# Run the test script
./scripts/test-cdn-setup.sh

# Manual testing
1. Start Strapi: cd strapi && npm run develop
2. Start Next.js: cd next && npm run dev
3. Upload image through Strapi admin
4. Check if image URL uses CDN domain
5. Verify image loads on frontend
```

### 6.2 Production Testing
1. Deploy to Vercel/hosting platform
2. Test image loading from production
3. Check browser dev tools:
   - Verify AVIF/WebP format delivery
   - Check cache headers
   - Measure load times
4. Use online tools:
   - GTmetrix for performance
   - WebPageTest for detailed analysis

## 🔧 Step 7: Troubleshooting Common Issues

### 400 Errors on Vercel
**Cause**: Images not accessible from CDN
**Solution**:
1. Verify DNS propagation (can take 24-48 hours)
2. Check Cloudflare cache rules
3. Ensure R2 bucket has public read access
4. Verify API keys and permissions

### Images Not Loading
**Cause**: CORS issues or incorrect URLs
**Solution**:
1. Check CORS headers in Cloudflare
2. Verify NEXT_PUBLIC_CDN_URL matches actual CDN domain
3. Ensure image URLs start with the CDN domain

### Slow Loading
**Cause**: Cache not working properly
**Solution**:
1. Check Cloudflare cache status in dashboard
2. Verify cache rules are correct
3. Enable Brotli compression in Cloudflare
4. Consider using Cloudflare Workers for advanced optimization

### Format Not Converting
**Cause**: Polish not enabled or configured
**Solution**:
1. Verify Polish is enabled in Cloudflare
2. Check browser supports modern formats
3. Clear browser cache and test again
4. Use incognito mode for testing

## 🔄 Step 8: Cache Invalidation

### Automatic Invalidation
Images are automatically invalidated when:
- New images are uploaded to Strapi (URLs change)
- Cache TTL expires (default 30 days)

### Manual Cache Purge
1. Go to **Caching > Configuration** in Cloudflare
2. Use **Purge Everything** or **Custom Purge**
3. Enter specific URLs to purge

### API-based Purging
```javascript
// Add to Strapi upload lifecycle for automatic purge
const response = await fetch('https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    files: [`${CDN_URL}/uploads/${fileName}`]
  })
});
```

## 📊 Performance Monitoring

### Key Metrics to Monitor
- **Cache Hit Ratio**: Should be >90%
- **Load Time**: <2s for images
- **Format Distribution**: Should see AVIF/WebP usage
- **Geographic Performance**: Test from different regions

### Tools for Monitoring
- **Cloudflare Analytics**: Built-in analytics
- **Web Vitals**: Browser-based performance metrics
- **Google PageSpeed Insights**: Overall site performance
- **GTmetrix**: Detailed analysis and recommendations

## 🔒 Security Considerations

### Image Security
1. **Hotlink Protection**: Enable in Cloudflare to prevent unauthorized use
2. **Access Rules**: Configure who can upload to your bucket
3. **Signed URLs**: For private images, consider signed URLs
4. **Rate Limiting**: Protect against abuse

### CORS Configuration
Add appropriate CORS headers in Cloudflare:
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, HEAD
Access-Control-Allow-Headers: *
```

## 🎉 Maintenance and Updates

### Regular Maintenance
- Monitor cache performance monthly
- Review and optimize image sizes
- Update Cloudflare settings based on traffic patterns
- Backup original images before large changes

### Scaling Considerations
- Monitor R2 storage costs
- Consider using different cache TTLs for different image types
- Implement image versioning for better cache control
- Monitor bandwidth usage and optimize accordingly

## 📞 Support Resources

- [Cloudflare Documentation](https://developers.cloudflare.com/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)
- [Strapi Upload Plugin](https://docs.strapi.io/developer-docs/latest/plugins/upload.html)

---

**Note**: This setup provides a robust foundation for image delivery. Adjust configurations based on your specific requirements and performance monitoring results.