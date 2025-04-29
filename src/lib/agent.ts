
// Simple Q-learning agent for Snake game
export class Agent {
  private qTable: Map<string, number[]>;
  private learningRate: number;
  private discountFactor: number;
  private explorationRate: number;
  private minExplorationRate: number;
  private explorationDecay: number;
  private lastState: string | null;
  private lastAction: number | null;
  private gridSize: number;
  private directions: string[];
  private cumulativeReward: number;

  constructor(gridSize: number, learningRate = 0.1) {
    this.gridSize = gridSize;
    this.qTable = new Map<string, number[]>();
    this.learningRate = learningRate;
    this.discountFactor = 0.95;
    this.explorationRate = 0.3;
    this.minExplorationRate = 0.01;
    this.explorationDecay = 0.995;
    this.lastState = null;
    this.lastAction = null;
    this.cumulativeReward = 0;
    this.directions = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
  }

  // Create a simplified state representation
  private getState(snake: Array<{x: number, y: number}>, food: {x: number, y: number}, currentDirection: string): string {
    const head = snake[0];
    
    // Direction to food
    const foodDirX = food.x > head.x ? 'RIGHT' : food.x < head.x ? 'LEFT' : 'SAME';
    const foodDirY = food.y > head.y ? 'DOWN' : food.y < head.y ? 'UP' : 'SAME';
    
    // Danger checks (walls or self)
    let dangerAhead = false;
    let dangerRight = false;
    let dangerLeft = false;
    
    // Check for danger based on current direction
    if (currentDirection === 'UP') {
      dangerAhead = head.y === 0 || snake.some(s => s !== head && s.x === head.x && s.y === head.y - 1);
      dangerRight = head.x === this.gridSize - 1 || snake.some(s => s !== head && s.x === head.x + 1 && s.y === head.y);
      dangerLeft = head.x === 0 || snake.some(s => s !== head && s.x === head.x - 1 && s.y === head.y);
    } else if (currentDirection === 'RIGHT') {
      dangerAhead = head.x === this.gridSize - 1 || snake.some(s => s !== head && s.x === head.x + 1 && s.y === head.y);
      dangerRight = head.y === this.gridSize - 1 || snake.some(s => s !== head && s.x === head.x && s.y === head.y + 1);
      dangerLeft = head.y === 0 || snake.some(s => s !== head && s.x === head.x && s.y === head.y - 1);
    } else if (currentDirection === 'DOWN') {
      dangerAhead = head.y === this.gridSize - 1 || snake.some(s => s !== head && s.x === head.x && s.y === head.y + 1);
      dangerRight = head.x === 0 || snake.some(s => s !== head && s.x === head.x - 1 && s.y === head.y);
      dangerLeft = head.x === this.gridSize - 1 || snake.some(s => s !== head && s.x === head.x + 1 && s.y === head.y);
    } else if (currentDirection === 'LEFT') {
      dangerAhead = head.x === 0 || snake.some(s => s !== head && s.x === head.x - 1 && s.y === head.y);
      dangerRight = head.y === 0 || snake.some(s => s !== head && s.x === head.x && s.y === head.y - 1);
      dangerLeft = head.y === this.gridSize - 1 || snake.some(s => s !== head && s.x === head.x && s.y === head.y + 1);
    }
    
    // Construct state string
    return `${currentDirection}|${foodDirX}|${foodDirY}|${dangerAhead ? 1 : 0}|${dangerRight ? 1 : 0}|${dangerLeft ? 1 : 0}`;
  }

  // Get or initialize Q-values for a state
  private getQValues(state: string): number[] {
    if (!this.qTable.has(state)) {
      // Initialize with small random values
      this.qTable.set(state, [
        Math.random() * 0.1,
        Math.random() * 0.1,
        Math.random() * 0.1,
        Math.random() * 0.1
      ]);
    }
    return this.qTable.get(state)!;
  }

  // Choose action based on current state (epsilon-greedy policy)
  public getAction(snake: Array<{x: number, y: number}>, food: {x: number, y: number}, currentDirection: string): string {
    const state = this.getState(snake, food, currentDirection);
    this.lastState = state;
    
    // Exploration vs exploitation
    if (Math.random() < this.explorationRate) {
      // Explore - random action
      let validActions = [];
      
      // Can't go in opposite direction
      if (currentDirection !== 'DOWN') validActions.push(0); // UP
      if (currentDirection !== 'LEFT') validActions.push(1); // RIGHT
      if (currentDirection !== 'UP') validActions.push(2); // DOWN
      if (currentDirection !== 'RIGHT') validActions.push(3); // LEFT
      
      this.lastAction = validActions[Math.floor(Math.random() * validActions.length)];
    } else {
      // Exploit - choose best action
      const qValues = this.getQValues(state);
      
      // Filter out invalid actions (can't reverse direction)
      let validQValues = [...qValues];
      if (currentDirection === 'UP') validQValues[2] = -Infinity; // Can't go DOWN
      if (currentDirection === 'RIGHT') validQValues[3] = -Infinity; // Can't go LEFT
      if (currentDirection === 'DOWN') validQValues[0] = -Infinity; // Can't go UP
      if (currentDirection === 'LEFT') validQValues[1] = -Infinity; // Can't go RIGHT
      
      // Find max Q-value among valid actions
      let maxVal = -Infinity;
      let maxIndices = [];
      
      for (let i = 0; i < validQValues.length; i++) {
        if (validQValues[i] > maxVal) {
          maxVal = validQValues[i];
          maxIndices = [i];
        } else if (validQValues[i] === maxVal) {
          maxIndices.push(i);
        }
      }
      
      // Choose randomly among best actions
      this.lastAction = maxIndices[Math.floor(Math.random() * maxIndices.length)];
    }
    
    // Decay exploration rate
    this.explorationRate = Math.max(
      this.minExplorationRate,
      this.explorationRate * this.explorationDecay
    );
    
    return this.directions[this.lastAction!];
  }

  // Receive external reward
  public receiveReward(reward: number): void {
    this.cumulativeReward += reward;
  }

  // Learn from experience
  public learn(
    prevSnake: Array<{x: number, y: number}>,
    prevFood: {x: number, y: number},
    prevDirection: string,
    newSnake: Array<{x: number, y: number}>,
    newFood: {x: number, y: number},
    ateFood: boolean
  ): void {
    if (this.lastState === null || this.lastAction === null) {
      return;
    }
    
    // Get current state and q-values
    const currentState = this.getState(newSnake, newFood, this.directions[this.lastAction]);
    const currentQValues = this.getQValues(currentState);
    
    // Calculate reward (simplified)
    let reward = this.cumulativeReward;
    this.cumulativeReward = 0; // Reset cumulative reward
    
    // Calculate TD target (Temporal Difference)
    const maxFutureQ = Math.max(...currentQValues);
    const oldQValues = this.getQValues(this.lastState);
    
    // Update Q-value for the action taken
    const newQValue = oldQValues[this.lastAction] + 
                      this.learningRate * 
                      (reward + this.discountFactor * maxFutureQ - oldQValues[this.lastAction]);
    
    oldQValues[this.lastAction] = newQValue;
    this.qTable.set(this.lastState, oldQValues);
  }
}
