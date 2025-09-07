import './App.css'
import BookList from '../src/components/BookList'
import Books from '../src/components/Books'

function App() {
  return (
    <div style={{display:'grid', gap: 24, padding: 16}}>
      <Books/>
      <BookList/>
    </div>
  )
}

export default App
