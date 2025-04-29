
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Agent } from '@/lib/agent';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

type Position = {
  x: number;
  y: number;
};

type Snake = Position[];

type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

interface GameBoardProps {
  gameMode: 'ai' | 'manual';
  gameSpeed: number;
  isTraining: boolean;
  updateStats: (stats: any) => void;
}

const GameBoard = ({ gameMode, gameSpeed, isTraining, updateStats }: GameBoardProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Snake>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [learningRate, setLearningRate] = useState(0.01);

  // Game loop reference
  const gameLoopRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const directionQueueRef = useRef<Direction[]>([]);

  // Initialize agent
  useEffect(() => {
    const newAgent = new Agent(GRID_SIZE, learningRate);
    setAgent(newAgent);
  }, []);

  // Handle keyboard controls for manual mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameMode !== 'manual') return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') directionQueueRef.current.push('UP');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') directionQueueRef.current.push('RIGHT');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') directionQueueRef.current.push('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') directionQueueRef.current.push('LEFT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, direction]);

  // Place food in a random, unoccupied cell
  const placeFood = () => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  // Reset game state
  const resetGame = () => {
    setSnake([{ x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }]);
    setDirection('RIGHT');
    setGameOver(false);
    placeFood();
    setScore(0);
    directionQueueRef.current = [];

    // Update game stats
    setGamesPlayed(prev => prev + 1);
    updateStats({
      score: 0,
      highScore,
      gamesPlayed: gamesPlayed + 1,
      averageScore: Math.round(totalScore / (gamesPlayed + 1))
    });
  };

  // Game loop
  useEffect(() => {
    if (!agent) return;

    const gameLoop = (timestamp: number) => {
      if (!canvasRef.current) return;

      const secondsSinceLastRender = (timestamp - lastRenderTimeRef.current) / 1000;
      if (secondsSinceLastRender < 1 / gameSpeed) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      lastRenderTimeRef.current = timestamp;

      if (!gameOver) {
        // Get next direction
        if (gameMode === 'ai') {
          // AI mode - get direction from agent
          const nextDirection = agent.getAction(snake, food, direction);
          setDirection(nextDirection as Direction);
        } else {
          // Manual mode - get direction from queue
          if (directionQueueRef.current.length > 0) {
            setDirection(directionQueueRef.current.shift()!);
          }
        }

        // Move the snake
        moveSnake();
        // Draw the board
        drawGame();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    // Start game loop
    if (gameLoopRef.current === null) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    // Clean up on unmount
    return () => {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameMode, gameSpeed, gameOver, snake, food, direction, agent, isTraining]);

  // Move snake based on current direction
  const moveSnake = () => {
    if (gameOver) return;

    const head = { ...snake[0] };
    
    // Calculate new head position
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
    }

    // Check collision with walls
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      handleGameOver();
      return;
    }

    // Check collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }

    // Create new snake array with new head
    const newSnake = [head, ...snake];

    // Check if snake ate food
    const ateFood = head.x === food.x && head.y === food.y;
    
    if (ateFood) {
      // Increment score
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      
      // Place new food
      placeFood();

      // Update agent rewards (for RL)
      if (agent && gameMode === 'ai') {
        agent.receiveReward(10); // Positive reward for eating food
      }
      
      // Update stats
      updateStats({
        score: newScore,
        highScore: Math.max(newScore, highScore),
        gamesPlayed,
        averageScore: Math.round((totalScore + newScore) / (gamesPlayed))
      });
    } else {
      // Remove tail if no food eaten
      newSnake.pop();
      
      // Small negative reward for not finding food (encourages efficiency)
      if (agent && gameMode === 'ai') {
        agent.receiveReward(-0.1);
      }
    }

    setSnake(newSnake);
    
    // Update agent if in training mode
    if (isTraining && agent && gameMode === 'ai') {
      agent.learn(snake, food, direction, newSnake, food, ateFood);
    }
  };

  // Handle game over
  const handleGameOver = () => {
    setGameOver(true);
    setTotalScore(prev => prev + score);
    
    // Large negative reward for dying
    if (agent && gameMode === 'ai') {
      agent.receiveReward(-15);
    }

    // Auto-restart for AI mode or training
    if (gameMode === 'ai' || isTraining) {
      setTimeout(resetGame, 500);
    } else {
      toast({
        title: "Game Over!",
        description: `Your score: ${score}. Press any key to restart.`,
        duration: 3000,
      });
      
      // Add one-time listener for restart in manual mode
      const handleRestart = () => {
        resetGame();
        window.removeEventListener('keydown', handleRestart);
      };
      window.addEventListener('keydown', handleRestart);
    }
  };

  // Draw the game
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = gameOver ? '#ff000010' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (light)
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#9b87f5';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 * 0.8,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      // Head is different color
      if (index === 0) {
        ctx.fillStyle = '#7E69AB';
      } else {
        // Body gradient from dark to lighter
        const colorFactor = 1 - index / snake.length;
        const r = Math.floor(126 + colorFactor * 60);
        const g = Math.floor(105 + colorFactor * 50);
        const b = Math.floor(171 + colorFactor * 50);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      
      // Add eyes to head
      if (index === 0) {
        ctx.fillStyle = '#ffffff';
        
        // Position eyes based on direction
        const eyeSize = CELL_SIZE / 5;
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        switch (direction) {
          case 'UP':
            leftEyeX = segment.x * CELL_SIZE + CELL_SIZE / 4;
            leftEyeY = segment.y * CELL_SIZE + CELL_SIZE / 4;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE * 3/4;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE / 4;
            break;
          case 'RIGHT':
            leftEyeX = segment.x * CELL_SIZE + CELL_SIZE * 3/4;
            leftEyeY = segment.y * CELL_SIZE + CELL_SIZE / 4;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE * 3/4;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE * 3/4;
            break;
          case 'DOWN':
            leftEyeX = segment.x * CELL_SIZE + CELL_SIZE / 4;
            leftEyeY = segment.y * CELL_SIZE + CELL_SIZE * 3/4;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE * 3/4;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE * 3/4;
            break;
          case 'LEFT':
            leftEyeX = segment.x * CELL_SIZE + CELL_SIZE / 4;
            leftEyeY = segment.y * CELL_SIZE + CELL_SIZE / 4;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE / 4;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE * 3/4;
            break;
        }
        
        // Draw eyes
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Game over overlay
    if (gameOver && gameMode === 'manual') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
      ctx.font = '16px sans-serif';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
      ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 60);
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className={cn(
          "border border-accent rounded-md bg-white shadow-md",
          gameMode === 'ai' && isTraining && "animate-glow"
        )}
      />
      
      {/* Score overlay */}
      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium">
        Score: {score}
      </div>
      
      {/* Game mode indicator */}
      <div className={cn(
        "absolute top-2 right-2 px-3 py-1 rounded-md text-sm font-medium",
        gameMode === 'ai' ? "bg-primary/80 text-primary-foreground" : "bg-accent/80 text-accent-foreground"
      )}>
        {gameMode === 'ai' ? 'AI Mode' : 'Manual Mode'}
      </div>
    </div>
  );
};

export default GameBoard;
