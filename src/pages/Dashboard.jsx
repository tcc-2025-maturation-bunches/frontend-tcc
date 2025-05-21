import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import RecentInference from '../components/Dashboard/RecentInference';
import InferenceHistoryTable from '../components/Dashboard/InferenceHistoryTable';
import InferenceStats from '../components/Dashboard/InferenceStats';
import Loader from '../components/common/Loader';
import WebcamCaptureModal from '../components/Dashboard/WebcamCaptureModal';
import WebSocketConfigModal from '../components/Dashboard/WebSocketConfigModal';
import { getInferenceHistory } from '../api/inferenceApi';
import { useWebsocket } from '../contexts/WebsocketContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected, connect } = useWebsocket();
  const [inference, setInference] = useState(null);
  const [inferenceHistory, setInferenceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [showWebSocketModal, setShowWebSocketModal] = useState(false);
  const [selectedInference, setSelectedInference] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadInferenceHistory();
  }, []);

  const loadInferenceHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getInferenceHistory(user.id);
      setInferenceHistory(history);
      
      if (history && history.length > 0) {
        const sorted = [...history].sort((a, b) => 
          new Date(b.processing_timestamp) - new Date(a.processing_timestamp)
        );
        setInference(sorted[0]);
      }
    } catch (error) {
      console.error('Error loading inference history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (inference) => {
    setSelectedInference(inference);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedInference(null);
  };

  const handleInferenceCreated = (newInference) => {
    setInference(newInference);
    setInferenceHistory(prev => [newInference, ...prev]);
  };

  const handleWebSocketConnect = async (url) => {
    try {
      await connect(url);
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-150">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">Sistema de Análise de Frutas</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative">
              <span className="text-gray-600 dark:text-gray-300">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowWebcamModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Realizar Análise
          </button>
          
          <button
            onClick={() => setShowWebSocketModal(true)}
            className={`px-4 py-2 ${isConnected ? 'bg-blue-600' : 'bg-gray-600'} text-white rounded-md hover:bg-opacity-90 transition-colors duration-150 flex items-center`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.414 1.414 5 5 0 010-7.07 1 1 0 011.414 0zm4.242 0a1 1 0 011.414 0 5 5 0 010 7.072 1 1 0 01-1.414-1.414 3 3 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {isConnected ? 'WebSocket Conectado' : 'Configurar WebSocket'}
          </button>
          
          <button
            onClick={loadInferenceHistory}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-150 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Atualizar Dados
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RecentInference 
            inference={inference} 
            isLoading={isLoading} 
            onViewDetails={handleViewDetails} 
          />
          
          <InferenceStats 
            data={inferenceHistory} 
            isLoading={isLoading} 
          />
        </div>

        <div className="mt-6">
          <InferenceHistoryTable 
            data={inferenceHistory} 
            isLoading={isLoading} 
            onViewDetails={handleViewDetails} 
          />
        </div>
      </main>

      {showWebcamModal && (
        <WebcamCaptureModal 
          onClose={() => setShowWebcamModal(false)} 
          onInferenceCreated={handleInferenceCreated}
          userId={user.id}
        />
      )}

      {showWebSocketModal && (
        <WebSocketConfigModal 
          onClose={() => setShowWebSocketModal(false)} 
          onConnect={handleWebSocketConnect}
          isConnected={isConnected}
          userId={user.id}
        />
      )}

      {showDetailsModal && selectedInference && (
        <InferenceDetailsModal 
          inference={selectedInference} 
          onClose={handleCloseDetailsModal} 
        />
      )}
    </div>
  );
};

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
    }).format(date);
  };

  const formatMaturationScore = (score) => {
    if (score === undefined || score === null) return 'N/A';
    return `${(score * 100).toFixed(1)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes da Análise</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Imagem Processada</h3>
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
                  <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                    <p>Imagem não disponível</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informações Gerais</h3>
                <dl className="mt-2 text-sm divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="flex justify-between py-2">
                    <dt className="text-gray-500 dark:text-gray-400">ID da Imagem:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">{inference.image_id}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-gray-500 dark:text-gray-400">Data/Hora:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">{formatDate(inference.processing_timestamp)}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-gray-500 dark:text-gray-400">Local:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">{inference.location || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-gray-500 dark:text-gray-400">Total de Cachos:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">{inference.summary?.total_objects || 0}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-gray-500 dark:text-gray-400">Maturação Média:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">
                      {formatMaturationScore(inference.summary?.average_maturation_score)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-gray-500 dark:text-gray-400">Tempo de Processamento:</dt>
                    <dd className="text-gray-900 dark:text-gray-200">
                      {inference.summary?.total_processing_time_ms
                        ? `${(inference.summary.total_processing_time_ms / 1000).toFixed(2)}s`
                        : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Distribuição de Maturação</h3>
                <div className="mt-2 space-y-2">
                  {inference.results && inference.results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Verdes</span>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {inference.results.filter(r => r.maturation_level?.category?.toLowerCase() === 'green').length}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Maduras</span>
                        <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                          {inference.results.filter(r => r.maturation_level?.category?.toLowerCase() === 'ripe').length}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Passadas</span>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {inference.results.filter(r => r.maturation_level?.category?.toLowerCase() === 'overripe').length}
                        </p>
                      </div>
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

          {inference.results && inference.results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Resultados Detalhados</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confiança</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Maturação</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {inference.results.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{result.class_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(result.confidence * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {result.maturation_level ? `${(result.maturation_level.score * 100).toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {result.maturation_level ? (
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result.maturation_level.category.toLowerCase() === 'green' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : result.maturation_level.category.toLowerCase() === 'ripe'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {result.maturation_level.category}
                            </span>
                          ) : (
                            'N/A'
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
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-150"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;