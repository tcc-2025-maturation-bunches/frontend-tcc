import React from 'react';
import WebSocketListItem from './WebSocketListItem';
import Card from '../common/Card';

const WebSocketList = ({
  configs,
  onEdit,
  onRemove,
  onConnect,
  onDisconnect,
  onConfigure,
  onStartMonitoring,
  onStopMonitoring,
  getWebSocketState,
  userId
}) => {
  if (!configs || configs.length === 0) {
    return (
      <Card className="text-center"> {/* */}
        <p className="py-8 text-gray-500 dark:text-gray-400">
          Nenhuma configuração de WebSocket encontrada. Adicione uma para começar.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {configs.map((config) => (
        <WebSocketListItem
          key={config.id}
          config={config}
          onEdit={onEdit}
          onRemove={onRemove}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onConfigure={onConfigure}
          onStartMonitoring={onStartMonitoring}
          onStopMonitoring={onStopMonitoring}
          getWebSocketState={getWebSocketState}
          userId={userId}
        />
      ))}
    </div>
  );
};

export default WebSocketList;