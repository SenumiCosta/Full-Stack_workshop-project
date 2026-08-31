import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from './Login';
import api from '../api/apiClient';

vi.mock('../api/apiClient');

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renders the login form', () => {
    renderLogin();

    expect(screen.getByText('SyncBoard')).toBeInTheDocument();

    expect(
      screen.getByText('Sign in to collaborate')
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('name@email.com')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Sign In' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Sign Up')
    ).toBeInTheDocument();
  });

  test('updates email and password fields', () => {
    renderLogin();

    const email = screen.getByPlaceholderText('name@email.com');

    const password = document.querySelector(
      'input[type="password"]'
    );

    fireEvent.change(email, {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(password, {
      target: { value: 'password123' }
    });

    expect(email).toHaveValue('test@example.com');
    expect(password).toHaveValue('password123');
  });

  test('logs in successfully', async () => {
    api.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    });

    renderLogin();

    fireEvent.change(
      screen.getByPlaceholderText('name@email.com'),
      {
        target: { value: 'test@example.com' }
      }
    );

    fireEvent.change(
      document.querySelector('input[type="password"]'),
      {
        target: { value: 'password123' }
      }
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign In' })
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });

      expect(
        localStorage.getItem('syncboard_token')
      ).toBe('test-token');

      expect(
        localStorage.getItem('syncboard_auth')
      ).toBe('true');

      expect(
        localStorage.getItem('syncboard_user')
      ).toBe(
        JSON.stringify({
          id: '123',
          name: 'Test User',
          email: 'test@example.com'
        })
      );
    });
  });

  test('shows error when login fails', async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    });

    renderLogin();

    fireEvent.change(
      screen.getByPlaceholderText('name@email.com'),
      {
        target: { value: 'wrong@example.com' }
      }
    );

    fireEvent.change(
      document.querySelector('input[type="password"]'),
      {
        target: { value: 'wrongpassword' }
      }
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign In' })
    );

    expect(
      await screen.findByText('Invalid credentials')
    ).toBeInTheDocument();
  });
});