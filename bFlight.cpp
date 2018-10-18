#include "gameCommon.hpp"
#include "bsideFly.hpp"
#include "driveGame.hpp"
#include "rotoZoomer.hpp"
// #include "beatemup.hpp"

#ifdef _WIN32_
#elif __linux
#include <ncurses.h>
#else
#endif

ScreenBuff screenBuff;
byte buttonVals;

int Game = 2;

#ifdef _WIN32_
bool processWinKey(int key) {
	if (GetAsyncKeyState(key) & 0x8000) return true;
	return false;
}

byte getReadShift() {
	byte buttonVals = 0;
	if (processWinKey(VK_LEFT))  buttonVals = buttonVals | (1 << P1_Left);
	if (processWinKey(VK_UP))    buttonVals = buttonVals | (1 << P1_Top);
	if (processWinKey(VK_RIGHT)) buttonVals = buttonVals | (1 << P1_Right);
	if (processWinKey(VK_DOWN))  buttonVals = buttonVals | (1 << P1_Bottom);
	if (processWinKey('D'))      buttonVals = buttonVals | (1 << P2_Right);
	if (processWinKey('S'))      buttonVals = buttonVals | (1 << P2_Bottom);
	if (processWinKey('A'))      buttonVals = buttonVals | (1 << P2_Left);
	if (processWinKey('W'))      buttonVals = buttonVals | (1 << P2_Top);

	return buttonVals;
}

void sendToScreen() {
	// Write the display
	HANDLE wHnd;
	wHnd = GetStdHandle(STD_OUTPUT_HANDLE);
	SetConsoleFont();
	// Set up the positions
	charBufSize = { 128, 64 };
	characterPos = { 0,0 };
	writeArea = { 0,0, 128 - 1, 64 - 1 };
	CHAR_INFO console[128 * 64];
	for (int pixel = 0; pixel < 128 * 64; pixel++) {
		console[pixel].Attributes = screenBuff.consoleBuffer[pixel] ? 255 : 0;
	}

	WriteConsoleOutputA(wHnd, console, charBufSize, characterPos, &writeArea);
}
#elif __linux
byte getReadShift() {
	byte buttonVals = 0;

    switch(getch()) {
    case 68:    // key left
        buttonVals = buttonVals | (1 << P1_Left);
        break;
    case 65:    // key up
        buttonVals = buttonVals | (1 << P1_Top);
        break;
    case 67:    // key right
        buttonVals = buttonVals | (1 << P1_Right);
        break;
    case 66:    // key down
        buttonVals = buttonVals | (1 << P1_Bottom);
        break;
    case 'd':
        buttonVals = buttonVals | (1 << P2_Right);
        break;
    case 's':
        buttonVals = buttonVals | (1 << P2_Bottom);
        break;
    case 'a':
        buttonVals = buttonVals | (1 << P2_Left);
        break;
    case 'w':
        buttonVals = buttonVals | (1 << P2_Top);
        break;
    case 'q':
        exit(0);
        break;
    }

    return buttonVals;
}
#else
#endif

void sendToScreen() {

  for (int i = 0; i < screenBuff.WIDTH * screenBuff.HEIGHT; i++) {
      int x = i % screenBuff.WIDTH;
      int y = i / screenBuff.WIDTH;
      if (screenBuff.consoleBuffer[i]) {
        attron(COLOR_PAIR(3));
        mvaddch(y, x,' ');
        attroff(COLOR_PAIR(3));
      } else {
        mvaddch(y, x,' ');
      }
  }
}

void loop() {
  // put your main code here, to run repeatedly:
    buttonVals = getReadShift();

    switch (Game) {
    case 1:
      driveGameLoop(&screenBuff,buttonVals);
      break;
    case 2:
      flyGameLoop(&screenBuff,buttonVals);
      break;
    case 3:
      rotoZoomerLoop(&screenBuff,buttonVals);
      break;
/*	case 4:
      beatemupLoop(&screenBuff, buttonVals); 
      break;
*/
  }

  sendToScreen();
}

#ifdef _WIN32_
int main() {
    while (1) {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        loop();
    }
    return 1;
}
#elif __linux
int main() {
    setlocale(LC_ALL, "");
    initscr();
    start_color();

    init_pair(3, COLOR_YELLOW, COLOR_WHITE);

    curs_set(FALSE);
    raw();
    noecho();
    nodelay(stdscr, TRUE);

    while (1) {
    	std::this_thread::sleep_for(std::chrono::milliseconds(10));
        loop();
    }

    return 1;
}
#else
#endif
