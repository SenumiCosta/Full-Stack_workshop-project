import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import api from '../api/apiClient';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

const mockBoard = {
  _id: 'board-1',
  name: 'Test Board',
  organization: null,
};

const mockTasks = [
  {
    _id: 'task-1',
    title: 'Test Task',
    description: 'Test description',
    status: 'Not Started',
    priority: 'High',
    assignee: { name: 'Member 4' },
    updatedAt: new Date().toISOString()
  },
];

import { CacheProvider } from '../context/CacheContext';
import { SocketProvider } from '../context/SocketContext';

const renderDashboard = () => {
  return render(
    <CacheProvider>
      <SocketProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </SocketProvider>
    </CacheProvider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('syncboard_auth', 'true');
    localStorage.setItem('syncboard_token', 'test-token');
    localStorage.setItem('syncboard_user', JSON.stringify({ name: 'Member 4' }));

    api.get.mockImplementation((url) => {
      if (url.includes('/tasks')) {
        return Promise.resolve({ data: { success: true, data: mockTasks } });
      }
      if (url.includes('/orgs')) {
        return Promise.resolve({ data: { success: true, data: [] } });
      }
      return Promise.resolve({ data: { success: true, data: [mockBoard] } });
    });
  });

  it('renders the Dashboard and active board', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('Test Board').length).toBeGreaterThan(0);
    });
  });

  it('displays task information', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getAllByText('Member 4').length).toBeGreaterThan(0);
    });
  });

  it('displays all task status columns', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Not Started')).toBeInTheDocument();
      expect(screen.getByText('Doing')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('opens the create task modal when Add Task is clicked', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('Test Board').length).toBeGreaterThan(0);
    });

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/Create Task/i)).toBeInTheDocument();
  });

  it('logs out the user when sign out is clicked', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('Test Board').length).toBeGreaterThan(0);
    });

    const logoutBtn = screen.getByTitle('Sign out');
    fireEvent.click(logoutBtn);

    expect(localStorage.getItem('syncboard_auth')).toBeNull();
    expect(localStorage.getItem('syncboard_user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});