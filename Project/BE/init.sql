CREATE TABLE sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  temperature FLOAT,
  humidity FLOAT,
  soil_moisture INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO sensor_data (temperature, humidity, soil_moisture) VALUES (28.5, 65.2, 720);

CREATE TABLE schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hour INT,
  minute INT,
  second INT
);



