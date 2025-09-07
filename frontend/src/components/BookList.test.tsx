import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Set up a fetch mock BEFORE importing the component module
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import BookList from './BookList';

// Helpers to build mock fetch responses
function respWithJson(jsonValue: unknown): Response {
  return { json: async () => jsonValue } as unknown as Response;
}

// Helper to render BookList with a custom setState function, matching the component's atypical signature
function renderWithSetState(spy?: (s: { id: string }) => void) {
  const setState = spy ?? vi.fn();
  function Wrapper() {
    // Call component directly to pass the function instead of React props object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return BookList(setState as any);
  }
  return { ...render(<Wrapper />), setState };
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
    // Do not resolve fetch yet; we just assert the initial state.
    const { setState } = renderWithSetState();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    // no row click happens, but ensure setState is not called during mount
    expect(setState).not.toHaveBeenCalled();
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

    renderWithSetState();

    // Wait for table to appear
    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
    const headers = within(table).getAllByRole('columnheader').map(th => th.textContent);
    expect(headers).toEqual(['Title', 'Author', 'Published Date', 'Genre', 'Rating', 'Actions']);

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
      'Delete',
    ]);

    // Verify fetch was called with expected URL
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/books$/));
  });

  it('sorts by clicking on column headers', async () => {
    const books = [
      { id: 'a', title: 'Bravo', author: 'Zeke', genre: 'A', publishedDate: '2023-01-01', rating: 3 },
      { id: 'b', title: 'Alpha', author: 'Adam', genre: 'B', publishedDate: '2024-05-01', rating: 4 },
    ];
    fetchMock.mockResolvedValue(respWithJson(books));

    renderWithSetState();
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

  it('invokes setState with the book id when a row is clicked', async () => {
    const books = [
      { id: 'a', title: 'Alpha', author: 'Adam', genre: 'G', publishedDate: '2022-02-02', rating: 2 },
    ];
    fetchMock.mockResolvedValue(respWithJson(books));

    const setStateSpy = vi.fn();
    renderWithSetState(setStateSpy);

    const row = await screen.findByRole('row', { name: /Alpha/i });
    // click the row
    (row as HTMLElement).click();

    expect(setStateSpy).toHaveBeenCalledWith({ id: 'a' });
  });

  it('shows Loading... when the fetch returns an empty array (interpreted as null)', async () => {
    fetchMock.mockResolvedValue(respWithJson(null));
    renderWithSetState();
    // With null, component keeps showing Loading... per current implementation
    const loading = await screen.findByText('Loading...');
    expect(loading).toBeInTheDocument();
  });
});

it('deletes a book when Delete button is clicked without triggering row selection', async () => {
  const books = [
    { id: 'x', title: 'To Delete', author: 'Auth', genre: 'G', publishedDate: '2020-01-01', rating: 3 },
  ];
  // First GET of books
  fetchMock.mockResolvedValueOnce(respWithJson(books));
  // Then DELETE
  fetchMock.mockResolvedValueOnce({ ok: true } as Response);

  const setStateSpy = vi.fn();
  renderWithSetState(setStateSpy);

  // Wait for row
  const row = await screen.findByRole('row', { name: /To Delete/i });
  const delBtn = within(row).getByRole('button', { name: /Delete/i });

  // Click delete
  (delBtn as HTMLElement).click();

  // Expect DELETE call with correct URL
  expect(fetchMock).toHaveBeenLastCalledWith(expect.stringMatching(/\/api\/books\/x$/), expect.objectContaining({ method: 'DELETE' }));

  // Row should be removed after deletion
  await screen.findByRole('table');
  expect(screen.queryByRole('row', { name: /To Delete/i })).toBeNull();

  // setState should not have been called by clicking delete button
  expect(setStateSpy).not.toHaveBeenCalled();
});
