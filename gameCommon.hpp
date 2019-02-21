#ifndef GAMECOMMON_H
#define GAMECOMMON_H 1

#ifdef _MSC_VER
#define _CRT_SECURE_NO_WARNINGS
#endif

#include "platform_core.h"
#include "fixpoint.h"

#include <stdlib.h>
#include <time.h>
#include <vector>

#ifndef MYFONT_H_
#include "myfont.hpp"
#endif

#ifndef STARTUPLOGOS_H_
#include "startupLogos.hpp"
#endif

#include <stdlib.h>
#include <time.h>

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
void rotateObject(Dimensions, double, double, const bool*, bool*);
void reverseObject(Dimensions, const bool*, bool*);
void invertObject(Dimensions, const bool*, bool*);
void flipObject(Dimensions, const bool*, bool*);
void copyObject(Dimensions, const bool*, bool*);

bool drawScroller(ScreenBuff*, int, char[9][17]);
void drawVertLine(ScreenBuff*, int, int, int, bool, int = 0);
void drawBlock(ScreenBuff*, Dimensions, bool);
void drawMoire(ScreenBuff*, Dimensions, bool);
void drawCharacter(ScreenBuff*, char, int, int, bool = true);
void drawString(ScreenBuff*, char*, int, int, bool = true);

void getCurrentFPS();
void calcFPS();
void drawFPS(ScreenBuff*);

void setCurrentTime();
void initTime();
void updateMinTime(int);
bool checkTime(int);
int getElapsedSeconds();

#endif // !GAMECOMMON_H
