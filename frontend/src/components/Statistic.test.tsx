import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import Statistic from './Statistic';

function respOk(jsonValue: unknown) {
  return { ok: true, json: async () => jsonValue } as Response;
}

function respNotOk(status = 500) {
  return { ok: false, status, json: async () => ({}) } as unknown as Response;
}

describe('Statistic', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it('shows loading, then renders canvas and a toggle that switches labels', async () => {
    const stats = { Fiction: 3, Mystery: 2, Fantasy: 5 };
    fetchMock.mockResolvedValue(respOk(stats));

    render(<Statistic />);

    expect(screen.getByText('Loading stats...')).toBeInTheDocument();

    const toggle = await screen.findByRole('button', { name: 'Toggle Chart' });
    expect(toggle).toBeInTheDocument();
    // Should start as Bar Chart text
    expect(screen.getByText('Bar Chart')).toBeInTheDocument();

    // Canvas present
    // Canvas present (jsdom doesn't expose a role for canvas reliably)
    expect(document.querySelector('canvas')).toBeTruthy();

    fireEvent.click(toggle);
    expect(screen.getByText('Pie Chart')).toBeInTheDocument();
  });

  it('shows a friendly message on empty stats', async () => {
    fetchMock.mockResolvedValue(respOk({}));
    render(<Statistic />);
    const msg = await screen.findByText('No statistics available.');
    expect(msg).toBeInTheDocument();
  });

  it('shows an error message when request fails', async () => {
    fetchMock.mockResolvedValue(respNotOk(503));
    render(<Statistic />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to load stats');
  });
});
