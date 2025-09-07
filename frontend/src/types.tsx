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

const k:BookStats = {"p": 1}
console.log(k["p"]); // 1

export interface EditReadState{
    id: string;
}

export type State = "create" | "browse" | EditReadState | "stats";

export const API_URL = (import.meta.env?.API_URL as string | undefined) || (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5152';