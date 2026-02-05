# 🏗️ RiverWatch - Architecture Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     RiverWatch System                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐         ┌──────────────────────┐    │
│  │   Web Dashboard      │         │  Mobile App          │    │
│  │   (This Project)     │         │  (Future)            │    │
│  │                      │         │                      │    │
│  │  ✓ Admin Interface   │         │  • Data Entry        │    │
│  │  ✓ Monitoring       │         │  • Offline Sync      │    │
│  │  ✓ User Management  │         │  • Location Tracking │    │
│  └──────────┬───────────┘         └──────────┬───────────┘    │
│             │                                │                 │
│             └────────────────┬───────────────┘                 │
│                              │                                 │
│                    ┌─────────▼─────────┐                      │
│                    │   Backend API     │                      │
│                    │   (Your Server)   │                      │
│                    │                   │                      │
│                    │  • Authentication │                      │
│                    │  • User Mgmt      │                      │
│                    │  • River Mgmt     │                      │
│                    │  • Station Mgmt   │                      │
│                    │  • Data Storage   │                      │
│                    └─────────┬─────────┘                      │
│                              │                                 │
│                    ┌─────────▼─────────┐                      │
│                    │   Database        │                      │
│                    │                   │                      │
│                    │  • Users          │                      │
│                    │  • Rivers         │                      │
│                    │  • Stations       │                      │
│                    │  • Readings       │                      │
│                    └───────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (This Project)

```
/app
├── page.tsx (Root Redirect)
│   └── Checks auth → /login or /home
│
├── login/
│   └── page.tsx (Login Page)
│       ├── Form submission
│       ├── API: authAPI.login()
│       └── Stores token & user
│
├── home/
│   ├── page.tsx (Dashboard)
│   │   ├── Displays stats
│   │   ├── Quick actions
│   │   └── User info
│   │
│   ├── users/
│   │   └── page.tsx (User Management)
│   │       ├── List users (userAPI.getAll())
│   │       ├── Create user (userAPI.create())
│   │       ├── Edit user (userAPI.update())
│   │       └── Delete user (userAPI.delete())
│   │
│   ├── rivers/
│   │   └── page.tsx (River Management)
│   │       ├── List rivers (riverAPI.getAll())
│   │       ├── Create river (riverAPI.create())
│   │       ├── Edit river (riverAPI.update())
│   │       └── Delete river (riverAPI.delete())
│   │
│   └── stations/
│       └── page.tsx (Station Management)
│           ├── List stations (stationAPI.getAll())
│           ├── Create station (stationAPI.create())
│           ├── Edit station (stationAPI.update())
│           ├── Delete station (stationAPI.delete())
│           ├── Get readings (stationAPI.getReadings())
│           └── Submit data (stationAPI.submitData())
│
/components
├── sidebar.tsx
│   ├── Navigation menu
│   ├── User logout
│   ├── Responsive drawer
│   └── Mobile menu toggle
│
/lib
├── api.ts
│   ├── authAPI
│   ├── userAPI
│   ├── riverAPI
│   ├── stationAPI
│   └── Generic apiCall() wrapper
│
/app
└── globals.css
    └── Water-themed color system
```

## Data Flow Diagram

### Authentication Flow
```
User Input (Email/Password)
    │
    ▼
handleLogin() function
    │
    ▼
apiCall('/auth/login') in /lib/api.ts
    │
    ▼
Backend API: POST /auth/login
    │
    ├─ Success ──▶ { token, user }
    │                  │
    │                  ▼
    │           localStorage.setItem('authToken')
    │           localStorage.setItem('user')
    │                  │
    │                  ▼
    │           router.push('/home')
    │                  │
    │                  ▼
    │           Dashboard rendered
    │
    └─ Error ───▶ setError() ──▶ Show error message
```

### API Call Flow
```
Component needs data
    │
    ▼
Call: riverAPI.getAll()
    │
    ▼
apiCall('/rivers') in /lib/api.ts
    │
    ├─ Get token from localStorage
    ├─ Add to Authorization header
    └─ Make fetch request
    │
    ▼
Backend: GET /api/rivers
    │
    ├─ Validate token
    ├─ Query database
    └─ Return JSON
    │
    ▼
Response handling
    │
    ├─ 401 ───▶ Clear auth ──▶ Redirect to /login
    ├─ 4xx/5xx ▶ throw Error
    └─ 200 ───▶ Return data
    │
    ▼
Component renders with data
```

## Component Hierarchy

```
RootLayout (/app/layout.tsx)
├── Page (/)
│   └── Redirect logic
│
├── LoginPage (/app/login/page.tsx)
│   └── Standalone form
│
└── HomePage (/app/home/page.tsx)
    ├── Sidebar (shared component)
    └── Main content
        ├── Header
        ├── Stats cards
        └── Quick actions
```

