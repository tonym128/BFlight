/* LCD */
#include <brzo_i2c.h>
#include "SSD1306Brzo.h"
#include "gameCommon.h"
#include "bsideFly.h"
#include "driveGame.h"
#include "rotoZoomer.h"
#include <ESP8266WiFi.h>
#include "FS.h"

SSD1306Brzo display(0x3c, 5, 2);

/* Shift In  */
const int pinShcp = 15; //Clock
const int pinStcp = 0; //Latch
const int pinDataIn = 16; // Data

ScreenBuff screenBuff;
byte buttonVals;

byte readShift()
{
  int inputPin = 1;
  int buttonPressedVal = 1; //Depending on how buttons are wired
  digitalWrite(pinStcp, LOW);
  delayMicroseconds(20);
  digitalWrite(pinStcp, HIGH);

  byte buttonVals = 0;
  for (int i=0; i<8; i++)
  {
    digitalWrite(pinShcp,LOW);
    delayMicroseconds(20);
    inputPin = digitalRead(pinDataIn);
    if(inputPin == buttonPressedVal)
     {
      Serial.println("[.] Button " + String(i) + " pressed!");
      buttonVals = buttonVals | (1 << i);
     }
    
    digitalWrite(pinShcp,HIGH);
  }

  return buttonVals;
}

void sendToScreen() {
  display.setColor(BLACK);
  display.clear();
  int x = 0;
  int y = 0;
  
  display.setColor(WHITE);
  for (int i = 0; i < screenBuff.WIDTH * screenBuff.HEIGHT; i++) {
    if (screenBuff.consoleBuffer[i]) {
      int x = i % screenBuff.WIDTH;
      int y = i / screenBuff.WIDTH;
      display.setPixel(x,y);
    }
  }

  display.display();
}

void startBFlight() {
  File f;
  f = SPIFFS.open("/bFSLogo.XBM", "r");

  if (f) {
    int s = f.size();
    Serial.printf("File Opened , Size=%d\r\n", s);

    String data = f.readString();
    //Serial.println(data);
    f.close();

    const char* data1 = data.c_str();
    display.drawXbm(0, 0, 128, 64, (uint8_t *)data1);
    display.display();
    delay(2000);
  }
}

void startRRush() {
  File f;
  f = SPIFFS.open("/RoadRushLogo.XBM", "r");

  if (f) {
    int s = f.size();
    Serial.printf("File Opened , Size=%d\r\n", s);

    String data = f.readString();
    //Serial.println(data);
    f.close();

    const char* data1 = data.c_str();
    display.drawXbm(0, 0, 128, 64, (uint8_t *)data1);
    display.display();
    delay(2000);
  }
}

int Game = 1;

void setup() {
  /* shift in */
  pinMode(pinStcp, OUTPUT);
  pinMode(pinShcp, OUTPUT);
  pinMode(pinDataIn, INPUT);
  
  /* shift out */
  pinMode(latchPin, OUTPUT);
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);

  // Startup SPIFFS Storage
  SPIFFS.begin();
  
  // put your setup code here, to run once:
  Serial.begin(74880);
  display.init();
  display.displayOn();
  display.flipScreenVertically();
  switch (Game) {
      case 1: startBFlight();
      break;
      case 2: startRRush();
      break;
  }
}

void loop() {
  // put your main code here, to run repeatedly:
  buttonVals = readShift();
  switch (Game) {
    case 1: 
      driveGameLoop(&screenBuff,buttonVals);
      break;
    case 2: 
      flyGameLoop(&screenBuff,buttonVals);
      break;
    case 3: 
      rotoZoomerLoop(&screenBuff,buttonVals);
      break;
  }

  sendToScreen();
}
