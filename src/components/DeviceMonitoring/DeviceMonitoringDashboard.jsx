import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { 
  getDashboardData, 
  listDevices,
  checkOfflineDevices
} from '../../api/deviceMonitoringApi';
import DeviceList from './DeviceList';
import DeviceDetailsModal from './DeviceDetailsModal';
import AddDeviceModal from './AddDeviceModal';

const DeviceMonitoringDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState({ status_filter: null, location_filter: null });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (filter.status_filter || filter.location_filter) {
      loadDevicesFiltered();
    }
  }, [filter.status_filter, filter.location_filter]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboardData();
      setDashboardData(response.data);
      const devicesList = Array.isArray(response.devices) ? response.devices : (response.devices?.devices || []);
      setDevices(devicesList);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDevicesFiltered = async () => {
    try {
      setIsLoading(true);
      const response = await listDevices({ ...filter, limit: 100 });
      const devicesList = Array.isArray(response) ? response : (response.devices || []);
      setDevices(devicesList);
    } catch (err) {
      console.error('Erro ao carregar dispositivos:', err);
      setError('Erro ao carregar lista de dispositivos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOffline = async () => {
    try {
      setIsRefreshing(true);
      const response = await checkOfflineDevices();
      if (response.updated_count > 0) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error('Erro ao verificar dispositivos offline:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeviceStatusUpdate = async () => {
    if (filter.status_filter || filter.location_filter) {
      await loadDevicesFiltered();
    } else {
      await loadDashboardData();
    }
  };

  const handleRefreshAll = async () => {
    if (filter.status_filter || filter.location_filter) {
      await loadDevicesFiltered();
    } else {
      await loadDashboardData();
    }
  };

  const handleViewDetails = (device) => {
    setSelectedDevice(device);
    setShowDetailsModal(true);
  };

  const handleAddDevice = async () => {
    setShowAddModal(false);
    await loadDashboardData();
  };

  const StatusCard = ({ title, value, color, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Monitoramento de Dispositivos
        </h2>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={handleRefreshAll}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader size="sm" text="Atualizando..." />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Atualizar Tudo
              </>
            )}
          </Button>
          {/* <Button
            variant="secondary"
            onClick={handleCheckOffline}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader size="sm" text="Verificando..." />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Verificar Offline
              </>
            )}
          </Button> */}
        </div>
      </div>

      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            title="Total de Dispositivos"
            value={dashboardData.total_devices || 0}
            color="text-blue-600 dark:text-blue-400"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            }
          />
          <StatusCard
            title="Dispositivos Online"
            value={dashboardData.online_devices || 0}
            color="text-green-600 dark:text-green-400"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            }
          />
          <StatusCard
            title="Dispositivos Offline"
            value={dashboardData.offline_devices || 0}
            color="text-red-600 dark:text-red-400"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            }
          />
          <StatusCard
            title="Taxa de Sucesso"
            value={`${dashboardData.average_success_rate?.toFixed(1) || 0}%`}
            color="text-purple-600 dark:text-purple-400"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>
      )}

      <Card>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por Status
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              value={filter.status_filter || ''}
              onChange={(e) => setFilter({ ...filter, status_filter: e.target.value || null })}
            >
              <option value="">Todos</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Manutenção</option>
              <option value="error">Erro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por Local
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Digite o local..."
              value={filter.location_filter || ''}
              onChange={(e) => setFilter({ ...filter, location_filter: e.target.value || null })}
            />
          </div>
        </div>
      </Card>

      {error ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Button variant="primary" onClick={() => { setError(null); loadDashboardData(); }} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card>
          <div className="flex justify-center items-center h-64">
            <Loader text="Carregando dispositivos..." />
          </div>
        </Card>
      ) : (
        <DeviceList
          devices={devices}
          onStatusUpdate={handleDeviceStatusUpdate}
          onViewDetails={handleViewDetails}
        />
      )}

      {showDetailsModal && selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDevice(null);
          }}
          onUpdate={() => {
            loadDashboardData();
          }}
        />
      )}

      {showAddModal && (
        <AddDeviceModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddDevice}
        />
      )}
    </div>
  );
};

export default DeviceMonitoringDashboard;