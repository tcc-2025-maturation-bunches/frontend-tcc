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

  const getMaturationColor = (category) => {
    if (!category) return 'gray';
    
    const categoryMap = {
      'green': 'green-500',
      'ripe': 'yellow-500',
      'overripe': 'red-500'
    };
    
    return categoryMap[category.toLowerCase()] || 'gray-500';
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

  return (
    <Card
      title="Análise Mais Recente"
      className="h-full"
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader text="Carregando análise recente..." />
        </div>
      ) : !inference ? (
        <div className="flex flex-col justify-center items-center h-64 text-gray-500 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-center">Nenhuma análise encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Imagem */}
            <div className="w-full md:w-1/2">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {inference.image_result_url ? (
                  <img
                    src={inference.image_result_url}
                    alt="Resultado da análise"
                    className="w-full h-auto object-cover"
                  />
                ) : inference.detection?.image_result_url ? (
                  <img
                    src={inference.detection.image_result_url}
                    alt="Resultado da detecção"
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="flex justify-center items-center h-48 text-gray-500 dark:text-gray-400">
                    <p>Imagem não disponível</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detalhes */}
            <div className="w-full md:w-1/2 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Informações Gerais
                </h3>
                <dl className="mt-2 text-sm">
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500 dark:text-gray-400">Data/Hora:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">{formatDate(inference.processing_timestamp)}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500 dark:text-gray-400">Local:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">{inference.location || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500 dark:text-gray-400">Total de Cachos:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">{inference.summary?.total_objects || 0}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500 dark:text-gray-400">Maturação Média:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">
                      {formatMaturationScore(inference.summary?.average_maturation_score)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500 dark:text-gray-400">Tempo de Processamento:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">
                      {inference.summary?.total_processing_time_ms
                        ? `${(inference.summary.total_processing_time_ms / 1000).toFixed(2)}s`
                        : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Estatísticas de maturação */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Distribuição de Maturação
                </h3>
                <div className="mt-2">
                  {inference.results && inference.results.length > 0 ? (
                    <div className="space-y-2">
                      {(() => {
                        const counts = getMaturationCounts(inference.results);
                        return (
                          <>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Verdes:</span>
                              <span className="text-sm text-gray-900 dark:text-gray-200">
                                {counts.green} ({counts.total ? ((counts.green / counts.total) * 100).toFixed(1) : 0}%)
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Maduras:</span>
                              <span className="text-sm text-gray-900 dark:text-gray-200">
                                {counts.ripe} ({counts.total ? ((counts.ripe / counts.total) * 100).toFixed(1) : 0}%)
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Passadas:</span>
                              <span className="text-sm text-gray-900 dark:text-gray-200">
                                {counts.overripe} ({counts.total ? ((counts.overripe / counts.total) * 100).toFixed(1) : 0}%)
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Dados de maturação não disponíveis
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botão de detalhes */}
          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              onClick={() => onViewDetails(inference)}
            >
              Ver Detalhes Completos
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecentInference;
