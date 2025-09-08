import './App.css'
import BookList from '../src/components/BookList'
import Books from '../src/components/Books'
import Statistic from '../src/components/Statistic2'
import NavBar from '../src/components/NavBar'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { API_URL } from './types.tsx'

function App() {
  const navigate = useNavigate();

  // Centralized API URL gate: show only error OR normal content, not both
  if (!API_URL) {
    return (
      <div style={{ padding: 16 }}>
        <p style={{ color: 'crimson' }}>
          API base URL is not configured. Please set VITE_API_URL in frontend/.env (or provide via environment variable)
          to point to your backend, e.g.: VITE_API_URL=http://localhost:5089. Then restart the frontend dev server.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <NavBar />
      <div style={{ display: 'grid', gap: 24, padding: 16 }}>
        <Routes>
          <Route path="/" element={<BookList setState={(s)=>{ if (s==='create') navigate('/create'); else if (s==='stats') navigate('/stats'); else if (typeof s==='object' && 'id' in s) navigate(`/edit/${(s as {id:string}).id}`); }} />} />
          <Route path="/browse" element={<BookList setState={(s)=>{ if (s==='create') navigate('/create'); else if (s==='stats') navigate('/stats'); else if (typeof s==='object' && 'id' in s) navigate(`/edit/${(s as {id:string}).id}`); }} />} />
          <Route path="/create" element={<Books />} />
          <Route path="/edit/:id" element={<Books />} />
          <Route path="/stats" element={<Statistic />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
