import { useState, useEffect, useCallback } from 'react';
import { getAllInferenceHistory } from '../api/inferenceApi';

const usePaginatedInferences = (userId, itemsPerPage = 50, initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [mostRecentInference, setMostRecentInference] = useState(null);

  const loadPage = useCallback(async (page, currentFilters = filters, forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getAllInferenceHistory(page, itemsPerPage, currentFilters);

      setData(response.items || []);
      setCurrentPage(response.current_page || page);
      setTotalPages(response.total_pages || 1);
      setTotalItems(response.total_count || 0);
      setHasMore(response.has_next || false);
      
      if (page === 1 && Object.keys(currentFilters).every(key => !currentFilters[key])) {
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
      setTotalPages(1);
      setTotalItems(0);
      setMostRecentInference(null);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  const goToPage = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadPage(page, filters);
  }, [loadPage, totalPages, filters]);

  const refreshCurrentPage = useCallback(() => {
    loadPage(currentPage, filters, true);
  }, [currentPage, filters, loadPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setData([]);
    setTotalItems(0);
    setTotalPages(1);
    setHasMore(false);
    loadPage(1, filters);
  }, [loadPage, filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    loadPage(1, newFilters);
  }, [loadPage]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
    loadPage(1, {});
  }, [loadPage]);

  useEffect(() => {
    if (userId) {
      loadPage(1, filters);
    } else {
      setData([]);
      setTotalItems(0);
      setTotalPages(1);
      setCurrentPage(1);
      setIsLoading(false);
    }
  }, [userId, itemsPerPage]);

  return {
    data,
    currentPage,
    totalPages,
    isLoading,
    error,
    hasMore,
    totalItems,
    filters,
    mostRecentInference,
    goToPage,
    refreshCurrentPage,
    resetPagination,
    updateFilters,
    clearFilters,
    itemsPerPage
  };
};

export default usePaginatedInferences;