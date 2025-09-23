import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});

const clientId = 'rn_' + Math.floor(Math.random() * 100000);
const client = new Paho.MQTT.Client('broker.emqx.io', 8083, '/mqtt', clientId);

const connectMqtt = (onMessage) => {
  client.connect({
    onSuccess: () => {
      console.log('MQTT connected');
      client.subscribe('farm/sensor/data');
    },
    useSSL: false,
    timeout: 5,
    onFailure: (e) => console.log('MQTT connect failed', e.message),
  });

  client.onMessageArrived = onMessage;
};

const sendMqttCommand = (code) => {
  const msg = new Paho.MQTT.Message(code);
  msg.destinationName = 'farm/manual/control';
  client.send(msg);
};

export { client, connectMqtt, sendMqttCommand };
