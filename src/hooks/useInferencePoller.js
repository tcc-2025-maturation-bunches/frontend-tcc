import { useState, useEffect, useRef, useCallback } from 'react';
import { getProcessingStatus, getProcessingResults } from '../api/inferenceApi';

const useInferencePoller = (requestId, intervalMs = 2000, maxAttempts = 60) => {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const timeoutRef = useRef(null);

  const clearPollingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!requestId) return;
    
    setIsPolling(true);
    setAttempts(0);
    setError(null);
    
    clearPollingTimeout();
    
    pollStatus();
  }, [requestId]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    clearPollingTimeout();
  }, [clearPollingTimeout]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus(null);
    setResult(null);
    setError(null);
    setAttempts(0);
  }, [stopPolling]);

  const pollStatus = useCallback(async () => {
    if (!requestId || !isPolling) return;
    
    try {
      const statusResponse = await getProcessingStatus(requestId);
      setStatus(statusResponse);
      
      if (statusResponse.status === 'completed' || statusResponse.status === 'error') {
        if (statusResponse.status === 'completed') {
          try {
            const resultResponse = await getProcessingResults(requestId);
            setResult(resultResponse);
          } catch (resultError) {
            setError(`Error fetching results: ${resultError.message}`);
          }
        } else {
          setError(statusResponse.error_message || 'Processing failed');
        }
        
        setIsPolling(false);
        return;
      }
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setError('Max polling attempts reached');
        setIsPolling(false);
        return;
      }
      
      timeoutRef.current = setTimeout(pollStatus, intervalMs);
    } catch (err) {
      setError(`Error polling status: ${err.message}`);
      setIsPolling(false);
    }
  }, [requestId, isPolling, intervalMs, maxAttempts, attempts]);

  useEffect(() => {
    if (isPolling && requestId) {
      pollStatus();
    }
    
    return () => {
      clearPollingTimeout();
    };
  }, [isPolling, requestId, pollStatus, clearPollingTimeout]);

  useEffect(() => {
    return () => {
      clearPollingTimeout();
    };
  }, [clearPollingTimeout]);

  return {
    status,
    result,
    error,
    isPolling,
    attempts,
    startPolling,
    stopPolling,
    reset,
  };
};

export default useInferencePoller;
