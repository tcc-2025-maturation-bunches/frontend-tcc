import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { useWebsocket } from '../../contexts/WebsocketContext';

const WebSocketConfigModal = ({ onClose, userId }) => {
  const { isConnected, isMonitoring, connect, configureMonitoring, startMonitoring, stopMonitoring } = useWebsocket();
  
  const [websocketUrl, setWebsocketUrl] = useState(
    import.meta.env.VITE_WS_URL || 'ws://localhost:8000/monitoring/ws'
  );
  const [stationId, setStationId] = useState('station-1');
  const [interval, setInterval] = useState(5);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [error, setError] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (isConnected && !isConfigured) {
      handleConfigure();
    }
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await connect(websocketUrl);
    } catch (error) {
      setError(`Erro ao conectar: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConfigure = async () => {
    try {
      setIsConfiguring(true);
      setError(null);
      await configureMonitoring(stationId, userId, interval);
      setIsConfigured(true);
    } catch (error) {
      setError(`Erro ao configurar: ${error.message}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleStartMonitoring = async () => {
    try {
      setError(null);
      await startMonitoring();
    } catch (error) {
      setError(`Erro ao iniciar monitoramento: ${error.message}`);
    }
  };

  const handleStopMonitoring = async () => {
    try {
      setError(null);
      await stopMonitoring();
    } catch (error) {
      setError(`Erro ao parar monitoramento: ${error.message}`);
    }
  };

  const handleIntervalChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 60) {
      setInterval(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Configuração do WebSocket
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Fechar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conexão: {isConnected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
              
              {isConnected && (
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${isMonitoring ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Monitoramento: {isMonitoring ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}

            {!isConnected ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL do WebSocket
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm"
                    placeholder="ws://localhost:8000/monitoring/ws"
                    value={websocketUrl}
                    onChange={(e) => setWebsocketUrl(e.target.value)}
                    disabled={isConnecting}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="secondary" 
                    onClick={onClose}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleConnect}
                    disabled={isConnecting || !websocketUrl}
                    size="sm"
                  >
                    {isConnecting ? 'Conectando...' : 'Conectar'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID da Estação
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="station-1"
                      value={stationId}
                      onChange={(e) => setStationId(e.target.value)}
                      disabled={isMonitoring || isConfiguring}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Intervalo de Captura
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={interval}
                        onChange={handleIntervalChange}
                        disabled={isMonitoring || isConfiguring}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <div className="flex items-center space-x-1 min-w-fit">
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={interval}
                          onChange={handleIntervalChange}
                          disabled={isMonitoring || isConfiguring}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">min</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Intervalo entre capturas automáticas (1-60 minutos)
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  {!isMonitoring ? (
                    <>
                      <Button 
                        variant="secondary" 
                        onClick={handleConfigure}
                        disabled={isConfiguring || !stationId}
                        size="sm"
                      >
                        {isConfiguring ? 'Configurando...' : 'Reconfigurar'}
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={handleStartMonitoring}
                        disabled={!isConfigured || isConfiguring}
                        size="sm"
                      >
                        Iniciar Monitoramento
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="danger" 
                        onClick={handleStopMonitoring}
                        size="sm"
                      >
                        Parar Monitoramento
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={onClose}
                        size="sm"
                      >
                        Fechar
                      </Button>
                    </>
                  )}
                </div>

                {isConfigured && (
                  <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-green-700 dark:text-green-200">
                        Configuração aplicada com sucesso
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketConfigModal;