import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';

const WebSocketListItem = ({
  config,
  onEdit,
  onRemove,
  onConnect,
  onDisconnect,
  onConfigure,
  onStartMonitoring,
  onStopMonitoring,
  getWebSocketState,
  userId
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isTogglingMonitoring, setIsTogglingMonitoring] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const currentState = getWebSocketState ? getWebSocketState(config.id) : {
    isConnected: false,
    isMonitoring: false,
    connectionId: null,
    lastError: null,
  };

  const { isConnected, isMonitoring, lastError, connectionId: backendConnectionId } = currentState || {};

  const handleConnect = async () => {
    setIsConnecting(true);
    await onConnect(config.id);
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    await onDisconnect(config.id);
    setIsDisconnecting(false);
  };

  const handleToggleMonitoring = async () => {
    setIsTogglingMonitoring(true);
    if (isMonitoring) {
      await onStopMonitoring(config.id);
    } else {
      await onStartMonitoring(config.id);
    }
    setIsTogglingMonitoring(false);
  };

  const handleRemove = async () => {
    if (window.confirm(`Tem certeza que deseja remover a configuração para ${config.url}?`)) {
      setIsRemoving(true);
      await onRemove(config.id);
      setIsRemoving(false);}
  };
  
  const getStatusIndicatorColor = () => {
    if (lastError) return 'bg-red-500';
    if (isConnected) {
      return isMonitoring ? 'bg-blue-500' : 'bg-green-500';
    }
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (lastError) return `Erro: ${typeof lastError === 'object' ? lastError.message : lastError}`;
    if (isConnecting) return 'Conectando...';
    if (isDisconnecting) return 'Desconectando...';
    if (isConnected) {
      return isMonitoring ? `Monitorando (ID: ${backendConnectionId || 'N/A'})` : `Conectado (ID: ${backendConnectionId || 'N/A'})`;
    }
    return 'Desconectado';
  };


  return (
    <Card className="shadow-lg" title={`Estação: ${config.stationId || 'Não Definido'}`}> {/* */}
      <div className="p-4">
        <div className="mb-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">URL: <span className="font-medium text-gray-700 dark:text-gray-300">{config.url}</span></p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Intervalo: <span className="font-medium text-gray-700 dark:text-gray-300">{config.intervalMinutes} min</span></p>
        </div>

        <div className="flex items-center mb-4">
          <span className={`w-3 h-3 rounded-full mr-2 ${getStatusIndicatorColor()}`}></span>
          <p className="text-sm font-medium">{getStatusText()}</p>
        </div>
        
        {lastError && typeof lastError !== 'object' && (
            <p className="text-xs text-red-500 mb-2">Detalhe do Erro: {lastError}</p>
        )}


        <div className="flex flex-wrap gap-2 items-center">
          {!isConnected ? (
            <Button variant="primary" onClick={handleConnect} disabled={isConnecting} size="sm">
              {isConnecting ? <Loader size="sm" text="Conectando..." /> : 'Conectar'}
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleDisconnect} disabled={isDisconnecting} size="sm">
              {isDisconnecting ? <Loader size="sm" text="Desconectando..." /> : 'Desconectar'}
            </Button>
          )}

          {isConnected && (
            <Button
              variant={isMonitoring ? "danger" : "primary"}
              onClick={handleToggleMonitoring}
              disabled={isTogglingMonitoring || !backendConnectionId}
              size="sm"
            >
              {isTogglingMonitoring ? <Loader size="sm" text="Aguarde..." /> : (isMonitoring ? 'Parar Monitoramento' : 'Iniciar Monitoramento')}
            </Button>
          )}
          
          <Button variant="outline" onClick={() => onEdit(config)} disabled={isConnecting || isDisconnecting || isTogglingMonitoring} size="sm">
            Configurar
          </Button>
          <Button variant="danger" onClick={handleRemove} disabled={isRemoving} size="sm">
            {isRemoving ? <Loader size="sm" text="Removendo..." /> : 'Remover'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WebSocketListItem;