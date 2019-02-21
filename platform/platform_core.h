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

long getTimeInMillis();
void gameSleep(int);

static long frameTime = getTimeInMillis();
static long startTime = getTimeInMillis();
static long currentTime = getTimeInMillis();
static long fpsTimer1 = getTimeInMillis();
static long fpsTimer2 = getTimeInMillis();
