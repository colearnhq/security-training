/**
 * Comprehensive tests for client module
 */
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { ApiError, hostIdentity, playerIdentity } from '../client';

describe('ApiError', () => {
  test('creates error with status and message', () => {
    const error = new ApiError(404, 'Not found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
  });

  test('extends Error class', () => {
    const error = new ApiError(500, 'Server error');
    expect(error instanceof Error).toBe(true);
  });

  test('has correct name', () => {
    const error = new ApiError(400, 'Bad request');
    expect(error.name).toBe('Error');
  });
});

describe('hostIdentity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns null when no identity stored', () => {
    const result = hostIdentity.get();
    expect(result).toBeNull();
  });

  test('sets and gets identity', () => {
    const identity = { pin: '123456', hostKey: 'abc123' };
    hostIdentity.set(identity);
    const result = hostIdentity.get();
    expect(result).toEqual(identity);
  });

  test('clears identity', () => {
    const identity = { pin: '123456', hostKey: 'abc123' };
    hostIdentity.set(identity);
    hostIdentity.clear();
    const result = hostIdentity.get();
    expect(result).toBeNull();
  });

  test('persists across reads', () => {
    const identity = { pin: '654321', hostKey: 'xyz789' };
    hostIdentity.set(identity);
    const result1 = hostIdentity.get();
    const result2 = hostIdentity.get();
    expect(result1).toEqual(identity);
    expect(result2).toEqual(identity);
  });

  test('handles invalid JSON gracefully', () => {
    localStorage.setItem('colearn-security-quest:host', 'invalid json');
    const result = hostIdentity.get();
    expect(result).toBeNull();
  });
});

describe('playerIdentity', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('returns null when no identity stored', () => {
    const result = playerIdentity.get();
    expect(result).toBeNull();
  });

  test('sets and gets identity', () => {
    const identity = {
      pin: '123456',
      playerId: 'player1',
      name: 'Test Player',
      joinedStep: 0,
    };
    playerIdentity.set(identity);
    const result = playerIdentity.get();
    expect(result).toEqual(identity);
  });

  test('clears identity', () => {
    const identity = {
      pin: '123456',
      playerId: 'player1',
      name: 'Test Player',
      joinedStep: 0,
    };
    playerIdentity.set(identity);
    playerIdentity.clear();
    const result = playerIdentity.get();
    expect(result).toBeNull();
  });

  test('stores in sessionStorage not localStorage', () => {
    const identity = {
      pin: '123456',
      playerId: 'player1',
      name: 'Test Player',
      joinedStep: 5,
    };
    playerIdentity.set(identity);
    expect(sessionStorage.getItem('colearn-security-quest:player')).toBeTruthy();
    expect(localStorage.getItem('colearn-security-quest:player')).toBeNull();
  });

  test('handles invalid JSON gracefully', () => {
    sessionStorage.setItem('colearn-security-quest:player', 'invalid json');
    const result = playerIdentity.get();
    expect(result).toBeNull();
  });

  test('handles joinedStep correctly', () => {
    const identity = {
      pin: '999999',
      playerId: 'p2',
      name: 'Player Two',
      joinedStep: 10,
    };
    playerIdentity.set(identity);
    const result = playerIdentity.get();
    expect(result?.joinedStep).toBe(10);
  });
});
