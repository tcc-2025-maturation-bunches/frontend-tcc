import { createContext, useContext, useState, useEffect } from 'react';
import { websocketService, WS_EVENTS } from '../api/websocketApi';

const WebsocketContext = createContext();

export const WebsocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [captureRequests, setCaptureRequests] = useState([]);
  const [config, setConfig] = useState({
    stationId: '',
    userId: '',
    intervalMinutes: 5,
  });

  useEffect(() => {
    websocketService.addEventListener('connected', handleConnected);
    websocketService.addEventListener('disconnected', handleDisconnected);
    websocketService.addEventListener('error', handleError);
    websocketService.addEventListener(WS_EVENTS.CONFIG_RESPONSE, handleConfigResponse);
    websocketService.addEventListener(WS_EVENTS.MONITORING_STATUS, handleMonitoringStatus);
    websocketService.addEventListener(WS_EVENTS.CAPTURE_REQUEST, handleCaptureRequest);
    
    // Unmount
    return () => {
      websocketService.removeEventListener('connected', handleConnected);
      websocketService.removeEventListener('disconnected', handleDisconnected);
      websocketService.removeEventListener('error', handleError);
      websocketService.removeEventListener(WS_EVENTS.CONFIG_RESPONSE, handleConfigResponse);
      websocketService.removeEventListener(WS_EVENTS.MONITORING_STATUS, handleMonitoringStatus);
      websocketService.removeEventListener(WS_EVENTS.CAPTURE_REQUEST, handleCaptureRequest);
      
      if (isConnected) {
        websocketService.disconnect();
      }
    };
  }, []);

  const handleConnected = () => {
    setIsConnected(true);
    setLastError(null);
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    setIsMonitoring(false);
    setConnectionId(null);
  };

  const handleError = (data) => {
    setLastError(data.error);
  };

  const handleConfigResponse = (data) => {
    if (data.success) {
      setConnectionId(data.connection_id);
    }
  };

  const handleMonitoringStatus = (data) => {
    setIsMonitoring(data.status === 'started');
  };

  const handleCaptureRequest = (data) => {
    setCaptureRequests(prev => [...prev, data]);
  };

  const connect = async (url) => {
    try {
      await websocketService.connect(url);
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    }
  };

  const disconnect = () => {
    websocketService.disconnect();
  };

  const configureMonitoring = async (stationId, userId, intervalMinutes) => {
    try {
      const result = await websocketService.configureMonitoring(
        stationId,
        userId,
        intervalMinutes
      );
      
      setConfig({
        stationId,
        userId,
        intervalMinutes,
      });
      
      return result;
    } catch (error) {
      setLastError(error);
      return false;
    }
  };

  const startMonitoring = async () => {
    try {
      const result = await websocketService.startMonitoring();
      return result;
    } catch (error) {
      setLastError(error);
      return false;
    }
  };

  const stopMonitoring = async () => {
    try {
      const result = await websocketService.stopMonitoring();
      return result;
    } catch (error) {
      setLastError(error);
      return false;
    }
  };

  const sendCaptureResponse = async (imageId, imageUrl, requestId, stationId) => {
    try {
      await websocketService.sendCaptureResponse(imageId, imageUrl, requestId, stationId);
      
      // Removendo a request
      setCaptureRequests(prev => 
        prev.filter(req => req.request_id !== requestId)
      );
      
      return true;
    } catch (error) {
      setLastError(error);
      return false;
    }
  };

  return (
    <WebsocketContext.Provider
      value={{
        isConnected,
        isMonitoring,
        connectionId,
        lastError,
        captureRequests,
        config,
        connect,
        disconnect,
        configureMonitoring,
        startMonitoring,
        stopMonitoring,
        sendCaptureResponse,
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
