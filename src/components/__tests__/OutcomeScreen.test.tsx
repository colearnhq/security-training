/**
 * Comprehensive tests for OutcomeScreen component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import { OutcomeScreen, formatPoints, SCORE_INFO } from '../OutcomeScreen';
import type { HistoryEntry } from '../../engine';

describe('formatPoints', () => {
  test('adds plus sign for positive numbers', () => {
    expect(formatPoints(5)).toBe('+5');
  });

  test('returns negative numbers as-is', () => {
    expect(formatPoints(-3)).toBe('-3');
  });

  test('returns zero as-is', () => {
    expect(formatPoints(0)).toBe('0');
  });
});

describe('SCORE_INFO', () => {
  test('has info for all score values', () => {
    expect(SCORE_INFO[2]).toBeDefined();
    expect(SCORE_INFO[1]).toBeDefined();
    expect(SCORE_INFO[0]).toBeDefined();
    expect(SCORE_INFO[-1]).toBeDefined();
    expect(SCORE_INFO[-2]).toBeDefined();
  });

  test('each score has label and className', () => {
    Object.values(SCORE_INFO).forEach(info => {
      expect(info.label).toBeDefined();
      expect(info.className).toBeDefined();
    });
  });
});

describe('OutcomeScreen Component', () => {
  const mockEntry = {
    scene: {
      id: 's1',
      category: 'security' as const,
      text: 'Scene text',
      choices: [],
      lesson: 'Test lesson',
    },
    choice: {
      id: 'c1',
      text: 'Test choice',
      delta: {},
      score: 2 as const,
      result: 'Test result',
      ripple: 'Test ripple',
    },
    spotted: [] as string[],
  };

  test('renders without crashing', () => {
    render(<OutcomeScreen entry={mockEntry} />);
    expect(screen.getByText(/Best choice/)).toBeInTheDocument();
  });

  test('displays choice text', () => {
    render(<OutcomeScreen entry={mockEntry} />);
    expect(screen.getByText(/Test choice/)).toBeInTheDocument();
  });

  test('displays result', () => {
    render(<OutcomeScreen entry={mockEntry} />);
    expect(screen.getByText('Test result')).toBeInTheDocument();
  });

  test('displays ripple', () => {
    render(<OutcomeScreen entry={mockEntry} />);
    expect(screen.getByText('Test ripple')).toBeInTheDocument();
  });

  test('displays lesson', () => {
    render(<OutcomeScreen entry={mockEntry} />);
    expect(screen.getByText('Test lesson')).toBeInTheDocument();
  });

  test('shows continue button when onContinue provided', () => {
    const onContinue = jest.fn();
    render(<OutcomeScreen entry={mockEntry} onContinue={onContinue} />);
    expect(screen.getByText('Continue →')).toBeInTheDocument();
  });

  test('calls onContinue when button clicked', () => {
    const onContinue = jest.fn();
    render(<OutcomeScreen entry={mockEntry} onContinue={onContinue} />);
    fireEvent.click(screen.getByText('Continue →'));
    expect(onContinue).toHaveBeenCalled();
  });

  test('shows different button text when isLast', () => {
    const onContinue = jest.fn();
    render(<OutcomeScreen entry={mockEntry} isLast={true} onContinue={onContinue} />);
    expect(screen.getByText(/See how Fajar's future turned out/)).toBeInTheDocument();
  });

  test('renders custom footer when provided', () => {
    const footer = <div>Custom Footer</div>;
    render(<OutcomeScreen entry={mockEntry} footer={footer} />);
    expect(screen.getByText('Custom Footer')).toBeInTheDocument();
  });

  test('displays red flags section when scene has redFlags', () => {
    const entryWithFlags = {
      ...mockEntry,
      scene: {
        ...mockEntry.scene,
        redFlags: [
          { id: 'f1', label: 'Flag 1', explain: 'Explanation 1' },
        ],
      },
    };
    render(<OutcomeScreen entry={entryWithFlags} />);
    expect(screen.getByText(/Red flags/)).toBeInTheDocument();
  });

  test('shows spotted flag count', () => {
    const entryWithFlags = {
      ...mockEntry,
      scene: {
        ...mockEntry.scene,
        redFlags: [
          { id: 'f1', label: 'Flag 1', explain: 'Explanation 1' },
          { id: 'f2', label: 'Flag 2', explain: 'Explanation 2' },
        ],
      },
      spotted: ['f1'],
    };
    render(<OutcomeScreen entry={entryWithFlags} />);
    expect(screen.getByText(/you spotted 1 of 2/)).toBeInTheDocument();
  });

  test('displays points with formatting', () => {
    render(<OutcomeScreen entry={mockEntry} />);
    expect(screen.getByText('+2 pts')).toBeInTheDocument();
  });
});
