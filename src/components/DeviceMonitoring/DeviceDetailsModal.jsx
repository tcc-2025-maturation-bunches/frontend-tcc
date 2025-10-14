import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { deleteDevice, getDevice } from '../../api/deviceMonitoringApi';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

const DeviceDetailsModal = ({ device: initialDevice, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [device, setDevice] = useState(initialDevice);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDeviceDetails();
  }, [initialDevice.device_id]);

  const loadDeviceDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getDevice(initialDevice.device_id);
      setDevice(response);
    } catch (error) {
      console.error('Erro ao carregar detalhes do dispositivo:', error);
      setError('Erro ao carregar detalhes do dispositivo');
      setDevice(initialDevice);
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

  const formatUptime = (uptimeHours) => {
    if (!uptimeHours) return '0 horas';
    
    const hours = parseFloat(uptimeHours);
    
    if (isNaN(hours) || hours === 0) return '0 horas';
    
    if (hours < 1) {
      const minutes = Math.floor(hours * 60);
      return `${minutes} minutos`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)} horas`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      return `${days} dias e ${remainingHours} horas`;
    }
  };

  const parseStatsValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(parsed) ? defaultValue : parsed;
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

  const getCaptureData = () => {
    const totalCaptures = parseStatsValue(device.stats?.total_captures);
    const successfulCaptures = parseStatsValue(device.stats?.successful_captures);
    const failedCaptures = parseStatsValue(device.stats?.failed_captures);
    
    return [
      { name: 'Bem-sucedidas', value: successfulCaptures, color: '#22c55e' },
      { name: 'Falhadas', value: failedCaptures, color: '#ef4444' },
      { name: 'Pendentes', value: Math.max(0, totalCaptures - successfulCaptures - failedCaptures), color: '#f59e0b' }
    ].filter(item => item.value > 0);
  };

  const getPerformanceData = () => {
    const avgProcessingTime = parseStatsValue(device.stats?.average_processing_time_ms);
    
    return [
      {
        name: 'Performance',
        'Tempo Médio (ms)': avgProcessingTime,
      }
    ];
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-gray-900 dark:text-gray-200 font-medium">
            {payload[0].name}
          </p>
          <p style={{ color: payload[0].color || payload[0].fill }} className="text-sm font-semibold">
            Valor: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader text="Carregando detalhes..." />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : activeTab === 'info' ? (
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
                        {parseStatsValue(device.stats?.total_captures)}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Capturas Bem-sucedidas:</dt>
                      <dd className="text-sm font-medium text-green-600 dark:text-green-400">
                        {parseStatsValue(device.stats?.successful_captures)}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Capturas Falhadas:</dt>
                      <dd className="text-sm font-medium text-red-600 dark:text-red-400">
                        {parseStatsValue(device.stats?.failed_captures)}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Tempo Médio de Proc.:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {parseStatsValue(device.stats?.average_processing_time_ms).toFixed(0)} ms
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Tempo de Atividade:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {formatUptime(device.stats?.uptime_hours)}
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
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Python:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.capabilities?.python_version || 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">OpenCV:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.capabilities?.opencv_version || 'N/A'}
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
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                  Visão Geral de Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total de Capturas</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {parseStatsValue(device.stats?.total_captures)}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {parseStatsValue(device.stats?.total_captures) > 0
                        ? ((parseStatsValue(device.stats?.successful_captures) / parseStatsValue(device.stats?.total_captures)) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Tempo Médio</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {parseStatsValue(device.stats?.average_processing_time_ms).toFixed(0)} ms
                    </p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Uptime</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {formatUptime(device.stats?.uptime_hours)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                  <h4 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Distribuição de Capturas
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCaptureData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCaptureData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-80">
                  <h4 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Performance de Processamento
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getPerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Tempo Médio (ms)" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Informações Detalhadas
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Última Captura:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.stats?.last_capture_at ? formatDate(device.stats.last_capture_at) : 'Nunca'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Status de Conexão:</dt>
                      <dd className={`text-sm font-medium ${getStatusColor(device.status)}`}>
                        {device.is_online ? 'Conectado' : 'Desconectado'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Qualidade de Imagem:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.config?.image_quality || 'N/A'}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Resolução Configurada:</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {device.config?.image_width || 'N/A'} x {device.config?.image_height || 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
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