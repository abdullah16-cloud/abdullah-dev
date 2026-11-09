import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BikesPage from './BikesPage';
import ErrorState from '../components/common/ErrorState';
import LoadingState from '../components/common/LoadingState';
import { bikes } from '../data/bikes';

describe('BikesPage Component Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderBikesPage = (initialEntry = '/bikes') => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/bikes" element={<BikesPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // Test 4: /bikes renders all bikes by default and shows correct result count
  it('renders all bikes by default and shows the correct result count', () => {
    renderBikesPage();

    expect(screen.getByRole('heading', { level: 1, name: /all motorcycles/i })).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(`showing ${bikes.length} of ${bikes.length} bikes`, 'i'))
    ).toBeInTheDocument();

    bikes.forEach((bike) => {
      expect(screen.getByRole('heading', { level: 3, name: bike.name })).toBeInTheDocument();
    });
  });

  // Test 5: /bikes?search=cg shows matching; /bikes?category=<slug> filters by category
  it('filters by search param and category param from URL query', () => {
    // Search param
    const { unmount } = renderBikesPage('/bikes?search=pridor');
    expect(screen.getByRole('heading', { level: 3, name: 'Honda Pridor' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Honda CD 70' })
    ).not.toBeInTheDocument();
    unmount();

    // Category param
    renderBikesPage('/bikes?category=commuter');
    const commuterBikes = bikes.filter((b) => b.category === 'commuter');
    expect(
      screen.getByText(new RegExp(`showing ${commuterBikes.length} of ${bikes.length} bikes`, 'i'))
    ).toBeInTheDocument();
  });

  // Test 6: Typing in search updates results (using fake timers for debounce)
  it('typing in search updates results after debounce', () => {
    renderBikesPage();

    const searchInput = screen.getByLabelText(/search motorcycles by name or category/i);

    // Type "Dream" into search
    fireEvent.change(searchInput, { target: { value: 'Dream' } });

    // Before debounce timer fires
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // After debounce timer fires (300ms)
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(
      screen.getByRole('heading', { level: 3, name: 'Honda CD 70 Dream' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Honda Pridor' })
    ).not.toBeInTheDocument();
  });

  // Test 7: Sorting by name changes card order
  it('sorting by name changes the card order', () => {
    renderBikesPage('/bikes?sort=name-desc');

    const headings = screen.getAllByRole('heading', { level: 3 });
    // First card in descending alphabetical sort should be Pridor
    expect(headings[0]).toHaveTextContent('Honda Pridor');
  });

  // Test 8: No-match search shows EmptyState; "Clear all filters" restores all bikes
  it('no-match search shows EmptyState and Clear all filters restores all bikes', () => {
    renderBikesPage('/bikes?search=nonexistentbike');

    expect(
      screen.getByRole('heading', { level: 3, name: /no motorcycles found/i })
    ).toBeInTheDocument();

    // Click "Clear all filters"
    const clearBtns = screen.getAllByRole('button', { name: /clear all filters/i });
    fireEvent.click(clearBtns[0]);

    expect(
      screen.getByText(new RegExp(`showing ${bikes.length} of ${bikes.length} bikes`, 'i'))
    ).toBeInTheDocument();
  });

  // Test 9: ErrorState renders with role="alert" and "Try again" calls handler; LoadingState sets aria-busy
  it('ErrorState renders with role="alert" and retry handler, LoadingState sets aria-busy', () => {
    const handleRetry = vi.fn();
    const { unmount } = render(
      <ErrorState title="Failed to load" message="Network error" onRetry={handleRetry} />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
    unmount();

    // Test LoadingState
    render(<LoadingState message="Loading bikes..." />);
    const loadingElem = screen.getByRole('status');
    expect(loadingElem).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading bikes...')).toBeInTheDocument();
  });
});
