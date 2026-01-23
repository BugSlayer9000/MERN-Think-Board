# ThinkBoard MERN Application - System Architecture Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Data Flow](#data-flow)
4. [Important Notes](#important-notes)
5. [API Endpoints](#api-endpoints)
6. [Security Features](#security-features)

---

## 🎯 System Overview

**ThinkBoard** is a full-stack note-taking application built with the MERN stack (MongoDB, Express, React, Node.js). It features rate limiting, real-time updates, and a modern UI.

### Tech Stack
- **Frontend**: React 19.2 + React Router 7 + TailwindCSS + DaisyUI
- **Backend**: Express 5.2 + Mongoose 9.1
- **Database**: MongoDB (Atlas)
- **Rate Limiting**: Upstash Redis
- **Styling**: TailwindCSS with DaisyUI "Forest" theme

---

## 🏗️ Architecture Layers

### 1. Client Layer (React Frontend)

#### Components Structure
```
App.jsx (Router)
├── HomePage
│   ├── Navbar
│   ├── NoteCard (multiple)
│   ├── RateLimitedUI (conditional)
│   └── NotesNotFound (conditional)
├── CreatePage
│   └── Navbar
└── NoteDetailPage
    └── Navbar
```

#### State Management
- **HomePage**: 
  - `notes[]` - Array of note objects
  - `loading` - Boolean for loading state
  - `isRateLimited` - Boolean for rate limit status

- **CreatePage**:
  - `title` - String for note title
  - `content` - String for note content
  - `loading` - Boolean for submit state

- **NoteDetailPage**:
  - `note` - Single note object
  - `loading` - Boolean for fetch state
  - `saving` - Boolean for save state

#### Important Frontend Notes
1. **Environment Detection**: Axios base URL changes based on environment
   - Development: `http://localhost:5001/api`
   - Production: `/api` (same origin)

2. **Optimistic Updates**: When deleting notes, the UI updates immediately using filter
   ```javascript
   setNotes((prev) => prev.filter((note) => note._id !== id))
   ```

3. **Object Spread Pattern**: Used extensively for state updates
   ```javascript
   setNote({ ...note, title: e.target.value })
   ```

---

### 2. Network Layer

#### Axios Configuration
```javascript
// Located at: frontend/src/lib/axios.js
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5001/api" 
  : "/api"
```

**⚠️ TYPO ALERT**: There's a typo in the code - "devolopment" should be "development"

---

### 3. Server Layer (Express Backend)

#### Middleware Stack (Execution Order)
1. **CORS** - Handles cross-origin requests (development only)
2. **express.json()** - Parses JSON request bodies
3. **Rate Limiter** - Upstash Redis sliding window (100 req/60s)
4. **Routes** - Note CRUD operations

#### Important Backend Notes

1. **Rate Limiting**:
   - Uses Upstash Redis for distributed rate limiting
   - Sliding window: 100 requests per 60 seconds
   - Returns 429 status when limit exceeded
   - Global rate limit (all users share the same limit)

2. **Environment-Based CORS**:
   ```javascript
   if (process.env.NODE_ENV !== "production") {
     app.use(cors({ origin: "http://localhost:5173" }))
   }
   ```

3. **Static File Serving** (Production):
   - Serves built React app from `../frontend/dist`
   - Catch-all route sends `index.html` for client-side routing

---

### 4. Data Layer (MongoDB)

#### Note Schema
```javascript
{
  title: String (required),
  content: String (required),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated),
  _id: ObjectId (auto-generated)
}
```

#### Mongoose Features Used
- Automatic timestamp management
- Schema validation
- Model methods (find, findById, save, etc.)

---

## 🔄 Data Flow

### Creating a Note
```
User Input (CreatePage)
  → Form Submit Handler
    → Axios POST /api/notes
      → Rate Limiter Middleware
        → Express JSON Parser
          → Controller: createNote()
            → Mongoose: new Note().save()
              → MongoDB: Insert Document
                → Response 201 Created
                  → Toast Success
                    → Navigate to HomePage
```

### Reading Notes
```
HomePage Mount
  → useEffect Hook
    → Axios GET /api/notes
      → Rate Limiter Check
        → Controller: getAllNotes()
          → Mongoose: Note.find().sort({createdAt: -1})
            → MongoDB: Query Documents
              → Response 200 OK
                → setNotes(data)
                  → Render NoteCards
```

### Updating a Note
```
User Edit (NoteDetailPage)
  → Input onChange
    → setNote({...note, field: value})
      → Save Button Click
        → Axios PUT /api/notes/:id
          → Rate Limiter Check
            → Controller: updateNote()
              → Mongoose: findByIdAndUpdate()
                → MongoDB: Update Document
                  → Response 200 OK
                    → Toast Success
                      → Navigate to HomePage
```

### Deleting a Note
```
Delete Button Click
  → window.confirm()
    → Axios DELETE /api/notes/:id
      → Rate Limiter Check
        → Controller: deleteNote()
          → Mongoose: findByIdAndDelete()
            → MongoDB: Remove Document
              → Response 200 OK
                → Optimistic UI Update
                  → Toast Success
```

---

## ⚠️ Important Notes

### Critical Issues & Bugs

1. **Environment Variable Typo**:
   - Location: `frontend/src/lib/axios.js`
   - Current: `MODE === "devolopment"`
   - Should be: `MODE === "development"`
   - Impact: API calls will always use `/api` base URL

2. **Grid Layout Responsive Issue**:
   - Location: `HomePage.jsx`
   - Current: `grid-cols-3 md:grid-cols-2 lg:grid-cols-3`
   - Issue: 3 columns on mobile is too cramped
   - Suggested: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

3. **Global Rate Limit**:
   - Current implementation limits ALL users collectively
   - Better: Use IP-based or user-based rate limiting
   - Current: `ratelimit.limit("my-rate-limit")`
   - Suggested: `ratelimit.limit(req.ip)` or `ratelimit.limit(userId)`

### Security Considerations

1. **No Authentication**: 
   - Anyone can create/edit/delete any note
   - No user ownership of notes
   - Consider adding JWT or session-based auth

2. **No Input Sanitization**:
   - Direct database insertion of user input
   - Vulnerable to NoSQL injection
   - Consider adding express-validator or joi

3. **No HTTPS Enforcement**:
   - Production should enforce HTTPS
   - Add helmet.js for security headers

4. **CORS in Production**:
   - CORS disabled in production (same-origin only)
   - Fine for monolith deployment
   - Problem if frontend is on different domain

### Performance Optimizations

1. **Database Indexes**:
   - Add index on `createdAt` for faster sorting
   - Current query: `.sort({createdAt: -1})` does full collection scan

2. **No Pagination**:
   - Fetches all notes at once
   - Will become slow with many notes
   - Consider implementing pagination or infinite scroll

3. **No Caching**:
   - Every page load hits the database
   - Consider implementing Redis caching for read operations

### UX Improvements Needed

1. **No Loading Skeletons**:
   - Only shows "Loading notes..." text
   - Better: Skeleton cards while loading

2. **No Error Boundaries**:
   - App will crash on unhandled errors
   - Add React Error Boundaries

3. **No Offline Support**:
   - No service worker or offline detection
   - Consider PWA implementation

---

## 🔌 API Endpoints

### GET /api/notes
- **Description**: Fetch all notes, sorted by newest first
- **Response**: `200 OK` with array of note objects
- **Error**: `500 Internal Server Error` or `429 Too Many Requests`

### GET /api/notes/:id
- **Description**: Fetch single note by ID
- **Response**: `200 OK` with note object
- **Error**: `404 Not Found`, `500 Internal Server Error`, `429 Too Many Requests`

### POST /api/notes
- **Description**: Create new note
- **Body**: `{ title: string, content: string }`
- **Response**: `201 Created` with success message
- **Error**: `500 Internal Server Error`, `429 Too Many Requests`

### PUT /api/notes/:id
- **Description**: Update existing note
- **Body**: `{ title: string, content: string }`
- **Response**: `200 OK` with success message
- **Error**: `404 Not Found`, `500 Internal Server Error`, `429 Too Many Requests`

### DELETE /api/notes/:id
- **Description**: Delete note by ID
- **Response**: `200 OK` with success message
- **Error**: `404 Not Found`, `500 Internal Server Error`, `429 Too Many Requests`

---

## 🔒 Security Features

### Implemented
1. ✅ Rate limiting (Upstash Redis)
2. ✅ Environment-based CORS
3. ✅ MongoDB connection string in env variables

### Missing (Recommended)
1. ❌ Authentication & Authorization
2. ❌ Input validation & sanitization
3. ❌ CSRF protection
4. ❌ XSS prevention
5. ❌ SQL/NoSQL injection prevention
6. ❌ Security headers (helmet.js)
7. ❌ Request size limits
8. ❌ Password hashing (if auth added)

---

## 🚀 Deployment Notes

### Build Process
```bash
# Root package.json scripts
npm run build  # Installs deps and builds frontend
npm start      # Starts backend server
```

### Environment Variables Needed
```env
# Backend
MONGO_DB=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5001
NODE_ENV=production
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB connection string
- [ ] Set Upstash Redis credentials
- [ ] Build frontend (`npm run build`)
- [ ] Test all API endpoints
- [ ] Verify rate limiting works
- [ ] Check static file serving
- [ ] Monitor memory usage

---

## 📊 Monitoring & Debugging

### Key Metrics to Monitor
1. **Rate Limit Hits**: How often users hit 429 errors
2. **Response Times**: MongoDB query performance
3. **Error Rates**: 500 errors from server
4. **Memory Usage**: Node.js heap size
5. **Database Connections**: Mongoose pool usage

### Debugging Tips
1. **Frontend**: Check browser console and Network tab
2. **Backend**: Check server logs for errors
3. **Database**: Use MongoDB Atlas monitoring
4. **Rate Limiting**: Check Upstash Redis dashboard

---

## 🎨 Styling System

### TailwindCSS + DaisyUI
- **Theme**: Forest (green/dark theme)
- **Primary Color**: `#00FF9D` (bright green accent)
- **Background**: Radial gradient from black to green
- **Components**: Cards, buttons, inputs from DaisyUI

### Key Classes Used
- `card`, `card-body`, `card-title` - Card components
- `btn`, `btn-primary`, `btn-ghost` - Buttons
- `input`, `textarea`, `form-control` - Forms
- `line-clamp-3` - Text truncation

---

## 📝 Code Quality Notes

### Good Practices
1. ✅ Modular component structure
2. ✅ Separate route and controller logic
3. ✅ Environment-based configuration
4. ✅ Consistent error handling
5. ✅ User feedback with toast notifications

### Areas for Improvement
1. ⚠️ Add PropTypes or TypeScript
2. ⚠️ Extract magic numbers to constants
3. ⚠️ Add JSDoc comments
4. ⚠️ Implement proper logging
5. ⚠️ Add unit and integration tests
6. ⚠️ Use consistent naming (some camelCase, some PascalCase mixing)

---

## 🔮 Future Enhancements

### Suggested Features
1. **User Authentication** (JWT or OAuth)
2. **Note Categories/Tags**
3. **Search Functionality**
4. **Rich Text Editor** (Markdown or WYSIWYG)
5. **Note Sharing** (public links)
6. **Dark/Light Mode Toggle**
7. **Note Archiving**
8. **Export Notes** (PDF, Markdown)
9. **Collaborative Editing**
10. **Mobile App** (React Native)

### Technical Improvements
1. Implement pagination or virtual scrolling
2. Add Redis caching layer
3. Migrate to TypeScript
4. Add comprehensive test suite
5. Implement WebSocket for real-time updates
6. Add database indexes
7. Implement proper logging (Winston, Morgan)
8. Add API documentation (Swagger)
9. Implement CI/CD pipeline
10. Add performance monitoring (New Relic, DataDog)

---

*Last Updated: 2026-01-21*
