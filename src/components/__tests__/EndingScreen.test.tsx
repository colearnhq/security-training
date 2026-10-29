/**
 * Comprehensive tests for EndingScreen component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { EndingScreen } from '../EndingScreen';
import type { Replay } from '../../engine';
import type { SoloControls } from '../EndingScreen';

jest.mock('../StatsBar', () => ({
  StatsBar: ({ stats }: any) => <div data-testid="stats-bar">{JSON.stringify(stats)}</div>,
}));

jest.mock('../OutcomeScreen', () => ({
  formatPoints: (n: number) => (n > 0 ? `+${n}` : String(n)),
  SCORE_INFO: {
    2: { className: 'q-best' },
    1: { className: 'q-good' },
    0: { className: 'q-neutral' },
    '-1': { className: 'q-bad' },
    '-2': { className: 'q-critical' },
  },
}));

jest.mock('../../data/scenes', () => ({
  CATEGORY_LABEL: {
    security: 'Security Awareness',
    privacy: 'Privacy Protection',
    compliance: 'Compliance',
  },
}));

jest.mock('../../data/endings', () => ({
  ENDINGS: [
    { id: 'champion', emoji: '🏆', title: 'Security Champion', year: '2027', tone: 'best', headline: 'Champion', story: 'Story 1' },
    { id: 'fired', emoji: '💥', title: 'Fired', year: '2026', tone: 'worst', headline: 'Fired', story: 'Story 2' },
    { id: 'survivor', emoji: '😅', title: 'Survivor', year: '2026', tone: 'ok', headline: 'Survivor', story: 'Story 3' },
  ],
}));

describe('EndingScreen Component', () => {
  const mockGame: Replay = {
    history: [
      {
        scene: {
          id: 's1',
          category: 'security',
          when: 'Day 1',
          title: 'Scene 1',
          intro: 'Intro',
          media: { kind: 'email', subject: ['Test'], fromName: 'John', fromAddress: ['john@test.com'], to: 'me', time: '9:00', body: [['Body']] },
          choices: [],
          lesson: 'Lesson 1',
        },
        choice: {
          id: 'c1',
          text: 'Choice 1',
          delta: {},
          score: 2 as const,
          result: 'Result 1',
          ripple: 'Ripple 1',
        },
        spotted: [],
      },
      {
        scene: {
          id: 's2',
          category: 'privacy',
          when: 'Day 2',
          title: 'Scene 2',
          intro: 'Intro',
          media: { kind: 'email', subject: ['Test'], fromName: 'Jane', fromAddress: ['jane@test.com'], to: 'me', time: '10:00', body: [['Body']] },
          choices: [],
          lesson: 'Lesson 2',
        },
        choice: {
          id: 'c2',
          text: 'Choice 2',
          delta: {},
          score: -1 as const,
          result: 'Result 2',
          ripple: 'Ripple 2',
        },
        spotted: [],
      },
    ],
    stats: { security: 2, privacy: -1, compliance: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/THE JAKARTA FUTURE TIMES/)).toBeInTheDocument();
  });

  test('displays newspaper masthead with edition', () => {
    render(<EndingScreen game={mockGame} edition="Test Edition" />);
    expect(screen.getByText(/Test Edition/)).toBeInTheDocument();
  });

  test('displays ending headline', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/Security Champion/i)).toBeInTheDocument();
  });

  test('displays final score', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/Final score:/)).toBeInTheDocument();
  });

  test('displays ending story', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/Story/i)).toBeInTheDocument();
  });

  test('shows mistakes section when there are mistakes', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/How this future happened/)).toBeInTheDocument();
  });

  test('shows all decisions when no mistakes', () => {
    const perfectGame = {
      ...mockGame,
      history: mockGame.history.map(h => ({
        ...h,
        choice: { ...h.choice, score: 2 as const },
      })),
    };
    render(<EndingScreen game={perfectGame} edition="Solo Play" />);
    expect(screen.getByText(/Every decision that built this future/)).toBeInTheDocument();
  });

  test('displays ripples with points', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText('Ripple 1')).toBeInTheDocument();
    expect(screen.getByText('Ripple 2')).toBeInTheDocument();
  });

  test('renders report card heading', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/Fajar's report card/)).toBeInTheDocument();
  });

  test('renders StatsBar component', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByTestId('stats-bar')).toBeInTheDocument();
  });

  test('displays score summary chips', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
  });

  test('displays tally of best choices', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/best/)).toBeInTheDocument();
  });

  test('displays tally of bad choices', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/bad/)).toBeInTheDocument();
  });

  test('shows missed questions adjustment when provided', () => {
    render(<EndingScreen game={mockGame} adjust={{ missed: 2 }} edition="Solo Play" />);
    expect(screen.getByText(/no answer/)).toBeInTheDocument();
  });

  test('shows sat out adjustment when provided', () => {
    render(<EndingScreen game={mockGame} adjust={{ satOut: 1 }} edition="Solo Play" />);
    expect(screen.getByText(/sat out/)).toBeInTheDocument();
  });

  test('displays sharp eye score', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/Sharp eye:/)).toBeInTheDocument();
  });

  test('renders report card with categories', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" />);
    expect(screen.getByText(/Security Awareness/)).toBeInTheDocument();
  });

  test('renders extra content when provided', () => {
    const extra = <div>Extra Content</div>;
    render(<EndingScreen game={mockGame} edition="Solo Play" extra={extra} />);
    expect(screen.getByText('Extra Content')).toBeInTheDocument();
  });
});

describe('EndingScreen with Solo Controls', () => {
  const mockGame: Replay = {
    history: [
      {
        scene: {
          id: 's1',
          category: 'security',
          when: 'Day 1',
          title: 'Scene 1',
          intro: 'Intro',
          media: { kind: 'email', subject: ['Test'], fromName: 'John', fromAddress: ['john@test.com'], to: 'me', time: '9:00', body: [['Body']] },
          choices: [],
          lesson: 'Lesson 1',
        },
        choice: {
          id: 'c1',
          text: 'Choice 1',
          delta: {},
          score: 2 as const,
          result: 'Result 1',
          ripple: 'Ripple 1',
        },
        spotted: [],
      },
    ],
    stats: { security: 2, privacy: 0, compliance: 0 },
  };

  const mockSolo: SoloControls = {
    endingsFound: ['champion'],
    jumps: 2,
    onRewind: jest.fn(),
    onNewGame: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders time machine section with solo controls', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    expect(screen.getByText(/The Colearn Lab Time Machine/)).toBeInTheDocument();
  });

  test('shows time jumps count', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    expect(screen.getByText(/Time jumps used so far: 2/)).toBeInTheDocument();
  });

  test('renders timeline with all history entries', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    expect(screen.getByText('Scene 1')).toBeInTheDocument();
  });

  test('clicking timeline node selects it', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    fireEvent.click(screen.getByText('Scene 1'));
    expect(screen.getByText(/Travel back to/)).toBeInTheDocument();
  });

  test('shows confirmation when node selected', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    fireEvent.click(screen.getByText('Scene 1'));
    expect(screen.getByText(/Engage time machine/)).toBeInTheDocument();
  });

  test('calls onRewind when time machine engaged', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    fireEvent.click(screen.getByText('Scene 1'));
    fireEvent.click(screen.getByText(/Engage time machine/));
    expect(mockSolo.onRewind).toHaveBeenCalledWith(0);
  });

  test('cancel button deselects timeline node', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    fireEvent.click(screen.getByText('Scene 1'));
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText(/Engage time machine/)).not.toBeInTheDocument();
  });

  test('renders endings gallery', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    expect(screen.getByText(/Endings discovered:/)).toBeInTheDocument();
  });

  test('shows found endings unlocked', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    expect(screen.getByText('Security Champion')).toBeInTheDocument();
  });

  test('shows locked endings as ???', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    const locked = screen.getAllByText('???');
    expect(locked.length).toBeGreaterThan(0);
  });

  test('calls onNewGame when start over clicked', () => {
    render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    fireEvent.click(screen.getByText(/Start over from day one/));
    expect(mockSolo.onNewGame).toHaveBeenCalled();
  });

  test('highlights current ending in gallery', () => {
    const { container } = render(<EndingScreen game={mockGame} edition="Solo Play" solo={mockSolo} />);
    expect(container.querySelector('.current')).toBeInTheDocument();
  });
});
