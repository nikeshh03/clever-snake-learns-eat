
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ControlPanelProps {
  gameMode: 'ai' | 'manual';
  gameSpeed: number;
  isTraining: boolean;
  onToggleGameMode: () => void;
  onSpeedChange: (speed: number) => void;
  onStartTraining: () => void;
  onStopTraining: () => void;
}

const ControlPanel = ({
  gameMode,
  gameSpeed,
  isTraining,
  onToggleGameMode,
  onSpeedChange,
  onStartTraining,
  onStopTraining
}: ControlPanelProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="game-mode">AI Mode</Label>
            <Switch
              id="game-mode"
              checked={gameMode === 'ai'}
              onCheckedChange={onToggleGameMode}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {gameMode === 'ai'
              ? 'AI is controlling the snake'
              : 'Use arrow keys to control the snake'}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Game Speed</Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Slow</span>
            <Slider
              value={[gameSpeed]}
              min={1}
              max={20}
              step={1}
              onValueChange={(values) => onSpeedChange(values[0])}
              className="flex-1"
            />
            <span className="text-sm">Fast</span>
          </div>
          <p className="text-sm text-muted-foreground">Current: {gameSpeed}</p>
        </div>

        {gameMode === 'ai' && (
          <div className="space-y-2 pt-2">
            <Label>AI Training</Label>
            <p className="text-sm text-muted-foreground mb-2">
              {isTraining
                ? 'AI is actively learning from each game'
                : 'AI will use current knowledge without learning'}
            </p>
            
            {isTraining ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onStopTraining}
              >
                Stop Training
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="w-full bg-primary hover:bg-primary/90" 
                onClick={onStartTraining}
              >
                Start Training
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
