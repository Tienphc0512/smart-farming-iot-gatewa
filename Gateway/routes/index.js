const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const mqtt = require('mqtt');
const router = express.Router();

// MQTT config
const MQTT_BROKER = 'mqtt://broker.emqx.io';
const SENSOR_TOPIC = 'farm/sensor/data';
const CONTROL_TOPIC = 'farm/manual/control';

const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log(' Kết nối MQTT thành công');

  mqttClient.subscribe(CONTROL_TOPIC, err => {
    if (err) {
      console.error(' Lỗi đăng ký topic:', err.message);
    } else {
      console.log(`Đang lắng nghe topic: ${CONTROL_TOPIC}`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  if (topic === CONTROL_TOPIC) {
    const action = message.toString().trim();
    const validActions = {
      '3': 'Bật chế độ Auto',
      '4': 'Tắt chế độ Auto',
      '5': 'Tưới thủ công'
    };

    if (!Object.keys(validActions).includes(action)) {
      console.log('Lệnh không hợp lệ:', action);
      return;
    }

    serial.write(`${action}\n`, err => {
      if (err) {
        console.error('Lỗi gửi lệnh tới Arduino:', err.message);
      } else {
        console.log(`MQTT → Arduino: ${action} (${validActions[action]})`);
      }
    });
  }
});


// Serial config
const serial = new SerialPort({
  path: 'COM5',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
}, err => {
  if (err) console.log("Serial error:", err.message);
  else console.log(" Serial OK");
});

const parser = serial.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Đọc và gửi dữ liệu cảm biến lên MQTT mỗi 3 giây
serial.on("open", () => {
  console.log("-- Serial connection opened --");
  setInterval(() => {
    serial.write("2\n", err => {
      if (err) console.error("Lỗi gửi lệnh đọc:", err.message);
    });
  }, 3000);
});

parser.on("data", async function (raw) {
  const cleaned = raw.toLowerCase().trim();
  const parts = cleaned.split("|");

  const payload = {};
  if (parts.length === 3) {
    try {
      payload.temperature = parseFloat(parts[0].split(":")[1].trim());
      payload.humidity = parseFloat(parts[1].split(":")[1].trim());
      payload.soil_moisture = parseInt(parts[2].split(":")[1].trim());

      if (!isNaN(payload.temperature) && !isNaN(payload.humidity) && !isNaN(payload.soil_moisture)) {
        console.log("Dữ liệu cảm biến:", payload);

        try {
          mqttClient.publish(SENSOR_TOPIC, JSON.stringify(payload));
          console.log("Đã gửi dữ liệu cảm biến lên MQTT");
        } catch (err) {
          console.error("Lỗi gửi MQTT:", err.message);
        }
      } else {
        console.log(" Dữ liệu sai kiểu:", payload);
      }
    } catch (e) {
      console.log(" Lỗi parse:", e.message);
    }
  } else {
    console.log("Dữ liệu không đúng định dạng:", cleaned);
  }
});

module.exports = router;
