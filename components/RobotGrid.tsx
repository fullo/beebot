import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowUp, RotateCw, RotateCcw, Repeat, Shuffle, Compass } from 'lucide-react';

// Configurazione direzioni
const DIRECTIONS = {
  EAST: 0,
  NORTH: 90,
  WEST: 180,
  SOUTH: 270
};

// Configurazione griglia
const GRID_CONFIG = {
  SIZE: 4,
  LETTERS: ['A', 'B', 'C', 'D'],
  DEFAULT_DIRECTION: DIRECTIONS.NORTH
};

const RobotGrid = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 }); // A1 è (0,0)
  const [direction, setDirection] = useState(90); // 90 = Nord
  const [moves, setMoves] = useState([]);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 2, y: 2 });
  const getInitialMoves = () => ({
    forward1: false,
    forward2: false,
    back1: false,
    back2: false,
    rotate90cw: false,
    rotate90ccw: false,
    rotate180cw: false,
    rotate180ccw: false
  });

  const [usedMoves, setUsedMoves] = useState(getInitialMoves());
  const [gameStarted, setGameStarted] = useState(false);

/**
 * Genera una coordinata casuale nella griglia
 */
const generateRandomCoordinate = () => ({
  x: Math.floor(Math.random() * GRID_CONFIG.SIZE),
  y: Math.floor(Math.random() * GRID_CONFIG.SIZE)
});

/**
 * Verifica se due coordinate sono uguali
 */
const areSameCoordinates = (coord1, coord2) => 
  coord1.x === coord2.x && coord1.y === coord2.y;

/**
 * Genera punti di partenza e arrivo casuali
 */
