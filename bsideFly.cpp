#include "bsideFly.h"

GameState gameState;

bool maskCollisionCheck(Dimensions rect1, Dimensions rect2, const bool* object1, const bool* object2) {
  for (int x1 = rect1.x; x1 < rect1.x + rect1.width; x1++)
    for (int x2 = rect2.x; x2 < rect2.x + rect2.width; x2++)
      if (x2 == x1)
        for (int y1 = rect1.y; y1 < rect1.y + rect1.height; y1++)
          for (int y2 = rect2.y; y2 < rect2.y + rect2.height; y2++)
            if (y2 == y1) {
              int y1Loc = (y1 - rect1.y) * rect1.width;
              int y2Loc = (y2 - rect2.y) * rect2.width;
              if (1 == object1[x1 - rect1.x + y1Loc] && object1[x1 - rect1.x + y1Loc] == object2[x2 - rect2.x + y2Loc]) {
                return true;
              }
            }
  return false;
}

bool rectCollisionCheck(Dimensions rect1, Dimensions rect2) {
  if (rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y) {
    return true;
  }
  return false;
}

const int P1_Left = 0;
const int P1_Right = 2;
const int P1_Top = 1;
const int P1_Bottom = 3;

const int P2_Left = 6;
const int P2_Right = 4;
const int P2_Top = 7;
const int P2_Bottom = 5;


bool processKey(byte buttonVals, int key) {
  return buttonVals & (1 << key);
}

void processInputFly(GameState* gameState, byte buttonVals) {
  gameState->p1keys.up = processKey(buttonVals, P1_Top);
  gameState->p1keys.down = processKey(buttonVals, P1_Bottom);
  gameState->p1keys.left = processKey(buttonVals, P1_Left);
  gameState->p1keys.right = processKey(buttonVals, P1_Right);
  gameState->p1keys.kick = processKey(buttonVals, P2_Left);
  gameState->p1keys.punch = processKey(buttonVals, P2_Right);
  gameState->p1keys.jump = processKey(buttonVals, P2_Bottom);

  // This is only monitoring for a keypress on false
  if (processKey(buttonVals, P2_Top)) {
    gameState->running = false;
    gameState->restart = true;
  }
}

void initStar(GameState* gameState, ScreenBuff* screenBuff, Star* star, bool allowX = false) {
  int x = screenBuff->HEIGHT + 1;
  while (x > screenBuff->HEIGHT) x = 1 + rand() % screenBuff->HEIGHT;
  star->dim.y = x;

  if (allowX) {
    x = screenBuff->WIDTH + 1;
    while (x > screenBuff->WIDTH) x = 1 + rand() % screenBuff->WIDTH;
    star->dim.x = x;
  }
  else star->dim.x = screenBuff->WIDTH - 1;

  x = gameState->starMinVelocity + 1;
  while (x > gameState->starMinVelocity) x = 1 + rand() % gameState->starMinVelocity;
  star->velocity = x;

  x = gameState->STARTYPES + 1;
  while (x > gameState->STARTYPES) x = 1 + rand() % gameState->STARTYPES;
  switch (x) {
  case 1:
    star->dim.width = 30;
    star->dim.height = 11;
    break;
  case 2:
    star->dim.width = 20;
    star->dim.height = 6;
    break;
  case 3:
    star->dim.width = 10;
    star->dim.height = 4;
    break;
  }

  star->collider = true;

  x = gameState->STARMAXSPAWNDELAY + 1;
  while (x > gameState->STARMAXSPAWNDELAY) x = 1 + rand() % gameState->STARMAXSPAWNDELAY;
  star->spawnDelay = x;
}

void updateStar(GameState* gameState, ScreenBuff* screenBuff, Star* star) {
  if (star->velocity == 0) initStar(gameState, screenBuff, star);

  if (star->spawnDelay > 0) {
    star->spawnDelay -= 1;
  }
  else if (gameState->frameCounter % star->velocity == 0) {
    star->dim.x -= 1;
    if (star->dim.x + star->dim.width == 0) initStar(gameState, screenBuff, star);
  }
}

