#ifndef PLATFORM_NOAUDIO_H
#define PLATFORM_NOAUDIO_H 1

inline void audioInit() {}
inline void audioDestroy() {}
inline void audioLoop() {}
inline bool audioPlay(char *fileName) {return true;}
#endif // PLATFORM_NOAUDIO_H
