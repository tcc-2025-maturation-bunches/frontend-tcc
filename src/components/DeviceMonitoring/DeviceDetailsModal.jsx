import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { getDeviceAnalytics, getDeviceHealth, deleteDevice } from '../../api/deviceMonitoringApi';

const DeviceDetailsModal = ({ device, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'health') {
      loadHealth();
    }
  }, [activeTab]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await getDeviceAnalytics(device.device_id);
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealth = async () => {
    try {
      setIsLoading(true);
      const response = await getDeviceHealth(device.device_id);
      setHealth(response.health_report);
    } catch (error) {
      console.error('Erro ao carregar relatório de saúde:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getHealthStatusLabel = (status) => {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'fair': return 'Regular';
      case 'poor': return 'Ruim';
      case 'critical': return 'Crítico';
      default: return 'Desconhecido';
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

        {/* Tabs */}
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
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'health'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('health')}
          >
            Saúde
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
                      <dd className="text-sm font-medium">
                        {device.status === 'online' ? (
                          <span className="text-green-600 dark:text-green-400">Online</span>
                        ) : device.status === 'offline' ? (
                          <span className="text-red-600 dark:text-red-400">Offline</span>
                        ) : (
                          <span className="text-yellow-600 dark:text-yellow-400">{device.status}</span>
                        )}
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
              ) : analytics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Período</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {analytics.period_days} dias
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Taxa de Sucesso</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {analytics.success_rate?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Uptime</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {analytics.uptime_percentage?.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {analytics.captures_by_day && analytics.captures_by_day.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                        Capturas por Dia
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analytics.captures_by_day}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="captures" stroke="#22c55e" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Não há dados de analytics disponíveis
                </div>
              )}
            </div>
          )}

          {activeTab === 'health' && (
            <div>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader text="Carregando relatório de saúde..." />
                </div>
              ) : health ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Status de Saúde
                      </h3>
                      <div className={`text-2xl font-bold ${getHealthStatusColor(health.health_status)}`}>
                        {health.health_score?.toFixed(0)}/100
                      </div>
                    </div>
                    <p className={`text-lg font-medium ${getHealthStatusColor(health.health_status)}`}>
                      {getHealthStatusLabel(health.health_status)}
                    </p>
                  </div>

                  {health.recommendations && health.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                        Recomendações
                      </h3>
                      <ul className="space-y-2">
                        {health.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {health.next_maintenance && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Próxima Manutenção Recomendada
                      </p>
                      <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                        {health.next_maintenance === 'imediata' ? 'Imediata' :
                         health.next_maintenance === '7_dias' ? 'Em 7 dias' :
                         health.next_maintenance === '30_dias' ? 'Em 30 dias' :
                         'Em 90 dias'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Não há dados de saúde disponíveis
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