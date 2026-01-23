# Frontend Architecture - How It Works

## 1. Entry Point: main.jsx

**Purpose**: Mounts your React application to the DOM.

### Bootstrap Process:

```
Browser loads index.html
   ↓
Loads main.jsx via <script type="module">
   ↓
React creates root at <div id="root">
   ↓
Wraps App in BrowserRouter (enables routing)
   ↓
Renders App component
   ↓
App displays initial route (HomePage)
```

### Key Wrappers:

```javascript
<StrictMode>           // Development checks
  <BrowserRouter>      // URL-based routing
    <App />           // Your app
    <Toaster/>        // Toast notifications
  </BrowserRouter>
</StrictMode>
```

---

## 2. Routing: App.jsx

**Purpose**: Maps URLs to page components.

### Route Configuration:

| URL Path | Component | Purpose |
|----------|-----------|---------|
| / | HomePage | List all notes |
| /create | CreatePage | Form to create note |
| /note/:id | NoteDetailPage | View/edit specific note |

### How Routing Works:

```
User clicks link/button
   ↓
BrowserRouter detects URL change
   ↓
Routes component matches URL to path
   ↓
Renders corresponding component
   ↓
Old component unmounts, new one mounts
```

**Dynamic Routes**: `/note/:id` means `:id` is a variable
- `/note/123` → id = "123"
- `/note/abc` → id = "abc"

---

## 3. API Communication: lib/axios.js

**Purpose**: Centralized HTTP client configuration.

### Why Axios Instance?

```javascript
const api = axios.create({
  baseURL: BASE_URL  // Prefix for all requests
})
```

**Benefits**:
- Don't repeat base URL in every request
- Easy to change between dev/prod
- Can add interceptors later (auth, etc.)

### Environment Detection:

```javascript
Development: http://localhost:5001/api
Production:  /api  (same domain as frontend)
```

**Usage in Components**:
```javascript
// Instead of:
axios.get('http://localhost:5001/api/notes')

// You write:
api.get('/notes')  // Automatically prefixes base URL
```

---

## 4. Page: HomePage.jsx

**Purpose**: Display all notes in a grid.

### Component Lifecycle:

```
Component mounts
   ↓
useEffect runs once (empty dependency [])
   ↓
fetchNotes function executes:
  - Shows loading state
  - Makes GET request to /api/notes
  - On success: Updates notes state
  - On 429 error: Shows rate limit UI
  - On other errors: Shows toast
  - Finally: Hides loading
   ↓
React re-renders with new state
   ↓
Maps over notes array → Renders NoteCard for each
```

### State Management:

```javascript
const [notes, setNotes] = useState([])        // Array of note objects
const [loading, setLoading] = useState(true)   // Show loading indicator
const [isRateLimited, setRateLimited] = useState(false)  // Show rate limit UI
```

### Conditional Rendering:

```javascript
{loading && <Loading />}
{notes.length === 0 && <NotesNotFound />}
{notes.length > 0 && <NoteCards />}
{isRateLimited && <RateLimitedUI />}
```

---

## 5. Page: CreatePage.jsx

**Purpose**: Form to create a new note.

### Form Flow:

```
User types in inputs
   ↓
onChange handlers update state (title, content)
   ↓
User clicks "Create Note"
   ↓
handleSubmit function:
  1. Prevent default form submission
  2. Validate fields not empty
  3. Set loading state
  4. POST to /api/notes with data
  5. On success: Show toast + navigate to home
  6. On error: Show error toast
  7. Finally: Clear loading state
```

### Controlled Inputs:

```javascript
<input
  value={title}                        // React controls value
  onChange={(e) => setTitle(e.target.value)}  // Update state
/>
```

**Why?**: React state is single source of truth

---

## 6. Page: NoteDetailPage.jsx

**Purpose**: View and edit a specific note.

### How It Gets the Note:

```
URL: /note/abc123
   ↓
useParams() hook extracts: { id: "abc123" }
   ↓
useEffect runs when id changes
   ↓
Fetches note from GET /api/notes/abc123
   ↓
Updates note state with response data
   ↓
Renders form with note data
```

### Edit Functionality:

```javascript
// User edits title
onChange={(e) => setNote({ ...note, title: e.target.value })}
```

**Spread Operator (`...note`)**:
- Creates copy of note object
- Preserves all existing properties
- Only overrides specified property (title)

