import './App.css'
import BookList from '../src/components/BookList'
import Books from '../src/components/Books'
import {useState} from "react";
import type {State} from "./types.tsx";

function App() {
    const [state, setState] = useState<State>('browse');
    return (
        <div style={{display: 'grid', gap: 24, padding: 16}}>
            {
                state === 'browse' ? <BookList setState={setState}/> : <Books state={state} setState={setState}/>
            }
        </div>
    )
}

export default App
