import { ReactNode, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ShieldCheck, BarChart3, ChevronUp, Clock, Grid3X3, LayoutGrid, Menu, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { format } from 'date-fns';
import gasTurbineWallpaper from '@/assets/gas-turbine-power-plant.png';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { useLanguage } from '@/contexts/LanguageContext';

interface GradientHeaderProps {
  title: string;
  activeTab: 'dashboard' | 'admin' | 'statistics';
  headerVisible?: boolean;
  onToggleHeader?: () => void;
  showToggle?: boolean;
  isCompact?: boolean;
  onToggleCompact?: () => void;
  syncStatus?: { syncEnabled: boolean; lastSyncTime: string | null };
  children?: ReactNode;
}

export const GradientHeader = ({
  title,
  activeTab,
  headerVisible = true,
  onToggleHeader,
  showToggle = true,
  isCompact = false,
  onToggleCompact,
  syncStatus,
  children,
}: GradientHeaderProps) => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = gasTurbineWallpaper;
    img.onload = () => setBgLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { value: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, path: '/' },
    { value: 'statistics', label: t('statistics'), icon: BarChart3, path: '/statistics' },
    { value: 'admin', label: t('admin'), icon: ShieldCheck, path: '/admin' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  if (!headerVisible) {
    return null;
  }

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-10 border-b border-border/50 shadow-lg overflow-visible transition-[background-image] duration-500"
      style={{
        backgroundImage: bgLoaded ? `url(${gasTurbineWallpaper})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-gradient-to-br from-primary/85 via-primary/70 to-primary/60 dark:from-[hsl(210,42%,14%)/0.95] dark:via-[hsl(210,38%,11%)/0.9] dark:to-[hsl(210,35%,8%)/0.9] backdrop-blur-[1px] px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {showToggle && onToggleHeader && (
              <button
                onClick={onToggleHeader}
                className="w-8 h-8 rounded-md bg-transparent text-white flex items-center justify-center transition-all duration-200 hover:bg-white/20"
                title={t('hideHeader')}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            )}
            <h1 className="text-xl font-heading font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
              {title}
            </h1>
            
            <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1.5 bg-white/15 rounded-lg border border-white/30 backdrop-blur-sm">
              <Clock className="h-4 w-4 text-white/90" />
              <span className="text-sm font-heading font-semibold text-white tracking-wider" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {format(currentTime, 'HH:mm:ss')}
              </span>
              <span className="text-xs font-body text-white/80 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {format(currentTime, 'dd/MM/yyyy')}
              </span>
            </div>

            {syncStatus && (
              <SyncStatusIndicator syncEnabled={syncStatus.syncEnabled} lastSyncTime={syncStatus.lastSyncTime} />
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {activeTab === 'dashboard' && onToggleCompact && (
              <button
                onClick={onToggleCompact}
                className={`flex items-center gap-2 px-3 py-2 bg-white/15 border border-white/30 rounded-lg backdrop-blur-sm text-white/90 font-heading text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-white/25 ${
                  isCompact ? 'bg-white text-primary border-white' : ''
                }`}
                title="Toggle compact mode"
              >
                {isCompact ? (
                  <LayoutGrid className="w-4 h-4" />
                ) : (
                  <Grid3X3 className="w-4 h-4" />
                )}
                <span>{t('compact')}</span>
              </button>
            )}
            
            <nav className="flex gap-1 bg-white/15 border border-white/30 backdrop-blur-sm p-1 rounded-lg">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-md font-heading font-medium text-sm cursor-pointer transition-all duration-200 flex items-center gap-2 border-none ${
                    activeTab === item.value
                      ? 'bg-white text-primary shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                      : 'bg-transparent text-white/80 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/15 border border-white/30 rounded-lg backdrop-blur-sm text-white/90 font-heading text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-white/25"
            >
              <Languages className="w-4 h-4" />
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            
            <ThemeToggle className="w-9 h-9 rounded-full bg-white/15 text-white hover:bg-white/25 border-none" />
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-white/15 text-white border-none flex items-center justify-center text-xs font-bold"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <ThemeToggle className="flex-shrink-0 w-9 h-9 rounded-full bg-white/15 text-white border-none" />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-primary-foreground hover:bg-white/20 border border-white/30 bg-white/15"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-card border-border">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.value}
                      variant={activeTab === item.value ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12 text-base"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  ))}
                  
                  {activeTab === 'dashboard' && onToggleCompact && (
                    <>
                      <div className="h-px bg-border my-2" />
                      <button
                        onClick={onToggleCompact}
                        className={`w-full flex items-center gap-3 h-12 text-base px-4 rounded-md transition-colors ${
                          isCompact ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                      >
                        {isCompact ? (
                          <LayoutGrid className="w-5 h-5" />
                        ) : (
                          <Grid3X3 className="w-5 h-5" />
                        )}
                        {t('compactMode')}
                      </button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {children}
      </div>
    </header>
  );
};
