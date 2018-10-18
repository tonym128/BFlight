#include "rotoZoomer.hpp"

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

	bool rotatedLogo[defcon_height * defcon_width];
	rotateObject(imageDim, FrameCounter * (PI / 180), zoom, defcon_image, rotatedLogo);

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
	rotateObject(imageDim, (PI / 180), zoomWinner, defconWinner_image, rotatedLogo);
	drawObject(screenBuff, imageDim, rotatedLogo);
	imageDim.x = 96;
	rotateObject(imageDim,180 * (PI / 180), zoomWinner, defconWinner_image,rotatedLogo);
	drawObject(screenBuff, imageDim, rotatedLogo);
	FrameCounter++;
	return;
}
