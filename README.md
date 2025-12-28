<img width="1511" height="365" alt="image" src="https://github.com/user-attachments/assets/d45c73b0-7167-4152-96a8-034853ba1890" /># 🌱 Smart Farming IoT Gateway  
**Hệ thống tưới cây thông minh IoT – Theo dõi & điều khiển thời gian thực**

---

## 📌 Giới thiệu

Dự án **Smart Farming IoT Gateway** là một hệ thống IoT hoàn chỉnh dùng để **giám sát môi trường trồng cây và tưới nước tự động**, bao gồm:

- Thiết bị **Arduino/ESP** đọc cảm biến
- **IoT Gateway (Node.js)** giao tiếp Serial & MQTT
- **Backend API** xử lý dữ liệu
- **Frontend Mobile App (React Native – Expo)** hiển thị realtime
- Đóng gói **Backend + Frontend bằng Docker Compose**
- Giao tiếp **MQTT realtime**

Hệ thống cho phép **tưới cây tự động khi độ ẩm đất vượt ngưỡng**, đồng thời hỗ trợ **điều khiển thủ công từ xa**.

---

## 🎯 Mục tiêu dự án

- Xây dựng hệ thống IoT end-to-end
- Ứng dụng MQTT cho truyền dữ liệu realtime
- Tự động hóa việc tưới cây thông minh
- Giám sát môi trường theo thời gian thực
- Dễ dàng mở rộng & triển khai bằng Docker

---

## 🏗️ Kiến trúc tổng thể
```
[ Arduino + Sensor ]
|
Serial / Bluetooth
|
[ IoT Gateway (Node.js) ]
|
MQTT
|
┌─────────────────┐
│ MQTT Broker │ (EMQX)
└─────────────────┘
|
┌─────────────────┐
│ Backend API │ (Node.js)
└─────────────────┘
|
┌─────────────────┐
│ Frontend App │ (React Native - Expo)
└─────────────────┘

```
---

## ⚙️ Chức năng chính

### 🌡️ Thu thập dữ liệu cảm biến
- Nhiệt độ không khí (°C)
- Độ ẩm không khí (%)
- Độ ẩm đất (analog value)

### 🚿 Tưới cây tự động
- So sánh độ ẩm đất với ngưỡng cấu hình
- Tự động bật relay để tưới
- Tự động tắt sau thời gian xác định

### 🎮 Điều khiển thủ công
- Bật / tắt chế độ Auto
- Tưới nước thủ công
- Điều khiển từ app thông qua MQTT

### 📡 Theo dõi realtime
- Dữ liệu được gửi lên MQTT mỗi 3 giây
- App mobile hiển thị realtime & biểu đồ

---

## 🔌 Phần cứng sử dụng

| Thiết bị | Mô tả |
|--------|------|
| Arduino / ESP8266 | Vi điều khiển |
| DHT11 | Cảm biến nhiệt độ & độ ẩm |
| Soil Moisture Sensor | Cảm biến độ ẩm đất |
| Relay | Điều khiển bơm nước |
| Water Pump | Bơm tưới |
| Bluetooth HC-05 | Giao tiếp |

---

## 🧠 Logic tưới tự động

```bash
if (soil > SOIL_DRY_THRESHOLD) {
    bật relay;
    đợi 5 giây;
    tắt relay;
}
```
* Ngưỡng SOIL_DRY_THRESHOLD có thể điều chỉnh

* Tránh tưới liên tục bằng timer

## MQTT Configuration
* Thành phần
  1. Broker : `mqtt://broker.emqx.io`
  2. Sensor Topic: `farm/sensor/data`
  3. Control Topic: `farm/manual/control`
 
* Payload dữ liệu cảm biến
```bash
{
  "temperature": 28.5,
  "humidity": 70,
  "soil_moisture": 820
}
```
* Lệnh điều khiển
  `3` : `Bật chế độ Auto` - Auto canh nếu vượt tới ngưỡng đã đặt thì sẽ tự động tưới cây trong vòng số thời gian đã đặt ra
  `4` : `Tắt chế độ Auto`
  `5` : `Tưới nước thủ công`

## Arduino Firmware

* Chức năng:

  1. Đọc cảm biến DHT11 & Soil
  
  2. Nhận lệnh Bluetooth
  
  3. Điều khiển relay
  
  4. Hỗ trợ Auto / Manual watering

## IoT Gateway (Node.js)

* Chức năng:

  1. Kết nối Serial với Arduino
  
  2. Định kỳ gửi lệnh đọc cảm biến
  
  3. Parse dữ liệu từ Arduino
  
  4. Publish dữ liệu lên MQTT
  
  5. Subscribe lệnh điều khiển từ MQTT
  
  6.  Forward lệnh điều khiển xuống Arduino
 
## Backend API

* Công nghệ:

  1. Node.js
  
  2. Express
  
  3. MQTT
  
  4. MySQL (mở rộng lưu lịch sử)
  
  5. Node-cron (tự động hóa)

## Frontend Mobile App

* Công nghệ:

  1. React Native
  
  2. Expo
  
  3. MQTT
  
  4. Chart (hiển thị biểu đồ realtime)
     
* Chức năng:

  1. Hiển thị nhiệt độ, độ ẩm, độ ẩm đất
  
  2. Biểu đồ realtime
  
  3. Nút điều khiển Auto / Manual
     
  4. Giao tiếp MQTT trực tiếp
 
## Docker & Docker Compose

Dự án hỗ trợ đóng gói:

* Backend API

* Frontend App

### Chạy toàn bộ hệ thống
```bash 
docker compose up -d
```
## Hướng dẫn chạy dự án
1️⃣ Arduino

* Upload arduino.ino

* Kết nối đúng cảm biến & relay

2️⃣ IoT Gateway
```bash
cd gateway
npm install
node index.js
```

3️⃣ Backend
```bash 
cd backend
npm install
npm start
```

4️⃣ Frontend
```bash
cd frontend
npm install
expo start
```

📊 Kết quả đạt được

  1. Tưới cây tự động thông minh
  
  2. Điều khiển từ xa qua MQTT
  
  3. Theo dõi dữ liệu realtime
  
  4. Hệ thống IoT hoàn chỉnh
  
  5. Dễ mở rộng & triển khai

👨‍💻 Tác giả

 * Me - Tienphc0512

 * Dự án IoT – Smart Farming
