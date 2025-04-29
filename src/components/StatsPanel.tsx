
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface StatsPanelProps {
  stats: {
    score: number;
    highScore: number;
    gamesPlayed: number;
    averageScore: number;
  };
}

const StatsPanel = ({ stats }: StatsPanelProps) => {
  const progressPercentage = stats.highScore > 0 
    ? (stats.score / stats.highScore) * 100 
    : 0;
  
  const learningProgress = stats.gamesPlayed > 0
    ? Math.min(Math.log(stats.gamesPlayed) * 10, 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Score</span>
            <span className="font-medium">{stats.score}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">High Score</p>
            <p className="text-lg font-medium">{stats.highScore}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Score</p>
            <p className="text-lg font-medium">{stats.averageScore.toFixed(1)}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Games Played</p>
            <p className="text-lg font-medium">{stats.gamesPlayed}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-lg font-medium">
              {stats.gamesPlayed > 0 
                ? `${Math.round((stats.averageScore / 10) * 100)}%` 
                : '0%'}
            </p>
          </div>
        </div>

        <Separator className="my-2" />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>AI Learning Progress</span>
            <span className="font-medium">{Math.round(learningProgress)}%</span>
          </div>
          <Progress value={learningProgress} className="h-2 bg-accent" />
          <p className="text-xs text-muted-foreground">
            {stats.gamesPlayed < 10 
              ? "AI needs more games to learn effectively" 
              : stats.gamesPlayed < 50
                ? "AI is developing basic strategies"
                : "AI has learned decent gameplay tactics"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsPanel;
