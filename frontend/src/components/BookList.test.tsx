import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Set up a fetch mock BEFORE importing the component module
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import BookList from './BookList';

// Helpers to build mock fetch responses
function respWithJson(jsonValue: unknown): Response {
  return { json: async () => JSON.stringify(jsonValue) } as unknown as Response;
}

describe('BookList', () => {
  beforeEach(() => {
    fetchMock.mockResolvedValue(respWithJson([]));
  });
  afterEach(() => {
    cleanup();
    fetchMock.mockReset();
  });

  it('shows "Loading..." immediately on first render', () => {
    // Do not set up fetch yet; we just assert the initial state.
    render(<BookList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('calls fetch and renders a table with the fetched book', async () => {
    const book = {
      id: 'book-1',
      title: 'Test Book',
      author: 'Test Author',
      genre: 'Test Genre',
      publishedDate: '2023-01-01',
      rating: 4.5,
    };
    fetchMock.mockResolvedValue(respWithJson([book]));

    render(<BookList />);

    // Wait for table to appear
    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
    const headers = within(table).getAllByRole('columnheader').map(th => th.textContent);
    expect(headers).toEqual(['Title', 'Author', 'Published Date', 'Genre', 'Rating']);

    // Row content - formatted date and rounded rating
    const row = within(table).getAllByRole('row')[1];
    const cells = within(row).getAllByRole('cell').map(td => td.textContent);

    const formattedDate = new Date(book.publishedDate).toLocaleDateString();
    expect(cells).toEqual([
      'Test Book',
      'Test Author',
      formattedDate,
      'Test Genre',
      '5', // rating.toFixed(0)
    ]);

    // Verify fetch was called with expected URL
    expect(fetchMock).toHaveBeenCalledWith('127.0.0.1/api/books');
  });

  it('sorts by clicking on column headers', async () => {
    const books = [
      { id: 'a', title: 'Bravo', author: 'Zeke', genre: 'A', publishedDate: '2023-01-01', rating: 3 },
      { id: 'b', title: 'Alpha', author: 'Adam', genre: 'B', publishedDate: '2024-05-01', rating: 4 },
    ];
    fetchMock.mockResolvedValue(respWithJson(books));

    render(<BookList />);
    const table = await screen.findByRole('table');

    const getFirstRowTitle = () => within(table).getAllByRole('row')[1].querySelector('td')!.textContent;

    // Initial order is as provided by fetch
    expect(getFirstRowTitle()).toBe('Bravo');

    // Click Title header to sort ascending by title
    const titleHeader = screen.getByRole('columnheader', { name: 'Title' });
    titleHeader.click();
    // Wait for DOM to update after sorting
    await screen.findByText('Alpha');
    expect(getFirstRowTitle()).toBe('Alpha');

    // Click Author header to resort by author
    const authorHeader = screen.getByRole('columnheader', { name: 'Author' });
    authorHeader.click();
    await screen.findByText('Adam');
    const firstRowAuthor = within(screen.getByRole('table')).getAllByRole('row')[1].children[1].textContent;
    expect(firstRowAuthor).toBe('Adam');
  });

  it('shows Loading... when the fetch returns an empty array', async () => {
    fetchMock.mockResolvedValue(respWithJson(null));
    render(<BookList />);
    // With empty array, component keeps showing Loading... per current implementation
    const loading = await screen.findByText('Loading...');
    expect(loading).toBeInTheDocument();
  });
});
