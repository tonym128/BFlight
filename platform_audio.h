#ifndef PLATFORM_AUDIO_H
#define PLATFORM_AUDIO_H 1
#include <AL/al.h>
#include <AL/alc.h>
#include <stdio.h>
#include <iostream>

void audioInit();
void audioDestroy();
void audioLoop();
bool audioPlay(char*);
#endif // PLATFORM_AUDIO_H
