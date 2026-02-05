# RiverWatch - API Integration Guide

## Overview

RiverWatch is a river water level management system with two main components:
1. **Website** (this project) - Admin dashboard and monitoring interface
2. **App** - Station users input data (rain gauge, water levels, etc.)

This frontend is configured to connect to your backend API. Follow these steps to set up the API integration.

## API Configuration

### Environment Variables

Create a `.env.local` file in the project root with your API URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For production:
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

**Note:** Use `NEXT_PUBLIC_` prefix to expose the variable to the browser. Keep any sensitive keys as non-public environment variables.

## API Endpoints Required

Your backend should implement the following endpoints:

### Authentication
- `POST /auth/login` - User login
  ```json
  Request: { "email": "user@example.com", "password": "password" }
  Response: { "token": "jwt_token", "user": { "id": "...", "name": "...", "email": "..." } }
  ```

- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### User Management
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### River Management
- `GET /rivers` - Get all rivers
- `GET /rivers/:id` - Get river by ID
- `POST /rivers` - Create new river
- `PUT /rivers/:id` - Update river
- `DELETE /rivers/:id` - Delete river

### Station Management
- `GET /stations` - Get all stations
- `GET /stations/:id` - Get station by ID
- `POST /stations` - Create new station
- `PUT /stations/:id` - Update station
- `DELETE /stations/:id` - Delete station
- `GET /stations/:id/readings` - Get station readings
- `POST /stations/:id/data` - Submit water level and rain gauge data

## API Client Usage

The project includes a pre-configured API client in `/lib/api.ts`. Use it like this:

```typescript
import { authAPI, userAPI, riverAPI, stationAPI } from '@/lib/api';

// Authentication
const loginResponse = await authAPI.login('email@example.com', 'password');
const currentUser = await authAPI.getCurrentUser();

// Users
const users = await userAPI.getAll();
const newUser = await userAPI.create({ name: 'John', email: 'john@example.com' });

// Rivers
const rivers = await riverAPI.getAll();
const newRiver = await riverAPI.create({ name: 'Amazon', location: 'South America' });

// Stations
const stations = await stationAPI.getAll();
const readings = await stationAPI.getReadings('station-id');
const data = await stationAPI.submitData('station-id', { 
  waterLevel: 12.5, 
  rainGauge: 25.3 
});
```

## Authentication Flow

1. User logs in via `/login` page
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is automatically included in all subsequent API requests
5. If token is invalid (401), user is redirected to login

## Demo Credentials

For testing, use these credentials (configure these in your backend):
- Email: `demo@example.com`
- Password: `demo123`

## Error Handling

The API client automatically handles:
- 401 Unauthorized responses (redirects to login)
- 4xx and 5xx errors (throws descriptive error messages)
- Network errors

## Building with the API

The dashboard includes placeholder pages for:
- `/home` - Main dashboard
- `/home/users` - User management
- `/home/rivers` - River management
- `/home/stations` - Station management

Integrate with the API endpoints to populate these pages with real data.

## Testing Locally

1. Install dependencies: `npm install`
2. Set `NEXT_PUBLIC_API_URL=http://localhost:3001/api` in `.env.local`
3. Run development server: `npm run dev`
4. Navigate to http://localhost:3000/login

## Troubleshooting

**CORS Issues:** If you see CORS errors, make sure your backend is configured to accept requests from `http://localhost:3000`

**API Connection Failed:** Check that:
- Backend server is running
- `NEXT_PUBLIC_API_URL` is correctly set
- Network tab in browser DevTools shows the request
- API returns proper JSON responses

**Authentication Loop:** If redirected to login repeatedly:
- Check browser console for errors
- Verify token is being stored in localStorage
- Ensure backend returns valid JWT tokens

## Next Steps

1. Share API endpoint specifications with your frontend team
2. Implement the required endpoints in your backend
3. Test API calls using the provided client
4. Build out the dashboard pages with real data
