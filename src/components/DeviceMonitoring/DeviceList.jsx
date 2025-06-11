import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const DeviceList = ({ devices, onStatusUpdate, onViewDetails }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-600 dark:text-green-400">Online</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-red-600 dark:text-red-400">Offline</span>
          </div>
        );
      case 'maintenance':
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-yellow-600 dark:text-yellow-400">Manutenção</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
            <span className="text-red-700 dark:text-red-300">Erro</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Desconhecido</span>
          </div>
        );
    }
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Nunca';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} horas atrás`;
    return `${Math.floor(diffMins / 1440)} dias atrás`;
  };

  return (
    <Card
      title="Dispositivos Registrados"
      subtitle={`${devices.length} dispositivos encontrados`}
    >
      {devices.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <p>Nenhum dispositivo encontrado</p>
          <p className="text-sm mt-1">Adicione um dispositivo para começar o monitoramento</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Local
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Última Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Capturas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Taxa de Sucesso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {devices.map((device) => (
                <tr key={device.device_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.device_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {device.device_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {device.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusIcon(device.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatLastSeen(device.last_seen)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {device.stats?.total_captures || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${device.stats?.total_captures > 0 
                              ? ((device.stats.successful_captures || 0) / device.stats.total_captures * 100) 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">
                        {device.stats?.total_captures > 0 
                          ? `${((device.stats.successful_captures || 0) / device.stats.total_captures * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {device.status === 'online' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onStatusUpdate(device.device_id, 'maintenance')}
                        >
                          Manutenção
                        </Button>
                      )}
                      {device.status === 'maintenance' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onStatusUpdate(device.device_id, 'online')}
                        >
                          Ativar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(device)}
                      >
                        Detalhes
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default DeviceList;