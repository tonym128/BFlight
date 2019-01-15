#ifndef MAZERUNNER_H
#define MAZERUNNER_H

#ifndef GAMECOMMON_H
#include "gameCommon.hpp"
#endif //GAMECOMMON_H

#ifndef ROTOZOOMER_H
#include "rotoZoomer.hpp"
#endif //ROTOZOOMER_H

#ifndef MYFONT_H_
#include "myfont.hpp"
#endif //MYFONT_H_

void mazeRunnerLoop(ScreenBuff*, byte);
void mazeRunnerInit();

#endif //MAZERUNNER_H
