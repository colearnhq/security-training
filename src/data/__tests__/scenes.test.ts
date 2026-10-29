/**
 * Comprehensive tests for scenes data
 */
import { describe, test, expect } from '@jest/globals';
import { SCENES, CATEGORY_LABEL } from '../scenes';

describe('SCENES', () => {
  test('exports an array', () => {
    expect(Array.isArray(SCENES)).toBe(true);
  });

  test('has multiple scenes', () => {
    expect(SCENES.length).toBeGreaterThan(0);
  });

  test('all scenes have required fields', () => {
    SCENES.forEach(scene => {
      expect(scene.id).toBeDefined();
      expect(typeof scene.id).toBe('string');
      expect(scene.when).toBeDefined();
      expect(typeof scene.when).toBe('string');
      expect(scene.category).toBeDefined();
      expect(typeof scene.category).toBe('string');
      expect(scene.title).toBeDefined();
      expect(typeof scene.title).toBe('string');
      expect(scene.intro).toBeDefined();
      expect(typeof scene.intro).toBe('string');
      expect(scene.media).toBeDefined();
      expect(typeof scene.media).toBe('object');
      expect(scene.choices).toBeDefined();
      expect(Array.isArray(scene.choices)).toBe(true);
      expect(scene.lesson).toBeDefined();
      expect(typeof scene.lesson).toBe('string');
    });
  });

  test('all scene ids are unique', () => {
    const ids = SCENES.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('all scenes have at least one choice', () => {
    SCENES.forEach(scene => {
      expect(scene.choices.length).toBeGreaterThan(0);
    });
  });

  test('all choices have required fields', () => {
    SCENES.forEach(scene => {
      scene.choices.forEach(choice => {
        expect(choice.id).toBeDefined();
        expect(typeof choice.id).toBe('string');
        expect(choice.text).toBeDefined();
        expect(typeof choice.text).toBe('string');
        expect(choice.score).toBeDefined();
        expect(typeof choice.score).toBe('number');
        expect(choice.delta).toBeDefined();
        expect(typeof choice.delta).toBe('object');
        expect(choice.result).toBeDefined();
        expect(typeof choice.result).toBe('string');
        expect(choice.ripple).toBeDefined();
        expect(typeof choice.ripple).toBe('string');
      });
    });
  });

  test('all choice scores are valid', () => {
    const validScores = [-2, -1, 0, 1, 2];
    SCENES.forEach(scene => {
      scene.choices.forEach(choice => {
        expect(validScores).toContain(choice.score);
      });
    });
  });

  test('all media have kind field', () => {
    SCENES.forEach(scene => {
      expect(scene.media.kind).toBeDefined();
      expect(typeof scene.media.kind).toBe('string');
    });
  });

  test('includes ima-welcome scene', () => {
    const imaWelcome = SCENES.find(s => s.id === 'ima-welcome');
    expect(imaWelcome).toBeDefined();
    expect(imaWelcome?.category).toBe('phishing');
  });

  test('first scene is week 1', () => {
    const firstScene = SCENES[0];
    expect(firstScene.when).toContain('Week 1');
  });

  test('scenes with redFlags have valid structure', () => {
    SCENES.filter(s => s.redFlags).forEach(scene => {
      scene.redFlags?.forEach(flag => {
        expect(flag.id).toBeDefined();
        expect(typeof flag.id).toBe('string');
        expect(flag.label).toBeDefined();
        expect(typeof flag.label).toBe('string');
        expect(flag.explain).toBeDefined();
        expect(typeof flag.explain).toBe('string');
      });
    });
  });

  test('scenes with condition have valid function', () => {
    SCENES.filter(s => s.condition).forEach(scene => {
      expect(typeof scene.condition).toBe('function');
    });
  });

  test('all categories are valid', () => {
    const validCategories = Object.keys(CATEGORY_LABEL);
    SCENES.forEach(scene => {
      expect(validCategories).toContain(scene.category);
    });
  });

  test('all choice deltas have valid stats', () => {
    const validStats = ['security', 'business', 'career'];
    SCENES.forEach(scene => {
      scene.choices.forEach(choice => {
        Object.keys(choice.delta).forEach(stat => {
          expect(validStats).toContain(stat);
          expect(typeof choice.delta[stat as keyof typeof choice.delta]).toBe('number');
        });
      });
    });
  });

  test('choices with flags have string array', () => {
    SCENES.forEach(scene => {
      scene.choices.filter(c => c.flags).forEach(choice => {
        expect(Array.isArray(choice.flags)).toBe(true);
        choice.flags?.forEach(flag => {
          expect(typeof flag).toBe('string');
        });
      });
    });
  });
});

describe('CATEGORY_LABEL', () => {
  test('exports an object', () => {
    expect(typeof CATEGORY_LABEL).toBe('object');
    expect(CATEGORY_LABEL).not.toBeNull();
  });

  test('has labels for all scene categories', () => {
    const categories = new Set(SCENES.map(s => s.category));
    categories.forEach(cat => {
      expect(CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL]).toBeDefined();
    });
  });

  test('all labels are non-empty strings', () => {
    Object.values(CATEGORY_LABEL).forEach(label => {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });
});
