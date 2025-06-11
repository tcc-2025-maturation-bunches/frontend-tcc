import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import RecentInference from '../components/Dashboard/RecentInference';
import InferenceHistoryTable from '../components/Dashboard/InferenceHistoryTable';
import InferenceStats from '../components/Dashboard/InferenceStats';
import DeviceMonitoringDashboard from '../components/DeviceMonitoring/DeviceMonitoringDashboard';
import Loader from '../components/common/Loader';
import WebcamCaptureModal from '../components/Dashboard/WebcamCaptureModal';
import InferenceDetailsModal from '../components/Dashboard/InferenceDetailsModal';
import { getAllInferenceHistory, startHistoryPolling } from '../api/inferenceApi';
import useAppConfig from '../hooks/useAppConfig';

const Dashboard = () => {
  const { user } = useAuth();
  const { config: appConfig, isLoading: isConfigLoading } = useAppConfig();
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis', 'statistics' ou 'devices'
  const [inference, setInference] = useState(null);
  const [inferenceHistory, setInferenceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [selectedInference, setSelectedInference] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [pollingEnabled, setPollingEnabled] = useState(false);

  useEffect(() => {
    if (!isConfigLoading) {
      loadInferenceHistory();
    }
  }, [isConfigLoading]);

  useEffect(() => {
    let stopPolling;
    
    if (pollingEnabled) {
      stopPolling = startHistoryPolling(user.id, (error, data) => {
        if (error) {
          console.error('Polling error:', error);
          setApiError('Erro no carregamento automático de dados');
        } else if (data) {
          setInferenceHistory(data);
          if (data.length > 0) {
            setInference(data[0]);
          }
        }
      }, 30);
    }

    return () => {
      if (stopPolling) {
        stopPolling();
      }
    };
  }, [pollingEnabled, user.id]);

  const loadInferenceHistory = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      const allHistoryResponse = await getAllInferenceHistory(100);
      const history = allHistoryResponse.items || [];
      
      setInferenceHistory(history);
      
      if (history && history.length > 0) {
        const sorted = [...history].sort((a, b) => 
          new Date(b.processing_timestamp) - new Date(a.processing_timestamp)
        );
        setInference(sorted[0]);
      }
    } catch (error) {
      console.error('Error loading inference history:', error);
      setApiError(`Erro ao carregar dados da API: ${error.message}`);
      setInferenceHistory([]);
      setInference(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (inference) => {
    setSelectedInference(inference);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInference(null);
  };

  const handleInferenceCreated = (newInference) => {
    if (!newInference || !newInference.image_id) {
      console.warn('Inferência inválida recebida:', newInference);
      return;
    }
    const formattedInference = {
      ...newInference,
      image_id: newInference.image_id || newInference.request_id,
      processing_timestamp: newInference.processing_timestamp || new Date().toISOString(),
      location: newInference.location || newInference.metadata?.location || 'Webcam',
      status: newInference.status || 'completed',
      results: newInference.results || [],
      summary: newInference.summary || {},
      metadata: newInference.metadata || {}
    };
    
    setInferenceHistory(prev => {
      const existingIndex = prev.findIndex(item => 
        item.image_id === formattedInference.image_id || 
        item.request_id === formattedInference.request_id
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const existingTime = new Date(existing.processing_timestamp);
        const newTime = new Date(formattedInference.processing_timestamp);
        
        if (newTime >= existingTime) {
          updated[existingIndex] = formattedInference;
        }
        return updated;
      } else {
        return [formattedInference, ...prev];
      }
    });
    
    setInference(formattedInference);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-150">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">Sistema de Análise de Bananas Nanicas</h1>
            <div className="flex items-center space-x-4 mt-1">
              {appConfig && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ambiente: {appConfig.environment} | Versão: {appConfig.version}
                </p>
              )}
              {apiError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {apiError}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Histórico: {inferenceHistory.length} análises encontradas
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative">
              <span className="text-gray-600 dark:text-gray-300">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('analysis')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm6 2a3 3 0 110 6 3 3 0 010-6z" />
                </svg>
                Análise de Imagens
              </div>
            </button>
            
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('statistics')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Estatísticas
              </div>
            </button>
            
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'devices'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('devices')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2z" clipRule="evenodd" />
                </svg>
                Monitoramento de Dispositivos
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'analysis' ? (
          <>
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
                onClick={loadInferenceHistory}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {isLoading ? 'Carregando...' : 'Atualizar Dados'}
              </button>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pollingEnabled}
                  onChange={(e) => setPollingEnabled(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Auto-atualizar (30s)
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <RecentInference 
                inference={inference} 
                isLoading={isLoading} 
                onViewDetails={handleViewDetails} 
              />
              
              <div className="flex items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="text-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Estatísticas Detalhadas
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Visualize gráficos e análises completas dos dados
                  </p>
                  <button
                    onClick={() => setActiveTab('statistics')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150"
                  >
                    Ver Estatísticas
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <InferenceHistoryTable 
                data={inferenceHistory} 
                isLoading={isLoading} 
                onViewDetails={handleViewDetails} 
              />
            </div>
          </>
        ) : activeTab === 'statistics' ? (
          <>
            <div className="mb-6 flex flex-wrap gap-4">
              <button
                onClick={loadInferenceHistory}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {isLoading ? 'Carregando...' : 'Atualizar Estatísticas'}
              </button>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pollingEnabled}
                  onChange={(e) => setPollingEnabled(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Auto-atualizar (30s)
                </span>
              </label>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Baseado em {inferenceHistory.length} análises
              </div>
            </div>

            <InferenceStats 
              data={inferenceHistory} 
              isLoading={isLoading} 
            />
          </>
        ) : (
          <DeviceMonitoringDashboard />
        )}
      </main>

      {isDetailModalOpen && selectedInference && (
        <InferenceDetailsModal 
          inference={selectedInference} 
          onClose={handleCloseDetailModal} 
        />
      )}

      {showWebcamModal && (
        <WebcamCaptureModal 
          onClose={() => setShowWebcamModal(false)} 
          onInferenceCreated={handleInferenceCreated}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default Dashboard;