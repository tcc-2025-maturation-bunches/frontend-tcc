import { useState, useMemo } from 'react';
import Pagination from '../common/Pagination';
import usePaginatedInferences from '../../hooks/usePaginatedInferences';
import { getInferenceDetails } from '../../api/inferenceApi';
import Loader from '../common/Loader';

const InferenceHistoryTablePaginated = ({ userId, onViewDetails }) => {
  const ITEMS_PER_PAGE = 25;

  const {
    data,
    currentPage,
    totalPages,
    isLoading,
    error,
    hasMore,
    totalItems,
    goToPage,
    refreshCurrentPage,
    itemsPerPage
  } = usePaginatedInferences(userId, ITEMS_PER_PAGE);

  const [sortField, setSortField] = useState('processing_timestamp');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    return [...(data || [])].sort((a, b) => {
        let aValue = a;
        let bValue = b;

        if (sortField.includes('.')) {
          const fields = sortField.split('.');
          aValue = fields.reduce((obj, field) => obj && obj[field], a);
          bValue = fields.reduce((obj, field) => obj && obj[field], b);
        } else {
          aValue = a[sortField];
          bValue = b[sortField];
        }

        if (typeof aValue === 'string' && aValue.includes('T') && aValue.includes('Z')) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
        if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, sortField, sortDirection]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Data Inválida';
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
     try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
    } catch (e) {
        console.error("Error formatting short date:", dateString, e);
        return 'Inválido';
    }
  };


  const handleRowClick = async (inference) => {
     if (!inference?.request_id && !inference?.image_id) {
       console.error('Inference has no usable ID', inference);
       return;
     }
    try {
      const idToFetch = inference.request_id || inference.image_id;
      const detailedInference = await getInferenceDetails(idToFetch);
      onViewDetails(detailedInference);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      onViewDetails(inference);
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return (
        <svg className="ml-1 w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
           <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="ml-1 w-3 h-3 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="ml-1 w-3 h-3 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
           <button onClick={refreshCurrentPage} className="ml-2 px-2 py-1 text-sm bg-blue-500 text-white rounded">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Histórico de Análises
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {totalItems} inspeções encontradas
            </p>
          </div>
          <button
            onClick={refreshCurrentPage}
            disabled={isLoading}
            className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {isLoading && data.length === 0 ? (
        <div className="flex justify-center items-center h-64">
           <Loader text="Carregando histórico..." />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto relative">
             {isLoading && data.length > 0 && (
                <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-10">
                   <Loader text="Carregando página..." />
                </div>
              )}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Imagem
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('processing_timestamp')}
                  >
                    <div className="flex items-center">
                      Data/Hora
                      {renderSortIndicator('processing_timestamp')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('summary.total_objects')}
                  >
                    <div className="flex items-center">
                      Objetos
                      {renderSortIndicator('summary.total_objects')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('summary.average_maturation_score')}
                  >
                    <div className="flex items-center">
                      Maturação Média
                      {renderSortIndicator('summary.average_maturation_score')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('summary.average_confidence')}
                  >
                    <div className="flex items-center">
                      Confiança Média
                      {renderSortIndicator('summary.average_confidence')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center">
                      Local
                      {renderSortIndicator('location')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {renderSortIndicator('status')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {sortedData.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>Nenhuma análise encontrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedData.map((inference, index) => (
                    <tr
                      key={inference.image_id || `inference-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                      onClick={() => handleRowClick(inference)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleRowClick(inference);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            <img
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                              src={inference.thumbnail_url || inference.image_url}
                              alt={`Análise ${inference.image_id}`}
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/48/E5E7EB/9CA3AF?text=IMG';
                              }}
                            />
                          </div>
                          <div className="ml-4 hidden sm:block">
                            <div className="text-xs text-gray-900 dark:text-gray-200 font-medium truncate max-w-32" title={inference.image_id}>
                              {inference.image_id}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {inference.metadata?.source || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-200">
                          <div className="hidden sm:block">
                            {formatDate(inference.processing_timestamp)}
                          </div>
                          <div className="sm:hidden">
                            {formatDateShort(inference.processing_timestamp)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 dark:text-gray-200">
                            {inference.summary?.total_objects ?? 0}
                          </span>
                           <div className="ml-2 flex space-x-1" title="Categorias: Verde, Quase Maduro, Maduro, Muito Maduro ou Passado">
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                            <div
                              className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full"
                              style={{
                                width: `${inference.summary?.average_maturation_score
                                  ? (inference.summary.average_maturation_score * 100)
                                  : 0}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {inference.summary?.average_maturation_score
                              ? `${(inference.summary.average_maturation_score * 100).toFixed(1)}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${inference.summary?.average_confidence
                                  ? (inference.summary.average_confidence * 100)
                                  : 0}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {inference.summary?.average_confidence
                              ? `${(inference.summary.average_confidence * 100).toFixed(1)}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="max-w-32 truncate" title={inference.location}>
                          {inference.location || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inference.status)}`}>
                          {inference.status === 'completed' ? 'Concluído' :
                           inference.status === 'processing' ? 'Processando' :
                           inference.status === 'error' ? 'Erro' : inference.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            isLoading={isLoading}
            hasMore={hasMore}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </>
      )}
    </div>
  );
};

export default InferenceHistoryTablePaginated;