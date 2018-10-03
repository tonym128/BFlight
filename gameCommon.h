#pragma once
#ifndef GAMECOMMON_H
#define GAMECOMMON_H

#ifdef _WIN32
#include <iostream>
#include <chrono>
#include <thread>
#include <ctime>
#include <Windows.h>
#include <cwchar>
#else
#include <Arduino.h>  // for type definitions
#include "SSD1306.h" // Screen Library
#include "images.h"
#endif

#ifndef MYFONT_H_
#include "myfont.h"
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

// Draw methods
void drawObject(ScreenBuff*, Dimensions, const bool*);
void drawObject(ScreenBuff*, Dimensions, bool*, bool = true);
void drawBlock(ScreenBuff*, Dimensions, bool);
void drawCharacter(ScreenBuff*, char, int, int, bool = true);
void drawString(ScreenBuff*, char*, int, int, bool = true);

#endif // !GAMECOMMON_H
