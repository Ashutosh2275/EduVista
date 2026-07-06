import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CollegeWithSlug } from '../services/collegeService';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from '../hooks/useAuth';

interface WishlistContextValue {
  colleges: CollegeWithSlug[];
  savedIds: Set<string>;
  count: number;
  isLoading: boolean;
  isSaved: (collegeId: string) => boolean;
  toggle: (collegeId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [colleges, setColleges] = useState<CollegeWithSlug[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setColleges([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setColleges(data);
    } catch {
      setColleges([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const savedIds = useMemo(() => new Set(colleges.map((c) => c.id)), [colleges]);

  const isSaved = useCallback((collegeId: string) => savedIds.has(collegeId), [savedIds]);

  const toggle = useCallback(
    async (collegeId: string) => {
      if (!isAuthenticated) return false;
      const exists = savedIds.has(collegeId);
      if (exists) {
        await wishlistService.removeCollege(collegeId);
      } else {
        await wishlistService.addCollege(collegeId);
      }
      await refresh();
      return !exists;
    },
    [isAuthenticated, savedIds, refresh]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      colleges,
      savedIds,
      count: colleges.length,
      isLoading,
      isSaved,
      toggle,
      refresh,
    }),
    [colleges, savedIds, isLoading, isSaved, toggle, refresh]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}
