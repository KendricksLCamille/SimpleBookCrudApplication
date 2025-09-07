import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock fetch and alert before importing/using the component code paths
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const alertMock = vi.fn();
vi.stubGlobal('alert', alertMock);

import Books from './Books';

// Helper to render the component with a specific id despite its atypical signature (Books(id: string))
function renderWithId(id: string) {
  function Wrapper() {
    // Call the component function directly with the desired id
    return Books(id);
  }
  return render(<Wrapper />);
}

function respOk(jsonValue: unknown) {
  return {
    ok: true,
    json: async () => jsonValue,
    headers: new Headers(),
  } as Response;
}

function respNotOk(status = 404) {
  return {
    ok: false,
    status,
    json: async () => ({}),
  } as unknown as Response;
}

describe('Books (create/edit form)', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    alertMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('loads existing book (edit mode), populates fields and submits a PUT', async () => {
    const existing = {
      id: 'book-123',
      title: 'Existing Title',
      author: 'Existing Author',
      genre: 'Fiction',
      publishedDate: '2024-01-15',
      rating: 4,
    };

    // First call: GET /api/books/book-123 -> return existing
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/books/book-123' && (!init || !init.method)) {
        return respOk(existing);
      }
      if (url === `/api/books/${existing.id}` && init?.method === 'PUT') {
        // Accept any body
        return respOk({});
      }
      return respNotOk();
    });

    renderWithId('book-123');

    // Button should be "Update Book" after data loads
    const updateBtn = await screen.findByRole('button', { name: 'Update Book' });
    expect(updateBtn).toBeInTheDocument();

    // Fields populated
    expect(screen.getByLabelText('Title:')).toHaveValue('Existing Title');
    expect(screen.getByLabelText('Author:')).toHaveValue('Existing Author');
    expect(screen.getByLabelText('Genre:')).toHaveValue('Fiction');
    expect(screen.getByLabelText('Published Date:')).toHaveValue('2024-01-15');
    expect(screen.getByLabelText('Rating:')).toHaveValue(4);

    // Change a field to ensure body sends the new value
    fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'Updated Title' } });

    fireEvent.click(updateBtn);

    // Expect a PUT request with correct URL
    expect(fetchMock).toHaveBeenCalledWith(`/api/books/${existing.id}`, expect.objectContaining({ method: 'PUT' }));

    // Wait for async submit chain to resolve and alerts to be called
    await Promise.resolve();
    await Promise.resolve();

    // Alert should be shown from both updateBook and handleSubmit then-chain
    expect(alertMock).toHaveBeenCalledWith('Book updated successfully');
    expect(alertMock).toHaveBeenCalledWith(`Updated book ${existing.id}`);
  });

  it('stays in create mode when GET returns not ok and submits a POST to create', async () => {
    // GET should be not ok, so component stays in create mode
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/books/new-id' && (!init || !init.method)) {
        return respNotOk(404);
      }
      if (url === '/api/books' && init?.method === 'POST') {
        return respOk({});
      }
      return respNotOk();
    });

    renderWithId('new-id');

    // Button should read Create Book (no existing data)
    const createBtn = await screen.findByRole('button', { name: 'Create Book' });
    expect(createBtn).toBeInTheDocument();

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'New Book' } });
    fireEvent.change(screen.getByLabelText('Author:'), { target: { value: 'New Author' } });
    fireEvent.change(screen.getByLabelText('Genre:'), { target: { value: 'New Genre' } });
    fireEvent.change(screen.getByLabelText('Published Date:'), { target: { value: '2025-09-01' } });
    fireEvent.change(screen.getByLabelText('Rating:'), { target: { value: 5 } });

    fireEvent.click(createBtn);

    // Expect POST to /api/books
    expect(fetchMock).toHaveBeenCalledWith('/api/books', expect.objectContaining({ method: 'POST' }));

    // Wait for async submit chain
    await Promise.resolve();
    await Promise.resolve();

    // Alert should be shown
    expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/^Created new book/));

  });
});
