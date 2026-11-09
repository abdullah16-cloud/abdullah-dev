import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useBikes } from '../hooks/useBikes';
import { filterBikes, sortBikes, parseCatalogParams, buildCatalogParams } from '../utils/catalog';
import CatalogFilters from '../components/catalog/CatalogFilters';
import BikeCard from '../components/bikes/BikeCard';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import ErrorBoundary from '../components/common/ErrorBoundary';
import './BikesPage.css';

function BikesPageContent() {
  usePageTitle('All Bikes');
  const [searchParams, setSearchParams] = useSearchParams();
  const { bikes, isLoading, error, reload } = useBikes();

  // Parse filter state from URL query params
  const filterState = useMemo(() => parseCatalogParams(searchParams), [searchParams]);

  // Helper to update specific filter keys in URL
  const updateFilter = (key, value) => {
    const nextState = { ...filterState, [key]: value };
    const nextParams = buildCatalogParams(nextState);
    setSearchParams(nextParams, { replace: true });
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Filter and sort bikes
  const filteredBikes = useMemo(() => {
    const filtered = filterBikes(bikes, filterState);
    return sortBikes(filtered, filterState.sort);
  }, [bikes, filterState]);

  const hasVerifiedPrices = useMemo(
    () => bikes.some((b) => b.pricePkr !== null && b.pricePkr !== undefined),
    [bikes]
  );

  if (isLoading) {
    return (
      <div className="container catalog-page">
        <LoadingState message="Loading motorcycles catalog..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container catalog-page">
        <ErrorState
          title="Error loading catalog"
          message={error.message || 'Failed to load motorcycle data.'}
          onRetry={reload}
        />
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Header */}
        <header className="catalog-header">
          <h1 className="catalog-title">All Motorcycles</h1>
          <p className="catalog-intro">
            Explore popular Honda motorcycles across Pakistan. Compare models, specifications, and
            find the right ride for your journey.
          </p>
        </header>

        {/* Filter Controls */}
        <CatalogFilters
          filterState={filterState}
          onSearchChange={(val) => updateFilter('search', val)}
          onCategoryChange={(val) => updateFilter('category', val)}
          onAvailabilityChange={(val) => updateFilter('availability', val)}
          onSortChange={(val) => updateFilter('sort', val)}
          onClearFilters={handleClearFilters}
          hasVerifiedPrices={hasVerifiedPrices}
        />

        {/* Results Count & Grid / Empty State */}
        <div className="catalog-results-bar">
          <div className="catalog-count" role="status" aria-live="polite">
            Showing {filteredBikes.length} of {bikes.length} bikes
          </div>
        </div>

        {filteredBikes.length > 0 ? (
          <div className="catalog-grid" aria-label="Motorcycles catalog grid">
            {filteredBikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        ) : (
          <EmptyState activeFilters={filterState} onClearFilters={handleClearFilters} />
        )}
      </div>
    </div>
  );
}

function BikesPage() {
  return (
    <ErrorBoundary>
      <BikesPageContent />
    </ErrorBoundary>
  );
}

export default BikesPage;