**Example**:
```javascript
// Before: { _id: "123", title: "Old", content: "Text" }
setNote({ ...note, title: "New" })
// After: { _id: "123", title: "New", content: "Text" }
```

### Save Changes:

```
User clicks "Save Changes"
   ↓
handleSave function:
  1. Validate fields
  2. PUT to /api/notes/:id with updated note
  3. Show success toast
  4. Navigate back to home
```

---

## 7. Component: NoteCard.jsx

**Purpose**: Reusable card to display a single note.

### Props:

```javascript
<NoteCard 
  note={note}           // Note object to display
  setNotes={setNotes}   // Function to update parent's notes array
/>
```

### Delete Flow:

```
User clicks trash icon
   ↓
handleDelete receives event + note id
   ↓
e.preventDefault() stops link navigation
   ↓
Confirmation dialog
   ↓
DELETE to /api/notes/:id
   ↓
Update parent state: filter out deleted note
   ↓
Component re-renders without deleted note
```

**State Update Pattern**:
```javascript
setNotes((prev) => prev.filter((note) => note._id !== id))
```

- `prev`: Previous state value
- Returns new array without deleted note
- React re-renders with new array

---

## 8. Data Flow Diagrams

### Fetching Notes (Read):

```
HomePage mounts
   ↓
useEffect → fetchNotes()
   ↓
api.get('/notes')
   ↓
axios adds baseURL → http://localhost:5001/api/notes
   ↓
Backend receives GET request
   ↓
Returns JSON array of notes
   ↓
setNotes(response.data)
   ↓
React re-renders HomePage
   ↓
Maps notes → <NoteCard /> for each
```

### Creating Note:

```
User fills CreatePage form
   ↓
title/content state updates via onChange
   ↓
User submits form
   ↓
handleSubmit → api.post('/notes', { title, content })
   ↓
Backend creates note in MongoDB
   ↓
Returns 201 status
   ↓
Frontend: toast.success() + navigate('/')
   ↓
HomePage loads and fetches all notes (including new one)
```

### Updating Note:

```
User navigates to /note/abc123
   ↓
NoteDetailPage fetches note data
   ↓
User edits in form (controlled inputs)
   ↓
State updates with each keystroke
   ↓
User clicks "Save Changes"
   ↓
api.put('/notes/abc123', note)
   ↓
Backend updates MongoDB document
   ↓
Frontend: toast.success() + navigate('/')
```

### Deleting Note:

```
User clicks delete on NoteCard
   ↓
Confirmation dialog
   ↓
api.delete('/notes/abc123')
   ↓
Backend deletes from MongoDB
   ↓
Frontend: Updates local state immediately
   ↓
React removes card from UI (no refetch needed)
```

---

## 9. React Hooks Used

### useState:
```javascript
const [state, setState] = useState(initialValue)
```
- Stores component data
- Triggers re-render when changed
- Each component has own state

### useEffect:
```javascript
useEffect(() => {
  // Code runs after render
}, [dependencies])
```
- Runs after component renders
- Dependencies control when it re-runs
- Empty array `[]` = run once on mount

### useParams:
```javascript
const { id } = useParams()
```
- Extracts URL parameters
- From react-router
- Updates when URL changes

### useNavigate:
```javascript
const navigate = useNavigate()
navigate('/') // Programmatic navigation
```
- Navigate without clicking links
- After form submission, deletion, etc.

---

## 10. Styling: TailwindCSS + DaisyUI

### How It Works:

```javascript
<div className="card bg-base-100 shadow-lg">
```

- **Tailwind**: Utility classes (flex, p-4, text-lg)
- **DaisyUI**: Component classes (card, btn, input)

**Theme**: Forest theme (green accent color)

### Responsive Grid:

```javascript
className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

- Default: 3 columns
- Medium screens: 2 columns
- Large screens: 3 columns

---

## Key Concepts Summary

### Component-Based Architecture:
- Reusable pieces (NoteCard, Navbar)
- Props pass data down
- State manages data

### Single Page Application (SPA):
- One HTML file
- JavaScript handles routing
- No page refreshes

### React State:
- Immutable updates (always create new objects/arrays)
- Triggers re-renders
- Local to component (unless passed as props)

### Controlled Components:
- React state controls input values
- onChange handlers update state
- Single source of truth

### Async State Updates:
- API calls are asynchronous
- Loading states show progress
- Error handling with try-catch + toast
