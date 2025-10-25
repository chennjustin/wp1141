import { useState, useCallback } from 'react';
import type { PlacesSearchResult } from '../types';
import { searchApi } from '../services/data';

export const useSearch = () => {
  const [results, setResults] = useState<PlacesSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await searchApi.textSearch(query);
      
      if (response.data) {
        setResults(response.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('搜尋失敗:', err);
      setError('搜尋失敗，請稍後再試');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
};
