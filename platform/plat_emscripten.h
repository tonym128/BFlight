#ifdef __EMSCRIPTEN__
#include <emscripten.h>
typedef int byte;
#define SDL 1
#endif

#include "SDL.h"
#include "SDL_main.h"

#include <emscripten.h>
#include <cstdlib>
#include <stdio.h>

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
	if (keystate[SDL_SCANCODE_Q])
	{
		exit(0);
	}

	return buttonVals;
}

void sendToScreen()
{
	SDL_SetRenderDrawColor(renderer, 0, 0, 0, 0);
	SDL_RenderClear(renderer);
	SDL_SetRenderDrawColor(renderer, 255, 255, 255, 0);

	for (int i = 0; i < screenBuff.WIDTH * screenBuff.HEIGHT; i++)
	{
		int x = i % screenBuff.WIDTH;
		int y = i / screenBuff.WIDTH;
		if (screenBuff.consoleBuffer[i])
		{
			SDL_RenderDrawPoint(renderer, x * 4, y * 4);
		}
	}
	SDL_RenderPresent(renderer);
}

void gameInit()
{
}

int main()
{
	SDL_Init(SDL_INIT_VIDEO);
	SDL_CreateWindowAndRenderer(512, 256, 0, &window, &renderer);

	const int simulate_infinite_loop = 1; // call the function repeatedly
	const int fps = 30;										// call the function as fast as the browser wants to render (typically 60fps)
	audioSetup();
	gameInit();
	gameSetup();

	emscripten_set_main_loop(gameLoop, fps, simulate_infinite_loop);

	SDL_DestroyRenderer(renderer);
	SDL_DestroyWindow(window);
	SDL_Quit();

	return EXIT_SUCCESS;
	return 1;
}
