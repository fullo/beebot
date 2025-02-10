import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, RotateCw, RotateCcw, Repeat, Shuffle, Compass } from 'lucide-react';

// Constants
const DIRECTIONS = { EAST: 0, NORTH: 90, WEST: 180, SOUTH: 270 };
const GRID_SIZE = 4;

// Utility Component for Grid Cell
const GridCell = ({ x, y, position, startPoint, endPoint }) => {
  const isCurrentPosition = position.x === x && position.y === y;
  const isStartPoint = startPoint.x === x && startPoint.y === y;
  const isEndPoint = endPoint.x === x && endPoint.y === y;
  
  return (
    <div 
      className={`border-2 border-gray-300 flex items-center justify-center text-sm relative
        ${isCurrentPosition ? 'bg-blue-500 text-white' : ''}
        ${isStartPoint ? 'bg-green-200' : ''}
        ${isEndPoint ? 'bg-red-200' : ''}
      `}
    >
      {isCurrentPosition && (
        <div 
          className="w-8 h-8 flex items-center justify-center absolute"
          style={{ transform: `rotate(${90 - position.direction}deg)` }}
        >
          <ArrowUp className="text-white" />
        </div>
      )}
      <span className="text-xs">{`${String.fromCharCode(65 + x)}${y + 1}`}</span>
    </div>
  );
};

// Component for Control Buttons
const ControlButtons = ({ onMove, usedMoves }) => (
  <div className="grid grid-cols-2 gap-2">
    <Button onClick={() => onMove('forward', 1)} disabled={usedMoves.forward1}>
      Avanti 1
    </Button>
    <Button onClick={() => onMove('forward', 2)} disabled={usedMoves.forward2}>
      Avanti 2
    </Button>
    <Button onClick={() => onMove('backward', 1)} disabled={usedMoves.back1}>
      Retromarcia 1
    </Button>
    <Button onClick={() => onMove('backward', 2)} disabled={usedMoves.back2}>
      Retromarcia 2
    </Button>
    <Button onClick={() => onMove('rotate', 90)} disabled={usedMoves.rotate90cw}>
      <RotateCw className="mr-2" /> 90° orario
    </Button>
    <Button onClick={() => onMove('rotate', -90)} disabled={usedMoves.rotate90ccw}>
      <RotateCcw className="mr-2" /> 90° antiorario
    </Button>
    <Button onClick={() => onMove('rotate', 180)} disabled={usedMoves.rotate180cw}>
      <Repeat className="mr-2" /> 180° orario
    </Button>
    <Button onClick={() => onMove('rotate', -180)} disabled={usedMoves.rotate180ccw}>
      <Repeat className="mr-2" /> 180° antiorario
    </Button>
  </div>
);

// Component for Move History
const MoveHistory = ({ moves }) => (
  <div className="mt-4 border p-4 h-64 overflow-y-auto">
    <h3 className="font-bold mb-2">Movimenti:</h3>
    <ul className="space-y-1">
      {moves.map((move, index) => (
        <li key={index}>{index + 1}. {move}</li>
      ))}
    </ul>
  </div>
);

const getInitialGameState = () => ({
  position: { x: 0, y: 0 },
  direction: DIRECTIONS.NORTH,
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 2, y: 2 },
  moves: [],
  usedMoves: {
    forward1: false,
    forward2: false,
    back1: false,
    back2: false,
    rotate90cw: false,
    rotate90ccw: false,
    rotate180cw: false,
    rotate180ccw: false
  },
  gameStarted: false,
  history: [],
  showSuccess: false
});

