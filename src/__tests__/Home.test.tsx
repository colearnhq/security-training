/**
 * Comprehensive tests for Home component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { Home } from '../Home';

const mockApiPost = jest.fn();
const mockHostIdentity = { get: jest.fn(() => null) };
const mockPlayerIdentity = {
  get: jest.fn(() => null),
  set: jest.fn(),
};

jest.mock('../live/client', () => ({
  apiPost: (...args: any[]) => mockApiPost(...args),
  hostIdentity: mockHostIdentity,
  playerIdentity: mockPlayerIdentity,
}));

jest.mock('../components/Shell', () => ({
  Shell: ({ children }: any) => <div data-testid="shell">{children}</div>,
}));

describe('Home Component', () => {
  const mockOnJoined = jest.fn();
  const mockOnHost = jest.fn();
  const mockOnSolo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiPost.mockReset();
    mockHostIdentity.get.mockReturnValue(null);
    mockPlayerIdentity.get.mockReturnValue(null);
  });

  test('renders without crashing', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByText(/Colearn Security Training/)).toBeInTheDocument();
  });

  test('displays title', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByText("Fajar's First Month")).toBeInTheDocument();
  });

  test('displays lead text', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByText(/A story-driven security adventure/)).toBeInTheDocument();
  });

  test('renders join form', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByText(/Join a live game/)).toBeInTheDocument();
  });

  test('renders pin input', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByPlaceholderText('Game PIN')).toBeInTheDocument();
  });

  test('renders name input', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
  });

  test('renders join button', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByText(/Join/)).toBeInTheDocument();
  });

  test('join button is disabled when pin empty', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    const button = screen.getByText(/Join/) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  test('join button is disabled when name empty', () => {
    render(<Home initialPin="1234" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    const button = screen.getByText(/Join/) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  test('join button is enabled when pin and name filled', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    fireEvent.change(screen.getByPlaceholderText('Game PIN'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Test' } });
    const button = screen.getByText(/Join/) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  test('updates pin input value', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    const input = screen.getByPlaceholderText('Game PIN') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5678' } });
    expect(input.value).toBe('5678');
  });

  test('updates name input value', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    const input = screen.getByPlaceholderText('Your name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(input.value).toBe('Alice');
  });

  test('uses initial pin value', () => {
    render(<Home initialPin="9999" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    const input = screen.getByPlaceholderText('Game PIN') as HTMLInputElement;
    expect(input.value).toBe('9999');
  });

  test('renders host button', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByText(/Host a live session/)).toBeInTheDocument();
  });

  test('renders solo button', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByText(/Play solo/)).toBeInTheDocument();
  });

  test('calls onHost when host button clicked', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    fireEvent.click(screen.getByText(/Host a live session/));
    expect(mockOnHost).toHaveBeenCalled();
  });

  test('calls onSolo when solo button clicked', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    fireEvent.click(screen.getByText(/Play solo/));
    expect(mockOnSolo).toHaveBeenCalled();
  });

  test('shows resume hosting text when saved host exists', () => {
    mockHostIdentity.get.mockReturnValue({ pin: '1234' });
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByText(/Resume hosting game 1234/)).toBeInTheDocument();
  });

  test('displays disclaimer', () => {
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    expect(screen.getByText(/All scenarios are fictional/)).toBeInTheDocument();
  });

  test('successful join calls onJoined', async () => {
    mockApiPost.mockResolvedValue({
      playerId: 'p123',
      reconnected: false,
      name: 'Test User',
      joinedStep: 0,
    });
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    
    fireEvent.change(screen.getByPlaceholderText('Game PIN'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText(/Join/));

    await waitFor(() => {
      expect(mockOnJoined).toHaveBeenCalled();
    });
  });

  test('join failure shows error message', async () => {
    mockApiPost.mockRejectedValue(new Error('Game not found'));
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    
    fireEvent.change(screen.getByPlaceholderText('Game PIN'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText(/Join/));

    await waitFor(() => {
      expect(screen.getByText('Game not found')).toBeInTheDocument();
    });
  });

  test('shows busy state during join', async () => {
    mockApiPost.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<Home initialPin="" onJoined={mockOnJoined} onHost={mockOnHost} onSolo={mockOnSolo} />);
    
    fireEvent.change(screen.getByPlaceholderText('Game PIN'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText(/Join/));

    expect(screen.getByText(/Joining…/)).toBeInTheDocument();
  });
});