void updateFly(GameState* gameState, ScreenBuff* screenBuff) {
  if (gameState->restart) {
    resetGameState(screenBuff);
    gameState->level = 1;
    gameState->scene = 3;
    gameState->lastscene = 0;
    gameState->running = true;
    gameState->restart = false;
    gameState->player1.inPlay = true;
    gameState->collision = false;
    gameState->frameCounter = 0;
    return;
  }

  // Screen Logic
  if (!gameState->player1.inPlay || !gameState->running) return;

  gameState->frameCounter += 1;

  gameState->collision = false;

  // StarField
  if (gameState->starField = true) {
    for (int i = 0; i < gameState->starCount; i++) {
      updateStar(gameState, screenBuff, &gameState->stars[i]);
      if (!gameState->collision && gameState->stars[i].collider) {
        const bool* star;
        if (rectCollisionCheck(gameState->player1.dim, gameState->stars[i].dim)) {
          if (gameState->stars[i].dim.width == 30)
            star = star30x11;
          else if (gameState->stars[i].dim.width == 20)
            star = star20x6;
          else // (gameState->stars[i].dim.width == 10)
            star = star10x4;
          
          if (maskCollisionCheck(gameState->player1.dim, gameState->stars[i].dim, player, star)) {
            gameState->collision = true;
            break; // Only single collision needed / supported
          }
        }
      }
    }
  }

  int completion = (gameState->frameCounter * 100 / gameState->distanceTarget) / 25;

  if (gameState->collision) {
    if (gameState->player1.dim.y + gameState->player1.dim.height >= screenBuff->HEIGHT) {
      gameState->player1.inPlay = false;
      gameState->win = false;
    }
  }

  if (completion == 4) {
    gameState->player1.inPlay = false;
    gameState->win = true;
    gameState->level += 1;
    gameState->scene = 4;
  }

  // Player movement
  if (gameState->collision) {
    gameState->player1.dim.y += 1;
    gameState->player1.dim.x += 1;
    if (gameState->player1.dim.y >= screenBuff->HEIGHT) {
      gameState->player1.inPlay = false;
      gameState->win = false;
    }
  }
  else {
    if (gameState->p1keys.down) { gameState->player1.dim.y += 1; }
    if (gameState->p1keys.up) { gameState->player1.dim.y -= 1; }
    if (gameState->p1keys.left) { gameState->player1.dim.x -= 1; }
    if (gameState->p1keys.right) { gameState->player1.dim.x += 1; }
  }

  // Clamp
  if (gameState->player1.dim.x + gameState->player1.dim.width > screenBuff->WIDTH) gameState->player1.dim.x = screenBuff->WIDTH - gameState->player1.dim.width;
  if (gameState->player1.dim.y + gameState->player1.dim.height > screenBuff->HEIGHT) gameState->player1.dim.y = screenBuff->HEIGHT - gameState->player1.dim.height;
  if (gameState->player1.dim.x < 0) gameState->player1.dim.x = 0;
  if (gameState->player1.dim.y < 0) gameState->player1.dim.y = 0;
  // Punch, kick, jump
}

void displayClear(ScreenBuff* screenBuff, int frameMod, bool colour) {
  for (int y = 0; y < screenBuff->HEIGHT; ++y)
    for (int x = 0; x < screenBuff->WIDTH; ++x)
      screenBuff->consoleBuffer[x + screenBuff->WIDTH * y] = colour;
}

void displayInvert(ScreenBuff* screenBuff)
{
  int pixel = 0;
  for (int y = 0; y < screenBuff->HEIGHT; ++y)
    for (int x = 0; x < screenBuff->WIDTH; ++x) {
      pixel = x + screenBuff->WIDTH * y;
      screenBuff->consoleBuffer[pixel] = !screenBuff->consoleBuffer[pixel];
    }
}

