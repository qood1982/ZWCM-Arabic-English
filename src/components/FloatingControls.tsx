import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  Play, 
  Pause,
  ArrowDown,
  ArrowUp,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';

interface FloatingControlsProps {
  visible: boolean;
  activeTab: 'dashboard' | 'admin' | 'statistics';
  isAutoScrolling?: boolean;
  scrollDirection?: 'up' | 'down';
  onToggleAutoScroll?: () => void;
}

export function FloatingControls({
  visible,
  activeTab,
  isAutoScrolling = false,
  scrollDirection = 'down',
  onToggleAutoScroll
}: FloatingControlsProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, path: '/' },
    { id: 'statistics', label: t('statistics'), icon: BarChart3, path: '/statistics' },
    { id: 'admin', label: t('admin'), icon: ShieldCheck, path: '/admin' },
  ];

  return (
    <div className={cn(
      "fixed top-3 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300",
      visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-[2rem] border transition-all",
        "bg-card border-border shadow-[0_4px_16px_hsl(0_0%_0%/0.15),0_2px_6px_hsl(0_0%_0%/0.1)]",
        "dark:bg-[hsl(220_20%_12%)] dark:border-[hsl(220_15%_20%)] dark:shadow-[0_4px_20px_hsl(0_0%_0%/0.35),0_2px_8px_hsl(0_0%_0%/0.25)]"
      )}>
        {/* Navigation */}
        <div className={cn(
          "flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-xl",
          "bg-muted/50",
          "dark:bg-[hsl(220_18%_16%)]"
        )}>
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[0.6875rem] sm:text-xs font-medium transition-all",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25"
              )}
            >
              <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden xs:block w-px h-5 bg-border dark:bg-[hsl(220_15%_25%)]" />

        {/* Clock */}
        <div className={cn(
          "hidden md:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[0.6875rem] sm:text-xs",
          "bg-muted/50",
          "dark:bg-[hsl(220_18%_16%)]"
        )}>
          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
          <span className="font-semibold text-foreground tabular-nums">
            {format(currentTime, 'HH:mm:ss')}
          </span>
          <span className="text-muted-foreground">
            {format(currentTime, 'dd/MM/yyyy')}
          </span>
        </div>

        {/* Auto-scroll toggle */}
        {activeTab === 'dashboard' && onToggleAutoScroll && (
          <>
            <div className="hidden md:block w-px h-5 bg-border dark:bg-[hsl(220_15%_25%)]" />
            <button
              onClick={onToggleAutoScroll}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-all",
                "bg-muted/50 text-foreground",
                "dark:bg-[hsl(220_18%_18%)]",
                "hover:bg-primary/10 hover:text-primary",
                "dark:hover:bg-primary/25",
                isAutoScrolling && "bg-status-active/20 text-status-active dark:bg-status-active/25"
              )}
            >
              {isAutoScrolling ? (
                <div className="flex items-center gap-0.5">
                  <Pause className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {scrollDirection === 'down' ? (
                    <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  ) : (
                    <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  )}
                </div>
              ) : (
                <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              )}
            </button>
          </>
        )}

        {/* Divider */}
        <div className="w-px h-5 bg-border dark:bg-[hsl(220_15%_25%)]" />

        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className={cn(
            "h-8 sm:h-9 flex items-center gap-1 px-2 sm:px-2.5 rounded-xl transition-all text-[0.6875rem] sm:text-xs font-semibold",
            "bg-muted/50 text-foreground",
            "dark:bg-[hsl(220_18%_18%)]",
            "hover:bg-primary/10 hover:text-primary",
            "dark:hover:bg-primary/25"
          )}
        >
          <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{language === 'en' ? 'AR' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            "w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-all",
            "bg-muted/50 text-foreground",
            "dark:bg-[hsl(220_18%_18%)]",
            "hover:bg-primary/10 hover:text-primary",
            "dark:hover:bg-primary/25"
          )}
        >
          {theme === 'dark' ? (
            <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
