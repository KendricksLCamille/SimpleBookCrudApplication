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
        <a href="#/browse" aria-label="Browse Books">Browse</a>
        <a href="#/create" aria-label="Create Book">Create</a>
        <a href="#/stats" aria-label="Statistics">Statistics</a>
      </div>
    </nav>
  );
}