void displayNoise(ScreenBuff* screenBuff, int amountInverse = 0) {
  for (int y = 0; y < screenBuff->HEIGHT; ++y)
    for (int x = 0; x < screenBuff->WIDTH; ++x)
      if (amountInverse == 0 || x * y % amountInverse == 0) {
        screenBuff->consoleBuffer[x + screenBuff->WIDTH * y] = rand() % 2;
      }
}

void drawObject(ScreenBuff* screenBuff, Dimensions dim, const bool* objectArray) {
  int counter = 0;
  for (int j = dim.y; j < dim.y + dim.height; j++) {
    int dimXmod = dim.x <= 0 ? 1 : dim.x;
    int firstLine = (dimXmod + screenBuff->WIDTH * j) / screenBuff->WIDTH;
    for (int i = dim.x; i < dim.x + dim.width; i++) {
      int pixel = i + screenBuff->WIDTH * j;
      if (objectArray[counter] && pixel >= 0 && pixel < screenBuff->MAXPIXEL && firstLine == pixel / screenBuff->WIDTH) {
        screenBuff->consoleBuffer[pixel] = 1;
      }
      counter++;
    }
  }
}

void drawObject(ScreenBuff* screenBuff, Dimensions dim, bool* objectArray, bool backFill = true) {
  int counter = 0;
  for (int j = dim.y; j < dim.y + dim.height; j++) {
    int dimXmod = dim.x <= 0 ? 1 : dim.x;
    int firstLine = (dimXmod + screenBuff->WIDTH * j) / screenBuff->WIDTH;
    for (int i = dim.x; i < dim.x + dim.width; i++) {
      int pixel = i + screenBuff->WIDTH * j;
      if (objectArray[counter] && pixel >= 0 && pixel < screenBuff->MAXPIXEL && firstLine == pixel / screenBuff->WIDTH) {
        screenBuff->consoleBuffer[pixel] = 1;
      }
      else if (backFill) {
        screenBuff->consoleBuffer[pixel] = 0;
      }

      counter++;
    }
  }
}

void drawCharacter(ScreenBuff* screenBuff, char charPos, int x, int y, bool backFill = true) {
  bool* character = font(charPos);
  Dimensions dim;
  dim.x = x;
  dim.y = y;
  dim.width = 8;
  dim.height = 8;

  drawObject(screenBuff, dim, character, backFill);
  free(character);
}

void drawString(ScreenBuff* screenBuff, char* scrollText, int x, int y, bool backFill = true) {
  for (int i = 0; i < static_cast<int>(strlen(scrollText)); i++) {
    drawCharacter(screenBuff, scrollText[i], x + 8 * i, y, backFill);
  }
}

void drawBlock(ScreenBuff* screenBuff, Dimensions dim, bool colour) {
  for (int j = dim.y; j <= dim.y + dim.height; j++) {
    int firstLine = (dim.x + screenBuff->WIDTH * j) / screenBuff->WIDTH;
    for (int i = dim.x; i <= dim.x + dim.width; i++) {
      int pixel = i + screenBuff->WIDTH * j;
      if (pixel >= 0 && pixel < screenBuff->MAXPIXEL && firstLine == pixel / screenBuff->WIDTH) {
        screenBuff->consoleBuffer[pixel] = colour;
      }
    }
  }
}

static bool haloCheck(ScreenBuff* screenBuff, const bool* Object, int pixelObject, int pixelScreen) {
  if (
    pixelScreen < screenBuff->MAXPIXEL && pixelScreen > 0 &&
    ((pixelObject > 0 && pixelObject < sizeof(pixelObject) && !Object[pixelObject]) || (pixelObject < 0 || pixelObject > sizeof(pixelObject)))
    )
  {
    screenBuff->consoleBuffer[pixelScreen] = 0;
  }

  return false;
}

