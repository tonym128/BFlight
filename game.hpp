#ifndef _GAME_H
#define _GAME_H
#define FPS // Define this to show the FPS for the game

#include "gameCommon.hpp"
#include "bsideFly.hpp"
#include "driveGame.hpp"
#include "rotoZoomer.hpp"
#include "mazeRunner.hpp"
#include "plasma.hpp"

void gameInit();
void gameSetup();
void gameLoop();

#endif
