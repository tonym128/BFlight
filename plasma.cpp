#include "plasma.hpp"
// Mostly from, with minor edits
// https://github.com/plrang/starfield_esp8266_demo
// Please go check out their awesome demo.

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

class Stars3D
{
    float m_spread;
    float m_speed;
    std::vector<float> m_starX;
    std::vector<float> m_starY;
    std::vector<float> m_starZ;
    
    public:
    Stars3D(int numStars, float spread, float speed)
    {

      m_spread = spread;
      m_speed = speed;

      m_starX.resize(numStars);
      m_starY.resize(numStars);
      m_starZ.resize(numStars);

      for (int i = 0; i < numStars; i++)
      {
        InitStar(i);
      }
    }

    void InitStar(int i)
    {
      m_starX[i] = 2 * ((float)((double)rand() / (double)RAND_MAX) - 0.5f) * m_spread;
      m_starY[i] = 2 * ((float)((double)rand() / (double)RAND_MAX) - 0.5f) * m_spread;
      m_starZ[i] = ((float)((double)rand() / (double)RAND_MAX) + 0.00001f) * m_spread;
    }

    void UpdateAndRender(ScreenBuff* screenBuff, float delta)
    {
      float halfWidth  = SCREEN_WIDTH / 2.0f;
      float halfHeight  = SCREEN_HEIGHT / 2.0f;
      for (unsigned int i = 0; i < m_starX.size(); i++)
      {
        m_starZ[i] -= delta * m_speed;
        if (m_starZ[i] <= 0)
          {
          InitStar(i);
          }
        int x = (int)((m_starX[i] / m_starZ[i]) * halfWidth + halfWidth);
        int y = (int)((m_starY[i] / m_starZ[i]) * halfHeight + halfHeight);

        if (x < 0 || x >= SCREEN_WIDTH || (y < 0 || y >= SCREEN_HEIGHT))
          {
            InitStar(i);
          }
          else
          {
            screenBuff->consoleBuffer[x + y * screenBuff->WIDTH] = 1;
          }
      }
    }
};

Stars3D stars {256, 64.0f, 20.0f};//4096 // 3500 without optimalization ESP8266

float delta = 0.055f;
float delta2 = -0.001f;
float delta3 = -0.00001f;

void plasmaInit() {
}

bool plasmaLoop(ScreenBuff* screenBuff, byte buttonVals) {
	delta2 -= delta3;
  delta -= delta2;
	displayClear(screenBuff, 1, false);
	stars.UpdateAndRender(screenBuff, delta);
	return delta < -0.5;
}
