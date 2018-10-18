# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.5

# Default target executed when no arguments are given to make.
default_target: all

.PHONY : default_target

# Allow only one "make -f Makefile2" at a time, but pass parallelism.
.NOTPARALLEL:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file.
RM = /usr/bin/cmake -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /mnt/c/Users/tmama/projects/bflight/BFlight

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /mnt/c/Users/tmama/projects/bFlight/BFlight

#=============================================================================
# Targets provided globally by CMake.

# Special rule for the target edit_cache
edit_cache:
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --cyan "No interactive CMake dialog available..."
	/usr/bin/cmake -E echo No\ interactive\ CMake\ dialog\ available.
.PHONY : edit_cache

# Special rule for the target edit_cache
edit_cache/fast: edit_cache

.PHONY : edit_cache/fast

# Special rule for the target rebuild_cache
rebuild_cache:
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --cyan "Running CMake to regenerate build system..."
	/usr/bin/cmake -H$(CMAKE_SOURCE_DIR) -B$(CMAKE_BINARY_DIR)
.PHONY : rebuild_cache

# Special rule for the target rebuild_cache
rebuild_cache/fast: rebuild_cache

.PHONY : rebuild_cache/fast

# Special rule for the target package
package: preinstall
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --cyan "Run CPack packaging tool..."
	/usr/bin/cpack --config ./CPackConfig.cmake
.PHONY : package

# Special rule for the target package
package/fast: package

.PHONY : package/fast

# Special rule for the target package_source
package_source:
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --cyan "Run CPack packaging tool for source..."
	/usr/bin/cpack --config ./CPackSourceConfig.cmake /mnt/c/Users/tmama/projects/bFlight/BFlight/CPackSourceConfig.cmake
.PHONY : package_source

# Special rule for the target package_source
package_source/fast: package_source

.PHONY : package_source/fast

# Special rule for the target test
test:
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --cyan "Running tests..."
	/usr/bin/ctest --force-new-ctest-process $(ARGS)
.PHONY : test

# Special rule for the target test
test/fast: test

.PHONY : test/fast

# The main all target
all: cmake_check_build_system
	$(CMAKE_COMMAND) -E cmake_progress_start /mnt/c/Users/tmama/projects/bFlight/BFlight/CMakeFiles /mnt/c/Users/tmama/projects/bFlight/BFlight/CMakeFiles/progress.marks
	$(MAKE) -f CMakeFiles/Makefile2 all
	$(CMAKE_COMMAND) -E cmake_progress_start /mnt/c/Users/tmama/projects/bFlight/BFlight/CMakeFiles 0
.PHONY : all

# The main clean target
clean:
	$(MAKE) -f CMakeFiles/Makefile2 clean
.PHONY : clean

# The main clean target
clean/fast: clean

.PHONY : clean/fast

# Prepare targets for installation.
preinstall: all
	$(MAKE) -f CMakeFiles/Makefile2 preinstall
.PHONY : preinstall

# Prepare targets for installation.
preinstall/fast:
	$(MAKE) -f CMakeFiles/Makefile2 preinstall
.PHONY : preinstall/fast

# clear depends
depend:
	$(CMAKE_COMMAND) -H$(CMAKE_SOURCE_DIR) -B$(CMAKE_BINARY_DIR) --check-build-system CMakeFiles/Makefile.cmake 1
.PHONY : depend

#=============================================================================
# Target rules for targets named bFlight64

# Build rule for target.
bFlight64: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 bFlight64
.PHONY : bFlight64

# fast build rule for target.
bFlight64/fast:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/build
.PHONY : bFlight64/fast

#=============================================================================
# Target rules for targets named ContinuousSubmit

# Build rule for target.
ContinuousSubmit: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ContinuousSubmit
.PHONY : ContinuousSubmit

# fast build rule for target.
ContinuousSubmit/fast:
	$(MAKE) -f CMakeFiles/ContinuousSubmit.dir/build.make CMakeFiles/ContinuousSubmit.dir/build
.PHONY : ContinuousSubmit/fast

#=============================================================================
# Target rules for targets named ContinuousCoverage

# Build rule for target.
ContinuousCoverage: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ContinuousCoverage
.PHONY : ContinuousCoverage

# fast build rule for target.
ContinuousCoverage/fast:
	$(MAKE) -f CMakeFiles/ContinuousCoverage.dir/build.make CMakeFiles/ContinuousCoverage.dir/build
.PHONY : ContinuousCoverage/fast

#=============================================================================
# Target rules for targets named ContinuousTest

