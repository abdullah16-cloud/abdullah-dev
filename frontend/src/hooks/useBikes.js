import { useState, useCallback, useEffect } from 'react';
import { catalogService } from '../services/catalogService';
import { bikes as staticBikes } from '../data/bikes';

/**
 * Hook to load motorcycle catalog data.
 * Fetches live products from the backend API on mount.
 * Listens to 'products-updated' event for instant synchronization with Admin Panel.
 */
export function useBikes() {
  const [bikes, setBikes] = useState(staticBikes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await catalogService.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setBikes(data);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load bikes from API.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Fetch live catalog from backend API on mount
    catalogService
      .getProducts()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBikes(data);
        }
      })
      .catch(() => {
        // Fallback gracefully to static bikes if backend is offline
      });

    // Listen to admin update events for live sync
    const handleProductsUpdated = () => {
      catalogService
        .getProducts()
        .then((data) => {
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setBikes(data);
          }
        })
        .catch(() => {});
    };

    window.addEventListener('products-updated', handleProductsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('products-updated', handleProductsUpdated);
    };
  }, []);

  return { bikes, isLoading, error, reload };
}
