# RiverWatch - Project Structure & Features

## 🌊 Project Overview

RiverWatch is a **River Water Level Management System** with a beautiful, responsive web dashboard for monitoring and managing river water levels, stations, and users.

## 📁 Project Structure

```
├── /app
│   ├── page.tsx                    # Root redirect (/ → /login or /home)
│   ├── layout.tsx                  # Root layout with metadata
│   ├── globals.css                 # Global styles with water-themed color system
│   ├── /login
│   │   └── page.tsx               # Beautiful login page
│   └── /home
│       ├── page.tsx               # Main dashboard
│       ├── /users
│       │   └── page.tsx           # User management page
│       ├── /rivers
│       │   └── page.tsx           # River management page
│       └── /stations
│           └── page.tsx           # Station management page
├── /components
│   └── sidebar.tsx                # Responsive sidebar navigation drawer
├── /lib
│   └── api.ts                     # Centralized API client with all endpoints
├── .env.example                   # Environment variables template
├── API_SETUP.md                   # API integration guide
└── PROJECT_STRUCTURE.md           # This file
```

## ✨ Key Features

### 1. **Beautiful Login Page** (`/app/login/page.tsx`)
- Modern, responsive design with water-themed gradient
- Email & password authentication
- API-connected authentication
- Error handling and loading states
- Demo credentials display
- Mobile-friendly layout

### 2. **Responsive Sidebar Navigation** (`/components/sidebar.tsx`)
- Left drawer navigation (fixed on desktop, toggle on mobile)
- Expandable River Management submenu
- Quick access to:
  - User Management
  - River Management (Rivers + Stations)
- Logout functionality
- Mobile hamburger menu

### 3. **Dashboard Home** (`/app/home/page.tsx`)
- Welcome greeting with user info
- Real-time statistics cards:
  - Total Rivers
  - Total Stations
  - Active Users
  - Critical Alerts
- Quick action buttons for common tasks
- Responsive grid layout

### 4. **Management Pages**
- **User Management** (`/home/users`) - Manage system users
- **Rivers** (`/home/rivers`) - Manage river locations
- **Stations** (`/home/stations`) - Manage monitoring stations

### 5. **API Client** (`/lib/api.ts`)
Pre-configured API functions for:
- **Authentication**: Login, logout, get current user
- **Users**: CRUD operations on users
- **Rivers**: CRUD operations on rivers
- **Stations**: CRUD operations, readings, and data submission

## 🎨 Design System

### Color Palette (Water-Themed)
- **Primary**: Cyan/Teal (`oklch(0.55 0.16 230)`)
- **Secondary**: Deeper Teal (`oklch(0.45 0.15 200)`)
- **Accent**: Turquoise (`oklch(0.62 0.18 210)`)
- **Background**: Light blue-gray
- **Foreground**: Dark navy

### Typography
- **Font**: Geist (system fonts for performance)
- **Headings**: Bold weights
- **Body**: Regular weight with proper line-height

### Responsive Breakpoints
- **Mobile**: Default styling
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)

## 🔐 Authentication Flow

1. **Root** (`/`) - Checks for auth token
   - If logged in → redirects to `/home`
   - If not logged in → redirects to `/login`

2. **Login** (`/login`) - User enters credentials
   - Calls API `/auth/login`
   - Stores JWT token & user data in localStorage
   - Redirects to `/home`

3. **Dashboard** (`/home`) - Protected route
   - Checks for auth token
   - Displays user info
   - All API calls include authorization header

4. **Logout** - Clears localStorage and redirects to `/login`

## 🔌 API Integration

The project is pre-configured with a complete API client:

```typescript
// Example usage
import { authAPI, userAPI, riverAPI, stationAPI } from '@/lib/api';

// Login
const { token, user } = await authAPI.login('email', 'password');

// Get all rivers
const rivers = await riverAPI.getAll();

// Get station readings
const readings = await stationAPI.getReadings('station-id');
```

### Environment Variables

Set your API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

See `API_SETUP.md` for complete endpoint specifications.

## 🚀 Getting Started

### 1. Setup
```bash
npm install
```

### 2. Configure API
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Visit
- http://localhost:3000/login - Login page
- http://localhost:3000/home - Dashboard (after login)

## 📱 Mobile Responsive

- **Mobile First**: Designs start with mobile optimization
- **Responsive Navigation**: Hamburger menu on mobile, sidebar on desktop
- **Adaptive Layouts**: Grid adjusts from 1 column (mobile) → 4 columns (desktop)
- **Touch-Friendly**: Large buttons and proper spacing

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Styling**: Tailwind CSS v4 with custom theme
- **UI Components**: shadcn/ui (Button, Card, Input)
- **Icons**: Lucide React
- **Authentication**: JWT (localStorage)
- **API**: Fetch API with custom wrapper

## 📝 Future Enhancements

1. **Data Visualization**
   - Charts for water level trends
   - Maps for station locations
   - Real-time alerts dashboard

2. **Advanced Features**
   - Historical data analysis
   - Predictive alerts
   - Multi-language support
   - Dark mode

3. **User Features**
   - Profile settings
   - Notification preferences
   - Export/reporting tools

4. **Mobile App**
   - Separate mobile app for data submission
   - Offline capability
   - Push notifications

## 🔄 Integration Checklist

- [ ] Backend API endpoints implemented
- [ ] JWT authentication working
- [ ] User management CRUD working
- [ ] River management CRUD working
- [ ] Station management CRUD working
- [ ] Dashboard statistics populated from API
- [ ] Data submission endpoint working
- [ ] Error handling tested
- [ ] CORS configured for frontend origin
- [ ] API deployed to production

## 📞 Support

For API integration issues or questions:
1. Check `API_SETUP.md` for endpoint specifications
2. Review `/lib/api.ts` for client implementation
3. Check browser console for error messages
4. Verify environment variables are set correctly

## 📄 License

RiverWatch - River Water Level Management System
