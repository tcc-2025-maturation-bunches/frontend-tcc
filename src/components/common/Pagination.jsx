import { useMemo } from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  hasMore,
  itemsPerPage,
  totalItems
}) => {
  const renderPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages && totalPages >= maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
     if (currentPage + Math.floor(maxVisiblePages / 2) >= totalPages) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
        endPage = totalPages;
    }


    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          disabled={isLoading}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          1
        </button>
      );

      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-gray-500 dark:text-gray-400 text-sm">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          disabled={isLoading || i === currentPage}
          className={`px-3 py-1 rounded-md border text-sm ${
            i === currentPage
              ? 'bg-green-600 text-white border-green-600 font-semibold'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-gray-500 dark:text-gray-400 text-sm">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          disabled={isLoading}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  }, [currentPage, totalPages, isLoading, onPageChange]);

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 sm:px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm">
      <div className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {totalItems > 0 ? (
          <>
            Mostrando {startItem} - {endItem} de {totalItems} inspeções
          </>
        ) : (
          'Nenhuma inspeção encontrada'
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Anterior
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {renderPageNumbers}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
        >
          Próximo
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:block">
         Página {currentPage} de {totalPages}
      </div>
       <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap sm:hidden">
         {currentPage}/{totalPages}
      </div>
    </div>
  );
};

export default Pagination;