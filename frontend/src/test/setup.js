import '@testing-library/jest-dom/vitest';

// Mock window.scrollTo for jsdom environment
window.scrollTo = vi.fn();
