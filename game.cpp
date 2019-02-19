// #define AUDIO
#ifdef SDL2_FOUND
  #define SDL
#endif

#include "game.hpp"

#ifdef SDL
SDL_Renderer *renderer;
SDL_Window *window;
#elif _WIN32
#elif __linux
#elif ARDUINO
SSD1306Brzo display(0x3c, D1, D4);

/* Shift In  */
const int pinShcp = 15;   //Clock
const int pinStcp = 0;    //Latch
const int pinDataIn = 16; // Data
bool analog = true;
#endif

ScreenBuff screenBuff;
byte buttonVals;

int Game = 1;

#ifdef SDL
byte getReadShift()
{
	byte buttonVals = 0;
	SDL_PumpEvents();
	const Uint8 *keystate = SDL_GetKeyboardState(NULL);
	if (keystate[SDL_SCANCODE_UP])
		buttonVals = buttonVals | (1 << P1_Top);
	if (keystate[SDL_SCANCODE_DOWN])
		buttonVals = buttonVals | (1 << P1_Bottom);
	if (keystate[SDL_SCANCODE_LEFT])
		buttonVals = buttonVals | (1 << P1_Left);
	if (keystate[SDL_SCANCODE_RIGHT])
		buttonVals = buttonVals | (1 << P1_Right);
	if (keystate[SDL_SCANCODE_W])
		buttonVals = buttonVals | (1 << P2_Top);
	if (keystate[SDL_SCANCODE_A])
		buttonVals = buttonVals | (1 << P2_Left);
	if (keystate[SDL_SCANCODE_S])
		buttonVals = buttonVals | (1 << P2_Bottom);
	if (keystate[SDL_SCANCODE_D])
		buttonVals = buttonVals | (1 << P2_Right);
	if (keystate[SDL_SCANCODE_Q]) {
		SDL_DestroyWindow(window);
		exit(0);
	}

	return buttonVals;
}

void sendToScreen()
{
	for (int i = 0; i < screenBuff.WIDTH * screenBuff.HEIGHT; i++)
	{
		int x = i % screenBuff.WIDTH;
		int y = i / screenBuff.WIDTH;
		if (screenBuff.consoleBuffer[i])
		{
			SDL_SetRenderDrawColor(renderer, 255, 255, 255, 0);
		}
		else
		{
			SDL_SetRenderDrawColor(renderer, 0, 0, 0, 0);
		}

		SDL_RenderDrawPoint(renderer, x * 4, y * 4);
	}
	SDL_RenderPresent(renderer);
}
#elif _WIN32
COORD charBufSize;
COORD characterPos;
SMALL_RECT writeArea;
void SetConsoleFont()
{
  HANDLE wHnd;
  wHnd = GetStdHandle(STD_OUTPUT_HANDLE);

  CONSOLE_FONT_INFOEX cfi;
  cfi.cbSize = sizeof(cfi);
  cfi.nFont = 0;
  cfi.dwFontSize.X = 6; // Width of each character in the font
  cfi.dwFontSize.Y = 6; // Height
  cfi.FontFamily = FF_DONTCARE;
  cfi.FontWeight = FW_NORMAL;
  //wcscpy_s(cfi.FaceName, L"Consolas"); // Choose your font
  SetCurrentConsoleFontEx(wHnd, FALSE, &cfi);
}

bool processWinKey(int key)
{
  if (GetAsyncKeyState(key) & 0x8000)
    return true;
  return false;
}

byte getReadShift()
{
  byte buttonVals = 0;
  if (processWinKey(VK_LEFT))
    buttonVals = buttonVals | (1 << P1_Left);
  if (processWinKey(VK_UP))
    buttonVals = buttonVals | (1 << P1_Top);
  if (processWinKey(VK_RIGHT))
    buttonVals = buttonVals | (1 << P1_Right);
  if (processWinKey(VK_DOWN))
    buttonVals = buttonVals | (1 << P1_Bottom);
  if (processWinKey('D'))
    buttonVals = buttonVals | (1 << P2_Right);
  if (processWinKey('S'))
    buttonVals = buttonVals | (1 << P2_Bottom);
  if (processWinKey('A'))
    buttonVals = buttonVals | (1 << P2_Left);
  if (processWinKey('W'))
    buttonVals = buttonVals | (1 << P2_Top);
  if (processWinKey('Q'))
    exit(0);

  return buttonVals;
}

