/**
 * Comprehensive tests for live UI components
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { Countdown, LiveChoices, Distribution, countPlayers, DurationPicker, SLOTS } from '../ui';
import type { Choice } from '../../types';

jest.mock('../client', () => ({
  useTicker: jest.fn(),
}));

jest.mock('../logic', () => ({
  serverNow: jest.fn(() => Date.now()),
}));

jest.mock('../../components/OutcomeScreen', () => ({
  formatPoints: (n: number) => (n > 0 ? `+${n}` : String(n)),
  SCORE_INFO: {
    2: { label: 'Best', className: 'q-best' },
    1: { label: 'Good', className: 'q-good' },
    0: { label: 'Neutral', className: 'q-neutral' },
    '-1': { label: 'Bad', className: 'q-bad' },
    '-2': { label: 'Critical', className: 'q-critical' },
  },
}));

describe('SLOTS', () => {
  test('exports array of 4 slots', () => {
    expect(SLOTS).toHaveLength(4);
  });

  test('each slot has shape and cls', () => {
    SLOTS.forEach(slot => {
      expect(slot.shape).toBeDefined();
      expect(slot.cls).toBeDefined();
    });
  });

  test('first slot is triangle red', () => {
    expect(SLOTS[0].shape).toBe('▲');
    expect(SLOTS[0].cls).toBe('k-red');
  });

  test('second slot is diamond blue', () => {
    expect(SLOTS[1].shape).toBe('◆');
    expect(SLOTS[1].cls).toBe('k-blue');
  });

  test('third slot is circle yellow', () => {
    expect(SLOTS[2].shape).toBe('●');
    expect(SLOTS[2].cls).toBe('k-yellow');
  });

  test('fourth slot is square green', () => {
    expect(SLOTS[3].shape).toBe('■');
    expect(SLOTS[3].cls).toBe('k-green');
  });
});

describe('Countdown Component', () => {
  test('renders without crashing', () => {
    const deadline = Date.now() + 10000;
    render(<Countdown deadline={deadline} duration={15} />);
    expect(screen.getByText(/\d+/)).toBeInTheDocument();
  });

  test('displays seconds remaining', () => {
    const deadline = Date.now() + 5000;
    render(<Countdown deadline={deadline} duration={15} />);
    const text = screen.getByText(/5/);
    expect(text).toBeInTheDocument();
  });

  test('applies big class when big prop true', () => {
    const { container } = render(<Countdown deadline={Date.now() + 10000} duration={15} big={true} />);
    expect(container.querySelector('.countdown.big')).toBeInTheDocument();
  });

  test('does not apply big class by default', () => {
    const { container } = render(<Countdown deadline={Date.now() + 10000} duration={15} />);
    expect(container.querySelector('.countdown.big')).not.toBeInTheDocument();
  });
});

describe('LiveChoices Component', () => {
  const mockChoices: Choice[] = [
    { id: 'c1', text: 'Choice 1', delta: {}, score: 2, result: 'Result 1', ripple: 'Ripple 1' },
    { id: 'c2', text: 'Choice 2', delta: {}, score: 1, result: 'Result 2', ripple: 'Ripple 2' },
  ];

  test('renders without crashing', () => {
    render(<LiveChoices choices={mockChoices} />);
    expect(screen.getByText('Choice 1')).toBeInTheDocument();
  });

  test('renders all choices', () => {
    render(<LiveChoices choices={mockChoices} />);
    expect(screen.getByText('Choice 1')).toBeInTheDocument();
    expect(screen.getByText('Choice 2')).toBeInTheDocument();
  });

  test('renders shapes for each choice', () => {
    const { container } = render(<LiveChoices choices={mockChoices} />);
    expect(container.textContent).toContain('▲');
    expect(container.textContent).toContain('◆');
  });

  test('marks selected choice', () => {
    const { container } = render(<LiveChoices choices={mockChoices} selectedId="c1" />);
    const selected = container.querySelector('.selected');
    expect(selected).toBeInTheDocument();
  });

  test('shows checkmark on selected choice', () => {
    render(<LiveChoices choices={mockChoices} selectedId="c1" />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  test('calls onPick when choice clicked', () => {
    const onPick = jest.fn();
    render(<LiveChoices choices={mockChoices} onPick={onPick} />);
    fireEvent.click(screen.getByText('Choice 1'));
    expect(onPick).toHaveBeenCalledWith('c1');
  });

  test('disables buttons when disabled prop true', () => {
    const { container } = render(<LiveChoices choices={mockChoices} disabled={true} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  test('disables buttons when no onPick', () => {
    const { container } = render(<LiveChoices choices={mockChoices} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});

describe('Distribution Component', () => {
  const mockChoices: Choice[] = [
    { id: 'c1', text: 'Choice 1', delta: {}, score: 2, result: 'Result 1', ripple: 'Ripple 1' },
    { id: 'c2', text: 'Choice 2', delta: {}, score: -1, result: 'Result 2', ripple: 'Ripple 2' },
  ];

  const mockAnswers = {
    p1: { c: 'c1', s: [] },
    p2: { c: 'c1', s: [] },
    p3: { c: 'c2', s: [] },
  };

  test('renders without crashing', () => {
    render(<Distribution choices={mockChoices} answers={mockAnswers} expected={3} />);
    expect(screen.getByText('Choice 1')).toBeInTheDocument();
  });

  test('displays all choices', () => {
    render(<Distribution choices={mockChoices} answers={mockAnswers} expected={3} />);
    expect(screen.getByText('Choice 1')).toBeInTheDocument();
    expect(screen.getByText('Choice 2')).toBeInTheDocument();
  });

  test('shows answer counts', () => {
    render(<Distribution choices={mockChoices} answers={mockAnswers} expected={3} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('displays score labels', () => {
    render(<Distribution choices={mockChoices} answers={mockAnswers} expected={3} />);
    expect(screen.getByText(/Best/)).toBeInTheDocument();
    expect(screen.getByText(/Bad/)).toBeInTheDocument();
  });

  test('shows answered count', () => {
    render(<Distribution choices={mockChoices} answers={mockAnswers} expected={5} />);
    expect(screen.getByText(/3 of 5 answered/)).toBeInTheDocument();
  });

  test('shows no answer row when some did not answer', () => {
    render(<Distribution choices={mockChoices} answers={mockAnswers} expected={5} />);
    expect(screen.getByText(/No answer/)).toBeInTheDocument();
  });

  test('shows average points', () => {
    render(<Distribution choices={mockChoices} answers={mockAnswers} expected={3} />);
    expect(screen.getByText(/average/)).toBeInTheDocument();
  });
});

describe('countPlayers function', () => {
  test('returns "1 player" for 1', () => {
    expect(countPlayers(1)).toBe('1 player');
  });

  test('returns "2 players" for 2', () => {
    expect(countPlayers(2)).toBe('2 players');
  });

  test('returns "0 players" for 0', () => {
    expect(countPlayers(0)).toBe('0 players');
  });

  test('returns "10 players" for 10', () => {
    expect(countPlayers(10)).toBe('10 players');
  });
});

describe('DurationPicker Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders without crashing', () => {
    render(<DurationPicker value={15} onChange={mockOnChange} />);
    expect(screen.getByText('⏱ Answer time')).toBeInTheDocument();
  });

  test('renders preset buttons', () => {
    render(<DurationPicker value={15} onChange={mockOnChange} />);
    expect(screen.getByText('10s')).toBeInTheDocument();
    expect(screen.getByText('15s')).toBeInTheDocument();
    expect(screen.getByText('20s')).toBeInTheDocument();
  });

  test('marks active preset', () => {
    const { container } = render(<DurationPicker value={15} onChange={mockOnChange} />);
    const active = container.querySelector('.active');
    expect(active?.textContent).toBe('15s');
  });

  test('calls onChange when preset clicked', () => {
    render(<DurationPicker value={15} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('20s'));
    expect(mockOnChange).toHaveBeenCalledWith(20);
  });

  test('renders custom input', () => {
    render(<DurationPicker value={15} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/Custom answer time/);
    expect(input).toBeInTheDocument();
  });

  test('custom input has correct type', () => {
    render(<DurationPicker value={15} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/Custom answer time/) as HTMLInputElement;
    expect(input.type).toBe('number');
  });

  test('updates custom input value', () => {
    render(<DurationPicker value={15} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/Custom answer time/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '25' } });
    expect(input.value).toBe('25');
  });

  test('calls onChange on blur with valid value', () => {
    render(<DurationPicker value={15} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/Custom answer time/);
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.blur(input);
    expect(mockOnChange).toHaveBeenCalledWith(25);
  });

  test('clamps value to min 5 on blur', () => {
    render(<DurationPicker value={15} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/Custom answer time/);
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.blur(input);
    expect(mockOnChange).toHaveBeenCalledWith(5);
  });

  test('clamps value to max 120 on blur', () => {
    render(<DurationPicker value={15} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/Custom answer time/);
    fireEvent.change(input, { target: { value: '200' } });
    fireEvent.blur(input);
    expect(mockOnChange).toHaveBeenCalledWith(120);
  });
});
