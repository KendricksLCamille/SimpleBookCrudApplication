import type {Book} from "../types.tsx";
import {useEffect, useState} from 'react'

const defaultBook: Book = {
    id: '',
    title: '',
    author: '',
    genre: '',
    publishedDate: '',
    rating: 0,
}

// Post request to create a new book
async function createBook(book: Book): Promise<Headers> {
    // Simulate a POST request
    const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });
    if (!response.ok) throw new Error(`Failed to create book: ${response.status}`);
    return response.headers;
}

// Make post request to update an existing book
async function updateBook(book: Book): Promise<void> {
    // Simulate a PUT request
    const response = await fetch(`/api/books/${book.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });
    if (!response.ok) throw new Error(`Failed to update book: ${response.status}`);
    alert('Book updated successfully');
}

// Get a single book by ID
async function getBookById(id: string): Promise<Book | null> {
    const response = await fetch(`/api/books/${id}`);
    if (!response.ok) return null;
    return await response.json();
}

export default function Books(id: string) {
    // Controlled form state for creating/editing
    const [form, setForm] = useState<Book>(defaultBook);
    const [mode, setMode] = useState<'create' | 'edit'>('create');

    useEffect(() => {
        getBookById(id).then(book => {
            if (book) {
                setForm(book);
                setMode('edit');
            }
        });
    }, [id])

    function handleChange<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm(prev => ({...prev, [key]: value}));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (mode === 'edit') {
            updateBook(form).then(() => {
                    setMode('create')
                    setForm(defaultBook)
                    alert(`Updated book ${form.id}`);
                }
            );
        } else {
            createBook(form).then(() => {
                setMode('create')
                setForm(defaultBook)
                alert(`Created new book ${form.id}`);
            })
        }
    }

    return (
        <div style={{maxWidth: 640, margin: '1rem auto', padding: '1rem', border: '1px solid #ddd', borderRadius: 8}}>
            <form onSubmit={handleSubmit}>
                <div style={{display: 'grid', gap: 12}}>
                    <label>
                        Title:
                        <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)}
                               required style={{marginLeft: 8, width: '80%'}}/>
                    </label>

                    <label>
                        Author:
                        <input type="text" value={form.author} onChange={e => handleChange('author', e.target.value)}
                               required style={{marginLeft: 8, width: '80%'}}/>
                    </label>
                    <label>
                        Genre:
                        <input type="text" value={form.genre} onChange={e => handleChange('genre', e.target.value)}
                               required style={{marginLeft: 8, width: '80%'}}/>
                    </label>
                    <label>
                        Published Date:
                        <input type="date" value={form.publishedDate}
                               onChange={e => handleChange('publishedDate', e.target.value)} required
                               style={{marginLeft: 8}}/>
                    </label>
                    <label>
                        Rating:
                        <input type="number" min={1} max={5} step={1} value={form.rating}
                               onChange={e => handleChange('rating', Number(e.target.value))} required
                               style={{marginLeft: 8, width: 80}}/>
                    </label>
                </div>
                <div style={{marginTop: 16}}>
                    <button type="submit">{mode === 'edit' ? 'Update Book' : 'Create Book'}</button>
                </div>
            </form>

            <hr style={{margin: '1.5rem 0'}}/>
        </div>
    );
}


