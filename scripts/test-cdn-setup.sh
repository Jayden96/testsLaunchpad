#!/bin/bash

# Cloudflare CDN Setup and Testing Script
# This script helps verify CDN configuration and test image loading

echo "🚀 Cloudflare CDN Setup and Testing"
echo "=================================="

# Check environment variables
echo ""
echo "📋 Checking Environment Variables..."
echo "NEXT_PUBLIC_CDN_URL: ${NEXT_PUBLIC_CDN_URL:-'Not set'}"
echo "NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-'Not set'}"
echo "IMAGE_HOSTNAME: ${IMAGE_HOSTNAME:-'Not set'}"
echo ""

# Test DNS resolution
echo "🌐 Testing DNS Resolution..."
if [[ -n "$NEXT_PUBLIC_CDN_URL" ]]; then
    CDN_DOMAIN=$(echo $NEXT_PUBLIC_CDN_URL | sed 's|https\?://||')
    echo "Testing DNS for: $CDN_DOMAIN"
    
    if command -v dig &> /dev/null; then
        dig $CDN_DOMAIN
    elif command -v nslookup &> /dev/null; then
        nslookup $CDN_DOMAIN
    else
        echo "❌ No DNS tools available (dig/nslookup)"
    fi
else
    echo "⚠️  CDN_URL not set, skipping DNS test"
fi

echo ""
echo "🧪 Testing Image URLs..."

# Test localhost (if running locally)
if [[ "$NEXT_PUBLIC_API_URL" == *"localhost"* ]] || [[ "$NEXT_PUBLIC_API_URL" == *"127.0.0.1"* ]]; then
    echo "📱 Testing local API access..."
    if command -v curl &> /dev/null; then
        curl -I "http://localhost:1337/api/upload/files" 2>/dev/null || echo "❌ Strapi not running on localhost:1337"
    fi
fi

# Test CDN access
if [[ -n "$NEXT_PUBLIC_CDN_URL" ]]; then
    echo "🚀 Testing CDN access..."
    if command -v curl &> /dev/null; then
        CDN_TEST_URL="$NEXT_PUBLIC_CDN_URL/uploads/placeholder.jpg"
        echo "Testing: $CDN_TEST_URL"
        
        RESPONSE=$(curl -I "$CDN_TEST_URL" 2>/dev/null)
        HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP/" | awk '{print $2}')
        
        if [[ -n "$HTTP_CODE" ]]; then
            echo "CDN Response: HTTP $HTTP_CODE"
            if [[ "$HTTP_CODE" == "200" ]]; then
                echo "✅ CDN is accessible"
            elif [[ "$HTTP_CODE" == "404" ]]; then
                echo "⚠️  CDN is accessible but test file not found (expected)"
            else
                echo "⚠️  CDN returned HTTP $HTTP_CODE"
            fi
        else
            echo "❌ CDN not accessible"
        fi
    fi
fi

echo ""
echo "🔧 Manual Testing Steps:"
echo "1. Upload an image through Strapi admin"
echo "2. Check the image URL in the response"
echo "3. Verify the URL uses the CDN domain"
echo "4. Test the image loads in browser"
echo "5. Check Cloudflare cache headers"

echo ""
echo "🆘 Troubleshooting 400 Errors:"
echo "- Check Cloudflare cache rules"
echo "- Verify DNS propagation (can take 24-48 hours)"
echo "- Ensure images are uploaded to Cloudflare R2"
echo "- Check Cloudflare Polish settings"
echo "- Verify CORS headers"

echo ""
echo "📊 Performance Testing:"
echo "- Use browser dev tools to check load times"
echo "- Verify AVIF/WebP format delivery"
echo "- Check cache headers in response"
echo "- Test from different geographic locations"

# Function to test image loading from Next.js
test_next_image_loading() {
    echo ""
    echo "🧪 Testing Next.js Image Component..."
    
    if command -v node &> /dev/null; then
        # Create a simple test
        cat > /tmp/test-image.js << 'EOF'
const fs = require('fs');

// Check if image optimization config exists
const configPath = './next.config.mjs';
if (fs.existsSync(configPath)) {
    const config = fs.readFileSync(configPath, 'utf8');
    console.log('✅ Next.js config exists');
    
    if (config.includes('remotePatterns')) {
        console.log('✅ Image domains configured');
    } else {
        console.log('❌ No image domains configured');
    }
    
    if (config.includes('formats')) {
        console.log('✅ Image formats configured');
    } else {
        console.log('❌ No image formats configured');
    }
} else {
    console.log('❌ Next.js config not found');
}
EOF
        node /tmp/test-image.js
        rm /tmp/test-image.js
    fi
}

test_next_image_loading

echo ""
echo "✨ Setup Complete!"
echo "Review the output above and fix any issues found."