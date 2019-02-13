#include "game.hpp"

#ifdef _WIN32
#elif __linux
#else
SSD1306Brzo display(0x3c, D1, D4);

/* Shift In  */
const int pinShcp = 15;		//Clock
const int pinStcp = 0;		//Latch
const int pinDataIn = 16; // Data
bool analog = true;
#endif

ScreenBuff screenBuff;
byte buttonVals;

int Game = 2;

#ifdef _WIN32
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
byte getReadShift()
{
	byte buttonVals = 0;

	switch (getch())
	{
	case 68: // key left
		buttonVals = buttonVals | (1 << P1_Left);
		break;
	case 65: // key up
		buttonVals = buttonVals | (1 << P1_Top);
		break;
	case 67: // key right
		buttonVals = buttonVals | (1 << P1_Right);
		break;
	case 66: // key down
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

void sendToScreen()
{

	for (int i = 0; i < screenBuff.WIDTH * screenBuff.HEIGHT; i++)
	{
		int x = i % screenBuff.WIDTH;
		int y = i / screenBuff.WIDTH;
		if (screenBuff.consoleBuffer[i])
		{
			attron(COLOR_PAIR(3));
			mvaddch(y, x, ' ');
			attroff(COLOR_PAIR(3));
		}
		else
		{
			mvaddch(y, x, ' ');
		}
	}
}

#else
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
  if (readAnalogSensor(D6)) {
    Serial.println("[.] Button Left pressed!");
    buttonVals = buttonVals | (1 << P1_Left);
  }
  if (readAnalogSensor(D8)) {
    Serial.println("[.] Button Up pressed!");
    buttonVals = buttonVals | (1 << P1_Top);
  }
  if (readAnalogSensor(D5)) {
    Serial.println("[.] Button Right pressed!");
    buttonVals = buttonVals | (1 << P1_Right);
  }
  if (readAnalogSensor(D7)) {
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

void startBFlight()
{
#ifdef _WIN32
#elif __linux
#else
	File f;
	f = SPIFFS.open("/bFSLogo.XBM", "r");

	if (f)
	{
		int s = f.size();
		Serial.printf("File Opened , Size=%d\r\n", s);

		String data = f.readString();
		//Serial.println(data);
		f.close();

		const char *data1 = data.c_str();
		display.drawXbm(0, 0, 128, 64, (uint8_t *)data1);
		display.display();
		delay(2000);
	}
#endif
}

void startRRush()
{
#ifdef _WIN32
#elif __linux
#else
	File f;
	f = SPIFFS.open("/RoadRushLogo.XBM", "r");

	if (f)
	{
		int s = f.size();
		Serial.printf("File Opened , Size=%d\r\n", s);

		String data = f.readString();
		//Serial.println(data);
		f.close();

		const char *data1 = data.c_str();
		display.drawXbm(0, 0, 128, 64, (uint8_t *)data1);
		display.display();
		delay(2000);
	}
#endif
}

void gameSetup()
{
#ifdef _WIN32
#elif __linux
	setlocale(LC_ALL, "");
	initscr();
	start_color();

	init_pair(3, COLOR_YELLOW, COLOR_WHITE);

	curs_set(FALSE);
	raw();
	noecho();
	nodelay(stdscr, TRUE);
#else
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
	display.init();
	display.displayOn();
	display.flipScreenVertically();
#endif

	switch (Game)
	{
	case 1:
		startBFlight();
		break;
	case 2:
		startRRush();
		break;
	case 3:
		rotoZoomerInit();
		break;
	case 4:
		mazeRunnerInit();
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
		if (driveGameLoop(&screenBuff, buttonVals))
		{
			Game = 5;
		}
		break;
	case 2:
		if (flyGameLoop(&screenBuff, buttonVals))
		{
			startRRush();
			Game = 1;
		}
		break;
	case 3:
		rotoZoomerLoop(&screenBuff, buttonVals);
		break;
	case 4:
		if (mazeRunnerLoop(&screenBuff, buttonVals))
		{
			rotoZoomerInit();
			Game = 3;
		}
		break;
	case 5:
		if (plasmaLoop(&screenBuff, buttonVals))
		{
			mazeRunnerInit();
			Game = 4;
		}

		break;
	}

	drawFPS(&screenBuff);
	sendToScreen();
}

#ifdef _WIN32
int main()
{
	gameSetup();
	while (1)
	{
		std::this_thread::sleep_for(std::chrono::milliseconds(10));
		gameLoop();
	}
	return 1;
}
#elif __linux
int main()
{
	gameSetup();
	while (1)
	{
		std::this_thread::sleep_for(std::chrono::milliseconds(10));
		gameLoop();
	}

	return 1;
}
#else
#endif