# Build rule for target.
ContinuousTest: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ContinuousTest
.PHONY : ContinuousTest

# fast build rule for target.
ContinuousTest/fast:
	$(MAKE) -f CMakeFiles/ContinuousTest.dir/build.make CMakeFiles/ContinuousTest.dir/build
.PHONY : ContinuousTest/fast

#=============================================================================
# Target rules for targets named ContinuousBuild

# Build rule for target.
ContinuousBuild: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ContinuousBuild
.PHONY : ContinuousBuild

# fast build rule for target.
ContinuousBuild/fast:
	$(MAKE) -f CMakeFiles/ContinuousBuild.dir/build.make CMakeFiles/ContinuousBuild.dir/build
.PHONY : ContinuousBuild/fast

#=============================================================================
# Target rules for targets named ContinuousMemCheck

# Build rule for target.
ContinuousMemCheck: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ContinuousMemCheck
.PHONY : ContinuousMemCheck

# fast build rule for target.
ContinuousMemCheck/fast:
	$(MAKE) -f CMakeFiles/ContinuousMemCheck.dir/build.make CMakeFiles/ContinuousMemCheck.dir/build
.PHONY : ContinuousMemCheck/fast

#=============================================================================
# Target rules for targets named Nightly

# Build rule for target.
Nightly: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 Nightly
.PHONY : Nightly

# fast build rule for target.
Nightly/fast:
	$(MAKE) -f CMakeFiles/Nightly.dir/build.make CMakeFiles/Nightly.dir/build
.PHONY : Nightly/fast

#=============================================================================
# Target rules for targets named NightlyTest

# Build rule for target.
NightlyTest: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 NightlyTest
.PHONY : NightlyTest

# fast build rule for target.
NightlyTest/fast:
	$(MAKE) -f CMakeFiles/NightlyTest.dir/build.make CMakeFiles/NightlyTest.dir/build
.PHONY : NightlyTest/fast

#=============================================================================
# Target rules for targets named NightlyUpdate

# Build rule for target.
NightlyUpdate: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 NightlyUpdate
.PHONY : NightlyUpdate

# fast build rule for target.
NightlyUpdate/fast:
	$(MAKE) -f CMakeFiles/NightlyUpdate.dir/build.make CMakeFiles/NightlyUpdate.dir/build
.PHONY : NightlyUpdate/fast

#=============================================================================
# Target rules for targets named Continuous

# Build rule for target.
Continuous: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 Continuous
.PHONY : Continuous

# fast build rule for target.
Continuous/fast:
	$(MAKE) -f CMakeFiles/Continuous.dir/build.make CMakeFiles/Continuous.dir/build
.PHONY : Continuous/fast

#=============================================================================
# Target rules for targets named NightlyBuild

# Build rule for target.
NightlyBuild: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 NightlyBuild
.PHONY : NightlyBuild

# fast build rule for target.
NightlyBuild/fast:
	$(MAKE) -f CMakeFiles/NightlyBuild.dir/build.make CMakeFiles/NightlyBuild.dir/build
.PHONY : NightlyBuild/fast

#=============================================================================
# Target rules for targets named NightlyStart

# Build rule for target.
NightlyStart: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 NightlyStart
.PHONY : NightlyStart

# fast build rule for target.
NightlyStart/fast:
	$(MAKE) -f CMakeFiles/NightlyStart.dir/build.make CMakeFiles/NightlyStart.dir/build
.PHONY : NightlyStart/fast

#=============================================================================
# Target rules for targets named NightlyMemoryCheck

# Build rule for target.
NightlyMemoryCheck: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 NightlyMemoryCheck
.PHONY : NightlyMemoryCheck

# fast build rule for target.
NightlyMemoryCheck/fast:
	$(MAKE) -f CMakeFiles/NightlyMemoryCheck.dir/build.make CMakeFiles/NightlyMemoryCheck.dir/build
.PHONY : NightlyMemoryCheck/fast

#=============================================================================
# Target rules for targets named NightlyMemCheck

# Build rule for target.
NightlyMemCheck: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 NightlyMemCheck
.PHONY : NightlyMemCheck

# fast build rule for target.
NightlyMemCheck/fast:
	$(MAKE) -f CMakeFiles/NightlyMemCheck.dir/build.make CMakeFiles/NightlyMemCheck.dir/build
.PHONY : NightlyMemCheck/fast

#=============================================================================
# Target rules for targets named ExperimentalStart

# Build rule for target.
ExperimentalStart: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ExperimentalStart
.PHONY : ExperimentalStart

