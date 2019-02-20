
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

void gameInit()
{
  
}

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
