import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface AutoScrollControlsProps {
  isAutoScrolling: boolean;
  scrollDirection: 'up' | 'down';
  scrollSpeed: number;
  onToggle: () => void;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

export function AutoScrollControls({
  isAutoScrolling, scrollDirection, scrollSpeed, onToggle, onSpeedChange, className
}: AutoScrollControlsProps) {
  const { t } = useLanguage();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="bg-white/20 border-white/30 text-primary-foreground hover:bg-white/30 gap-2"
      >
        {isAutoScrolling ? (
          <>
            <Pause className="h-4 w-4 text-orange" />
            <span>{t('stop')}</span>
            {scrollDirection === 'down' ? <ArrowDown className="h-4 w-4 text-orange" /> : <ArrowUp className="h-4 w-4 text-orange" />}
          </>
        ) : (
          <>
            <Play className="h-4 w-4 text-khaki" />
            <span>{t('autoScroll')}</span>
          </>
        )}
      </Button>

      {isAutoScrolling && (
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
          <span className="text-xs text-primary-foreground/80 whitespace-nowrap">{scrollSpeed.toFixed(1)}x</span>
          <Slider
            value={[scrollSpeed]}
            onValueChange={([value]) => onSpeedChange(value)}
            min={0.5} max={4} step={0.5}
            className="w-24"
          />
          <span className="text-xs text-primary-foreground/60">{t('speed')}</span>
        </div>
      )}
    </div>
  );
}
