// https://github.com/s-macke/VoxelSpace
#include "voxel.hpp"

struct Point
{
    FIXPOINT fx, fy, fangle, fmove, fturn, fdeltaMod, fdistance;
    int height, horizon, shift, heightScaleFactor;
    FIXPOINT mapScaleFactor;
};

Point p;

#define INTERLACE
#ifdef INTERLACE
int frame = 1;
#endif
void render(ScreenBuff *screenBuff)
{
#ifdef INTERLACE
    frame += 1;
    if (frame == 3) frame = 1;
#endif

    int mapwidthperiod = map_width - 1;
    int mapheightperiod = map_height - 1;
    int screenwidth = screenBuff->WIDTH;

    FIXPOINT fsinang = FIXPOINT_SIN(p.fangle);
    FIXPOINT fcosang = FIXPOINT_COS(p.fangle);

    int hiddeny[screenBuff->WIDTH];
    for(int i=0; i<screenBuff->WIDTH; i+=1) {
        hiddeny[i] = screenBuff->HEIGHT;
    }

    FIXPOINT fdeltaz = FIXP_1;
    // Draw from front to back
    for(FIXPOINT fz=FIXP_1; fz<p.fdistance; fz+=fdeltaz)
    {
        // 90 degree field of view
        FIXPOINT fplx = FIXP_MULT(-fcosang , fz) - FIXP_MULT(fsinang , fz);
        FIXPOINT fply = FIXP_MULT( fsinang , fz) - FIXP_MULT(fcosang , fz);
        FIXPOINT fprx = FIXP_MULT( fcosang , fz) - FIXP_MULT(fsinang , fz);
        FIXPOINT fpry = FIXP_MULT(-fsinang , fz) - FIXP_MULT(fcosang , fz);
        FIXPOINT fdx = (fprx - fplx) / screenwidth;
        FIXPOINT fdy = (fpry - fply) / screenwidth;
        FIXPOINT finvz = FIXP_DIV(FIXP_1, fz) * 240;

        fplx += p.fx;
        fply += p.fy;

#ifdef INTERLACE
        for(int i=frame; i<screenwidth; i+=2)
#else
        for(int i=0; i<screenwidth; i+=1)
#endif
        {
            int mapoffset = ((FIXP_INT_PART(FIXP_DIV(fply,p.mapScaleFactor)) & mapwidthperiod) << p.shift) + (FIXP_INT_PART(FIXP_DIV(fplx,p.mapScaleFactor)) & mapheightperiod);
            int heightonscreen = (FIXP_TO_INT((p.height - map_data[mapoffset]/p.heightScaleFactor) * finvz) + p.horizon);
            drawVertLine2(screenBuff, i, heightonscreen, hiddeny[i], map_colour[mapoffset]);
            if (heightonscreen < hiddeny[i]) hiddeny[i] = heightonscreen;

            fplx += fdx;
            fply += fdy;
        }

        fdeltaz += p.fdeltaMod;
    }
}

void voxelInput(byte buttonVals, Point *p)
{
    p->fx -= FIXP_MULT(FIXPOINT_SIN(p->fangle) , p->fmove);
    p->fy -= FIXP_MULT(FIXPOINT_COS(p->fangle) , p->fmove);

    if (processKey(buttonVals, P1_Top))
    {
        p->fx -= FIXP_MULT(FIXPOINT_SIN(p->fangle), p->fmove);
        p->fy -= FIXP_MULT(FIXPOINT_COS(p->fangle), p->fmove);
    }
    if (processKey(buttonVals, P1_Bottom))
    {
        p->fx += FIXP_MULT(FIXPOINT_SIN(p->fangle) , p->fmove);
        p->fy += FIXP_MULT(FIXPOINT_COS(p->fangle) , p->fmove);
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
    int mapoffset = (((int)(FIXP_INT_PART(p->fy/p->mapScaleFactor)) & (map_width-1)) << p->shift) + (((int)FIXP_INT_PART(p->fx/p->mapScaleFactor)) & (map_height-1));
    if ((map_data[mapoffset]/p->heightScaleFactor +10) > p->height)
        p->height = map_data[mapoffset]/p->heightScaleFactor + 10;
}

bool voxelLoop(ScreenBuff *screenBuff, byte buttonVals)
{
    voxelInput(buttonVals, &p);
    displayClear(screenBuff, 1, false);
    render(screenBuff);
    return false; // Not done
}

void voxelInit()
{
    p.fdistance = INT_TO_FIXP(800);
    p.fx = INT_TO_FIXP(75);
    p.fy = INT_TO_FIXP(75);
    p.fangle = FLOAT_TO_FIXP(-0.6);

    p.fdeltaMod = FLOAT_TO_FIXP(0.05);
    p.fmove = FLOAT_TO_FIXP(0.5);
    p.fturn = FLOAT_TO_FIXP(0.1);

    p.height = 60;
    p.horizon = 15;
    p.shift = 7;
    p.mapScaleFactor = INT_TO_FIXP(8);
    p.heightScaleFactor = 3;
}
