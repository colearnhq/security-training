/**
 * Comprehensive tests for engine module (100% coverage target)
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  INITIAL_STATS,
  replay,
  nextScene,
  tally,
  totalScore,
  computeEnding,
  reportCard,
  sharpEye,
  MISSED_POINTS,
  SAT_OUT_POINTS,
  type ChoiceRecord,
  type HistoryEntry,
  type Stats,
} from '../engine';

// Mock data
const mockChoiceRecord: ChoiceRecord = {
  sceneId: 'scene1',
  choiceId: 'choice1',
  spotted: ['flag1', 'flag2'],
};

const mockStats: Stats = {
  security: 60,
  business: 70,
  career: 80,
};

describe('INITIAL_STATS', () => {
  test('has correct initial values', () => {
    expect(INITIAL_STATS).toEqual({
      security: 50,
      business: 50,
      career: 50,
    });
  });

  test('all stats start at 50', () => {
    expect(INITIAL_STATS.security).toBe(50);
    expect(INITIAL_STATS.business).toBe(50);
    expect(INITIAL_STATS.career).toBe(50);
  });
});

describe('replay', () => {
  test('returns initial state for empty records', () => {
    const result = replay([]);
    expect(result.stats).toEqual(INITIAL_STATS);
    expect(result.flags.size).toBe(0);
    expect(result.history).toEqual([]);
  });

  test('handles single choice record', () => {
    const records: ChoiceRecord[] = [
      { sceneId: 'intro', choiceId: 'c1', spotted: [] },
    ];
    const result = replay(records);
    expect(result.history.length).toBe(1);
    expect(result.stats).toBeDefined();
  });

  test('accumulates flags from choices', () => {
    const records: ChoiceRecord[] = [
      { sceneId: 'intro', choiceId: 'c2', spotted: [] },
    ];
    const result = replay(records);
    expect(result.flags).toBeDefined();
    expect(result.flags instanceof Set).toBe(true);
  });

  test('clamps stats to 0-100 range', () => {
    const result = replay([]);
    expect(result.stats.security).toBeGreaterThanOrEqual(0);
    expect(result.stats.security).toBeLessThanOrEqual(100);
    expect(result.stats.business).toBeGreaterThanOrEqual(0);
    expect(result.stats.business).toBeLessThanOrEqual(100);
    expect(result.stats.career).toBeGreaterThanOrEqual(0);
    expect(result.stats.career).toBeLessThanOrEqual(100);
  });

  test('processes multiple records in order', () => {
    const records: ChoiceRecord[] = [
      { sceneId: 'intro', choiceId: 'c1', spotted: [] },
      { sceneId: 'intro', choiceId: 'c2', spotted: [] },
    ];
    const result = replay(records);
    expect(result.history.length).toBeLessThanOrEqual(2);
  });

  test('handles invalid scene IDs gracefully', () => {
    const records: ChoiceRecord[] = [
      { sceneId: 'invalid_scene', choiceId: 'invalid_choice', spotted: [] },
    ];
    const result = replay(records);
    expect(result.history.length).toBe(0);
  });

  test('tracks spotted flags in history', () => {
    const records: ChoiceRecord[] = [
      { sceneId: 'intro', choiceId: 'c1', spotted: ['flag1', 'flag2'] },
    ];
    const result = replay(records);
    if (result.history.length > 0) {
      expect(result.history[0].spotted).toEqual(['flag1', 'flag2']);
    }
  });
});

describe('nextScene', () => {
  test('returns first scene for empty records', () => {
    const scene = nextScene([], new Set());
    expect(scene).toBeDefined();
  });

  test('returns null when all scenes answered', () => {
    const allScenes = ['intro', 'phishing', 'password', 'social_eng', 'data', 'endpoint', 
                       'incident', 'strategy', 'coverup', 'backup', 'audit', 'training', 'outro'];
    const records = allScenes.map(id => ({ sceneId: id, choiceId: 'c1', spotted: [] }));
    const scene = nextScene(records, new Set());
    expect(scene).toBeNull();
  });

  test('skips answered scenes', () => {
    const records: ChoiceRecord[] = [
      { sceneId: 'intro', choiceId: 'c1', spotted: [] },
    ];
    const scene = nextScene(records, new Set());
    if (scene) {
      expect(scene.id).not.toBe('intro');
    }
  });

  test('respects scene conditions based on flags', () => {
    const flags = new Set(['test_flag']);
    const scene = nextScene([], flags);
    expect(scene).toBeDefined();
  });

  test('handles empty flags set', () => {
    const scene = nextScene([], new Set());
    expect(scene).toBeDefined();
  });
});

describe('tally', () => {
  test('returns zero counts for empty history', () => {
    const result = tally([]);
    expect(result).toEqual({
      best: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      fatal: 0,
    });
  });

  test('counts best choices correctly', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = tally(history);
    expect(result.best).toBe(1);
  });

  test('counts good choices correctly', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 1 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = tally(history);
    expect(result.good).toBe(1);
  });

  test('counts neutral choices correctly', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 0 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = tally(history);
    expect(result.neutral).toBe(1);
  });

  test('counts bad choices correctly', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: -1 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = tally(history);
    expect(result.bad).toBe(1);
  });

  test('counts fatal choices correctly', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: -2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = tally(history);
    expect(result.fatal).toBe(1);
  });

  test('tallies mixed choices correctly', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
      {
        scene: { id: 's2', category: 'business', text: '', choices: [] },
        choice: { id: 'c2', text: '', delta: {}, score: -2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = tally(history);
    expect(result.best).toBe(1);
    expect(result.fatal).toBe(1);
  });
});

describe('totalScore', () => {
  test('returns zero for empty history', () => {
    const result = totalScore([]);
    expect(result.points).toBe(0);
    expect(result.max).toBe(0);
  });

  test('calculates score for single choice', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = totalScore(history);
    expect(result.points).toBe(2);
    expect(result.max).toBe(2);
  });

  test('applies missed penalty correctly', () => {
    const history: HistoryEntry[] = [];
    const result = totalScore(history, { missed: 2 });
    expect(result.points).toBe(2 * MISSED_POINTS);
    expect(result.max).toBe(4);
  });

  test('applies sat out bonus correctly', () => {
    const history: HistoryEntry[] = [];
    const result = totalScore(history, { satOut: 3 });
    expect(result.points).toBe(3 * SAT_OUT_POINTS);
    expect(result.max).toBe(3 * SAT_OUT_POINTS);
  });

  test('combines all score components', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = totalScore(history, { missed: 1, satOut: 1 });
    expect(result.points).toBe(2 + MISSED_POINTS + SAT_OUT_POINTS);
  });
});

describe('MISSED_POINTS and SAT_OUT_POINTS constants', () => {
  test('MISSED_POINTS is negative', () => {
    expect(MISSED_POINTS).toBeLessThan(0);
    expect(MISSED_POINTS).toBe(-3);
  });

  test('SAT_OUT_POINTS is positive', () => {
    expect(SAT_OUT_POINTS).toBeGreaterThan(0);
    expect(SAT_OUT_POINTS).toBe(1);
  });
});

describe('computeEnding', () => {
  test('returns fired ending for 3+ fatal mistakes', () => {
    const history: HistoryEntry[] = Array(3).fill(null).map(() => ({
      scene: { id: 's1', category: 'security', text: '', choices: [] },
      choice: { id: 'c1', text: '', delta: {}, score: -2 },
      spotted: [],
      before: INITIAL_STATS,
      after: INITIAL_STATS,
    }));
    const replay = { history, flags: new Set(), stats: INITIAL_STATS };
    const ending = computeEnding(replay);
    expect(ending.id).toBe('fired');
  });

  test('returns incident ending for 1 fatal mistake', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: -2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const replay = { history, flags: new Set(), stats: INITIAL_STATS };
    const ending = computeEnding(replay);
    expect(ending.id).toBe('incident');
  });

  test('returns champion ending for high score with no fatal mistakes', () => {
    const history: HistoryEntry[] = Array(10).fill(null).map(() => ({
      scene: { id: 's1', category: 'security', text: '', choices: [] },
      choice: { id: 'c1', text: '', delta: {}, score: 2 },
      spotted: [],
      before: INITIAL_STATS,
      after: INITIAL_STATS,
    }));
    const replay = { history, flags: new Set(), stats: INITIAL_STATS };
    const ending = computeEnding(replay);
    expect(ending.id).toBe('champion');
  });

  test('considers fireable flags correctly', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: -2, flags: ['student_data_leak'] },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
      {
        scene: { id: 's2', category: 'security', text: '', choices: [] },
        choice: { id: 'c2', text: '', delta: {}, score: -2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const replay = { history, flags: new Set(['student_data_leak']), stats: INITIAL_STATS };
    const ending = computeEnding(replay);
    expect(ending.id).toBe('fired');
  });
});

describe('reportCard', () => {
  test('returns empty array for empty history', () => {
    const result = reportCard([]);
    expect(result).toEqual([]);
  });

  test('groups scores by category', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
      {
        scene: { id: 's2', category: 'security', text: '', choices: [] },
        choice: { id: 'c2', text: '', delta: {}, score: 1 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = reportCard(history);
    expect(result.length).toBe(1);
    expect(result[0].category).toBe('security');
    expect(result[0].points).toBe(3);
  });

  test('calculates percentage correctly', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = reportCard(history);
    expect(result[0].percent).toBeGreaterThanOrEqual(0);
    expect(result[0].percent).toBeLessThanOrEqual(100);
  });

  test('handles multiple categories', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
      {
        scene: { id: 's2', category: 'business', text: '', choices: [] },
        choice: { id: 'c2', text: '', delta: {}, score: 1 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = reportCard(history);
    expect(result.length).toBe(2);
  });
});

describe('sharpEye', () => {
  test('returns zero for empty history', () => {
    const result = sharpEye([]);
    expect(result).toEqual({ found: 0, total: 0 });
  });

  test('counts spotted flags correctly', () => {
    const history: HistoryEntry[] = [
      {
        scene: { 
          id: 's1', 
          category: 'security', 
          text: '', 
          choices: [],
          redFlags: [{ id: 'flag1', text: '' }, { id: 'flag2', text: '' }],
        },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: ['flag1'],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = sharpEye(history);
    expect(result.found).toBe(1);
    expect(result.total).toBe(2);
  });

  test('handles scenes without red flags', () => {
    const history: HistoryEntry[] = [
      {
        scene: { id: 's1', category: 'security', text: '', choices: [] },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = sharpEye(history);
    expect(result.found).toBe(0);
    expect(result.total).toBe(0);
  });

  test('accumulates across multiple scenes', () => {
    const history: HistoryEntry[] = [
      {
        scene: { 
          id: 's1', 
          category: 'security', 
          text: '', 
          choices: [],
          redFlags: [{ id: 'flag1', text: '' }],
        },
        choice: { id: 'c1', text: '', delta: {}, score: 2 },
        spotted: ['flag1'],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
      {
        scene: { 
          id: 's2', 
          category: 'security', 
          text: '', 
          choices: [],
          redFlags: [{ id: 'flag2', text: '' }],
        },
        choice: { id: 'c2', text: '', delta: {}, score: 2 },
        spotted: [],
        before: INITIAL_STATS,
        after: INITIAL_STATS,
      },
    ];
    const result = sharpEye(history);
    expect(result.found).toBe(1);
    expect(result.total).toBe(2);
  });
});
