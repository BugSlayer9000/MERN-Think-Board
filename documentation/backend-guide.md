# Backend Architecture - How It Works

## 1. Entry Point: server.js

**Purpose**: The main file that starts your Express server and connects everything together.

### What Happens When Server Starts:

```
1. Load environment variables from .env file
   ↓
2. Create Express application instance
   ↓
3. Connect to MongoDB database
   ↓
4. Apply middleware (in order!)
   ↓
5. Register routes
   ↓
6. Start listening on port 5001
```

### Middleware Stack (Order Matters!):

```javascript
// 1. CORS - Allows frontend to make requests
app.use(cors({
  origin: "http://localhost:5173" // React dev server
}))

// 2. JSON Parser - Converts JSON requests to JavaScript objects
app.use(express.json())

// 3. Rate Limiter - Protects against too many requests
app.use(ratelimiter)

// 4. Routes - Handle specific endpoints
app.use("/api/notes", notesRoutes)
```

**Why This Order?**
- CORS must come first to allow requests
- JSON parser needed before routes can read request body
- Rate limiter checks limits before processing requests
- Routes come last to handle actual requests

---

## 2. Database Connection: config/db.js

**Purpose**: Establishes connection to MongoDB Atlas.

### How It Works:

```
Environment Variable (MONGO_DB) contains connection string
   ↓
mongoose.connect() attempts connection
   ↓
Success: Server continues starting
   ↓
Failure: Error logged, server may crash
```

**Connection String Format**:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name
```

---

## 3. Data Model: Models/note.js

**Purpose**: Defines the structure of a Note document in MongoDB.

### Schema Definition:

```javascript
{
  title: String (required),
  content: String (required),
  createdAt: Date (automatic),
  updatedAt: Date (automatic)
}
```

### What Mongoose Does:

1. **Validation**: Ensures title and content exist
2. **Type Casting**: Converts data to correct types
3. **Timestamps**: Automatically adds createdAt/updatedAt
4. **Methods**: Provides .find(), .save(), .delete(), etc.

**MongoDB Collection**: Will be named "notes" (lowercase, plural)

---

## 4. Rate Limiting: config/upstash.js & middleware/rateLimiter.js

### How Rate Limiting Works:

```
Request arrives
   ↓
Rate limiter checks Redis:
"Has this IP made 100+ requests in last 60 seconds?"
   ↓
Yes → Return 429 error
   ↓
No → Allow request to continue
```

**Redis (Upstash)**: Fast in-memory database that tracks:
- Which IP addresses made requests
- How many requests per time window
- Automatically expires old data

---

## 5. Routes: routes/notesRoutes.js

**Purpose**: Maps HTTP methods and URLs to controller functions.

### Route Mapping:

| HTTP Method | URL | Controller Function | Purpose |
|------------|-----|-------------------|---------|
| GET | /api/notes | getAllNotes | Get all notes |
| GET | /api/notes/:id | getNotesById | Get one note |
| POST | /api/notes | createNote | Create new note |
| PUT | /api/notes/:id | updateNote | Update note |
| DELETE | /api/notes/:id | deleteNote | Delete note |

**URL Parameters**: `:id` is a placeholder that becomes `req.params.id`

---

## 6. Controllers: controllers/notesController.js

**Purpose**: Contains the actual logic for each operation.

### Request Flow Example (GET all notes):

```
1. Client sends: GET http://localhost:5001/api/notes
   ↓
2. Express matches route: router.get("/", getAllNotes)
   ↓
3. getAllNotes function executes:
   - Calls Note.find().sort({createdAt: -1})
   - MongoDB returns array of note documents
   ↓
4. Controller sends response:
   - Status: 200
   - Body: JSON array of notes
```

### Error Handling:

Every controller has try-catch blocks:
```javascript
try {
  // Attempt operation
} catch (error) {
  // Log error
  // Send 500 status + error message
}
```

---

## 7. How Data Flows Through Backend

### Creating a Note:

```
Frontend → POST /api/notes with JSON body
   ↓
Rate Limiter (middleware) → Check limits
   ↓
express.json() (middleware) → Parse JSON to object
   ↓
Router → Match POST /api/notes → createNote
   ↓
Controller → Create new Note instance
   ↓
Mongoose → Validate data
   ↓
MongoDB → Insert document
   ↓
Controller → Send 201 response
   ↓
Frontend → Receive success response
```

### Reading Notes:

```
Frontend → GET /api/notes
   ↓
Rate Limiter → Check limits
   ↓
Router → Match GET /api/notes → getAllNotes
   ↓
Controller → Call Note.find()
   ↓
Mongoose → Query MongoDB
   ↓
MongoDB → Return documents
   ↓
Controller → Send 200 + notes array
   ↓
Frontend → Display notes
```

---

## 8. Environment Variables (.env)

**Purpose**: Store sensitive configuration outside code.

```
MONGO_DB=mongodb+srv://...
PORT=5001
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=xxx
NODE_ENV=production
```

**Why?**
- Security: Credentials not in code
- Flexibility: Different values per environment
- .gitignore: Never committed to version control

---

## Key Concepts Summary

### REST API Pattern:
- **Resources**: Notes
- **Operations**: CRUD (Create, Read, Update, Delete)
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Stateless**: Each request independent

### Middleware Chain:
- Functions that execute in sequence
- Can modify request/response
- Can stop request (rate limiter)
- Order is critical

### MVC Pattern (Modified):
- **Model**: Note.js (data structure)
- **Controller**: notesController.js (business logic)
- **Routes**: notesRoutes.js (URL mapping)

### Async Operations:
- Database calls don't block
- `async/await` waits for completion
- Always wrapped in try-catch
