#include "beatemup.hpp"

struct Player1Keys {
	bool up = false;
	bool down = false;
	bool right = false;
	bool left = false;
	bool kick = false;
	bool punch = false;
	bool jump = false;
	bool restart = false;
};

enum PlayerAnimation
{
	Standing = 0,
	Walking = 1,
	Punching = 2,
	Kicking = 3,
	Jumping = 4
};

struct GameStateBeat {
	int Scene = 0;
	int LastScene = -1;
	int Level = 1;
	Player1Keys playerKeys;
	Dimensions playerDimension;
	PlayerAnimation playerAnimation;
	bool playerDirection = true;
	int animation = 0;

	time_t frameTimer = time(nullptr);
	time_t startTime = time(nullptr);
	time_t currentTime = time(nullptr);

	int frameCounter = 0;

} gameStateBeat;

void processInput(GameStateBeat* gameStateBeat, byte buttonVals) {
	gameStateBeat->playerKeys.up = processKey(buttonVals, P1_Top);
	gameStateBeat->playerKeys.down = processKey(buttonVals, P1_Bottom);
	gameStateBeat->playerKeys.left = processKey(buttonVals, P1_Left);
	gameStateBeat->playerKeys.right = processKey(buttonVals, P1_Right);
	gameStateBeat->playerKeys.jump = processKey(buttonVals, P2_Left);
	gameStateBeat->playerKeys.restart = processKey(buttonVals, P2_Top);
	gameStateBeat->playerKeys.kick = processKey(buttonVals, P2_Right);
	gameStateBeat->playerKeys.punch = processKey(buttonVals, P2_Bottom);
}

bool updateBeatemupGame(GameStateBeat* gameStateBeat, ScreenBuff* screenBuff) {
	gameStateBeat->frameCounter++;
	gameStateBeat->currentTime = time(nullptr);
	double animTick = 5;
	double updateTick = 60;
	if (gameStateBeat->currentTime - gameStateBeat->startTime > 1000 / updateTick) {
		if (gameStateBeat->playerKeys.down) { gameStateBeat->playerDimension.y += 1; }
		if (gameStateBeat->playerKeys.up) { gameStateBeat->playerDimension.y -= 1; }
		if (gameStateBeat->playerKeys.left) { gameStateBeat->playerDimension.x -= 1; }
		if (gameStateBeat->playerKeys.right) { gameStateBeat->playerDimension.x += 1; }

		// Clamp
		if (gameStateBeat->playerDimension.x + gameStateBeat->playerDimension.width > screenBuff->WIDTH) gameStateBeat->playerDimension.x = screenBuff->WIDTH - gameStateBeat->playerDimension.width;
		if (gameStateBeat->playerDimension.y + gameStateBeat->playerDimension.height > screenBuff->HEIGHT) gameStateBeat->playerDimension.y = screenBuff->HEIGHT - gameStateBeat->playerDimension.height;
		if (gameStateBeat->playerDimension.x < 0) gameStateBeat->playerDimension.x = 0;
		if (gameStateBeat->playerDimension.y < 0) gameStateBeat->playerDimension.y = 0;
	}

	if (gameStateBeat->currentTime - gameStateBeat->startTime > 1000 / animTick) {
		gameStateBeat->animation++;
		if (gameStateBeat->animation == 3) {
			gameStateBeat->animation = 0;
			if (gameStateBeat->playerAnimation != Standing) {
				gameStateBeat->playerAnimation = Standing;
			}
		}
		gameStateBeat->startTime = gameStateBeat->currentTime;
	}

	if (gameStateBeat->playerKeys.left) {
		gameStateBeat->playerDirection = false;
	}
	if (gameStateBeat->playerKeys.right) {
		gameStateBeat->playerDirection = true;
	}

	if (gameStateBeat->playerKeys.up) {

	}
	if (gameStateBeat->playerKeys.down) {

	}
	if (gameStateBeat->playerKeys.kick) {
		if (gameStateBeat->playerAnimation != Kicking) {
			gameStateBeat->animation = 0;
			gameStateBeat->playerAnimation = Kicking;
		}
	}
	if (gameStateBeat->playerKeys.punch) {
		if (gameStateBeat->playerAnimation != Punching) {
			gameStateBeat->animation = 0;
			gameStateBeat->playerAnimation = Punching;
		}
	}

	return true;
}

