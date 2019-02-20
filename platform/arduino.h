#include <brzo_i2c.h>
#include "SSD1306Brzo.h"
#include <ESP8266WiFi.h>
#include "FS.h"

// Audio
#ifdef AUDIO
#include "AudioFileSourceSPIFFS.h"
#include "AudioGeneratorWAV.h"
#include "AudioOutputI2SNoDAC.h"

#endif //AUDIO

SSD1306Brzo display(0x3c, D1, D4);

/* Shift In  */
const int pinShcp = 15;   //Clock
const int pinStcp = 0;    //Latch
const int pinDataIn = 16; // Data

#ifdef AUDIO
AudioGeneratorWAV *wav;
AudioFileSourceSPIFFS *file;
AudioOutputI2S *out;
#endif

int inputVal = 0;
bool readAnalogSensor(int pin)
{
  digitalWrite(pin, HIGH);

  inputVal = analogRead(A0);

  digitalWrite(pin, LOW);
  return inputVal > 20;
}

byte getReadShiftAnalog()
{
  byte buttonVals = 0;
  if (readAnalogSensor(D6))
  {
    Serial.println("[.] Button Left pressed!");
    buttonVals = buttonVals | (1 << P1_Left);
  }
  if (readAnalogSensor(D8))
  {
    Serial.println("[.] Button Up pressed!");
    buttonVals = buttonVals | (1 << P1_Top);
  }
  if (readAnalogSensor(D5))
  {
    Serial.println("[.] Button Right pressed!");
    buttonVals = buttonVals | (1 << P1_Right);
  }
  if (readAnalogSensor(D7))
  {
    Serial.println("[.] Button Down pressed!");
    buttonVals = buttonVals | (1 << P1_Bottom);
  }
  /*
    if (readAnalogSensor(D5))
      buttonVals = buttonVals | (1 << P2_Left);
    if (readAnalogSensor(D6))
      buttonVals = buttonVals | (1 << P2_Top);
    if (readAnalogSensor(D7))
      buttonVals = buttonVals | (1 << P2_Right);
    if (readAnalogSensor(D8))
      buttonVals = buttonVals | (1 << P2_Bottom);
  */

  return buttonVals;
}

byte getReadShiftDigital()
{
  int inputPin = 1;
  int buttonPressedVal = 1; //Depending on how buttons are wired
  digitalWrite(pinStcp, LOW);
  delayMicroseconds(20);
  digitalWrite(pinStcp, HIGH);

  byte buttonVals = 0;
  for (int i = 0; i < 8; i++)
  {
    digitalWrite(pinShcp, LOW);
    delayMicroseconds(20);
    inputPin = digitalRead(pinDataIn);
    if (inputPin == buttonPressedVal)
    {
      buttonVals = buttonVals | (1 << i);
    }

    digitalWrite(pinShcp, HIGH);
  }

  return buttonVals;
}

byte getReadShift()
{
#ifdef ANALOG
    return getReadShiftAnalog();
#else
  return getReadShiftDigital();
#endif
}

void sendToScreen()
{
  display.setColor(BLACK);
  display.clear();
  int x = 0;
  int y = 0;

  display.setColor(WHITE);
  for (int i = 0; i < screenBuff.WIDTH * screenBuff.HEIGHT; i++)
  {
    if (screenBuff.consoleBuffer[i])
    {
      int x = i % screenBuff.WIDTH;
      int y = i / screenBuff.WIDTH;
      display.setPixel(x, y);
    }
  }

  display.display();
}

void gameInit()
{
  /* shift in */
#ifdef ANALOG
    pinMode(D5, OUTPUT);
    pinMode(D6, OUTPUT);
    pinMode(D7, OUTPUT);
    pinMode(D8, OUTPUT);
    digitalWrite(D5, LOW);
    digitalWrite(D6, LOW);
    digitalWrite(D7, LOW);
    digitalWrite(D8, LOW);
#else 
    pinMode(pinStcp, OUTPUT);
    pinMode(pinShcp, OUTPUT);
    pinMode(pinDataIn, INPUT);

    /* shift out */
    pinMode(latchPin, OUTPUT);
    pinMode(dataPin, OUTPUT);
    pinMode(clockPin, OUTPUT);
#endif

  // Startup SPIFFS Storage
  SPIFFS.begin();

  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println("Startup");

#ifdef AUDIO
  file = new AudioFileSourceSPIFFS("/carStart.wav");
  out = new AudioOutputI2SNoDAC();
  wav = new AudioGeneratorWAV();
  wav->begin(file, out);
#endif

  display.init();
  display.displayOn();
  display.flipScreenVertically();
}
