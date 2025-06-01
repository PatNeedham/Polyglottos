import { render, screen, waitFor } from '@testing-library/react';
import { vi, expect, test } from 'vitest';
import React from 'react';
import Index from '../../app/routes/_index';

// Mock the session utility since we don't have localStorage in test environment
vi.mock('../../app/utils/session', () => ({
  getSession: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue('test-user-id'),
  }),
}));

// Mock useNavigate to prevent navigation during tests
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: (props: { to: string; children: React.ReactNode }) =>
      React.createElement('a', { href: props.to }, props.children),
  };
});

test('renders welcome page when user is logged in', async () => {
  render(React.createElement(Index));

  // Wait for the component to render after useEffect
  await waitFor(() => {
    expect(screen.getByText('Welcome to Polyglottos')).toBeDefined();
    expect(
      screen.getByText('Start learning languages efficiently!')
    ).toBeDefined();
  });
});
