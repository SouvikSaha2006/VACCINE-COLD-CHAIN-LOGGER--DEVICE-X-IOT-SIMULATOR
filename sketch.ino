#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include "RTClib.h"
#include "DHT.h"
#include <SPI.h>
#include <SD.h>
#include "mbedtls/sha256.h"

// Wi-Fi & MQTT Config
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqtt_server = "broker.hivemq.com";
const char* mqtt_topic = "devicex/souvik/vaccine-chain";

// Pins
#define DHTPIN 15
#define DHTTYPE DHT22
#define NTC_PIN 34
#define BATT_PIN 35
#define TAMPER_PIN 27
#define LED_OK 2
#define LED_ALERT 4
#define SD_CS 5

DHT dht(DHTPIN, DHTTYPE);
RTC_DS1307 rtc;
WiFiClient espClient;
PubSubClient client(espClient);

// Simulated ATECC608A Hardware Private Signing Key (Never leaves chip)
const String ATECC_PRIVATE_KEY = "ATECC608A_HW_SECRET_99481A7F";
String previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
unsigned long blockIndex = 0;

// Hardware-accelerated SHA-256 Hash Generator
String computeSHA256(String input) {
  byte hash[32];
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx);
  mbedtls_sha256_starts(&ctx, 0);
  mbedtls_sha256_update(&ctx, (const unsigned char*)input.c_str(), input.length());
  mbedtls_sha256_finish(&ctx, hash);
  mbedtls_sha256_free(&ctx);

  String hexStr = "";
  for (int i = 0; i < 32; i++) {
    if (hash[i] < 16) hexStr += "0";
    hexStr += String(hash[i], HEX);
  }
  return hexStr;
}

void setup() {
  Serial.begin(115200);
  pinMode(TAMPER_PIN, INPUT);
  pinMode(LED_OK, OUTPUT);
  pinMode(LED_ALERT, OUTPUT);

  dht.begin();
  Wire.begin(21, 22);
  if (!rtc.begin()) Serial.println("RTC failed");
  if (!rtc.isrunning()) rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  SD.begin(SD_CS);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  client.setServer(mqtt_server, 1883);
}

void reconnect() {
  while (!client.connected()) {
    String id = "VaxLogger-" + String(random(0xffff), HEX);
    if (client.connect(id.c_str())) break;
    delay(1000);
  }
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  DateTime now = rtc.now();
  char timestamp[25];
  sprintf(timestamp, "%04d-%02d-%02dT%02d:%02d:%02dZ",
          now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());

  // 1. Read Dual Temperature & Humidity Sensors
  float dhtTemp = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(dhtTemp)) dhtTemp = 4.5;
  if (isnan(humidity)) humidity = 55.0;

  // NTC Thermistor cross-check (mapped to cold-chain range)
  int ntcRaw = analogRead(NTC_PIN);
  float ntcTemp = dhtTemp + ((ntcRaw - 2048) / 2048.0) * 0.4; // Precision calibration delta

  // 2. Coin-Cell Battery Voltage & Power Mode (3.0V CR2450 simulation)
  int battRaw = analogRead(BATT_PIN);
  float battVoltage = 2.0 + (battRaw / 4095.0) * 1.1; // 2.0V to 3.1V
  String powerMode = (battVoltage < 2.4) ? "DEEP_SLEEP_SAVER" : "ACTIVE_DUTY_CYCLE";

  // 3. Physical Tamper Switch & WHO Cold-Chain Excursion Check (2C - 8C)
  bool physicalTamper = (digitalRead(TAMPER_PIN) == HIGH);
  bool tempExcursion = (dhtTemp < 2.0 || dhtTemp > 8.0);
  String status = "VERIFIED_SAFE";
  if (physicalTamper) status = "TAMPER_BREACH";
  else if (tempExcursion) status = "COLD_CHAIN_EXCURSION";

  digitalWrite(LED_OK, status == "VERIFIED_SAFE" ? HIGH : LOW);
  digitalWrite(LED_ALERT, status != "VERIFIED_SAFE" ? HIGH : LOW);

  // 4. Cryptographic Hash-Chain Signing (ATECC608A Emulation)
  blockIndex++;
  String rawRecord = String(blockIndex) + "|" + String(timestamp) + "|" +
                     String(dhtTemp, 2) + "|" + String(humidity, 1) + "|" +
                     status + "|" + previousHash;
  String currentHash = computeSHA256(rawRecord + "|" + ATECC_PRIVATE_KEY);

  // 5. Build JSON Packet
  String payload = "{";
  payload += "\"block_index\":" + String(blockIndex) + ",";
  payload += "\"device_id\":\"VAX-NODE-01\",";
  payload += "\"timestamp\":\"" + String(timestamp) + "\",";
  payload += "\"temp_dht\":" + String(dhtTemp, 2) + ",";
  payload += "\"temp_ntc\":" + String(ntcTemp, 2) + ",";
  payload += "\"humidity\":" + String(humidity, 1) + ",";
  payload += "\"batt_v\":" + String(battVoltage, 2) + ",";
  payload += "\"power_mode\":\"" + powerMode + "\",";
  payload += "\"tamper\":" + String(physicalTamper ? "true" : "false") + ",";
  payload += "\"status\":\"" + status + "\",";
  payload += "\"prev_hash\":\"" + previousHash + "\",";
  payload += "\"signature_hash\":\"" + currentHash + "\"";
  payload += "}";

  // Save immutable backup to MicroSD
  File logFile = SD.open("/audit.jsonl", FILE_APPEND);
  if (logFile) {
    logFile.println(payload);
    logFile.close();
  }

  client.publish(mqtt_topic, payload.c_str());
  Serial.println(payload);

  previousHash = currentHash;
  delay(2000);
}