/**
 * Search History Management
 * Handles local storage and database persistence for search history
 */

import { database } from '@repo/database';

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters?: Record<string, unknown>;
  resultCount: number;
  createdAt: Date;
  userId?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: Record<string, unknown>;
  alertEnabled: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Search History Service
 */
export class SearchHistoryService {
  private static readonly LOCAL_STORAGE_KEY = 'threadly_search_history';
  private static readonly MAX_LOCAL_HISTORY = 50;

  /**
   * Add search to local history
   */
  static addToLocalHistory(
    query: string,
    filters?: Record<string, unknown>,
    resultCount = 0
  ): void {
    if (typeof window === 'undefined') return;

    try {
      const history = SearchHistoryService.getLocalHistory();
      const item: SearchHistoryItem = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query: query.trim(),
        filters,
        resultCount,
        createdAt: new Date(),
      };

      // Remove duplicates and add new item
      const filtered = history.filter((h) => h.query !== item.query);
      const updated = [item, ...filtered].slice(
        0,
        SearchHistoryService.MAX_LOCAL_HISTORY
      );

      localStorage.setItem(
        SearchHistoryService.LOCAL_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  /**
   * Get local search history
   */
  static getLocalHistory(): SearchHistoryItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(
        SearchHistoryService.LOCAL_STORAGE_KEY
      );
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }))
        : [];
    } catch (error) {
      console.warn('Failed to load search history:', error);
      return [];
    }
  }

  /**
   * Clear local search history
   */
  static clearLocalHistory(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(SearchHistoryService.LOCAL_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }

  /**
   * Remove specific item from local history
   */
  static removeFromLocalHistory(query: string): void {
    if (typeof window === 'undefined') return;

    try {
      const history = SearchHistoryService.getLocalHistory();
      const filtered = history.filter((item) => item.query !== query);
      localStorage.setItem(
        SearchHistoryService.LOCAL_STORAGE_KEY,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.warn('Failed to remove from search history:', error);
    }
  }

  /**
   * Save search to database (for authenticated users)
   */
  static async saveToDatabase(
    userId: string,
    query: string,
    filters?: Record<string, unknown>,
    resultCount = 0
  ): Promise<SearchHistoryItem | null> {
    try {
      // Check if search already exists for this user
      const existing = await database.searchHistory.findFirst({
        where: {
          userId,
          query: query.trim(),
        },
      });

      if (existing) {
        // Update existing search
        const updated = await database.searchHistory.update({
          where: { id: existing.id },
          data: {
            resultCount,
            createdAt: new Date(),
          },
        });

        return {
          id: updated.id,
          query: updated.query,
          filters: (updated.filters as Record<string, unknown>) || undefined,
          resultCount: updated.resultCount,
          createdAt: updated.createdAt,
          userId: updated.userId,
        };
      }
      // Create new search history item
      const created = await database.searchHistory.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          query: query.trim(),
          filters: filters as any,
          resultCount,
        },
      });

      return {
        id: created.id,
        query: created.query,
        filters: (created.filters as Record<string, unknown>) || undefined,
        resultCount: created.resultCount,
        createdAt: created.createdAt,
        userId: created.userId,
      };
    } catch (error) {
      console.error('Failed to save search to database:', error);
      return null;
    }
  }

  /**
   * Get user's search history from database
   */
  static async getDatabaseHistory(
    userId: string,
    limit = 50
  ): Promise<SearchHistoryItem[]> {
    try {
      const history = await database.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return history.map((item) => ({
        id: item.id,
        query: item.query,
        filters: (item.filters as Record<string, unknown>) || undefined,
        resultCount: item.resultCount,
        createdAt: item.createdAt,
        userId: item.userId,
      }));
    } catch (error) {
      console.error('Failed to load search history from database:', error);
      return [];
    }
  }

  /**
   * Clear user's search history from database
   */
  static async clearDatabaseHistory(userId: string): Promise<boolean> {
    try {
      await database.searchHistory.deleteMany({
        where: { userId },
      });
      return true;
    } catch (error) {
      console.error('Failed to clear search history from database:', error);
      return false;
    }
  }
}

/**
 * Saved Searches Service
 */
export class SavedSearchService {
  /**
   * Save a search for later
   */
  static async saveSearch(
    userId: string,
    name: string,
    query: string,
    filters?: Record<string, unknown>,
    alertEnabled = false
  ): Promise<SavedSearch | null> {
    try {
      const saved = await database.savedSearch.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          name: name.trim(),
          query: query.trim(),
          filters: filters as any,
          alertEnabled,
          updatedAt: new Date(),
        },
      });

      return {
        id: saved.id,
        name: saved.name,
        query: saved.query,
        filters: (saved.filters as Record<string, unknown>) || undefined,
        alertEnabled: saved.alertEnabled,
        userId: saved.userId,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };
    } catch (error) {
      console.error('Failed to save search:', error);
      return null;
    }
  }

  /**
   * Get user's saved searches
   */
  static async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    try {
      const saved = await database.savedSearch.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      return saved.map((item) => ({
        id: item.id,
        name: item.name,
        query: item.query,
        filters: (item.filters as Record<string, unknown>) || undefined,
        alertEnabled: item.alertEnabled,
        userId: item.userId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
    } catch (error) {
      console.error('Failed to load saved searches:', error);
      return [];
    }
  }

  /**
   * Update saved search
   */
  static async updateSavedSearch(
    id: string,
    userId: string,
    updates: Partial<
      Omit<SavedSearch, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<SavedSearch | null> {
    try {
      const updated = await database.savedSearch.update({
        where: { id, userId },
        data: {
          ...updates,
          filters: updates.filters as any,
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        query: updated.query,
        filters: (updated.filters as Record<string, unknown>) || undefined,
        alertEnabled: updated.alertEnabled,
        userId: updated.userId,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      console.error('Failed to update saved search:', error);
      return null;
    }
  }

  /**
   * Delete saved search
   */
  static async deleteSavedSearch(id: string, userId: string): Promise<boolean> {
    try {
      await database.savedSearch.delete({
        where: { id, userId },
      });
      return true;
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      return false;
    }
  }

  /**
   * Toggle alerts for saved search
   */
  static async toggleAlerts(
    id: string,
    userId: string,
    enabled: boolean
  ): Promise<boolean> {
    try {
      await database.savedSearch.update({
        where: { id, userId },
        data: { alertEnabled: enabled },
      });
      return true;
    } catch (error) {
      console.error('Failed to toggle search alerts:', error);
      return false;
    }
  }
}
