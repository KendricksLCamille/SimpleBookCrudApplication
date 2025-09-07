export interface Book {
    id: string;
    title: string;
    author: string;
    genre: string;
    publishedDate: string; // ISO string
    rating: number;
}

export interface BookStats {
    [genre: string]: number;
}

export interface EditReadState{
    id: string;
}

export type State = "create" | "browse" | EditReadState;

interface PropertyMeta{
    name: string;
    title: string;
    verification?: (value: string | number | Date ) => boolean;
}

export const BookPropertiesMeta: PropertyMeta[] = [
    {
        name: "title",
        title: "Title",
        verification: (value) => typeof value === "string" && value.trim()!== "" && length >= 1
    },
    {
        name: "author",
        title: "Author",
        verification: (value) => typeof value === "string" && value.trim()!== "" && length >= 1
    },
    {
        name: "publishedDate",
        title: "Published Date",
        verification: (value) => {
            if(typeof value === typeof Date) return true;
            const date = new Date(value);
            return date.toISOString()!== "Invalid Date" && date.getFullYear() >= 2015;
        }
    },
    {
        name: "genre",
        title: "Genre",
        verification: (value) => typeof value === "string" && value.trim()!== "" && length >= 1
    },
    {
        name: "rating",
        title: "Rating",
        verification: (value) => typeof value === "number" && value >= 1 && value <= 5
    }
]