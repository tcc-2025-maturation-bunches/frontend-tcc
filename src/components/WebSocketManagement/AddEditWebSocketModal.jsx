import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Loader from '../common/Loader';

const AddEditWebSocketModal = ({ onClose, onSave, initialData, userId }) => {
  const [url, setUrl] = useState(initialData?.url || import.meta.env.VITE_WS_URL || 'ws://localhost:8000/monitoring/ws');
  const [stationId, setStationId] = useState(initialData?.stationId || 'station-1');
  const [intervalMinutes, setIntervalMinutes] = useState(initialData?.intervalMinutes || 5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!initialData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const configData = {
      url,
      stationId,
      intervalMinutes: parseInt(intervalMinutes, 10),
      userId,
    };
    if (initialData?.id) {
        configData.id = initialData.id;
    }

    try {
      await onSave(configData);
    } catch (err) {
      setError(err.message || 'Falha ao salvar configuração.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleIntervalChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 1440) { // Max 24 horas
      setIntervalMinutes(value);
    } else if (e.target.value === '') {
      setIntervalMinutes('');
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Editar Configuração WebSocket' : 'Adicionar Novo WebSocket'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Fechar modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="ws-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL do WebSocket
                </label>
                <input
                  type="text"
                  id="ws-url"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="ws://localhost:8000/monitoring/ws"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="station-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID da Estação
                </label>
                <input
                  type="text"
                  id="station-id"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Ex: station-001, camara-fria-a"
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="interval-minutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Intervalo de Captura (minutos)
                </label>
                 <input
                    type="number"
                    id="interval-minutes"
                    min="1"
                    max="1440" // 24 horas
                    value={intervalMinutes}
                    onChange={handleIntervalChange}
                    disabled={isLoading}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Intervalo entre capturas automáticas (1-1440 minutos).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !url || !stationId || !intervalMinutes || parseInt(intervalMinutes, 10) < 1}
            >
              {isLoading ? <Loader size="sm" text="" /> : (isEditing ? 'Salvar Alterações' : 'Adicionar WebSocket')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditWebSocketModal;