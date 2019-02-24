#ifndef PLATFORM_NOAUDIO_H
#define PLATFORM_NOAUDIO_H 1
#include <stdio.h>
#include <iostream>

inline void audioInit() {}
inline void audioDestroy() {}
inline void audioLoop() {}
inline bool audioPlay(char *fileName) {
    std::cout << "Playing " << fileName << "\r\n";
    return true;
    }
#endif // PLATFORM_NOAUDIO_H
