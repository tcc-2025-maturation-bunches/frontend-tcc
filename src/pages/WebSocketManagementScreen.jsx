import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebsocket } from '../contexts/WebsocketContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import AddEditWebSocketModal from '../components/WebSocketManagement/AddEditWebSocketModal';
import WebSocketList from '../components/WebSocketManagement/WebSocketList';
import ThemeToggle from '../components/common/ThemeToggle';

const WebSocketManagementScreen = ({ onBack }) => {
  const { user } = useAuth();
  const {
    websocketConfigs,
    addWebSocketConfig,
    removeWebSocketConfig,
    connectWebSocket,
    disconnectWebSocket,
    configureWebSocket,
    startWebSocketMonitoring,
    stopWebSocketMonitoring,
  } = useWebsocket();

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  useEffect(() => {
  }, []);

  const handleOpenAddModal = () => {
    setEditingConfig(null);
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (config) => {
    setEditingConfig(config);
    setShowAddEditModal(true);
  };

  const handleSaveWebSocket = async (configData) => {
    let success = false;
    if (editingConfig) {
      if (configData.url !== editingConfig.url || configData.stationId !== editingConfig.stationId) {
        if (websocketConfigs[editingConfig.id]?.isConnected) {
          success = await configureWebSocket(editingConfig.id, configData.stationId, configData.intervalMinutes);
        } else {
          console.warn("WebSocket não conectado. Configuração atualizada localmente. Conecte para aplicar no servidor.");
          success = true;
        }
      } else {
        success = await configureWebSocket(editingConfig.id, configData.stationId, configData.intervalMinutes);
      }
    } else {
      success = await addWebSocketConfig({
        url: configData.url,
        stationId: configData.stationId,
        intervalMinutes: configData.intervalMinutes,
        userId: user.id,
      });
    }

    if (success) {
      setShowAddEditModal(false);
      setEditingConfig(null);
    } else {
      alert('Falha ao salvar configuração do WebSocket.');
    }
  };

  const handleDeleteWebSocket = (configId) => {
    if (window.confirm('Tem certeza que deseja remover esta configuração de WebSocket?')) {
      removeWebSocketConfig(configId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-150">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Back button */}
            <button 
              onClick={onBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Voltar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-500">
              Gerenciamento de WebSockets
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-gray-600 dark:text-gray-300">{user?.name || 'Usuário'}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-end">
          <Button variant="primary" onClick={handleOpenAddModal}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Adicionar Novo WebSocket
          </Button>
        </div>

        <WebSocketList
          configs={Object.values(websocketConfigs || {})}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteWebSocket}
          onConnect={connectWebSocket}
          onDisconnect={disconnectWebSocket}
          onStartMonitoring={startWebSocketMonitoring}
          onStopMonitoring={stopWebSocketMonitoring}
          onConfigure={configureWebSocket}
          getWebSocketState={(id) => websocketConfigs[id]}
          userId={user?.id}
        />

        {showAddEditModal && (
          <AddEditWebSocketModal
            onClose={() => {
              setShowAddEditModal(false);
              setEditingConfig(null);
            }}
            onSave={handleSaveWebSocket}
            initialData={editingConfig}
            userId={user.id}
          />
        )}
      </main>
    </div>
  );
};

export default WebSocketManagementScreen;