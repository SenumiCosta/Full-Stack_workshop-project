import React from 'react'
import { describe, expect, it, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { BoardProvider, BoardContext } from '../context/BoardContext'

const wrapper = ({ children }) => (
  <BoardProvider>{children}</BoardProvider>
)

describe('BoardContext', () => {

  beforeEach(() => {
    localStorage.clear()
  })

  it('loads the default board', () => {
    const { result } = renderHook(
      () => React.useContext(BoardContext),
      { wrapper }
    )

    expect(result.current.boards.length).toBeGreaterThan(0)
    expect(result.current.activeBoard).not.toBeNull()
  })

  it('creates a new board', () => {
    const { result } = renderHook(
      () => React.useContext(BoardContext),
      { wrapper }
    )

    const initialCount = result.current.boards.length

    act(() => {
      result.current.createBoard('Test Board')
    })

    expect(result.current.boards.length).toBe(initialCount + 1)

    expect(
      result.current.boards.some(
        board => board.name === 'Test Board'
      )
    ).toBe(true)
  })

  it('adds a task to a board', () => {
    const { result } = renderHook(
      () => React.useContext(BoardContext),
      { wrapper }
    )

    const boardId = result.current.activeBoardId

    act(() => {
      result.current.addTask(boardId, {
        title: 'Test Task',
        description: 'Testing task creation',
        priority: 'High',
        assignee: 'Member 4',
        status: 'Not Started'
      })
    })

    const board = result.current.boards.find(
      board => board.id === boardId
    )

    expect(
      board.tasks.some(
        task => task.title === 'Test Task'
      )
    ).toBe(true)
  })

  it('moves a task to another status', () => {
    const { result } = renderHook(
      () => React.useContext(BoardContext),
      { wrapper }
    )

    const boardId = result.current.activeBoardId
    const taskId = result.current.activeBoard.tasks[0].id

    act(() => {
      result.current.moveTask(
        boardId,
        taskId,
        'Done',
        'Member 4'
      )
    })

    const updatedBoard = result.current.boards.find(
      board => board.id === boardId
    )

    const updatedTask = updatedBoard.tasks.find(
      task => task.id === taskId
    )

    expect(updatedTask.status).toBe('Done')
  })
})