# fast build rule for target.
ExperimentalStart/fast:
	$(MAKE) -f CMakeFiles/ExperimentalStart.dir/build.make CMakeFiles/ExperimentalStart.dir/build
.PHONY : ExperimentalStart/fast

#=============================================================================
# Target rules for targets named ContinuousConfigure

# Build rule for target.
ContinuousConfigure: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ContinuousConfigure
.PHONY : ContinuousConfigure

# fast build rule for target.
ContinuousConfigure/fast:
	$(MAKE) -f CMakeFiles/ContinuousConfigure.dir/build.make CMakeFiles/ContinuousConfigure.dir/build
.PHONY : ContinuousConfigure/fast

#=============================================================================
# Target rules for targets named NightlyCoverage

# Build rule for target.
NightlyCoverage: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 NightlyCoverage
.PHONY : NightlyCoverage

# fast build rule for target.
NightlyCoverage/fast:
	$(MAKE) -f CMakeFiles/NightlyCoverage.dir/build.make CMakeFiles/NightlyCoverage.dir/build
.PHONY : NightlyCoverage/fast

#=============================================================================
# Target rules for targets named ExperimentalUpdate

# Build rule for target.
ExperimentalUpdate: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ExperimentalUpdate
.PHONY : ExperimentalUpdate

# fast build rule for target.
ExperimentalUpdate/fast:
	$(MAKE) -f CMakeFiles/ExperimentalUpdate.dir/build.make CMakeFiles/ExperimentalUpdate.dir/build
.PHONY : ExperimentalUpdate/fast

#=============================================================================
# Target rules for targets named ExperimentalConfigure

# Build rule for target.
ExperimentalConfigure: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ExperimentalConfigure
.PHONY : ExperimentalConfigure

# fast build rule for target.
ExperimentalConfigure/fast:
	$(MAKE) -f CMakeFiles/ExperimentalConfigure.dir/build.make CMakeFiles/ExperimentalConfigure.dir/build
.PHONY : ExperimentalConfigure/fast

#=============================================================================
# Target rules for targets named ExperimentalCoverage

# Build rule for target.
ExperimentalCoverage: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ExperimentalCoverage
.PHONY : ExperimentalCoverage

# fast build rule for target.
ExperimentalCoverage/fast:
	$(MAKE) -f CMakeFiles/ExperimentalCoverage.dir/build.make CMakeFiles/ExperimentalCoverage.dir/build
.PHONY : ExperimentalCoverage/fast

#=============================================================================
# Target rules for targets named ExperimentalBuild

# Build rule for target.
ExperimentalBuild: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ExperimentalBuild
.PHONY : ExperimentalBuild

# fast build rule for target.
ExperimentalBuild/fast:
	$(MAKE) -f CMakeFiles/ExperimentalBuild.dir/build.make CMakeFiles/ExperimentalBuild.dir/build
.PHONY : ExperimentalBuild/fast

#=============================================================================
# Target rules for targets named NightlyConfigure

# Build rule for target.
NightlyConfigure: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 NightlyConfigure
.PHONY : NightlyConfigure

# fast build rule for target.
NightlyConfigure/fast:
	$(MAKE) -f CMakeFiles/NightlyConfigure.dir/build.make CMakeFiles/NightlyConfigure.dir/build
.PHONY : NightlyConfigure/fast

#=============================================================================
# Target rules for targets named ExperimentalTest

# Build rule for target.
ExperimentalTest: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ExperimentalTest
.PHONY : ExperimentalTest

# fast build rule for target.
ExperimentalTest/fast:
	$(MAKE) -f CMakeFiles/ExperimentalTest.dir/build.make CMakeFiles/ExperimentalTest.dir/build
.PHONY : ExperimentalTest/fast

#=============================================================================
# Target rules for targets named ExperimentalMemCheck

# Build rule for target.
ExperimentalMemCheck: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ExperimentalMemCheck
.PHONY : ExperimentalMemCheck

# fast build rule for target.
ExperimentalMemCheck/fast:
	$(MAKE) -f CMakeFiles/ExperimentalMemCheck.dir/build.make CMakeFiles/ExperimentalMemCheck.dir/build
.PHONY : ExperimentalMemCheck/fast

#=============================================================================
# Target rules for targets named Experimental

# Build rule for target.
Experimental: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 Experimental
.PHONY : Experimental

# fast build rule for target.
Experimental/fast:
	$(MAKE) -f CMakeFiles/Experimental.dir/build.make CMakeFiles/Experimental.dir/build
.PHONY : Experimental/fast

#=============================================================================
# Target rules for targets named NightlySubmit

