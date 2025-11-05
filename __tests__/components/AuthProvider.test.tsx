import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import { mockUser, mockSession } from '../../__mocks__/supabase'

// Mock the Supabase client module
jest.mock('@/lib/supabase', () => {
  const { createMockSupabaseClient } = require('../../__mocks__/supabase')
  return {
    supabase: createMockSupabaseClient(),
  }
})

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Test component to access auth context
const TestComponent = () => {
  const { user, session, loading } = useAuth()

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <div data-testid="session">{session ? 'Has Session' : 'No Session'}</div>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should render children', () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      )

      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should start in loading state', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    })
  })

  describe('Authentication State', () => {
    it('should provide user and session when authenticated', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email || '')
        expect(screen.getByTestId('session')).toHaveTextContent('Has Session')
      })
    })

    it('should update loading state after initialization', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')

      // Should finish loading
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })
    })
  })

  describe('useAuth Hook', () => {
    it('should provide auth context values', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toBeInTheDocument()
        expect(screen.getByTestId('session')).toBeInTheDocument()
        expect(screen.getByTestId('loading')).toBeInTheDocument()
      })
    })
  })

  describe('Sign Out', () => {
    it('should provide signOut function', async () => {
      const SignOutComponent = () => {
        const { signOut } = useAuth()

        return (
          <button onClick={signOut} data-testid="signout-btn">
            Sign Out
          </button>
        )
      }

      render(
        <AuthProvider>
          <SignOutComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('signout-btn')).toBeInTheDocument()
      })
    })
  })

  describe('Session Validation', () => {
    it('should handle session validation', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for auth state to be established
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      // Should have valid session
      await waitFor(() => {
        expect(screen.getByTestId('session')).toHaveTextContent('Has Session')
      })
    })
  })
})
