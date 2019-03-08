// https://github.com/s-macke/VoxelSpace
#include "voxel.hpp"

struct Point
{
    double x, y, height, angle;
    int horizon;
    int distance;
    int shift;
};

Point p;

void render(ScreenBuff *screenBuff, Point p)
{
    int mapwidthperiod = map_width - 1;
    int mapheightperiod = map_height - 1;
    int screenwidth = screenBuff->WIDTH;
    double sinang = sin(p.angle);
    double cosang = cos(p.angle);
    int hiddeny[screenBuff->WIDTH];
    for(int i=0; i<screenBuff->WIDTH; i+=1) {
        hiddeny[i] = screenBuff->HEIGHT;
    }

    double deltaz = 1.;
    // Draw from front to back
    for(double z=1; z<p.distance; z+=deltaz)
    {
        // 90 degree field of view
        double plx =  -cosang * z - sinang * z;
        double ply =   sinang * z - cosang * z;
        double prx =   cosang * z - sinang * z;
        double pry =  -sinang * z - cosang * z;
        double dx = (prx - plx) / screenwidth;
        double dy = (pry - ply) / screenwidth;
        plx += p.x;
        ply += p.y;
        double invz = 1.0f / z * 240.0f;
        for(int i=0; i<screenwidth; i+=1)
        {
            int mapoffset = (((((int)floor(ply/4)) & mapwidthperiod)) << p.shift) + (((int)floor(plx/4)) & mapheightperiod);
            int heightonscreen = (int)((p.height - map_data[mapoffset]/3) * invz + p.horizon);
            drawVertLine2(screenBuff, i, heightonscreen / 3, hiddeny[i], map_colour[mapoffset]);
            if (heightonscreen < hiddeny[i]) hiddeny[i] = heightonscreen;
            plx += dx;
            ply += dy;
        }
        deltaz += 0.005;
    }
}

void voxelInput(byte buttonVals, Point *p)
{
    p->x -= sin(p->angle) * 0.5;
    p->y -= cos(p->angle) * 0.5;

    if (processKey(buttonVals, P1_Top))
    {
        p->x -= sin(p->angle) * 0.5;
        p->y -= cos(p->angle) * 0.5;
    }
    if (processKey(buttonVals, P1_Bottom))
    {
        p->x += sin(p->angle) * 0.5;
        p->y += cos(p->angle) * 0.5;
    }
    if (processKey(buttonVals, P1_Left))
    {
        p->angle += 0.1;
    }
    if (processKey(buttonVals, P1_Right))
    {
        p->angle -= 0.1;
    }

    if (processKey(buttonVals, P2_Top))
    {
        p->height += 1;
    }
    if (processKey(buttonVals, P2_Bottom))
    {
        p->height -= 1;
    }
    if (processKey(buttonVals, P2_Left))
    {
        p->horizon += 1;
    }
    if (processKey(buttonVals, P2_Right))
    {
        p->horizon -= 1;
    }

    // Collision detection. Don't fly below the surface.
    int mapoffset = (((int)(floor(p->y/4)) & (map_width-1)) << p->shift) + (((int)floor(p->x/4)) & (map_height-1));
    if ((map_data[mapoffset]/3 +10) > p->height) 
        p->height = map_data[mapoffset]/3 + 10;
}

bool voxelLoop(ScreenBuff *screenBuff, byte buttonVals)
{
    voxelInput(buttonVals, &p);
    // Call the render function with the camera parameters:
    // position, viewing angle, height, horizon line position,
    // scaling factor for the height, the largest distance,
    // screen width and the screen height parameter
    displayClear(screenBuff, 1, false);
    render(screenBuff,p);
    return false; // Not done
}

void voxelInit()
{
    p.x = 75;
    p.y = 75;
    p.height = 52;
    p.horizon = -36;
    p.distance = 300;
    p.shift = 7;
    p.angle = -0.4;
}
