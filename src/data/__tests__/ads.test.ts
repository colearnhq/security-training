/**
 * Comprehensive tests for ads module
 */
import { describe, test, expect } from '@jest/globals';
import { ADS, AD_BY_ID, AD_AFTER, isAd } from '../ads';

describe('ADS constant', () => {
  test('is an array', () => {
    expect(Array.isArray(ADS)).toBe(true);
  });

  test('has at least one ad', () => {
    expect(ADS.length).toBeGreaterThan(0);
  });

  test('all ads have required fields', () => {
    for (const ad of ADS) {
      expect(ad.id).toBeDefined();
      expect(ad.after).toBeDefined();
      expect(ad.kicker).toBeDefined();
      expect(ad.title).toBeDefined();
      expect(ad.intro).toBeDefined();
      expect(Array.isArray(ad.products)).toBe(true);
      expect(Array.isArray(ad.reasons)).toBe(true);
      expect(ad.footnote).toBeDefined();
    }
  });

  test('all products have required fields', () => {
    for (const ad of ADS) {
      for (const product of ad.products) {
        expect(product.name).toBeDefined();
        expect(product.emoji).toBeDefined();
        expect(product.tagline).toBeDefined();
        expect(product.url).toBeDefined();
      }
    }
  });

  test('all reasons have required fields', () => {
    for (const ad of ADS) {
      for (const reason of ad.reasons) {
        expect(reason.icon).toBeDefined();
        expect(reason.title).toBeDefined();
        expect(reason.text).toBeDefined();
      }
    }
  });

  test('all product URLs are valid', () => {
    const urlPattern = /^https?:\/\/.+/;
    for (const ad of ADS) {
      for (const product of ad.products) {
        expect(urlPattern.test(product.url)).toBe(true);
      }
    }
  });

  test('all ads have unique IDs', () => {
    const ids = ADS.map(ad => ad.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('ad IDs follow naming convention', () => {
    for (const ad of ADS) {
      expect(ad.id.startsWith('ad-')).toBe(true);
    }
  });
});

describe('AD_BY_ID', () => {
  test('is an object', () => {
    expect(typeof AD_BY_ID).toBe('object');
  });

  test('contains all ads by ID', () => {
    for (const ad of ADS) {
      expect(AD_BY_ID[ad.id]).toBeDefined();
      expect(AD_BY_ID[ad.id]).toBe(ad);
    }
  });

  test('has same number of entries as ADS array', () => {
    expect(Object.keys(AD_BY_ID).length).toBe(ADS.length);
  });

  test('can lookup ad by ID', () => {
    const firstAd = ADS[0];
    const lookedUp = AD_BY_ID[firstAd.id];
    expect(lookedUp).toEqual(firstAd);
  });

  test('returns undefined for non-existent ID', () => {
    expect(AD_BY_ID['non-existent-id']).toBeUndefined();
  });
});

describe('AD_AFTER', () => {
  test('is an object', () => {
    expect(typeof AD_AFTER).toBe('object');
  });

  test('maps scene IDs to ads', () => {
    for (const ad of ADS) {
      expect(AD_AFTER[ad.after]).toBeDefined();
      expect(AD_AFTER[ad.after]).toBe(ad);
    }
  });

  test('has same number of entries as ADS array', () => {
    expect(Object.keys(AD_AFTER).length).toBe(ADS.length);
  });

  test('can lookup ad by scene ID it follows', () => {
    const firstAd = ADS[0];
    const lookedUp = AD_AFTER[firstAd.after];
    expect(lookedUp).toEqual(firstAd);
  });

  test('returns undefined for scene with no ad', () => {
    expect(AD_AFTER['non-existent-scene']).toBeUndefined();
  });
});

describe('isAd', () => {
  test('returns true for valid ad ID', () => {
    const adId = ADS[0].id;
    expect(isAd(adId)).toBe(true);
  });

  test('returns false for non-ad ID', () => {
    expect(isAd('not-an-ad')).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isAd(undefined)).toBe(false);
  });

  test('returns false for scene ID (not ad ID)', () => {
    expect(isAd('intro')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isAd('')).toBe(false);
  });

  test('returns true for all ad IDs in ADS array', () => {
    for (const ad of ADS) {
      expect(isAd(ad.id)).toBe(true);
    }
  });

  test('is case-sensitive', () => {
    const adId = ADS[0].id;
    expect(isAd(adId.toUpperCase())).toBe(false);
  });
});
