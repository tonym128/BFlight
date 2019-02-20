#ifndef GAMECOMMON_H
#define GAMECOMMON_H

#ifdef _MSC_VER
#define _CRT_SECURE_NO_WARNINGS
#endif

#ifdef _WIN32
#include <iostream>
#include <chrono>
#include <thread>
#include <ctime>
#include <Windows.h>
#include <cwchar>
#include <stdint.h>
#include <math.h> // Added for GCC
#define localtime_r(_Time, _Tm) localtime_s(_Tm, _Time)
#elif __EMSCRIPTEN__
#include <iostream>
#include <chrono>
#include <thread>
#include <ctime>
#include <cwchar>
#include <stdint.h>
#include <string.h>
#include <math.h>
typedef int byte;
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
#elif ARDUINO
#include <Arduino.h>  // for type definitions
#include "SSD1306.h" // Screen Library
#endif

#include <vector>

#define PI 3.14159265

// Fixed Point Math Helpers
#define FP_SHIFT 16     // shifts to produce a fixed-point number
#define FP_SCALE 65536  // scaling factor
typedef int32_t FIXPOINT;
#define INT_TO_FIXP(n) (FIXPOINT(((n) << FP_SHIFT)))
#define FIXP_TO_INT(n) (int((n >> FP_SHIFT)))
#define FLOAT_TO_FIXP(n) (FIXPOINT((float)n * FP_SCALE))
#define FIXP_TO_FLOAT(n) (float((float)n / FP_SCALE))
#define FIXP_INT_PART(n) (n >> FP_SHIFT)
#define FIXP_FIXP_INT_PART(n) (n & 0xffff0000)
#define FIXP_DEC_PART(n) (n & 0x0000ffff)
#define FIXP_MULT(n,n2) ((((int64_t)(n)) * n2) >> FP_SHIFT)
#define FIXP_DIV(n,n2) (int32_t(((((int64_t)(n)) << FP_SHIFT) / n2)))
#define FIXEDPT_PI FLOAT_TO_FIXP(PI)
#define FIXEDPT_HALF_PI FLOAT_TO_FIXP(PI/2)

/* Returns the sine of the given fixedpt number. 
 * Note: the loss of precision is extraordinary! */
static inline FIXPOINT
FIXPOINT_SIN(FIXPOINT fp)
{
	int sign = 1;
	FIXPOINT sqr, result;
	const FIXPOINT SK[2] = {
		FLOAT_TO_FIXP(7.61e-03),
		FLOAT_TO_FIXP(1.6605e-01)
	};

	fp %= 2 * FIXEDPT_PI;
	if (fp < 0)
		fp = FIXEDPT_PI * 2 + fp;
	if ((fp > FIXEDPT_HALF_PI) && (fp <= FIXEDPT_PI)) 
		fp = FIXEDPT_PI - fp;
	else if ((fp > FIXEDPT_PI) && (fp <= (FIXEDPT_PI + FIXEDPT_HALF_PI))) {
		fp = fp - FIXEDPT_PI;
		sign = -1;
	} else if (fp > (FIXEDPT_PI + FIXEDPT_HALF_PI)) {
		fp = (FIXEDPT_PI << 1) - fp;
		sign = -1;
	}
	sqr = FIXP_MULT(fp, fp);
	result = SK[0];
	result = FIXP_MULT(result, sqr);
	result -= SK[1];
	result = FIXP_MULT(result, sqr);
	result += INT_TO_FIXP(1);
	result = FIXP_MULT(result, fp);
	return sign * result;
}

/* Returns the cosine of the given fixedpt number */
static inline FIXPOINT
FIXPOINT_COS(FIXPOINT A)
{
	return (FIXPOINT_SIN(FIXEDPT_HALF_PI - A));
}


/* Returns the tangens of the given fixedpt number */
static inline FIXPOINT
FIXPOINT_TAN(FIXPOINT A)
{
	return FIXP_DIV(FIXPOINT_SIN(A), FIXPOINT_COS(A));
}

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

#ifdef __EMSCRIPTEN__
  static time_t frameTime = time(nullptr);
  static time_t startTime = time(nullptr);
  static time_t currentTime = time(nullptr);

  static time_t fpsTimer1 = time(nullptr);
  static time_t fpsTimer2 = time(nullptr);
#elif _WIN32
	static long long frameTime = 0;
	static long long startTime = 0;
	static long long currentTime = 0;

	static long long fpsTimer1 = 0;
	static long long fpsTimer2 = 0;
#elif __linux
  static time_t frameTime = time(nullptr);
  static time_t startTime = time(nullptr);
  static time_t currentTime = time(nullptr);

  static time_t fpsTimer1 = time(nullptr);
  static time_t fpsTimer2 = time(nullptr);
#elif ARDUINO
	static int frameTime = millis();
	static int startTime = millis();
	static int currentTime = millis();

	static int fpsTimer1 = millis();
	static int fpsTimer2 = millis();
#endif

#endif // !GAMECOMMON_H
