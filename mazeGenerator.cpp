/*
 * Maze Generator:
 *   Made by Jaden Peterson in 2016
 */

/*
  * This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
   * This program uses the Direct-First Search algorithm
   *   You can learn more about it at:
   *     https://en.wikipedia.org/wiki/Maze_generation_algorithm#Depth-first_search
*/

#include "mazeGenerator.hpp"

// Select a random direction based on our options, append it to the current path, and move there
bool Maze::randomMove(bool first_move)
{
	int random_neighbor;
	std::vector<std::vector<int>> unvisited_neighbors;

	for (int direction = 0; direction < 4; direction++)
	{
		int possible_pmd[2] = {0, 0};

		if (direction == UP)
		{
			possible_pmd[1] = -1;
		}
		else if (direction == DOWN)
		{
			possible_pmd[1] = 1;
		}
		else if (direction == LEFT)
		{
			possible_pmd[0] = -1;
		}
		else
		{
			possible_pmd[0] = 1;
		}

		if (dfs_path.back()[0] + possible_pmd[0] * 2 > 0 &&
			dfs_path.back()[0] + possible_pmd[0] * 2 < maze_size[0] - 1 &&
			dfs_path.back()[1] + possible_pmd[1] * 2 > 0 &&
			dfs_path.back()[1] + possible_pmd[1] * 2 < maze_size[1] - 1)
		{
			if (!maze[dfs_path.back()[1] + possible_pmd[1] * 2]
					 [dfs_path.back()[0] + possible_pmd[0] * 2][1])
			{
				std::vector<int> possible_move_delta = {possible_pmd[0], possible_pmd[1]};

				unvisited_neighbors.push_back(possible_move_delta);
			}
		}
	}

	if (unvisited_neighbors.size() > 0)
	{
		random_neighbor = rand() % unvisited_neighbors.size();

		for (int a = 0; a < !first_move + 1; a++)
		{
			std::vector<int> new_location;

			new_location.push_back(dfs_path.back()[0] + unvisited_neighbors[random_neighbor][0]);
			new_location.push_back(dfs_path.back()[1] + unvisited_neighbors[random_neighbor][1]);

			dfs_path.push_back(new_location);

			maze[dfs_path.back()[1]][dfs_path.back()[0]][0] = false;
			maze[dfs_path.back()[1]][dfs_path.back()[0]][1] = true;
		}

		return true;
	}
	else
	{
		return false;
	}
}

// The fun part ;)
void Maze::generateMaze()
{
	bool first_move = true;
	bool success = true;

	while ((int)dfs_path.size() > 1 - first_move)
	{
		if (!success)
		{
			dfs_path.pop_back();

			if (!first_move && dfs_path.size() > 2)
			{
				dfs_path.pop_back();
			}
			else
			{
				break;
			}

			success = true;
		}

		while (success)
		{
			success = randomMove(first_move);

			if (first_move)
			{
				first_move = false;
			}
		}
	}
}

// Initialize the maze vector with a completely-filled grid with the size the user specified
void Maze::initializeMaze()
{
	time_t now = time(nullptr);
	std::srand((int)now); // use current time as seed for random generator

	for (int a = 0; a < maze_size[1]; a++)
	{
		for (int b = 0; b < maze_size[0]; b++)
		{
			bool is_border;

			if (a == 0 || a == maze_size[1] - 1 ||
				b == 0 || b == maze_size[0] - 1)
			{
				is_border = true;
			}
			else
			{
				is_border = false;
			}

			std::vector<bool> new_cell = {true, is_border};

			if ((unsigned int)a + 1 > maze.size())
			{
				std::vector<std::vector<bool>> new_row = {new_cell};

				maze.push_back(new_row);
			}
			else
			{
				maze[a].push_back(new_cell);
			}
		}
	}
}

void Maze::printMaze()
{
	for (unsigned int a = 0; a < maze.size(); a++)
	{
		for (unsigned int b = 0; b < maze[a].size(); b++)
		{
			if (maze[a][b][0])
			{
				std::cout << "!";
			}
			else
			{
				std::cout << " ";
			}
		}

		std::cout << std::endl;
	}
}

void Maze::copyMaze(int worldMap[25][25])
{
	for (unsigned int a = 0; a < maze.size() && a < 30; a++)
	{
		for (unsigned int b = 0; b < maze[a].size() && b < 30; b++)
		{
			worldMap[a][b] = maze[a][b][0] ? 2 : 0;
		}
	}
}

// Set a random point (start or end)
void Maze::randomPoint(bool part)
{
	int axis;
	int side;

	if (!part)
	{
		// Start
		axis = rand() % 2;
		side = rand() % 2;

		start_axis = axis;
		start_side = side;
	}
	else
	{
		// End
		bool done = false;

		while (!done)
		{
			axis = rand() % 2;
			side = rand() % 2;

			if (axis != start_axis ||
				side != start_side)
			{
				done = true;
			}
		}
	}

	std::vector<int> location = {0, 0};

	if (!side)
	{
		location[!axis] = 0;
	}
	else
	{
		location[!axis] = maze_size[!axis] - 1;
	}

	location[axis] = 2 * (rand() % ((maze_size[axis] + 1) / 2 - 2)) + 1;

	if (!part)
	{
		dfs_path.push_back(location);
	}

	maze[location[1]][location[0]][0] = false;
	maze[location[1]][location[0]][1] = true;

	if (!part) {
		// Start
		startX = location[1];
		startY = location[0];
	}
	else // End
	{
		endX = location[1];
		endY = location[0];
	}
}

Maze::Maze(int width, int height)
{
	if (width < 5)
		width = 5;
	if (height < 5)
		height = 5;

	if (width > 29)
		width = 29;
	if (height > 29)
		height = 29;

	if (height % 2 == 0)
		height += 1;
	if (width % 2 == 0)
		width += 1;

	maze_size[0] = width;
	maze_size[1] = height;

	initializeMaze();
	randomPoint(false);
	randomPoint(true);
	generateMaze();
}

/*
int main(int argc, char* argv[]) {
	srand(time(NULL));

	parseArgs(argc, argv);

	// The width and height must be greater than or equal to 5 or it won't work
	// The width and height must be odd or else we will have extra walls
	for (int a = 0; a < 2; a++) {
		if (maze_size[a] < 5) {
			maze_size[a] = 5;
		}
		else if (maze_size[a] % 2 == 0) {
			maze_size[a]--;
		}
	}

	initializeMaze();
	randomPoint(false);
	randomPoint(true);
	generateMaze();

	printMaze();

	return 0;
}
*/