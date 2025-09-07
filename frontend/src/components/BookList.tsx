import type {Book} from "../types.tsx";
import {useEffect, useState} from 'react'

export default function BookList(){
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
                </tr>
            </thead>
            <tbody>
                {books.map((book) => (
                    <tr key={book.id}>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{new Date(book.publishedDate).toLocaleDateString()}</td>
                        <td>{book.genre}</td>
                        <td>{book.rating.toFixed(0)}</td>
                    </tr>))}
            </tbody>
        </table>
    );
}

function getBooks(): Promise<Book[]>{
    // Simulating a fetch request
    return new Promise((resolve) => {
       return fetch('127.0.0.1/api/books').then(response => response.json()).then(
           json => resolve(JSON.parse(json))
       , error => {
               console.error('Error fetching books:', error);
               resolve([]); // Return an empty array if there's an error
           });

        /*setTimeout(() => {
            const books: Book[] = []; // Replace this with your actual data source
            for (let i = 0; i < 100; i++) {
                const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2,'0');
                const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2,'0');
                const year = Math.floor(Math.random() * 9 + 2015).toString().padStart(4,'0');
                books.push({
                    id: `book-${i + 1}`,
                    title: `Book ${Math.floor(Math.random() * 1000).toFixed(0)}`,
                    author: `Author ${Math.floor(Math.random() * 1000).toFixed(0)}`,
                    genre: `Genre ${i % 7 + 1}`,
                    publishedDate: `${year}-${month}-${day}`,
                    rating: Math.random() * 4 + 1
                });
            }

            resolve(books);
        }, 100);*/
    });
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