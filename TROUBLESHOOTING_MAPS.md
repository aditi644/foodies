# Troubleshooting: "This map can't load Google Maps correctly"

## What This Error Means

This error appears when Google Maps JavaScript API fails to initialize or load properly. It can happen for several reasons:

## Common Causes & Solutions

### 1. Missing API Key

**Symptom:** Error shows "API_KEY_MISSING" or map doesn't load at all

**Solution:**
1. Check if `.env` file exists in `frontend` directory
2. Verify the variable name is exactly: `VITE_GOOGLE_MAPS_API_KEY`
3. Make sure there are no spaces or quotes around the key
4. Restart your development server after adding the key

```env
# Correct format in .env file
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourActualKeyHere
```

### 2. Invalid API Key

**Symptom:** Error shows "API_KEY_INVALID" or "This API key is not authorized"

**Solution:**
1. Verify your API key is correct (copy-paste from Google Cloud Console)
2. Check that the key hasn't been deleted or regenerated
3. Ensure billing is enabled on your Google Cloud project
4. Verify "Maps JavaScript API" is enabled

### 3. API Not Enabled

**Symptom:** Error shows "ApiNotActivatedMapError"

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Library**
3. Search for "Maps JavaScript API"
4. Click **Enable**
5. Also enable "Directions API" if using route directions

### 4. Billing Not Enabled

**Symptom:** Watermark appears or map fails to load

**Solution:**
1. Go to Google Cloud Console > **Billing**
2. Link a billing account (credit card required)
3. Google provides $200 free credit per month
4. Most small apps stay within free tier

### 5. API Key Restrictions Too Strict

**Symptom:** Error shows "RefererNotAllowedMapError"

**Solution:**
1. Go to Google Cloud Console > **APIs & Services** > **Credentials**
2. Click on your API key
3. Under **Application restrictions**:
   - For development: Add `localhost:*` and `127.0.0.1:*`
   - For production: Add your domain (e.g., `yourdomain.com/*`)
4. Under **API restrictions**: Select "Don't restrict key" OR only allow:
   - Maps JavaScript API
   - Directions API
   - Geocoding API (if used)

### 6. Invalid Center Coordinates

**Symptom:** Map shows but is blank or shows wrong location

**Solution:**
1. Check that location data (latitude/longitude) is valid
2. Ensure coordinates are numbers, not strings
3. Verify coordinates are not (0, 0) - this is invalid
4. Check browser console for coordinate values

### 7. Network/Connection Issues

**Symptom:** Map loads slowly or not at all

**Solution:**
1. Check your internet connection
2. Verify you can access `maps.googleapis.com`
3. Check if firewall or VPN is blocking requests
4. Try in incognito/private browsing mode

## Step-by-Step Debugging

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for red error messages
4. Common errors:
   - `Google Maps JavaScript API error: RefererNotAllowedMapError`
   - `Google Maps JavaScript API error: ApiNotActivatedMapError`
   - `Google Maps JavaScript API error: InvalidKeyMapError`

### Step 2: Verify Environment Variable

In browser console, type:
```javascript
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
```

**Expected:** Should show your API key (not `undefined`)

**If undefined:**
- Check `.env` file exists in `frontend` directory
- Verify variable name is correct
- Restart dev server

### Step 3: Check Network Requests

1. Open DevTools > **Network** tab
2. Filter by "maps.googleapis.com"
3. Look for failed requests (red status)
4. Click on failed request to see error details

### Step 4: Test API Key Directly

Open this URL in browser (replace YOUR_API_KEY):
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap
```

**If it loads:** API key is valid
**If error:** Check the error message for specific issue

## Quick Fix Checklist

- [ ] `.env` file exists in `frontend` directory
- [ ] `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- [ ] Dev server restarted after adding API key
- [ ] Billing enabled in Google Cloud Console
- [ ] Maps JavaScript API is enabled
- [ ] Directions API is enabled (if using routes)
- [ ] API key restrictions allow your domain/localhost
- [ ] No typos in API key (copy-paste recommended)
- [ ] Internet connection is working
- [ ] Browser console checked for specific errors

## Still Not Working?

1. **Check the exact error message** in browser console
2. **Verify API key** in Google Cloud Console (not deleted/disabled)
3. **Try a new API key** - create a fresh one and test
4. **Check Google Cloud quotas** - ensure you haven't exceeded limits
5. **Test in different browser** - rule out browser-specific issues

## Alternative: Use Mapbox (If Google Maps Continues to Fail)

If Google Maps setup is too complex, you can switch to Mapbox:

1. Sign up at [mapbox.com](https://www.mapbox.com/)
2. Get your access token
3. Install: `npm install mapbox-gl`
4. Replace Google Maps components with Mapbox

## Need More Help?

- Check browser console for specific error codes
- Review [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- See `GOOGLE_MAPS_SETUP.md` for complete setup guide

