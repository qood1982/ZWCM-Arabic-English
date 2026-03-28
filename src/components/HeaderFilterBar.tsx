import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutoScrollControls } from '@/components/AutoScrollControls';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';

interface FilterOption {
  name: string;
  count?: number;
  expiredCount?: number;
}

interface HeaderFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onTypeChange: (value: string) => void;
  filterWpStatus: string;
  onWpStatusChange: (value: string) => void;
  wpStatusOptions: string[];
  filterMainWorkCenter: string;
  onWorkCenterChange: (value: string) => void;
  mainWorkCenterOptions: FilterOption[];
  filterReceiver: string;
  onReceiverChange: (value: string) => void;
  receiverOptions: FilterOption[];
  filterArea: string;
  onAreaChange: (value: string) => void;
  areaOptions: FilterOption[];
  filteredCount: number;
  totalCount: number;
  isAutoScrolling?: boolean;
  scrollDirection?: 'down' | 'up';
  scrollSpeed?: number;
  onToggleAutoScroll?: () => void;
  onSpeedChange?: (speed: number) => void;
  includePrepPwpInac?: boolean;
  onIncludePrepPwpInacChange?: (value: boolean) => void;
  hasPrepPwpInac?: boolean;
}

export const HeaderFilterBar = ({
  searchTerm, onSearchChange, filterType, onTypeChange,
  filterWpStatus, onWpStatusChange, wpStatusOptions,
  filterMainWorkCenter, onWorkCenterChange, mainWorkCenterOptions,
  filterReceiver, onReceiverChange, receiverOptions,
  filterArea, onAreaChange, areaOptions,
  filteredCount, totalCount,
  isAutoScrolling, scrollDirection, scrollSpeed,
  onToggleAutoScroll, onSpeedChange,
  includePrepPwpInac, onIncludePrepPwpInacChange, hasPrepPwpInac,
}: HeaderFilterBarProps) => {
  const { t } = useLanguage();
  const permitTypes = ['all', 'hot', 'electric', 'cold', 'composite'];

  const typeLabels: Record<string, string> = {
    all: t('allTypes'),
    hot: t('hot'),
    electric: t('electric'),
    cold: t('cold'),
    composite: t('composite'),
  };

  return (
    <div className="flex flex-wrap gap-4 items-end pt-3 mt-3 border-t border-white/20">
      <div className="flex-[2] min-w-[200px] flex flex-col gap-1">
        <label className="text-xs font-medium text-white/70">{t('search')}</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 py-2 px-3 bg-white/95 border-white/30 text-foreground text-sm rounded-md focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>
      
      <div className="flex-[0.75] min-w-[120px] flex flex-col gap-1">
        <label className="text-xs font-medium text-white/70">{t('type')}</label>
        <Select value={filterType} onValueChange={onTypeChange}>
          <SelectTrigger className="bg-white/95 border-white/30 text-foreground text-sm">
            <SelectValue placeholder={t('allTypes')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {permitTypes.map(type => (
              <SelectItem key={type} value={type}>{typeLabels[type]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-[0.75] min-w-[130px] flex flex-col gap-1">
        <label className="text-xs font-medium text-white/70">{t('wpStatus')}</label>
        <Select value={filterWpStatus} onValueChange={onWpStatusChange}>
          <SelectTrigger className="bg-white/95 border-white/30 text-foreground text-sm">
            <SelectValue placeholder={t('allWpStatus')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all">{t('allWpStatus')}</SelectItem>
            {wpStatusOptions.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 min-w-[150px] flex flex-col gap-1">
        <label className="text-xs font-medium text-white/70">{t('mainWorkCenter')}</label>
        <Select value={filterMainWorkCenter} onValueChange={onWorkCenterChange}>
          <SelectTrigger className="bg-white/95 border-white/30 text-foreground text-sm">
            <SelectValue placeholder={t('allWorkCenters')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all">{t('allWorkCenters')}</SelectItem>
            {mainWorkCenterOptions.map(wc => (
              <SelectItem key={wc.name} value={wc.name}>
                {wc.name} {wc.expiredCount !== undefined && `(${wc.expiredCount} exp)`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[160px] flex flex-col gap-1">
        <label className="text-xs font-medium text-white/70">{t('pickupFromReceiver')}</label>
        <Select value={filterReceiver} onValueChange={onReceiverChange}>
          <SelectTrigger className="bg-white/95 border-white/30 text-foreground text-sm">
            <SelectValue placeholder={t('allReceivers')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all">{t('allReceivers')}</SelectItem>
            {receiverOptions.map(r => (
              <SelectItem key={r.name} value={r.name}>
                {r.name} {r.count !== undefined && `(${r.count})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[150px] flex flex-col gap-1">
        <label className="text-xs font-medium text-white/70">{t('area')}</label>
        <Select value={filterArea} onValueChange={onAreaChange}>
          <SelectTrigger className="bg-white/95 border-white/30 text-foreground text-sm">
            <SelectValue placeholder={t('allAreas')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all">{t('allAreas')}</SelectItem>
            {areaOptions.map(a => (
              <SelectItem key={a.name} value={a.name}>
                {a.name} {a.count !== undefined && `(${a.count})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 text-white/80 text-sm">
        {hasPrepPwpInac && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              checked={includePrepPwpInac}
              onCheckedChange={(checked) => onIncludePrepPwpInacChange?.(!!checked)}
              className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-primary"
            />
            <span className="text-xs text-white/80 whitespace-nowrap">{t('includePrepPwpInac')}</span>
          </label>
        )}
        <span>{t('showingOf', filteredCount, totalCount)}</span>
        {onToggleAutoScroll && (
          <AutoScrollControls
            isAutoScrolling={isAutoScrolling || false}
            scrollDirection={scrollDirection || 'down'}
            scrollSpeed={scrollSpeed || 2.5}
            onToggle={onToggleAutoScroll}
            onSpeedChange={onSpeedChange}
          />
        )}
      </div>
    </div>
  );
};
