/**
 * Basic tests for PlayerApp component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import { PlayerApp } from '../PlayerApp';

jest.mock('../client', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  usePolling: jest.fn(() => ({
    data: {
      room: {
        pin: '1234',
        phase: 'lobby',
        history: [],
        deadline: null,
      },
      me: { name: 'Test', joinedAt: Date.now(), joinedStep: 0 },
    },
    error: null,
    refresh: jest.fn(),
  })),
  useTicker: jest.fn(),
}));

jest.mock('../../components/Shell', () => ({
  Shell: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('../../components/ScoringRules', () => ({
  ScoringRules: () => <div>Scoring Rules</div>,
}));

jest.mock('../../components/SceneBody', () => ({
  SceneBody: () => <div>Scene</div>,
}));

jest.mock('../ui', () => ({
  Countdown: () => <div>Countdown</div>,
  LiveChoices: () => <div>Choices</div>,
}));

jest.mock('../../components/OutcomeScreen', () => ({
  OutcomeScreen: () => <div>Outcome</div>,
  formatPoints: (n: number) => String(n),
}));

jest.mock('../../components/EndingScreen', () => ({
  EndingScreen: () => <div>Ending</div>,
}));

jest.mock('../../components/AdBreak', () => ({
  AdBreak: () => <div>Ad</div>,
}));

jest.mock('../../SoloGame', () => ({
  continueInSolo: jest.fn(),
}));

jest.mock('../logic', () => ({
  livePhase: jest.fn(() => 'lobby'),
  liveScore: jest.fn(() => ({ points: 0, max: 0 })),
  orderedChoices: jest.fn(() => []),
  playerRecords: jest.fn(() => []),
  sceneNumber: jest.fn(() => 1),
}));

jest.mock('../../data/scenes', () => ({
  SCENE_BY_ID: {},
}));

jest.mock('../../data/ads', () => ({
  AD_BY_ID: {},
}));

describe('PlayerApp Component', () => {
  const mockIdentity = {
    pin: '1234',
    playerId: 'p1',
    name: 'Test Player',
    joinedStep: 0,
  };

  test('renders without crashing', () => {
    render(
      <PlayerApp
        identity={mockIdentity}
        onLeave={jest.fn()}
        onSolo={jest.fn()}
      />
    );
    expect(screen.getByText(/Scoring Rules/)).toBeInTheDocument();
  });

  test('shows game PIN', () => {
    render(
      <PlayerApp
        identity={mockIdentity}
        onLeave={jest.fn()}
        onSolo={jest.fn()}
      />
    );
    expect(screen.getByText(/1234/)).toBeInTheDocument();
  });
});
