import './App.css'
import BookList from '../src/components/BookList'
import Books from '../src/components/Books'
import Statistic from '../src/components/Statistic2'
import NavBar from '../src/components/NavBar'
import {useEffect, useMemo, useState} from "react";
import { API_URL, type State } from "./types.tsx";

function isFormState(s: State): s is Exclude<State, 'browse' | 'stats'> {
    return s === 'create' || typeof s === 'object';
}

function parseHashToState(hash: string): State {
    const h = hash.replace(/^#/, '').trim();
    const parts = h.split('/').filter(Boolean);
    if (parts.length === 0) return 'browse';
    if (parts[0] === 'browse') return 'browse';
    if (parts[0] === 'create') return 'create';
    if (parts[0] === 'stats') return 'stats';
    if (parts[0] === 'edit' && parts[1]) return { id: parts[1] } as unknown as State;
    return 'browse';
}

function stateToHash(state: State): string {
    if (state === 'browse') return '#/browse';
    if (state === 'create') return '#/create';
    if (state === 'stats') return '#/stats';
    if (typeof state === 'object' && state && 'id' in state) return `#/edit/${(state).id}`;
    return '#/browse';
}

function App() {
    const initial = useMemo(() => parseHashToState(window.location.hash || '#/browse'), []);
    const [state, setState] = useState<State>(initial);

    // Sync state when hash changes (back/forward navigation)
    useEffect(() => {
        const onHashChange = () => {
            setState(parseHashToState(window.location.hash));
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    // Push hash when state changes (programmatic navigation via buttons)
    useEffect(() => {
        const expectedHash = stateToHash(state);
        if (window.location.hash !== expectedHash) {
            window.location.hash = expectedHash;
        }
    }, [state]);

    // Centralized API URL gate: show only error OR normal content, not both
    if (!API_URL) {
        return (
            <div style={{padding: 16}}>
                <p style={{color: 'crimson'}}>
                    API base URL is not configured. Please set VITE_API_URL in frontend/.env (or provide via environment variable)
                    to point to your backend, e.g.: VITE_API_URL=http://localhost:5089. Then restart the frontend dev server.
                </p>
            </div>
        );
    }

    return (
        <div style={{display: 'grid', gap: 24}}>
            <NavBar />
            <div style={{display: 'grid', gap: 24, padding: 16}}>
                {state === 'browse' && <BookList setState={setState}/>} 
                {isFormState(state) && <Books state={state} setState={setState}/>} 
                {state === 'stats' && <Statistic/>}
            </div>
        </div>
    )
}

export default App
