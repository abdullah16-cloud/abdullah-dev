import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title per page.
 * @param {string} title Page title
 */
export function usePageTitle(title) {
  useEffect(() => {
    const defaultTitle = 'Honda Bikes Store';
    document.title = title ? `${title} | ${defaultTitle}` : defaultTitle;
  }, [title]);
}
