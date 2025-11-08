// 🤖 ROBOT ARMY - TEST ENVIRONMENT SETUP (ENHANCED)
// Date: November 8, 2025
// Mission: Configure global test environment for MASSIVE automated testing
// Status: Production Ready - Black Hole Testing Strategy

import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia (used by Tailwind + responsive UI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (used by lazy loading)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver (used by charts/responsive components)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Console suppression for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement') ||
        args[0].includes('Warning: An update to') ||
        args[0].includes('Warning: useLayoutEffect'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// 🔥 GLOBAL TEST UTILITIES - APOLLO MOCKING
export const mockApolloClient = {
  query: vi.fn(),
  mutate: vi.fn(),
  watchQuery: vi.fn(),
  readQuery: vi.fn(),
  writeQuery: vi.fn(),
  resetStore: vi.fn(),
  clearStore: vi.fn(),
};

export const mockGraphQLResponse = <T = any>(data: T) => ({
  data,
  loading: false,
  error: undefined,
  networkStatus: 7,
  called: true,
});

export const mockGraphQLError = (message: string) => ({
  data: undefined,
  loading: false,
  error: {
    message,
    graphQLErrors: [{ message, extensions: {} }],
    networkError: null,
    clientErrors: [],
    extraInfo: undefined,
    name: 'ApolloError',
  },
  networkStatus: 8,
  called: true,
});

export const mockGraphQLLoading = () => ({
  data: undefined,
  loading: true,
  error: undefined,
  networkStatus: 1,
  called: true,
});