const generateRandomPoints = () => {
  // Genera punto di partenza
  const newStart = generateRandomCoordinate();
  // Genera punto di arrivo diverso da quello di partenza
  let newEnd;
  do {
    newEnd = generateRandomCoordinate();
  } while (areSameCoordinates(newStart, newEnd));

  // Imposta i nuovi punti e resetta lo stato del gioco
  setStartPoint(newStart);
  setEndPoint(newEnd);
  setRobotPosition(newStart);
  setRobotDirection(DIRECTIONS.NORTH);
  setMovementsList([]);
  setIsGameStarted(false);
  setAvailableMoves(getInitialMoves());
};

  const changeInitialDirection = () => {
    if (!gameStarted) {
      const directions = [0, 90, 180, 270];
      const currentIndex = directions.indexOf(direction);
      const nextIndex = (currentIndex + 1) % 4;
      setDirection(directions[nextIndex]);
    }
  };

  const isValidCoordinate = (x, y) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

  const isValidMove = (newX, newY) => isValidCoordinate(newX, newY);

  const toChessNotation = (x, y) => {
    const letters = ['A', 'B', 'C', 'D'];
    return `${letters[x]}${y + 1}`;
  };

  const getDirectionName = (dir) => {
    switch(dir) {
      case DIRECTIONS.EAST: return 'Est';
      case DIRECTIONS.NORTH: return 'Nord';
      case DIRECTIONS.WEST: return 'Ovest';
      case DIRECTIONS.SOUTH: return 'Sud';
      default: return '';
    }
  };

  const [history, setHistory] = useState([]);

  // Struttura per lo stato del gioco
  const createGameState = (position, direction, moves, usedMoves) => ({
    position: { ...position },
    direction,
    moves: [...moves],
    usedMoves: { ...usedMoves }
  });

  const addToHistory = (currentState) => {
    setHistory([...history, createGameState(
      currentState.position,
      currentState.direction,
      currentState.moves,
      currentState.usedMoves
    )]);
  };

  const undoLastMove = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setPosition(lastState.position);
    setDirection(lastState.direction);
    setMoves(lastState.moves);
    setUsedMoves(lastState.usedMoves);
    setHistory(history.slice(0, -1));
    setShowSuccess(false);
  };

  const moveForward = (spaces, moveKey) => {
    if (usedMoves[moveKey]) return;
    
    // Salva lo stato corrente nella cronologia
    addToHistory({
      position: { ...position },
      direction,
      moves: [...moves],
      usedMoves: { ...usedMoves }
    });
    
    let newX = position.x;
    let newY = position.y;
    
    switch (direction) {
      case 0: // Est
        newX += spaces;
        break;
      case 90: // Nord
        newY += spaces;
        break;
      case 180: // Ovest
        newX -= spaces;
        break;
      case 270: // Sud
        newY -= spaces;
        break;
    }
    
    if (isValidMove(newX, newY)) {
      // Salva lo stato corrente nella cronologia
      addToHistory({
        position: { ...position },
        direction,
        moves: [...moves],
        usedMoves: { ...usedMoves }
      });
      
      setPosition({ x: newX, y: newY });
      setMoves([...moves, `Avanti ${spaces} (${toChessNotation(position.x, position.y)}→${toChessNotation(newX, newY)})`]);
      setUsedMoves({ ...usedMoves, [moveKey]: true });
      setGameStarted(true);
    }
  };

  const moveBackward = (spaces, moveKey) => {
    if (usedMoves[moveKey]) return;
    
    let newX = position.x;
    let newY = position.y;
    
    switch (direction) {
      case 0: // Est
        newX -= spaces;
        break;
      case 90: // Nord
        newY -= spaces;
        break;
      case 180: // Ovest
        newX += spaces;
        break;
      case 270: // Sud
        newY += spaces;
        break;
    }
    
    if (isValidMove(newX, newY)) {
      // Salva lo stato corrente nella cronologia
      addToHistory({
        position: { ...position },
        direction,
        moves: [...moves],
        usedMoves: { ...usedMoves }
      });
      
      setPosition({ x: newX, y: newY });
      setMoves([...moves, `Retromarcia ${spaces} (${toChessNotation(position.x, position.y)}→${toChessNotation(newX, newY)})`]);
      setUsedMoves({ ...usedMoves, [moveKey]: true });
      setGameStarted(true);
    }
  };

  const rotate = (degrees, moveKey) => {
    if (usedMoves[moveKey]) return;
    
    // Invertiamo il segno dei gradi per correggere la direzione della rotazione
    const newDirection = (direction - degrees + 360) % 360;
    setDirection(newDirection);
    setMoves([...moves, `Rotazione ${degrees}° ${degrees > 0 ? 'orario' : 'antiorario'}`]);
    setUsedMoves({ ...usedMoves, [moveKey]: true });
    setGameStarted(true);
  };

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (position.x === endPoint.x && position.y === endPoint.y) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Nascondi dopo 3 secondi
    }
  }, [position, endPoint]);

  const [formError, setFormError] = useState('');

  const validateCoordinate = (coord) => {
    const pattern = /^[A-D][1-4]$/;
    return pattern.test(coord.toUpperCase());
  };

  const coordToPosition = (coord) => {
    const letter = coord[0].toUpperCase();
    const number = parseInt(coord[1]) - 1;
    return {
      x: letter.charCodeAt(0) - 'A'.charCodeAt(0),
      y: number
    };
  };

  const handleCoordinateSubmit = (e) => {
    e.preventDefault();
    const startValue = e.target.start.value.toUpperCase();
    const endValue = e.target.end.value.toUpperCase();

    if (!validateCoordinate(startValue) || !validateCoordinate(endValue)) {
      setFormError('Le coordinate devono essere nel formato A1-E5');
      return;
    }

    if (startValue === endValue) {
      setFormError('Il punto di partenza e arrivo non possono essere uguali');
      return;
    }

    const newStart = coordToPosition(startValue);
    const newEnd = coordToPosition(endValue);

    // Reset completo dello stato
    setStartPoint(newStart);
    setEndPoint(newEnd);
    setPosition(newStart);
    setDirection(90);
    setMoves([]);
    setGameStarted(false);
    setShowSuccess(false);
    setHistory([]);  // Reset della cronologia
    setUsedMoves({
      forward1: false,
      forward2: false,
      back1: false,
      back2: false,
      rotate90cw: false,
      rotate90ccw: false,
      rotate180cw: false,
      rotate180ccw: false
    });
    setFormError('');
    e.target.reset();
  };

  const resetGame = () => {
    setPosition(startPoint);
    setDirection(90);
    setMoves([]);
    setGameStarted(false);
    setUsedMoves({
      forward1: false,
      forward2: false,
      back1: false,
      back2: false,
      rotate90cw: false,
      rotate90ccw: false,
      rotate180cw: false,
      rotate180ccw: false
    });
  };

  const findSolution = () => {
    resetGame();
    
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    
    const moveSequence = [];
    
    const addRotation = (targetDir) => {
      const currentRotation = direction;
      const diff = (targetDir - currentRotation + 360) % 360;
      
      if (diff === 90 && !usedMoves.rotate90cw) {
        moveSequence.push(() => rotate(-90, 'rotate90cw'));
        return true;
      } else if (diff === 270 && !usedMoves.rotate90ccw) {
        moveSequence.push(() => rotate(90, 'rotate90ccw'));
        return true;
      } else if (diff === 180) {
        if (!usedMoves.rotate180cw) {
          moveSequence.push(() => rotate(180, 'rotate180cw'));
          return true;
        } else if (!usedMoves.rotate180ccw) {
          moveSequence.push(() => rotate(-180, 'rotate180ccw'));
          return true;
        }
      } else if (diff === 0) {
        return true;
      }
      return false;
    };

    if (dx !== 0) {
      const targetDir = dx > 0 ? 0 : 180;
      if (addRotation(targetDir)) {
        const absDx = Math.abs(dx);
        if (absDx >= 2) {
          moveSequence.push(() => moveForward(2, 'forward2'));
          if (absDx > 2) {
            moveSequence.push(() => moveForward(1, 'forward1'));
          }
        } else {
          moveSequence.push(() => moveForward(1, 'forward1'));
        }
      }
    }

    if (dy !== 0) {
      const targetDir = dy > 0 ? 90 : 270;
      if (addRotation(targetDir)) {
        const absDy = Math.abs(dy);
        if (absDy >= 2) {
          moveSequence.push(() => moveForward(2, 'forward2'));
          if (absDy > 2) {
            moveSequence.push(() => moveForward(1, 'forward1'));
          }
        } else {
          moveSequence.push(() => moveForward(1, 'forward1'));
        }
      }
    }

    let index = 0;
    const executeSequence = () => {
      if (index < moveSequence.length) {
        moveSequence[index]();
        index++;
        setTimeout(executeSequence, 500);
      }
    };

    executeSequence();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex gap-2 mb-4 items-start">
            <form onSubmit={handleCoordinateSubmit} className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Punto di partenza</Label>
                  <Input 
                    id="start" 
                    name="start" 
                    placeholder="es. A1" 
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">Punto di arrivo</Label>
                  <Input 
                    id="end" 
                    name="end" 
                    placeholder="es. C3" 
                    className="uppercase"
                  />
                </div>
              </div>
              {formError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">Imposta coordinate</Button>
            </form>

            <div className="flex flex-col gap-2">
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
                disabled={gameStarted}
              >
                <Compass className="w-4 h-4" />
                Dir: {getDirectionName(direction)}
              </Button>
            </div>
          </div>

          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
                Hai raggiunto la destinazione!
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute top-1/2 right-0 transform translate-x-8 -translate-y-1/2 font-bold text-gray-600">N</div>
            <div className="absolute top-1/2 left-0 transform -translate-x-8 -translate-y-1/2 font-bold text-gray-600">S</div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 font-bold text-gray-600">O</div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-gray-600">E</div>
            
            <div className="grid grid-cols-4 gap-1 w-96 h-96">
              {[...Array(16)].map((_, index) => {
                const y = 3 - Math.floor(index / 4);  // Invertiamo l'asse Y
                const x = index % 4;
                const isCurrentPosition = position.x === x && position.y === y;
                const isStartPoint = startPoint.x === x && startPoint.y === y;
                const isEndPoint = endPoint.x === x && endPoint.y === y;
                
                return (
                  <div 
                    key={index}
                    className={`border-2 border-gray-300 flex items-center justify-center text-sm relative
                      ${isCurrentPosition ? 'bg-blue-500 text-white' : ''}
                      ${isStartPoint ? 'bg-green-200' : ''}
                      ${isEndPoint ? 'bg-red-200' : ''}
                    `}
                  >
                    {isCurrentPosition && (
                      <div 
                        className="w-8 h-8 flex items-center justify-center absolute"
                        style={{ transform: `rotate(${90 - direction}deg)` }}
                      >
                        <ArrowUp className="text-white" />
                      </div>
                    )}
                    <span className="text-xs">{toChessNotation(x, y)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-sm space-x-4">
            <span className="inline-flex items-center">
              <div className="w-4 h-4 bg-green-200 mr-1"></div>
              Partenza: {toChessNotation(startPoint.x, startPoint.y)}
            </span>
            <span className="inline-flex items-center">
              <div className="w-4 h-4 bg-red-200 mr-1"></div>
              Arrivo: {toChessNotation(endPoint.x, endPoint.y)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => moveForward(1, 'forward1')}
              disabled={usedMoves.forward1}
            >
              Avanti 1
            </Button>
            <Button 
              onClick={() => moveForward(2, 'forward2')}
              disabled={usedMoves.forward2}
            >
              Avanti 2
            </Button>
            <Button 
              onClick={() => moveBackward(1, 'back1')}
              disabled={usedMoves.back1}
            >
              Retromarcia 1
            </Button>
            <Button 
              onClick={() => moveBackward(2, 'back2')}
              disabled={usedMoves.back2}
            >
              Retromarcia 2
            </Button>
            <Button 
              onClick={() => rotate(90, 'rotate90cw')}
              disabled={usedMoves.rotate90cw}
            >
              <RotateCw className="mr-2" /> 90° orario
            </Button>
            <Button 
              onClick={() => rotate(-90, 'rotate90ccw')}
              disabled={usedMoves.rotate90ccw}
            >
              <RotateCcw className="mr-2" /> 90° antiorario
            </Button>
            <Button 
              onClick={() => rotate(180, 'rotate180cw')}
              disabled={usedMoves.rotate180cw}
            >
              <Repeat className="mr-2" /> 180° orario
            </Button>
            <Button 
              onClick={() => rotate(-180, 'rotate180ccw')}
              disabled={usedMoves.rotate180ccw}
            >
              <Repeat className="mr-2" /> 180° antiorario
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={resetGame} variant="outline" className="w-1/2">Reset</Button>
            <Button 
              onClick={undoLastMove} 
              variant="outline" 
              className="w-1/2"
              disabled={history.length === 0}
            >
              Annulla ultimo movimento
            </Button>
          </div>

          <div className="mt-4 border p-4 h-64 overflow-y-auto">
            <h3 className="font-bold mb-2">Movimenti:</h3>
            <ul className="space-y-1">
              {moves.map((move, index) => (
                <li key={index}>{index + 1}. {move}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotGrid;