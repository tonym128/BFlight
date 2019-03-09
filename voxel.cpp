// https://github.com/s-macke/VoxelSpace
#include "voxel.hpp"

struct Point
{
    FIXPOINT fx, fy, fangle;
    int height, horizon, distance, shift, mapScaleFactor, heightScaleFactor;
};

Point p;

void render(ScreenBuff *screenBuff, Point p)
{
    int mapwidthperiod = map_width - 1;
    int mapheightperiod = map_height - 1;
    int screenwidth = screenBuff->WIDTH;

    FIXPOINT fdeltaMod = FLOAT_TO_FIXP(0.05);
    FIXPOINT fsinang = FIXPOINT_SIN(p.fangle);
    FIXPOINT fcosang = FIXPOINT_COS(p.fangle);

    int hiddeny[screenBuff->WIDTH];
    for(int i=0; i<screenBuff->WIDTH; i+=1) {
        hiddeny[i] = screenBuff->HEIGHT;
    }

    FIXPOINT fdeltaz = FLOAT_TO_FIXP(1.);
    // Draw from front to back
    for(FIXPOINT fz=INT_TO_FIXP(1); fz<INT_TO_FIXP(p.distance); fz+=fdeltaz)
    {
        // 90 degree field of view
        FIXPOINT fplx = FIXP_MULT(-fcosang , fz) - FIXP_MULT(fsinang , fz);
        FIXPOINT fply = FIXP_MULT( fsinang , fz) - FIXP_MULT(fcosang , fz);
        FIXPOINT fprx = FIXP_MULT( fcosang , fz) - FIXP_MULT(fsinang , fz);
        FIXPOINT fpry = FIXP_MULT(-fsinang , fz) - FIXP_MULT(fcosang , fz);
        FIXPOINT fdx = (fprx - fplx) / screenwidth;
        FIXPOINT fdy = (fpry - fply) / screenwidth;
        FIXPOINT finvz = FIXP_DIV(INT_TO_FIXP(1), fz) * 240;

        fplx += p.fx;
        fply += p.fy;

        for(int i=0; i<screenwidth; i+=1)
        {
            int mapoffset = ((FIXP_INT_PART(FIXP_DIV(fply,INT_TO_FIXP(p.mapScaleFactor))) & mapwidthperiod) << p.shift) + (FIXP_INT_PART(FIXP_DIV(fplx,INT_TO_FIXP(p.mapScaleFactor))) & mapheightperiod);
            int heightonscreen = (FIXP_TO_INT((p.height - map_data[mapoffset]/p.heightScaleFactor) * finvz) + p.horizon);
            drawVertLine2(screenBuff, i, heightonscreen, hiddeny[i], map_colour[mapoffset]);
            if (heightonscreen < hiddeny[i]) hiddeny[i] = heightonscreen;

            fplx += fdx;
            fply += fdy;
        }

        fdeltaz += fdeltaMod;
    }
}

void voxelInput(byte buttonVals, Point *p)
{
    p->fx -= FIXP_MULT(FIXPOINT_SIN(p->fangle) , FLOAT_TO_FIXP(0.5));
    p->fy -= FIXP_MULT(FIXPOINT_COS(p->fangle) , FLOAT_TO_FIXP(0.5));

    if (processKey(buttonVals, P1_Top))
    {
        p->fx -= FIXP_MULT(FIXPOINT_SIN(p->fangle), FLOAT_TO_FIXP(0.5));
        p->fy -= FIXP_MULT(FIXPOINT_COS(p->fangle), FLOAT_TO_FIXP(0.5));
    }
    if (processKey(buttonVals, P1_Bottom))
    {
        p->fx += FIXP_MULT(FIXPOINT_SIN(p->fangle) , FLOAT_TO_FIXP(0.5));
        p->fy += FIXP_MULT(FIXPOINT_COS(p->fangle) , FLOAT_TO_FIXP(0.5));
    }
    if (processKey(buttonVals, P1_Left))
    {
        p->fangle += FLOAT_TO_FIXP(0.1);
    }
    if (processKey(buttonVals, P1_Right))
    {
        p->fangle -= FLOAT_TO_FIXP(0.1);
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
    p.fx = INT_TO_FIXP(75);
    p.fy = INT_TO_FIXP(75);
    p.fangle = FLOAT_TO_FIXP(-0.4);

    p.height = 30;
    p.horizon = 0;
    p.distance = 800;
    p.shift = 7;
    p.mapScaleFactor = 8;
    p.heightScaleFactor = 3;
}
