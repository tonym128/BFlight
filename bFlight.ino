/* LCD */
#ifdef _WIN32
#else
#include <brzo_i2c.h>
#include "SSD1306Brzo.h"
#include "gameCommon.hpp"
#include "bsideFly.hpp"
#include "driveGame.hpp"
#include "rotoZoomer.hpp"
#include <ESP8266WiFi.h>
#include "FS.h"

SSD1306Brzo display(0x3c, 5, 2);

/* Shift In  */
const int pinShcp = 15; //Clock
const int pinStcp = 0; //Latch
const int pinDataIn = 16; // Data

ScreenBuff screenBuff;
byte buttonVals;


#ifdef _WIN32
bool processWinKey(int key) {
	if (GetAsyncKeyState(key) & 0x8000) return true;
	return false;
}

byte getReadShift() {
	byte buttonVals = 0;
	if (processWinKey(VK_LEFT))  buttonVals = buttonVals | (1 << P1_Left);
	if (processWinKey(VK_UP))    buttonVals = buttonVals | (1 << P1_Top);
	if (processWinKey(VK_RIGHT)) buttonVals = buttonVals | (1 << P1_Right);
	if (processWinKey(VK_DOWN))  buttonVals = buttonVals | (1 << P1_Bottom);
	if (processWinKey('D'))      buttonVals = buttonVals | (1 << P2_Right);
	if (processWinKey('S'))      buttonVals = buttonVals | (1 << P2_Bottom);
	if (processWinKey('A'))      buttonVals = buttonVals | (1 << P2_Left);
	if (processWinKey('W'))      buttonVals = buttonVals | (1 << P2_Top);

	return buttonVals;
}
#else
byte getReadShift()
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
#endif

void sendToScreen() {
#ifdef _WIN32
#else
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
#endif
}

void startBFlight() {
 #ifdef _WIN32
 #else
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
#endif
}

void startRRush() {
#ifdef _WIN32
#else
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
#endif
}

int Game = 1;

void setup() {
#ifdef _WIN32
#else
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
#endif // _WIN32

  switch (Game) {
      case 1: startBFlight();
      break;
      case 2: startRRush();
      break;
  }
}

void loop() {
  // put your main code here, to run repeatedly:
  buttonVals = getReadShift();
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
