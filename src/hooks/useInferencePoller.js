import { useState, useEffect, useCallback, useRef } from 'react';
import { getProcessingStatus, getProcessingResults } from '../api/inferenceApi';

const useInferencePoller = (requestId) => {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef(null);
  const pollingActiveRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pollingActiveRef.current = false;
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    if (!requestId || pollingActiveRef.current) {
      return;
    }

    setIsPolling(true);
    pollingActiveRef.current = true;
    setError(null);
    setStatus(null);
    setResult(null);

    const poll = async () => {
      try {
        if (!pollingActiveRef.current) {
          return;
        }

        console.log('Polling status for request:', requestId);
        const statusResponse = await getProcessingStatus(requestId);
        
        if (!pollingActiveRef.current) {
          return;
        }

        setStatus(statusResponse);

        if (statusResponse.status === 'completed') {
          console.log('Processing completed, fetching results...');
          try {
            const resultResponse = await getProcessingResults(requestId);
            setResult(resultResponse);
          } catch (resultError) {
            console.error('Error fetching results:', resultError);
            setError('Erro ao buscar resultados');
          }
          stopPolling();
        } else if (statusResponse.status === 'error' || statusResponse.status === 'failed') {
          console.error('Processing failed:', statusResponse);
          setError(statusResponse.error_message || 'Erro no processamento');
          stopPolling();
        }
      } catch (err) {
        console.error('Error polling status:', err);
        
        if (err.response?.status >= 500 || !err.response) {
          setError('Erro de conexão com o servidor');
          stopPolling();
        } else if (err.response?.status === 404) {
          setError('Processamento não encontrado');
          stopPolling();
        } else {
          setError(err.message || 'Erro desconhecido');
        }
      }
    };
    
    poll();
    intervalRef.current = setInterval(poll, 2000);
  }, [requestId, stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  useEffect(() => {
    if (!requestId) {
      setStatus(null);
      setResult(null);
      setError(null);
      stopPolling();
    }
  }, [requestId, stopPolling]);

  return {
    status,
    result,
    error,
    isPolling,
    startPolling,
    stopPolling
  };
};

export default useInferencePoller;