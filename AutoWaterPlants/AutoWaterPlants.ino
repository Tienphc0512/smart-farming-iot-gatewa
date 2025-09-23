#include <SoftwareSerial.h>
#include <DHT.h>

#define TX_PIN D7
#define RX_PIN D6
#define DHTPIN D4
#define DHTTYPE DHT11

#define RELAY_PIN D2
#define SOIL_PIN A0
#define SOIL_DRY_THRESHOLD 750

SoftwareSerial bluetooth(RX_PIN, TX_PIN);
DHT dht(DHTPIN, DHTTYPE);

String data = "";
bool autoMode = false;
unsigned long lastWaterTime = 0;
unsigned long wateringDuration = 5000;
bool isWatering = false;

void setup() {
  Serial.begin(9600);
  bluetooth.begin(38400);
  dht.begin();
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  Serial.println("Bluetooth đã sẵn sàng. Nhấn 2 để đọc cảm biến, 3 auto ON, 4 auto OFF, 5 tưới thủ công.");
  Serial.println("Căn chỉnh giá trị cảm biến đất (SOIL_DRY_THRESHOLD) để phù hợp với cây của bạn.");
}

void loop() {
  // Nhận lệnh từ Bluetooth
  if (bluetooth.available()) {
    char c = bluetooth.read();
    Serial.print("Lệnh nhận: ");
    Serial.println(c);
    switch (c) {
      case '2':
        data = "read";
        break;
      case '3':
        autoMode = true;
        bluetooth.println("Auto mode ON");
        break;
      case '4':
        autoMode = false;
        digitalWrite(RELAY_PIN, LOW);
        isWatering = false;
        bluetooth.println("Auto mode OFF");
        break;
      case '5':
        data = "manual_water";
        break;
      default:
        bluetooth.println("Lệnh không hợp lệ.");
        break;
    }
  }

  // Đọc cảm biến
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int soil = analogRead(SOIL_PIN);
  Serial.print("Độ ẩm đất: ");
  Serial.println(soil);

  // Gửi dữ liệu nếu có yêu cầu đọc
  if (data == "read") {
    if (isnan(t) || isnan(h)) {
      bluetooth.println("Không đọc được cảm biến DHT!");
    } else {
      String result = "Nhiet do: " + String(t, 2) + "ºC | Do am: " + String(h, 2) + "% | Do am dat: " + String(soil);
      bluetooth.println(result);
    }
    data = "";
  }

  // Tưới thủ công
  if (data == "manual_water") {
    bluetooth.println("Bắt đầu tưới thủ công trong 5s...");
    digitalWrite(RELAY_PIN, HIGH);
    delay(wateringDuration);
    digitalWrite(RELAY_PIN, LOW);
    bluetooth.println("Tưới thủ công hoàn tất.");
    data = "";
  }

  // Chế độ tự động
  if (autoMode) {
    bool soilDry = soil > SOIL_DRY_THRESHOLD;

    if (soilDry && !isWatering) {
      isWatering = true;
      lastWaterTime = millis();

      bluetooth.println("Đất khô! Bắt đầu tưới...");
      bluetooth.print("Độ ẩm đất hiện tại: ");
      bluetooth.println(soil);

      digitalWrite(RELAY_PIN, HIGH);
    }

    // Kết thúc tưới sau wateringDuration
    if (isWatering && millis() - lastWaterTime >= wateringDuration) {
      digitalWrite(RELAY_PIN, LOW);
      isWatering = false;
      bluetooth.println("Tưới auto hoàn tất.");
    }
  }
}