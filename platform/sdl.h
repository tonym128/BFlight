#include "SDL2\SDL.h"

SDL_Renderer *renderer;
SDL_Window *window;

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

void gameInit()
{
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

  #ifdef _WIN32
  HWND hWnd = GetConsoleWindow();
  ShowWindow(hWnd, SW_HIDE);
  #endif
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
