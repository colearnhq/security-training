/**
 * Comprehensive tests for ScoringRules component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from '@jest/globals';
import { ScoringRules } from '../ScoringRules';

jest.mock('./OutcomeScreen', () => ({
  formatPoints: (n: number) => (n > 0 ? `+${n}` : String(n)),
  SCORE_INFO: {
    2: { className: 'q-best' },
    1: { className: 'q-good' },
    0: { className: 'q-neutral' },
    '-1': { className: 'q-bad' },
    '-2': { className: 'q-critical' },
  },
}));

describe('ScoringRules Component', () => {
  test('renders without crashing', () => {
    render(<ScoringRules />);
    expect(screen.getByText(/How scoring works/)).toBeInTheDocument();
  });

  test('renders all score levels', () => {
    render(<ScoringRules />);
    expect(screen.getByText(/The best thing to do/)).toBeInTheDocument();
    expect(screen.getByText(/A good call/)).toBeInTheDocument();
    expect(screen.getByText(/did nothing to protect/)).toBeInTheDocument();
    expect(screen.getByText(/A bad move/)).toBeInTheDocument();
    expect(screen.getByText(/A fatal mistake/)).toBeInTheDocument();
  });

  test('renders live mode rules when live prop is true', () => {
    render(<ScoringRules live={true} />);
    expect(screen.getByText(/No answer before the timer/)).toBeInTheDocument();
    expect(screen.getByText(/sit it out/)).toBeInTheDocument();
  });

  test('does not render live mode rules when live prop is false', () => {
    render(<ScoringRules live={false} />);
    expect(screen.queryByText(/No answer before the timer/)).not.toBeInTheDocument();
  });

  test('does not render live mode rules by default', () => {
    render(<ScoringRules />);
    expect(screen.queryByText(/No answer before the timer/)).not.toBeInTheDocument();
  });

  test('renders change answer note in live mode', () => {
    render(<ScoringRules live={true} />);
    expect(screen.getByText(/change your answer until time runs out/)).toBeInTheDocument();
  });

  test('renders heading with emoji', () => {
    render(<ScoringRules />);
    expect(screen.getByText(/🎯 How scoring works/)).toBeInTheDocument();
  });
});
