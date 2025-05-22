import Card from '../common/Card';
import Loader from '../common/Loader';
import Button from '../common/Button';

const RecentInference = ({ inference, isLoading, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatMaturationScore = (score) => {
    if (score === undefined || score === null) return 'N/A';
    return `${(score * 100).toFixed(1)}%`;
  };

  const formatConfidence = (confidence) => {
    if (confidence === undefined || confidence === null) return 'N/A';
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const formatProcessingTime = (timeMs) => {
    if (!timeMs) return 'N/A';
    return timeMs >= 1000 ? `${(timeMs / 1000).toFixed(2)}s` : `${timeMs}ms`;
  };

  const getMaturationCounts = (results) => {
    if (!results || !Array.isArray(results)) return { green: 0, ripe: 0, overripe: 0, total: 0 };
    
    const counts = {
      green: 0,
      ripe: 0,
      overripe: 0,
      total: results.length
    };
    
    results.forEach(result => {
      if (result.maturation_level && result.maturation_level.category) {
        const category = result.maturation_level.category.toLowerCase();
        if (counts[category] !== undefined) {
          counts[category]++;
        }
      }
    });
    
    return counts;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'processing':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card
      title="Análise Mais Recente"
      className="h-full shadow-soft"
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader text="Carregando análise recente..." />
        </div>
      ) : !inference ? (
        <div className="flex flex-col justify-center items-center h-64 text-gray-500 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-center text-lg font-medium">Nenhuma análise encontrada</p>
          <p className="text-center text-sm mt-1">Realize uma captura para ver os resultados aqui</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/2">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Resultado da Análise
              </h4>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-w-16 aspect-h-12 shadow-inner">
                {inference.image_result_url ? (
                  <img
                    src={inference.image_result_url}
                    alt="Resultado da análise"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=Resultado+da+Análise';
                    }}
                  />
                ) : inference.detection?.image_result_url ? (
                  <img
                    src={inference.detection.image_result_url}
                    alt="Resultado da detecção"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=Resultado+da+Detecção';
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Imagem não disponível</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Informações Gerais
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-2">
                  <dl className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500 dark:text-gray-400 font-medium">Data/Hora:</dt>
                      <dd className="text-gray-900 dark:text-gray-200">{formatDate(inference.processing_timestamp)}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500 dark:text-gray-400 font-medium">Local:</dt>
                      <dd className="text-gray-900 dark:text-gray-200">{inference.location || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500 dark:text-gray-400 font-medium">Status:</dt>
                      <dd className={`font-semibold ${getStatusColor(inference.status)}`}>
                        {inference.status === 'completed' ? 'Concluído' : 
                         inference.status === 'processing' ? 'Processando' : 
                         inference.status === 'error' ? 'Erro' : inference.status}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500 dark:text-gray-400 font-medium">Total de Objetos:</dt>
                      <dd className="text-gray-900 dark:text-gray-200 font-semibold">{inference.summary?.total_objects || 0}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500 dark:text-gray-400 font-medium">Maturação Média:</dt>
                      <dd className="text-gray-900 dark:text-gray-200 font-semibold">
                        {formatMaturationScore(inference.summary?.average_maturation_score)}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500 dark:text-gray-400 font-medium">Confiança Média:</dt>
                      <dd className="text-gray-900 dark:text-gray-200 font-semibold">
                        {formatConfidence(inference.summary?.average_confidence)}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-500 dark:text-gray-400 font-medium">Tempo de Processamento:</dt>
                      <dd className="text-gray-900 dark:text-gray-200 font-semibold">
                        {formatProcessingTime(inference.summary?.total_processing_time_ms)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                  Distribuição de Maturação
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-2">
                  {inference.results && inference.results.length > 0 ? (
                    <div className="space-y-3">
                      {(() => {
                        const counts = getMaturationCounts(inference.results);
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Verdes</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                  {counts.green}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({counts.total ? ((counts.green / counts.total) * 100).toFixed(1) : 0}%)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Maduras</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                  {counts.ripe}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({counts.total ? ((counts.ripe / counts.total) * 100).toFixed(1) : 0}%)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Passadas</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                  {counts.overripe}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({counts.total ? ((counts.overripe / counts.total) * 100).toFixed(1) : 0}%)
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Total de Objetos:</span>
                                <span className="font-bold text-gray-900 dark:text-gray-100">{counts.total}</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dados de maturação não disponíveis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              onClick={() => onViewDetails(inference)}
              className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Ver Detalhes Completos
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecentInference;