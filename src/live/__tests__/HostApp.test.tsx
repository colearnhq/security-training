/**
 * Basic tests for HostApp component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import { HostApp } from '../HostApp';

const mockHostIdentity = {
  get: jest.fn(() => null),
  set: jest.fn(),
  clear: jest.fn(),
};

jest.mock('../client', () => ({
  hostIdentity: mockHostIdentity,
  apiPost: jest.fn(),
  apiGet: jest.fn(),
  usePolling: jest.fn(() => ({ data: null, error: null, refresh: jest.fn() })),
  useTicker: jest.fn(),
}));

jest.mock('../HostResults', () => ({
  HostResults: () => <div data-testid="host-results">Results</div>,
}));

jest.mock('../../components/Shell', () => ({
  Shell: ({ children, onBrand }: any) => (
    <div>
      <button onClick={onBrand}>Exit</button>
      {children}
    </div>
  ),
}));

jest.mock('../../components/ScoringRules', () => ({
  ScoringRules: () => <div>Scoring Rules</div>,
}));

jest.mock('../../components/SceneBody', () => ({
  SceneBody: () => <div>Scene Body</div>,
}));

jest.mock('../ui', () => ({
  DurationPicker: ({ onChange }: any) => <button onClick={() => onChange(15)}>Duration</button>,
  Countdown: () => <div>Countdown</div>,
  LiveChoices: () => <div>Choices</div>,
  Distribution: () => <div>Distribution</div>,
  countPlayers: (n: number) => `${n} players`,
}));

jest.mock('qrcode', () => ({
  default: {
    toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,mock')),
  },
}));

describe('HostApp Component', () => {
  test('renders create form when no identity', () => {
    mockHostIdentity.get.mockReturnValue(null);
    render(<HostApp onExit={jest.fn()} />);
    expect(screen.getByText(/Host a live session/)).toBeInTheDocument();
  });

  test('shows passcode input', () => {
    mockHostIdentity.get.mockReturnValue(null);
    render(<HostApp onExit={jest.fn()} />);
    expect(screen.getByLabelText(/Admin passcode/)).toBeInTheDocument();
  });

  test('shows back button', () => {
    mockHostIdentity.get.mockReturnValue(null);
    render(<HostApp onExit={jest.fn()} />);
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  test('calls onExit when back clicked', () => {
    const onExit = jest.fn();
    mockHostIdentity.get.mockReturnValue(null);
    render(<HostApp onExit={onExit} />);
    fireEvent.click(screen.getByText('Back'));
    expect(onExit).toHaveBeenCalled();
  });
});
