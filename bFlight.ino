/* LCD */

#include "bsideFly.h"
#include <ESP8266WiFi.h>

SSD1306  display(0x3c, 5, 2);

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
  display.drawXbm(0, 0, bFlightStartupLogo_width, bFlightStartupLogo_height, bFlightStartupLogo_bits);
  display.display();
  delay(2000);
}

void setup() {
  /* shift in */
  pinMode(pinStcp, OUTPUT);
  pinMode(pinShcp, OUTPUT);
  pinMode(pinDataIn, INPUT);
  
  /* shift out */
  pinMode(latchPin, OUTPUT);
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  
  // put your setup code here, to run once:
  display.setFont(ArialMT_Plain_16);
  Serial.begin(74880);
  display.init();
  display.displayOn();
  display.flipScreenVertically();

  startBFlight();
}

void loop() {
  // put your main code here, to run repeatedly:
  buttonVals = readShift();
  flyGameLoop(&screenBuff,buttonVals);
  sendToScreen();
}
