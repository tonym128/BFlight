#ifndef _GAME_H
#define _GAME_H

#include "gameCommon.hpp"
#include "bsideFly.hpp"
#include "driveGame.hpp"
#include "rotoZoomer.hpp"
#include "mazeRunner.hpp"

#ifdef _WIN32
#elif __linux
#include <ncurses.h>
#else
#include <brzo_i2c.h>
#include "SSD1306Brzo.h"
#include <ESP8266WiFi.h>
#include "FS.h"
#endif

void gameSetup();
void gameLoop();

#endif
