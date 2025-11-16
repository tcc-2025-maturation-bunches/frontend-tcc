import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllInferenceHistory } from '../api/inferenceApi';

const usePaginatedInferences = (userId, itemsPerPage = 50, initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [cursors, setCursors] = useState([null]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [mostRecentInference, setMostRecentInference] = useState(null);
  
  const isInitializedRef = useRef(false);

  const loadPage = useCallback(async (cursor, currentFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getAllInferenceHistory(cursor, itemsPerPage, currentFilters);

      setData(response.items || []);
      setNextCursor(response.next_cursor || null);
      setHasMore(response.has_more || false);
      
      if (cursor === null && Object.keys(currentFilters).every(key => !currentFilters[key])) {
        if (response.items && response.items.length > 0) {
          setMostRecentInference(response.items[0]);
        } else {
          setMostRecentInference(null);
        }
      }

    } catch (err) {
      console.error('Error loading page:', err);
      setError(err.message || 'Erro ao carregar dados');
      setData([]);
      setNextCursor(null);
      setHasMore(false);
      setMostRecentInference(null);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, filters]);

  const goToNextPage = useCallback(() => {
    if (!hasMore || !nextCursor) return;
    
    const newCursors = [...cursors, nextCursor];
    setCursors(newCursors);
    setCurrentCursorIndex(newCursors.length - 1);
    loadPage(nextCursor, filters);
  }, [hasMore, nextCursor, cursors, loadPage, filters]);

  const goToPreviousPage = useCallback(() => {
    if (currentCursorIndex <= 0) return;
    
    const previousCursorIndex = currentCursorIndex - 1;
    const previousCursor = cursors[previousCursorIndex];
    setCurrentCursorIndex(previousCursorIndex);
    loadPage(previousCursor, filters);
  }, [currentCursorIndex, cursors, loadPage, filters]);

  const refreshCurrentPage = useCallback(() => {
    const currentCursor = cursors[currentCursorIndex];
    loadPage(currentCursor, filters);
  }, [cursors, currentCursorIndex, filters, loadPage]);

  const resetPagination = useCallback(() => {
    setCursors([null]);
    setCurrentCursorIndex(0);
    setNextCursor(null);
    setData([]);
    setHasMore(false);
    loadPage(null, filters);
  }, [loadPage, filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setCursors([null]);
    setCurrentCursorIndex(0);
    loadPage(null, newFilters);
  }, [loadPage]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCursors([null]);
    setCurrentCursorIndex(0);
    loadPage(null, {});
  }, [loadPage]);

  useEffect(() => {
    if (userId) {
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
      }
      loadPage(null, filters);
    } else {
      setData([]);
      setCursors([null]);
      setCurrentCursorIndex(0);
      setIsLoading(false);
    }
  }, [userId, itemsPerPage]);

  return {
    data,
    currentPage: currentCursorIndex + 1,
    hasPrevious: currentCursorIndex > 0,
    hasNext: hasMore,
    isLoading,
    error,
    filters,
    mostRecentInference,
    goToNextPage,
    goToPreviousPage,
    refreshCurrentPage,
    resetPagination,
    updateFilters,
    clearFilters,
    itemsPerPage
  };
};

export default usePaginatedInferences;