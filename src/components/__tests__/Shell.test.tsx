/**
 * Comprehensive tests for Shell component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import { Shell } from '../Shell';

describe('Shell Component', () => {
  test('renders without crashing', () => {
    render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('renders brand logo', () => {
    render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    const logo = screen.getByAltText('Colearn');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/colearn-logo.svg');
  });

  test('renders brand name', () => {
    render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    expect(screen.getByText('Security Training')).toBeInTheDocument();
  });

  test('renders children content', () => {
    render(
      <Shell>
        <div>Test Content</div>
      </Shell>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders multiple children', () => {
    render(
      <Shell>
        <div>Content 1</div>
        <div>Content 2</div>
      </Shell>
    );
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    expect(screen.getByText(/Made for Colearn's IT security training/)).toBeInTheDocument();
  });

  test('footer mentions fictional scenarios', () => {
    render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    expect(screen.getByText(/Fictional scenarios/)).toBeInTheDocument();
  });

  test('brand button is disabled when onBrand not provided', () => {
    render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    const button = screen.getByRole('button', { name: /Security Training/ });
    expect(button).toBeDisabled();
  });

  test('brand button is enabled when onBrand provided', () => {
    const onBrand = jest.fn();
    render(
      <Shell onBrand={onBrand}>
        <div>Content</div>
      </Shell>
    );
    const button = screen.getByRole('button', { name: /Security Training/ });
    expect(button).not.toBeDisabled();
  });

  test('calls onBrand when brand clicked', () => {
    const onBrand = jest.fn();
    render(
      <Shell onBrand={onBrand}>
        <div>Content</div>
      </Shell>
    );
    fireEvent.click(screen.getByRole('button', { name: /Security Training/ }));
    expect(onBrand).toHaveBeenCalled();
  });

  test('renders pills when provided', () => {
    render(
      <Shell pills={<span>Test Pill</span>}>
        <div>Content</div>
      </Shell>
    );
    expect(screen.getByText('Test Pill')).toBeInTheDocument();
  });

  test('does not render pills section when not provided', () => {
    const { container } = render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    expect(container.querySelector('.header-pills')).not.toBeInTheDocument();
  });

  test('applies wide class when wide prop is true', () => {
    const { container } = render(
      <Shell wide={true}>
        <div>Content</div>
      </Shell>
    );
    expect(container.querySelector('.app.wide')).toBeInTheDocument();
  });

  test('does not apply wide class by default', () => {
    const { container } = render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    expect(container.querySelector('.app.wide')).not.toBeInTheDocument();
  });

  test('renders header with correct structure', () => {
    const { container } = render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    expect(container.querySelector('header.header')).toBeInTheDocument();
  });

  test('renders main element', () => {
    const { container } = render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  test('children are rendered inside main element', () => {
    const { container } = render(
      <Shell>
        <div data-testid="child">Content</div>
      </Shell>
    );
    const main = container.querySelector('main');
    expect(main).toContainElement(screen.getByTestId('child'));
  });
});
