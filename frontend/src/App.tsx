import './App.css'
import BookList from '../src/components/BookList'
import Books from '../src/components/Books'
import Statistic from '../src/components/Statistic2'
import {useState} from "react";
import type { State } from "./types.tsx";

function isFormState(s: State): s is Exclude<State, 'browse' | 'stats'> {
    return s === 'create' || typeof s === 'object';
}

function App() {
    const [state, setState] = useState<State>('browse');
    return (
        <div style={{display: 'grid', gap: 24, padding: 16}}>
            {state === 'browse' && <BookList setState={setState}/>} 
            {isFormState(state) && <Books state={state} setState={setState}/>} 
            {state === 'stats' && <Statistic/>}
        </div>
    )
}

export default App
