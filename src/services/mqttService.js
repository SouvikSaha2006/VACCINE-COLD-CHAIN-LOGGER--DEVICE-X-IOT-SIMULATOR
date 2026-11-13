import mqtt from 'mqtt';

const DEFAULT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
export const DEFAULT_TOPIC = 'devicex/souvik/vaccine-chain';

class MqttService {
  constructor() {
    this.client = null;
    this.status = 'DISCONNECTED'; // CONNECTING, CONNECTED, DISCONNECTED, ERROR
    this.lastError = null;
    this.listeners = {
      status: new Set(),
      message: new Set(),
    };
  }

  connect(brokerUrl = DEFAULT_BROKER_URL, topic = DEFAULT_TOPIC) {
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {
        console.error('Error ending existing client:', e);
      }
    }

    this.setStatus('CONNECTING');
    this.lastError = null;

    const clientId = `vaxguard_portal_${Math.random().toString(16).substring(2, 10)}`;

    try {
      this.client = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 4000,
      });

      this.client.on('connect', () => {
        this.setStatus('CONNECTED');
        this.client.subscribe(topic, { qos: 0 }, (err) => {
          if (err) {
            console.error(`Failed to subscribe to ${topic}:`, err);
            this.lastError = err.message;
          } else {
            console.log(`Subscribed to MQTT topic: ${topic}`);
          }
        });
      });

      this.client.on('message', (receivedTopic, messageBuffer) => {
        const payloadStr = messageBuffer.toString();
        try {
          const parsed = JSON.parse(payloadStr);
          this.emitMessage({
            topic: receivedTopic,
            data: parsed,
            raw: payloadStr,
            receivedAt: new Date().toISOString(),
          });
        } catch (jsonErr) {
          // If message is plain text or partial
          console.warn('Received non-JSON MQTT payload:', payloadStr);
          this.emitMessage({
            topic: receivedTopic,
            data: { rawText: payloadStr },
            raw: payloadStr,
            receivedAt: new Date().toISOString(),
          });
        }
      });

      this.client.on('error', (err) => {
        console.error('MQTT client error:', err);
        this.lastError = err.message || 'Connection error';
        this.setStatus('ERROR');
      });

      this.client.on('close', () => {
        if (this.status !== 'CONNECTING') {
          this.setStatus('DISCONNECTED');
        }
      });

      this.client.on('offline', () => {
        this.setStatus('DISCONNECTED');
      });
    } catch (err) {
      console.error('Failed to initialize MQTT connection:', err);
      this.lastError = err.message;
      this.setStatus('ERROR');
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    this.setStatus('DISCONNECTED');
  }

  publish(topic, payload) {
    if (!this.client || this.status !== 'CONNECTED') {
      console.warn('Cannot publish: MQTT client is not connected');
      return false;
    }
    const messageStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.client.publish(topic, messageStr, { qos: 0 }, (err) => {
      if (err) {
        console.error('Publish error:', err);
      }
    });
    return true;
  }

  setStatus(status) {
    this.status = status;
    this.listeners.status.forEach((cb) => cb(status, this.lastError));
  }

  emitMessage(msg) {
    this.listeners.message.forEach((cb) => cb(msg));
  }

  onStatusChange(cb) {
    this.listeners.status.add(cb);
    // Immediately invoke with current state
    cb(this.status, this.lastError);
    return () => this.listeners.status.delete(cb);
  }

  onMessage(cb) {
    this.listeners.message.add(cb);
    return () => this.listeners.message.delete(cb);
  }
}

export const mqttService = new MqttService();
