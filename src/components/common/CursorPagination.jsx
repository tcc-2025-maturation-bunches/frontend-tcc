import React from 'react';
import PropTypes from 'prop-types';

const CursorPagination = ({
  currentPage,
  hasPrevious,
  hasNext,
  onPreviousPage,
  onNextPage,
  isLoading,
  itemsPerPage
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 sm:px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm">
      <div className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Mostrando {itemsPerPage} inspeções por página
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousPage}
          disabled={!hasPrevious || isLoading}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Anterior
        </button>

        <div className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium">
          Página {currentPage}
        </div>

        <button
          onClick={onNextPage}
          disabled={!hasNext || isLoading}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium transition-colors"
        >
          Próximo
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {hasNext ? 'Mais registros disponíveis' : 'Última página'}
      </div>
    </div>
  );
};

CursorPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  hasPrevious: PropTypes.bool.isRequired,
  hasNext: PropTypes.bool.isRequired,
  onPreviousPage: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  itemsPerPage: PropTypes.number.isRequired,
};

CursorPagination.defaultProps = {
  isLoading: false,
};

export default CursorPagination;
