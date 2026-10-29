/**
 * Comprehensive tests for SoloGame component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { SoloGame, continueInSolo } from '../SoloGame';

const mockReplay = jest.fn(() => ({ history: [], stats: { security: 0, business: 0, career: 0 }, flags: {} }));
const mockNextScene = jest.fn(() => null);
const mockComputeEnding = jest.fn(() => ({ id: 'champion', emoji: '🏆', title: 'Champion', year: '2027', tone: 'best', headline: 'Headline', story: 'Story' }));
const mockTotalScore = jest.fn(() => ({ points: 10, max: 20 }));

jest.mock('../engine', () => ({
  replay: (...args: any[]) => mockReplay(...args),
  nextScene: (...args: any[]) => mockNextScene(...args),
  computeEnding: (...args: any[]) => mockComputeEnding(...args),
  totalScore: (...args: any[]) => mockTotalScore(...args),
  INITIAL_STATS: { security: 0, business: 0, career: 0 },
}));

jest.mock('../components/Shell', () => ({
  Shell: ({ children, onBrand }: any) => (
    <div data-testid="shell">
      <button onClick={onBrand}>Brand</button>
      {children}
    </div>
  ),
}));

jest.mock('../components/IntroScreen', () => ({
  IntroScreen: ({ hasSave, onStart, onContinue }: any) => (
    <div data-testid="intro">
      <button onClick={onStart}>Start</button>
      {hasSave && <button onClick={onContinue}>Continue</button>}
    </div>
  ),
}));

jest.mock('../components/SceneScreen', () => ({
  SceneScreen: ({ onChoose }: any) => (
    <div data-testid="scene">
      <button onClick={() => onChoose('c1', [])}>Choose</button>
    </div>
  ),
}));

jest.mock('../components/OutcomeScreen', () => ({
  OutcomeScreen: ({ onContinue }: any) => (
    <div data-testid="outcome">
      <button onClick={onContinue}>Next</button>
    </div>
  ),
  formatPoints: (n: number) => (n > 0 ? `+${n}` : String(n)),
}));

jest.mock('../components/AdBreak', () => ({
  AdBreak: ({ footer }: any) => (
    <div data-testid="ad">
      Ad Break
      {footer}
    </div>
  ),
}));

jest.mock('../components/EndingScreen', () => ({
  EndingScreen: ({ solo }: any) => (
    <div data-testid="ending">
      <button onClick={() => solo.onRewind(0)}>Rewind</button>
      <button onClick={solo.onNewGame}>New Game</button>
    </div>
  ),
}));

jest.mock('../components/StatsBar', () => ({
  StatsBar: () => <div data-testid="stats-bar">Stats</div>,
}));

jest.mock('../data/scenes', () => ({
  SCENES: [
    { id: 's1', condition: null },
    { id: 's2', condition: null },
  ],
}));

jest.mock('../data/ads', () => ({
  AD_AFTER: {},
}));

describe('SoloGame Component', () => {
  const mockOnHome = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockReplay.mockReturnValue({ history: [], stats: { security: 0, business: 0, career: 0 }, flags: {} });
    mockNextScene.mockReturnValue({ id: 's1', choices: [] });
    mockTotalScore.mockReturnValue({ points: 0, max: 20 });
  });

  test('renders without crashing', () => {
    render(<SoloGame onHome={mockOnHome} />);
    expect(screen.getByTestId('intro')).toBeInTheDocument();
  });

  test('starts in intro phase', () => {
    render(<SoloGame onHome={mockOnHome} />);
    expect(screen.getByTestId('intro')).toBeInTheDocument();
  });

  test('calls onHome when brand clicked', () => {
    render(<SoloGame onHome={mockOnHome} />);
    fireEvent.click(screen.getByText('Brand'));
    expect(mockOnHome).toHaveBeenCalled();
  });

  test('shows start button in intro', () => {
    render(<SoloGame onHome={mockOnHome} />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  test('starts new game when start clicked', () => {
    render(<SoloGame onHome={mockOnHome} />);
    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByTestId('scene')).toBeInTheDocument();
  });

  test('shows scene after starting', () => {
    render(<SoloGame onHome={mockOnHome} />);
    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByTestId('scene')).toBeInTheDocument();
  });

  test('shows outcome after choosing', () => {
    mockReplay.mockReturnValue({
      history: [{
        scene: { id: 's1' },
        choice: { score: 2 },
        before: { security: 0, business: 0, career: 0 },
        after: { security: 2, business: 0, career: 0 },
        spotted: [],
      }],
      stats: { security: 2, business: 0, career: 0 },
      flags: {},
    });
    render(<SoloGame onHome={mockOnHome} />);
    fireEvent.click(screen.getByText('Start'));
    fireEvent.click(screen.getByText('Choose'));
    expect(screen.getByTestId('outcome')).toBeInTheDocument();
  });

  test('shows ending when no more scenes', () => {
    mockNextScene.mockReturnValue(null);
    render(<SoloGame onHome={mockOnHome} />);
    fireEvent.click(screen.getByText('Start'));
    fireEvent.click(screen.getByText('Choose'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByTestId('ending')).toBeInTheDocument();
  });

  test('can start new game from ending', () => {
    mockNextScene.mockReturnValue(null);
    render(<SoloGame onHome={mockOnHome} />);
    fireEvent.click(screen.getByText('Start'));
    fireEvent.click(screen.getByText('Choose'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByTestId('ending')).toBeInTheDocument();
    
    mockNextScene.mockReturnValue({ id: 's1', choices: [] });
    fireEvent.click(screen.getByText('New Game'));
    expect(screen.getByTestId('scene')).toBeInTheDocument();
  });

  test('renders stats bar during gameplay', () => {
    render(<SoloGame onHome={mockOnHome} />);
    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByTestId('stats-bar')).toBeInTheDocument();
  });
});

describe('continueInSolo function', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saves records to localStorage', () => {
    const records = [{ sceneId: 's1', choiceId: 'c1', spotted: [] }];
    continueInSolo(records, 'champion');
    const saved = JSON.parse(localStorage.getItem('colearn-security-quest:v1') || '{}');
    expect(saved.records).toEqual(records);
  });

  test('adds ending to endingsFound', () => {
    const records = [{ sceneId: 's1', choiceId: 'c1', spotted: [] }];
    continueInSolo(records, 'champion');
    const saved = JSON.parse(localStorage.getItem('colearn-security-quest:v1') || '{}');
    expect(saved.endingsFound).toContain('champion');
  });

  test('does not duplicate endings', () => {
    localStorage.setItem('colearn-security-quest:v1', JSON.stringify({
      phase: 'intro',
      records: [],
      jumps: 0,
      timeline: 1,
      endingsFound: ['champion'],
    }));
    const records = [{ sceneId: 's1', choiceId: 'c1', spotted: [] }];
    continueInSolo(records, 'champion');
    const saved = JSON.parse(localStorage.getItem('colearn-security-quest:v1') || '{}');
    expect(saved.endingsFound.filter((e: string) => e === 'champion')).toHaveLength(1);
  });

  test('increments timeline when continuing', () => {
    localStorage.setItem('colearn-security-quest:v1', JSON.stringify({
      phase: 'intro',
      records: [{ sceneId: 's1', choiceId: 'c1', spotted: [] }],
      jumps: 0,
      timeline: 1,
      endingsFound: [],
    }));
    const records = [{ sceneId: 's2', choiceId: 'c2', spotted: [] }];
    continueInSolo(records, 'survivor');
    const saved = JSON.parse(localStorage.getItem('colearn-security-quest:v1') || '{}');
    expect(saved.timeline).toBe(2);
  });
});
