/**
 * Storage Adapter Layer
 * Provides abstraction for activity persistence with LocalStorage/IndexedDB fallback
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { Activity, StorageMetadata } from '../types';

/**
 * Abstract storage adapter interface
 * Defines the contract for storage implementations
 */
export abstract class StorageAdapter {
  abstract read(): Promise<Activity[]>;
  abstract write(activities: Activity[]): Promise<void>;
  abstract getMetadata(): Promise<StorageMetadata | null>;
}

/**
 * LocalStorage implementation
 * Primary storage using browser's localStorage API
 */
export class LocalStorageAdapter extends StorageAdapter {
  private readonly key = 'activity-journal-activities';
  private readonly metaKey = 'activity-journal-meta';
  private readonly CURRENT_VERSION = 1;

  async read(): Promise<Activity[]> {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) {
        return [];
      }
      const activities = JSON.parse(data);
      if (!Array.isArray(activities)) {
        console.warn('Stored data is not an array, returning empty array');
        return [];
      }
      return activities;
    } catch (error) {
      console.error('Failed to read from LocalStorage:', error);
      return [];
    }
  }

  async write(activities: Activity[]): Promise<void> {
    try {
      const data = JSON.stringify(activities);
      localStorage.setItem(this.key, data);
      
      // Update metadata
      const metadata: StorageMetadata = {
        version: this.CURRENT_VERSION,
        lastUpdated: Date.now(),
        totalActivityCount: activities.length,
      };
      localStorage.setItem(this.metaKey, JSON.stringify(metadata));
    } catch (error) {
      // Check if quota exceeded
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' ||
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        console.error('LocalStorage quota exceeded, attempting fallback to IndexedDB');
        throw new StorageQuotaExceededError(
          'LocalStorage quota exceeded',
          'indexeddb'
        );
      }
      throw error;
    }
  }

  async getMetadata(): Promise<StorageMetadata | null> {
    try {
      const meta = localStorage.getItem(this.metaKey);
      if (!meta) {
        return null;
      }
      const parsed = JSON.parse(meta);
      
      // Validate metadata structure
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'version' in parsed &&
        'lastUpdated' in parsed &&
        'totalActivityCount' in parsed
      ) {
        return parsed as StorageMetadata;
      }
      
      return null;
    } catch {
      return null;
    }
  }
}

/**
 * IndexedDB implementation
 * Fallback storage for when LocalStorage quota is exceeded
 */
export class IndexedDBAdapter extends StorageAdapter {
  private readonly dbName = 'ActivityJournal';
  private readonly storeName = 'activities';
  private readonly metaStoreName = 'metadata';
  private readonly CURRENT_VERSION = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 2);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB: ' + request.error));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.metaStoreName)) {
          db.createObjectStore(this.metaStoreName, { keyPath: 'key' });
        }
      };
    });
  }

  async read(): Promise<Activity[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onerror = () => {
          reject(new Error('Failed to read from IndexedDB'));
        };

        request.onsuccess = () => {
          resolve(request.result || []);
        };
      });
    } catch (error) {
      console.error('Failed to read from IndexedDB:', error);
      return [];
    }
  }

  async write(activities: Activity[]): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [this.storeName, this.metaStoreName],
          'readwrite'
        );
        const store = transaction.objectStore(this.storeName);
        const metaStore = transaction.objectStore(this.metaStoreName);

        // Clear existing activities
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
          // Add all new activities
          activities.forEach((activity) => {
            store.add(activity);
          });

          // Update metadata
          const metadata: StorageMetadata = {
            version: this.CURRENT_VERSION,
            lastUpdated: Date.now(),
            totalActivityCount: activities.length,
          };
          metaStore.put({
            key: 'metadata',
            ...metadata,
          });

          transaction.oncomplete = () => {
            resolve();
          };

          transaction.onerror = () => {
            reject(new Error('Failed to write to IndexedDB'));
          };
        };

        clearRequest.onerror = () => {
          reject(new Error('Failed to clear IndexedDB'));
        };
      });
    } catch (error) {
      console.error('Failed to write to IndexedDB:', error);
      throw error;
    }
  }

  async getMetadata(): Promise<StorageMetadata | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(this.metaStoreName, 'readonly');
        const store = transaction.objectStore(this.metaStoreName);
        const request = store.get('metadata');

        request.onerror = () => {
          resolve(null);
        };

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            const { key, ...metadata } = result;
            resolve(metadata as StorageMetadata);
          } else {
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.error('Failed to read metadata from IndexedDB:', error);
      return null;
    }
  }
}

