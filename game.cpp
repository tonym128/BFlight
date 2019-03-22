#define FPS 1
#define ANALOG 1
// #define AUDIO 1

#include "game.hpp"
ScreenBuff screenBuff;
byte buttonVals;
int Game = 1;

#ifdef __EMSCRIPTEN__
#include "platform/plat_emscripten.h"
#elif SDL2_FOUND
#include "platform/sdl.h"
#elif _WIN32
#include "platform/win32.h"
#elif __linux
#include "platform/linux.h"
#elif ARDUINO
#include "platform/arduino.h"
#endif

void showLogo(const bool logo[])
{
  Dimensions dim;
  dim.height = logo_height;
  dim.width = logo_width;
  dim.x = 0;
  dim.y = 0;

  drawObject(&screenBuff, dim, logo);
  initTime();
  sendToScreen();
  updateMinTime(2000);
}

void audioSetup()
{
  audioInit();
  char sound[] = "data/startup.wav";
  audioPlay(sound);
}

void gameSetup()
{
  switch (Game)
  {
  case 1:
    showLogo(logo_fly);
    break;
  case 2:
    showLogo(logo_drive);
    break;
  case 3:
    showLogo(logo_maze);
    mazeRunnerInit();
    break;
  case 4:
    rotoZoomerInit();
    break;
  case 5:
    break;
  case 6:
    voxelInit();
    break;
  }
}

void gameLoop()
{
  audioLoop();

  // put your main code here, to run repeatedly:
  buttonVals = getReadShift();

  switch (Game)
  {
  case 1:
    if (flyGameLoop(&screenBuff, buttonVals))
    {
      Game = 2;
      gameSetup();
    }
    break;
  case 2:
    if (driveGameLoop(&screenBuff, buttonVals))
    {
      Game = 5;
      gameSetup();
    }
    break;
  case 3:
    if (mazeRunnerLoop(&screenBuff, buttonVals))
    {
      Game = 4;
      gameSetup();
    }
    break;
  case 4:
    rotoZoomerLoop(&screenBuff, buttonVals);
    break;
  case 5:
    if (plasmaLoop(&screenBuff, buttonVals))
    {
      Game = 3;
      gameSetup();
    }

    break;
  case 6:
    if (voxelLoop(&screenBuff, buttonVals)) {

    }
    break;
  }

  calcFPS();
#ifdef FPS // Define this to show the FPS for the game
  drawFPS(&screenBuff);
#endif

  sendToScreen();
  updateMinTime(33);
}
