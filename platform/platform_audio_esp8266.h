#ifndef PLATFORM_AUDIO_H
#define PLATFORM_AUDIO_H 1
#include <Arduino.h>
#include "AudioFileSourceSPIFFS.h"
#include "AudioGeneratorWAV.h"
#include "AudioOutputI2SNoDAC.h"

AudioGeneratorWAV *wav;
AudioFileSourceSPIFFS *file;
AudioOutputI2SNoDAC *out;

inline void audioInit()
{
    out = new AudioOutputI2SNoDAC();
    wav = new AudioGeneratorWAV();
}

inline void audioDestroy()
{
}

inline void audioLoop()
{
    if (wav->isRunning())
    {
        if (!wav->loop())
            wav->stop();
    }
}

inline bool audioPlay(char *filename)
{
    puts(strchr(filename, '/'));
    file = new AudioFileSourceSPIFFS(filename);
    wav->begin(file, out);
    return true;
}

#endif // PLATFORM_AUDIO_H
