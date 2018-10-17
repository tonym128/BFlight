#ifndef GAMECOMMON_H
#define GAMECOMMON_H

#ifdef _WIN32
#include <iostream>
#include <chrono>
#include <thread>
#include <ctime>
#include <Windows.h>
#include <cwchar>
#include <stdint.h>
#elif __linux
#include <iostream>
#include <chrono>
#include <thread>
#include <ctime>
#include <cwchar>
#include <stdint.h>
#include <string.h>
#include <math.h>

//typedef uint32_t DWORD;   // DWORD = unsigned 32 bit value
//typedef uint16_t WORD;    // WORD = unsigned 16 bit value
typedef uint8_t byte;     // BYTE = unsigned 8 bit value
#else
#include <Arduino.h>  // for type definitions
#include "SSD1306.h" // Screen Library
#include "images.h"
#endif

#ifndef MYFONT_H_
#include "myfont.hpp"
#endif

#include <stdlib.h>
#include <time.h>

#define PI 3.14159265

// Screen Buffer

struct ScreenBuff {
	static const int WIDTH = 128;
	static const int HEIGHT = 64;
	static const int MAXPIXEL = WIDTH * HEIGHT;
	bool consoleBuffer[HEIGHT * WIDTH];
};

// Object dimensions
struct Dimensions {
	int x;
	int y;
	int width;
	int height;
};

// Button definitions
const int P1_Left = 0;
const int P1_Right = 2;
const int P1_Top = 1;
const int P1_Bottom = 3;

const int P2_Left = 6;
const int P2_Right = 4;
const int P2_Top = 7;
const int P2_Bottom = 5;

// Input
bool processKey(byte, int);

// Collision Detection
bool rectCollisionCheck(Dimensions, Dimensions);
bool maskCollisionCheck(Dimensions, Dimensions, const bool*, const bool*);

// Display helpers
void displayClear(ScreenBuff*, int, bool);
void displayNoise(ScreenBuff*, int);
void displayInvert(ScreenBuff*);
void displayNoise(ScreenBuff*, Dimensions dim, int);

// Draw methods
void drawObject(ScreenBuff*, Dimensions, const bool*);
void drawObject(ScreenBuff*, Dimensions, bool*, bool = true);
void drawObjectFill(ScreenBuff*, Dimensions, const bool*, bool);
void drawObjectWavy(ScreenBuff*, Dimensions, int, int, int, int, bool, const bool*);
bool* rotateObject(Dimensions, double, double, const bool*);

void drawBlock(ScreenBuff*, Dimensions, bool);
void drawCharacter(ScreenBuff*, char, int, int, bool = true);
void drawString(ScreenBuff*, char*, int, int, bool = true);

#endif // !GAMECOMMON_H
