const InferenceDetailsModal = ({ inference, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ripe':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overripe':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalhes da Análise</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {inference.image_id}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fechar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Imagens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Imagem Original</h4>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-w-16 aspect-h-12">
                    <img
                      src={inference.image_url}
                      alt="Imagem original"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=Imagem+Original';
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Resultado da Análise</h4>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-w-16 aspect-h-12">
                    {inference.image_result_url ? (
                      <img
                        src={inference.image_result_url}
                        alt="Resultado da análise"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=Resultado+da+Análise';
                        }}
                      />
                    ) : (
                      <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                        <p>Resultado não disponível</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Resumo da Análise</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Verdes</span>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {inference.summary?.maturation_counts?.green || 0}
                      </p>
                    </div>
                    <div>
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Maduras</span>
                      <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {inference.summary?.maturation_counts?.ripe || 0}
                      </p>
                    </div>
                    <div>
                      <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Passadas</span>
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {inference.summary?.maturation_counts?.overripe || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total de Objetos:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {inference.summary?.total_objects || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Maturação Média:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatMaturationScore(inference.summary?.average_maturation_score)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Confiança Média:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatConfidence(inference.summary?.average_confidence)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tempo Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatProcessingTime(inference.summary?.total_processing_time_ms)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Informações Gerais</h3>
              <dl className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Data/Hora:</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {formatDate(inference.processing_timestamp)}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Local:</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {inference.location || 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Status:</dt>
                  <dd className="text-sm font-medium">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(inference.status)}`}>
                      {inference.status === 'completed' ? 'Concluído' : 
                       inference.status === 'processing' ? 'Processando' : 
                       inference.status === 'error' ? 'Erro' : inference.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fonte:</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {inference.metadata?.source === 'webcam' ? 'Webcam' : 
                     inference.metadata?.source === 'monitoring' ? 'Monitoramento' : 'N/A'}
                  </dd>
                </div>
                {inference.metadata?.environmental && (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Iluminação:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200 capitalize">
                        {inference.metadata.environmental.lighting_conditions || 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Temperatura Est.:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {inference.metadata.environmental.estimated_temperature 
                          ? `${inference.metadata.environmental.estimated_temperature}°C` 
                          : 'N/A'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Tempos de Processamento</h3>
              <dl className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Detecção:</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {formatProcessingTime(inference.summary?.detection_time_ms)}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Análise de Maturação:</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {formatProcessingTime(inference.summary?.maturation_analysis_time_ms)}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Tempo Total:</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {formatProcessingTime(inference.summary?.total_processing_time_ms)}
                  </dd>
                </div>
                {inference.metadata?.camera_settings && (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Resolução:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {inference.metadata.camera_settings.resolution || 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Qualidade:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {inference.metadata.camera_settings.quality 
                          ? `${inference.metadata.camera_settings.quality}%` 
                          : 'N/A'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>

          {inference.results && inference.results.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                Resultados Detalhados ({inference.results.length} itens)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        #
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Confiança
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Maturação
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Dias até Estragar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {inference.results.map((result, index) => (
                      <tr key={`result-${inference.image_id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <span className="truncate max-w-20">{result.class_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(result.confidence * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">
                              {formatConfidence(result.confidence)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${result.maturation_level?.score 
                                    ? (result.maturation_level.score * 100) 
                                    : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">
                              {formatMaturationScore(result.maturation_level?.score)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {result.maturation_level?.category ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(result.maturation_level.category)}`}>
                              {result.maturation_level.category === 'green' ? 'Verde' :
                               result.maturation_level.category === 'ripe' ? 'Maduro' :
                               result.maturation_level.category === 'overripe' ? 'Passado' :
                               result.maturation_level.category}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            {result.maturation_level?.estimated_days_until_spoilage !== undefined ? (
                              <>
                                <span className={`font-medium ${
                                  result.maturation_level.estimated_days_until_spoilage <= 1 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : result.maturation_level.estimated_days_until_spoilage <= 3 
                                      ? 'text-yellow-600 dark:text-yellow-400' 
                                      : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {result.maturation_level.estimated_days_until_spoilage}
                                </span>
                                <span className="ml-1 text-xs">
                                  {result.maturation_level.estimated_days_until_spoilage === 1 ? 'dia' : 'dias'}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-150 font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InferenceDetailsModal;