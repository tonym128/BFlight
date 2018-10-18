#include "gameCommon.hpp"

bool processKey(byte buttonVals, int key) {
	return buttonVals & (1 << key);
}

void displayNoise(ScreenBuff* screenBuff, int amountInverse = 0) {
	for (int y = 0; y < screenBuff->HEIGHT; ++y)
		for (int x = 0; x < screenBuff->WIDTH; ++x)
			if (amountInverse == 0 || x * y % amountInverse == 0) {
				screenBuff->consoleBuffer[x + screenBuff->WIDTH * y] = rand() % 2;
			}
}

void displayNoise(ScreenBuff* screenBuff, Dimensions dim, int amountInverse = 0) {
	int counter = 0;
	for (int j = dim.y; j < dim.y + dim.height; j++) {
		int dimXmod = dim.x <= 0 ? 1 : dim.x;
		int firstLine = (dimXmod + screenBuff->WIDTH * j) / screenBuff->WIDTH;
		for (int i = dim.x; i < dim.x + dim.width; i++) {
			int pixel = i + screenBuff->WIDTH * j;
			if (pixel >= 0 && pixel < screenBuff->MAXPIXEL && firstLine == pixel / screenBuff->WIDTH) {
				screenBuff->consoleBuffer[pixel] = rand() % 2;
			}
			counter++;
		}
	}
}

bool* rotateObject(Dimensions dim, double angle, double zoom, const bool* object) {
	bool rotated[4096];
	double sinma = sin(-angle) * zoom;
	double cosma = cos(-angle) * zoom;

	for (int x = 0; x < dim.width; x++) {
		for (int y = 0; y < dim.height; y++) {
			int hwidth = dim.width / 2;
			int hheight = dim.height / 2;

			int xt = x - hwidth;
			int yt = y - hheight;

			int xs = (int)round((cosma * xt - sinma * yt) + hwidth);
			int ys = (int)round((sinma * xt + cosma * yt) + hheight);

			if (xs >= 0 && xs < dim.width && ys >= 0 && ys < dim.height) {
				/* set target pixel (x,y) to color at (xs,ys) */
				rotated[x + y * dim.width] = object[xs + ys * dim.width];
			}
			else {
				/* set target pixel (x,y) to some default background */
				rotated[x + y * dim.width] = 0;
			}
		}
	}

	return rotated;
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

void drawObjectWavy(ScreenBuff* screenBuff, Dimensions dim, int ylow, int yhigh, int ystart, int frameCount, bool yup, const bool* objectArray) {
	if (ystart > yhigh) ystart = yhigh;
	if (ystart < ylow) ystart = ylow;

	bool originalYup = yup;
	int internalCounter = frameCount;
	int counter = 0;
	int yOffset = ystart;
	for (int j = dim.y; j < dim.y + dim.height; j++) {
		yup = originalYup;
		yOffset = ystart;
		internalCounter = frameCount;

		for (int i = dim.x; i < dim.x + dim.width; i++) {
			int pixel = i + screenBuff->WIDTH * (j + yOffset);
			if (j + yOffset > 0 && j + yOffset < screenBuff->HEIGHT && i > 0 && i < screenBuff->WIDTH && objectArray[counter] && pixel >= 0 && pixel < screenBuff->MAXPIXEL) {
				screenBuff->consoleBuffer[pixel] = 1;
			}
			counter++;

			if (yOffset == yhigh || yOffset == ylow ) {
				yup = yOffset == yhigh ? true : false;
				
				if (internalCounter == 4) {
					yOffset += yup ? -1 : +1;
					internalCounter = 0;
				}
				else {
					internalCounter += 1;
				}
			}
			else {
				if (internalCounter == 1) {
					yOffset += yup ? -1 : +1;
				}
				else {
					internalCounter += 1;
				}
			}
		}
	}
}

void drawObjectFill(ScreenBuff* screenBuff, Dimensions dim, const bool* objectArray, bool drawColor) {
	int counter = 0;
	for (int j = dim.y; j < dim.y + dim.height; j++) {
		int dimXmod = dim.x <= 0 ? 1 : dim.x;
		int firstLine = (dimXmod + screenBuff->WIDTH * j) / screenBuff->WIDTH;
		for (int i = dim.x; i < dim.x + dim.width; i++) {
			int pixel = i + screenBuff->WIDTH * j;
			if (objectArray[counter] == drawColor && pixel >= 0 && pixel < screenBuff->MAXPIXEL && firstLine == pixel / screenBuff->WIDTH) {
				screenBuff->consoleBuffer[pixel] = drawColor;
			}
			counter++;
		}
	}
}

void drawObject(ScreenBuff* screenBuff, Dimensions dim, bool* objectArray, bool backFill) {
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

bool* reverseObject(Dimensions dim, const bool* objectArray) {
	bool newObjectArray[384];
	int counter = 0;
	for (int j = 0; j < dim.height; j++) {
		for (int i = dim.width - 1; i >= 0; i--) {
			int pixel = i + dim.width * j;
			newObjectArray[counter] = objectArray[pixel];
			counter++;
		}
	}

	return newObjectArray;
}

void drawCharacter(ScreenBuff* screenBuff, char charPos, int x, int y, bool backFill) {
	bool* character = font(charPos);
	Dimensions dim;
	dim.x = x;
	dim.y = y;
	dim.width = 8;
	dim.height = 8;

	drawObject(screenBuff, dim, character, backFill);
	free(character);
}

void drawString(ScreenBuff* screenBuff, char* scrollText, int x, int y, bool backFill) {
	for (int i = 0; i < static_cast<int>(strlen(scrollText)); i++) {
		drawCharacter(screenBuff, scrollText[i], x + 8 * i, y, backFill);
	}
}
