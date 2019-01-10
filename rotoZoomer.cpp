#include "rotoZoomer.hpp"

int FrameCounter = 0;
Dimensions imageDim;
Dimensions imageDimWinner;
bool direction = false;
const int zoomFactor = 200;
double zoomWinner = 0.8;
bool zoomWinnerDirection = false;
double PI_180 = PI / 180;
/*
class N_Script_Timer
{
    public:
        N_Script_Timer()
        {
            Reset();
        }
		
		void Reset() {
            running = false;
			start_t = std::chrono::system_clock::now();        
			end_t = std::chrono::system_clock::now();        
		}
        void Start() {
            if(running)return;
            running = true;
			start_t = std::chrono::system_clock::now();        
		}
        void End() {
            if(!running)return;
            running = false;
			end_t = std::chrono::system_clock::now();
			milliseconds = std::chrono::duration_cast<std::chrono::milliseconds>(end_t - start_t);
        }

        std::chrono::milliseconds milliseconds;

    private:
        std::chrono::time_point<std::chrono::system_clock> start_t;
        std::chrono::time_point<std::chrono::system_clock> end_t;
        bool running;
};

N_Script_Timer stopwatch;
*/
bool rotatedLogo[defcon_height * defcon_width];
bool rotatedLogo2[defconWinner_height * defconWinner_width];

void rotoZoomerInit() {
	imageDim.width = defcon_width;
	imageDim.height = defcon_height;

	imageDimWinner.width = defconWinner_width;
	imageDimWinner.height = defconWinner_height;

	imageDim.y = 0;
	imageDim.x = 32;
}

void rotoZoomerLoop(ScreenBuff* screenBuff, byte buttonVals) {
/*
	stopwatch.Reset();
	stopwatch.Start();
*/
	double zoom = (FrameCounter % zoomFactor) / (double)zoomFactor;
	if (FrameCounter % zoomFactor == 0) 
		direction = !direction;

	if (direction)
		zoom = (zoomFactor / double(zoomFactor)) - zoom;

	if (zoomWinner > 1.1 || zoomWinner < 0.6) {
		zoomWinnerDirection = !zoomWinnerDirection;
	}
  
	zoomWinner += zoomWinnerDirection ? 0.012 : -0.012;

//	for (int i = 0; i < 100; i++) {
		rotateObject(imageDim, FrameCounter * PI_180, zoom, defcon_image, rotatedLogo);
		displayClear(screenBuff, 1, false);
		drawObject(screenBuff, imageDim, (const bool*)rotatedLogo);
		imageDimWinner.x = 0;
		rotateObject(imageDimWinner, PI_180, zoomWinner, defconWinner_image, rotatedLogo2);
		drawObject(screenBuff, imageDimWinner, rotatedLogo2);
		imageDimWinner.x = 96;
		flipObject(imageDimWinner, rotatedLogo2,rotatedLogo);
		drawObject(screenBuff, imageDimWinner, rotatedLogo);
//	};

	FrameCounter++;

/*
	char fps[16];
	stopwatch.End();
	sprintf(fps,"%i - %lli",FrameCounter, stopwatch.milliseconds.count());
	for (int i = 0; i < static_cast<int>(strlen(fps)); i++) {
		drawCharacter(screenBuff, fps[i], 8 * i, 0);
	}
*/
	return;
}
