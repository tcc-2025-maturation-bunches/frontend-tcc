import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import RecentInference from '../components/Dashboard/RecentInference';
import InferenceStats from '../components/Dashboard/InferenceStats';
import DeviceMonitoringDashboard from '../components/DeviceMonitoring/DeviceMonitoringDashboard';
import Loader from '../components/common/Loader';
import WebcamCaptureModal from '../components/Dashboard/WebcamCaptureModal';
import InferenceDetailsModal from '../components/Dashboard/InferenceDetailsModal';
import InferenceHistoryTablePaginated from '../components/Dashboard/InferenceHistoryTablePaginated';
import { getInferenceStats } from '../api/resultQueryApi';
import useAppConfig from '../hooks/useAppConfig';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { config: appConfig, isLoading: isConfigLoading } = useAppConfig();
  const [activeTab, setActiveTab] = useState('analysis');
  const [apiStatsData, setApiStatsData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [selectedInference, setSelectedInference] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  const [statsStartDate, setStatsStartDate] = useState(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate() - 6).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [statsEndDate, setStatsEndDate] = useState(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [paginatedTableRef, setPaginatedTableRef] = useState(null);
  const [mostRecentInference, setMostRecentInference] = useState(null);
  const [isLoadingRecentInference, setIsLoadingRecentInference] = useState(true);

  const loadStatsFromApi = useCallback(async (startDate = statsStartDate, endDate = statsEndDate) => {
    try {
      setIsLoadingData(true);
      setApiError(null);
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const days = Math.max(diffDays, 2);
      
      const statsResponse = await getInferenceStats(days);
      setApiStatsData(statsResponse);
    } catch (statsError) {
      console.error('Error loading API stats:', statsError);
      const statsErrorMessage = statsError.response?.data?.detail || statsError.message || 'Erro desconhecido';
      setApiError(prev => `${prev ? prev + '; ' : ''}Erro ao carregar estatísticas: ${statsErrorMessage}`);
      setApiStatsData(null);
      if (statsError.response?.status === 401) {
        toast.error('Sessão expirada para estatísticas. Faça login novamente.');
        setTimeout(() => logout(), 2000);
      } else {
        toast.error('Erro ao carregar estatísticas');
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [statsStartDate, statsEndDate, logout]);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      console.error('Usuário não possui ID válido');
      setApiError('Erro: Dados do usuário incompletos');
      return;
    }

    await loadStatsFromApi();
    
    if (paginatedTableRef && typeof paginatedTableRef.refreshCurrentPage === 'function') {
      paginatedTableRef.refreshCurrentPage();
    }
  }, [user, loadStatsFromApi, paginatedTableRef]);

  useEffect(() => {
    if (!isConfigLoading && user?.id) {
      loadStatsFromApi();
    }
  }, [isConfigLoading, user?.id, loadStatsFromApi]);

  useEffect(() => {
    if (paginatedTableRef && user?.id && !isConfigLoading) {
      const timer = setTimeout(() => {
        if (typeof paginatedTableRef.refreshCurrentPage === 'function') {
          paginatedTableRef.refreshCurrentPage();
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [paginatedTableRef, user?.id, isConfigLoading]);

  useEffect(() => {
    let intervalId;
    
    const updateData = async () => {
      try {
        if (paginatedTableRef && typeof paginatedTableRef.refreshCurrentPage === 'function') {
          paginatedTableRef.refreshCurrentPage();
        }
        
        await loadStatsFromApi();
      } catch (error) {
        console.error('Erro ao atualizar dados automaticamente:', error);
      }
    };
    
    if (pollingEnabled && user?.id) {
      intervalId = setInterval(updateData, 60000);
      setPollingIntervalId(intervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        setPollingIntervalId(null);
      }
    };
  }, [pollingEnabled, user, paginatedTableRef, loadStatsFromApi]);

  const handleViewDetails = (inference) => {
    setSelectedInference(inference);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInference(null);
  };

  const handleInferenceCreated = async (newInference) => {
    if (newInference?.action === 'reopen_modal') {
      setShowWebcamModal(true);
      return;
    }
    
    if (!newInference || !newInference.image_id) {
      console.warn('Inferência inválida recebida:', newInference);
      return;
    }

    if (paginatedTableRef && typeof paginatedTableRef.refreshCurrentPage === 'function') {
      paginatedTableRef.refreshCurrentPage();
    }

    loadStatsFromApi();
    
    toast.success('Análise concluída com sucesso!');
  };

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    if (newEndDate < newStartDate) {
      toast.error('A data final não pode ser anterior à data inicial');
      return;
    }
    
    const start = new Date(newStartDate);
    const end = new Date(newEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays < 2) {
      toast.error('O período deve ter no mínimo 2 dias para exibir os gráficos corretamente');
      return;
    }
    
    setStatsStartDate(newStartDate);
    setStatsEndDate(newEndDate);
    loadStatsFromApi(newStartDate, newEndDate);
  };

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    
    setStatsStartDate(startStr);
    setStatsEndDate(endStr);
    loadStatsFromApi(startStr, endStr);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <Loader fullScreen text="Carregando dados do usuário..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-150">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">
              Sistema de Análise de Bananas Nanicas
            </h1>
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
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative">
              <span className="text-gray-600 dark:text-gray-300">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Sair
            </button>
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
              {/* <button
                onClick={() => setShowWebcamModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Realizar Análise
              </button> */}
              
              <button
                onClick={loadDashboardData}
                disabled={isLoadingData}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {isLoadingData ? 'Carregando...' : 'Atualizar Dados'}
              </button>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pollingEnabled}
                  onChange={(e) => setPollingEnabled(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Atualizar automaticamente (60s)
                </span>
              </label>
            </div>

            <div className="mb-6">
              <RecentInference 
                inference={mostRecentInference} 
                isLoading={isLoadingRecentInference} 
                onViewDetails={handleViewDetails} 
              />
            </div>

            <div className="mt-6">
              <InferenceHistoryTablePaginated 
                userId={user.id}
                onViewDetails={handleViewDetails}
                onRefReady={setPaginatedTableRef}
                onMostRecentChange={setMostRecentInference}
                onLoadingChange={setIsLoadingRecentInference}
              />
            </div>
          </>
        ) : activeTab === 'statistics' ? (
          <>
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => loadStatsFromApi()}
                  disabled={isLoadingData}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  {isLoadingData ? 'Carregando...' : 'Atualizar Estatísticas'}
                </button>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={pollingEnabled}
                    onChange={(e) => setPollingEnabled(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Atualizar automaticamente (60s)
                  </span>
                </label>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {apiStatsData ? `Baseado em ${apiStatsData.total_inspections} inspeções nos últimos ${apiStatsData.period_days} dias` : 'Carregando contagem...'}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      id="start-date"
                      value={statsStartDate}
                      max={statsEndDate}
                      onChange={(e) => handleDateRangeChange(e.target.value, statsEndDate)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Final
                    </label>
                    <input
                      type="date"
                      id="end-date"
                      value={statsEndDate}
                      min={statsStartDate}
                      max={(() => {
                        const date = new Date();
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      })()}
                      onChange={(e) => handleDateRangeChange(statsStartDate, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuickRange(7)}
                      className="px-3 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      7 dias
                    </button>
                    <button
                      onClick={() => setQuickRange(15)}
                      className="px-3 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      15 dias
                    </button>
                    <button
                      onClick={() => setQuickRange(30)}
                      className="px-3 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      30 dias
                    </button>
                    <button
                      onClick={() => setQuickRange(90)}
                      className="px-3 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      90 dias
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Selecione um período de no mínimo 2 dias para visualizar os gráficos de tendência corretamente.
                </p>
              </div>
            </div>

            <InferenceStats 
              statsApiData={apiStatsData} 
              isLoading={isLoadingData} 
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