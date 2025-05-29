import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WS_EVENTS, WebsocketService } from '../api/websocketApi';
import { v4 as uuidv4 } from 'uuid';

const WebsocketContext = createContext();

const LOCAL_STORAGE_KEY = 'websocketConfigs';

const createWebSocketInstance = () => new WebsocketService();

export const WebsocketProvider = ({ children }) => {
  const [websocketConfigs, setWebsocketConfigs] = useState(() => {
    const savedConfigs = localStorage.getItem(LOCAL_STORAGE_KEY);
    const initialConfigs = savedConfigs ? JSON.parse(savedConfigs) : {};
    Object.keys(initialConfigs).forEach(id => {
      initialConfigs[id] = {
        ...initialConfigs[id],
        isConnected: false,
        isMonitoring: false,
        connectionId: null,
        lastError: null,
        serviceInstance: createWebSocketInstance(),
      };
    });
    return initialConfigs;
  });

  const updateAndSaveConfigs = (newConfigs) => {
    setWebsocketConfigs(newConfigs);
    const serializableConfigs = {};
    for (const id in newConfigs) {
      const { serviceInstance, isConnected, isMonitoring, connectionId, lastError, captureRequests, ...configToSave } = newConfigs[id];
      serializableConfigs[id] = configToSave;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializableConfigs));
  };


  const updateConfigState = useCallback((configId, updates) => {
    setWebsocketConfigs(prev => {
      if (!prev[configId]) return prev;
      return {
        ...prev,
        [configId]: {
          ...prev[configId],
          ...updates,
        },
      };
    });
  }, []);

  useEffect(() => {
    const listeners = [];

    Object.values(websocketConfigs).forEach(config => {
      const { id, serviceInstance } = config;

      const handleConnected = () => updateConfigState(id, { isConnected: true, lastError: null });
      const handleDisconnected = () => updateConfigState(id, { isConnected: false, isMonitoring: false, connectionId: null });
      const handleError = (data) => updateConfigState(id, { lastError: data.error, isConnected: serviceInstance.getConnectionStatus().isConnected });
      const handleConfigResponse = (data) => {
        if (data.success) {
          updateConfigState(id, { connectionId: data.connection_id });
        } else {
          updateConfigState(id, { lastError: data.error || 'Config response error' });
        }
      };
      const handleMonitoringStatus = (data) => updateConfigState(id, { isMonitoring: data.status === 'started' });
      const handleCaptureRequest = (data) => {
         updateConfigState(id, { captureRequests: [...(websocketConfigs[id]?.captureRequests || []), data] })
      };


      serviceInstance.addEventListener('connected', handleConnected);
      serviceInstance.addEventListener('disconnected', handleDisconnected);
      serviceInstance.addEventListener('error', handleError);
      serviceInstance.addEventListener(WS_EVENTS.CONFIG_RESPONSE, handleConfigResponse);
      serviceInstance.addEventListener(WS_EVENTS.MONITORING_STATUS, handleMonitoringStatus);
      serviceInstance.addEventListener(WS_EVENTS.CAPTURE_REQUEST, handleCaptureRequest);
      listeners.push({
        id,
        serviceInstance,
        handlers: [
            { event: 'connected', handler: handleConnected },
            { event: 'disconnected', handler: handleDisconnected },
            { event: 'error', handler: handleError },
            { event: WS_EVENTS.CONFIG_RESPONSE, handler: handleConfigResponse },
            { event: WS_EVENTS.MONITORING_STATUS, handler: handleMonitoringStatus },
            { event: WS_EVENTS.CAPTURE_REQUEST, handler: handleCaptureRequest },
        ]
      });
    });

    return () => {
      listeners.forEach(({ serviceInstance, handlers }) => {
        handlers.forEach(({event, handler}) => serviceInstance.removeEventListener(event, handler));
        if (serviceInstance.getConnectionStatus().isConnected) {
            serviceInstance.disconnect();
        }
      });
    };
  }, [websocketConfigs, updateConfigState]);


  const addWebSocketConfig = async (configData) => {
    const configId = uuidv4();
    const serviceInstance = createWebSocketInstance();
    const newConfig = {
      ...configData,
      id: configId,
      isConnected: false,
      isMonitoring: false,
      connectionId: null,
      lastError: null,
      serviceInstance,
      captureRequests: [],
    };

    updateAndSaveConfigs({ ...websocketConfigs, [configId]: newConfig });
    
    try {
      await serviceInstance.connect(newConfig.url);
      await new Promise(resolve => setTimeout(resolve, 100)); 

      if (serviceInstance.getConnectionStatus().isConnected) {
        const configResult = await serviceInstance.configureMonitoring(
          newConfig.stationId,
          newConfig.userId,
          newConfig.intervalMinutes
        );
        return configResult.success;
      } else {
        updateConfigState(configId, { lastError: 'Falha ao conectar o WebSocket recém-adicionado.' });
        return false;
      }
    } catch (error) {
      updateConfigState(configId, { lastError: error.message || 'Erro ao adicionar e configurar WebSocket.' });
      return false;
    }
  };
  
  const removeWebSocketConfig = (configId) => {
    const config = websocketConfigs[configId];
    if (config && config.serviceInstance.getConnectionStatus().isConnected) {
      config.serviceInstance.disconnect();
    }
    const { [configId]: _, ...remainingConfigs } = websocketConfigs;
    updateAndSaveConfigs(remainingConfigs);
  };

  const connectWebSocket = async (configId) => {
    const config = websocketConfigs[configId];
    if (!config || config.isConnected) return config?.isConnected || false;
    try {
      updateConfigState(configId, { lastError: null });
      await config.serviceInstance.connect(config.url);
       await new Promise(resolve => setTimeout(resolve, 100));
       if (websocketConfigs[configId]?.serviceInstance.getConnectionStatus().isConnected) {
         await configureWebSocket(configId, config.stationId, config.intervalMinutes, config.userId);
         return true;
       }
       return false;
    } catch (error) {
      updateConfigState(configId, { lastError: error.message, isConnected: false });
      return false;
    }
  };

  const disconnectWebSocket = (configId) => {
    const config = websocketConfigs[configId];
    if (config && config.serviceInstance.getConnectionStatus().isConnected) {
      config.serviceInstance.disconnect();
    }
  };

  const configureWebSocket = async (configId, stationId, intervalMinutes, userId) => {
    const config = websocketConfigs[configId];
    const currentUserId = userId || config?.userId;

    if (!config || !config.serviceInstance.getConnectionStatus().isConnected || !currentUserId) {
        updateConfigState(configId, { lastError: 'Não conectado ou usuário não definido para configurar.' });
        return false;
    }
    try {
      updateConfigState(configId, { lastError: null });
      const updatedConfigData = { ...config, stationId, intervalMinutes, userId: currentUserId };
      const tempConfigs = { ...websocketConfigs, [configId]: updatedConfigData };
      const serializableConfigs = {};
        for (const id_loop in tempConfigs) {
          const { serviceInstance, isConnected: _isConnected, isMonitoring: _isMonitoring, connectionId: _connectionId, lastError: _lastError, captureRequests: _captureRequests, ...configToSave } = tempConfigs[id_loop];
          serializableConfigs[id_loop] = configToSave;
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializableConfigs));
      setWebsocketConfigs(prev => ({...prev, [configId]: updatedConfigData}));


      const result = await config.serviceInstance.configureMonitoring(stationId, currentUserId, intervalMinutes);
      return result.success;
    } catch (error) {
      updateConfigState(configId, { lastError: error.message });
      return false;
    }
  };

  const startWebSocketMonitoring = async (configId) => {
    const config = websocketConfigs[configId];
    if (!config || !config.serviceInstance.getConnectionStatus().isConnected || config.isMonitoring) return false;
    try {
      updateConfigState(configId, { lastError: null });
      const result = await config.serviceInstance.startMonitoring();
      return result.status === 'started';
    } catch (error) {
      updateConfigState(configId, { lastError: error.message });
      return false;
    }
  };

  const stopWebSocketMonitoring = async (configId) => {
    const config = websocketConfigs[configId];
    if (!config || !config.serviceInstance.getConnectionStatus().isConnected || !config.isMonitoring) return false;
    try {
      updateConfigState(configId, { lastError: null });
      const result = await config.serviceInstance.stopMonitoring();
      return result.status === 'stopped';
    } catch (error) {
      updateConfigState(configId, { lastError: error.message });
      return false;
    }
  };
  
  const sendWebSocketCaptureResponse = async (configId, imageId, imageUrl, requestId, stationId) => {
    const config = websocketConfigs[configId];
    if (!config || !config.serviceInstance.getConnectionStatus().isConnected) return false;
    try {
      await config.serviceInstance.sendCaptureResponse(imageId, imageUrl, requestId, stationId);
      updateConfigState(configId, { 
        captureRequests: (config.captureRequests || []).filter(req => req.request_id !== requestId)
      });
      return true;
    } catch (error) {
      updateConfigState(configId, { lastError: error.message });
      return false;
    }
  };


  return (
    <WebsocketContext.Provider
      value={{
        websocketConfigs,
        addWebSocketConfig,
        removeWebSocketConfig,
        connectWebSocket,
        disconnectWebSocket,
        configureWebSocket,
        startWebSocketMonitoring,
        stopWebSocketMonitoring,
        sendWebSocketCaptureResponse,
      }}
    >
      {children}
    </WebsocketContext.Provider>
  );
};

export const useWebsocket = () => {
  const context = useContext(WebsocketContext);
  if (context === undefined) {
    throw new Error('useWebsocket must be used within a WebsocketProvider');
  }
  return context;
};