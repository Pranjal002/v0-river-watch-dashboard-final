# 🚀 RiverWatch - Quick Setup Guide

## Step 1: Configure API URL

Your backend developer will provide the API URL. Follow these steps to add it:

### In v0 Editor (Recommended)
1. Look at the left sidebar, find **Vars** section
2. Click **Vars** to open environment variables panel
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your API URL (e.g., `http://localhost:3001/api`)
4. Save

### Local Development (`.env.local`)
If running locally, create `.env.local` in the project root:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Step 2: Test Login

1. Click the **Version Box** in v0 to preview your app
2. You should see the beautiful login page
3. Try logging in with:
   - **Email**: `demo@example.com`
   - **Password**: `demo123`

(These are placeholder credentials - configure real ones in your backend)

## Step 3: Verify API Connection

If login fails, check these things:

### ✅ Checklist
- [ ] Is your backend running?
- [ ] Is the `NEXT_PUBLIC_API_URL` correctly set?
- [ ] Does your backend have the `/auth/login` endpoint?
- [ ] Is CORS enabled for `http://localhost:3000`?
- [ ] Check browser DevTools Network tab for failed requests

## Step 4: Populate Dashboard with Real Data

The dashboard is ready for real data! Your backend needs to return:

```javascript
// GET /api/stats (or similar)
{
  totalRivers: 12,
  totalStations: 45,
  activeUsers: 28,
  criticalAlerts: 3
}
```

## Step 5: Connect Management Pages

The following pages need API integration:

### User Management (`/home/users`)
- List users: `GET /api/users`
- Add user: `POST /api/users`
- Edit/Delete: `PUT/DELETE /api/users/:id`

### Rivers (`/home/rivers`)
- List rivers: `GET /api/rivers`
- Add river: `POST /api/rivers`
- Edit/Delete: `PUT/DELETE /api/rivers/:id`

### Stations (`/home/stations`)
- List stations: `GET /api/stations`
- Add station: `POST /api/stations`
- Edit/Delete: `PUT/DELETE /api/stations/:id`

## Using the API Client

All pages can use the pre-built API client:

```typescript
import { userAPI, riverAPI, stationAPI } from '@/lib/api';

// In a React component or Server Action
const users = await userAPI.getAll();
const rivers = await riverAPI.getAll();
const stations = await stationAPI.getAll();
```

See `/lib/api.ts` for all available methods.

## File Locations Reference

- **Login Page**: `/app/login/page.tsx`
- **Dashboard**: `/app/home/page.tsx`
- **Navigation**: `/components/sidebar.tsx`
- **API Client**: `/lib/api.ts`
- **Styles**: `/app/globals.css`
- **Full Guide**: `/API_SETUP.md`
- **Project Structure**: `/PROJECT_STRUCTURE.md`

## Common Issues & Solutions

### "API Connection Failed"
**Solution**: Check `NEXT_PUBLIC_API_URL` environment variable is set

### "401 Unauthorized"
**Solution**: Make sure your backend returns a valid JWT token on login

### "CORS Error"
**Solution**: Configure backend to allow requests from frontend origin

### "Demo credentials don't work"
**Solution**: Create real users in your backend database

## Next Steps

1. **Tell your backend developer:**
   - This frontend is ready for integration
   - All endpoints are documented in `/API_SETUP.md`
   - Demo endpoints with expected request/response format

2. **Connect the endpoints** as they're implemented

3. **Deploy** to Vercel for production

## Deploy to Vercel

### With GitHub
1. Push code to GitHub repository
2. In v0, click **Git** in sidebar → connect repository
3. Click **Publish** button
4. Set `NEXT_PUBLIC_API_URL` in Vercel environment variables

### Without GitHub
1. Click **...** (three dots) in top right
2. Select "Download ZIP"
3. Extract and deploy to Vercel with CLI or UI

## Support

- **API Issues**: See `API_SETUP.md`
- **UI/Design**: Check `PROJECT_STRUCTURE.md`
- **Code**: Review component source in your editor

Your RiverWatch dashboard is ready! 🌊
