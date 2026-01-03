# Google Maps API Setup Guide

## Why "For development purposes only" appears

This watermark appears when:
1. **API key is missing** - Not set in `.env` file
2. **API key is invalid** - Wrong key or expired
3. **Billing not enabled** - Google requires billing for production use
4. **API restrictions too strict** - Key restrictions block your domain
5. **Required APIs not enabled** - Maps JavaScript API or Directions API not enabled

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your project name

### 2. Enable Required APIs

1. Go to **APIs & Services** > **Library**
2. Search and enable:
   - ✅ **Maps JavaScript API** (Required)
   - ✅ **Directions API** (Required for route directions)
   - ✅ **Geocoding API** (Optional, for address conversion)

### 3. Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API key

### 4. Configure API Key Restrictions (Recommended)

1. Click on your API key to edit it
2. Under **Application restrictions**:
   - For development: Select **HTTP referrers**
   - Add: `localhost:*` and `127.0.0.1:*`
   - For production: Add your domain (e.g., `yourdomain.com/*`)
3. Under **API restrictions**:
   - Select **Restrict key**
   - Choose: **Maps JavaScript API** and **Directions API**
4. Click **Save**

### 5. Enable Billing

⚠️ **Important**: Google Maps requires billing to be enabled, even for free tier usage.

1. Go to **Billing** in Google Cloud Console
2. Link a billing account (credit card required)
3. Don't worry - Google provides $200 free credit per month
4. Most small apps stay within free tier

### 6. Add API Key to Your Project

1. Create/update `.env` file in `frontend` directory:
```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

2. Restart your development server:
```bash
npm run dev
```

### 7. Verify Setup

1. Check browser console for any errors
2. Map should load without watermark
3. If watermark still appears, check:
   - API key is correct in `.env`
   - Billing is enabled
   - APIs are enabled
   - Restrictions allow your domain

## Troubleshooting

### Watermark Still Appears

1. **Check API Key**:
   ```bash
   # In browser console
   console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
   ```
   Should show your key (not undefined)

2. **Check Billing**:
   - Go to Google Cloud Console > Billing
   - Ensure billing account is linked and active

3. **Check API Status**:
   - Go to APIs & Services > Dashboard
   - Verify Maps JavaScript API shows "Enabled"

4. **Check Restrictions**:
   - Ensure your domain/localhost is in allowed referrers
   - For localhost, use: `localhost:*` and `127.0.0.1:*`

### Map Not Loading

1. **Check Console Errors**:
   - Open browser DevTools (F12)
   - Look for red errors in Console tab
   - Common errors:
     - "This API key is not authorized"
     - "RefererNotAllowedMapError"
     - "ApiNotActivatedMapError"

2. **Verify Environment Variable**:
   - Make sure `.env` file is in `frontend` directory
   - Variable name must be exactly: `VITE_GOOGLE_MAPS_API_KEY`
   - Restart dev server after adding/updating `.env`

3. **Check Network Tab**:
   - Open DevTools > Network tab
   - Look for requests to `maps.googleapis.com`
   - Check if they return 200 (success) or error codes

### Common Error Messages

| Error | Solution |
|-------|----------|
| "RefererNotAllowedMapError" | Add your domain to API key restrictions |
| "ApiNotActivatedMapError" | Enable Maps JavaScript API in Google Cloud |
| "This API key is not authorized" | Check API key restrictions and enabled APIs |
| "BillingNotEnabledMapError" | Enable billing in Google Cloud Console |

## Free Tier Limits

Google Maps provides:
- **$200 free credit per month**
- **28,000 map loads per month** (free)
- **40,000 directions requests per month** (free)
- Most small apps stay within free tier

## Production Deployment

For production:

1. **Update API Key Restrictions**:
   - Remove `localhost` referrers
   - Add your production domain: `yourdomain.com/*`
   - Add `https://yourdomain.com/*`

2. **Set Usage Limits**:
   - Go to APIs & Services > Quotas
   - Set daily limits to prevent unexpected charges

3. **Monitor Usage**:
   - Check Google Cloud Console regularly
   - Set up billing alerts

## Alternative: Use Mapbox (Optional)

If you prefer not to use Google Maps:

1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Get your access token
3. Install: `npm install mapbox-gl`
4. Replace Google Maps components with Mapbox

## Need Help?

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Cloud Support](https://cloud.google.com/support)
- Check browser console for specific error messages

