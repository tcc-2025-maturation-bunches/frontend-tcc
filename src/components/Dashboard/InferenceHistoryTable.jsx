import { useState } from 'react';
import Card from '../common/Card';
import Loader from '../common/Loader';
import { getInferenceDetails } from '../../api/inferenceApi';

const InferenceHistoryTable = ({ data, isLoading, onViewDetails }) => {
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

  const sortedData = [...(data || [])].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField.includes('.')) {
      const fields = sortField.split('.');
      aValue = fields.reduce((obj, field) => obj && obj[field], a);
      bValue = fields.reduce((obj, field) => obj && obj[field], b);
    }
    
    if (typeof aValue === 'string' && aValue.includes('T') && aValue.includes('Z')) {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleRowClick = async (inference) => {
    try {
      if (inference.request_id) {
        const detailedInference = await getInferenceDetails(inference.request_id);
        onViewDetails(detailedInference);
      } else {
        onViewDetails(inference);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      onViewDetails(inference);
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return (
        <svg className="ml-1 w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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

  return (
    <>
      <Card
        title="Histórico de Análises"
        subtitle={`Veja as últimas análises realizadas (${data ? data.length : 0} registros)`}
        className="h-full"
        bodyClassName="p-0"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader text="Carregando histórico..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
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
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>Nenhuma análise encontrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedData.map((inference, index) => (
                    <tr 
                      key={`${inference.image_id}-${index}`}
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
                            <div className="text-xs text-gray-900 dark:text-gray-200 font-medium truncate max-w-32">
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
                            {inference.summary?.total_objects || 0}
                          </span>
                          <div className="ml-2 flex space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Verdes"></div>
                            <div className="w-2 h-2 bg-lime-500 rounded-full" title="Quase Maduros"></div>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Maduros"></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full" title="Muito Maduros/Passados"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full" 
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
        )}
      </Card>
    </>
  );
};

export default InferenceHistoryTable;