# Build rule for target.
NightlySubmit: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 NightlySubmit
.PHONY : NightlySubmit

# fast build rule for target.
NightlySubmit/fast:
	$(MAKE) -f CMakeFiles/NightlySubmit.dir/build.make CMakeFiles/NightlySubmit.dir/build
.PHONY : NightlySubmit/fast

#=============================================================================
# Target rules for targets named ExperimentalSubmit

# Build rule for target.
ExperimentalSubmit: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ExperimentalSubmit
.PHONY : ExperimentalSubmit

# fast build rule for target.
ExperimentalSubmit/fast:
	$(MAKE) -f CMakeFiles/ExperimentalSubmit.dir/build.make CMakeFiles/ExperimentalSubmit.dir/build
.PHONY : ExperimentalSubmit/fast

#=============================================================================
# Target rules for targets named ContinuousStart

# Build rule for target.
ContinuousStart: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ContinuousStart
.PHONY : ContinuousStart

# fast build rule for target.
ContinuousStart/fast:
	$(MAKE) -f CMakeFiles/ContinuousStart.dir/build.make CMakeFiles/ContinuousStart.dir/build
.PHONY : ContinuousStart/fast

#=============================================================================
# Target rules for targets named ContinuousUpdate

# Build rule for target.
ContinuousUpdate: cmake_check_build_system
	$(MAKE) -f CMakeFiles/Makefile2 ContinuousUpdate
.PHONY : ContinuousUpdate

# fast build rule for target.
ContinuousUpdate/fast:
	$(MAKE) -f CMakeFiles/ContinuousUpdate.dir/build.make CMakeFiles/ContinuousUpdate.dir/build
.PHONY : ContinuousUpdate/fast

bFlight.o: bFlight.cpp.o

.PHONY : bFlight.o

# target to build an object file
bFlight.cpp.o:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/bFlight.cpp.o
.PHONY : bFlight.cpp.o

bFlight.i: bFlight.cpp.i

.PHONY : bFlight.i

# target to preprocess a source file
bFlight.cpp.i:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/bFlight.cpp.i
.PHONY : bFlight.cpp.i

bFlight.s: bFlight.cpp.s

.PHONY : bFlight.s

# target to generate assembly for a file
bFlight.cpp.s:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/bFlight.cpp.s
.PHONY : bFlight.cpp.s

beatemup.o: beatemup.cpp.o

.PHONY : beatemup.o

# target to build an object file
beatemup.cpp.o:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/beatemup.cpp.o
.PHONY : beatemup.cpp.o

beatemup.i: beatemup.cpp.i

.PHONY : beatemup.i

# target to preprocess a source file
beatemup.cpp.i:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/beatemup.cpp.i
.PHONY : beatemup.cpp.i

beatemup.s: beatemup.cpp.s

.PHONY : beatemup.s

# target to generate assembly for a file
beatemup.cpp.s:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/beatemup.cpp.s
.PHONY : beatemup.cpp.s

bsideFly.o: bsideFly.cpp.o

.PHONY : bsideFly.o

# target to build an object file
bsideFly.cpp.o:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/bsideFly.cpp.o
.PHONY : bsideFly.cpp.o

bsideFly.i: bsideFly.cpp.i

.PHONY : bsideFly.i

# target to preprocess a source file
bsideFly.cpp.i:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/bsideFly.cpp.i
.PHONY : bsideFly.cpp.i

bsideFly.s: bsideFly.cpp.s

.PHONY : bsideFly.s

# target to generate assembly for a file
bsideFly.cpp.s:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/bsideFly.cpp.s
.PHONY : bsideFly.cpp.s

driveGame.o: driveGame.cpp.o

.PHONY : driveGame.o

# target to build an object file
driveGame.cpp.o:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/driveGame.cpp.o
.PHONY : driveGame.cpp.o

driveGame.i: driveGame.cpp.i

.PHONY : driveGame.i

# target to preprocess a source file
driveGame.cpp.i:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/driveGame.cpp.i
.PHONY : driveGame.cpp.i

driveGame.s: driveGame.cpp.s

.PHONY : driveGame.s

# target to generate assembly for a file
driveGame.cpp.s:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/driveGame.cpp.s
.PHONY : driveGame.cpp.s

gameCommon.o: gameCommon.cpp.o

.PHONY : gameCommon.o

# target to build an object file
gameCommon.cpp.o:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/gameCommon.cpp.o
.PHONY : gameCommon.cpp.o

gameCommon.i: gameCommon.cpp.i

.PHONY : gameCommon.i

