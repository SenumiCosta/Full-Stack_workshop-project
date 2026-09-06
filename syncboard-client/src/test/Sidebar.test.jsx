import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import Sidebar from '../components/Sidebar/Sidebar'
import api from '../api/apiClient'

vi.mock('../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Sidebar', () => {
  const boards = [
    { _id: '1', name: 'Board 1' },
    { _id: '2', name: 'Board 2' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders boards fetched from API', async () => {
    api.get.mockResolvedValueOnce({
      data: boards
    })

    render(
      <Sidebar
        activeBoardId="1"
        onSelectBoard={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Board 1/)).toBeInTheDocument()
      expect(screen.getByText(/Board 2/)).toBeInTheDocument()
    })
  })

  test('selects board when clicked', async () => {
    api.get.mockResolvedValueOnce({
      data: boards
    })

    const onSelectBoard = vi.fn()

    render(
      <Sidebar
        activeBoardId="1"
        onSelectBoard={onSelectBoard}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Board 2/)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/Board 2/))

    expect(onSelectBoard).toHaveBeenCalledWith('2')
  })
})