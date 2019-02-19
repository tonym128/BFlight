cmake_minimum_required(VERSION 3.0.0)
project(bFlight64 VERSION 0.1.0)
include_directories( ${MY_SOURCE_DIR} )
include(CTest) 
enable_testing()

if (UNIX)
find_package(Curses REQUIRED)
include_directories(${CURSES_INCLUDE_DIR})
find_package(SDL2 REQUIRED)
include_directories(${SDL2_INCLUDE_DIRS})
endif (UNIX)

add_executable(bFlight64 game.cpp myfont.cpp gameCommon.cpp bsideFly.cpp driveGame.cpp rotoZoomer.cpp mazeRunner.cpp mazeGenerator.cpp plasma.cpp)
set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})

if (UNIX)
    target_link_libraries(bFlight64 ${CURSES_LIBRARIES} ${SDL2_LIBRARIES})
endif (UNIX)

include(CPack)
