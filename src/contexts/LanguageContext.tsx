import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    statistics: 'Statistics',
    admin: 'Admin',
    
    // Header
    workPermitDashboard: 'Work Permit Dashboard',
    adminDashboard: 'Admin Dashboard',
    compact: 'Compact',
    compactMode: 'Compact Mode',
    hideHeader: 'Hide header',
    
    // Sync
    syncActive: 'Sync Active',
    syncOff: 'Sync Off',
    last: 'Last',
    
    // KPI
    totalPermits: 'Total Permits',
    active: 'Active',
    expiringSoon: 'Expiring Soon',
    expired: 'Expired',
    notExpired: 'Not expired',
    total: 'Total',
    warning: 'Warning',
    
    // Filters
    search: 'Search',
    searchPlaceholder: 'Search by application, description, or name...',
    type: 'Type',
    allTypes: 'All Types',
    wpStatus: 'WP Status',
    allWpStatus: 'All WP Status',
    mainWorkCenter: 'Main Work Center',
    allWorkCenters: 'All Work Centers',
    pickupFromReceiver: 'Pickup from Receiver',
    allReceivers: 'All Receivers',
    area: 'Area',
    allAreas: 'All Areas',
    includePrepPwpInac: 'Include PREP PWP INAC',
    showingOf: 'Showing {0} of {1} permits',
    
    // Permit types
    hot: 'Hot',
    electric: 'Electric',
    cold: 'Cold',
    composite: 'Composite',
    
    // Auto scroll
    stop: 'Stop',
    autoScroll: 'Auto Scroll',
    speed: 'Speed',
    
    // Permit Card
    applicationNumber: 'Application Number',
    description: 'Description',
    functionLocation: 'Function Location',
    receiver: 'Receiver',
    validTo: 'Valid To',
    
    // Pagination
    show: 'Show',
    perPage: 'per page',
    of: 'of',
    firstPage: 'First page',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    lastPage: 'Last page',
    
    // Export
    export: 'Export',
    exportPDF: 'Export PDF',
    exportAsExcel: 'Export as Excel (.xlsx)',
    exportAsCSV: 'Export as CSV',
    exportAsPDF: 'Export as PDF',
    readableLargerCards: 'Readable (larger cards)',
    denseMoreCards: 'Dense (more cards)',
    a4Readable: 'A4 Readable',
    a3Readable: 'A3 Readable',
    a4Dense: 'A4 Dense',
    a3Dense: 'A3 Dense',
    screenshot: 'Screenshot',
    print: 'Print',
    noPermitsToExport: 'No permits to export',
    exportedPermits: 'Exported {0} permits to {1}',
    
    // Empty state
    noDataLoaded: 'No Data Loaded',
    uploadExcelFile: 'Upload an Excel file to view work permits',
    goToAdminToUpload: 'Go to Admin to Upload',
    noPermitsFound: 'No permits found',
    
    // Statistics
    allWorkPermits: 'All Work Permits',
    application: 'Application',
    location: 'Location',
    status: 'Status',
    expiredAgo: 'Expired {0}h ago',
    hoursLeft: '{0}h left',
    statisticsByReceiver: 'Statistics by Receiver',
    statisticsByWorkCenter: 'Statistics by Work Center',
    expiredPermitsByWorkCenter: 'Expired Permits by Main Work Center',
    permits: 'permits',
    
    // Simultaneous Work
    simultaneousWorkDetection: 'Simultaneous Work Detection',
    noSimultaneousWork: 'No simultaneous work detected — all locations have single permits.',
    reviewSafetyConflicts: 'Locations with multiple active permits — review for potential safety conflicts.',
    highRisk: '⚠ High Risk',
    mediumRisk: '⚡ Medium',
    lowRisk: 'ℹ Low',
    deEnergizedWork: 'De-Energized Work',
    multiplePermitTypes: 'Multiple Permit Types',
    workCenters: 'Work Centers',
    
    // Admin
    dataSource: 'Data Source',
    dataSourceDesc: 'Load data from a server file path or browse a local file',
    settings: 'Settings',
    configDashboard: 'Configure dashboard behavior',
    loading: 'Loading...',
    error: 'Error',
    permitsLoaded: '{0} permits loaded',
    refreshNow: 'Refresh Now',
    serverFilePath: 'Server File Path',
    serverFilePathDesc: 'Path to the Excel file on the server (e.g. /export.xlsx)',
    apply: 'Apply',
    browseLocalFile: 'Browse Local File',
    browseLocalFileDesc: 'Upload an Excel file directly from your computer (one-time load, no auto-sync)',
    browseFile: 'Browse File...',
    sapIntegration: 'SAP Integration',
    sapInstructions: 'Export data from SAP GUI → ZWCMREPORTS → Save as .xlsx → Place in server\'s public folder or browse directly',
    autoPollingEvery: 'Auto-polling every {0}s from',
    warningThreshold: 'Warning Threshold (hours)',
    warningThresholdDesc: 'Permits expiring within this many hours will be marked as "Expiring Soon"',
    hours1to72: 'hours (1-72)',
    save: 'Save',
    pollingInterval: 'Polling Interval (seconds)',
    pollingIntervalDesc: 'How often the dashboard checks for updated data',
    seconds5to3600: 'seconds (5-3600)',
    columnMappingPreview: 'Column Mapping Preview',
    columnMappingDesc: 'Shows which Excel columns were mapped to each field',
    
    // Toast messages
    warningThresholdUpdated: 'Warning threshold updated to {0} hours',
    invalidThreshold: 'Please enter a value between 1 and 72 hours',
    pollingIntervalUpdated: 'Polling interval updated to {0} seconds',
    invalidPollInterval: 'Please enter a value between 5 and 3600 seconds',
    filePathUpdated: 'File path updated to {0}',
    invalidFilePath: 'Please enter a valid file path',
    selectExcelFile: 'Please select an Excel file (.xlsx or .xls)',
    dataRefreshed: 'Data refreshed from server',
    refreshFailed: 'Failed to refresh data',
    
    // PDF Export
    workPermitsStatus: 'WORK PERMITS STATUS',
    workPermitsStatusReport: 'WORK PERMITS STATUS REPORT',
    confidential: 'CONFIDENTIAL',
    confidentialFooter: 'CONFIDENTIAL - For Internal Use Only',
    officialDocument: 'Official Document for Internal Use',
    documentReference: 'Document Reference:',
    generated: 'Generated:',
    executiveSummary: 'EXECUTIVE SUMMARY',
    totalWorkPermits: 'Total Work Permits:',
    activePermits: 'Active Permits:',
    permitsRequiringAttention: 'Permits Requiring Attention:',
    expiredPermits: 'Expired Permits:',
    warningThresholdLabel: 'Warning Threshold:',
    permitDetails: 'PERMIT DETAILS',
    permitNo: 'Permit No.',
    assignedTo: 'Assigned To',
    expiryDateTime: 'Expiry Date/Time',
    remaining: 'Remaining',
    endOfReport: '— End of Report —',
    reportContains: 'This report contains {0} permit record(s) as of {1} {2}.',
    attention: 'ATTENTION',
    page: 'Page',
    
    // Misc
    hRemaining: '{0}h remaining',
  },
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    statistics: 'الإحصائيات',
    admin: 'الإدارة',
    
    // Header
    workPermitDashboard: 'لوحة تصاريح العمل',
    adminDashboard: 'لوحة الإدارة',
    compact: 'مختصر',
    compactMode: 'الوضع المختصر',
    hideHeader: 'إخفاء الرأس',
    
    // Sync
    syncActive: 'المزامنة نشطة',
    syncOff: 'المزامنة متوقفة',
    last: 'آخر',
    
    // KPI
    totalPermits: 'إجمالي التصاريح',
    active: 'نشط',
    expiringSoon: 'تنتهي قريباً',
    expired: 'منتهي',
    notExpired: 'غير منتهي',
    total: 'الإجمالي',
    warning: 'تحذير',
    
    // Filters
    search: 'بحث',
    searchPlaceholder: 'البحث بالتطبيق أو الوصف أو الاسم...',
    type: 'النوع',
    allTypes: 'جميع الأنواع',
    wpStatus: 'حالة WP',
    allWpStatus: 'جميع حالات WP',
    mainWorkCenter: 'مركز العمل الرئيسي',
    allWorkCenters: 'جميع مراكز العمل',
    pickupFromReceiver: 'الاستلام من المستلم',
    allReceivers: 'جميع المستلمين',
    area: 'المنطقة',
    allAreas: 'جميع المناطق',
    includePrepPwpInac: 'تضمين PREP PWP INAC',
    showingOf: 'عرض {0} من {1} تصريح',
    
    // Permit types
    hot: 'ساخن',
    electric: 'كهربائي',
    cold: 'بارد',
    composite: 'مركّب',
    
    // Auto scroll
    stop: 'إيقاف',
    autoScroll: 'تمرير تلقائي',
    speed: 'السرعة',
    
    // Permit Card
    applicationNumber: 'رقم التطبيق',
    description: 'الوصف',
    functionLocation: 'موقع الوظيفة',
    receiver: 'المستلم',
    validTo: 'صالح حتى',
    
    // Pagination
    show: 'عرض',
    perPage: 'لكل صفحة',
    of: 'من',
    firstPage: 'الصفحة الأولى',
    previousPage: 'الصفحة السابقة',
    nextPage: 'الصفحة التالية',
    lastPage: 'الصفحة الأخيرة',
    
    // Export
    export: 'تصدير',
    exportPDF: 'تصدير PDF',
    exportAsExcel: 'تصدير كملف Excel (.xlsx)',
    exportAsCSV: 'تصدير كملف CSV',
    exportAsPDF: 'تصدير كملف PDF',
    readableLargerCards: 'مقروء (بطاقات أكبر)',
    denseMoreCards: 'كثيف (بطاقات أكثر)',
    a4Readable: 'A4 مقروء',
    a3Readable: 'A3 مقروء',
    a4Dense: 'A4 كثيف',
    a3Dense: 'A3 كثيف',
    screenshot: 'لقطة شاشة',
    print: 'طباعة',
    noPermitsToExport: 'لا توجد تصاريح للتصدير',
    exportedPermits: 'تم تصدير {0} تصريح إلى {1}',
    
    // Empty state
    noDataLoaded: 'لم يتم تحميل بيانات',
    uploadExcelFile: 'قم برفع ملف Excel لعرض تصاريح العمل',
    goToAdminToUpload: 'انتقل إلى الإدارة للرفع',
    noPermitsFound: 'لم يتم العثور على تصاريح',
    
    // Statistics
    allWorkPermits: 'جميع تصاريح العمل',
    application: 'التطبيق',
    location: 'الموقع',
    status: 'الحالة',
    expiredAgo: 'انتهى منذ {0} ساعة',
    hoursLeft: '{0} ساعة متبقية',
    statisticsByReceiver: 'الإحصائيات حسب المستلم',
    statisticsByWorkCenter: 'الإحصائيات حسب مركز العمل',
    expiredPermitsByWorkCenter: 'التصاريح المنتهية حسب مركز العمل الرئيسي',
    permits: 'تصاريح',
    
    // Simultaneous Work
    simultaneousWorkDetection: 'كشف الأعمال المتزامنة',
    noSimultaneousWork: 'لم يتم اكتشاف أعمال متزامنة — جميع المواقع بها تصريح واحد.',
    reviewSafetyConflicts: 'مواقع بها تصاريح نشطة متعددة — مراجعة لتعارضات السلامة المحتملة.',
    highRisk: '⚠ خطر عالي',
    mediumRisk: '⚡ متوسط',
    lowRisk: 'ℹ منخفض',
    deEnergizedWork: 'عمل بدون طاقة',
    multiplePermitTypes: 'أنواع تصاريح متعددة',
    workCenters: 'مراكز العمل',
    
    // Admin
    dataSource: 'مصدر البيانات',
    dataSourceDesc: 'تحميل البيانات من مسار ملف الخادم أو تصفح ملف محلي',
    settings: 'الإعدادات',
    configDashboard: 'تهيئة سلوك لوحة التحكم',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    permitsLoaded: 'تم تحميل {0} تصريح',
    refreshNow: 'تحديث الآن',
    serverFilePath: 'مسار ملف الخادم',
    serverFilePathDesc: 'مسار ملف Excel على الخادم (مثال: /export.xlsx)',
    apply: 'تطبيق',
    browseLocalFile: 'تصفح ملف محلي',
    browseLocalFileDesc: 'رفع ملف Excel مباشرة من جهازك (تحميل لمرة واحدة، بدون مزامنة تلقائية)',
    browseFile: 'تصفح ملف...',
    sapIntegration: 'تكامل SAP',
    sapInstructions: 'تصدير البيانات من SAP GUI → ZWCMREPORTS → حفظ كـ .xlsx → وضع في المجلد العام للخادم أو تصفح مباشرة',
    autoPollingEvery: 'استطلاع تلقائي كل {0} ثانية من',
    warningThreshold: 'حد التحذير (ساعات)',
    warningThresholdDesc: 'التصاريح التي تنتهي خلال هذه الساعات سيتم تمييزها بـ "تنتهي قريباً"',
    hours1to72: 'ساعات (1-72)',
    save: 'حفظ',
    pollingInterval: 'فترة الاستطلاع (ثواني)',
    pollingIntervalDesc: 'كم مرة تتحقق لوحة التحكم من البيانات المحدثة',
    seconds5to3600: 'ثواني (5-3600)',
    columnMappingPreview: 'معاينة تعيين الأعمدة',
    columnMappingDesc: 'يعرض أعمدة Excel التي تم تعيينها لكل حقل',
    
    // Toast messages
    warningThresholdUpdated: 'تم تحديث حد التحذير إلى {0} ساعة',
    invalidThreshold: 'يرجى إدخال قيمة بين 1 و 72 ساعة',
    pollingIntervalUpdated: 'تم تحديث فترة الاستطلاع إلى {0} ثانية',
    invalidPollInterval: 'يرجى إدخال قيمة بين 5 و 3600 ثانية',
    filePathUpdated: 'تم تحديث مسار الملف إلى {0}',
    invalidFilePath: 'يرجى إدخال مسار ملف صالح',
    selectExcelFile: 'يرجى اختيار ملف Excel (.xlsx أو .xls)',
    dataRefreshed: 'تم تحديث البيانات من الخادم',
    refreshFailed: 'فشل تحديث البيانات',
    
    // PDF Export
    workPermitsStatus: 'حالة تصاريح العمل',
    workPermitsStatusReport: 'تقرير حالة تصاريح العمل',
    confidential: 'سري',
    confidentialFooter: 'سري - للاستخدام الداخلي فقط',
    officialDocument: 'وثيقة رسمية للاستخدام الداخلي',
    documentReference: 'مرجع الوثيقة:',
    generated: 'تم الإنشاء:',
    executiveSummary: 'الملخص التنفيذي',
    totalWorkPermits: 'إجمالي تصاريح العمل:',
    activePermits: 'التصاريح النشطة:',
    permitsRequiringAttention: 'التصاريح التي تحتاج اهتمام:',
    expiredPermits: 'التصاريح المنتهية:',
    warningThresholdLabel: 'حد التحذير:',
    permitDetails: 'تفاصيل التصاريح',
    permitNo: 'رقم التصريح',
    assignedTo: 'مسند إلى',
    expiryDateTime: 'تاريخ/وقت الانتهاء',
    remaining: 'المتبقي',
    endOfReport: '— نهاية التقرير —',
    reportContains: 'يحتوي هذا التقرير على {0} سجل(سجلات) تصريح حتى {1} {2}.',
    attention: 'انتباه',
    page: 'صفحة',
    
    // Misc
    hRemaining: '{0} ساعة متبقية',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, ...args: (string | number)[]) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app-language') as Language) || 'en';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: TranslationKey, ...args: (string | number)[]): string => {
    let text: string = translations[language][key] as string || translations.en[key] as string || key;
    args.forEach((arg, i) => {
      text = text.replace(`{${i}}`, String(arg));
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