// Main Component
const RobotGrid = () => {
  const [gameState, setGameState] = useState(getInitialGameState());

  const updateGameState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const generateRandomPoints = () => {
    const newStart = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    let newEnd;
    do {
      newEnd = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (newEnd.x === newStart.x && newEnd.y === newStart.y);

    setGameState({
      ...getInitialGameState(),
      position: newStart,
      startPoint: newStart,
      endPoint: newEnd
    });
  };

  const changeInitialDirection = () => {
    if (!gameState.gameStarted) {
      const directions = [0, 90, 180, 270];
      const currentIndex = directions.indexOf(gameState.direction);
      const nextIndex = (currentIndex + 1) % 4;
      updateGameState({ direction: directions[nextIndex] });
    }
  };

  const resetGame = () => {
    setGameState({
      ...getInitialGameState(),
      position: gameState.startPoint,
      startPoint: gameState.startPoint,
      endPoint: gameState.endPoint
    });
  };

  const undoLastMove = () => {
    if (gameState.history.length === 0) return;
    
    const previousState = gameState.history[gameState.history.length - 1];
    setGameState(previousState);
  };

  // Movement Logic
  const handleMove = (type, value) => {
    const { position, direction, moves, usedMoves } = gameState;
    
    // Save current state to history
    const historyCopy = [...gameState.history, { ...gameState }];
    
    let newPosition = { ...position };
    let newDirection = direction;
    let moveKey = '';

    if (type === 'forward' || type === 'backward') {
      const multiplier = type === 'forward' ? 1 : -1;
      moveKey = `${type}${value}`;
      
      switch (direction) {
        case DIRECTIONS.EAST:
          newPosition.x += value * multiplier;
          break;
        case DIRECTIONS.NORTH:
          newPosition.y += value * multiplier;
          break;
        case DIRECTIONS.WEST:
          newPosition.x -= value * multiplier;
          break;
        case DIRECTIONS.SOUTH:
          newPosition.y -= value * multiplier;
          break;
      }
    } else if (type === 'rotate') {
      newDirection = (direction + value + 360) % 360;
      moveKey = `rotate${Math.abs(value)}${value > 0 ? 'cw' : 'ccw'}`;
    }

    if (newPosition.x >= 0 && newPosition.x < GRID_SIZE && 
        newPosition.y >= 0 && newPosition.y < GRID_SIZE) {
      updateGameState({
        position: newPosition,
        direction: newDirection,
        moves: [...moves, `${type} ${value}`],
        usedMoves: { ...usedMoves, [moveKey]: true },
        gameStarted: true,
        history: historyCopy
      });
    }
  };

  // Success Check
  useEffect(() => {
    const { position, endPoint } = gameState;
    if (position.x === endPoint.x && position.y === endPoint.y) {
      updateGameState({ showSuccess: true });
      setTimeout(() => updateGameState({ showSuccess: false }), 3000);
    }
  }, [gameState.position]);

  const getDirectionName = (dir) => {
    switch(dir) {
      case DIRECTIONS.EAST: return 'Est';
      case DIRECTIONS.NORTH: return 'Nord';
      case DIRECTIONS.WEST: return 'Ovest';
      case DIRECTIONS.SOUTH: return 'Sud';
      default: return '';
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={generateRandomPoints}
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Genera random
            </Button>
            <Button 
              onClick={changeInitialDirection}
              className="flex items-center gap-2"
              disabled={gameState.gameStarted}
            >
              <Compass className="w-4 h-4" />
              Dir: {getDirectionName(gameState.direction)}
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-1 w-96 h-96">
            {[...Array(GRID_SIZE * GRID_SIZE)].map((_, index) => {
              const y = 3 - Math.floor(index / 4);
              const x = index % 4;
              return (
                <GridCell
                  key={index}
                  x={x}
                  y={y}
                  position={{ ...gameState.position, direction: gameState.direction }}
                  startPoint={gameState.startPoint}
                  endPoint={gameState.endPoint}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <ControlButtons
            onMove={handleMove}
            usedMoves={gameState.usedMoves}
          />
          
          <div className="flex gap-2">
            <Button onClick={resetGame} variant="outline" className="w-1/2">
              Reset
            </Button>
            <Button 
              onClick={undoLastMove} 
              variant="outline" 
              className="w-1/2"
              disabled={gameState.history.length === 0}
            >
              Annulla ultimo movimento
            </Button>
          </div>

          <MoveHistory moves={gameState.moves} />
        </div>
      </div>

      {gameState.showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
            Hai raggiunto la destinazione!
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotGrid;