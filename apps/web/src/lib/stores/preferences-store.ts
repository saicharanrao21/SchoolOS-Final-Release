'use client';

import { useState, useEffect } from 'react';
import { DensityMode } from '../tokens';

export interface UserPreferences {
  density: DensityMode;
  theme: 'LIGHT' | 'DARK';
  sidebarCollapsed: boolean;
  favorites: string[]; // Hrefs or IDs
  recentlyVisited: { label: string; href: string; timestamp: number }[];
  pinnedItems: string[];
}

const DEFAULT_PREFERENCES: UserPreferences = {
  density: 'DEFAULT',
  theme: 'LIGHT',
  sidebarCollapsed: false,
  favorites: ['/management/dashboard', '/management/students', '/management/finance/collection'],
  recentlyVisited: [],
  pinnedItems: [],
};

const STORAGE_KEY = 'schoolos_user_preferences_v1';

export function getStoredPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PREFERENCES;
  }
}

export function saveStoredPreferences(prefs: UserPreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save user preferences', e);
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    setPreferences(getStoredPreferences());
  }, []);

  const updatePreferences = (updater: (prev: UserPreferences) => UserPreferences) => {
    setPreferences((prev) => {
      const next = updater(prev);
      saveStoredPreferences(next);
      return next;
    });
  };

  const setDensity = (density: DensityMode) => {
    updatePreferences((p) => ({ ...p, density }));
  };

  const toggleSidebar = () => {
    updatePreferences((p) => ({ ...p, sidebarCollapsed: !p.sidebarCollapsed }));
  };

  const addFavorite = (href: string) => {
    updatePreferences((p) => ({
      ...p,
      favorites: p.favorites.includes(href) ? p.favorites : [...p.favorites, href],
    }));
  };

  const removeFavorite = (href: string) => {
    updatePreferences((p) => ({
      ...p,
      favorites: p.favorites.filter((f) => f !== href),
    }));
  };

  const recordVisit = (item: { label: string; href: string }) => {
    updatePreferences((p) => {
      const filtered = p.recentlyVisited.filter((v) => v.href !== item.href);
      return {
        ...p,
        recentlyVisited: [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, 10),
      };
    });
  };

  return {
    preferences,
    setDensity,
    toggleSidebar,
    addFavorite,
    removeFavorite,
    recordVisit,
  };
}
