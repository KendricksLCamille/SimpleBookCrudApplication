import {API_URL, type Book, type State} from "../types.tsx";
import {useEffect, useState} from 'react'
import * as React from "react";

export default function BookList(props: Readonly<{ setState: React.Dispatch<React.SetStateAction<State>> }> | ((s: { id: string }) => void)) {
    // Backward compatibility: allow calling as BookList(setStateFn) or <BookList setState={fn} />
    const setState: React.Dispatch<React.SetStateAction<State>> | ((s: { id: string }) => void) =
        typeof props === 'function' ? props : props.setState;
    const bookProperties = ['title', 'author', 'publishedDate', 'genre', 'rating'];
    const [books, setBooks] = useState<Book[] | null>(null);

    useEffect(() => {
        getBooks().then((innerBooks) => {
            setBooks(innerBooks);
        })
    },[])

    if (!books) return <p>Loading...</p>;

    return (
        <table>
            <thead>
                <tr>
                    {bookProperties.map((property) => {
                        let toTitleCase = property.charAt(0).toUpperCase() + property.slice(1);

                        // Don't feel like writing the code to do this dynamically
                        if(toTitleCase.includes('ate')) toTitleCase = "Published Date";

                      return <th key={property} onClick={() => setBooks(sortBooks(books, property))}>{toTitleCase}</th>
                    })}
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {books.map((book) => (
                    <tr key={book.id} onClick={() => setState({id: book.id})}>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{new Date(book.publishedDate).toLocaleDateString()}</td>
                        <td>{book.genre}</td>
                        <td>{book.rating.toFixed(0)}</td>
                        <td>
                            <button
                                aria-label={`Delete ${book.title}`}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                        const ok = await deleteBook(book.id);
                                        if (ok) {
                                            setBooks(await getBooks())
                                        } else {
                                            alert('Failed to delete book');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Failed to delete book');
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>))}
            </tbody>
        </table>
    );
}

function getBooks(): Promise<Book[]>{
    // Simulating a fetch request
    return new Promise((resolve) => {
       return fetch(`${API_URL}/api/books`).then(response => response.json()).then(
           json => {
               console.log(json);
               return resolve(json)
           }
       , error => {
               console.error('Error fetching books:', error);
               resolve([]); // Return an empty array if there's an error
           });
    });
}

async function deleteBook(id: string): Promise<boolean> {
    try {
        const resp = await fetch(`${API_URL}/api/books/${id}`, { method: 'DELETE' });
        return resp.ok;
    } catch (e) {
        console.error('Delete failed', e);
        return false;
    }
}

function sortBooks(books: Book[], sortBy: string): Book[] {
    console.log(`Sorting by ${sortBy}`);
    switch (sortBy) {
        case "title":
            return [...books].sort((a, b) => a.title.localeCompare(b.title));
        case "author":
            return [...books].sort((a, b) => a.author.localeCompare(b.author));
        case "publishedDate":
            return [...books].sort((a, b) => a.publishedDate.localeCompare(b.publishedDate))
        case "genre":
            return [...books].sort((a, b) => a.genre.localeCompare(b.genre));
        case "rating":
            return [...books].sort((a, b) => a.rating - b.rating);
        default:
            return books;
    }
}