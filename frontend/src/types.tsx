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

// API base URL strategy:
// - Vite exposes env vars prefixed with VITE_ at build time via import.meta.env.
// - Command-line support: when running `vite`/`npm run dev`, you can pass: VITE_API_URL=http://host:port npm run dev
//   (shell env on the command line). For production builds, pass the variable to the build step likewise.
export const API_URL: string | undefined = (import.meta.env?.VITE_API_URL as string | undefined)?.toString().trim() || undefined;
