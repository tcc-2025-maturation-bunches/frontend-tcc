import React from 'react';

const InferenceDetailsModal = ({ inference, onClose }) => {
  const [fullscreenImage, setFullscreenImage] = React.useState(null);

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
      case 'verde':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'quase_maduro':
        return 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200';
      case 'maduro':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'muito_maduro_ou_passado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category?.toLowerCase()) {
      case 'verde':
        return 'Verde';
      case 'quase_maduro':
        return 'Quase Maduro';
      case 'maduro':
        return 'Maduro';
      case 'muito_maduro_ou_passado':
        return 'Muito Maduro ou Passado';
      default:
        return category;
    }
  };

  const getMaturationCounts = () => {
    const maturationDist = inference.processing_metadata?.maturation_distribution;
    if (maturationDist) {
      return {
        verde: parseInt(maturationDist.verde || 0),
        quase_maduro: parseInt(maturationDist.quase_maduro || 0),
        maduro: parseInt(maturationDist.maduro || 0),
        muito_maduro_ou_passado: parseInt(maturationDist.muito_maduro_ou_passado || 0),
        nao_analisado: parseInt(maturationDist.nao_analisado || 0),
      };
    }
    
    const summaryCounts = inference.summary?.maturation_counts;
    if (summaryCounts) {
      return {
        verde: parseInt(summaryCounts.verde || 0),
        quase_maduro: parseInt(summaryCounts.quase_maduro || 0),
        maduro: parseInt(summaryCounts.maduro || 0),
        muito_maduro_ou_passado: parseInt(summaryCounts.muito_maduro_ou_passado || 0),
        nao_analisado: parseInt(summaryCounts.nao_analisado || 0),
      };
    }
    
    return {
      verde: 0,
      quase_maduro: 0,
      maduro: 0,
      muito_maduro_ou_passado: 0,
      nao_analisado: 0,
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalhes da Análise</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>ID: {inference.image_id}</span>
              {inference.request_id && <span>Request: {inference.request_id}</span>}
              {inference.device_id && <span>Device: {inference.device_id}</span>}
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Imagem Original</h4>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-w-16 aspect-h-12 relative group">
                {inference.image_url ? (
                  <>
                    <img
                      src={inference.image_url}
                      alt="Imagem original"
                      className="w-full h-full object-cover cursor-pointer"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=Imagem+Original';
                      }}
                      onClick={() => setFullscreenImage(inference.image_url)}
                    />
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center cursor-pointer"
                      onClick={() => setFullscreenImage(inference.image_url)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                    <p>Imagem original não disponível</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Resultado da Análise</h4>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-w-16 aspect-h-12 relative group">
                {inference.image_result_url ? (
                  <>
                    <img
                      src={inference.image_result_url}
                      alt="Resultado da análise"
                      className="w-full h-full object-cover cursor-pointer"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=Resultado+da+Análise';
                      }}
                      onClick={() => setFullscreenImage(inference.image_result_url)}
                    />
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center cursor-pointer"
                      onClick={() => setFullscreenImage(inference.image_result_url)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                    <p>Resultado não disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Resumo da Análise</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {(() => {
                    const counts = getMaturationCounts();
                    const total = counts.verde + counts.quase_maduro + counts.maduro + counts.muito_maduro_ou_passado + counts.nao_analisado;
                    
                    return (
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Verde</span>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {counts.verde}
                          </p>
                        </div>
                        <div>
                          <div className="w-4 h-4 bg-lime-500 rounded-full mx-auto mb-1"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Quase Mad.</span>
                          <p className="text-lg font-semibold text-lime-600 dark:text-lime-400">
                            {counts.quase_maduro}
                          </p>
                        </div>
                        <div>
                          <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Maduro</span>
                          <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                            {counts.maduro}
                          </p>
                        </div>
                        <div>
                          <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Muito Mad./Passado</span>
                          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                            {counts.muito_maduro_ou_passado}
                          </p>
                        </div>
                        {counts.nao_analisado > 0 && (
                          <div className="col-span-4 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto mb-1"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Não Analisado</span>
                            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                              {counts.nao_analisado}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total de Objetos:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {inference.detection_result?.summary?.total_objects || 
                       inference.summary?.total_objects || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Maturação Média:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatMaturationScore(
                        inference.detection_result?.summary?.average_maturation_score || 
                        inference.summary?.average_maturation_score
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Confiança Média:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatConfidence(
                        inference.detection_result?.results?.length > 0 
                          ? inference.detection_result.results.reduce((sum, r) => sum + parseFloat(r.confidence || 0), 0) / inference.detection_result.results.length
                          : inference.summary?.average_confidence
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tempo Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatProcessingTime(
                        inference.processing_time_ms || 
                        inference.summary?.total_processing_time_ms
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Informações Gerais</h3>
              <dl className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Data/Hora:</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {formatDate(inference.created_at || inference.processing_timestamp)}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Local:</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {inference.initial_metadata?.location || inference.location || 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Status:</dt>
                  <dd className="text-sm font-medium">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(inference.status)}`}>
                      {inference.status === 'completed' || inference.status === 'success' ? 'Concluído' : 
                       inference.status === 'processing' ? 'Processando' : 
                       inference.status === 'error' || inference.status === 'failed' ? 'Erro' : inference.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fonte:</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {inference.initial_metadata?.processing_type === 'combined' ? 'Processamento Combinado' :
                     inference.metadata?.source === 'webcam' ? 'Webcam' : 
                     inference.metadata?.source === 'monitoring' ? 'Monitoramento' : 
                     inference.device_id ? 'Dispositivo' : 'N/A'}
                  </dd>
                </div>
                {inference.device_id && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Dispositivo:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {inference.device_id}
                    </dd>
                  </div>
                )}
                {inference.processing_metadata?.image_dimensions && (
                  <div className="flex justify-between py-2">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Dimensões:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {inference.processing_metadata.image_dimensions.width} x {inference.processing_metadata.image_dimensions.height}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {(inference.detection_result?.results || inference.results) && 
           (inference.detection_result?.results?.length > 0 || inference.results?.length > 0) && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                Resultados Detalhados ({(inference.detection_result?.results || inference.results).length} itens)
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {(inference.detection_result?.results || inference.results).map((result, index) => (
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
                                style={{ width: `${(parseFloat(result.confidence) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">
                              {formatConfidence(parseFloat(result.confidence))}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${result.maturation_level?.score 
                                    ? (parseFloat(result.maturation_level.score) * 100) 
                                    : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">
                              {formatMaturationScore(parseFloat(result.maturation_level?.score))}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {result.maturation_level?.category ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(result.maturation_level.category)}`}>
                              {getCategoryLabel(result.maturation_level.category)}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
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

      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors z-10"
            aria-label="Fechar visualização em tela cheia"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={fullscreenImage}
            alt="Imagem em tela cheia"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default InferenceDetailsModal;