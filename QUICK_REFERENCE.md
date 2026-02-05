# 📋 RiverWatch - Quick Reference Card

## 🚀 Start Here

1. **Set API URL** → v0 Vars: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
2. **Preview** → Click Version Box to see login page
3. **Share with backend dev** → Send `/API_SETUP.md`

---

## 📍 File Locations

| What | Where |
|------|-------|
| Login page | `/app/login/page.tsx` |
| Dashboard | `/app/home/page.tsx` |
| Navigation | `/components/sidebar.tsx` |
| API client | `/lib/api.ts` |
| Styling | `/app/globals.css` |
| API docs | `/API_SETUP.md` |
| Setup guide | `/SETUP_GUIDE.md` |

---

## 🔑 Key Features

✅ Beautiful water-themed design  
✅ Fully responsive (mobile/tablet/desktop)  
✅ JWT authentication  
✅ Protected routes  
✅ Pre-built API client  
✅ Sidebar navigation with submenus  
✅ Dashboard with stat cards  
✅ Management pages (users, rivers, stations)  

---

## 🌐 Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Redirect | No |
| `/login` | Login page | No |
| `/home` | Dashboard | Yes |
| `/home/users` | User management | Yes |
| `/home/rivers` | River management | Yes |
| `/home/stations` | Station management | Yes |

---

## 🔌 Using the API Client

```typescript
import { authAPI, userAPI, riverAPI, stationAPI } from '@/lib/api';

// Login
await authAPI.login('email', 'password');

// Get data
const users = await userAPI.getAll();
const rivers = await riverAPI.getAll();
const stations = await stationAPI.getAll();

// Create
await userAPI.create({ name: 'John', email: 'john@example.com' });

// Update
await riverAPI.update('river-id', { name: 'New Name' });

// Delete
await stationAPI.delete('station-id');

// Station-specific
const readings = await stationAPI.getReadings('station-id');
await stationAPI.submitData('station-id', { waterLevel: 12.5 });
```

---

## 🎨 Colors Used

| Purpose | Color | Code |
|---------|-------|------|
| Primary | Cyan | `oklch(0.55 0.16 230)` |
| Secondary | Teal | `oklch(0.45 0.15 200)` |
| Accent | Turquoise | `oklch(0.62 0.18 210)` |
| Background | Light blue-gray | `oklch(0.98 0.002 220)` |
| Foreground | Dark navy | `oklch(0.18 0.04 220)` |
| Error | Red | `oklch(0.60 0.22 27)` |

---

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 768px | Single column, hamburger menu |
| Tablet | 768px - 1024px | 2 columns, drawer |
| Desktop | ≥ 1024px | Full layout, fixed sidebar |

---

## 🔐 Authentication Flow

1. User visits `/` → redirects to `/login` (if not logged in)
2. Enters email & password → calls `POST /api/auth/login`
3. Backend returns `{ token, user }`
4. Token stored in localStorage
5. Redirects to `/home`
6. All API calls include `Authorization: Bearer {token}`
7. Click logout → clears token → redirects to `/login`

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Login fails | Check `NEXT_PUBLIC_API_URL` is set |
| Page loads forever | Check auth token in localStorage |
| CORS error | Configure backend CORS for `http://localhost:3000` |
| Demo creds don't work | These are placeholders - create real users in backend |
| "API Connection Failed" | Ensure backend is running at configured URL |

---

## 📊 Stats Cards (Dashboard)

Currently showing placeholder values:
- **Total Rivers**: 12 (replace with `GET /api/stats`)
- **Total Stations**: 45
- **Active Users**: 28
- **Critical Alerts**: 3

Update in `/app/home/page.tsx` `fetchDashboardData()` function.

---

## 🛠️ Customization Tips

### Change Colors
Edit `/app/globals.css` - update `--primary`, `--secondary`, etc.

### Add New Pages
Create `/app/home/[new-section]/page.tsx`

### Add API Endpoints
Add methods to `/lib/api.ts` following the pattern

### Modify Forms
Edit individual page files (login, management pages)

### Update Sidebar
Edit `/components/sidebar.tsx` - add/remove menu items

---

## 🚢 Deployment Checklist

- [ ] Backend API implemented and tested
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel
- [ ] CORS configured on backend
- [ ] Test login flow end-to-end
- [ ] Test all management pages with real data
- [ ] Test on mobile devices
- [ ] Verify all error handling works
- [ ] Push to GitHub
- [ ] Deploy to Vercel

---

## 📞 Support Resources

| Need | Where |
|------|-------|
| API endpoints | `/API_SETUP.md` |
| Architecture | `/ARCHITECTURE.md` |
| Full guide | `/IMPLEMENTATION_SUMMARY.md` |
| Setup steps | `/SETUP_GUIDE.md` |
| Project structure | `/PROJECT_STRUCTURE.md` |

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Lint code
npm run lint
```

---

## 🎯 What's Next

### For Backend Dev
1. Read `/API_SETUP.md`
2. Implement endpoints
3. Test with frontend

### For Frontend Dev
1. Add real data to dashboard
2. Build management page tables
3. Add create/edit/delete forms
4. Add data visualization

### For DevOps
1. Deploy backend
2. Configure CORS
3. Set environment variables
4. Deploy frontend to Vercel

---

## 📝 Demo Credentials

Email: `demo@example.com`  
Password: `demo123`  

*(Create real users in your backend)*

---

## 🎉 You're All Set!

Everything is ready to go. Your backend developer can start implementing the endpoints listed in `/API_SETUP.md`. Questions? Check the documentation files listed above.

**Happy coding! 🌊**
