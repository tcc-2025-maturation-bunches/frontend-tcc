import { useState } from 'react';
import Card from '../common/Card';
import Loader from '../common/Loader';

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

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <span className="ml-1">▲</span>
    ) : (
      <span className="ml-1">▼</span>
    );
  };

  return (
    <Card
      title="Histórico de Análises"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('processing_timestamp')}
                >
                  <div className="flex items-center">
                    Data/Hora
                    {renderSortIndicator('processing_timestamp')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('summary.total_objects')}
                >
                  <div className="flex items-center">
                    Cachos Detectados
                    {renderSortIndicator('summary.total_objects')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('summary.average_maturation_score')}
                >
                  <div className="flex items-center">
                    Média de Maturação
                    {renderSortIndicator('summary.average_maturation_score')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center">
                    Local
                    {renderSortIndicator('location')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma análise encontrada
                  </td>
                </tr>
              ) : (
                sortedData.map((inference) => (
                  <tr key={inference.image_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {formatDate(inference.processing_timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {inference.summary?.total_objects || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {inference.summary?.average_maturation_score
                        ? `${(inference.summary.average_maturation_score * 100).toFixed(1)}%`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {inference.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(inference)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default InferenceHistoryTable;