const bool* getPlayerImage(int animationFrame, int animation, bool direction) {
	Dimensions dim;
	dim.width = 16;
	dim.height = 16;
	bool reverseImage[256];

	switch (animation) {
	case 0: //Standing
		switch (animationFrame) {
		case 0:
			reverseObject(dim, playerStand1Image,reverseImage);
			return direction ? playerStand1Image : (const bool*)reverseImage;
			break;
		case 1:
			reverseObject(dim, playerStand2Image,reverseImage);
			return direction ? playerStand2Image : (const bool*)reverseImage;
			break;
		case 2:
			reverseObject(dim, playerStand3Image,reverseImage);
			return direction ? playerStand3Image : (const bool*)reverseImage;
			break;
		default:
			reverseObject(dim, playerStand1Image,reverseImage);
			return direction ? playerStand1Image : (const bool*)reverseImage;
		}
	case 2: //Punching
		switch (animationFrame) {
		case 0:
			reverseObject(dim, playerPunch1Image,reverseImage);
			return direction ? playerPunch1Image : (const bool*)reverseImage;
			break;
		case 1:
			reverseObject(dim, playerPunch2Image,reverseImage);
			return direction ? playerPunch2Image : (const bool*)reverseImage;
			break;
		case 2:
			reverseObject(dim, playerPunch1Image,reverseImage);
			return direction ? playerPunch1Image : (const bool*)reverseImage;
			break;
		default:
			reverseObject(dim, playerPunch2Image,reverseImage);
			return direction ? playerPunch2Image : (const bool*)reverseImage;
		}
	case 3: //Kicking
		switch (animationFrame) {
		case 0:
			reverseObject(dim, playerKick1Image,reverseImage);
			return direction ? playerKick1Image : (const bool*)reverseImage;
			break;
		case 1:
			reverseObject(dim, playerKick2Image,reverseImage);
			return direction ? playerKick2Image : (const bool*)reverseImage;
			break;
		case 2:
			reverseObject(dim, playerKick1Image,reverseImage);
			return direction ? playerKick1Image : (const bool*)reverseImage;
			break;
		default:
			reverseObject(dim, playerStand1Image,reverseImage);
			return direction ? playerKick2Image : (const bool*)reverseImage;
		}
	}

	reverseObject(dim, playerStand1Image,reverseImage);
    return direction ? playerStand1Image : (const bool*)reverseImage;
}

void displayBeatemupGame(GameStateBeat* gameStateBeat, ScreenBuff* screenBuff) {
	displayClear(screenBuff, 0, false);
	drawObject(screenBuff, gameStateBeat->playerDimension, (const bool*) getPlayerImage(gameStateBeat->animation, gameStateBeat->playerAnimation, gameStateBeat->playerDirection));
}

bool beatemupLoop(ScreenBuff* screenBuff, byte buttonVals) {
	processInput(&gameStateBeat, buttonVals);

	switch (gameStateBeat.Scene)
	{
	case 0:
		if (gameStateBeat.Scene != gameStateBeat.LastScene) {
			gameStateBeat.playerDimension.height = 16;
			gameStateBeat.playerDimension.width = 16;
			gameStateBeat.playerDimension.x = 32;
			gameStateBeat.playerDimension.y = 20;
			gameStateBeat.LastScene = gameStateBeat.Scene;
		}

		updateBeatemupGame(&gameStateBeat, screenBuff);
		displayBeatemupGame(&gameStateBeat, screenBuff);
		break;
	default:
		return false;
		break;
	}
	return true;
}