/**
 * Custom error for storage quota exceeded
 */
export class StorageQuotaExceededError extends Error {
  fallbackAdapter: string;

  constructor(message: string, fallbackAdapter: string) {
    super(message);
    this.name = 'StorageQuotaExceededError';
    this.fallbackAdapter = fallbackAdapter;
  }
}

/**
 * Smart storage manager that automatically falls back to IndexedDB
 * when LocalStorage quota is exceeded
 */
export class SmartStorageAdapter extends StorageAdapter {
  private localAdapter: LocalStorageAdapter;
  private indexedDBAdapter: IndexedDBAdapter;
  private currentAdapter: StorageAdapter;

  constructor() {
    super();
    this.localAdapter = new LocalStorageAdapter();
    this.indexedDBAdapter = new IndexedDBAdapter();
    this.currentAdapter = this.localAdapter;
  }

  async read(): Promise<Activity[]> {
    try {
      return await this.currentAdapter.read();
    } catch (error) {
      console.error('Failed to read from current adapter:', error);
      return [];
    }
  }

  async write(activities: Activity[]): Promise<void> {
    try {
      await this.currentAdapter.write(activities);
    } catch (error) {
      if (error instanceof StorageQuotaExceededError) {
        console.warn(
          'Switching from LocalStorage to IndexedDB due to quota exceeded'
        );
        this.currentAdapter = this.indexedDBAdapter;
        await this.currentAdapter.write(activities);
      } else {
        throw error;
      }
    }
  }

  async getMetadata(): Promise<StorageMetadata | null> {
    try {
      return await this.currentAdapter.getMetadata();
    } catch (error) {
      console.error('Failed to get metadata from current adapter:', error);
      return null;
    }
  }

  getCurrentAdapter(): StorageAdapter {
    return this.currentAdapter;
  }
}


/**
 * Custom hook for persisting activities with 300ms debounce
 * Handles automatic persistence with graceful error handling
 *
 * **Validates: Requirements 7.1, 7.4, 7.5, 7.9**
 *
 * @param activities - The current array of activities to persist
 * @param adapter - Storage adapter instance (defaults to new SmartStorageAdapter)
 * @param onError - Optional callback for handling storage errors
 *
 * @example
 * const [activities, setActivities] = useState<Activity[]>([]);
 * const { isPending, error } = usePersistedActivities(activities, adapter, handleError);
 *
 * @returns Object with { isPending, error } status
 */
export function usePersistedActivities(
  activities: Activity[],
  adapter: StorageAdapter = new SmartStorageAdapter(),
  onError?: (error: Error) => void
): { isPending: boolean; error: Error | null } {
  // Track persistence state for UI feedback
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Store timer reference to manage debounce
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Persist activities to storage with error handling
   */
  const persistActivities = useCallback(async () => {
    try {
      setIsPending(true);
      setError(null);

      // Write activities to storage
      await adapter.write(activities);
    } catch (err) {
      // Handle storage errors gracefully
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      console.error('Failed to persist activities:', error);

      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsPending(false);
    }
  }, [activities, adapter, onError]);

  /**
   * Effect to set up debounced persistence
   * Debounce delay is 300ms as per requirements
   */
  useEffect(() => {
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up new debounced timer
    timeoutRef.current = setTimeout(() => {
      persistActivities();
    }, 300);

    // Cleanup function to cancel pending persistence on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [activities, persistActivities]);

  return {
    isPending,
    error,
  };
}
