import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import RecentInference from '../components/Dashboard/RecentInference';
import InferenceHistoryTable from '../components/Dashboard/InferenceHistoryTable';
import InferenceStats from '../components/Dashboard/InferenceStats';
import DeviceMonitoringDashboard from '../components/DeviceMonitoring/DeviceMonitoringDashboard';
import Loader from '../components/common/Loader';
import WebcamCaptureModal from '../components/Dashboard/WebcamCaptureModal';
import { getInferenceHistory } from '../api/inferenceApi';
import { generateFakeInferenceHistory } from '../api/generateFakeData';
import useAppConfig from '../hooks/useAppConfig';

const Dashboard = () => {
  const { user } = useAuth();
  const { config: appConfig, isLoading: isConfigLoading } = useAppConfig();
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' ou 'devices'
  const [inference, setInference] = useState(null);
  const [inferenceHistory, setInferenceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [useFakeData, setUseFakeData] = useState(true);
  const [selectedInference, setSelectedInference] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!isConfigLoading) {
      loadInferenceHistory();
    }
  }, [isConfigLoading]);

  const loadInferenceHistory = async () => {
    try {
      setIsLoading(true);
      
      let history;
      if (useFakeData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        history = generateFakeInferenceHistory();
      } else {
        try {
          history = await getInferenceHistory(user.id);
        } catch (error) {
          console.warn('API not available, using fake data:', error);
          setUseFakeData(true);
          history = generateFakeInferenceHistory();
        }
      }
      
      setInferenceHistory(history);
      
      if (history && history.length > 0) {
        const sorted = [...history].sort((a, b) => 
          new Date(b.processing_timestamp) - new Date(a.processing_timestamp)
        );
        setInference(sorted[0]);
      }
    } catch (error) {
      console.error('Error loading inference history:', error);
      setUseFakeData(true);
      const fakeHistory = generateFakeInferenceHistory();
      setInferenceHistory(fakeHistory);
      if (fakeHistory.length > 0) {
        setInference(fakeHistory[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (inference) => {
    setSelectedInference(inference);
    setIsDetailModalOpen(true);
  };

  const handleInferenceCreated = (newInference) => {
    const adaptedInference = {
      ...newInference,
      image_id: newInference.image_id || newInference.request_id,
      processing_timestamp: new Date().toISOString(),
      location: newInference.metadata?.location || 'Webcam',
      status: newInference.status || 'completed',
      results: newInference.detection?.results || [],
      summary: {
        total_objects: newInference.detection?.summary?.total_objects || 0,
        average_maturation_score: newInference.detection?.summary?.average_maturation_score || 0,
        average_confidence: newInference.detection?.results?.reduce((acc, r) => acc + r.confidence, 0) / (newInference.detection?.results?.length || 1) || 0,
        total_processing_time_ms: newInference.processing_time_ms || 0,
        detection_time_ms: newInference.detection?.summary?.detection_time_ms || 0,
        maturation_analysis_time_ms: newInference.detection?.summary?.maturation_time_ms || 0,
        maturation_counts: {
          green: newInference.processing_metadata?.maturation_distribution?.unripe || 0,
          ripe: (newInference.processing_metadata?.maturation_distribution?.ripe || 0) + 
                (newInference.processing_metadata?.maturation_distribution?.['semi-ripe'] || 0),
          overripe: newInference.processing_metadata?.maturation_distribution?.overripe || 0
        }
      }
    };
    
    setInference(adaptedInference);
    setInferenceHistory(prev => [adaptedInference, ...prev]);
  };

  const toggleDataSource = () => {
    setUseFakeData(!useFakeData);
    loadInferenceHistory();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-150">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">Sistema de Análise de Frutas</h1>
            <div className="flex items-center space-x-4 mt-1">
              {appConfig && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ambiente: {appConfig.environment} | Versão: {appConfig.version}
                </p>
              )}
              {useFakeData && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Usando dados de demonstração
                </p>
              )}
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
        {/* Tabs de navegação */}
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

              <button
                onClick={toggleDataSource}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-150 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {useFakeData ? 'Usar API Real' : 'Usar Dados Fake'}
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
          </>
        ) : (
          <DeviceMonitoringDashboard />
        )}
      </main>

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