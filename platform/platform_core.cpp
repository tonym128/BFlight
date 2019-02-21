#include "platform_core.h"

// Platform Specific Code
#ifdef _WIN32
void gameSleep(int sleepMS) {
		std::this_thread::sleep_for(std::chrono::milliseconds(sleepMS));
}

int getTimeInMillis() {
	std::chrono::system_clock::time_point t = std::chrono::system_clock::now();
	auto now = std::chrono::system_clock::now().time_since_epoch();
	auto t100ms = std::chrono::milliseconds(100);
	auto time = now + t100ms;
    return static_cast<int>(std::chrono::duration_cast<std::chrono::milliseconds>(time).count());
}

#elif __EMSCRIPTEN__
void gameSleep(int sleepMS) {
		struct timespec ts;
		ts.tv_sec = (sleepMS) / 1000;
		ts.tv_nsec = ((sleepMS) % 1000) * 1000000;
		nanosleep(&ts, NULL);
}

int getTimeInMillis() {
    struct timeval te; 
    gettimeofday(&te, NULL); // get current time
    long long milliseconds = te.tv_sec*1000LL + te.tv_usec/1000; // calculate milliseconds
    // printf("milliseconds: %lld\n", milliseconds);
    return milliseconds;
}
#elif __linux
void gameSleep(int sleepMS) {
		struct timespec ts;
		ts.tv_sec = (sleepMS) / 1000;
		ts.tv_nsec = ((sleepMS) % 1000) * 1000000;
		nanosleep(&ts, NULL);
}

int getTimeInMillis() {
    struct timeval te; 
    gettimeofday(&te, NULL); // get current time
    long long milliseconds = te.tv_sec*1000LL + te.tv_usec/1000; // calculate milliseconds
    // printf("milliseconds: %lld\n", milliseconds);
    return milliseconds;
}
#elif ARDUINO
int gameSleep(int sleepMS) {
	delay(sleepMs);
}

int getTimeInMillis() {
	return millis();
}
#endif
