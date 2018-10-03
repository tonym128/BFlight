#include "gameCommon.h"

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
