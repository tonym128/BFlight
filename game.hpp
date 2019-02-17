#ifndef _GAME_H
#define _GAME_H
// #define FPS // Define this to show the FPS for the game

#include "gameCommon.hpp"
#include "bsideFly.hpp"
#include "driveGame.hpp"
#include "rotoZoomer.hpp"
#include "mazeRunner.hpp"
#include "plasma.hpp"

#ifdef _WIN32
#elif __linux
#include <ncurses.h>
#else
#include <brzo_i2c.h>
#include "SSD1306Brzo.h"
#include <ESP8266WiFi.h>
#include "FS.h"

// Audio
#include "AudioFileSourceSPIFFS.h"
#include "AudioFileSourceID3.h"
#include "AudioGeneratorMP3.h"
#include "AudioOutputI2SNoDAC.h"

#endif

void gameInit();
void gameSetup();
void gameLoop();

#endif