void drawHalo(ScreenBuff* screenBuff, Dimensions dim, const bool* Object) {
  // TODO WIP
  int startPixel = dim.x + dim.y * screenBuff->WIDTH;
  for (int i = -1 + dim.x; i <= dim.width + 1; i++) {
    for (int j = -1 + dim.y; j <= dim.height + 1; j++) {
      int pixelScreen = i + screenBuff->WIDTH * j;
      int pixelObject = i + dim.width * j;

      if (Object[pixelObject] == 1 && pixelScreen >= 0 && pixelScreen < screenBuff->MAXPIXEL) {
        int leftObject = pixelObject - 1;
        int rightObject = pixelObject + 1;
        int upObject = pixelObject - dim.width;
        int downObject = pixelObject + dim.width;
        int upleftObject = upObject - 1;
        int uprightObject = upObject + 1;
        int downleftObject = downObject - 1;
        int downrightObject = downObject + 1;

        int leftScreen = pixelScreen - 1;
        int rightScreen = pixelScreen + 1;
        int upScreen = pixelScreen - screenBuff->WIDTH;
        int downScreen = pixelScreen + screenBuff->WIDTH;
        int upleftScreen = upScreen - 1;
        int uprightScreen = upScreen + 1;
        int downleftScreen = downScreen - 1;
        int downrightScreen = downScreen + 1;

        haloCheck(screenBuff, Object, upleftObject, upleftScreen);
        haloCheck(screenBuff, Object, upObject, upScreen);
        haloCheck(screenBuff, Object, uprightObject, uprightScreen);
        haloCheck(screenBuff, Object, leftObject, leftScreen);
        haloCheck(screenBuff, Object, rightObject, rightScreen);
        haloCheck(screenBuff, Object, downObject, downScreen);
        haloCheck(screenBuff, Object, downleftObject, downleftScreen);
        haloCheck(screenBuff, Object, downrightObject, downrightScreen);
      }
    }
  }
}
bool updateScroller(GameState* gameState, ScreenBuff* screenBuff) {
  time_t currentFrameTime = time(nullptr);
  if (currentFrameTime - gameState->frameTimer <  50) {
    delay(50 - (currentFrameTime - gameState->frameTimer));
  }

  gameState->frameTimer = currentFrameTime;
  return true;
}

bool displayScroller(GameState* gameState, ScreenBuff* screenBuff) {
  gameState->frameCounter += 1;
  
  displayClear(screenBuff, 1, 0);

  bool writeString = true;
  int y = screenBuff->HEIGHT - gameState->frameCounter + 10;

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "The journey to";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "DefCon starts";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "with a single ";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "step.";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "Fly To Vegas";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "& Good Luck!";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (1 == 1) {
    char scroller[17] = " -= dFlight =- ";
    drawString(screenBuff, scroller, 0, 2, true);
  }

  if (y < -8) return false;
  return true;
}

bool updateOutroScroller(GameState* gameState, ScreenBuff* screenBuff) {
  time_t currentFrameTime = time(nullptr);
  if (currentFrameTime - gameState->frameTimer < 50) {
    delay(50 - (currentFrameTime - gameState->frameTimer));
  }

  gameState->frameTimer = currentFrameTime;
  return true;
}

bool displayOutroScroller(GameState* gameState, ScreenBuff* screenBuff) {
  gameState->frameCounter += 1;

  displayClear(screenBuff, 1, 0);

  bool writeString = true;
  int y = screenBuff->HEIGHT - gameState->frameCounter;

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = " -= Congrats =- ";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "----------------";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "Well done on";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "completing the";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "first leg of ";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "your journey.";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y > -8 || y < screenBuff->HEIGHT) {
    char scroller[17] = "Push forwards!";
    drawString(screenBuff, scroller, 0, y, false);
    y += 8;
  }

  if (y < -8) return false;
  return true;
}

