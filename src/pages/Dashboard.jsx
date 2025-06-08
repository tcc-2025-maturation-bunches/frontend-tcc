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
import { generateFakeInferenceHistory } from '../api/generateFakeData';
import { useWebsocket } from '../contexts/WebsocketContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected, connect } = useWebsocket();
  const [inference, setInference] = useState(null);
  const [inferenceHistory, setInferenceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [showWebSocketModal, setShowWebSocketModal] = useState(false);
  const [useFakeData, setUseFakeData] = useState(true);

  useEffect(() => {
    loadInferenceHistory();
  }, []);

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

  const toggleDataSource = () => {
    setUseFakeData(!useFakeData);
    loadInferenceHistory();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-150">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">Sistema de Análise de Bananas Nanicas</h1>
            {useFakeData && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Usando dados de demonstração
              </p>
            )}
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
    </div>
  );
};

export default Dashboard;