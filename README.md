# ThinkBoard 📝
<p align="center">
  <img src="https://skillicons.dev/icons?i=mongodb,express,react,nodejs" />
</p>
<p align="center">
  <strong>A modern, full-stack notes application built with the MERN stack</strong>
</p>
<p align="center">
  ThinkBoard allows users to create, read, update, and delete notes with a clean and intuitive interface.
</p>


[Click me to visit](https://mern-think-board-ueo9.onrender.com/)

- Might take a minute or two since it's on the free plan in Render

A modern, full-stack notes application built with the MERN stack. ThinkBoard allows users to create, read, update, and delete notes with a clean and intuitive interface.

## Purpose

ThinkBoard was developed as a hands-on learning project to understand how modern web development works through practical implementation. By building this full-featured notes application, I gained real-world experience with:

- Full-stack development workflows
- RESTful API design and implementation
- Database modeling and CRUD operations
- Frontend-backend integration
- State management in React
- Modern deployment practices

This project served as a practical bridge between theoretical knowledge and real-world application development, helping me solidify my understanding of the complete web development lifecycle as a self-studying student.

## ScreenShots 
- Mobile view
<img width="300" alt="image" src="https://github.com/user-attachments/assets/56cc1643-4ff4-4e94-be2b-dcb2151d4989" />
<img width="300" alt="image" src="https://github.com/user-attachments/assets/b567707d-4d3b-4e9e-984d-037e91ded947" />
<img width="300" alt="image" src="https://github.com/user-attachments/assets/a33c8078-def0-41a9-96fa-81f68279aeae" />

- Desktop view

<img width="600" alt="image" src="https://github.com/user-attachments/assets/9db14449-27ed-468a-8fb7-8b5903e5022c" />

## Tech Stack
<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=react,vite,tailwind,nodejs,express,mongodb,javascript,html,css" />
  </a>
</p>

### Frontend
- **React 19** - UI library for building component-based interfaces
- **React Router 7** - Client-side routing and navigation
- **Vite 7** - Next-generation frontend build tool
- **Tailwind CSS 3** - Utility-first CSS framework
- **DaisyUI 4** - Component library built on Tailwind CSS
- **Axios 1.13** - Promise-based HTTP client
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express 5** - Fast, minimalist web framework
- **MongoDB** - NoSQL database for data persistence
- **Mongoose 9** - MongoDB object modeling tool

### Additional Tools
- **Upstash Redis** - Rate limiting implementation
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

## Features

✅ **Create Notes** - Add new notes with title and content  
✅ **View Notes** - Display all notes in a responsive grid layout  
✅ **Update Notes** - Edit existing notes with real-time updates  
✅ **Delete Notes** - Remove notes with confirmation dialog  
✅ **Rate Limiting** - Prevent API abuse with request throttling  
✅ **Responsive Design** - Works seamlessly on desktop and mobile  
✅ **Modern UI** - Clean interface with smooth transitions  
✅ **Error Handling** - User-friendly error messages and loading states

## What I Learned
<p align="center">
  <img src="https://skillicons.dev/icons?i=git,github,vscode,postman" />
</p>

Building ThinkBoard helped me develop and polish several key abilities:

### Technical Skills
- **Full-stack architecture** - Understanding how frontend and backend communicate through REST APIs
- **Database design** - Creating schemas and managing data relationships with MongoDB and Mongoose
- **State management** - Handling component state, API responses, and user interactions in React
- **API development** - Building RESTful endpoints with proper HTTP methods and status codes
- **Error handling** - Implementing try-catch blocks and providing meaningful user feedback
- **Security practices** - Implementing rate limiting and input validation

### Development Practices
- **Component architecture** - Breaking down UI into reusable, maintainable components
- **Async operations** - Working with promises, async/await, and handling asynchronous data flows
- **Environment configuration** - Managing different settings for development and production
- **Code organization** - Structuring projects with clear separation of concerns
- **Version control** - Managing code changes and project evolution with Git

### Problem-Solving
- **Debugging** - Identifying and fixing issues across the full stack
- **Performance optimization** - Implementing efficient data fetching and rendering strategies
- **User experience** - Creating intuitive interfaces with proper loading and error states
- **Deployment** - Understanding the process of taking an application from local to production

## Installation

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd thinkboard
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure backend environment variables**
   
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5001
   MONGO_DB=your_mongodb_connection_string
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   NODE_ENV=development
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the development servers**

   In the `backend` folder:
   ```bash
   npm run dev
   ```

   In the `frontend` folder (in a new terminal):
   ```bash
   npm run dev
   ```

6. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

   The backend API will be running on:
   ```
   http://localhost:5001
   ```

### Building for Production

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd ../backend
   NODE_ENV=production npm start
   ```

   The production build serves the frontend from the backend server.

## Project Structure

```
thinkboard/
├── backend/
│   ├── src/
│   │   ├── Models/
│   │   │   └── note.js
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── upstash.js
│   │   ├── controllers/
│   │   │   └── notesController.js
│   │   ├── middleware/
│   │   │   └── rateLimiter.js
│   │   ├── routes/
│   │   │   └── notesRoutes.js
│   │   └── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── NoteCard.jsx
    │   │   ├── NotesNotFound.jsx
    │   │   └── RateLimitedUI.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── CreatePage.jsx
    │   │   └── NoteDetailPage.jsx
    │   ├── lib/
    │   │   ├── axios.js
    │   │   └── utils.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes/:id` | Get a specific note |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

## Contributing

This is a learning project, but suggestions and improvements are welcome! Feel free to fork the repository and submit pull requests.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built as a self-study project to learn the MERN stack
- Inspired by modern note-taking applications
- UI components powered by DaisyUI and Tailwind CSS

---

**Note**: Remember to never commit your `.env` file to version control. Always keep your MongoDB connection strings and API keys secure.
