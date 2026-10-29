/**
 * Comprehensive tests for MediaView component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from '@jest/globals';
import { MediaView } from '../MediaView';
import type { EmailMedia, ChatMedia, CallMedia, IrlMedia, TaskMedia, WifiMedia, PopupMedia } from '../../types';

jest.mock('../RichText', () => ({
  RichText: ({ value }: any) => <span>{Array.isArray(value) ? value.join('') : value}</span>,
}));

describe('MediaView Component - Email', () => {
  const mockEmail: EmailMedia = {
    kind: 'email',
    subject: ['Test Subject'],
    fromName: 'John Doe',
    fromAddress: ['john@example.com'],
    to: 'me',
    time: '10:30 AM',
    body: [['Test email body']],
  };

  test('renders email media', () => {
    render(<MediaView media={mockEmail} hoverHref={null} />);
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  test('shows hover href when provided', () => {
    const { container } = render(<MediaView media={mockEmail} hoverHref="https://test.com" />);
    expect(container.textContent).toContain('https://test.com');
  });
});

describe('MediaView Component - Chat', () => {
  const mockChat: ChatMedia = {
    kind: 'chat',
    app: 'slack',
    title: ['Team Channel'],
    messages: [
      { avatar: '👤', who: 'User', text: ['Hello'] },
    ],
  };

  test('renders chat media', () => {
    render(<MediaView media={mockChat} hoverHref={null} />);
    expect(screen.getByText('Team Channel')).toBeInTheDocument();
  });

  test('renders slack app icon', () => {
    render(<MediaView media={mockChat} hoverHref={null} />);
    expect(screen.getByText(/💬 Slack/)).toBeInTheDocument();
  });
});

describe('MediaView Component - Call', () => {
  const mockCall: CallMedia = {
    kind: 'call',
    callerName: ['Unknown Number'],
    callerNumber: ['+1234567890'],
    lines: [
      { who: 'them', text: ['Hello'] },
    ],
  };

  test('renders call media', () => {
    render(<MediaView media={mockCall} hoverHref={null} />);
    expect(screen.getByText('Unknown Number')).toBeInTheDocument();
  });
});

describe('MediaView Component - IRL', () => {
  const mockIrl: IrlMedia = {
    kind: 'irl',
    art: '🏢',
    location: 'Office',
    lines: [
      { who: 'narrator', text: ['Scene description'] },
    ],
  };

  test('renders irl media', () => {
    render(<MediaView media={mockIrl} hoverHref={null} />);
    expect(screen.getByText(/Office/)).toBeInTheDocument();
  });
});

describe('MediaView Component - Task', () => {
  const mockTask: TaskMedia = {
    kind: 'task',
    icon: '📋',
    app: 'Jira',
    title: 'Complete task',
    body: [['Task description']],
  };

  test('renders task media', () => {
    render(<MediaView media={mockTask} hoverHref={null} />);
    expect(screen.getByText('Complete task')).toBeInTheDocument();
  });
});

describe('MediaView Component - WiFi', () => {
  const mockWifi: WifiMedia = {
    kind: 'wifi',
    location: 'Coffee Shop',
    networks: [
      { name: ['WiFi Network'], security: ['WPA2'], signal: 4 },
    ],
  };

  test('renders wifi media', () => {
    render(<MediaView media={mockWifi} hoverHref={null} />);
    expect(screen.getByText(/Coffee Shop/)).toBeInTheDocument();
  });
});

describe('MediaView Component - Popup', () => {
  const mockPopup: PopupMedia = {
    kind: 'popup',
    url: ['https://example.com'],
    title: ['Warning'],
    lines: [['Your computer is at risk']],
    buttons: ['OK', 'Cancel'],
  };

  test('renders popup media', () => {
    render(<MediaView media={mockPopup} hoverHref={null} />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