## State Management

### Authentication State
- **Storage**: localStorage
- **Keys**: `authToken`, `user`
- **When**: Set on login, cleared on logout
- **Used by**: All protected pages

### Component State
- **Dashboard**: loading, stats
- **Login**: email, password, loading, error
- **Sidebar**: isOpen (mobile), expandedRiver
- **Pages**: loading state for data

## API Integration Points

### 1. Login Page
```typescript
// /app/login/page.tsx
handleLogin() →
  fetch(`${API_URL}/auth/login`) →
  Store token/user →
  Redirect to /home
```

### 2. Dashboard
```typescript
// /app/home/page.tsx
useEffect() →
  Check auth →
  Fetch stats (custom endpoint or UI-only for now) →
  Display stats cards
```

### 3. Management Pages
```typescript
// /app/home/[section]/page.tsx
useEffect() →
  Check auth →
  Fetch data (userAPI/riverAPI/stationAPI) →
  Display table/list →
  Handle create/edit/delete actions
```

## Security Architecture

```
┌─────────────────────────────────────┐
│     Web Browser (Client)            │
├─────────────────────────────────────┤
│  • localStorage (JWT token)         │
│  • Session data (user info)         │
│  • Protected routes (auth checks)   │
└────────────┬────────────────────────┘
             │ HTTPS/CORS
             ▼
┌─────────────────────────────────────┐
│     Backend API Server              │
├─────────────────────────────────────┤
│  • Validate JWT token               │
│  • Check user permissions           │
│  • Database queries                 │
│  • Return filtered data             │
└────────────┬────────────────────────┘
             │ Secure Connection
             ▼
┌─────────────────────────────────────┐
│     Database                        │
├─────────────────────────────────────┤
│  • User data                        │
│  • River/Station data               │
│  • Water level readings             │
│  • Transaction logs                 │
└─────────────────────────────────────┘
```

## Environment Variables Flow

```
.env.local / v0 Vars
    │
    ├─ NEXT_PUBLIC_API_URL
    │   └─ Used in /lib/api.ts
    │       └─ All API calls use this base URL
    │
    └─ Other future variables
```

## Mobile vs Desktop Layout

### Mobile (< 768px)
```
┌─────────────────────┐
│  Menu Toggle (✕)    │
├─────────────────────┤
│                     │
│  Header             │
│                     │
├─────────────────────┤
│  Content (Full)     │
│  (No sidebar)       │
│                     │
│                     │
└─────────────────────┘

Drawer when opened:
┌─────────────────┐
│ Sidebar (80%)   │ Content (20%)
│                 │
└─────────────────┘
```

### Desktop (≥ 768px)
```
┌──────────────┬──────────────────────────┐
│              │                          │
│  Sidebar     │      Header              │
│  (Fixed)     │                          │
│              ├──────────────────────────┤
│              │                          │
│              │  Content (Main)          │
│              │                          │
│              │                          │
└──────────────┴──────────────────────────┘
```

## Color System Architecture

```
/app/globals.css
    │
    ├─ Root variables (light mode)
    │   ├─ --primary (cyan)
    │   ├─ --secondary (teal)
    │   ├─ --accent (turquoise)
    │   ├─ --foreground (dark)
    │   ├─ --background (light)
    │   └─ --destructive (red)
    │
    ├─ Dark mode variables (future)
    │   └─ Darker versions of above
    │
    └─ Tailwind theme mapping
        ├─ @theme inline
        └─ Applies to all components
```

## Performance Considerations

1. **Code Splitting**: Each page loads independently
2. **Lazy Loading**: Sidebar components load on demand
3. **Image Optimization**: Next.js automatically optimizes images
4. **CSS**: Tailwind purges unused styles
5. **API Caching**: Consider SWR for data revalidation

## Error Handling Flow

```
API Call
    │
    ├─ Network Error ──▶ Console log ──▶ Show generic message
    ├─ 401 (Unauthorized) ──▶ Clear auth ──▶ Redirect to login
    ├─ 4xx (Client Error) ──▶ Extract message ──▶ Show to user
    ├─ 5xx (Server Error) ──▶ Generic message ──▶ Log to console
    └─ Success ──▶ Return parsed JSON
```

---

This architecture supports:
- ✅ Scalability (new endpoints easily added)
- ✅ Maintainability (clear separation of concerns)
- ✅ Security (JWT auth, protected routes)
- ✅ Performance (optimized builds, lazy loading)
- ✅ Extensibility (ready for future features)
