import {API_URL, type Book, type State} from "../types.tsx";
import * as React from 'react'
import {useEffect, useState} from 'react'

const defaultBook: Book = {
    id: '',
    title: '',
    author: '',
    genre: '',
    publishedDate: '',
    rating: 0,
}

async function createBook(book: Book): Promise<Headers> {
    book.id = "00000000-0000-0000-0000-000000000000"; // Empty guid for new book
    // Simulate a POST request
    const response = await fetch(`${API_URL}/api/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });
    if (!response.ok) throw new Error(`Failed to create book: ${response.status}`);
    return response.headers;
}

async function updateBook(book: Book): Promise<void> {
    // Simulate a PUT request
    const response = await fetch(`${API_URL}/api/books/${book.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });
    if (!response.ok) throw new Error(`Failed to update book: ${response.status}`);
}

// Get a single book by ID
async function getBookById(id: string): Promise<Book | null> {
    const response = await fetch(`${API_URL}/api/books/${id}`);
    if (!response.ok) return null;
    return await response.json();
}

export default function Books({state, setState}: Readonly<{
    state: Exclude<State, 'browse' | 'stats'>;
    setState: React.Dispatch<React.SetStateAction<State>>
}>) {
    // Controlled form state for creating/editing
    const [form, setForm] = useState<Book>(defaultBook);
    const [isCreate, setIsCreate] = useState(state === 'create');

    // Do not throw here; just handle modes below

    useEffect(() => {
        if (state === 'create') {
            // Entering create mode: ensure clean form and correct flag
            setIsCreate(true);
            setForm(defaultBook);
            return;
        }

        // Edit mode: fetch book by id
        getBookById(state.id).then(book => {
            if (book) {
                setIsCreate(false);
                setForm(book);
            } else {
                // If not found, switch to create mode
                setIsCreate(true);
                setForm(defaultBook);
            }
        });
    }, [state])

    function handleChange<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm(prev => ({...prev, [key]: value}));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isCreate) {
            updateBook(form).then(
                () => alert(`${form.title} by ${form.author} updated successfully.`),
                () => alert('Failed to update book. Please try again later.')
            ).then(() => setState('browse'));
        } else {
            createBook(form).then(
                () => alert(`${form.title} by ${form.author} created successfully.`),
                () => alert('Failed to create new book. Please try again later.')
            ).then(() => setState('browse'));
        }
    }

    // In browse mode, render nothing (Books panel is hidden)
    if (state === null) return <p>This is an impossible state</p>;
    return (
        <div style={{maxWidth: 640, margin: '1rem auto', padding: '1rem', border: '1px solid #ddd', borderRadius: 8}}>
            <form onSubmit={handleSubmit}>
                <div style={{display: 'grid', gap: 12}}>
                    {/* Use a two-column grid within each label to avoid ambiguous spacing before inputs */}
                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Title:</span>
                        <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)}
                               required/>
                    </label>

                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Author:</span>
                        <input type="text" value={form.author} onChange={e => handleChange('author', e.target.value)}
                               required/>
                    </label>

                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Genre:</span>
                        <input type="text" value={form.genre} onChange={e => handleChange('genre', e.target.value)}
                               required/>
                    </label>

                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Published Date:</span>
                        <input type="date" value={form.publishedDate}
                               onChange={e => handleChange('publishedDate', e.target.value)} required/>
                    </label>

                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Rating:</span>
                        <input type="number" min={1} max={5} step={1} value={form.rating}
                               onChange={e => handleChange('rating', Number(e.target.value))} required
                               style={{width: 80}}/>
                    </label>
                </div>
                <div style={{marginTop: 16}}>
                    <button type="submit">{!isCreate ? 'Update Book' : 'Create Book'}</button>
                </div>
            </form>

            <hr style={{margin: '1.5rem 0'}}/>
        </div>
    );
}