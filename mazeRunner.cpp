#include "mazeRunner.hpp"
// Tutorial and sample code, modified to my needs from here
// https://lodev.org/cgtutor/files/raycaster_flat.cpp
// Check the full tutorial here
// https://lodev.org/cgtutor/raycasting.html

struct Player1Keys {
	bool up = false;
	bool down = false;
	bool right = false;
	bool left = false;
	bool open = false;
};

#define mapWidth 25
#define mapHeight 25

struct GameStateMaze {
	int currentState = 0;
	int previousState = -1;
	int frameCounter = 0;
	int stageTime = 120;
	int endTimer = 0;
	int endSeconds = 3;
	Player1Keys p1keys;
	bool running = false;
	bool restart = false;
	bool win = false;
	bool exit = false;
	bool traversal[mapWidth][mapHeight];
	int winX = 0;
	int winY = 0;

} gameStateMaze;


int worldMap[mapWidth][mapHeight] =
{
  {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
  {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1,1},
  {1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1,1},
  {1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1,1},
  {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
  {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1}
};

int posX = INT_TO_FIXP(22), posY = INT_TO_FIXP(12);  //x and y start position
int dirX = INT_TO_FIXP(-1), dirY = INT_TO_FIXP(0); //initial direction vector
int planeX = INT_TO_FIXP(0), planeY = FLOAT_TO_FIXP(0.66); //the 2d raycaster version of camera plane

void mazeRunnerInit() {
	initTime();
	Maze maze = Maze();
	maze.generateMaze();
	maze.copyMaze(worldMap);
	worldMap[maze.endX][maze.endY] = 6;
	worldMap[maze.startX][maze.startY] = 2;

	gameStateMaze.winX = maze.endX;
	gameStateMaze.winY = maze.endY;

	// Setup start pos
	posX = FLOAT_TO_FIXP(maze.startX - 0.2);
	posY = FLOAT_TO_FIXP(maze.startY - 0.2);
}

bool updateScroller(GameStateMaze* gameState, ScreenBuff* screenBuff) {
	updateMinTime(10);
	return true;
}

bool displayScroller(GameStateMaze* gameState, ScreenBuff* screenBuff) {
	gameState->frameCounter += 1;

	displayClear(screenBuff, 1, 0);

	int y = screenBuff->HEIGHT - gameState->frameCounter + 10;

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "You're here!";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "You're rested!";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "But u only have";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "2 minutes to get";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "to the keynote";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "   Good Luck!  ";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (1 == 1) {
		char scroller[17] = "                ";
		drawString(screenBuff, scroller, 0, 0, true);
		drawString(screenBuff, scroller, 0, 8, true);
	}

	if (1 == 1) {
		char scroller[17] = " -= mRunnr =-  ";
		drawString(screenBuff, scroller, 5, 2, true);
	}

	if (y < -8) return false;
	return true;
}

bool displayWinScroller(GameStateMaze* gameState, ScreenBuff* screenBuff) {
	gameState->frameCounter += 1;

	displayClear(screenBuff, 1, 0);

	int y = screenBuff->HEIGHT - gameState->frameCounter + 10;

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "You did it!";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "Grab a seat and";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "let these talks";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "blow your mind";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "     DefCon     ";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (1 == 1) {
		char scroller[17] = "                ";
		drawString(screenBuff, scroller, 0, 0, true);
		drawString(screenBuff, scroller, 0, 8, true);
	}

	if (1 == 1) {
		char scroller[17] = " -= WINNER =-  ";
		drawString(screenBuff, scroller, 5, 2, true);
	}

	if (y < -8) return false;
	return true;
}

bool displayLoseScroller(GameStateMaze* gameState, ScreenBuff* screenBuff) {
	gameState->frameCounter += 1;

	displayClear(screenBuff, 1, 0);

	int y = screenBuff->HEIGHT - gameState->frameCounter + 10;

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "U didn't make it";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "Make your way to";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "the next talk";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "it's a good 1";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (y > -8 || y < screenBuff->HEIGHT) {
		char scroller[17] = "  ;-)     (-;  ";
		drawString(screenBuff, scroller, 0, y, false);
		y += 8;
	}

	if (1 == 1) {
		char scroller[17] = "                ";
		drawString(screenBuff, scroller, 0, 0, true);
		drawString(screenBuff, scroller, 0, 8, true);
	}

	if (1 == 1) {
		char scroller[17] = "-= TRY AGAIN =-";
		drawString(screenBuff, scroller, 5, 2, true);
	}

	if (y < -8) return false;
	return true;
}

bool displayLevelBars(GameStateMaze* gameState, ScreenBuff* screenBuff) {
	gameState->frameCounter += 1;
	displayClear(screenBuff, 1, false);
	char fps[16] = "Final Level";

	for (int i = 0; i < static_cast<int>(strlen(fps)); i++) {
		drawCharacter(screenBuff, fps[i], 16 + 8 * i, 10);
	}

	// Sliders
	int counter = 0;
	for (int i = gameState->frameCounter; i > 0; i--) {
		if (counter < screenBuff->WIDTH / 2)
		{
			counter++;
			screenBuff->consoleBuffer[screenBuff->WIDTH * 5 + i] = 1;
			screenBuff->consoleBuffer[screenBuff->WIDTH * 20 - i] = 1;
		}
	}

	return gameState->frameCounter > 120;
}

bool update(GameStateMaze* gameStateMaze) {
	updateMinTime(0);

	// Check for win state // Win is in the top left
	if (!gameStateMaze->win) {
//		gameStateMaze->win = FIXP_INT_PART(posX) - gameStateMaze->winX < 1.5 && FIXP_INT_PART(posY) - gameStateMaze->winY < 1.5;
	}
	else if (gameStateMaze->win) {
		if (gameStateMaze->endSeconds == 0) { gameStateMaze->endSeconds = getElapsedSeconds();}
		else if (getElapsedSeconds() - gameStateMaze->endSeconds > gameStateMaze->endTimer) {gameStateMaze->currentState = 3;}
	}
	
	if (checkTime(gameStateMaze->stageTime)) {
		// If we have run out of time, stop updating the game
		gameStateMaze->win = false;
		if (gameStateMaze->endSeconds == 0) {gameStateMaze->endSeconds = getElapsedSeconds();}
		else if (getElapsedSeconds() - gameStateMaze->endSeconds > gameStateMaze->endTimer) {gameStateMaze->currentState = 5;}
		return false;
	}

	gameStateMaze->traversal[FIXP_INT_PART(posX)][FIXP_INT_PART(posY)] = true;

	//speed modifiers
	int moveSpeed = FLOAT_TO_FIXP(0.1);
	int rotSpeed = FLOAT_TO_FIXP(0.05);

	//move forward if no wall in front of you
	if (gameStateMaze->p1keys.up)
	{
		if (worldMap[FIXP_INT_PART(posX + FP_MULT(dirX, moveSpeed))][FIXP_INT_PART(posY)] == false) posX += FP_MULT(dirX, moveSpeed);
		if (worldMap[FIXP_INT_PART(posX)][FIXP_INT_PART(posY + FP_MULT(dirY, moveSpeed))] == false) posY += FP_MULT(dirY, moveSpeed);
	}
	//move backwards if no wall behind you
	if (gameStateMaze->p1keys.down)
	{
		if (worldMap[FIXP_INT_PART(posX - FP_MULT(dirX, moveSpeed))][FIXP_INT_PART(posY)] == false) posX -= FP_MULT(dirX,moveSpeed);
		if (worldMap[FIXP_INT_PART(posX)][FIXP_INT_PART(posY - FP_MULT(dirY, moveSpeed))] == false) posY -= FP_MULT(dirY,moveSpeed);
	}
	//rotate to the right
	if (gameStateMaze->p1keys.right)
	{
		//both camera direction and camera plane must be rotated
		int oldDirX = dirX;
		int cosRot = FLOAT_TO_FIXP(cos(-rotSpeed));
		int sinRot = FLOAT_TO_FIXP(sin(-rotSpeed));

		dirX = FP_MULT(dirX,cosRot) - FP_MULT(dirY,sinRot);
		dirY = FP_MULT(oldDirX,sinRot) + FP_MULT(dirY,cosRot);
		int oldPlaneX = planeX;
		planeX = FP_MULT(planeX, cosRot) - FP_MULT(planeY,sinRot);
		planeY = FP_MULT(oldPlaneX, sinRot) + FP_MULT(planeY,cosRot);
	}
	//rotate to the left
	if (gameStateMaze->p1keys.left)
	{
		//both camera direction and camera plane must be rotated
		int oldDirX = dirX;
		int cosRot = FLOAT_TO_FIXP(cos(rotSpeed));
		int sinRot = FLOAT_TO_FIXP(sin(rotSpeed));

		dirX = FP_MULT(dirX,cosRot) - FP_MULT(dirY, sinRot);
		dirY = FP_MULT(oldDirX,sinRot) + FP_MULT(dirY,cosRot);
		int oldPlaneX = planeX;
		planeX = FP_MULT(planeX,cosRot) - FP_MULT(planeY, sinRot);
		planeY = FP_MULT(oldPlaneX, sinRot) + FP_MULT(planeY, cosRot);
	}

	return true;
}

void processInput(GameStateMaze* gameStateMaze, byte buttonVals) {
	gameStateMaze->p1keys.up = processKey(buttonVals, P1_Top);
	gameStateMaze->p1keys.down = processKey(buttonVals, P1_Bottom);
	gameStateMaze->p1keys.left = processKey(buttonVals, P1_Left);
	gameStateMaze->p1keys.right = processKey(buttonVals, P1_Right);
	gameStateMaze->p1keys.open = processKey(buttonVals, P2_Left);

	if (processKey(buttonVals, P2_Top)) {
		gameStateMaze->running = false;
		gameStateMaze->restart = true;
	}
}

void display(ScreenBuff* screenBuff, GameStateMaze* gameStateMaze) {
	displayClear(screenBuff, 1, false);

	for (int x = 0; x < screenBuff->WIDTH; x++)
	{
		//which box of the map we're in
		int mapX = int(posX);
		int mapY = int(posY);

		//calculate ray position and direction
		int cameraX = INT_TO_FIXP(2) * INT_TO_FIXP(x) / INT_TO_FIXP(screenBuff->WIDTH) - 1; //x-coordinate in camera space
		int rayDirX = dirX + FP_MULT(planeX,cameraX);
		int rayDirY = dirY + FP_MULT(planeY,cameraX);

		//length of ray from current position to next x or y-side
		int sideDistX;
		int sideDistY;

		//length of ray from one x or y-side to next x or y-side
		int deltaDistX = FLOAT_TO_FIXP(std::abs(1 / rayDirX));
		int deltaDistY = FLOAT_TO_FIXP(std::abs(1 / rayDirY));
		int perpWallDist;

		//what direction to step in x or y-direction (either +1 or -1)
		int stepX;
		int stepY;

		int hit = 0; //was there a wall hit?
		int side; //was a NS or a EW wall hit?

	   //calculate step and initial sideDist
		if (rayDirX < 0)
		{
			stepX = -1;
			sideDistX = FP_MULT((posX - mapX),deltaDistX);
		}
		else
		{
			stepX = INT_TO_FIXP(1);
			sideDistX = FP_MULT((mapX + INT_TO_FIXP(1) - posX), deltaDistX);
		}
		if (rayDirY < 0)
		{
			stepY = -1;
			sideDistY = FP_MULT((posY - mapY), deltaDistY);
		}
		else
		{
			stepY = INT_TO_FIXP(1);
			sideDistY = FP_MULT((mapY + INT_TO_FIXP(1) - posY), deltaDistY);
		}

		//perform DDA
		while (hit == 0)
		{
			//jump to next map square, OR in x-direction, OR in y-direction
			if (sideDistX < sideDistY)
			{
				sideDistX += deltaDistX;
				mapX += stepX;
				side = 0;
			}
			else
			{
				sideDistY += deltaDistY;
				mapY += stepY;
				side = INT_TO_FIXP(1);
			}
			//Check if ray has hit a wall
			if (worldMap[FIXP_INT_PART(mapX)][FIXP_INT_PART(mapY)] > 0) hit = INT_TO_FIXP(1);
		}

		//Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
		if (side == 0) perpWallDist = (mapX - posX + (INT_TO_FIXP(1) - stepX) / INT_TO_FIXP(2)) / rayDirX;
		else           perpWallDist = (mapY - posY + (INT_TO_FIXP(1) - stepY) / INT_TO_FIXP(2)) / rayDirY;

		//Calculate height of line to draw on screen
		int lineHeight = (int)FIXP_INT_PART(INT_TO_FIXP(screenBuff->HEIGHT) / perpWallDist);

		//calculate lowest and highest pixel to fill in current stripe
		int drawStart = -lineHeight / 2 + screenBuff->HEIGHT / 2;
		if (drawStart < 0)drawStart = 0;
		int drawEnd = lineHeight / 2 + screenBuff->HEIGHT / 2;
		if (drawEnd >= screenBuff->HEIGHT) drawEnd = screenBuff->HEIGHT - 1;

		//give x and y sides different brightness
		// if (side == 1) {color = color / 2;}
		int pattern = worldMap[FIXP_INT_PART(mapX)][FIXP_INT_PART(mapY)] - 1;

		//draw the pixels of the stripe as a vertical line
		if (pattern < 5) {
			drawVertLine(screenBuff, x, drawStart, drawEnd - drawStart, true, pattern);
		}
		else {
			int wallX; //where exactly the wall was hit
			if (side == 0) wallX = posY + FP_MULT(perpWallDist, rayDirY);
			else           wallX = posX + FP_MULT(perpWallDist, rayDirX);
			wallX -= floor((wallX));

			//x coordinate on the texture
			int texX = FIXP_INT_PART(wallX * INT_TO_FIXP(defcon_width));
			if (side == 0 && rayDirX > 0) texX = defcon_width - texX - 1;
			if (side == 1 && rayDirY < 0) texX = defcon_width - texX - 1;

			for (int y = drawStart; y < drawEnd; y++)
			{
				int d = y * 256 - defcon_height * 128 + lineHeight * 128;  //256 and 128 factors to avoid floats
				// TODO: avoid the division to speed this up
				int texY = ((d * defcon_width) / lineHeight) / 256;
				bool color = defcon_image[texX + defcon_height * texY];
				screenBuff->consoleBuffer[x + y * screenBuff->WIDTH] = color;
			}
		}
	}

	// Draw Progress bar
	Dimensions dim;
	int seconds = getElapsedSeconds();
	int percTimeLeft = 128 - seconds * 128/ gameStateMaze->stageTime;
	dim.x = 0;
	dim.y = 0;
	dim.height = 5;
	dim.width = percTimeLeft;
	drawBlock(screenBuff, dim, 1);

	// Draw Win!
	if (gameStateMaze->win) {
		char fps[30];
		sprintf(fps, "YOU WIN!");
		for (int i = 0; i < static_cast<int>(strlen(fps)); i++) {
			drawCharacter(screenBuff, fps[i], 32 + 8 * i, 30);
		}
	} else if (getElapsedSeconds() > gameStateMaze->stageTime) {
		char fps[30];
		sprintf(fps, "GAME OVER!");
		for (int i = 0; i < static_cast<int>(strlen(fps)); i++) {
			drawCharacter(screenBuff, fps[i], 24 + 8 * i, 30);
		}
	}

	//Draw map
	dim.height = mapHeight;
	dim.width = mapWidth;
	dim.x = screenBuff->WIDTH - mapWidth - 1;
	dim.y = screenBuff->HEIGHT - mapHeight - 1;
	bool traverseMap[mapWidth * mapHeight];
	for (int i = 0; i < mapWidth; i++) {
		for (int j = 0; j < mapHeight; j++) {
			traverseMap[i + j * mapWidth] = gameStateMaze->traversal[i][j];
		}
	}

	//which box of the map we're in
	int mapX = int(posX);
	int mapY = int(posY);

	for (int i = -1; i < 2; i++) {
		for (int j = -1; j < 2; j++) {
			if (((mapX + i) > 0) && ((mapX + i) < mapWidth)
				&& ((mapY + j) > 0) && ((mapY + j) < mapHeight)
				)
				traverseMap[(mapX + i) + (mapY + j) * mapWidth] = 1;

		}
	}

	drawObject(screenBuff, dim, traverseMap);

	//timing for input and FPS counter
	updateMinTime(0);

}

bool mazeRunnerLoop(ScreenBuff* screenBuff, byte buttonVals) {
	switch (gameStateMaze.currentState) {
		case 0:
		// Start Story scroller
		if (gameStateMaze.previousState != gameStateMaze.currentState) {
			gameStateMaze.previousState = gameStateMaze.currentState;
			gameStateMaze.frameCounter = 0;
		}

		updateScroller(&gameStateMaze, screenBuff);
		if (!displayScroller(&gameStateMaze, screenBuff)) {
			gameStateMaze.currentState = 1;
		}
		break;
		case 1:
			// Level bars
			if (gameStateMaze.previousState != gameStateMaze.currentState) {
				gameStateMaze.previousState = gameStateMaze.currentState;
				gameStateMaze.frameCounter = 0;
			}

			updateScroller(&gameStateMaze, screenBuff);
			if (displayLevelBars(&gameStateMaze, screenBuff)) {
				gameStateMaze.currentState = 2;
			}
		break;
		case 2:
			// Play
			if (gameStateMaze.previousState != gameStateMaze.currentState) {
				gameStateMaze.previousState = gameStateMaze.currentState;
				gameStateMaze.frameCounter = 0;
				initTime();
			}

			processInput(&gameStateMaze, buttonVals);
			update(&gameStateMaze);
			display(screenBuff, &gameStateMaze);
		break;
		case 3:
			// Win Story Scroller
			if (gameStateMaze.previousState != gameStateMaze.currentState) {
				gameStateMaze.previousState = gameStateMaze.currentState;
				gameStateMaze.frameCounter = 0;
			}

			updateScroller(&gameStateMaze, screenBuff);
			if (!displayWinScroller(&gameStateMaze, screenBuff)) {
				gameStateMaze.currentState = 4;
			}
		break;
		case 5:
			// Lose Story Scroller
			if (gameStateMaze.previousState != gameStateMaze.currentState) {
				gameStateMaze.previousState = gameStateMaze.currentState;
				gameStateMaze.frameCounter = 0;
			}

			updateScroller(&gameStateMaze, screenBuff);
			if (!displayLoseScroller(&gameStateMaze, screenBuff)) {
				gameStateMaze.currentState = 1;
			}
		break;
		case 4:
			// Done and Exit
			gameStateMaze.exit = true;
		break;
	}

	return gameStateMaze.exit;
}
