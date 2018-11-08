#include "carpark.hpp"
struct Player1Keys {
	bool up = false;
	bool down = false;
	bool right = false;
	bool left = false;
	bool punch = false;
	bool restart = false;
};

enum PlayerAnimation
{
	Standing = 0,
	Punching = 2,
};

struct GameStateCarPark {
	int Scene = 1;
	int LastScene = -1;
	int Level = 1;
	Player1Keys playerKeys;
	Dimensions playerDimension;
	PlayerAnimation playerAnimation;
	bool playerDirection = true;
	int animation = 0;

	int frameCounter = 0;
	
	bool aimScrollDirection = 1; // Scrolling Left or Right 
	double quad_a = -0.011;
	double quad_a_min = -0.0119;
	double quad_a_max = -0.0099;
	double quad_a_move = 0.0001;
	double quad_b = 0;
	double quad_b_min = -0.45;
	double quad_b_max = 0.55;
	double quad_b_move = 0.05;
	double quad_b_dir_up = 0.08;
	double quad_b_dir_down = -0.06;
	double quad_c = 1000;
	double quad_c_min = 100;
	double quad_c_max = 2100;
	double quad_c_move = 100;
} gameStateCarPark;

void processInput(GameStateCarPark* gameStateCarPark, byte buttonVals) {
	gameStateCarPark->playerKeys.up = processKey(buttonVals, P1_Top);
	gameStateCarPark->playerKeys.down = processKey(buttonVals, P1_Bottom);
	gameStateCarPark->playerKeys.left = processKey(buttonVals, P1_Left);
	gameStateCarPark->playerKeys.right = processKey(buttonVals, P1_Right);
	gameStateCarPark->playerKeys.restart = processKey(buttonVals, P2_Top);
	gameStateCarPark->playerKeys.punch = processKey(buttonVals, P2_Bottom);
}

const bool* car_getPlayerImage(int animationFrame, int animation, bool direction) {
	Dimensions dim;
	dim.width = 16;
	dim.height = 16;
	bool reverseImage[256];

	switch (animation) {
	case 0: //Standing
		switch (animationFrame) {
		case 0:
			reverseObject(dim, carplayerStand1Image,reverseImage);
			return direction ? carplayerStand1Image : (const bool*)reverseImage;
			break;
		case 1:
			reverseObject(dim, carplayerStand2Image,reverseImage);
			return direction ? carplayerStand2Image : (const bool*)reverseImage;
			break;
		case 2:
			reverseObject(dim, carplayerStand3Image,reverseImage);
			return direction ? carplayerStand3Image : (const bool*)reverseImage;
			break;
		default:
			reverseObject(dim, carplayerStand1Image,reverseImage);
			return direction ? carplayerStand1Image : (const bool*)reverseImage;
		}
	case 2: //Punching
		switch (animationFrame) {
		case 0:
			reverseObject(dim, carplayerPunch1Image,reverseImage);
			return direction ? carplayerPunch1Image : (const bool*)reverseImage;
			break;
		case 1:
			reverseObject(dim, carplayerPunch2Image,reverseImage);
			return direction ? carplayerPunch2Image : (const bool*)reverseImage;
			break;
		case 2:
			reverseObject(dim, carplayerPunch1Image,reverseImage);
			return direction ? carplayerPunch1Image : (const bool*)reverseImage;
			break;
		default:
			reverseObject(dim, carplayerPunch2Image,reverseImage);
			return direction ? carplayerPunch2Image : (const bool*)reverseImage;
		}
    }
	return carplayerStand1Image;
}

void updateCarGame(GameStateCarPark* gameStateCarPark, ScreenBuff* screenBuff) {
    gameStateCarPark->frameCounter++;
#ifdef _WIN32
	SYSTEMTIME time;
	GetSystemTime(&time);
	currentTime = (time.wSecond * 1000) + time.wMilliseconds;
#else
	currentTime = time(nullptr);
#endif
	double animTick = 5;
	double updateTick = 60;

	// Update player for animation
	if (gameStateCarPark->aimScrollDirection) {
		gameStateCarPark->quad_a -= gameStateCarPark->quad_a_move;
		gameStateCarPark->quad_b -= gameStateCarPark->quad_b_move;
		gameStateCarPark->quad_c -= gameStateCarPark->quad_c_move;
	} else {
		gameStateCarPark->quad_a += gameStateCarPark->quad_a_move;
		gameStateCarPark->quad_b += gameStateCarPark->quad_b_move;
		gameStateCarPark->quad_c += gameStateCarPark->quad_c_move;
	}

	if (currentTime - startTime > 1000 / animTick) {
		gameStateCarPark->animation++;
		if (gameStateCarPark->animation == 3) {
			gameStateCarPark->animation = 0;
			if (gameStateCarPark->playerAnimation != Standing) {
				gameStateCarPark->playerAnimation = Standing;
			}
		}

		if ( gameStateCarPark->quad_b < gameStateCarPark->quad_b_dir_down)  {
			gameStateCarPark->aimScrollDirection = 0;
			gameStateCarPark->quad_a = gameStateCarPark->quad_a_min;
			gameStateCarPark->quad_b = gameStateCarPark->quad_b_min;
			gameStateCarPark->quad_c = gameStateCarPark->quad_c_min;
		} else if ( gameStateCarPark->quad_b > gameStateCarPark->quad_b_dir_up ) {
			gameStateCarPark->aimScrollDirection = 1;
			gameStateCarPark->quad_a = gameStateCarPark->quad_a_max;
			gameStateCarPark->quad_b = gameStateCarPark->quad_b_max;
			gameStateCarPark->quad_c = gameStateCarPark->quad_c_max;
		}

		startTime = currentTime;
	}

    // Agro meter always increasing.
    // If coin hits the meter up a level.
    // If coin hits the ground up a level.
    // When agro meter is full end game.
}

double f(double x,double a, double b, double c) 
// c height at 0
// a amplitude
// b x offset
{
	return a*x*x + b*x + c; 
}

void displayCarParkGame(GameStateCarPark* gameStateCarPark, ScreenBuff* screenBuff) {
	displayClear(screenBuff, 0, false);
	bool invertPlayer[256];
	invertObject(gameStateCarPark->playerDimension, (const bool*) car_getPlayerImage(gameStateCarPark->animation, gameStateCarPark->playerAnimation, gameStateCarPark->playerDirection), invertPlayer);

	drawObject(screenBuff, gameStateCarPark->playerDimension, invertPlayer);
	
	Dimensions car;
	car.height = 11;
	car.width = 16;
	car.x = 30;
	car.y = 25;
	bool invertCar[256];
	invertObject(car, carplayerCar, invertCar);

	drawObject(screenBuff, car, (const bool*)invertCar);

	Dimensions meter;
	meter.height = 11;
	meter.width = 4;
	meter.x = 55;
	meter.y = 25;
	drawObject(screenBuff, meter, carMeterImage);

	Dimensions ground;
	ground.height = 64-36;
	ground.width = 128;
	ground.x = 0;
	ground.y = 36;
	drawMoire(screenBuff, ground,1);

	// Draw line
	int x = 18;
	int y = 23;
	Dimensions line;
	line.width = 1;
	line.height = 1;
	line.x = x;
	line.y = y;

	int counter = 0;
	int zero = (int)f(((double)counter*3)-50, gameStateCarPark->quad_a,gameStateCarPark->quad_b,gameStateCarPark->quad_c);
	while (line.y < 32 && line.x < 129) { // 36 == ground
		counter++;
		line.x += 1;
		line.y = 30 + zero - (int)f(((double)counter*3)-50, gameStateCarPark->quad_a,gameStateCarPark->quad_b,gameStateCarPark->quad_c);
		drawBlock(screenBuff,line,1);
	}
}

void initGame() {
	gameStateCarPark.playerAnimation = Standing;
	gameStateCarPark.playerDirection = 1;
	gameStateCarPark.playerDimension.x = 5;
	gameStateCarPark.playerDimension.y = 20;
	gameStateCarPark.playerDimension.width = 16;
	gameStateCarPark.playerDimension.height = 16;
	initTime();
}

bool carparkLoop(ScreenBuff* screenBuff, byte buttonVals) {
	processInput(&gameStateCarPark, buttonVals);

    switch (gameStateCarPark.Scene)
	{
        case 1: // Throw the coins
		if (gameStateCarPark.Scene != gameStateCarPark.LastScene) {
			initGame();
			gameStateCarPark.LastScene = gameStateCarPark.Scene;
		}

		updateCarGame(&gameStateCarPark,screenBuff);
		displayCarParkGame(&gameStateCarPark,screenBuff);
		break;
		default:
		break;
    }

    return true;
}