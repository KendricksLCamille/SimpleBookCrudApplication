import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav style={{
      display: 'flex',
      gap: 16,
      padding: '8px 12px',
      borderBottom: '1px solid #ddd',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
        <span style={{fontWeight: 700}}>Simple Book Library</span>
        <Link to="/browse" aria-label="Browse Books">Browse</Link>
        <Link to="/create" aria-label="Create Book">Create</Link>
        <Link to="/stats" aria-label="Statistics">Statistics</Link>
      </div>
    </nav>
  );
}
