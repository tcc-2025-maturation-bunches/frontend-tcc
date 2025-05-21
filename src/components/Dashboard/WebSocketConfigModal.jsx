import React, { useState } from 'react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Configuração do WebSocket
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-gray-700 dark:text-gray-300">
                  Status: {isConnected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
              
              {isConnected && (
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${isMonitoring ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Monitoramento: {isMonitoring ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL do WebSocket
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="ws://localhost:8000/monitoring/ws"
                value={websocketUrl}
                onChange={(e) => setWebsocketUrl(e.target.value)}
                disabled={isConnected}
              />
            </div>

            {!isConnected ? (
              <div className="flex justify-end mt-4">
                <Button 
                  variant="secondary" 
                  onClick={onClose} 
                  className="mr-3"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleConnect}
                  disabled={isConnecting || !websocketUrl}
                >
                  {isConnecting ? 'Conectando...' : 'Conectar'}
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID da Estação
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="station-1"
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    disabled={isMonitoring}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Intervalo de captura (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    disabled={isMonitoring}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  {!isMonitoring ? (
                    <>
                      <Button 
                        variant="secondary" 
                        onClick={handleConfigure}
                        disabled={isConfiguring || !stationId}
                      >
                        {isConfiguring ? 'Configurando...' : 'Configurar'}
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={handleStartMonitoring}
                        disabled={!isConnected}
                      >
                        Iniciar Monitoramento
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="danger" 
                        onClick={handleStopMonitoring}
                      >
                        Parar Monitoramento
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={onClose}
                      >
                        Fechar
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketConfigModal;