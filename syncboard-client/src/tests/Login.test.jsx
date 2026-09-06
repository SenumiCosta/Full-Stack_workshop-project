import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import api from '../api/apiClient';

jest.mock('../api/apiClient');

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Page Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login page correctly', () => {
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
  });

  test('shows error when email and password are empty', () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText('name@email.com');
    const passwordInput = document.querySelector(
      'input[type="password"]'
    );

    fireEvent.change(emailInput, {
      target: { value: '' }
    });

    fireEvent.change(passwordInput, {
      target: { value: '' }
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign In' })
    );

    expect(
      screen.getByText('Please fill in all fields.')
    ).toBeInTheDocument();
  });

  test('updates email and password inputs correctly', () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText('name@email.com');
    const passwordInput = document.querySelector(
      'input[type="password"]'
    );

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(passwordInput, {
      target: { value: 'pass123' }
    });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('pass123');
  });

  test('logs in successfully and stores authentication data', async () => {
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
        target: { value: 'pass123' }
      }
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign In' })
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/auth/login',
        {
          email: 'test@example.com',
          password: 'pass123'
        }
      );
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