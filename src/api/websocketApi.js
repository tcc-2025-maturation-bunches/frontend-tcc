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
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      try {
        this.websocket = new WebSocket(url);
        
        this.websocket.onopen = () => {
          console.log('WebSocket connected to:', url);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this._dispatchEvent('connected', {});
          resolve();
        };

        this.websocket.onclose = (event) => {
          console.log('WebSocket closed:', event);
          this.isConnected = false;
          this.connectionId = null;
          this._dispatchEvent('disconnected', { code: event.code, reason: event.reason });
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect(url);
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this._dispatchEvent('error', { error: error.message || 'WebSocket connection error' });
          reject(error);
        };

        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            this._handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            this._dispatchEvent('error', { error: 'Failed to parse message' });
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.websocket && this.isConnected) {
      this.reconnectAttempts = this.maxReconnectAttempts;
      this.websocket.close(1000, 'Disconnected by user');
    }
  }

  configureMonitoring(stationId, userId, intervalMinutes = 5) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        this.removeEventListener(WS_EVENTS.CONFIG_RESPONSE, responseHandler);
        reject(new Error('Configuration timeout'));
      }, 10000);

      const responseHandler = (data) => {
        clearTimeout(timeout);
        if (data.success) {
          this.connectionId = data.connection_id;
          console.log('WebSocket configured with connection ID:', this.connectionId);
          resolve(data);
        } else {
          reject(new Error(data.error || 'Configuration failed'));
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

      console.log('Sending configuration:', message);
      this.sendMessage(message);
    });
  }

  startMonitoring() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        this.removeEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);
        reject(new Error('Start monitoring timeout'));
      }, 10000);

      const responseHandler = (data) => {
        clearTimeout(timeout);
        if (data.status === 'started') {
          resolve(data);
        } else {
          reject(new Error(data.error || 'Failed to start monitoring'));
        }
        this.removeEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);
      };

      this.addEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);

      const message = {
        type: WS_EVENTS.START_MONITORING,
      };

      console.log('Starting monitoring...');
      this.sendMessage(message);
    });
  }

  stopMonitoring() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        this.removeEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);
        reject(new Error('Stop monitoring timeout'));
      }, 10000);

      const responseHandler = (data) => {
        clearTimeout(timeout);
        if (data.status === 'stopped') {
          resolve(data);
        } else {
          reject(new Error(data.error || 'Failed to stop monitoring'));
        }
        this.removeEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);
      };

      this.addEventListener(WS_EVENTS.MONITORING_STATUS, responseHandler);

      const message = {
        type: WS_EVENTS.STOP_MONITORING,
      };

      console.log('Stopping monitoring...');
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

    console.log('Sending capture response:', message);
    return this.sendMessage(message);
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.websocket) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      try {
        this.websocket.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
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

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      connectionId: this.connectionId,
      readyState: this.websocket ? this.websocket.readyState : WebSocket.CLOSED
    };
  }
}

export { WebsocketService, WS_EVENTS };