bool flyin(GameState* gameState, ScreenBuff* screenBuff) {
  gameState->frameCounter += 1;

  // Fly up at an angle till it hits middle screen height, then back
  if (gameState->player1.dim.y == (screenBuff->HEIGHT - gameState->player1.dim.height) / 2) {
    if (gameState->player1.dim.x == 0) {
      // Done
      return false;
    }
    gameState->player1.dim.x -= 1;
    return true;
  }

  gameState->player1.dim.x += 1;
  gameState->player1.dim.y -= 1;

  return true;
}

bool flyout(GameState* gameState, ScreenBuff* screenBuff) {
  gameState->frameCounter += 1;

  // Fly out the screen down at an angle.
  if (gameState->player1.dim.y > screenBuff->HEIGHT) {
    return false;
  }

  gameState->player1.dim.x += 1;
  gameState->player1.dim.y += 1;

  return true;
}

void displayFly(GameState* gameState, ScreenBuff* screenBuff) {
  if (gameState->running == false) return;

  displayClear(screenBuff, 1, 0);
  drawObject(screenBuff, gameState->player1.dim, player);

  if (gameState->starField = true) {

    for (int i = 0; i < gameState->starCount; i++) {
      // drawBlock(screenBuff, gameState->stars[i].dim, 1);
      if (gameState->stars[i].dim.width == 30)
        drawObject(screenBuff, gameState->stars[i].dim, star30x11);
      else if (gameState->stars[i].dim.width == 20)
        drawObject(screenBuff, gameState->stars[i].dim, star20x6);
      else // (gameState->stars[i].dim.width == 10)
        drawObject(screenBuff, gameState->stars[i].dim, star10x4);
    }
  }

  if (gameState->scene == 6) {
    if (gameState->running && gameState->collision) {
      displayNoise(screenBuff, 9);
      displayInvert(screenBuff);
    }

    // Display Text
    char fps[16];
    int percent = gameState->frameCounter * 100 / gameState->distanceTarget;
    int drawline = (percent * screenBuff->WIDTH) / 100;

    // Draw Progress Bar
    for (int draw = 0; draw < drawline; draw++) {
      screenBuff->consoleBuffer[draw] = 1;
      screenBuff->consoleBuffer[draw + screenBuff->WIDTH] = 1;
      screenBuff->consoleBuffer[draw + screenBuff->WIDTH * 2] = 1;
    }

    if (!gameState->player1.inPlay) {
      if (gameState->win) {
        sprintf(fps, "YOU WIN!");
        for (int i = 0; i < static_cast<int>(strlen(fps)); i++) {
          drawCharacter(screenBuff, fps[i], 32 + 8 * i, 30);
          gameState->player1.inPlay = false;
          gameState->running = false;
        }
      }
      else {
        sprintf(fps, "GAME OVER");
        for (int i = 0; i < static_cast<int>(strlen(fps)); i++) {
          drawCharacter(screenBuff, fps[i], 32 + 8 * i, 30);
        }
        gameState->player1.inPlay = false;
        gameState->running = false;
      }
    }
  }
  if (gameState->scene == 3) {
    char fps[16];
    sprintf(fps, "Level %i",gameState->level);
    for (int i = 0; i < static_cast<int>(strlen(fps)); i++) {
      drawCharacter(screenBuff, fps[i], 40 + 8 * i, 10);
    }
    
    // Sliders
    int counter = 0;
    for (int i = gameState->frameCounter; i > 0; i--) {
      if (counter < screenBuff->WIDTH/2)
      {
        counter++;
        screenBuff->consoleBuffer[screenBuff->WIDTH * 5 + i] = 1;
        screenBuff->consoleBuffer[screenBuff->WIDTH * 20 - i] = 1;
      }
    }
  }
}

void resetGameState(ScreenBuff* screenBuff) {
  // Reset Random Seed
  time_t now = time(nullptr);
  std::srand((int)now); // use current time as seed for random generator

  // Reset Game Objects
  gameState.starField = true;
  gameState.player1.dim.height = 12;
  gameState.player1.dim.width = 16;
  gameState.player1.inPlay = true;
  gameState.player1.dim.x = 0;
  gameState.player1.dim.y = (screenBuff->HEIGHT - gameState.player1.dim.height) / 2;

  // Reset State
  gameState.frameCounter = 0;
  gameState.running = true;
  gameState.restart = false;
}

