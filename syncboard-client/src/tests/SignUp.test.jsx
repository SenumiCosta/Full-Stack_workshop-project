import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../pages/SignUp';
import api from '../api/apiClient';

jest.mock('../api/apiClient');

describe('SignUp Page Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders signup page correctly', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByText('SyncBoard')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'Test User' }
    });

    fireEvent.change(screen.getByPlaceholderText('name@email.com'), {
      target: { value: 'test@example.com' }
    });

    const passwordInputs = screen.getAllByDisplayValue('');

    fireEvent.change(passwordInputs[0], {
      target: { value: 'password123' }
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: 'different123' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(
      await screen.findByText('Passwords do not match.')
    ).toBeInTheDocument();

    expect(api.post).not.toHaveBeenCalled();
  });

  test('updates input fields correctly', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('name@email.com');

    fireEvent.change(nameInput, {
      target: { value: 'Test User' }
    });

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });

    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('test@example.com');
  });

  test('signs up successfully and stores authentication data', async () => {
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

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'Test User' }
    });

    fireEvent.change(screen.getByPlaceholderText('name@email.com'), {
      target: { value: 'test@example.com' }
    });

    const passwordInputs = screen.getAllByDisplayValue('');

    fireEvent.change(passwordInputs[0], {
      target: { value: 'password123' }
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

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

    expect(localStorage.getItem('syncboard_token')).toBe('test-token');

    expect(
      JSON.parse(localStorage.getItem('syncboard_user'))
    ).toEqual({
      id: '123',
      name: 'Test User',
      email: 'test@example.com'
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

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'Test User' }
    });

    fireEvent.change(screen.getByPlaceholderText('name@email.com'), {
      target: { value: 'test@example.com' }
    });

    const passwordInputs = screen.getAllByDisplayValue('');

    fireEvent.change(passwordInputs[0], {
      target: { value: 'password123' }
    });

    fireEvent.change(passwordInputs[1], {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(
      await screen.findByText('Email already exists')
    ).toBeInTheDocument();
  });

});