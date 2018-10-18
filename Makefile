CFLAGS  = -g -Wall
NAME = bFlight
TARGET = bFlight

all: $(TARGET)
$(TARGET): $(TARGET).c
  	cc $(CFLAGS) -o $(TARGET) $(TARGET).cpp

clean:
    $(RM) $(TARGET)