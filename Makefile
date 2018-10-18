# Object files to either reference or create
OBJECTS = bFlight.o myfont.o gameCommon.o driveGame.o bsideFly.o rotoZoomer.o beatemup.o
# The executable file that will be created at the end
EXEC = bFlight
# The flags to use for compilation
CXXFLAGS = -g -Wall -std=c++11
LIBS = -I. -I/usr/include/ncurses -lncurses -lm
# The code compiler to use for compilation
CC = g++

# Perform action on all object files (May or may not exist)
all: $(OBJECTS)
	$(CC) $(CXXFLAGS) -o $(EXEC) $(OBJECTS) $(LIBS)

clean :
	$(RM) ${EXEC}
	$(RM) *.o

run :
	@$(MAKE) && ./$(EXEC) $(ARGS)

# CC=gcc
# CFLAGS=-I. -I/usr/include/ncurses -lncurses -lm
# DEPS = myfont.cpp gameCommon.cpp driveGame.cpp bsideFly.cpp rotoZoomer.cpp
# g++ -g -Wall -std=c++11 -o bFlight bFlight.cpp myfont.cpp gameCommon.cpp driveGame.cpp bsideFly.cpp rotoZoomer.cpp  -I. -I/usr/include/ncurses -lncurses -lm