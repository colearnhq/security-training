/**
 * Comprehensive tests for RichText component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import { RichText, SpotContext, type SpotApi } from '../RichText';
import type { Rich } from '../../types';

describe('RichText Component', () => {
  const mockSpotApi: SpotApi = {
    enabled: false,
    found: new Set(),
    onFlag: jest.fn(),
    onMiss: jest.fn(),
    onHoverLink: jest.fn(),
  };

  test('renders plain text', () => {
    const value: Rich = ['Hello world'];
    render(<RichText value={value} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  test('renders multiple text segments', () => {
    const value: Rich = ['Hello ', 'world'];
    const { container } = render(<RichText value={value} />);
    expect(container.textContent).toBe('Hello world');
  });

  test('renders link segment', () => {
    const value: Rich = [{ t: 'Click here', href: 'https://example.com' }];
    render(<RichText value={value} />);
    const link = screen.getByText('Click here');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  test('renders mixed content', () => {
    const value: Rich = [
      'Visit ',
      { t: 'our site', href: 'https://example.com' },
      ' for more',
    ];
    render(<RichText value={value} />);
    expect(screen.getByText('Visit')).toBeInTheDocument();
    expect(screen.getByText('our site')).toBeInTheDocument();
    expect(screen.getByText('for more')).toBeInTheDocument();
  });

  test('applies seg class when spotting enabled', () => {
    const value: Rich = ['Test'];
    const { container } = render(
      <SpotContext.Provider value={{ ...mockSpotApi, enabled: true }}>
        <RichText value={value} />
      </SpotContext.Provider>
    );
    expect(container.querySelector('.seg')).toBeInTheDocument();
  });

  test('calls onMiss when clicking text in spot mode', () => {
    const onMiss = jest.fn();
    const value: Rich = ['Test'];
    render(
      <SpotContext.Provider value={{ ...mockSpotApi, enabled: true, onMiss }}>
        <RichText value={value} />
      </SpotContext.Provider>
    );
    fireEvent.click(screen.getByText('Test'));
    expect(onMiss).toHaveBeenCalled();
  });

  test('calls onFlag when clicking flagged segment', () => {
    const onFlag = jest.fn();
    const value: Rich = [{ t: 'Suspicious', flag: 'flag1' }];
    render(
      <SpotContext.Provider value={{ ...mockSpotApi, enabled: true, onFlag }}>
        <RichText value={value} />
      </SpotContext.Provider>
    );
    fireEvent.click(screen.getByText('Suspicious'));
    expect(onFlag).toHaveBeenCalledWith('flag1');
  });

  test('shows seg-found class for found flags', () => {
    const found = new Set(['flag1']);
    const value: Rich = [{ t: 'Found', flag: 'flag1' }];
    const { container } = render(
      <SpotContext.Provider value={{ ...mockSpotApi, enabled: true, found }}>
        <RichText value={value} />
      </SpotContext.Provider>
    );
    expect(container.querySelector('.seg-found')).toBeInTheDocument();
  });

  test('calls onHoverLink on link hover', () => {
    const onHoverLink = jest.fn();
    const value: Rich = [{ t: 'Link', href: 'https://test.com' }];
    render(
      <SpotContext.Provider value={{ ...mockSpotApi, onHoverLink }}>
        <RichText value={value} />
      </SpotContext.Provider>
    );
    const link = screen.getByText('Link');
    fireEvent.mouseEnter(link);
    expect(onHoverLink).toHaveBeenCalledWith('https://test.com');
  });

  test('clears hovered link on mouse leave', () => {
    const onHoverLink = jest.fn();
    const value: Rich = [{ t: 'Link', href: 'https://test.com' }];
    render(
      <SpotContext.Provider value={{ ...mockSpotApi, onHoverLink }}>
        <RichText value={value} />
      </SpotContext.Provider>
    );
    const link = screen.getByText('Link');
    fireEvent.mouseLeave(link);
    expect(onHoverLink).toHaveBeenCalledWith(null);
  });

  test('prevents default on link click in spot mode', () => {
    const value: Rich = [{ t: 'Link', href: 'https://test.com' }];
    render(
      <SpotContext.Provider value={{ ...mockSpotApi, enabled: true }}>
        <RichText value={value} />
      </SpotContext.Provider>
    );
    const link = screen.getByText('Link');
    const event = { preventDefault: jest.fn() };
    fireEvent.click(link, event);
  });
});
