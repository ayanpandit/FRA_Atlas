# API Setup Guide for Village Directory

This guide explains how to obtain and configure the APIs used in the Village Directory feature.

## APIs Used

### 1. CoWIN API (For States & Districts)
- **Base URL**: `https://cdn-api.co-vin.in/api/v2/admin/location`
- **Purpose**: Fetch Indian states and districts
- **Authentication**: No API key required (public API)
- **Documentation**: https://apisetu.gov.in/public/marketplace/api/cowin

**Endpoints:**
- States: `GET /states`
- Districts: `GET /districts/{state_id}`

**Note**: This API may have CORS restrictions. The code includes fallback data for states.

### 2. Data.gov.in API (For Villages & Census Data)
- **Base URL**: `https://api.data.gov.in/resource/9115b89c-7a80-4f54-9b06-21086e0f0bd7`
- **Purpose**: Fetch village-level census data, sub-districts, and detailed information
- **Authentication**: API key required
- **Documentation**: https://data.gov.in/

**How to Get API Key:**
1. Visit https://data.gov.in/
2. Click on "Register" (top right)
3. Fill in the registration form with your details
4. Verify your email
5. Login to your account
6. Go to "My APIs" section
7. Request API access for the "Village Directory" dataset
8. You'll receive an API key via email (usually within 24-48 hours)

**Endpoints:**
- Sub-districts: `GET /?api-key={key}&format=json&filters[state.keyword]={state}&filters[district]={district}`
- Villages: `GET /?api-key={key}&format=json&filters[state.keyword]={state}&filters[district]={district}&filters[sub_district]={subdistrict}&limit=500`
- Village Details: `GET /?api-key={key}&format=json&filters[village_name]={village}&filters[district]={district}&filters[state.keyword]={state}`

### 3. OpenStreetMap Nominatim API (For Geocoding)
- **Base URL**: `https://nominatim.openstreetmap.org`
- **Purpose**: Convert village names to coordinates for map display
- **Authentication**: No API key required
- **Documentation**: https://nominatim.org/release-docs/develop/api/Overview/

**Usage Policy**: 
- Max 1 request per second
- Must include a User-Agent header
- For production, consider setting up your own Nominatim instance

## Environment Variables Setup

Add these to your `.env` file:

```env
# Village Directory APIs
VITE_COWIN_API_URL=https://cdn-api.co-vin.in/api/v2/admin/location
VITE_DATA_GOV_API_URL=https://api.data.gov.in/resource/9115b89c-7a80-4f54-9b06-21086e0f0bd7
VITE_DATA_GOV_API_KEY=your_api_key_here
```

**Important**: After updating `.env`, restart your development server for changes to take effect.

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. The code includes fallback state data that loads automatically
2. For production, consider setting up a backend proxy to handle API requests
3. Alternative: Use a CORS proxy (not recommended for production)

### API Rate Limits
- CoWIN API: No official rate limit, but use responsibly
- Data.gov.in: Rate limits vary by API key tier
- Nominatim: 1 request per second (strictly enforced)

### No Districts Showing
If you see "District data unavailable":
1. Check if the CoWIN API is accessible (may be blocked by CORS)
2. Verify your network connection
3. Check browser console for specific error messages
4. Consider implementing a backend proxy for production use

### Missing Village Data
If villages don't load:
1. Verify your Data.gov.in API key is correct
2. Check if the API key has access to the Village Directory dataset
3. Some states/districts may have incomplete data in the census database

## Alternative Data Sources

If the above APIs don't work, consider these alternatives:

1. **Local Government Directory (LGD)**: https://lgdirectory.gov.in/
   - Provides comprehensive administrative hierarchy
   - May require official approval for API access

2. **Census of India**: https://censusindia.gov.in/
   - Official census data
   - Available for download in bulk

3. **Custom Backend**: 
   - Host your own database with village data
   - Create custom API endpoints
   - Better control and no external dependencies

## Contact & Support

For API-related issues:
- CoWIN API: https://apisetu.gov.in/support
- Data.gov.in: support@data.gov.in
- OpenStreetMap: https://help.openstreetmap.org/

For application issues, contact your development team.
