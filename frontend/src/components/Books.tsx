import {API_URL, type Book} from '../types.tsx';
import {useForm} from 'react-hook-form';
import {useEffect, useMemo, useState} from 'react';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate, useParams} from 'react-router-dom';
import Skeleton from './ui/Skeleton';

const schema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Title is required').max(200),
    author: z.string().min(1, 'Author is required').max(200),
    genre: z.string().min(1, 'Genre is required').max(100),
    publishedDate: z
        .string()
        .refine((v) => !Number.isNaN(Date.parse(v)), 'Valid date required'),
    rating: z.coerce.number().int().min(1).max(5),
});

type FormValues = z.infer<typeof schema>;

export default function Books() {
    const navigate = useNavigate();
    const {id} = useParams();
    const [isCreate, setIsCreate] = useState<boolean>(() => !id);
    const [loading, setLoading] = useState<boolean>(!isCreate);

    const {register, handleSubmit, formState: {errors}, setValue, getValues} = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            author: '',
            genre: '',
            publishedDate: new Date().toISOString().slice(0, 10),
            rating: 1,
        },
    });

    // Load existing book if editing
    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!id) {
                setIsCreate(true);
                setLoading(false);
                return;
            }
            try {
                const resp = await fetch(`${API_URL}/api/books/${id}`);
                if (!resp.ok) {
                    // Switch to create mode if not found
                    setIsCreate(true);
                    return;
                }
                const json = (await resp.json()) as Book;
                if (cancelled) return;
                setValue('id', json.id);
                setValue('title', json.title);
                setValue('author', json.author);
                setValue('genre', json.genre);
                setValue('publishedDate', json.publishedDate.slice(0, 10));
                setValue('rating', Math.round(json.rating));
            } catch {
                setIsCreate(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [id, setValue]);

    const titleText = useMemo(() => (isCreate ? 'Create Book' : 'Edit Book'), [isCreate]);
    const submitText = useMemo(() => (isCreate ? 'Create Book' : 'Update Book'), [isCreate]);

    async function onSubmit(data: FormValues) {
        try {
            if (isCreate) {
                const payload: Book = {
                    id: '00000000-0000-0000-0000-000000000000',
                    title: data.title,
                    author: data.author,
                    genre: data.genre,
                    publishedDate: data.publishedDate,
                    rating: data.rating,
                };
                const resp = await fetch(`${API_URL}/api/books`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload),
                });
                if (resp.ok) {
                    alert(`Created new book ${data.title}`);
                    navigate('/');
                } else {
                    alert('Failed to create book');
                }
            } else {
                const currentId = getValues('id') ?? id!;
                const payload: Book = {
                    id: currentId,
                    title: data.title,
                    author: data.author,
                    genre: data.genre,
                    publishedDate: data.publishedDate,
                    rating: data.rating,
                };
                const resp = await fetch(`${API_URL}/api/books/${currentId}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload),
                });
                if (resp.ok) {
                    alert('Book updated successfully');
                } else {
                    alert('Failed to update book');
                }
                navigate('/');
            }
        } catch {
            alert('Network error');
        }
    }

    if (!isCreate && loading) {
        return (
            <div style={{maxWidth: 640, margin: '1rem auto', padding: '1rem'}}>
                <Skeleton height={24} width={200}/>
                <div style={{display: 'grid', gap: 8, marginTop: 12}}>
                    <Skeleton height={32}/>
                    <Skeleton height={32}/>
                    <Skeleton height={32}/>
                </div>
            </div>
        );
    }

    return (
        <div style={{maxWidth: 640, margin: '1rem auto', padding: '1rem', border: '1px solid #ddd', borderRadius: 8}}>
            <h2 tabIndex={-1} aria-live="polite">{titleText}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{display: 'grid', gap: 12}}>
                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Title:</span>
                        <input aria-invalid={!!errors.title} aria-describedby="title-err"
                               type="text" {...register('title')} required/>
                    </label>
                    {errors.title && (
                        <span id="title-err" role="alert" style={{color: 'crimson'}}>
              {errors.title.message}
            </span>
                    )}

                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Author:</span>
                        <input aria-invalid={!!errors.author} aria-describedby="author-err"
                               type="text" {...register('author')} required/>
                    </label>
                    {errors.author && (
                        <span id="author-err" role="alert" style={{color: 'crimson'}}>
              {errors.author.message}
            </span>
                    )}

                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Genre:</span>
                        <input aria-invalid={!!errors.genre} aria-describedby="genre-err"
                               type="text" {...register('genre')} required/>
                    </label>
                    {errors.genre && (
                        <span id="genre-err" role="alert" style={{color: 'crimson'}}>
              {errors.genre.message}
            </span>
                    )}

                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Published Date:</span>
                        <input aria-invalid={!!errors.publishedDate} aria-describedby="date-err"
                               type="date" {...register('publishedDate')} required/>
                    </label>
                    {errors.publishedDate && (
                        <span id="date-err" role="alert" style={{color: 'crimson'}}>
              {errors.publishedDate.message}
            </span>
                    )}

                    <label
                        style={{display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8}}>
                        <span>Rating:</span>
                        <input
                            aria-invalid={!!errors.rating}
                            aria-describedby="rating-err"
                            type="number"
                            min={1}
                            max={5}
                            step={1}
                            {...register('rating', {valueAsNumber: true})}
                            required
                            style={{width: 80}}
                        />
                    </label>
                    {errors.rating && (
                        <span id="rating-err" role="alert" style={{color: 'crimson'}}>
              {errors.rating.message}
            </span>
                    )}
                </div>
                <div style={{marginTop: 16}}>
                    <button type="submit" aria-label={submitText}>{submitText}</button>
                    <button type="button" onClick={() => navigate('/browse')} style={{marginLeft: 8}}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}