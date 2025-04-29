
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const InfoPanel = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="how-to-play">
            <AccordionTrigger>How to Play</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                Switch to Manual mode and use the arrow keys to control the snake.
                Eat the purple food to grow the snake and increase your score.
                Avoid hitting the walls or your own tail!
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="ai-mode">
            <AccordionTrigger>AI Mode</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                In AI mode, a reinforcement learning algorithm controls the snake.
                Toggle training on to allow the AI to learn from its experiences.
                Watch as it gets better over time!
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="reinforcement-learning">
            <AccordionTrigger>Reinforcement Learning</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">
                This game uses Q-learning, a form of reinforcement learning.
                The AI learns by receiving rewards for good actions (eating food)
                and penalties for bad actions (dying). This knowledge is stored
                in a Q-table that helps the AI make better decisions over time.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default InfoPanel;
