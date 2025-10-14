import React, { useState } from 'react';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { deleteDevice, getLocationAnalytics } from '../../api/deviceMonitoringApi';

const DeviceDetailsModal = ({ device, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [locationAnalytics, setLocationAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadLocationAnalytics = async () => {
    if (!device.location) return;
    
    try {
      setIsLoading(true);
      const response = await getLocationAnalytics(device.location);
      setLocationAnalytics(response);
    } catch (error) {
      console.error('Erro ao carregar analytics de localização:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'analytics') {
      loadLocationAnalytics();
    }
  }, [activeTab]);

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja remover o dispositivo ${device.device_name}?`)) {
      try {
        setIsDeleting(true);
        await deleteDevice(device.device_id);
        onUpdate();
        onClose();
      } catch (error) {
        console.error('Erro ao deletar dispositivo:', error);
        alert('Erro ao remover dispositivo');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-600 dark:text-green-400';
      case 'offline':
        return 'text-red-600 dark:text-red-400';
      case 'maintenance':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'maintenance': return 'Manutenção';
      case 'error': return 'Erro';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {device.device_name}
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

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'info'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Informações
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                    Informações Básicas
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">ID do Dispositivo:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.device_id}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Nome:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.device_name}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Local:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.location}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Status:</dt>
                      <dd className={`text-sm font-medium ${getStatusColor(device.status)}`}>
                        {getStatusLabel(device.status)}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Intervalo de Captura:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.capture_interval} segundos
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                    Estatísticas
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Total de Capturas:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.stats?.total_captures || 0}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Capturas Bem-sucedidas:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.stats?.successful_captures || 0}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Capturas Falhadas:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.stats?.failed_captures || 0}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Tempo de Atividade:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.stats?.uptime_hours || 0} horas
                      </dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Última Atividade:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {formatDate(device.last_seen)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                  Capacidades
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Resolução da Câmera:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.capabilities?.camera_resolution || 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Plataforma:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.capabilities?.platform || 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Captura Automática:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.capabilities?.auto_capture ? 'Sim' : 'Não'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Armazenamento Local:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.capabilities?.local_storage ? 'Sim' : 'Não'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                  Datas do Sistema
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Criado em:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {formatDate(device.created_at)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Atualizado em:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {formatDate(device.updated_at)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader text="Carregando analytics..." />
                </div>
              ) : locationAnalytics ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                      Analytics da Localização: {device.location}
                    </h3>
                    <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
                      {JSON.stringify(locationAnalytics, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Não há dados de analytics disponíveis para esta localização
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader size="sm" text="Removendo..." /> : 'Remover Dispositivo'}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailsModal;