/**
 * Unit Tests for Storage Layer
 * Tests for LocalStorageAdapter, IndexedDBAdapter, and metadata management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Activity, StorageMetadata } from '../../types';
import {
  LocalStorageAdapter,
  IndexedDBAdapter,
  StorageQuotaExceededError,
  SmartStorageAdapter,
} from '../storage';

/**
 * Mock Activity for testing
 */
function createMockActivity(overrides?: Partial<Activity>): Activity {
  return {
    id: 'test-id-1',
    date: '2024-12-18',
    name: 'Test Activity',
    emoji: '🎯',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    completed: false,
    ...overrides,
  };
}

describe('LocalStorageAdapter - Metadata Management', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('write and getMetadata', () => {
    it('should create metadata with version, lastUpdated, and totalActivityCount', async () => {
      const activities = [
        createMockActivity({ id: 'id1' }),
        createMockActivity({ id: 'id2' }),
      ];

      await adapter.write(activities);
      const metadata = await adapter.getMetadata();

      expect(metadata).not.toBeNull();
      expect(metadata?.version).toBe(1);
      expect(metadata?.totalActivityCount).toBe(2);
      expect(typeof metadata?.lastUpdated).toBe('number');
      expect(metadata?.lastUpdated).toBeGreaterThan(0);
    });

    it('should update lastUpdated timestamp on each write', async () => {
      const activities1 = [createMockActivity({ id: 'id1' })];
      await adapter.write(activities1);
      const metadata1 = await adapter.getMetadata();

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const activities2 = [
        createMockActivity({ id: 'id1' }),
        createMockActivity({ id: 'id2' }),
      ];
      await adapter.write(activities2);
      const metadata2 = await adapter.getMetadata();

      expect(metadata2!.lastUpdated).toBeGreaterThan(metadata1!.lastUpdated);
    });

    it('should correctly track totalActivityCount with multiple writes', async () => {
      // Write 0 activities
      await adapter.write([]);
      let metadata = await adapter.getMetadata();
      expect(metadata?.totalActivityCount).toBe(0);

      // Write 1 activity
      await adapter.write([createMockActivity({ id: 'id1' })]);
      metadata = await adapter.getMetadata();
      expect(metadata?.totalActivityCount).toBe(1);

      // Write 5 activities
      const activities = Array.from({ length: 5 }, (_, i) =>
        createMockActivity({ id: `id${i + 1}` })
      );
      await adapter.write(activities);
      metadata = await adapter.getMetadata();
      expect(metadata?.totalActivityCount).toBe(5);
    });

    it('should maintain consistent version number', async () => {
      const activities = [createMockActivity({ id: 'id1' })];
      await adapter.write(activities);
      const metadata1 = await adapter.getMetadata();

      await adapter.write([
        createMockActivity({ id: 'id1' }),
        createMockActivity({ id: 'id2' }),
      ]);
      const metadata2 = await adapter.getMetadata();

      expect(metadata1?.version).toBe(1);
      expect(metadata2?.version).toBe(1);
    });
  });

  describe('getMetadata - edge cases', () => {
    it('should return null when no metadata exists', async () => {
      const metadata = await adapter.getMetadata();
      expect(metadata).toBeNull();
    });

    it('should return null when metadata is malformed', async () => {
      localStorage.setItem('activity-journal-meta', 'invalid json');
      const metadata = await adapter.getMetadata();
      expect(metadata).toBeNull();
    });

    it('should return null when metadata lacks required fields', async () => {
      localStorage.setItem(
        'activity-journal-meta',
        JSON.stringify({ version: 1 })
      );
      const metadata = await adapter.getMetadata();
      expect(metadata).toBeNull();
    });

    it('should validate all required metadata fields', async () => {
      const metadata: StorageMetadata = {
        version: 1,
        lastUpdated: Date.now(),
        totalActivityCount: 5,
      };
      localStorage.setItem('activity-journal-meta', JSON.stringify(metadata));

      const retrieved = await adapter.getMetadata();
      expect(retrieved?.version).toBe(1);
      expect(typeof retrieved?.lastUpdated).toBe('number');
      expect(retrieved?.totalActivityCount).toBe(5);
    });
  });

  describe('read and write with metadata', () => {
    it('should maintain activities and metadata together', async () => {
      const activities = [
        createMockActivity({ id: 'id1', name: 'Activity 1' }),
        createMockActivity({ id: 'id2', name: 'Activity 2' }),
      ];

      await adapter.write(activities);

      const read = await adapter.read();
      const metadata = await adapter.getMetadata();

      expect(read).toHaveLength(2);
      expect(metadata?.totalActivityCount).toBe(read.length);
      expect(read[0].name).toBe('Activity 1');
      expect(read[1].name).toBe('Activity 2');
    });

    it('should synchronize totalActivityCount with actual activity count', async () => {
      const activities = Array.from({ length: 10 }, (_, i) =>
        createMockActivity({ id: `id${i + 1}` })
      );
      await adapter.write(activities);

      const read = await adapter.read();
      const metadata = await adapter.getMetadata();

      expect(metadata?.totalActivityCount).toBe(read.length);
    });
  });

  describe('quota exceeded error handling', () => {
    it('should throw StorageQuotaExceededError with correct fallback adapter', async () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new DOMException('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      try {
        await adapter.write([createMockActivity()]);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(StorageQuotaExceededError);
        expect((error as StorageQuotaExceededError).fallbackAdapter).toBe('indexeddb');
      } finally {
        mockSetItem.mockRestore();
      }
    });
  });
});

describe('IndexedDBAdapter - Metadata Management', () => {
  let adapter: IndexedDBAdapter;

  beforeEach(() => {
    adapter = new IndexedDBAdapter();
  });

  afterEach(async () => {
    // Clean up IndexedDB after each test
    return new Promise((resolve) => {
      const request = indexedDB.deleteDatabase('ActivityJournal');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  });

  describe('write and getMetadata', () => {
    it('should store metadata when writing activities', async () => {
      const activities = [
        createMockActivity({ id: 'id1' }),
        createMockActivity({ id: 'id2' }),
      ];

      await adapter.write(activities);
      const metadata = await adapter.getMetadata();

      expect(metadata).not.toBeNull();
      expect(metadata?.version).toBe(1);
      expect(metadata?.totalActivityCount).toBe(2);
      expect(typeof metadata?.lastUpdated).toBe('number');
    });

    it('should maintain metadata structure in IndexedDB', async () => {
      const activities = Array.from({ length: 3 }, (_, i) =>
        createMockActivity({ id: `id${i + 1}` })
      );

      await adapter.write(activities);
      const metadata = await adapter.getMetadata();

      expect(metadata).toHaveProperty('version');
      expect(metadata).toHaveProperty('lastUpdated');
      expect(metadata).toHaveProperty('totalActivityCount');
    });

    it('should update metadata totalActivityCount on subsequent writes', async () => {
      await adapter.write([createMockActivity({ id: 'id1' })]);
      let metadata = await adapter.getMetadata();
      expect(metadata?.totalActivityCount).toBe(1);

      await adapter.write(
        Array.from({ length: 5 }, (_, i) =>
          createMockActivity({ id: `id${i + 1}` })
        )
      );
      metadata = await adapter.getMetadata();
      expect(metadata?.totalActivityCount).toBe(5);
    });
  });

  describe('getMetadata - edge cases', () => {
    it('should return null when no metadata exists', async () => {
      // Initialize DB but don't write anything
      await adapter.read();
      const metadata = await adapter.getMetadata();
      expect(metadata).toBeNull();
    });

    it('should handle missing metadata store gracefully', async () => {
      const metadata = await adapter.getMetadata();
      expect(metadata).toBeNull();
    });
  });
});

describe('SmartStorageAdapter - Metadata Management', () => {
  let adapter: SmartStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new SmartStorageAdapter();
  });

  afterEach(() => {
    localStorage.clear();
    return new Promise((resolve) => {
      const request = indexedDB.deleteDatabase('ActivityJournal');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  });

  describe('getMetadata with fallback', () => {
    it('should get metadata from LocalStorage adapter by default', async () => {
      const activities = [createMockActivity({ id: 'id1' })];
      await adapter.write(activities);

      const metadata = await adapter.getMetadata();
      expect(metadata).not.toBeNull();
      expect(metadata?.totalActivityCount).toBe(1);
    });

    it('should return null when no metadata is available', async () => {
      const metadata = await adapter.getMetadata();
      expect(metadata).toBeNull();
    });

    it('should handle errors gracefully when getting metadata', async () => {
      // Don't write anything, just try to get metadata
      const metadata = await adapter.getMetadata();
      expect(metadata).toBeNull();
    });
  });
});

describe('Storage Metadata Type Validation', () => {
  describe('StorageMetadata structure', () => {
    it('should have all required fields', () => {
      const metadata: StorageMetadata = {
        version: 1,
        lastUpdated: Date.now(),
        totalActivityCount: 10,
      };

      expect(metadata.version).toBeDefined();
      expect(metadata.lastUpdated).toBeDefined();
      expect(metadata.totalActivityCount).toBeDefined();
    });

    it('should have correct field types', () => {
      const now = Date.now();
      const metadata: StorageMetadata = {
        version: 1,
        lastUpdated: now,
        totalActivityCount: 5,
      };

      expect(typeof metadata.version).toBe('number');
      expect(typeof metadata.lastUpdated).toBe('number');
      expect(typeof metadata.totalActivityCount).toBe('number');
    });

    it('should validate positive numbers for version and count', () => {
      const metadata: StorageMetadata = {
        version: 1,
        lastUpdated: 1000000000,
        totalActivityCount: 0, // Can be 0 but must be >= 0
      };

      expect(metadata.version).toBeGreaterThanOrEqual(0);
      expect(metadata.totalActivityCount).toBeGreaterThanOrEqual(0);
      expect(metadata.lastUpdated).toBeGreaterThan(0);
    });
  });
});
