import { useState, useEffect, useCallback } from 'react';
import { getAllInferenceHistory } from '../api/inferenceApi';

const usePaginatedInferences = (userId, itemsPerPage = 50) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const loadPage = useCallback(async (page, forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getAllInferenceHistory(page, itemsPerPage);

      setData(response.items || []);
      setCurrentPage(response.current_page || page);
      setTotalPages(response.total_pages || 1);
      setTotalItems(response.total_count || 0);
      setHasMore(response.has_next || false);

    } catch (err) {
      console.error('Error loading page:', err);
      setError(err.message || 'Erro ao carregar dados');
      setData([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, userId]);

  const goToPage = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadPage(page);
  }, [loadPage, totalPages]);

  const refreshCurrentPage = useCallback(() => {
    loadPage(currentPage, true);
  }, [currentPage, loadPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setData([]);
    setTotalItems(0);
    setTotalPages(1);
    setHasMore(false);
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    if (userId) {
      loadPage(1);
    } else {
        setData([]);
        setTotalItems(0);
        setTotalPages(1);
        setCurrentPage(1);
        setIsLoading(false);
    }
  }, [userId, itemsPerPage, loadPage]);

  return {
    data,
    currentPage,
    totalPages,
    isLoading,
    error,
    hasMore,
    totalItems,
    goToPage,
    refreshCurrentPage,
    resetPagination,
    itemsPerPage
  };
};

export default usePaginatedInferences;