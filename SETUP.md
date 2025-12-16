# Club Membership System - Complete Setup Guide

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## 🚀 Quick Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   npm run setup
   ```
   Or manually create `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/clubdb
   SESSION_SECRET=dev-secret-key-change-in-production
   CLIENT_ORIGIN=http://localhost:5173
   ```

4. **Start MongoDB**
   - **Local**: Make sure MongoDB service is running
   - **Atlas**: Use your connection string in `MONGO_URI`

5. **Start backend server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   🚀 Server started successfully!
   📍 Server running on http://localhost:5000
   💾 MongoDB: ✅ Connected
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will start on `http://localhost:5173`

## ✅ Verification

1. **Backend Health Check**
   - Visit: `http://localhost:5000/api/health`
   - Should return: `{"status":"ok","database":"connected",...}`

2. **Frontend Connection**
   - Open: `http://localhost:5173`
   - Register a new user
   - Login with your credentials

## 🔧 Configuration Details

### Backend Configuration

- **Port**: 5001 (configurable via `PORT` in `.env`)
- **Database**: MongoDB (local or Atlas)
- **Authentication**: Session-based (cookies)
- **CORS**: Configured for `http://localhost:5173`

### Frontend Configuration

- **Port**: 5173 (Vite default)
- **API Proxy**: `/api` → `http://localhost:5001/api`
- **Socket.io**: `/socket.io` → `http://localhost:5001/socket.io`

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
- Check if MongoDB is running: `mongosh` or check service status
- Verify `MONGO_URI` in `.env` file
- For Atlas: Check network access and connection string format

**Port Already in Use**
- Change `PORT` in `.env` file
- Or kill process: `npx kill-port 5000`

**CORS Errors**
- Ensure `CLIENT_ORIGIN` in `.env` matches frontend URL
- Default: `http://localhost:5173`

### Frontend Issues

**Cannot Connect to Backend**
- Verify backend is running on port 5000
- Check `vite.config.js` proxy configuration
- Check browser console for errors

**Authentication Not Working**
- Ensure `withCredentials: true` is set (already configured)
- Check backend session configuration
- Clear browser cookies and try again

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Members
- `GET /api/members` - List members
- `POST /api/members` - Create member
- `GET /api/members/:id` - Get member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Committees
- `GET /api/committees` - List committees
- `POST /api/committees` - Create committee
- `GET /api/committees/:id` - Get committee
- `PUT /api/committees/:id` - Update committee
- `DELETE /api/committees/:id` - Delete committee

## 🎯 Next Steps

1. Register your first user (becomes admin by default)
2. Login to access protected routes
3. Create members, events, and committees
4. Explore the enhanced UI with modern CSS

## 📝 Notes

- All protected routes require authentication
- First registered user gets admin role
- Session expires after 24 hours
- MongoDB database name: `clubdb` (configurable)

## 🆘 Need Help?

- Check `backend/README.md` for detailed backend docs
- Check `backend/QUICKSTART.md` for quick reference
- Verify all environment variables are set correctly
- Check console logs for detailed error messages

