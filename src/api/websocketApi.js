const WS_EVENTS = {
  CONFIG: 'config',
  CONFIG_RESPONSE: 'config_response',
  CAPTURE_REQUEST: 'capture_request',
  CAPTURE_RESPONSE: 'capture_response',
  START_MONITORING: 'start_monitoring',
  STOP_MONITORING: 'stop_monitoring',
  MONITORING_STATUS: 'monitoring_status',
  ERROR: 'error',
};

class WebsocketService {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.connectionId = null;
    this.eventListeners = {};
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        this.isConnected = true;
        this._dispatchEvent('connected', {});
        resolve();
      };

      this.websocket.onclose = () => {
        this.isConnected = false;
        this.connectionId = null;
        this._dispatchEvent('disconnected', {});
      };

      this.websocket.onerror = (error) => {
        this._dispatchEvent('error', { error });
        reject(error);
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    });
  }

  disconnect() {
    if (this.websocket && this.isConnected) {
      this.websocket.close();
    }
  }

  configureMonitoring(stationId, userId, intervalMinutes = 5) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const responseHandler = (data) => {
        if (data.success) {
          this.connectionId = data.connection_id;
          resolve(data);
        } else {
          reject(new Error('Configuration failed'));
        }
        this.removeEventListener(WS_EVENTS.CONFIG_RESPONSE, responseHandler);
      };

      this.addEventListener(WS_EVENTS.CONFIG_RESPONSE, responseHandler);

      const message = {
        type: WS_EVENTS.CONFIG,
        station_id: stationId,
        user_id: userId,
        interval_minutes: intervalMinutes,
      };

      this.sendMessage(message);
    });
  }

  startMonitoring() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const responseHandler = (data) => {
        if (data.status === 'started') {
          resolve(data);
        } else {
          reject(new Error('Failed to start monitoring'));
        }
        this.removeEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);
      };

      this.addEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);

      const message = {
        type: WS_EVENTS.START_MONITORING,
      };

      this.sendMessage(message);
    });
  }

  stopMonitoring() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const responseHandler = (data) => {
        if (data.status === 'stopped') {
          resolve(data);
        } else {
          reject(new Error('Failed to stop monitoring'));
        }
        this.removeEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);
      };

      this.addEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);

      const message = {
        type: WS_EVENTS.STOP_MONITORING,
      };

      this.sendMessage(message);
    });
  }

  sendCaptureResponse(imageId, imageUrl, requestId, stationId) {
    if (!this.isConnected) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    const message = {
      type: WS_EVENTS.CAPTURE_RESPONSE,
      image_id: imageId,
      image_url: imageUrl,
      request_id: requestId,
      station_id: stationId,
    };

    return this.sendMessage(message);
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      try {
        this.websocket.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  _handleMessage(data) {
    const eventType = data.type;
    this._dispatchEvent(eventType, data);
  }

  _dispatchEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }
}

export const websocketService = new WebsocketService();
export { WS_EVENTS };
