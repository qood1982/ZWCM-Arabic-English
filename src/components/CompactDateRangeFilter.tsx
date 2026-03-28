import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CompactDateRangeFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function CompactDateRangeFilter({ 
  dateRange, 
  onDateRangeChange 
}: CompactDateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const hasDateRange = dateRange?.from || dateRange?.to;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateRangeChange(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5 h-8 text-sm font-medium transition-all print:hidden",
            hasDateRange && "ring-2 ring-primary border-primary bg-primary/5"
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {hasDateRange ? (
            <>
              <span className="hidden sm:inline">
                {dateRange?.from ? format(dateRange.from, 'MMM d') : ''}
                {dateRange?.to ? ` - ${format(dateRange.to, 'MMM d')}` : ''}
              </span>
              <span className="sm:hidden">
                {dateRange?.from ? format(dateRange.from, 'M/d') : ''}
                {dateRange?.to ? `-${format(dateRange.to, 'M/d')}` : ''}
              </span>
              <button
                onClick={handleClear}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <span>Date Range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={(range) => {
            onDateRangeChange(range);
            if (range?.from && range?.to) {
              setOpen(false);
            }
          }}
          numberOfMonths={2}
          className={cn("p-3 pointer-events-auto")}
        />
        <div className="flex items-center justify-between px-3 pb-3 border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onDateRangeChange(undefined);
              setOpen(false);
            }}
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={() => setOpen(false)}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
