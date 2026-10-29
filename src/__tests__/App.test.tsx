/**
 * Comprehensive tests for App component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import App from '../App';

jest.mock('../Home', () => ({
  Home: ({ onJoined, onHost, onSolo }: any) => (
    <div data-testid="home">
      <button onClick={() => onJoined({ pin: '1234', playerId: 'p1', name: 'Test', joinedStep: 0 }, false)}>Join</button>
      <button onClick={onHost}>Host</button>
      <button onClick={onSolo}>Solo</button>
    </div>
  ),
}));

jest.mock('../SoloGame', () => ({
  SoloGame: ({ onHome }: any) => (
    <div data-testid="solo-game">
      <button onClick={onHome}>Back Home</button>
    </div>
  ),
}));

jest.mock('../live/HostApp', () => ({
  HostApp: ({ onExit }: any) => (
    <div data-testid="host-app">
      <button onClick={onExit}>Exit</button>
    </div>
  ),
}));

jest.mock('../live/PlayerApp', () => ({
  PlayerApp: ({ onLeave, onSolo }: any) => (
    <div data-testid="player-app">
      <button onClick={onLeave}>Leave</button>
      <button onClick={onSolo}>Switch to Solo</button>
    </div>
  ),
}));

jest.mock('../live/client', () => ({
  playerIdentity: {
    get: jest.fn(() => null),
    set: jest.fn(),
    clear: jest.fn(),
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { search: '', pathname: '/' };
    (window as any).history = { replaceState: jest.fn() };
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  test('starts in home mode by default', () => {
    render(<App />);
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  test('switches to solo mode when solo clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Solo'));
    expect(screen.getByTestId('solo-game')).toBeInTheDocument();
  });

  test('switches to host mode when host clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Host'));
    expect(screen.getByTestId('host-app')).toBeInTheDocument();
  });

  test('switches to player mode when joined', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Join'));
    expect(screen.getByTestId('player-app')).toBeInTheDocument();
  });

  test('returns to home from solo mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Solo'));
    expect(screen.getByTestId('solo-game')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back Home'));
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  test('returns to home from host mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Host'));
    expect(screen.getByTestId('host-app')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Exit'));
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  test('returns to home from player mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Join'));
    expect(screen.getByTestId('player-app')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Leave'));
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  test('switches from player to solo mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Join'));
    expect(screen.getByTestId('player-app')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Switch to Solo'));
    expect(screen.getByTestId('solo-game')).toBeInTheDocument();
  });
});
