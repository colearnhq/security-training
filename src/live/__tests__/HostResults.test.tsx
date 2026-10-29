/**
 * Tests for HostResults component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import { HostResults } from '../HostResults';

jest.mock('../../components/OutcomeScreen', () => ({
  formatPoints: (n: number) => (n > 0 ? `+${n}` : String(n)),
}));

jest.mock('../../data/scenes', () => ({
  CATEGORY_LABEL: { security: 'Security' },
  SCENE_BY_ID: {
    s1: { id: 's1', category: 'security' },
  },
}));

jest.mock('../../data/ads', () => ({
  isAd: jest.fn(() => false),
}));

jest.mock('../../data/endings', () => ({
  ENDINGS: [
    { id: 'champion', emoji: '🏆', title: 'Champion', tone: 'good' },
    { id: 'fired', emoji: '💥', title: 'Fired', tone: 'bad' },
  ],
}));

jest.mock('../logic', () => ({
  playerResult: jest.fn((p: any) => ({
    id: p.id,
    name: p.name,
    points: 10,
    max: 20,
    game: { history: [{}] },
    ending: { id: 'champion', emoji: '🏆', title: 'Champion', tone: 'good' },
  })),
}));

jest.mock('../ui', () => ({
  countPlayers: (n: number) => `${n} players`,
}));

describe('HostResults Component', () => {
  const mockRoom = {
    pin: '1234',
    createdAt: Date.now(),
    duration: 15,
    phase: 'results' as const,
    history: [{ sceneId: 's1', eligible: null }],
    deadline: null,
  };

  const mockPlayers = [
    { id: 'p1', name: 'Player 1', joinedAt: Date.now(), joinedStep: 0 },
    { id: 'p2', name: 'Player 2', joinedAt: Date.now(), joinedStep: 0 },
  ];

  const mockAnswers = {
    s1: {
      p1: { c: 'c1', s: [] },
      p2: { c: 'c2', s: [] },
    },
  };

  test('renders loading when no answers', () => {
    render(
      <HostResults
        pin="1234"
        room={mockRoom}
        players={mockPlayers}
        onNewSession={jest.fn()}
        onExit={jest.fn()}
      />
    );
    expect(screen.getByText(/Crunching the results/)).toBeInTheDocument();
  });

  test('renders results heading', () => {
    render(
      <HostResults
        pin="1234"
        room={mockRoom}
        players={mockPlayers}
        allAnswers={mockAnswers}
        onNewSession={jest.fn()}
        onExit={jest.fn()}
      />
    );
    expect(screen.getByText(/How the room's futures turned out/)).toBeInTheDocument();
  });

  test('displays player count', () => {
    render(
      <HostResults
        pin="1234"
        room={mockRoom}
        players={mockPlayers}
        allAnswers={mockAnswers}
        onNewSession={jest.fn()}
        onExit={jest.fn()}
      />
    );
    expect(screen.getByText(/2 players/)).toBeInTheDocument();
  });

  test('displays endings distribution', () => {
    render(
      <HostResults
        pin="1234"
        room={mockRoom}
        players={mockPlayers}
        allAnswers={mockAnswers}
        onNewSession={jest.fn()}
        onExit={jest.fn()}
      />
    );
    expect(screen.getByText('Champion')).toBeInTheDocument();
  });

  test('displays leaderboard heading', () => {
    render(
      <HostResults
        pin="1234"
        room={mockRoom}
        players={mockPlayers}
        allAnswers={mockAnswers}
        onNewSession={jest.fn()}
        onExit={jest.fn()}
      />
    );
    expect(screen.getByText(/Leaderboard/)).toBeInTheDocument();
  });
});
