/**
 * Comprehensive tests for endings data
 */
import { describe, test, expect } from '@jest/globals';
import { ENDINGS, ENDING_BY_ID } from '../endings';

describe('ENDINGS', () => {
  test('exports an array', () => {
    expect(Array.isArray(ENDINGS)).toBe(true);
  });

  test('has at least one ending', () => {
    expect(ENDINGS.length).toBeGreaterThan(0);
  });

  test('all endings have required fields', () => {
    ENDINGS.forEach(ending => {
      expect(ending.id).toBeDefined();
      expect(typeof ending.id).toBe('string');
      expect(ending.emoji).toBeDefined();
      expect(typeof ending.emoji).toBe('string');
      expect(ending.title).toBeDefined();
      expect(typeof ending.title).toBe('string');
      expect(ending.year).toBeDefined();
      expect(typeof ending.year).toBe('number');
      expect(ending.tone).toBeDefined();
      expect(typeof ending.tone).toBe('string');
      expect(ending.headline).toBeDefined();
      expect(typeof ending.headline).toBe('string');
      expect(ending.story).toBeDefined();
      expect(typeof ending.story).toBe('string');
    });
  });

  test('all ending ids are unique', () => {
    const ids = ENDINGS.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('includes champion ending', () => {
    const champion = ENDINGS.find(e => e.id === 'champion');
    expect(champion).toBeDefined();
    expect(champion?.tone).toBe('good');
  });

  test('includes scars ending', () => {
    const scars = ENDINGS.find(e => e.id === 'scars');
    expect(scars).toBeDefined();
    expect(scars?.tone).toBe('meh');
  });

  test('includes incident ending', () => {
    const incident = ENDINGS.find(e => e.id === 'incident');
    expect(incident).toBeDefined();
    expect(incident?.tone).toBe('bad');
  });

  test('includes fired ending', () => {
    const fired = ENDINGS.find(e => e.id === 'fired');
    expect(fired).toBeDefined();
    expect(fired?.tone).toBe('terrible');
  });

  test('all endings have valid year', () => {
    ENDINGS.forEach(ending => {
      expect(ending.year).toBeGreaterThanOrEqual(2026);
      expect(ending.year).toBeLessThanOrEqual(2030);
    });
  });

  test('all endings have tone field', () => {
    const validTones = ['good', 'meh', 'bad', 'terrible'];
    ENDINGS.forEach(ending => {
      expect(validTones).toContain(ending.tone);
    });
  });

  test('all endings have non-empty strings', () => {
    ENDINGS.forEach(ending => {
      expect(ending.id.length).toBeGreaterThan(0);
      expect(ending.emoji.length).toBeGreaterThan(0);
      expect(ending.title.length).toBeGreaterThan(0);
      expect(ending.headline.length).toBeGreaterThan(0);
      expect(ending.story.length).toBeGreaterThan(0);
    });
  });
});

describe('ENDING_BY_ID', () => {
  test('exports an object', () => {
    expect(typeof ENDING_BY_ID).toBe('object');
    expect(ENDING_BY_ID).not.toBeNull();
  });

  test('contains all endings by id', () => {
    ENDINGS.forEach(ending => {
      expect(ENDING_BY_ID[ending.id]).toBeDefined();
      expect(ENDING_BY_ID[ending.id]).toEqual(ending);
    });
  });

  test('has same number of entries as ENDINGS', () => {
    expect(Object.keys(ENDING_BY_ID).length).toBe(ENDINGS.length);
  });

  test('champion ending is accessible by id', () => {
    expect(ENDING_BY_ID['champion']).toBeDefined();
    expect(ENDING_BY_ID['champion'].title).toContain('Champion');
  });

  test('fired ending is accessible by id', () => {
    expect(ENDING_BY_ID['fired']).toBeDefined();
    expect(ENDING_BY_ID['fired'].title).toContain('fired');
  });

  test('all values are ending objects', () => {
    Object.values(ENDING_BY_ID).forEach(ending => {
      expect(ending.id).toBeDefined();
      expect(ending.emoji).toBeDefined();
      expect(ending.title).toBeDefined();
      expect(ending.year).toBeDefined();
      expect(ending.tone).toBeDefined();
      expect(ending.headline).toBeDefined();
      expect(ending.story).toBeDefined();
    });
  });
});
