import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('./services/firebaseService', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  observeAuthState: jest.fn(),
  loginWithGoogle: jest.fn(),
}));

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});