void sendToScreen()
{
  // Write the display
  HANDLE wHnd;
  wHnd = GetStdHandle(STD_OUTPUT_HANDLE);
  SetConsoleFont();
  // Set up the positions
  charBufSize = {128, 64};
  characterPos = {0, 0};
  writeArea = {0, 0, 128 - 1, 64 - 1};
  CHAR_INFO console[128 * 64];
  for (int pixel = 0; pixel < 128 * 64; pixel++)
  {
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
#elif ARDUINO
#ifdef AUDIO
AudioGeneratorWAV *wav;
AudioFileSourceSPIFFS *file;
AudioOutputI2S *out;
#endif

int inputVal = 0;
bool readAnalogSensor(int pin)
{
  digitalWrite(pin, HIGH);

  inputVal = analogRead(A0);

  digitalWrite(pin, LOW);
  return inputVal > 20;
}

byte getReadShiftAnalog()
{
  byte buttonVals = 0;
  if (readAnalogSensor(D6))
  {
    Serial.println("[.] Button Left pressed!");
    buttonVals = buttonVals | (1 << P1_Left);
  }
  if (readAnalogSensor(D8))
  {
    Serial.println("[.] Button Up pressed!");
    buttonVals = buttonVals | (1 << P1_Top);
  }
  if (readAnalogSensor(D5))
  {
    Serial.println("[.] Button Right pressed!");
    buttonVals = buttonVals | (1 << P1_Right);
  }
  if (readAnalogSensor(D7))
  {
    Serial.println("[.] Button Down pressed!");
    buttonVals = buttonVals | (1 << P1_Bottom);
  }
  /*
    if (readAnalogSensor(D5))
      buttonVals = buttonVals | (1 << P2_Left);
    if (readAnalogSensor(D6))
      buttonVals = buttonVals | (1 << P2_Top);
    if (readAnalogSensor(D7))
      buttonVals = buttonVals | (1 << P2_Right);
    if (readAnalogSensor(D8))
      buttonVals = buttonVals | (1 << P2_Bottom);
  */

  return buttonVals;
}

byte getReadShiftDigital()
{
  int inputPin = 1;
  int buttonPressedVal = 1; //Depending on how buttons are wired
  digitalWrite(pinStcp, LOW);
  delayMicroseconds(20);
  digitalWrite(pinStcp, HIGH);

  byte buttonVals = 0;
  for (int i = 0; i < 8; i++)
  {
    digitalWrite(pinShcp, LOW);
    delayMicroseconds(20);
    inputPin = digitalRead(pinDataIn);
    if (inputPin == buttonPressedVal)
    {
      buttonVals = buttonVals | (1 << i);
    }

    digitalWrite(pinShcp, HIGH);
  }

  return buttonVals;
}

byte getReadShift()
{
  if (analog)
    return getReadShiftAnalog();

  return getReadShiftDigital();
}

void sendToScreen()
{
  display.setColor(BLACK);
  display.clear();
  int x = 0;
  int y = 0;

  display.setColor(WHITE);
  for (int i = 0; i < screenBuff.WIDTH * screenBuff.HEIGHT; i++)
  {
    if (screenBuff.consoleBuffer[i])
    {
      int x = i % screenBuff.WIDTH;
      int y = i / screenBuff.WIDTH;
      display.setPixel(x, y);
    }
  }

  display.display();
}
#endif

void showLogo(const bool logo[])
{
  Dimensions dim;
  dim.height = logo_height;
  dim.width = logo_width;
  dim.x = 0;
  dim.y = 0;

  drawObject(&screenBuff, dim, logo);
  initTime();
  sendToScreen();
  updateMinTime(4000);
}

void gameInit()
{
#ifdef SDL
	SDL_Init(SDL_INIT_VIDEO);
	window = SDL_CreateWindow(
		"ESP8266Gamer",
		SDL_WINDOWPOS_UNDEFINED,
		SDL_WINDOWPOS_UNDEFINED,
		512,
		256,
		0);

	renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_SOFTWARE);
	SDL_SetRenderDrawColor(renderer, 0, 0, 0, SDL_ALPHA_OPAQUE);
	SDL_RenderClear(renderer);
	SDL_RenderPresent(renderer);
	SDL_SetRenderDrawColor(renderer, 0, 0, 0, 0);
	SDL_RenderClear(renderer);
#elif _WIN32
#elif __linux
    setlocale(LC_ALL, "");
    initscr();
    start_color();

    init_pair(3, COLOR_YELLOW, COLOR_WHITE);

    curs_set(FALSE);
    raw();
    noecho();
    nodelay(stdscr, TRUE);
#elif ARDUINO
  /* shift in */
  if (analog)
  {
    pinMode(D5, OUTPUT);
    pinMode(D6, OUTPUT);
    pinMode(D7, OUTPUT);
    pinMode(D8, OUTPUT);
    digitalWrite(D5, LOW);
    digitalWrite(D6, LOW);
    digitalWrite(D7, LOW);
    digitalWrite(D8, LOW);
  }
  else
  {
    pinMode(pinStcp, OUTPUT);
    pinMode(pinShcp, OUTPUT);
    pinMode(pinDataIn, INPUT);

    /* shift out */
    pinMode(latchPin, OUTPUT);
    pinMode(dataPin, OUTPUT);
    pinMode(clockPin, OUTPUT);
  }

  // Startup SPIFFS Storage
  SPIFFS.begin();

  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println("Startup");

#ifdef AUDIO
  file = new AudioFileSourceSPIFFS("/carStart.wav");
  out = new AudioOutputI2SNoDAC();
  wav = new AudioGeneratorWAV();
  wav->begin(file, out);
#endif

  display.init();
  display.displayOn();
  display.flipScreenVertically();

#endif
}

void gameSetup()
{
  switch (Game)
  {
  case 1:
    showLogo(logo_fly);
    break;
  case 2:
    showLogo(logo_drive);
    break;
  case 3:
    showLogo(logo_maze);
    mazeRunnerInit();
    break;
  case 4:
    rotoZoomerInit();
    break;
  case 5:
    break;
  }
}

void gameLoop()
{
  // put your main code here, to run repeatedly:
  buttonVals = getReadShift();

  switch (Game)
  {
  case 1:
    if (flyGameLoop(&screenBuff, buttonVals))
    {
      Game = 2;
      gameSetup();
    }
    break;
  case 2:
    if (driveGameLoop(&screenBuff, buttonVals))
    {
      Game = 5;
      gameSetup();
    }
    break;
  case 3:
    if (mazeRunnerLoop(&screenBuff, buttonVals))
    {
      Game = 4;
      gameSetup();
    }
    break;
  case 4:
    rotoZoomerLoop(&screenBuff, buttonVals);
    break;
  case 5:
    if (plasmaLoop(&screenBuff, buttonVals))
    {
      Game = 3;
      gameSetup();
    }

    break;
  }

  calcFPS();
#ifdef FPS // Define this to show the FPS for the game
  drawFPS(&screenBuff);
#endif
#ifdef AUDIO
#ifdef ARDUINO
  if (wav->isRunning())
  {
    if (!wav->loop())
      wav->stop();
    if (processKey(buttonVals, P1_Top))
    {
      wav->stop();
    }
  }
  else
  {
    if (processKey(buttonVals, P1_Bottom))
    {
      //file = new AudioFileSourceSPIFFS("/carStart.wav");
      //out = new AudioOutputI2SNoDAC();
      //wav = new AudioGeneratorWAV();
      wav->begin(file, out);
    }
  }
#endif // ARDUINO
#endif // AUDIO

  sendToScreen();
  updateMinTime(33);
}

#ifdef _WIN32
int main(int argc, char*argv[])
{
  gameInit();
  gameSetup();
  while (1)
  {
    gameLoop();
  }
  return 1;
}
#elif __linux
int main(int argc, char*argv[])
{
  gameInit();
  gameSetup();
  while (1)
  {
    gameLoop();
  }

  return 1;
}
#else
#endif
