#include "bsideFly.h"

GameState gameState;

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

	x = gameState->STARMINVELOCITY + 1;
	while (x > gameState->STARMINVELOCITY) x = 1 + rand() % gameState->STARMINVELOCITY;
	star->velocity = x;

	x = 3 + 1;
	while (x > 3) x = 1 + rand() % 3;
	switch (x) {
	case 0: star->colour = 128 - 16; break;
	case 1: star->colour = 128; break;
	case 2: star->colour = 256; star->collider = true; break;
	case 3: star->colour = 256 - 16;  break;
	}
  
  star->collider = true;
  
	x = gameState->STARMAXSIZE + 1;
	while (x > gameState->STARMAXSIZE) x = 1 + rand() % gameState->STARMAXSIZE;
	star->dim.width = x;

	x = gameState->STARMAXSIZE + 1;
	while (x > gameState->STARMAXSIZE) x = 1 + rand() % gameState->STARMAXSIZE;
	star->dim.height = x;

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
		if (star->dim.x == 0) initStar(gameState, screenBuff, star);
	}
}

void updateFly(GameState* gameState, ScreenBuff* screenBuff) {
  if (gameState->restart) {
    resetGameState(screenBuff);
    return;
  }

	// Screen Logic
	if (!gameState->player1.inPlay) return;

	gameState->frameCounter += 1;

	bool collision = false;

	// StarField
	if (gameState->starField = true) {
		for (int i = 0; i < gameState->STARCOUNT; i++) {
			updateStar(gameState, screenBuff, &gameState->stars[i]);
			if (!collision && gameState->stars[i].collider) {
				if (rectCollisionCheck(gameState->player1.dim, gameState->stars[i].dim)) {
					collision = true;
				}
			}
		}
	}

	// Background Colour
	int completion = (gameState->frameCounter * 100 / gameState->DISTANCE_TARGET) / 25;

	if (collision) {
		if (gameState->player1.dim.y + gameState->player1.dim.height >= screenBuff->HEIGHT) {
			gameState->player1.inPlay = false;
			gameState->win = false;
		}
	}

  if (completion == 4) {
    gameState->player1.inPlay = false;
    gameState->win = true;
  }

	// Player movement
	if (collision) {
		gameState->player1.dim.y += 1;
		gameState->player1.dim.x += 1;
		if (gameState->player1.dim.y >= screenBuff->HEIGHT) {
			gameState->player1.inPlay = false;
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

void displayNoise(ScreenBuff* screenBuff, int frameMod) {
		for (int y = 0; y < screenBuff->HEIGHT; ++y)
			for (int x = 0; x < screenBuff->WIDTH; ++x)
        screenBuff->consoleBuffer[x + screenBuff->WIDTH * y] = rand() % 2;
}

void drawCharacter(ScreenBuff* screenBuff, char charPos, int x, int y) {
	int counter = 0;
	bool* character = font(charPos);
	for (int i = x; i < x + 8; i++) {
		for (int j = y; j < y + 8; j++) {
			int pixel = i + screenBuff->WIDTH * j;
			if (character[counter] && pixel >= 0 && pixel < screenBuff->MAXPIXEL) {
				screenBuff->consoleBuffer[pixel] = 1;
			}
      counter++;
		}
	}
  
  free(character);
}

void drawObject(ScreenBuff* screenBuff, Dimensions dim, bool* objectArray) {
	int counter = 0;
	for (int j = dim.y; j < dim.y + dim.height; j++) {
		int firstLine = (dim.x + screenBuff->WIDTH * j) / screenBuff->WIDTH;
		for (int i = dim.x; i < dim.x + dim.width; i++) {
			int pixel = i + screenBuff->WIDTH * j;
			if (objectArray[counter] && pixel >= 0 && pixel < screenBuff->MAXPIXEL && firstLine == pixel / screenBuff->WIDTH) {
				screenBuff->consoleBuffer[pixel] = 1;
			}
			counter++;
		}
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

void drawHalo(ScreenBuff* screenBuff, int HaloSizeX, int HaloSizeY, bool colour, int x, int y) {
	int originalpixel = x + screenBuff->WIDTH * y;
	for (int i = -1 * HaloSizeX; i <= HaloSizeX; i++) {
		for (int j = -1 * HaloSizeY; j <= HaloSizeY; j++) {
			int pixel = originalpixel + i + screenBuff->WIDTH * j;
			if (pixel >= 0 && pixel < screenBuff->MAXPIXEL) {
				screenBuff->consoleBuffer[pixel] = colour;
			}
		}
	}
}

void displayFly(GameState* gameState, ScreenBuff* screenBuff) {
	displayClear(screenBuff, 1, 0);
  
	// Draw Player
  bool player[192] = {
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0,
    1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0
  };

	drawObject(screenBuff, gameState->player1.dim, player);
  
	// Star field
	if (gameState->starField = true) {
		for (int i = 0; i < gameState->STARCOUNT; i++) {
			drawBlock(screenBuff, gameState->stars[i].dim, 1);
		}
	}

	// Set FPS
	char fps[16];
	sprintf(fps, "%3.0d", gameState->frameCounter * 100 / gameState->DISTANCE_TARGET);

	for (int i = 0; i < 3; i++) {
		drawCharacter(screenBuff, fps[i], 8 * i, 0);
	}

	if (!gameState->player1.inPlay) {
		if (gameState->win) {
			sprintf(fps, "YOU WIN!");
			for (int i = 0; i < 10; i++) {
				drawCharacter(screenBuff, fps[i], 32 + 8 * i, 30);
			}
		}
		else {
			sprintf(fps, "GAME OVER");
			for (int i = 0; i < 10; i++) {
				drawCharacter(screenBuff, fps[i], 32 + 8 * i, 30);
			}
		}
	}
}

void resetGameState(ScreenBuff* screenBuff) {
  // Reset Random Seed
  time_t now = time(nullptr);
  std::srand(now); // use current time as seed for random generator

  // Reset Game Objects
  gameState.starField = true;
  gameState.player1.dim.height = 12;
  gameState.player1.dim.width = 16;
  gameState.player1.inPlay = true;
  gameState.player1.dim.x = 0;
  gameState.player1.dim.y = (screenBuff->HEIGHT - gameState.player1.dim.height)/2;

  // Reset Clouds
  if (gameState.starField = true) 
    for (int i = 0; i < gameState.STARCOUNT; i++) 
      initStar(&gameState, screenBuff, &gameState.stars[i]);

  // Reset State
  gameState.frameCounter = 0;
  gameState.running = true;
  gameState.restart = false;
}

void flyGameSetup(ScreenBuff* screenBuff) {
      resetGameState(screenBuff);
}

void flyGameLoop(ScreenBuff* screenBuff, byte buttonVals) {
       processInputFly(&gameState,buttonVals);
       updateFly(&gameState, screenBuff);
       displayFly(&gameState, screenBuff);
}

