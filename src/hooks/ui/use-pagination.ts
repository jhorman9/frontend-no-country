import { useState, useCallback } from "react";

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  setTotalPages: (total: number) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  resetPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Hook para manejar paginación
 */
export const usePagination = (initialPage = 0): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const canGoNext = currentPage < totalPages - 1;
  const canGoPrevious = currentPage > 0;

  return {
    currentPage,
    totalPages,
    setTotalPages,
    goToPage,
    nextPage,
    previousPage,
    resetPage,
    canGoNext,
    canGoPrevious,
  };
};
