import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { BoardContext } from '../context/BoardContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  tasks: [
    {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test description',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Member 4',
    },
  ],
};

const renderDashboard = () => {
  const contextValue = {
    boards: [mockBoard],
    activeBoard: mockBoard,
    activeBoardId: 'board-1',
    setActiveBoardId: vi.fn(),
    isOffline: false,
    toggleConnection: vi.fn(),
    moveTask: vi.fn(),
    createBoard: vi.fn(),
    deleteBoard: vi.fn(),
    addTask: vi.fn(),
    activityLogs: [],
  };

  return render(
    <MemoryRouter>
      <BoardContext.Provider value={contextValue}>
        <Dashboard />
      </BoardContext.Provider>
    </MemoryRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.setItem('syncboard_auth', 'true');
    localStorage.setItem('syncboard_user', 'Member 4');
  });

  it('renders the SyncBoard dashboard', () => {
    renderDashboard();

    expect(screen.getByText('SyncBoard')).toBeInTheDocument();
    expect(screen.getByText('Test Board')).toBeInTheDocument();
  });

  it('displays task information', () => {
    renderDashboard();

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Member 4')).toBeInTheDocument();
  });

  it('displays all task status columns', () => {
    renderDashboard();

    expect(screen.getByText('Not Started')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('opens the create task modal when Add Task Card is clicked', () => {
    renderDashboard();

    const addButtons = screen.getAllByText('Add Task Card');

    fireEvent.click(addButtons[0]);

    expect(screen.getByText(/create task/i)).toBeInTheDocument();
  });

  it('calls toggleConnection when offline button is clicked', () => {
    const toggleConnection = vi.fn();

    const contextValue = {
      boards: [mockBoard],
      activeBoard: mockBoard,
      activeBoardId: 'board-1',
      setActiveBoardId: vi.fn(),
      isOffline: false,
      toggleConnection,
      moveTask: vi.fn(),
      createBoard: vi.fn(),
      deleteBoard: vi.fn(),
      addTask: vi.fn(),
      activityLogs: [],
    };

    render(
      <MemoryRouter>
        <BoardContext.Provider value={contextValue}>
          <Dashboard />
        </BoardContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Go Offline'));

    expect(toggleConnection).toHaveBeenCalledTimes(1);
  });

  it('logs out the user', () => {
    renderDashboard();

    fireEvent.click(screen.getByText('Logout'));

    expect(localStorage.getItem('syncboard_auth')).toBeNull();
    expect(localStorage.getItem('syncboard_user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});