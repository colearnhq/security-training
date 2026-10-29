/**
 * Comprehensive tests for IntroScreen component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import { IntroScreen } from '../IntroScreen';

jest.mock('../ScoringRules', () => ({
  ScoringRules: () => <div data-testid="scoring-rules">Scoring Rules</div>,
}));

describe('IntroScreen Component', () => {
  const mockOnStart = jest.fn();
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    mockOnStart.mockClear();
    mockOnContinue.mockClear();
  });

  test('renders without crashing', () => {
    render(
      <IntroScreen
        hasSave={false}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.getByText("Fajar's First Month")).toBeInTheDocument();
  });

  test('shows start button when no save', () => {
    render(
      <IntroScreen
        hasSave={false}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.getByText("Start Fajar's first day →")).toBeInTheDocument();
  });

  test('shows continue button when has save', () => {
    render(
      <IntroScreen
        hasSave={true}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.getByText("Continue Fajar's story")).toBeInTheDocument();
  });

  test('calls onStart when start button clicked', () => {
    render(
      <IntroScreen
        hasSave={false}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    fireEvent.click(screen.getByText("Start Fajar's first day →"));
    expect(mockOnStart).toHaveBeenCalled();
  });

  test('calls onContinue when continue button clicked', () => {
    render(
      <IntroScreen
        hasSave={true}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    fireEvent.click(screen.getByText("Continue Fajar's story"));
    expect(mockOnContinue).toHaveBeenCalled();
  });

  test('shows new timeline button when has save', () => {
    render(
      <IntroScreen
        hasSave={true}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.getByText('Start a new timeline')).toBeInTheDocument();
  });

  test('displays ending count when endings found', () => {
    render(
      <IntroScreen
        hasSave={false}
        endingsFound={['fired', 'champion']}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.getByText(/Endings discovered:/)).toBeInTheDocument();
  });

  test('does not display ending count when no endings found', () => {
    render(
      <IntroScreen
        hasSave={false}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.queryByText(/Endings discovered:/)).not.toBeInTheDocument();
  });

  test('displays intro badge', () => {
    render(
      <IntroScreen
        hasSave={false}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.getByText('Colearn Security Training')).toBeInTheDocument();
  });

  test('displays character name Fajar', () => {
    render(
      <IntroScreen
        hasSave={false}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.getByText(/Fajar/)).toBeInTheDocument();
  });

  test('displays disclaimer', () => {
    render(
      <IntroScreen
        hasSave={false}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.getByText(/All scenarios are fictional/)).toBeInTheDocument();
  });

  test('renders ScoringRules component', () => {
    render(
      <IntroScreen
        hasSave={false}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(screen.getByTestId('scoring-rules')).toBeInTheDocument();
  });

  test('displays intro rules with icons', () => {
    const { container } = render(
      <IntroScreen
        hasSave={false}
        endingsFound={[]}
        onStart={mockOnStart}
        onContinue={mockOnContinue}
      />
    );
    expect(container.textContent).toContain('🔍');
    expect(container.textContent).toContain('🧭');
    expect(container.textContent).toContain('🕰️');
  });
});