void flyGameLoop(ScreenBuff* screenBuff, byte buttonVals) {
  processInputFly(&gameState, buttonVals);

  switch (gameState.scene) {
  case 1: // Intro
    if (gameState.lastscene != gameState.scene) {
      gameState.lastscene = gameState.scene;
    }

    updateScroller(&gameState, screenBuff);
    if (!displayScroller(&gameState, screenBuff)) {
      gameState.scene = 3;
    }

    break;
  case 2:  // Outro
    if (gameState.lastscene != gameState.scene) {
      gameState.lastscene = gameState.scene;
    }
  
    updateOutroScroller(&gameState, screenBuff);
    if (!displayOutroScroller(&gameState, screenBuff)) {
      gameState.scene = 3;
    }

    break;
  case 3: // Take Off
    if (gameState.lastscene != gameState.scene) {
      gameState.starCount = 0;
      resetGameState(screenBuff);
      gameState.lastscene = gameState.scene;
      gameState.player1.dim.x = gameState.player1.dim.width * -1;
      gameState.player1.dim.y = screenBuff->HEIGHT + gameState.player1.dim.y;
    }

    if (!flyin(&gameState, screenBuff)) {
      gameState.scene = 6;
    }

    displayFly(&gameState, screenBuff);

    break;
  case 4: // Land
    if (gameState.lastscene != gameState.scene) {
      gameState.lastscene = gameState.scene;
    }

    if (!flyout(&gameState, screenBuff))
    {
      gameState.scene = 3;
    }

    displayFly(&gameState, screenBuff);
    break;
  case 5: // Crash
    if (gameState.lastscene != gameState.scene) {
      gameState.lastscene = gameState.scene;
    }
    break;
  case 6: // Stage
    if (gameState.lastscene != gameState.scene) {
      gameState.lastscene = gameState.scene;
      switch (gameState.level) {
      case 1: gameState.starCount = 5;
        gameState.starMinVelocity = 20;
        gameState.distanceTarget = 2000;
        free(gameState.stars);
        gameState.stars = new Star[gameState.starCount];
        for (int i = 0; i < gameState.starCount; i++) {
          initStar(&gameState, screenBuff, &gameState.stars[i]);
        }
        break;
      case 2: gameState.starCount = 10;
        gameState.starMinVelocity = 30;
        gameState.distanceTarget = 3000;
        free(gameState.stars);
        gameState.stars = new Star[gameState.starCount];
        for (int i = 0; i < gameState.starCount; i++) {
          initStar(&gameState, screenBuff, &gameState.stars[i]);
        }
        break;
      case 3: gameState.starCount = 20;
        gameState.starMinVelocity = 50;
        gameState.distanceTarget = 4000;
        free(gameState.stars);
        gameState.stars = new Star[gameState.starCount];
        for (int i = 0; i < gameState.starCount; i++) {
          initStar(&gameState, screenBuff, &gameState.stars[i]);
        }
        break;
      case 4:
        // Game has ended we switch to outro
        gameState.scene = 2;
        break;
      default:
        // Random logic for continuing if we wanted
        gameState.starCount = 10 * gameState.level;
        gameState.starMinVelocity = 20 + 10 * gameState.level;
        gameState.distanceTarget = 1000 * gameState.level;
        free(gameState.stars);
        gameState.stars = new Star[gameState.starCount];
        for (int i = 0; i < gameState.starCount; i++) {
          initStar(&gameState, screenBuff, &gameState.stars[i]);
        }
        break;
      }

      resetGameState(screenBuff);
    }

    updateFly(&gameState, screenBuff);
    displayFly(&gameState, screenBuff);
    break;
  }
}

