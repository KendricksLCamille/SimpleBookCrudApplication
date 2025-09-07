import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock fetch before importing component
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// Mock Chart.js to avoid canvas rendering errors in jsdom
vi.mock('chart.js', () => {
  class FakeChart {
    // minimal API used by component
    constructor() {}
    destroy() {}
    static register() {}
  }
  return {
    Chart: FakeChart,
    ArcElement: {},
    Title: {},
    Tooltip: {},
    Legend: {},
    DoughnutController: {},
    BarController: {},
    BarElement: {},
    CategoryScale: {},
    LinearScale: {},
  };
});

import Statistics from './Statistic2';

function respOk(jsonValue: unknown) {
  return {
    ok: true,
    json: async () => jsonValue,
  } as Response;
}

function respNotOk(status = 500) {
  return {
    ok: false,
    status,
    json: async () => ({}),
  } as unknown as Response;
}

describe('Statistics (Statistic2)', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it('shows Loading... initially and then renders title and canvas on success', async () => {
    const stats = { Fiction: 3, NonFiction: 2 };
    fetchMock.mockResolvedValue(respOk(stats));

    render(<Statistics />);

    // Initially loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // After fetch, title appears
    const title = await screen.findByText('Book Statistics');
    expect(title).toBeInTheDocument();

    // Canvas present (query by element since jsdom doesn't expose canvas role)
    const canvasEl = document.querySelector('canvas');
    expect(canvasEl).toBeTruthy();

    // Toggle label should indicate switching to Bar Chart initially
    expect(screen.getByText(/Switch to Bar Chart/i)).toBeInTheDocument();

    // Ensure fetch called with stats endpoint
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/books\/stats$/));
  });

  it('toggles between doughnut and bar text when checkbox is clicked', async () => {
    const stats = { A: 1, B: 2 };
    fetchMock.mockResolvedValue(respOk(stats));

    render(<Statistics />);

    await screen.findByText('Book Statistics');

    const checkbox = screen.getByRole('checkbox');
    // Initial label says Switch to Bar Chart
    expect(screen.getByText(/Switch to Bar Chart/)).toBeInTheDocument();

    // Click to switch to bar
    fireEvent.click(checkbox);
    expect(screen.getByText(/Switch to Doughnut Chart/)).toBeInTheDocument();

    // Click again back to doughnut
    fireEvent.click(checkbox);
    expect(screen.getByText(/Switch to Bar Chart/)).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    fetchMock.mockResolvedValue(respNotOk(500));

    render(<Statistics />);

    const err = await screen.findByText(/Error:/);
    expect(err).toBeInTheDocument();
  });

  it('renders no data state when API returns null', async () => {
    fetchMock.mockResolvedValue(respOk(null));

    render(<Statistics />);

    const noData = await screen.findByText(/No data available/);
    expect(noData).toBeInTheDocument();
  });
});
