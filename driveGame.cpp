#include "driveGame.h"

struct Player1Keys {
	bool up = false;
	bool down = false;
	bool right = false;
	bool left = false;
	bool kick = false;
	bool punch = false;
	bool jump = false;
};

struct GameStateDrive {
	int scene = 1;
	int lastscene = 0;
	time_t frameTimer = time(nullptr);

	int frameCounter = 0;
	int carSpeed = 0;
	int roadSpeed = 0;
	bool evenLines = true;
	Player1Keys p1keys;

	bool running = true;
	bool restart = false;

} gameStateDrive;

void processInput(GameStateDrive* gameState, byte buttonVals) {
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

void updateDrive(GameStateDrive* gameState, ScreenBuff* screenBuff) {
	gameState->frameCounter += 1;
	gameState->carSpeed += gameState->p1keys.up ? 1 : 0;
	gameState->carSpeed -= gameState->p1keys.down ? 1 : 0;
	if (gameState->carSpeed < 0) gameState->carSpeed = 0;
	if (gameState->carSpeed > 50) gameState->carSpeed = 50;

	gameState->roadSpeed = 51 - gameState->carSpeed;
}

void displayDrive(GameStateDrive* gameState, ScreenBuff* screenBuff) {
	displayClear(screenBuff, 0, 0);

	int width = screenBuff->WIDTH / 15;
	int startY = screenBuff->HEIGHT / 3;

	if (gameState->carSpeed != 0 && gameState->frameCounter % gameState->roadSpeed == 0) {
		gameState->evenLines = !gameState->evenLines;
	}

	int height = 1;
	int j = 0;
	int y = startY;
	Dimensions dim;

	while (y < screenBuff->HEIGHT) {
		// Draw side of road
		dim.x = 0;
		dim.y = y;
		dim.height = height;
		dim.width = screenBuff->WIDTH;

		drawBlock(screenBuff, dim, j % 2 == 0 ? gameState->evenLines : !gameState->evenLines);

		dim.width = height;
		dim.x = (screenBuff->WIDTH - width - y) / 2 - height;
		drawBlock(screenBuff, dim, j % 2 == 0 ? !gameState->evenLines : gameState->evenLines);

		dim.x = (screenBuff->WIDTH - width - y) / 2 + width + y;
		drawBlock(screenBuff, dim, j % 2 == 0 ? !gameState->evenLines : gameState->evenLines);

		y += height + 1;
		j += 1;

		if (j % 5 == 0) height += 1;
	}

	y = screenBuff->HEIGHT / 3;
	j = 0;

	while (y < screenBuff->HEIGHT) {
		dim.x = (screenBuff->WIDTH  - width - y) /2;
		dim.y = y;
		dim.height = 0;
		dim.width = width + y;

		drawBlock(screenBuff, dim, true);

		y += 1;
		j += 1;
	}

	// Draw Trees
	// Draw Cars
	// Draw Player
	// Draw console
	char speed[16];
	sprintf(speed, "Car %i Road %i", gameState->carSpeed, gameState->roadSpeed);
	drawString(screenBuff, speed, 0, 0, false);
}

void driveGameLoop(ScreenBuff* screenBuff, byte buttonVals) {
	processInput(&gameStateDrive, buttonVals);

	switch (gameStateDrive.scene) {
	case 1: //Drive
		updateDrive(&gameStateDrive, screenBuff);
		displayDrive(&gameStateDrive, screenBuff);
		break;
	}

	return;
}
