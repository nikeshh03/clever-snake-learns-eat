
import { useState } from 'react';
import GameBoard from '@/components/GameBoard';
import ControlPanel from '@/components/ControlPanel';
import StatsPanel from '@/components/StatsPanel';
import InfoPanel from '@/components/InfoPanel';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [gameMode, setGameMode] = useState<'ai' | 'manual'>('ai');
  const [isTraining, setIsTraining] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(5);
  const [gameStats, setGameStats] = useState({
    score: 0,
    highScore: 0,
    gamesPlayed: 0,
    averageScore: 0
  });

  const handleStartTraining = () => {
    setIsTraining(true);
    toast({
      title: "Training started!",
      description: "The AI is now learning how to play Snake.",
    });
  };

  const handleStopTraining = () => {
    setIsTraining(false);
    toast({
      title: "Training stopped",
      description: "You can resume training anytime.",
    });
  };

  const handleToggleGameMode = () => {
    setGameMode(prevMode => {
      const newMode = prevMode === 'ai' ? 'manual' : 'ai';
      toast({
        title: `Switched to ${newMode === 'ai' ? 'AI' : 'Manual'} mode`,
        description: newMode === 'ai' 
          ? "The AI will control the snake." 
          : "You can now control the snake with arrow keys.",
      });
      return newMode;
    });
  };

  const handleSpeedChange = (newSpeed: number) => {
    setGameSpeed(newSpeed);
    toast({
      title: "Game speed updated",
      description: `Speed set to ${newSpeed}`,
    });
  };

  const updateStats = (newStats: typeof gameStats) => {
    setGameStats(newStats);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-primary animate-fade-in">
          Clever Snake <span className="text-gray-500 font-normal">learns to eat</span>
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border border-accent">
              <CardContent className="p-0">
                <GameBoard 
                  gameMode={gameMode}
                  gameSpeed={gameSpeed}
                  isTraining={isTraining}
                  updateStats={updateStats}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ControlPanel 
              gameMode={gameMode}
              gameSpeed={gameSpeed}
              isTraining={isTraining}
              onToggleGameMode={handleToggleGameMode}
              onSpeedChange={handleSpeedChange}
              onStartTraining={handleStartTraining}
              onStopTraining={handleStopTraining}
            />
            
            <StatsPanel stats={gameStats} />
            
            <InfoPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
