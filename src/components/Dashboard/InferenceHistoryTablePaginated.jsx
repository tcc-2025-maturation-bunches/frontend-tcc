import { useState, useMemo, useEffect } from 'react';
import Pagination from '../common/Pagination';
import usePaginatedInferences from '../../hooks/usePaginatedInferences';
import { getInferenceDetails } from '../../api/inferenceApi';
import Loader from '../common/Loader';

const InferenceHistoryTablePaginated = ({ userId, onViewDetails, onRefReady, onMostRecentChange, onLoadingChange }) => {
  const ITEMS_PER_PAGE = 25;

  const {
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
    updateFilters,
    clearFilters,
    itemsPerPage
  } = usePaginatedInferences(userId, ITEMS_PER_PAGE);

  useEffect(() => {
    if (onRefReady && typeof onRefReady === 'function') {
      onRefReady({ refreshCurrentPage });
    }
  }, [onRefReady, refreshCurrentPage]);
  
  useEffect(() => {
    if (onMostRecentChange && typeof onMostRecentChange === 'function') {
      onMostRecentChange(mostRecentInference);
    }
  }, [mostRecentInference, onMostRecentChange]);
  
  useEffect(() => {
    if (onLoadingChange && typeof onLoadingChange === 'function' && currentPage === 1) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange, currentPage]);

  const [sortField, setSortField] = useState('processing_timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [localFilters, setLocalFilters] = useState({
    statusFilter: '',
    deviceId: '',
    startDate: '',
    endDate: ''
  });

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

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      if (/^\d{4}-\d{2}-\d{2}T/.test(dateString)) {
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
      }
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch (e) {
      return dateString;
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

  const handleApplyFilters = () => {
    const newFilters = {};
    
    if (localFilters.statusFilter) {
      newFilters.statusFilter = localFilters.statusFilter;
    }
    
    if (localFilters.deviceId && localFilters.deviceId.trim()) {
      newFilters.deviceId = localFilters.deviceId.trim();
    }
    
    if (localFilters.startDate) {
      newFilters.startDate = `${localFilters.startDate}T00:00:00`;
    }
    
    if (localFilters.endDate) {
      newFilters.endDate = `${localFilters.endDate}T23:59:59`;
    }
    
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      statusFilter: '',
      deviceId: '',
      startDate: '',
      endDate: ''
    });
    clearFilters();
  };

  const hasActiveFilters = () => {
    return filters.statusFilter || filters.deviceId || filters.startDate || filters.endDate;
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
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'partial_error':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'Sucesso';
      case 'processing':
        return 'Processando';
      case 'error':
        return 'Erro';
      case 'partial_error':
        return 'Erro Parcial';
      default:
        return status;
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
        <div className="mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Histórico de Análises
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {totalItems} inspeções encontradas
            {hasActiveFilters() && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                Filtros ativos
              </span>
            )}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={localFilters.statusFilter}
                onChange={(e) => setLocalFilters({ ...localFilters, statusFilter: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todos</option>
                <option value="success">Sucesso</option>
                <option value="error">Erro</option>
                <option value="partial_error">Erro Parcial</option>
                <option value="unknown">Desconhecido</option>
              </select>
            </div>

            <div>
              <label htmlFor="device-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID do Dispositivo
              </label>
              <input
                id="device-filter"
                type="text"
                value={localFilters.deviceId}
                onChange={(e) => setLocalFilters({ ...localFilters, deviceId: e.target.value })}
                placeholder="Ex: dev-001"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="start-date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Inicial
              </label>
              <input
                id="start-date-filter"
                type="date"
                value={localFilters.startDate}
                onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                max={localFilters.endDate || undefined}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="end-date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Final
              </label>
              <input
                id="end-date-filter"
                type="date"
                value={localFilters.endDate}
                onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                min={localFilters.startDate || undefined}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Aplicar
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
              >
                Limpar
              </button>
            </div>
          </div>
          
          {hasActiveFilters() && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Filtros ativos:</span>
              {filters.statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Status: {getStatusLabel(filters.statusFilter)}
                  <button
                    onClick={() => {
                      setLocalFilters({ ...localFilters, statusFilter: '' });
                      updateFilters({ ...filters, statusFilter: null });
                    }}
                    className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.deviceId && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Dispositivo: {filters.deviceId}
                  <button
                    onClick={() => {
                      setLocalFilters({ ...localFilters, deviceId: '' });
                      updateFilters({ ...filters, deviceId: null });
                    }}
                    className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.startDate && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  De: {formatDateForDisplay(filters.startDate)}
                  <button
                    onClick={() => {
                      setLocalFilters({ ...localFilters, startDate: '' });
                      updateFilters({ ...filters, startDate: null });
                    }}
                    className="ml-1 hover:text-teal-900 dark:hover:text-teal-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                  Até: {formatDateForDisplay(filters.endDate)}
                  <button
                    onClick={() => {
                      setLocalFilters({ ...localFilters, endDate: '' });
                      updateFilters({ ...filters, endDate: null });
                    }}
                    className="ml-1 hover:text-cyan-900 dark:hover:text-cyan-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
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
                      Confiança média de maturação
                      {renderSortIndicator('summary.average_maturation_score')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('summary.average_detection_confidence')}
                  >
                    <div className="flex items-center">
                      Confiança média de detecção
                      {renderSortIndicator('summary.average_detection_confidence')}
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
                        {hasActiveFilters() && (
                          <button
                            onClick={handleClearFilters}
                            className="mt-2 text-sm text-green-600 dark:text-green-400 hover:underline"
                          >
                            Limpar filtros
                          </button>
                        )}
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
                                width: `${inference.summary?.average_detection_confidence
                                  ? (inference.summary.average_detection_confidence * 100)
                                  : 0}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {inference.summary?.average_detection_confidence
                              ? `${(inference.summary.average_detection_confidence * 100).toFixed(1)}%`
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
                          {getStatusLabel(inference.status)}
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