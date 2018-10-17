#include "gameCommon.hpp"
#include "bsideFly.hpp"
#include "driveGame.hpp"
#include "rotoZoomer.hpp"
#ifdef _WIN32_
#elif __linux
#include <ncurses.h>
#else
#endif

ScreenBuff screenBuff;
byte buttonVals;

int Game = 1;

void sendToScreen() {
  for (int i = 0; i < screenBuff.WIDTH * screenBuff.HEIGHT; i++) {
      int x = i % screenBuff.WIDTH;
      int y = i / screenBuff.WIDTH;
      if (screenBuff.consoleBuffer[i]) {
        mvaddch(x,y,screenBuff.consoleBuffer[i] ? 0 : 1);
        attron(COLOR_PAIR(3));
        move(y, x);
        printw("█");
        attroff(COLOR_PAIR(3));
      } else {
        move(y, x);
        printw(" ");
      }
  }
}

void loop() {
  // put your main code here, to run repeatedly:
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
  }

  sendToScreen();
}

#ifdef _WIN32_
int main() {
    while (1) loop();
    return 1;
}
#elif __linux
int main() {
    setlocale(LC_ALL, "");
    initscr();
    start_color();

    init_pair(0, COLOR_GREEN, COLOR_BLACK);
    init_pair(1, COLOR_RED, COLOR_BLACK);
    init_pair(2, COLOR_BLUE, COLOR_BLACK);
    init_pair(3, COLOR_YELLOW, COLOR_BLACK);
    init_pair(4, COLOR_GREEN, COLOR_BLACK);

    curs_set(FALSE);
    raw();
    noecho();
    nodelay(stdscr, TRUE);

    while (1) loop();

    return 1;
}
#else
#endif
