import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from './SignUp';
import api from '../api/apiClient';

import { vi } from 'vitest';

vi.mock('../api/apiClient');

const renderSignUp = () => {
  return render(
    <BrowserRouter>
      <SignUp />
    </BrowserRouter>
  );
};

describe('SignUp Page', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renders the signup form', () => {
    renderSignUp();

    expect(screen.getByText('SyncBoard')).toBeInTheDocument();
    expect(
      screen.getByText('Create your account')
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('John Doe')
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('name@email.com')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Sign Up' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Already have an account?')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Login' })
    ).toBeInTheDocument();
  });

  test('updates name, email and password fields', () => {
    renderSignUp();

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('name@email.com');

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(nameInput, {
      target: { value: 'Test User' }
    });

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });

    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password123' }
    });

    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  test('shows error when passwords do not match', () => {
    renderSignUp();

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('name@email.com');

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(nameInput, {
      target: { value: 'Test User' }
    });

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });

    fireEvent.change(confirmPasswordInput, {
      target: { value: 'different123' }
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign Up' })
    );

    expect(
      screen.getByText('Passwords do not match.')
    ).toBeInTheDocument();

    expect(api.post).not.toHaveBeenCalled();
  });

  test('submits registration successfully', async () => {
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

    renderSignUp();

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('name@email.com');

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(nameInput, {
      target: { value: 'Test User' }
    });

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });

    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password123' }
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign Up' })
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/auth/register',
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      );
    });

    await waitFor(() => {
      expect(
        localStorage.getItem('syncboard_token')
      ).toBe('test-token');

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

  test('shows error when registration fails', async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          message: 'Email already exists'
        }
      }
    });

    renderSignUp();

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('name@email.com');

    const passwordInputs =
      screen.getAllByPlaceholderText('••••••••');

    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(nameInput, {
      target: { value: 'Test User' }
    });

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });

    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password123' }
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign Up' })
    );

    expect(
      await screen.findByText('Email already exists')
    ).toBeInTheDocument();
  });

});

