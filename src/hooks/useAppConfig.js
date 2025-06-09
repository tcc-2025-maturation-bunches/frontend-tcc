import { useState, useEffect } from 'react';
import { getPublicConfig } from '../api/apiClient';

const useAppConfig = () => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const publicConfig = await getPublicConfig();
      
      if (publicConfig) {
        setConfig(publicConfig);
        
        localStorage.setItem('app_config', JSON.stringify({
          environment: publicConfig.environment,
          version: publicConfig.version,
          processing_options: publicConfig.processing_options,
          upload_options: publicConfig.upload_options,
          timestamp: publicConfig.timestamp
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar configurações públicas:', err);
      setError('Erro ao carregar configurações do sistema');
      
      const storedConfig = localStorage.getItem('app_config');
      if (storedConfig) {
        try {
          setConfig(JSON.parse(storedConfig));
        } catch (parseError) {
          console.error('Erro ao parsear configurações armazenadas:', parseError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    config,
    isLoading,
    error,
    reloadConfig: loadConfig
  };
};

export default useAppConfig;