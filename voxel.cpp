// https://github.com/s-macke/VoxelSpace
#include "voxel.hpp"

struct Point
{
    FIXPOINT fx, fy, fangle, fmove, fturn, fdeltaMod, fdistance;
    int height, horizon, shift;
    FIXPOINT mapScaleFactor;

    int mapwidthperiod, mapheightperiod;
};

Point p;

// #define INTERLACE
#ifdef INTERLACE
int frame = 0;
#endif

#define CACHESIZE 3
#define MAPSIZE map_height *map_width

int8_t cmap[CACHESIZE];
bool ccolor[CACHESIZE];
int cmapOffset = -1;

void render(ScreenBuff *screenBuff)
{
    int cachehit = 0;
    int cachemiss = 0;

#ifdef INTERLACE
    frame += 1;
    if (frame == 2)
        frame = 0;
#endif

    FIXPOINT fsinang = FIXPOINT_SIN(p.fangle);
    FIXPOINT fcosang = FIXPOINT_COS(p.fangle);

    int hiddeny[screenBuff->WIDTH];
    for (int i = 0; i < screenBuff->WIDTH; i += 1)
    {
        hiddeny[i] = screenBuff->HEIGHT;
#ifdef INTERLACE
        if (i % 2 == frame)
            drawVertLine2(screenBuff, i, 0, screenBuff->HEIGHT, 0);
#endif
    }

    FIXPOINT fdeltaz = FIXP_1;
    // Draw from front to back
    for (FIXPOINT fz = FIXP_1; fz < p.fdistance; fz += fdeltaz)
    {
        // 90 degree field of view
        FIXPOINT fsinfz = FIXP_MULT(fsinang, fz);
        FIXPOINT fcosfz = FIXP_MULT(fcosang, fz);

        FIXPOINT fplx = FIXP_MULT(-fcosang, fz) - fsinfz;
        FIXPOINT fply = fsinfz - fcosfz;
        FIXPOINT fprx = fcosfz - fsinfz;
        FIXPOINT fpry = FIXP_MULT(-fsinang, fz) - fcosfz;
        FIXPOINT fdx = (fprx - fplx) / screenBuff->WIDTH;
        FIXPOINT fdy = (fpry - fply) / screenBuff->WIDTH;
        FIXPOINT finvz = FIXP_DIV(FIXP_1, fz) * 240;

        fplx += p.fx;
        fply += p.fy;

#ifdef INTERLACE
        for (int i = frame; i < screenBuff->WIDTH; i += 2)
#else
        for (int i = 0; i < screenBuff->WIDTH; i += 1)
#endif
        {
            if (hiddeny[i] >= -5)
            {
                int mapoffset = ((FIXP_INT_PART(FIXP_DIV(fply, p.mapScaleFactor)) & p.mapwidthperiod) << p.shift) + (FIXP_INT_PART(FIXP_DIV(fplx, p.mapScaleFactor)) & p.mapheightperiod);
                if (((cmapOffset <= mapoffset) && (cmapOffset + CACHESIZE > mapoffset))) // || ( cmapOffset+CACHESIZE % MAPSIZE > mapoffset && cmapOffset >= 0))
                {
                    cachehit += 1;
                }
                else
                {
                    cmapOffset = mapoffset;
                    if (mapoffset + CACHESIZE > MAPSIZE)
                    {
                        memcpy(cmap, map_data + mapoffset * sizeof(int8_t), (mapoffset + CACHESIZE - MAPSIZE) * sizeof(int8_t));
                        memcpy(ccolor, map_colour + mapoffset * sizeof(bool), (mapoffset + CACHESIZE - MAPSIZE) * sizeof(bool));
                        // memcpy(cmap + (mapoffset + CACHESIZE - MAPSIZE)*sizeof(int8_t), map_data, (MAPSIZE - mapoffset + CACHESIZE)*sizeof(int8_t));
                        // memcpy(ccolor + (mapoffset + CACHESIZE - MAPSIZE)*sizeof(int8_t), map_colour, (MAPSIZE - mapoffset + CACHESIZE)*sizeof(bool));
                    }
                    else
                    {
                        memcpy(cmap, map_data + mapoffset * sizeof(int8_t), CACHESIZE * sizeof(int8_t));
                        memcpy(ccolor, map_colour + mapoffset * sizeof(bool), CACHESIZE * sizeof(bool));
                    }
                    cachemiss++;
                }

                int heightonscreen = (FIXP_TO_INT((p.height - cmap[mapoffset - cmapOffset]) * finvz) + p.horizon);
                if (heightonscreen < hiddeny[i])
                {
                    drawVertLine2(screenBuff, i, heightonscreen, hiddeny[i], ccolor[mapoffset - cmapOffset]);
                    hiddeny[i] = heightonscreen;
                }

                fplx += fdx;
                fply += fdy;
            }
        }

        fdeltaz += p.fdeltaMod;
    }
}

void voxelInput(byte buttonVals, Point *p)
{
    p->fx -= FIXP_MULT(FIXPOINT_SIN(p->fangle), p->fmove);
    p->fy -= FIXP_MULT(FIXPOINT_COS(p->fangle), p->fmove);

    if (processKey(buttonVals, P1_Top))
    {
        p->fx -= FIXP_MULT(FIXPOINT_SIN(p->fangle), p->fmove);
        p->fy -= FIXP_MULT(FIXPOINT_COS(p->fangle), p->fmove);
    }
    if (processKey(buttonVals, P1_Bottom))
    {
        p->fx += FIXP_MULT(FIXPOINT_SIN(p->fangle), p->fmove);
        p->fy += FIXP_MULT(FIXPOINT_COS(p->fangle), p->fmove);
    }
    if (processKey(buttonVals, P1_Left))
    {
        p->fangle += p->fturn;
    }
    if (processKey(buttonVals, P1_Right))
    {
        p->fangle -= p->fturn;
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
    int mapoffset = (((int)(FIXP_INT_PART(p->fy / p->mapScaleFactor)) & (map_width - 1)) << p->shift) + (((int)FIXP_INT_PART(p->fx / p->mapScaleFactor)) & (map_height - 1));
    if ((map_data[mapoffset] + 10) > p->height)
        p->height = map_data[mapoffset] + 10;
}

bool voxelLoop(ScreenBuff *screenBuff, byte buttonVals)
{
    voxelInput(buttonVals, &p);
#ifndef INTERLACE
    displayClear(screenBuff, 1, false);
#endif
    render(screenBuff);
    return false; // Not done
}

void voxelInit()
{
    p.mapwidthperiod = map_width - 1;
    p.mapheightperiod = map_height - 1;

    p.fdistance = INT_TO_FIXP(600);
    p.fx = INT_TO_FIXP(75);
    p.fy = INT_TO_FIXP(75);
    p.fangle = FLOAT_TO_FIXP(-0.6);

    p.fdeltaMod = FLOAT_TO_FIXP(0.2);
    p.fmove = FLOAT_TO_FIXP(1.);
    p.fturn = FLOAT_TO_FIXP(0.1);

    p.height = 60;
    p.horizon = -30;
    p.shift = 7;
    p.mapScaleFactor = INT_TO_FIXP(8);
}
