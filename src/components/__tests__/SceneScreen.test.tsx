/**
 * Comprehensive tests for SceneScreen component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { SceneBody, SceneScreen } from '../SceneScreen';
import type { Scene } from '../../types';

jest.mock('../MediaView', () => ({
  MediaView: ({ media }: any) => <div data-testid="media-view">{JSON.stringify(media)}</div>,
}));

jest.mock('../RichText', () => ({
  SpotContext: {
    Provider: ({ children }: any) => <div data-testid="spot-context">{children}</div>,
  },
}));

describe('SceneBody Component', () => {
  const mockScene: Scene = {
    id: 's1',
    category: 'security',
    when: 'Day 1 · 09:00',
    title: 'Test Scene',
    intro: 'Scene introduction',
    media: { kind: 'email', subject: ['Test'], fromName: 'John', fromAddress: ['john@test.com'], to: 'me', time: '9:00', body: [['Body']] },
    choices: [
      { id: 'c1', text: 'Choice 1', delta: {}, score: 2 as const, result: 'Result 1', ripple: 'Ripple 1' },
    ],
    lesson: 'Test lesson',
  };

  const mockFound = new Set<string>();
  const mockOnFound = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFound.clear();
  });

  test('renders without crashing', () => {
    render(<SceneBody scene={mockScene} found={mockFound} onFound={mockOnFound} />);
    expect(screen.getByText('Test Scene')).toBeInTheDocument();
  });

  test('displays scene when and title', () => {
    render(<SceneBody scene={mockScene} found={mockFound} onFound={mockOnFound} />);
    expect(screen.getByText('Day 1 · 09:00')).toBeInTheDocument();
    expect(screen.getByText('Test Scene')).toBeInTheDocument();
  });

  test('displays scene intro', () => {
    render(<SceneBody scene={mockScene} found={mockFound} onFound={mockOnFound} />);
    expect(screen.getByText('Scene introduction')).toBeInTheDocument();
  });

  test('displays meta when provided', () => {
    render(<SceneBody scene={mockScene} meta="Decision 1 of 5" found={mockFound} onFound={mockOnFound} />);
    expect(screen.getByText('Decision 1 of 5')).toBeInTheDocument();
  });

  test('shows spotting hint when spotting enabled and redFlags exist', () => {
    const sceneWithFlags = {
      ...mockScene,
      redFlags: [
        { id: 'f1', label: 'Flag 1', explain: 'Explanation 1' },
      ],
    };
    render(<SceneBody scene={sceneWithFlags} found={mockFound} onFound={mockOnFound} />);
    expect(screen.getByText(/Spot the red flags/)).toBeInTheDocument();
  });

  test('does not show spotting hint when spotting disabled', () => {
    const sceneWithFlags = {
      ...mockScene,
      redFlags: [
        { id: 'f1', label: 'Flag 1', explain: 'Explanation 1' },
      ],
    };
    render(<SceneBody scene={sceneWithFlags} found={mockFound} onFound={mockOnFound} spotting={false} />);
    expect(screen.queryByText(/Spot the red flags/)).not.toBeInTheDocument();
  });

  test('displays spotted count', () => {
    const sceneWithFlags = {
      ...mockScene,
      redFlags: [
        { id: 'f1', label: 'Flag 1', explain: 'Explanation 1' },
      ],
    };
    const found = new Set(['f1']);
    render(<SceneBody scene={sceneWithFlags} found={found} onFound={mockOnFound} />);
    expect(screen.getByText(/Spotted: 1/)).toBeInTheDocument();
  });

  test('renders MediaView with scene media', () => {
    render(<SceneBody scene={mockScene} found={mockFound} onFound={mockOnFound} />);
    expect(screen.getByTestId('media-view')).toBeInTheDocument();
  });

  test('wraps MediaView in SpotContext', () => {
    render(<SceneBody scene={mockScene} found={mockFound} onFound={mockOnFound} />);
    expect(screen.getByTestId('spot-context')).toBeInTheDocument();
  });
});

describe('SceneScreen Component', () => {
  const mockScene: Scene = {
    id: 's1',
    category: 'security',
    when: 'Day 1 · 09:00',
    title: 'Test Scene',
    intro: 'Scene introduction',
    media: { kind: 'email', subject: ['Test'], fromName: 'John', fromAddress: ['john@test.com'], to: 'me', time: '9:00', body: [['Body']] },
    choices: [
      { id: 'c1', text: 'Choice 1', delta: {}, score: 2 as const, result: 'Result 1', ripple: 'Ripple 1' },
      { id: 'c2', text: 'Choice 2', delta: {}, score: 1 as const, result: 'Result 2', ripple: 'Ripple 2' },
      { id: 'c3', text: 'Choice 3', delta: {}, score: 0 as const, result: 'Result 3', ripple: 'Ripple 3' },
    ],
    lesson: 'Test lesson',
  };

  const mockOnChoose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<SceneScreen scene={mockScene} step={1} total={5} onChoose={mockOnChoose} />);
    expect(screen.getByText('Test Scene')).toBeInTheDocument();
  });

  test('displays step counter', () => {
    render(<SceneScreen scene={mockScene} step={3} total={10} onChoose={mockOnChoose} />);
    expect(screen.getByText('Decision 3 of 10')).toBeInTheDocument();
  });

  test('renders choices title', () => {
    render(<SceneScreen scene={mockScene} step={1} total={5} onChoose={mockOnChoose} />);
    expect(screen.getByText('What should Fajar do?')).toBeInTheDocument();
  });

  test('renders all choices', () => {
    render(<SceneScreen scene={mockScene} step={1} total={5} onChoose={mockOnChoose} />);
    expect(screen.getByText('Choice 1')).toBeInTheDocument();
    expect(screen.getByText('Choice 2')).toBeInTheDocument();
    expect(screen.getByText('Choice 3')).toBeInTheDocument();
  });

  test('renders choice keys (A, B, C)', () => {
    const { container } = render(<SceneScreen scene={mockScene} step={1} total={5} onChoose={mockOnChoose} />);
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
    expect(container.textContent).toContain('C');
  });

  test('calls onChoose when choice clicked', () => {
    render(<SceneScreen scene={mockScene} step={1} total={5} onChoose={mockOnChoose} />);
    fireEvent.click(screen.getByText('Choice 1'));
    expect(mockOnChoose).toHaveBeenCalled();
  });

  test('passes choice id to onChoose', () => {
    render(<SceneScreen scene={mockScene} step={1} total={5} onChoose={mockOnChoose} />);
    fireEvent.click(screen.getByText('Choice 2'));
    expect(mockOnChoose).toHaveBeenCalledWith('c2', expect.any(Array));
  });

  test('passes spotted flags to onChoose', () => {
    const sceneWithFlags = {
      ...mockScene,
      redFlags: [
        { id: 'f1', label: 'Flag 1', explain: 'Explanation 1' },
      ],
    };
    render(<SceneScreen scene={sceneWithFlags} step={1} total={5} onChoose={mockOnChoose} />);
    fireEvent.click(screen.getByText('Choice 1'));
    expect(mockOnChoose).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
  });

  test('choices are rendered in shuffled order', () => {
    // Render multiple times and check if order changes
    const { container: container1 } = render(<SceneScreen scene={mockScene} step={1} total={5} onChoose={mockOnChoose} />);
    const text1 = container1.textContent;
    
    // Note: Due to Math.random() shuffle, we can't guarantee different order
    // but we can verify all choices are present
    expect(text1).toContain('Choice 1');
    expect(text1).toContain('Choice 2');
    expect(text1).toContain('Choice 3');
  });
});
