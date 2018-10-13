#include "rotoZoomer.h"

int FrameCounter = 0;
Dimensions imageDim;
bool direction = false;
const int zoomFactor = 200;
double zoomWinner = 0.8;
bool zoomWinnerDirection = false;

void rotoZoomerLoop(ScreenBuff* screenBuff, byte buttonVals) {
	imageDim.width = defcon_width;
	imageDim.height = defcon_height;
	imageDim.y = 0;
	imageDim.x = 32;
	
	double zoom = (FrameCounter % zoomFactor) / (double)zoomFactor;
	if (FrameCounter % zoomFactor == 0) 
		direction = !direction;

	if (direction)
		zoom = (zoomFactor / double(zoomFactor)) - zoom;

	bool* rotatedLogo = rotateObject(imageDim, FrameCounter * (PI / 180), zoom, defcon_image);

	if (zoomWinner > 1.1 || zoomWinner < 0.6) {
		zoomWinnerDirection = !zoomWinnerDirection;
	}

	zoomWinner += zoomWinnerDirection ? 0.003 : -0.003;

	displayClear(screenBuff, 1, false);
	drawObject(screenBuff, imageDim, (const bool*)rotatedLogo);
	imageDim.x = 0;
	imageDim.y = 0;
	imageDim.width = defconWinner_width;
	imageDim.height = defconWinner_height;
	drawObject(screenBuff, imageDim, (const bool*)rotateObject(imageDim, (PI / 180), zoomWinner, defconWinner_image));
	imageDim.x = 96;
	drawObject(screenBuff, imageDim, (const bool*)rotateObject(imageDim,180 * (PI / 180), zoomWinner, defconWinner_image));
	FrameCounter++;
	return;
}
