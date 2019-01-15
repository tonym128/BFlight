#ifndef MAZEGENERATOR_H
#define MAZEGENERATOR_H

#ifndef GAMECOMMON_H
#include "gameCommon.hpp"
#endif

#include <cctype>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <vector>

#define UP    0
#define DOWN  1
#define LEFT  2
#define RIGHT 3

class Maze
{
private:
	int maze_size[2];

	int start_axis;
	int start_side;
	std::vector< std::vector< int > > dfs_path;

	/*
	 * Structure of the maze vector:
	 *                     |--> Filled in?
	 *   Row --> Collumn --|
	 *                     |--> Has been visited?
	 */
	std::vector< std::vector< std::vector< bool > > > maze;
	bool randomMove(bool first_move);
	void generateMaze();
	void initializeMaze();
	void randomPoint(bool part);
public:
	int startX;
	int startY;
	int endX;
	int endY;

	Maze(int width,int height);
	void printMaze();
	void copyMaze(int worldMap[25][25]);
};

#endif //MAZEGENERATOR_H