# target to preprocess a source file
gameCommon.cpp.i:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/gameCommon.cpp.i
.PHONY : gameCommon.cpp.i

gameCommon.s: gameCommon.cpp.s

.PHONY : gameCommon.s

# target to generate assembly for a file
gameCommon.cpp.s:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/gameCommon.cpp.s
.PHONY : gameCommon.cpp.s

myfont.o: myfont.cpp.o

.PHONY : myfont.o

# target to build an object file
myfont.cpp.o:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/myfont.cpp.o
.PHONY : myfont.cpp.o

myfont.i: myfont.cpp.i

.PHONY : myfont.i

# target to preprocess a source file
myfont.cpp.i:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/myfont.cpp.i
.PHONY : myfont.cpp.i

myfont.s: myfont.cpp.s

.PHONY : myfont.s

# target to generate assembly for a file
myfont.cpp.s:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/myfont.cpp.s
.PHONY : myfont.cpp.s

rotoZoomer.o: rotoZoomer.cpp.o

.PHONY : rotoZoomer.o

# target to build an object file
rotoZoomer.cpp.o:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/rotoZoomer.cpp.o
.PHONY : rotoZoomer.cpp.o

rotoZoomer.i: rotoZoomer.cpp.i

.PHONY : rotoZoomer.i

# target to preprocess a source file
rotoZoomer.cpp.i:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/rotoZoomer.cpp.i
.PHONY : rotoZoomer.cpp.i

rotoZoomer.s: rotoZoomer.cpp.s

.PHONY : rotoZoomer.s

# target to generate assembly for a file
rotoZoomer.cpp.s:
	$(MAKE) -f CMakeFiles/bFlight64.dir/build.make CMakeFiles/bFlight64.dir/rotoZoomer.cpp.s
.PHONY : rotoZoomer.cpp.s

# Help Target
help:
	@echo "The following are some of the valid targets for this Makefile:"
	@echo "... all (the default if no target is provided)"
	@echo "... clean"
	@echo "... depend"
	@echo "... edit_cache"
	@echo "... rebuild_cache"
	@echo "... bFlight64"
	@echo "... ContinuousSubmit"
	@echo "... ContinuousCoverage"
	@echo "... ContinuousTest"
	@echo "... ContinuousBuild"
	@echo "... ContinuousMemCheck"
	@echo "... Nightly"
	@echo "... package"
	@echo "... NightlyTest"
	@echo "... NightlyUpdate"
	@echo "... Continuous"
	@echo "... NightlyBuild"
	@echo "... NightlyStart"
	@echo "... NightlyMemoryCheck"
	@echo "... NightlyMemCheck"
	@echo "... package_source"
	@echo "... ExperimentalStart"
	@echo "... ContinuousConfigure"
	@echo "... NightlyCoverage"
	@echo "... ExperimentalUpdate"
	@echo "... test"
	@echo "... ExperimentalConfigure"
	@echo "... ExperimentalCoverage"
	@echo "... ExperimentalBuild"
	@echo "... NightlyConfigure"
	@echo "... ExperimentalTest"
	@echo "... ExperimentalMemCheck"
	@echo "... Experimental"
	@echo "... NightlySubmit"
	@echo "... ExperimentalSubmit"
	@echo "... ContinuousStart"
	@echo "... ContinuousUpdate"
	@echo "... bFlight.o"
	@echo "... bFlight.i"
	@echo "... bFlight.s"
	@echo "... beatemup.o"
	@echo "... beatemup.i"
	@echo "... beatemup.s"
	@echo "... bsideFly.o"
	@echo "... bsideFly.i"
	@echo "... bsideFly.s"
	@echo "... driveGame.o"
	@echo "... driveGame.i"
	@echo "... driveGame.s"
	@echo "... gameCommon.o"
	@echo "... gameCommon.i"
	@echo "... gameCommon.s"
	@echo "... myfont.o"
	@echo "... myfont.i"
	@echo "... myfont.s"
	@echo "... rotoZoomer.o"
	@echo "... rotoZoomer.i"
	@echo "... rotoZoomer.s"
.PHONY : help



#=============================================================================
# Special targets to cleanup operation of make.

# Special rule to run CMake to check the build system integrity.
# No rule that depends on this can have commands that come from listfiles
# because they might be regenerated.
cmake_check_build_system:
	$(CMAKE_COMMAND) -H$(CMAKE_SOURCE_DIR) -B$(CMAKE_BINARY_DIR) --check-build-system CMakeFiles/Makefile.cmake 0
.PHONY : cmake_check_build_system

