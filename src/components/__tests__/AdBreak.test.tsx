/**
 * Comprehensive tests for AdBreak component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from '@jest/globals';
import { AdBreak } from '../AdBreak';
import type { Ad } from '../../data/ads';

describe('AdBreak Component', () => {
  const mockAd: Ad = {
    id: 'test-ad',
    after: 'test-scene',
    kicker: 'Test Kicker',
    title: 'Test Title',
    intro: 'Test Intro',
    products: [
      { name: 'Product 1', emoji: '🔐', tagline: 'Tagline 1', url: 'https://example.com/1' },
      { name: 'Product 2', emoji: '🛡️', tagline: 'Tagline 2', url: 'https://example.com/2' },
    ],
    reasons: [
      { icon: '✓', title: 'Reason 1', text: 'Text 1' },
      { icon: '✓', title: 'Reason 2', text: 'Text 2' },
    ],
    footnote: 'Test Footnote',
  };

  test('renders without crashing', () => {
    render(<AdBreak ad={mockAd} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders kicker', () => {
    render(<AdBreak ad={mockAd} />);
    expect(screen.getByText('Test Kicker')).toBeInTheDocument();
  });

  test('renders intro', () => {
    render(<AdBreak ad={mockAd} />);
    expect(screen.getByText('Test Intro')).toBeInTheDocument();
  });

  test('renders all products', () => {
    render(<AdBreak ad={mockAd} />);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  test('renders product taglines', () => {
    render(<AdBreak ad={mockAd} />);
    expect(screen.getByText('Tagline 1')).toBeInTheDocument();
    expect(screen.getByText('Tagline 2')).toBeInTheDocument();
  });

  test('product links have correct hrefs', () => {
    render(<AdBreak ad={mockAd} />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://example.com/1');
    expect(links[1]).toHaveAttribute('href', 'https://example.com/2');
  });

  test('product links open in new tab', () => {
    render(<AdBreak ad={mockAd} />);
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('renders reasons section', () => {
    render(<AdBreak ad={mockAd} />);
    expect(screen.getByText('Why bother?')).toBeInTheDocument();
    expect(screen.getByText('Reason 1')).toBeInTheDocument();
    expect(screen.getByText('Reason 2')).toBeInTheDocument();
  });

  test('renders footnote', () => {
    render(<AdBreak ad={mockAd} />);
    expect(screen.getByText(/Test Footnote/)).toBeInTheDocument();
  });

  test('renders custom footer when provided', () => {
    const footer = <div>Custom Footer</div>;
    render(<AdBreak ad={mockAd} footer={footer} />);
    expect(screen.getByText('Custom Footer')).toBeInTheDocument();
  });
});
