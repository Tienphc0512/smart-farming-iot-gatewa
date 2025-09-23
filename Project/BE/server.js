const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const cron = require('node-cron');
const mqtt = require('mqtt');

const DB_HOST = 'mysql';
const DB_PORT = 3306; // Mặc định MySQL port
const DB_USER = 'root';
const DB_PASS = '123456';
const DB_NAME = 'cntt3';
const MQTT_BROKER = 'mqtt://broker.emqx.io';
const SENSOR_TOPIC = 'farm/sensor/data';
const CONTROL_TOPIC = 'farm/manual/control';


const app = express();
app.use(cors());
app.use(express.json());


const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});
const waitForDbReady = async () => {
  let connected = false;
  while (!connected) {
    try {
      await pool.query('SELECT 1');
      connected = true;
      console.log('MySQL đã sẵn sàng');
    } catch (err) {
      console.log('Chờ MySQL sẵn sàng...');
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

// MQTT Client
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', async  () => {
  console.log('MQTT connected');
  try {
    await waitForDbReady(); // đợi MySQL ổn trước khi sub
    client.subscribe(SENSOR_TOPIC);
    console.log('Đã subscribe topic sensor');
  } catch (err) {
    console.error('Lỗi khi chờ DB:', err.message);
  }
});

client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    let { temperature, humidity, soil_moisture } = data;

    // Xử lý giá trị null nếu không có dữ liệu
    temperature = temperature !== undefined ? temperature : null;
    humidity = humidity !== undefined ? humidity : null;
    soil_moisture = soil_moisture !== undefined ? soil_moisture : null;

    await pool.execute(
      'INSERT INTO sensor_data (temperature, humidity, soil_moisture) VALUES (?, ?, ?)',
      [temperature, humidity, soil_moisture]
    );

    console.log('Đã lưu sensor:', { temperature, humidity, soil_moisture });
  } catch (err) {
    console.error('MQTT Error:', err.message);
  }
});

// Kiểm tra lịch tưới mỗi phút bằng setInterval
setInterval(async () => {
  const now = new Date();
  // Tạo đối tượng thời gian theo múi giờ Việt Nam
const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
const hour = vietnamTime.getHours();
const minute = vietnamTime.getMinutes();
const second = vietnamTime.getSeconds();
  console.log(`[Interval] Kiểm tra lịch tưới lúc ${hour}:${minute}:${second}`);

  try {
    const [rows] = await pool.query(`
      SELECT * FROM schedules WHERE hour = ? AND minute = ? AND second = ?
    `, [hour, minute, second]);

    if (rows.length > 0) {
      console.log(` Tưới nước theo lịch lúc ${hour}:${minute}:${second}`);

     client.publish(CONTROL_TOPIC, '5');


    } else {
      console.log(`[Interval] Không có lịch phù hợp.`);
    }
  } catch (err) {
    console.error('Lỗi trong kiểm tra lịch:', err.message);
  }
}, 1000); 


// thêm lịch tứi
app.post('/api/schedule', async (req, res) => {
  const { hour, minute, second } = req.body;
  await pool.execute('INSERT INTO schedules (hour, minute, second) VALUES (?, ?, ?)', [hour, minute, second]);
  res.json({ message: 'Đã lưu lịch tưới' });
});

app.get('/api/schedule', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM schedules ORDER BY id DESC');
  res.json(rows);
});


app.delete('/api/schedule/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM schedules WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lịch không tồn tại' });
    }

    res.json({ message: 'Đã xóa lịch thành công' });
  } catch (error) {
    console.error('Lỗi xóa lịch:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/settings', async (req, res) => {
  const { action } = req.body;
  try {
    if (['3', '4', '5'].includes(action)) {
      client.publish(CONTROL_TOPIC, JSON.stringify({ action }));
      console.log('Đã gửi lệnh xuống Gateway:', action);

      res.json({ message: 'Đã xử lý xong lệnh', action });
    } else {
      res.status(400).json({ message: 'Lệnh không hợp lệ' });
    }
  } catch (err) {
    console.error('Lỗi xử lý settings:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.listen(5556, '0.0.0.0', () => {
  console.log('Server đang chạy tại http://10.106.45.81:5556'); 
});
