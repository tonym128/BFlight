#ifndef BSIDEFLY_H
#define BSIDEFLY_H

#include "myfont.h"
#include <stdlib.h>
#include <time.h>
#include <Arduino.h>  // for type definitions
#include "SSD1306.h" // Screen Library
#include "images.h"

static unsigned long currTime = 0;
static unsigned long lastDebounceTime = 0;
static unsigned long debounceDelay = 150;

/* Shift Out ( 74HC595 ) */
const int latchPin = 12; //Pin connected to latch pin (ST_CP) of 74HC595
const int clockPin = 14; //Pin connected to clock pin (SH_CP) of 74HC595
const int dataPin = 13; //Pin connected to Data in (DS) of 74HC595

// Screen Buffer
struct ScreenBuff {
  static const int WIDTH = 128;
  static const int HEIGHT = 64;
  static const int MAXPIXEL = WIDTH * HEIGHT;
  bool consoleBuffer[HEIGHT * WIDTH];
};

struct Dimensions {
  int x;
  int y;
  int width;
  int height;
};

struct Star {
  Dimensions dim;
  int velocity = 0;
  int colour = 0;
  int spawnDelay = 0;
  bool collider = false;
};

struct Player1Keys {
  bool up = false;
  bool down = false;
  bool right = false;
  bool left = false;
  bool kick = false;
  bool punch = false;
  bool jump = false;
};

struct Player {
  Dimensions dim;
  int animation = 0;
  int frame = 0;
  bool inPlay = true;
};

struct GameState {
  static const int STARCOUNT = 10;
  static const int STARTYPES = 3;
  static const int STARMAXSPAWNDELAY = 300;
  static const int STARMINVELOCITY = 20;

  bool win = false;

  static const int DISTANCE_TARGET = 2000;
  int frameCounter = 0;
  int backGroundColour = 0;

  Star stars[STARCOUNT];
  bool starField = 0;
  bool collision = 0;

  Player1Keys p1keys;
  Player player1;

  bool running = true;
  bool restart = false;
};

  // Draw Player
  const static bool player[192] = {
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0,
    1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0
  };

  // Star field
     // 30 x 11
    const static bool star30x11[330] = { 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 
    0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0
      };
    
      // 20 x 6
    const static bool star20x6[120] = { 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 
    0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 
    0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 
    };
      
      // 10 x 4
    const static bool star10x4[40] = { 
    0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
    1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 
    0, 1, 1, 1, 1, 1, 1, 1, 0, 0
    };

void resetGameState(ScreenBuff*);
void updateFly(GameState*, ScreenBuff*);
void displayFly(GameState*, ScreenBuff*);
void processInputFly(GameState*);
void flyGameLoop(ScreenBuff* ,byte);
void flyGameSetup(ScreenBuff*);

#endif
