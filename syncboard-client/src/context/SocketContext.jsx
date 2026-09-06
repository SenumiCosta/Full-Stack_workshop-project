import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { initializeSocket, disconnectSocket } from '../socket';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const connect = (token) => {
    if (socketRef.current) {
      console.log('Socket already connected');
      return;
    }
    
    const socket = initializeSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  };

  const disconnect = () => {
    disconnectSocket();
    socketRef.current = null;
    setIsConnected(false);
    console.log('Socket disconnected manually');
  };

  const joinBoard = (boardId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-board', boardId);
      console.log(`Joined board: ${boardId}`);
    } else {
      console.warn('Cannot join board - socket not connected');
    }
  };

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Cannot emit event - socket not connected');
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnect();
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinBoard,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};