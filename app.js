/* FollowTheMoney vanilla JS */
(function(){
  const $ = sel => document.querySelector(sel);
  const balanceEl = $('#balance');
  const homeScreen = $('#screen-home');
  const historyScreen = $('#screen-history');
  const historyList = $('#historyList');
  const recentListEl = $('#recentList');
  const sheet = $('#sheet');
  const sheetPanel = sheet ? sheet.querySelector('.sheet-panel') : null;
  const sheetAmountEl = $('#sheetAmount');
  const rawDigits = $('#rawDigits');
  const confirmBtn = $('#confirmBtn');
  const categoryContainer = $('#categoryContainer');
  const categoryInput = $('#categoryInput');
  const categoryListEl = $('#categoryList');
  const categorySuggestionsEl = $('#categorySuggestions');
  const nameContainer = $('#nameContainer');
  const nameInput = $('#nameInput');
  const nameListEl = $('#nameList');
  const nameSuggestionsEl = $('#nameSuggestions');
  const toggleNoteBtn = $('#toggleNote');
  const noteContainer = $('#noteContainer');
  const noteInput = $('#noteInput');
  const btnMovePart = $('#btnMovePart');
  const movePartContainer = $('#movePartContainer');
  const movePartSheetAmountEl = $('#movePartSheetAmount');
  const movePartRawDigits = $('#movePartRawDigits');
  const movePartCategoryInput = $('#movePartCategory');
  const movePartNameInput = $('#movePartName');
  const movePartCategorySuggestionsEl = $('#movePartCategorySuggestions');
  const movePartNameSuggestionsEl = $('#movePartNameSuggestions');
  const movePartConfirmBtn = $('#movePartConfirm');
  const movePartBackBtn = $('#movePartBack');
  const settingsModal = $('#settingsModal');
  const helpModal = $('#helpModal');
  const themeToggleEl = $('#themeToggle');
  const btnClearAll = $('#btnClearAll');
  const btnAddIncome = $('#btnAddIncome');
  const btnAddExpense = $('#btnAddExpense');
  const floatButtonsWrap = document.querySelector('.float-buttons');
  // Seasonal Budget elements
  const seasonalModeToggle = $('#seasonalModeToggle');
  const seasonalSettingsEl = $('#seasonalSettings');
  const seasonStartEl = $('#seasonStart');
  const seasonEndEl = $('#seasonEnd');
  const saveSeasonBtn = $('#saveSeason');
  const seasonInfoEl = $('#seasonInfo');
  const allowanceInfoEl = $('#allowanceInfo');
  const seasonBadgeEl = $('#seasonBadge');
  const dashboardGridEl = $('#dashboardGrid');
  const dailyAllowanceEl = $('#dailyAllowance');
  const dailySpentEl = $('#dailySpent');
  const weeklyAllowanceEl = $('#weeklyAllowance');
  const weeklySpentEl = $('#weeklySpent');
  const monthlyAllowanceEl = $('#monthlyAllowance');
  const monthlySpentEl = $('#monthlySpent');
  const historyFilterEl = $('#historyFilter');
  const historyTypeFiltersEl = $('#historyTypeFilters');
  const categoryChipRow = $('#categoryChipRow');
  const nameChipRow = $('#nameChipRow');
  const historyChipSearchInput = $('#historyChipSearch');
  const historyGroupSummaryEl = $('#historyGroupSummary');
  const summaryScreen = $('#screen-summary');
  const summaryLabelEl = $('#summaryLabel');
  const summaryCountEl = $('#summaryCount');
  const summaryAverageEl = $('#summaryAverage');
  const summaryNetEl = $('#summaryNet');
  const summaryFiltersEl = $('#summaryFilters');
  const summaryListEl = $('#summaryList');
  const btnSummaryBack = $('#btnSummaryBack');
  const editDateContainer = $('#editDateContainer');
  const editDateInput = $('#editDateInput');
  const recurringContainer = $('#recurringContainer');
  const recurringToggle = $('#recurringToggle');
  const recurringFrequency = $('#recurringFrequency');
  const frequencySelect = $('#frequencySelect');
  const dateFormatEl = $('#dateFormat');
  const singleButtonModeToggle = $('#singleButtonModeToggle');
  const currencySymbolInput = $('#currencySymbol');
  const languageSelectEl = $('#languageSelect');
  const btnExportShare = $('#btnExportShare');
  const btnImportData = $('#btnImportData');
  const importFileInput = $('#importFile');
  const historyLockToggle = $('#historyLockToggle');
  const graphScreen = $('#screen-graph');
  const graphTypeFiltersEl = $('#graphTypeFilters');
  const graphLegendEl = $('#graphLegend');
  const graphLegendScrollArrowUp = $('#graphLegendScrollArrowUp');
  const graphLegendScrollArrowDown = $('#graphLegendScrollArrowDown');
  const graphLegendScrollIndicators = $('#graphLegendScrollIndicators');
  const graphCanvas = $('#graphCanvas');
  const graphEmptyEl = $('#graphEmpty');
  const graphTotalValueEl = $('#graphTotalValue');
  const graphTotalScopeEl = $('#graphTotalScope');
  const graphMainEl = $('#graphMain');
  const graphTimelineEl = $('#graphTimeline');
  const timelineCanvas = $('#timelineCanvas');
  const timelineCanvasWrap = $('#timelineCanvasWrap');
  const timelineEmptyEl = $('#timelineEmpty');
  const timelineCursorEl = $('#timelineCursor');
  const timelinePopupEl = $('#timelineCursorPopup');
  const timelinePopupDateEl = $('#timelinePopupDate');
  const timelinePopupDateText = $('#timelinePopupDateText');
  const timelinePopupListEl = $('#timelinePopupList');
  const timelineScrollArrowUp = $('#timelineScrollArrowUp');
  const timelineScrollArrowDown = $('#timelineScrollArrowDown');
  const btnGraphTimeline = $('#btnGraphTimeline');
  const graphRangeBtn = $('#graphRangeBtn');
  const graphRangeMenu = $('#graphRangeMenu');
  const graphRangeApplyBtn = $('#graphRangeApply');
  const graphRangeClearBtn = $('#graphRangeClear');
  const graphRangeStartInput = $('#graphRangeStart');
  const graphRangeEndInput = $('#graphRangeEnd');
  const btnTimelineCursorToggle = $('#btnTimelineCursorToggle');
  // breakdown total element removed — no reference needed
  const graphGroupInputs = Array.from(document.querySelectorAll('input[name="graphGroup"]'));

  let sheetType = null; // 'income' | 'expense'
  let sheetMode = 'add'; // 'add' | 'edit'
  let editingTransaction = null;
  let transactions = [];
  let historyFilter = null; // null | 'day' | 'week' | 'month'
  let historyTypeFilter = 'all'; // 'all' | 'income' | 'expense'
  let historyCategoryFilter = null;
  let historyNameFilter = null;
  let historyChipSearchText = '';
  let historySummaryState = null;
  let summaryPressTimer = null;
  let previousSummaryReturnScreen = 'history';
  let settings = { 
    recurringEnabled:false, 
    recurringAmountCents:0, 
    lastRecurringAppliedMonth:null, 
    theme: 'light',
    seasonalMode: false,
    seasonStart: null,
    seasonEnd: null,
    seasonIncomeCents: 0,
    dateFormat: 'dmy',
    currencySymbol: '€',
    language: 'en',
    historyLocked: true,
    singleButtonMode: false,
    incomeCategories: [],
    expenseCategories: [],
    incomeNames: [],
    expenseNames: [],
    graphExclusions: {
      income: { category: [], name: [] },
      expense: { category: [], name: [] }
    }
  };
  let pendingHistoryHighlightId = null;
  const historyOverlayDismissEvents = ['pointerdown','mousedown','touchstart','keydown','wheel'];
  let activeHistoryOverlayEl = null;
  let historyOverlayDismissHandler = null;
  let historyFocusCoverEl = null;
  let historyOverlayAttachTimer = null;
  let graphType = 'expense';
  let graphGrouping = 'category';
  let previousNonGraphScreen = 'home';
  let currentScreen = 'home';
  let graphMode = 'classic'; // 'classic' | 'timeline'
  let graphDateRange = { type:'all', start:null, end:null };
  let _ftm_lastGraphRangeToggle = 0;
  const graphColorCache = new Map();
  const graphPalette = ['#30d6a4','#ff4f6a','#6580ff','#f6c343','#58c7ff','#ff9fd5','#8be28b','#ffa25e','#ffd166','#b388ff'];
  let timelineSeriesData = null;
  let timelineEntriesByDay = new Map();
  let timelineChartMeta = null;
  let timelineCursorIndex = null;
  let timelineDragActive = false;
  let timelineCursorEnabled = false;
  const SINGLE_BUTTON_HOLD_MS = 1000;
  let singleButtonHoldTimer = null;
  let singleButtonLongPressTriggered = false;
  const LEGEND_HOLD_DURATION = 3000;
  let legendHoldTimer = null;
  let legendHoldTarget = null;
  let legendPopupEl = null;
  let legendFlashLabel = null;
  let legendFlashTimer = null;

  // IndexedDB setup
  const DB_NAME = 'followthemoney_plain';
  const TX_STORE = 'transactions';
  const SETTINGS_STORE = 'settings';
  let db;
  const LOCAL_BACKUP_KEY = 'ftm_offline_backup_v1';
  const UPDATE_FLAG_KEY = 'ftm_pending_sw_swap';
  let backupWriteTimer = null;

  function readLocalBackup(){
    if(typeof localStorage === 'undefined') return null;
    try{
      const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      if(!parsed || typeof parsed !== 'object') return null;
      if(parsed.transactions && !Array.isArray(parsed.transactions)) parsed.transactions = [];
      if(parsed.settings && typeof parsed.settings !== 'object') parsed.settings = null;
      return parsed;
    }catch(err){
      console.warn('Local backup read failed', err);
      return null;
    }
  }
  function persistLocalBackup(reason){
    if(typeof localStorage === 'undefined') return;
    try{
      const payload = {
        version: 1,
        reason: reason || 'auto',
        savedAt: Date.now(),
        transactions: transactions.map(t=>({ ...t })),
        settings: { ...settings }
      };
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(payload));
    }catch(err){
      console.warn('Local backup write failed', err);
    }
  }
  function scheduleLocalBackup(reason){
    if(backupWriteTimer) clearTimeout(backupWriteTimer);
    backupWriteTimer = setTimeout(()=>{
      backupWriteTimer = null;
      persistLocalBackup(reason);
    }, 150);
  }
  function flushLocalBackup(reason){
    if(backupWriteTimer){
      clearTimeout(backupWriteTimer);
      backupWriteTimer = null;
    }
    if(typeof localStorage === 'undefined') return;
    persistLocalBackup(reason);
  }
  function applyBackupSnapshot(snapshot, options={}){
    if(!snapshot) return;
    const { silent=false } = options;
    let changed = false;
    if(Array.isArray(snapshot.transactions)){
      transactions = snapshot.transactions.map(t=>({ ...t }));
      changed = true;
    }
    if(snapshot.settings && typeof snapshot.settings === 'object'){
      settings = { ...settings, ...snapshot.settings };
      normalizeCollections();
      changed = true;
    }
    if(changed && !silent){
      setLanguage(settings.language || 'en', false);
      syncSettingsUI();
      return;
    }
  }

  function hideTimelineCursorUI(){
    if(timelineCanvasWrap) timelineCanvasWrap.classList.remove('showing-cursor');
    if(timelineCursorEl) timelineCursorEl.hidden = true;
    if(timelinePopupEl) timelinePopupEl.hidden = true;
  }

  function refreshTimelineCursorUI(){
    if(!timelineCanvasWrap || !timelineCursorEl || !timelinePopupEl) return;
    const labels = timelineSeriesData ? timelineSeriesData.labels : [];
    const count = labels ? labels.length : 0;
    if(!count || graphMode !== 'timeline' || !timelineChartMeta || !timelineCursorEnabled){
      hideTimelineCursorUI();
      return;
    }
    let idx = timelineCursorIndex;
    if(typeof idx !== 'number' || idx < 0) idx = count - 1;
    if(idx >= count) idx = count - 1;
    if(idx < 0){
      hideTimelineCursorUI();
      return;
    }
    if(idx !== timelineCursorIndex) timelineCursorIndex = idx;
    const label = labels[idx];
    if(!label){
      hideTimelineCursorUI();
      return;
    }
    const { padding, step, dpr, cssWidth } = timelineChartMeta;
    const totalSteps = Math.max(1, labels.length - 1);
    const xDevice = padding.left + (totalSteps === 0 ? 0 : timelineCursorIndex * step);
    const cssX = xDevice / dpr;
    const wrapWidth = cssWidth || (timelineCanvas ? timelineCanvas.getBoundingClientRect().width : 0) || 1;
    const percent = Math.max(0, Math.min(100, (cssX / wrapWidth) * 100));
    
    timelineCanvasWrap.style.setProperty('--cursor-left', `${percent}%`);
    timelineCanvasWrap.classList.add('showing-cursor');
    timelineCursorEl.hidden = false;
    timelinePopupEl.hidden = false;
    if(timelinePopupDateText) timelinePopupDateText.textContent = formatDateTime(label.ts,false);
    renderTimelinePopupList(label.ts);
  }

  function updateTimelineScrollArrows(){
    if(!timelinePopupListEl || !timelineScrollArrowUp || !timelineScrollArrowDown) return;
    const entries = timelinePopupListEl.querySelectorAll('li:not(.timeline-popup-empty)').length;
    
    // Only show arrows if more than 2 transactions
    if(entries <= 2){
      timelineScrollArrowUp.classList.remove('visible');
      timelineScrollArrowDown.classList.remove('visible');
      return;
    }
    
    const scrollTop = timelinePopupListEl.scrollTop;
    const scrollHeight = timelinePopupListEl.scrollHeight;
    const clientHeight = timelinePopupListEl.clientHeight;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show up arrow if not at top
    if(scrollTop > 1){
      timelineScrollArrowUp.classList.add('visible');
    } else {
      timelineScrollArrowUp.classList.remove('visible');
    }
    
    // Show down arrow if not at bottom
    if(scrollBottom > 1){
      timelineScrollArrowDown.classList.add('visible');
    } else {
      timelineScrollArrowDown.classList.remove('visible');
    }
  }

  function updateGraphLegendScrollIndicators(){
    if(!graphLegendEl || !graphLegendScrollArrowUp || !graphLegendScrollArrowDown || !graphLegendScrollIndicators) return;
    const { scrollTop, scrollHeight, clientHeight } = graphLegendEl;
    const canScroll = scrollHeight - clientHeight > 1;
    graphLegendScrollIndicators.classList.toggle('active', canScroll);
    if(!canScroll){
      graphLegendScrollArrowUp.classList.remove('visible');
      graphLegendScrollArrowDown.classList.remove('visible');
      return;
    }
    if(scrollTop > 1){
      graphLegendScrollArrowUp.classList.add('visible');
    } else {
      graphLegendScrollArrowUp.classList.remove('visible');
    }
    if(scrollHeight - clientHeight - scrollTop > 1){
      graphLegendScrollArrowDown.classList.add('visible');
    } else {
      graphLegendScrollArrowDown.classList.remove('visible');
    }
  }

  function renderTimelinePopupList(ts){
    if(!timelinePopupListEl) return;
    timelinePopupListEl.innerHTML = '';
    const entries = (timelineEntriesByDay && timelineEntriesByDay.get(ts)) || [];
    if(!entries.length){
      const empty = document.createElement('li');
      empty.className = 'timeline-popup-empty';
      empty.textContent = t('no_transactions_on_day');
      timelinePopupListEl.appendChild(empty);
      updateTimelineScrollArrows();
      return;
    }
    entries.forEach(tx=>{
      const li = document.createElement('li');
      li.className = tx.amountCents >= 0 ? 'income' : 'expense';
      const labelSpan = document.createElement('span');
      const primary = (tx.name && tx.name.trim()) || (tx.category && tx.category.trim()) || t('untitled');
      labelSpan.textContent = primary;
      const amountStrong = document.createElement('strong');
      amountStrong.textContent = formatCurrency(tx.amountCents);
      li.append(labelSpan, amountStrong);
      timelinePopupListEl.appendChild(li);
    });
    // Update arrows after rendering
    updateTimelineScrollArrows();
  }

  function updateTimelineCursorFromEvent(evt){
    if(!timelineChartMeta || !timelineSeriesData || !timelineSeriesData.labels.length) return;
    if(!timelineCanvas) return;
    const rect = timelineCanvas.getBoundingClientRect();
    const relative = rect.width ? (evt.clientX - rect.left) / rect.width : 0;
    const deviceX = relative * timelineChartMeta.canvasWidth;
    setTimelineCursorByDeviceX(deviceX);
  }

  function setTimelineCursorByDeviceX(deviceX){
    if(!timelineChartMeta || !timelineSeriesData || !timelineSeriesData.labels.length) return;
    const { padding, chartWidth } = timelineChartMeta;
    const min = padding.left;
    const max = padding.left + chartWidth;
    const clamped = Math.min(Math.max(deviceX, min), max);
    const labelsCount = timelineSeriesData.labels.length;
    const progress = chartWidth === 0 ? 0 : (clamped - padding.left) / chartWidth;
    const idx = Math.round(progress * Math.max(0, labelsCount - 1));
    if(!Number.isFinite(idx)) return;
    timelineCursorIndex = idx;
    refreshTimelineCursorUI();
  }

  function handleTimelinePointerDown(evt){
    if(graphMode !== 'timeline' || !timelineCursorEnabled) return;
    if(!timelineCanvas || !timelineSeriesData || !timelineSeriesData.labels.length) return;
    timelineDragActive = true;
    if(timelineCanvas.setPointerCapture) timelineCanvas.setPointerCapture(evt.pointerId);
    updateTimelineCursorFromEvent(evt);
  }

  function handleTimelinePointerMove(evt){
    if(!timelineDragActive) return;
    updateTimelineCursorFromEvent(evt);
  }

  function handleTimelinePointerUp(evt){
    if(!timelineDragActive) return;
    timelineDragActive = false;
    if(evt && timelineCanvas && timelineCanvas.releasePointerCapture){
      try { timelineCanvas.releasePointerCapture(evt.pointerId); } catch(_){}
    }
    refreshTimelineCursorUI();
  }

  function openDB(){
    return new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME,1);
      req.onupgradeneeded = e => {
        const d = req.result;
        if(!d.objectStoreNames.contains(TX_STORE)){
          const tx = d.createObjectStore(TX_STORE,{ keyPath:'id' });
          tx.createIndex('createdAt','createdAt');
        }
        if(!d.objectStoreNames.contains(SETTINGS_STORE)){
          d.createObjectStore(SETTINGS_STORE,{ keyPath:'id' });
        }
      };
      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error);
    });
  }

  function dbGetAllTransactions(){
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(TX_STORE,'readonly');
      const store = tx.objectStore(TX_STORE).index('createdAt');
      const req = store.getAll();
      req.onsuccess = ()=> resolve(req.result.sort((a,b)=>b.createdAt-a.createdAt));
      req.onerror = ()=> reject(req.error);
    });
  }
  function dbAddTransaction(t){
    if(!db) return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(TX_STORE,'readwrite');
      tx.objectStore(TX_STORE).put(t);
      tx.oncomplete = ()=> resolve();
      tx.onerror = ()=> reject(tx.error);
    });
  }
  function dbDeleteTransaction(id){
    if(!db) return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(TX_STORE,'readwrite');
      tx.objectStore(TX_STORE).delete(id);
      tx.oncomplete = ()=> resolve();
      tx.onerror = ()=> reject(tx.error);
    });
  }
  function dbGetSettings(){
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(SETTINGS_STORE,'readonly');
      const req = tx.objectStore(SETTINGS_STORE).get('settings');
      req.onsuccess = ()=> resolve(req.result || { 
        recurringEnabled:false, 
        recurringAmountCents:0, 
        lastRecurringAppliedMonth:null,
        theme: 'light',
        seasonalMode: false,
        seasonStart: null,
        seasonEnd: null,
        seasonIncomeCents: 0,
        dateFormat: 'dmy',
        currencySymbol: '€',
        language: 'en',
        historyLocked: true,
        singleButtonMode: false,
        incomeCategories: [],
        expenseCategories: [],
        incomeNames: [],
        expenseNames: [],
        graphExclusions: {
          income: { category: [], name: [] },
          expense: { category: [], name: [] }
        }
      });
      req.onerror = ()=> reject(req.error);
    });
  }
  function dbSaveSettings(s){
    if(!db){
      scheduleLocalBackup('settings-local-only');
      return Promise.resolve();
    }
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(SETTINGS_STORE,'readwrite');
      tx.objectStore(SETTINGS_STORE).put({ ...s, id:'settings' });
      tx.oncomplete = ()=>{ scheduleLocalBackup('settings-save'); resolve(); };
      tx.onerror = ()=> reject(tx.error);
    });
  }

  // i18n
  const I18N = {
    en: {
      nav_history: 'History',
      nav_settings: 'Settings',
      nav_home: 'Home',
      nav_back: 'Back',
      nav_summary: 'Summary',
      nav_insights: 'Insights',

      close: 'Close',
      cancel: 'Cancel',
      back: 'Back',

      income: 'Income',
      expense: 'Expense',
      expenses: 'Expenses',
      all: 'All',

      today: 'Today',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',

      balance: 'Balance',
      add_income_aria: 'Add income',
      add_expense_aria: 'Add expense',
      recent_aria: 'Recent transactions',

      search_categories_or_names: 'Search categories or names',
      search_filters: 'Search filters',
      all_categories: 'All categories',
      all_names: 'All names',
      all_entries: 'All entries',
      no_filters_applied: 'No filters applied',

      showing_prefix: 'Showing:',
      recurring: 'Recurring',
      edit_transaction_aria: 'Edit transaction',

      no_recent_entries: 'No recent entries',
      no_transactions_yet: 'No transactions yet.',
      no_transactions_in_period: 'No transactions in this period.',
      no_transactions_on_day: 'No transactions on this day',
      no_transactions_in_selection: 'No transactions in this selection yet.',

      untitled: 'Untitled',
      unnamed: 'Unnamed',
      uncategorized: 'Uncategorized',

      add_note: 'Add note',
      note_optional: 'Note (optional)',
      save_changes: 'Save Changes',
      add_income: 'Add Income',
      add_expense: 'Add Expense',

      income_category_placeholder: 'Income category',
      expense_category_placeholder: 'Expense category',
      sheet_type_income: 'Income',
      sheet_type_expense: 'Expense',

      move_part_btn: 'Move a part of the amount to...',
      move_part_title: 'Move part of amount',
      move_part_subtitle: 'Creates a new entry and reduces the current one.',
      amount_to_move: 'Amount to move',
      tap_amount_to_edit: 'Tap the amount to edit.',
      category: 'Category',
      name: 'Name',
      confirm_transfer: 'Confirm transfer',

      excluded: 'Excluded',

      time_range_prefix: 'Time range:',
      all_time: 'All time',
      this_week: 'This week',
      last_week: 'Last week',
      this_month: 'This month',
      last_month: 'Last month',
      custom_range_prefix: 'Custom:',
      start: 'Start',
      end: 'End',
      apply_custom: 'Apply custom',
      breakdown: 'Breakdown',
      total: 'Total',
      by_categories: 'by categories',
      by_names: 'by names',
      all_categories_excluded: 'All categories excluded',
      all_names_excluded: 'All names excluded',
      no_data_yet: 'No data yet',
      no_data_to_visualize: 'No data to visualize yet.',
      timeline: 'Timeline',
      income_vs_expense_over_time: 'Income vs Expense over time',
      inspect: 'Inspect',
      need_two_days: 'Need at least two days of data to draw trends.',

      toggle_timeline_view_aria: 'Toggle timeline view',
      graph_type_aria: 'Graph type',
      group_by_aria: 'Group by',
      categories: 'Categories',
      names: 'Names',

      budget_mode: 'Budget mode',
      off_season: 'Off-season',
      season_active: 'Season active',

      no_season_set: 'No season set.',
      season_active_sentence: 'Season active.',
      off_season_mode: 'Off-season mode.',
      days_to_start_season_one: '1 day to start of working season.',
      days_to_start_season_many: '{days} days to start of working season.',
      allowance_dwm: 'Allowance (D/W/M): {d} / {w} / {m}',

      help_support: 'Help & Support',
      general: 'General',
      general_subtitle: 'Choose how dates appear and how you add entries.',
      date_format: 'Date format',
      currency_symbol: 'Currency symbol',
      language: 'Language',
      changes_text_immediately: 'Changes the app text immediately.',
      home_input_buttons: 'Home input buttons',
      single_button_mode: 'Single button mode',
      tap_for_expense_hold_for_income: 'Tap for expense, press & hold 1s for income.',
      applies_to_recent_and_history: 'Applies to recent cards and history.',
      shown_after_amounts: 'Shown after every amount (e.g. €, $, Kč).',

      seasonal_budget: 'Seasonal Budget',
      seasonal_budget_subtitle: 'Enable seasonal mode or use simple budget tracking.',
      seasonal_budget_mode: 'Seasonal Budget Mode',
      seasonal_budget_preview: 'When off, dashboard shows Today/This Week/This Month income & expenses.',

      history_lock: 'History lock',
      history_lock_subtitle: 'Prevent accidental swipes from deleting entries.',
      lock_swipe_to_delete: 'Lock swipe-to-delete',
      lock_swipe_preview: 'You can still edit entries using the pencil icon.',

      data_export_import: 'Data export & import',
      data_export_import_subtitle: 'Back up everything and move between devices.',
      share_backup: 'Share backup',
      share_backup_preview: 'Uses the OS share sheet when available.',
      import_backup: 'Import backup',
      import_backup_preview: 'Select a saved .json backup file to restore.',

      advanced: 'Advanced',
      advanced_subtitle: 'Reset the app if you need a clean slate.',
      clear_all_data: 'Clear All Data',
      clear_all_preview: 'Clears all transactions and resets settings. A confirmation will appear when you press the button.',

      share_sheet_not_available: 'Share sheet not available. Backup downloaded instead.',
      unable_export_backup: 'Unable to export backup right now. Please try again.',
      import_replace_confirm: 'Importing will replace current data. Continue?',
      backup_imported_success: 'Backup imported successfully.',
      backup_import_failed: 'Could not import this backup file. Please make sure it was exported from FollowTheMoney.',
      unable_read_file: 'Unable to read the selected file.',
      clear_all_confirm: 'Clear all data? This will delete all transactions and reset settings. This cannot be undone.',
      delete_transaction_confirm: 'Delete this transaction?',
      amount_move_exceeds: 'Amount to move cannot exceed the transaction amount.',
      invalid_amount: 'Invalid amount.',
      transfer_failed: 'Unable to transfer part of the amount right now.',

      amount_entry_aria: 'Amount entry',
      select_or_type_category: 'Select or type category',

      transaction_date_time: 'Transaction date & time',
      adjust_backdate_hint: 'Adjust this when editing to backdate entries.',
      repeat_this_transaction: 'Repeat this transaction',
      frequency: 'Frequency',
      yearly: 'Yearly',

      start_of_working_season: 'Start of working season',
      end_of_working_season: 'End of working season',
      save_season_dates: 'Save Season Dates'
      ,
      summary_total_balance: 'Total balance',
      summary_entries: 'Entries',
      summary_average_amount: 'Average amount',
      summary_preview_transactions_aria: 'Preview transactions',
      summary_preview: 'Preview',
      summary_hint: 'Swipe left on an entry to toggle whether it counts toward the average.',

      income_only: 'Income only',
      expenses_only: 'Expenses only',
      filter_category_prefix: 'Category:',
      filter_name_prefix: 'Name:',
      filter_excluded_prefix: 'Excluded:'
    },
    hr: {
      nav_history: 'Povijest',
      nav_settings: 'Postavke',
      nav_home: 'Početna',
      nav_back: 'Natrag',
      nav_summary: 'Sažetak',
      nav_insights: 'Uvidi',

      close: 'Zatvori',
      cancel: 'Odustani',
      back: 'Natrag',

      income: 'Prihod',
      expense: 'Trošak',
      expenses: 'Troškovi',
      all: 'Sve',

      today: 'Danas',
      daily: 'Dnevno',
      weekly: 'Tjedno',
      monthly: 'Mjesečno',

      balance: 'Stanje',
      add_income_aria: 'Dodaj prihod',
      add_expense_aria: 'Dodaj trošak',
      recent_aria: 'Nedavne transakcije',

      search_categories_or_names: 'Pretraži kategorije ili nazive',
      search_filters: 'Pretraži filtere',
      all_categories: 'Sve kategorije',
      all_names: 'Svi nazivi',
      all_entries: 'Sve stavke',
      no_filters_applied: 'Nema aktivnih filtera',

      showing_prefix: 'Prikaz:',
      recurring: 'Ponavljajuće',
      edit_transaction_aria: 'Uredi transakciju',

      no_recent_entries: 'Nema nedavnih stavki',
      no_transactions_yet: 'Još nema transakcija.',
      no_transactions_in_period: 'Nema transakcija u ovom razdoblju.',
      no_transactions_on_day: 'Nema transakcija za taj dan',
      no_transactions_in_selection: 'Još nema transakcija u ovom odabiru.',

      untitled: 'Bez naslova',
      unnamed: 'Bez naziva',
      uncategorized: 'Bez kategorije',

      add_note: 'Dodaj bilješku',
      note_optional: 'Bilješka (neobavezno)',
      save_changes: 'Spremi promjene',
      add_income: 'Dodaj prihod',
      add_expense: 'Dodaj trošak',

      income_category_placeholder: 'Kategorija prihoda',
      expense_category_placeholder: 'Kategorija troška',
      sheet_type_income: 'Prihod',
      sheet_type_expense: 'Trošak',

      move_part_btn: 'Premjesti dio iznosa u...',
      move_part_title: 'Premjesti dio iznosa',
      move_part_subtitle: 'Stvara novi unos i umanjuje trenutni.',
      amount_to_move: 'Iznos za premještanje',
      tap_amount_to_edit: 'Dodirni iznos za unos.',
      category: 'Kategorija',
      name: 'Naziv',
      confirm_transfer: 'Potvrdi prijenos',

      excluded: 'Isključeno',

      time_range_prefix: 'Vremenski raspon:',
      all_time: 'Cijelo razdoblje',
      this_week: 'Ovaj tjedan',
      last_week: 'Prošli tjedan',
      this_month: 'Ovaj mjesec',
      last_month: 'Prošli mjesec',
      custom_range_prefix: 'Prilagođeno:',
      start: 'Početak',
      end: 'Kraj',
      apply_custom: 'Primijeni',
      breakdown: 'Raspodjela',
      total: 'Ukupno',
      by_categories: 'po kategorijama',
      by_names: 'po nazivima',
      all_categories_excluded: 'Sve kategorije isključene',
      all_names_excluded: 'Svi nazivi isključeni',
      no_data_yet: 'Nema podataka',
      no_data_to_visualize: 'Nema podataka za prikaz.',
      timeline: 'Vremenska crta',
      income_vs_expense_over_time: 'Prihod i trošak kroz vrijeme',
      inspect: 'Pregled',
      need_two_days: 'Potrebna su najmanje dva dana podataka za trend.',

      toggle_timeline_view_aria: 'Prebaci prikaz na vremensku crtu',
      graph_type_aria: 'Tip grafa',
      group_by_aria: 'Grupiraj po',
      categories: 'Kategorije',
      names: 'Nazivi',

      budget_mode: 'Budžet',
      off_season: 'Izvan sezone',
      season_active: 'Sezona aktivna',

      no_season_set: 'Sezona nije postavljena.',
      season_active_sentence: 'Sezona je aktivna.',
      off_season_mode: 'Izvan sezone.',
      days_to_start_season_one: '1 dan do početka radne sezone.',
      days_to_start_season_many: '{days} dana do početka radne sezone.',
      allowance_dwm: 'Dopušteno (D/T/M): {d} / {w} / {m}',

      help_support: 'Pomoć i podrška',
      general: 'Općenito',
      general_subtitle: 'Odaberite kako se datumi prikazuju i kako dodajete stavke.',
      date_format: 'Format datuma',
      currency_symbol: 'Simbol valute',
      language: 'Jezik',
      changes_text_immediately: 'Odmah mijenja tekst aplikacije.',
      home_input_buttons: 'Gumbi za unos',
      single_button_mode: 'Način s jednim gumbom',
      tap_for_expense_hold_for_income: 'Dodir za trošak, pritisni i drži 1 s za prihod.',
      applies_to_recent_and_history: 'Primjenjuje se na nedavne stavke i povijest.',
      shown_after_amounts: 'Prikazuje se nakon iznosa (npr. €, $, Kč).',

      seasonal_budget: 'Sezonski budžet',
      seasonal_budget_subtitle: 'Uključite sezonski način ili koristite jednostavno praćenje budžeta.',
      seasonal_budget_mode: 'Sezonski budžet',
      seasonal_budget_preview: 'Kad je isključeno, nadzorna ploča prikazuje Danas/Ovaj tjedan/Ovaj mjesec prihode i troškove.',

      history_lock: 'Zaključavanje povijesti',
      history_lock_subtitle: 'Spriječite slučajna brisanja swipe-om.',
      lock_swipe_to_delete: 'Zaključaj brisanje swipe-om',
      lock_swipe_preview: 'Još uvijek možete uređivati stavke pomoću ikone olovke.',

      data_export_import: 'Izvoz i uvoz podataka',
      data_export_import_subtitle: 'Napravite sigurnosnu kopiju i prenesite na drugi uređaj.',
      share_backup: 'Podijeli kopiju',
      share_backup_preview: 'Koristi OS dijeljenje kad je dostupno.',
      import_backup: 'Uvezi kopiju',
      import_backup_preview: 'Odaberite spremljenu .json datoteku za vraćanje.',

      advanced: 'Napredno',
      advanced_subtitle: 'Resetirajte aplikaciju ako želite krenuti ispočetka.',
      clear_all_data: 'Obriši sve podatke',
      clear_all_preview: 'Briše sve transakcije i resetira postavke. Prikazat će se potvrda.',

      share_sheet_not_available: 'Dijeljenje nije dostupno. Sigurnosna kopija je preuzeta.',
      unable_export_backup: 'Trenutno nije moguće izvesti sigurnosnu kopiju. Pokušaj ponovno.',
      import_replace_confirm: 'Uvoz će zamijeniti postojeće podatke. Nastaviti?',
      backup_imported_success: 'Sigurnosna kopija je uspješno uvezena.',
      backup_import_failed: 'Nije moguće uvesti ovu datoteku. Provjeri je li izvezena iz FollowTheMoney.',
      unable_read_file: 'Nije moguće pročitati odabranu datoteku.',
      clear_all_confirm: 'Obrisati sve podatke? Ovo će izbrisati sve transakcije i resetirati postavke. Ovo se ne može poništiti.',
      delete_transaction_confirm: 'Obrisati ovu transakciju?',
      amount_move_exceeds: 'Iznos za premještanje ne može biti veći od iznosa transakcije.',
      invalid_amount: 'Neispravan iznos.',
      transfer_failed: 'Trenutno nije moguće premjestiti dio iznosa.',

      amount_entry_aria: 'Unos iznosa',
      select_or_type_category: 'Odaberi ili upiši kategoriju',

      transaction_date_time: 'Datum i vrijeme transakcije',
      adjust_backdate_hint: 'Podesite ovo pri uređivanju kako biste unijeli stariji datum.',
      repeat_this_transaction: 'Ponavljaj ovu transakciju',
      frequency: 'Učestalost',
      yearly: 'Godišnje',

      start_of_working_season: 'Početak radne sezone',
      end_of_working_season: 'Kraj radne sezone',
      save_season_dates: 'Spremi datume sezone'
      ,
      summary_total_balance: 'Ukupno stanje',
      summary_entries: 'Stavke',
      summary_average_amount: 'Prosječan iznos',
      summary_preview_transactions_aria: 'Pregled transakcija',
      summary_preview: 'Pregled',
      summary_hint: 'Povuci ulijevo po stavci kako bi uključio/isključio u prosjek.',

      income_only: 'Samo prihodi',
      expenses_only: 'Samo troškovi',
      filter_category_prefix: 'Kategorija:',
      filter_name_prefix: 'Naziv:',
      filter_excluded_prefix: 'Isključeno:'
    }
  };

  const LOCALE_FILES = {
    en: './locales/en.json',
    hr: './locales/hr.json'
  };
  const _localeLoadState = { en: null, hr: null };

  function mergeLocale(lang, dict){
    if(!dict || typeof dict !== 'object') return;
    if(!I18N[lang]) I18N[lang] = {};
    I18N[lang] = { ...I18N[lang], ...dict };
  }

  function ensureLocaleLoaded(lang){
    const normalized = String(lang || 'en').toLowerCase() === 'hr' ? 'hr' : 'en';
    if(_localeLoadState[normalized] === true) return Promise.resolve(true);
    if(_localeLoadState[normalized] && typeof _localeLoadState[normalized].then === 'function') return _localeLoadState[normalized];
    const url = LOCALE_FILES[normalized];
    if(!url){ _localeLoadState[normalized] = true; return Promise.resolve(true); }
    _localeLoadState[normalized] = fetch(url)
      .then(res=>{
        if(!res.ok) throw new Error(`Locale load failed: ${normalized} (${res.status})`);
        return res.json();
      })
      .then(json=>{
        mergeLocale(normalized, json);
        _localeLoadState[normalized] = true;
        return true;
      })
      .catch(err=>{
        console.warn('[ftm] locale load failed', normalized, err);
        _localeLoadState[normalized] = false;
        return false;
      });
    return _localeLoadState[normalized];
  }

  function getLang(){
    const raw = settings && settings.language ? String(settings.language).toLowerCase() : 'en';
    return raw === 'hr' ? 'hr' : 'en';
  }
  function t(key){
    const lang = getLang();
    return (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  }

  function tFmt(key, vars){
    let str = t(key);
    if(!vars) return str;
    Object.keys(vars).forEach(k=>{
      const token = `{${k}}`;
      str = String(str).split(token).join(String(vars[k]));
    });
    return str;
  }
  function getNumberLocale(){
    return getLang() === 'hr' ? 'hr-HR' : 'en-US';
  }

  let _helpContentEnHTML = null;
  let _helpLangApplied = null;
  function applyLanguageToHelp(){
    const helpContent = document.querySelector('#helpModal .help-content');
    if(!helpContent) return;
    if(_helpContentEnHTML == null) _helpContentEnHTML = helpContent.innerHTML;
    const lang = getLang();
    if(_helpLangApplied === lang) return;
    if(getLang() !== 'hr'){
      helpContent.innerHTML = _helpContentEnHTML;
      _helpLangApplied = lang;
      return;
    }
    helpContent.innerHTML = `
      <section>
        <h3>Dobrodošli u FollowTheMoney</h3>
        <p>FollowTheMoney je aplikacija za praćenje novca koja stavlja privatnost na prvo mjesto — jednostavna i pregledna. Pratite prihode i troškove, istražite uvide kroz grafove i birajte između Budžet načina (svakodnevno praćenje) ili Sezonskog budžeta (planiranje izvan sezone). Svi podaci ostaju na vašem uređaju — bez clouda i bez praćenja.</p>
      </section>

      <section>
        <h3>Brzi početak</h3>
        <ol>
          <li>Na početnom zaslonu dodirnite <strong>zeleni krug</strong> (Prihod) ili <strong>crveni krug</strong> (Trošak).</li>
          <li>Želite samo jednu tipku? Uključite <em>Način s jednim gumbom</em> u Postavke → Općenito. Dodir je trošak, a <em>pritisni i drži ~1 s</em> — gumb će iz crvenog preći u zeleni kao potvrdu — zatim otpusti za prihod.</li>
          <li>Unesite iznos pomoću numeričke tipkovnice (sprema se kao centi, dvije decimale).</li>
          <li>Odaberite ili upišite <strong>Kategoriju</strong> (obavezno) i <strong>Naziv</strong> (preporučeno).</li>
          <li>Po želji dodirnite “Dodaj bilješku” za dodatni kontekst.</li>
          <li>Dodirnite <strong>Dodaj</strong> za spremanje transakcije.</li>
        </ol>
      </section>

      <section>
        <h3>Nedavne promjene i savjeti</h3>
        <ul>
          <li><strong>Premjesti dio iznosa:</strong> U uređivanju transakcije koristite “Premjesti dio iznosa u...” za razdvajanje miješanih kupnji. Odaberite iznos, kategoriju i naziv; stvara se nova transakcija za premješteni dio, a original se umanjuje (ili briše ako ostane 0).</li>
          <li><strong>Unos iznosa:</strong> Premještanje koristi isti unos kao i glavna forma — dodirnite veliki iznos, upisujte znamenke, Backspace briše znamenku; sve se sprema kao centi.</li>
          <li><strong>Prijedlozi:</strong> Kategorije i nazivi koriste prijedloge kroz “chip” gumbe (bez velikog iOS pickera). Počnite tipkati za filtriranje; dodir na prijedlog čisti pretragu i prikazuje povezane nazive.</li>
          <li><strong>Uvidi — Vremenski raspon:</strong> Donut i vremenska crta imaju kontrolu raspona (Ovaj tjedan, Prošli tjedan, Ovaj mjesec, Prošli mjesec) i prilagođeni raspon.</li>
          <li><strong>Sredina donuta:</strong> Overlay u sredini je postojan, bolje je prilagođen rupi i sakriva se kad je ukupno 0 kako bi se vidjela poruka o nedostatku podataka.</li>
          <li><strong>Definicija tjedna:</strong> “Ovaj tjedan” koristi kalendarski tjedan (ponedjeljak → nedjelja) kako bi se brojke poklapale između Početne i Povijesti.</li>
          <li><strong>iPhone safe-area:</strong> Gornja traka poštuje safe-area kako se ne bi preklapala sa status barom.</li>
        </ul>
      </section>

      <section>
        <h3>Početni zaslon</h3>
        <p><strong>Stanje:</strong> Prikazuje ukupno (prihodi minus troškovi).</p>
        <p><strong>Oznaka:</strong> Prikazuje “Budžet” po zadanim postavkama ili “Izvan sezone” / “Sezona aktivna” kad je uključen Sezonski budžet.</p>
        <p><strong>Gumbi za unos:</strong> Zadano su dva kruga (zeleni za prihod, crveni za trošak). U načinu s jednim gumbom ostaje samo crveni — dodir za trošak, pritisni i drži 1 s za prihod.</p>
      </section>

      <section>
        <h3>Povijest</h3>
        <p><strong>Filter tipa:</strong> Prihod / Sve / Trošak.</p>
        <p><strong>Chip filteri:</strong> Filtrirajte po kategoriji ili nazivu.</p>
        <p><strong>Uređivanje:</strong> Dodirnite olovku za uređivanje; brisanje swipe-om je onemogućeno kad je uključen “Zaključaj brisanje” u Postavkama.</p>
      </section>

      <section>
        <h3>Uvidi</h3>
        <p><strong>Najbolje u landscape načinu.</strong> Donut prikazuje raspodjelu po kategorijama ili nazivima. Dugim pritiskom (~3 s) na stavku možete isključiti/uključiti iz prikaza; isključene stavke idu na dno popisa.</p>
      </section>

      <section>
        <h3>Postavke</h3>
        <p>Ovdje birate format datuma, simbol valute, jezik, tipke za unos, sezonski budžet, zaključavanje brisanja i sigurnosne kopije.</p>
      </section>

      <section>
        <h3>Privatnost</h3>
        <p>Svi podaci su lokalno u IndexedDB/localStorage. Ništa se ne šalje na servere.</p>
      </section>
    `;
    _helpLangApplied = lang;
  }

  function applyLanguageToStaticDom(){
    const lang = getLang();
    try{ document.documentElement.lang = lang; }catch(_){ }

    const btnHistory = $('#btnHistory');
    if(btnHistory){ btnHistory.textContent = t('nav_history'); btnHistory.setAttribute('aria-label', t('nav_history')); }
    const btnSettings = $('#btnSettings');
    if(btnSettings){ btnSettings.setAttribute('aria-label', t('nav_settings')); }
    const btnHome = $('#btnHome');
    if(btnHome){ btnHome.textContent = t('nav_home'); btnHome.setAttribute('aria-label', t('nav_home')); }
    const btnSummaryBack = $('#btnSummaryBack');
    if(btnSummaryBack){ btnSummaryBack.textContent = t('nav_back'); }

    const historyLogo = document.querySelector('#screen-history .logo');
    if(historyLogo) historyLogo.textContent = t('nav_history');
    const summaryLogo = document.querySelector('#screen-summary .logo');
    if(summaryLogo) summaryLogo.textContent = t('nav_summary');
    const graphTitle = document.querySelector('.graph-title');
    if(graphTitle) graphTitle.textContent = t('nav_insights');

    const balanceLabelEl = document.querySelector('.balance-label');
    if(balanceLabelEl){
      const nodes = Array.from(balanceLabelEl.childNodes);
      const textNode = nodes.find(n=> n.nodeType === Node.TEXT_NODE);
      if(textNode) textNode.textContent = t('balance') + ' ';
    }
    const recentListEl = $('#recentList');
    if(recentListEl) recentListEl.setAttribute('aria-label', t('recent_aria'));
    const btnAddIncome = $('#btnAddIncome');
    if(btnAddIncome) btnAddIncome.setAttribute('aria-label', t('add_income_aria'));
    const btnAddExpense = $('#btnAddExpense');
    if(btnAddExpense) btnAddExpense.setAttribute('aria-label', t('add_expense_aria'));

    const historyTypeFiltersEl = $('#historyTypeFilters');
    if(historyTypeFiltersEl){
      historyTypeFiltersEl.querySelectorAll('.type-pill').forEach(btn=>{
        const type = btn.dataset.type;
        if(type === 'income') btn.textContent = t('income');
        else if(type === 'expense') btn.textContent = t('expense');
        else btn.textContent = t('all');
      });
    }
    const historyChipSearchInput = $('#historyChipSearch');
    if(historyChipSearchInput) historyChipSearchInput.placeholder = t('search_categories_or_names');

    const historyChipSearchWrap = document.querySelector('.history-chip-search');
    if(historyChipSearchWrap) historyChipSearchWrap.setAttribute('aria-label', t('search_filters'));
    const categoryChipRow = $('#categoryChipRow');
    if(categoryChipRow) categoryChipRow.setAttribute('aria-label', t('categories'));
    const nameChipRow = $('#nameChipRow');
    if(nameChipRow) nameChipRow.setAttribute('aria-label', t('names'));

    // Graph range menu and labels
    const graphRangeClearBtn = $('#graphRangeClear');
    if(graphRangeClearBtn) graphRangeClearBtn.textContent = t('all_time');
    const graphRangeApplyBtn = $('#graphRangeApply');
    if(graphRangeApplyBtn) graphRangeApplyBtn.textContent = t('apply_custom');
    const startLbl = document.querySelector('label[for="graphRangeStart"]');
    if(startLbl) startLbl.textContent = t('start');
    const endLbl = document.querySelector('label[for="graphRangeEnd"]');
    if(endLbl) endLbl.textContent = t('end');
    const graphRangeMenu = $('#graphRangeMenu');
    if(graphRangeMenu){
      graphRangeMenu.querySelectorAll('button[data-range]').forEach(btn=>{
        const r = btn.dataset.range;
        if(r === 'this_week') btn.textContent = t('this_week');
        else if(r === 'last_week') btn.textContent = t('last_week');
        else if(r === 'this_month') btn.textContent = t('this_month');
        else if(r === 'last_month') btn.textContent = t('last_month');
      });
    }
    const breakdownH2 = document.querySelector('.graph-breakdown-header h2');
    if(breakdownH2) breakdownH2.textContent = t('breakdown');
    const totalLbl = document.querySelector('.graph-total-overlay .total-label');
    if(totalLbl) totalLbl.textContent = t('total');
    const graphEmptyEl = $('#graphEmpty');
    if(graphEmptyEl) graphEmptyEl.textContent = t('no_data_to_visualize');
    const timelineH2 = document.querySelector('.timeline-header h2');
    if(timelineH2) timelineH2.textContent = t('timeline');
    const timelineSubtitle = document.querySelector('.timeline-subtitle');
    if(timelineSubtitle) timelineSubtitle.textContent = t('income_vs_expense_over_time');
    const btnTimelineCursorToggle = $('#btnTimelineCursorToggle');
    if(btnTimelineCursorToggle) btnTimelineCursorToggle.textContent = t('inspect');
    const timelineEmptyEl = $('#timelineEmpty');
    if(timelineEmptyEl) timelineEmptyEl.textContent = t('need_two_days');

    const timelineLegendItems = document.querySelectorAll('.timeline-legend > span');
    if(timelineLegendItems && timelineLegendItems.length >= 2){
      const setLegendLabel = (container, label)=>{
        const dot = container.querySelector('.dot');
        container.textContent = '';
        if(dot) container.appendChild(dot);
        container.appendChild(document.createTextNode(' ' + label));
      };
      setLegendLabel(timelineLegendItems[0], t('income'));
      setLegendLabel(timelineLegendItems[1], t('expense'));
    }

    // Ensure the graph range button label is localized even before any graph interaction.
    try{ updateGraphRangeLabel(); }catch(_){ }

    // Graph controls (Income/Expense + Group by)
    const graphTypeFiltersEl = $('#graphTypeFilters');
    if(graphTypeFiltersEl){
      graphTypeFiltersEl.setAttribute('aria-label', t('graph_type_aria'));
      graphTypeFiltersEl.querySelectorAll('button[data-graph-type]').forEach(btn=>{
        const type = btn.dataset.graphType;
        if(type === 'income') btn.textContent = t('income');
        else if(type === 'expense') btn.textContent = t('expense');
      });
    }
    const graphViewToggle = document.querySelector('.graph-view-toggle');
    if(graphViewToggle) graphViewToggle.setAttribute('aria-label', t('group_by_aria'));
    const graphGroupCat = document.querySelector('.graph-view-toggle input[value="category"] + span');
    if(graphGroupCat) graphGroupCat.textContent = t('categories');
    const graphGroupName = document.querySelector('.graph-view-toggle input[value="name"] + span');
    if(graphGroupName) graphGroupName.textContent = t('names');
    const btnGraphTimeline = $('#btnGraphTimeline');
    if(btnGraphTimeline) btnGraphTimeline.setAttribute('aria-label', t('toggle_timeline_view_aria'));

    // Summary static labels
    const summaryTotalLabels = document.querySelectorAll('#screen-summary .summary-total span');
    if(summaryTotalLabels && summaryTotalLabels.length >= 2){
      summaryTotalLabels[0].textContent = t('summary_total_balance');
      summaryTotalLabels[1].textContent = t('summary_entries');
    }
    const summaryAvgLabel = document.querySelector('#screen-summary .summary-metrics .metric span');
    if(summaryAvgLabel) summaryAvgLabel.textContent = t('summary_average_amount');
    const summaryListSection = document.querySelector('#screen-summary .summary-list');
    if(summaryListSection) summaryListSection.setAttribute('aria-label', t('summary_preview_transactions_aria'));
    const previewH2 = document.querySelector('#screen-summary .summary-list h2');
    if(previewH2) previewH2.textContent = t('summary_preview');
    const summaryHint = document.querySelector('#screen-summary .summary-hint');
    if(summaryHint) summaryHint.textContent = t('summary_hint');

    // Settings
    const settingsTitle = document.querySelector('#settingsModal .settings-title h2');
    if(settingsTitle) settingsTitle.textContent = t('nav_settings');
    const helpBtn = $('#btnHelpManual');
    if(helpBtn) helpBtn.textContent = t('help_support');
    const closeSettingsBtn = document.querySelector('#settingsModal [data-dismiss].btn');
    if(closeSettingsBtn) closeSettingsBtn.textContent = t('close');
    const generalHeading = $('#generalHeading');
    if(generalHeading) generalHeading.textContent = t('general');
    const generalSubtitle = generalHeading ? generalHeading.parentElement.querySelector('.card-subtitle') : null;
    if(generalSubtitle) generalSubtitle.textContent = t('general_subtitle');
    const dateFormatLbl = document.querySelector('label[for="dateFormat"]');
    if(dateFormatLbl) dateFormatLbl.textContent = t('date_format');
    const dateFormatPreview = dateFormatLbl ? dateFormatLbl.parentElement.querySelector('.preview.small') : null;
    if(dateFormatPreview) dateFormatPreview.textContent = t('applies_to_recent_and_history');
    const currencyLbl = document.querySelector('label[for="currencySymbol"]');
    if(currencyLbl) currencyLbl.textContent = t('currency_symbol');
    const currencyPreview = currencyLbl ? currencyLbl.parentElement.querySelector('.preview.small') : null;
    if(currencyPreview) currencyPreview.textContent = t('shown_after_amounts');
    const langLbl = document.querySelector('label[for="languageSelect"]');
    if(langLbl) langLbl.textContent = t('language');
    const langPreview = langLbl ? langLbl.parentElement.querySelector('.preview.small') : null;
    if(langPreview) langPreview.textContent = t('changes_text_immediately');
    const homeInputLbl = document.querySelector('label[for="singleButtonModeToggle"].small-label');
    if(homeInputLbl) homeInputLbl.textContent = t('home_input_buttons');

    const getSwitchLabelSpan = (inputId)=>{
      const input = document.getElementById(inputId);
      const label = input ? input.closest('label.toggle-row') : null;
      if(!label) return null;
      const directChildSpans = Array.from(label.children).filter(el=>
        el && el.tagName === 'SPAN' && !el.classList.contains('switch-ui')
      );
      return directChildSpans.length ? directChildSpans[directChildSpans.length - 1] : null;
    };

    const singleBtnText = getSwitchLabelSpan('singleButtonModeToggle');
    if(singleBtnText) singleBtnText.textContent = t('single_button_mode');
    const homeInputPreview = homeInputLbl ? homeInputLbl.parentElement.querySelector('.preview.small') : null;
    if(homeInputPreview) homeInputPreview.textContent = t('tap_for_expense_hold_for_income');

    const seasonHeading = $('#seasonHeading');
    if(seasonHeading) seasonHeading.textContent = t('seasonal_budget');
    const seasonSubtitle = seasonHeading ? seasonHeading.parentElement.querySelector('.card-subtitle') : null;
    if(seasonSubtitle) seasonSubtitle.textContent = t('seasonal_budget_subtitle');
    const seasonalModeToggleLabel = getSwitchLabelSpan('seasonalModeToggle');
    if(seasonalModeToggleLabel) seasonalModeToggleLabel.textContent = t('seasonal_budget_mode');
    const seasonalPreview = document.querySelector('#seasonHeading') ? document.querySelector('#seasonHeading').closest('section').querySelector('.preview.small') : null;
    if(seasonalPreview) seasonalPreview.textContent = t('seasonal_budget_preview');

    const seasonStartLbl = document.querySelector('label[for="seasonStart"]');
    if(seasonStartLbl) seasonStartLbl.textContent = t('start_of_working_season');
    const seasonEndLbl = document.querySelector('label[for="seasonEnd"]');
    if(seasonEndLbl) seasonEndLbl.textContent = t('end_of_working_season');
    const saveSeasonBtn = $('#saveSeason');
    if(saveSeasonBtn) saveSeasonBtn.textContent = t('save_season_dates');

    const privacyHeading = $('#privacyHeading');
    if(privacyHeading) privacyHeading.textContent = t('history_lock');
    const privacySubtitle = privacyHeading ? privacyHeading.parentElement.querySelector('.card-subtitle') : null;
    if(privacySubtitle) privacySubtitle.textContent = t('history_lock_subtitle');
    const historyLockLabel = getSwitchLabelSpan('historyLockToggle');
    if(historyLockLabel) historyLockLabel.textContent = t('lock_swipe_to_delete');
    const historyLockPreview = document.querySelector('#privacyHeading') ? document.querySelector('#privacyHeading').closest('section').querySelector('.preview.small') : null;
    if(historyLockPreview) historyLockPreview.textContent = t('lock_swipe_preview');

    const dataHeading = $('#dataHeading');
    if(dataHeading) dataHeading.textContent = t('data_export_import');
    const dataSubtitle = dataHeading ? dataHeading.parentElement.querySelector('.card-subtitle') : null;
    if(dataSubtitle) dataSubtitle.textContent = t('data_export_import_subtitle');
    const btnExportShare = $('#btnExportShare');
    if(btnExportShare) btnExportShare.textContent = t('share_backup');
    const exportPreview = btnExportShare ? btnExportShare.parentElement.querySelector('.preview.small') : null;
    if(exportPreview) exportPreview.textContent = t('share_backup_preview');
    const btnImportData = $('#btnImportData');
    if(btnImportData) btnImportData.textContent = t('import_backup');
    const importPreview = btnImportData ? btnImportData.parentElement.querySelector('.preview.small') : null;
    if(importPreview) importPreview.textContent = t('import_backup_preview');

    const advancedHeading = $('#advancedHeading');
    if(advancedHeading) advancedHeading.textContent = t('advanced');
    const advancedSubtitle = advancedHeading ? advancedHeading.parentElement.querySelector('.card-subtitle') : null;
    if(advancedSubtitle) advancedSubtitle.textContent = t('advanced_subtitle');
    const btnClearAll = $('#btnClearAll');
    if(btnClearAll) btnClearAll.textContent = t('clear_all_data');
    const clearPreview = btnClearAll ? btnClearAll.parentElement.querySelector('.preview.small') : null;
    if(clearPreview) clearPreview.textContent = t('clear_all_preview');

    // Language select option labels
    if(languageSelectEl){
      const optEn = languageSelectEl.querySelector('option[value="en"]');
      const optHr = languageSelectEl.querySelector('option[value="hr"]');
      if(optEn) optEn.textContent = (lang === 'hr') ? 'Engleski' : 'English';
      if(optHr) optHr.textContent = (lang === 'hr') ? 'Hrvatski' : 'Croatian';
    }

    // Sheet
    const toggleNote = $('#toggleNote');
    if(toggleNote) toggleNote.textContent = t('add_note');
    const noteInput = $('#noteInput');
    if(noteInput) noteInput.placeholder = t('note_optional');

    const sheetPanel = document.querySelector('#sheet .sheet-panel');
    if(sheetPanel) sheetPanel.setAttribute('aria-label', t('amount_entry_aria'));

    const catLbl = document.querySelector('label[for="categoryInput"]');
    if(catLbl) catLbl.textContent = t('category');
    const categoryInput = $('#categoryInput');
    if(categoryInput) categoryInput.placeholder = t('select_or_type_category');

    const nameLbl = document.querySelector('label[for="nameInput"]');
    if(nameLbl) nameLbl.textContent = t('name');
    const nameInput = $('#nameInput');
    if(nameInput) nameInput.placeholder = t('name');
    const btnMovePart = $('#btnMovePart');
    if(btnMovePart) btnMovePart.textContent = t('move_part_btn');
    const mpTitle = document.querySelector('#movePartContainer .move-part-header h3');
    if(mpTitle) mpTitle.textContent = t('move_part_title');
    const mpSub = document.querySelector('#movePartContainer .move-part-header p');
    if(mpSub) mpSub.textContent = t('move_part_subtitle');
    const mpAmtLbl = document.querySelector('#movePartContainer .setting-row label.small-label');
    if(mpAmtLbl) mpAmtLbl.textContent = t('amount_to_move');
    const mpHint = document.querySelector('#movePartContainer .setting-row .preview.small');
    if(mpHint) mpHint.textContent = t('tap_amount_to_edit');
    const mpCatLbl = document.querySelector('label[for="movePartCategory"]');
    if(mpCatLbl) mpCatLbl.textContent = t('category');
    const mpNameLbl = document.querySelector('label[for="movePartName"]');
    if(mpNameLbl) mpNameLbl.textContent = t('name');
    const mpCatInput = $('#movePartCategory');
    if(mpCatInput) mpCatInput.placeholder = t('select_or_type_category');
    const mpNameInput = $('#movePartName');
    if(mpNameInput) mpNameInput.placeholder = t('name');
    const movePartConfirmBtn = $('#movePartConfirm');
    if(movePartConfirmBtn) movePartConfirmBtn.textContent = t('confirm_transfer');
    const movePartBackBtn = $('#movePartBack');
    if(movePartBackBtn) movePartBackBtn.textContent = t('back');

    // Edit-only fields in sheet
    const editDateLbl = document.querySelector('label[for="editDateInput"]');
    if(editDateLbl) editDateLbl.textContent = t('transaction_date_time');
    const editDateHint = editDateLbl ? editDateLbl.parentElement.querySelector('.preview.small') : null;
    if(editDateHint) editDateHint.textContent = t('adjust_backdate_hint');

    const recurringText = document.querySelector('#recurringContainer .recurring-toggle-label span');
    if(recurringText) recurringText.textContent = t('repeat_this_transaction');
    const frequencyLbl = document.querySelector('label[for="frequencySelect"]');
    if(frequencyLbl) frequencyLbl.textContent = t('frequency');
    const frequencySelect = $('#frequencySelect');
    if(frequencySelect){
      const optWeekly = frequencySelect.querySelector('option[value="weekly"]');
      const optMonthly = frequencySelect.querySelector('option[value="monthly"]');
      const optYearly = frequencySelect.querySelector('option[value="yearly"]');
      if(optWeekly) optWeekly.textContent = t('weekly');
      if(optMonthly) optMonthly.textContent = t('monthly');
      if(optYearly) optYearly.textContent = t('yearly');
    }

    // Help modal
    const helpTitle = document.querySelector('#helpModal .settings-title h2');
    if(helpTitle) helpTitle.textContent = (lang === 'hr') ? 'Upute' : 'User Manual';
    const helpCloseBtn = document.querySelector('#helpModal [data-dismiss].btn');
    if(helpCloseBtn) helpCloseBtn.textContent = t('close');
  }

  function setLanguage(nextLang, persist=true){
    const lang = String(nextLang || 'en').toLowerCase() === 'hr' ? 'hr' : 'en';
    settings.language = lang;
    if(languageSelectEl) languageSelectEl.value = lang;
    applyLanguageToStaticDom();
    applyLanguageToHelp();
    // re-render dynamic strings
    updateSeasonalStats();
    updateBalance();
    renderRecent();
    if(!historyScreen.hidden) renderHistory();
    if(!summaryScreen.hidden) renderSummary();
    refreshGraphIfVisible();
    ensureLocaleLoaded(lang).then(loaded=>{
      if(!loaded) return;
      if(getLang() !== lang) return;
      applyLanguageToStaticDom();
      applyLanguageToHelp();
      updateSeasonalStats();
      updateBalance();
      renderRecent();
      if(!historyScreen.hidden) renderHistory();
      if(!summaryScreen.hidden) renderSummary();
      refreshGraphIfVisible();
    });
    if(persist) dbSaveSettings(settings);
  }

  // best-effort preload (SW will cache these too)
  try{ ensureLocaleLoaded('en'); ensureLocaleLoaded('hr'); }catch(_){ }

  // Helpers
  const monthKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const generateId = ()=>{
    if(window.crypto && typeof window.crypto.randomUUID === 'function'){
      return window.crypto.randomUUID();
    }
    const tpl = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return tpl.replace(/[xy]/g,c=>{
      const r = Math.random()*16|0;
      const v = c==='x'? r : (r&0x3)|0x8;
      return v.toString(16);
    });
  };
  const formatCurrency = cents => {
    const value = cents/100;
    const formatted = value.toLocaleString(getNumberLocale(),{minimumFractionDigits:2,maximumFractionDigits:2});
    const symbol = (settings && settings.currencySymbol) ? settings.currencySymbol : '€';
    return formatted + '\u202F' + symbol;
  };
  const startOfDayTs = ts => { const d = new Date(ts); d.setHours(0,0,0,0); return d.getTime(); };
  const endOfDayTs = ts => { const d = new Date(ts); d.setHours(23,59,59,999); return d.getTime(); };
  const equalsIgnoreCase = (a,b)=>{
    if(a==null || b==null) return false;
    return String(a).toLowerCase() === String(b).toLowerCase();
  };
  const pad2 = num => String(num).padStart(2,'0');

  function updateMovePartAmount(){
    if(!movePartRawDigits || !movePartSheetAmountEl) return;
    const digits = movePartRawDigits.value.replace(/\D/g,'') || '0';
    const cents = parseInt(digits, 10);
    movePartSheetAmountEl.textContent = formatCurrency(cents);
    if(movePartConfirmBtn) movePartConfirmBtn.dataset.cents = String(cents);
    updateMovePartConfirmState();
  }

  function gatherMovePartValues(kind, filterText=''){
    if(!sheetType) return [];
    const isCategory = kind === 'category';
    const collectionKeyName = isCategory ? 'categories' : 'names';
    const base = new Set();
    const selectedCategory = movePartCategoryInput && movePartCategoryInput.value.trim();
    const includeStoredNames = isCategory || !selectedCategory;
    if(includeStoredNames){
      const fromSettings = getCollection(sheetType, collectionKeyName);
      fromSettings.forEach(v=>{ if(v) base.add(v); });
    }
    transactions.forEach(t=>{
      const isIncome = t.amountCents >= 0;
      if(sheetType === 'income' && !isIncome) return;
      if(sheetType === 'expense' && isIncome) return;
      if(!isCategory && selectedCategory){
        if(!t.category || !equalsIgnoreCase(t.category, selectedCategory)) return;
      }
      const value = isCategory ? t.category : t.name;
      if(value) base.add(value);
    });
    const text = (filterText || '').trim().toLowerCase();
    return Array.from(base)
      .filter(Boolean)
      .filter(val=> !text || String(val).toLowerCase().includes(text))
      .sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
  }

  function renderMovePartSuggestions(kind){
    const container = kind === 'category' ? movePartCategorySuggestionsEl : movePartNameSuggestionsEl;
    if(!container) return;
    if(kind === 'name' && movePartNameInput && movePartNameInput.disabled){
      container.hidden = true;
      container.innerHTML = '';
      return;
    }
    const inputEl = kind === 'category' ? movePartCategoryInput : movePartNameInput;
    const filterValue = inputEl ? inputEl.value : '';
    const values = gatherMovePartValues(kind, filterValue);
    if(!values.length){
      container.hidden = true;
      container.innerHTML = '';
      return;
    }
    container.hidden = false;
    container.innerHTML = '';
    values.forEach(val=>{
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'suggestion-chip';
      btn.textContent = val;
      btn.dataset.kind = kind;
      btn.dataset.value = val;
      btn.dataset.scope = 'move-part';
      container.appendChild(btn);
    });
  }

  function updateMovePartNameInputState(){
    if(!movePartNameInput) return;
    const hasCategory = movePartCategoryInput && movePartCategoryInput.value.trim().length > 0;
    movePartNameInput.disabled = !hasCategory;
    if(!hasCategory) movePartNameInput.value = '';
    renderMovePartSuggestions('name');
    updateMovePartConfirmState();
  }

  function updateMovePartConfirmState(){
    if(!movePartConfirmBtn) return;
    const cents = parseInt((movePartConfirmBtn.dataset.cents || '0'), 10);
    const okAmount = Number.isFinite(cents) && cents > 0;
    const catOk = !!(movePartCategoryInput && movePartCategoryInput.value.trim().length > 0);
    const nameOk = !!(movePartNameInput && !movePartNameInput.disabled && movePartNameInput.value.trim().length > 0);
    movePartConfirmBtn.disabled = !(okAmount && catOk && nameOk);
    if(!okAmount) movePartConfirmBtn.dataset.cents = '0';
  }

  function openMovePartOverlay(){
    if(!movePartContainer) return;
    if(sheetMode !== 'edit' || !editingTransaction || !sheetType) return;
    movePartContainer.hidden = false;
    if(btnMovePart) btnMovePart.hidden = true;

    // Default to the current category to help reveal relevant names, but allow changing.
    if(movePartCategoryInput){
      movePartCategoryInput.value = (editingTransaction.category || '').trim();
    }
    if(movePartNameInput){
      movePartNameInput.value = '';
    }
    if(movePartRawDigits){
      movePartRawDigits.value = '0';
    }
    updateMovePartAmount();
    renderMovePartSuggestions('category');
    updateMovePartNameInputState();
    updateMovePartConfirmState();
    setTimeout(()=>{ try{ movePartRawDigits && movePartRawDigits.focus(); }catch(_){} }, 50);
  }

  function closeMovePartOverlay(){
    if(movePartContainer) movePartContainer.hidden = true;
    if(btnMovePart) btnMovePart.hidden = !(sheetMode === 'edit' && !!editingTransaction);
    if(movePartRawDigits) movePartRawDigits.value = '0';
    if(movePartSheetAmountEl) movePartSheetAmountEl.textContent = formatCurrency(0);
    if(movePartCategoryInput) movePartCategoryInput.value = '';
    if(movePartNameInput) movePartNameInput.value = '';
    if(movePartCategorySuggestionsEl){ movePartCategorySuggestionsEl.hidden = true; movePartCategorySuggestionsEl.innerHTML = ''; }
    if(movePartNameSuggestionsEl){ movePartNameSuggestionsEl.hidden = true; movePartNameSuggestionsEl.innerHTML = ''; }
    if(movePartConfirmBtn){ delete movePartConfirmBtn.dataset.cents; movePartConfirmBtn.disabled = true; }
  }
  function formatDateTime(timestamp, includeTime=true){
    const date = new Date(timestamp);
    if(Number.isNaN(date)) return '';
    const day = pad2(date.getDate());
    const month = pad2(date.getMonth()+1);
    const year = date.getFullYear();
    const format = (settings && settings.dateFormat) ? settings.dateFormat : 'dmy';
    let datePart;
    switch(format){
      case 'mdy':
        datePart = `${month}/${day}/${year}`;
        break;
      case 'ymd':
        datePart = `${year}-${month}-${day}`;
        break;
      default:
        datePart = `${day}/${month}/${year}`;
    }
    if(!includeTime) return datePart;
    const timePart = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    return `${datePart} ${timePart}`;
  }
  function formatShortDate(timestamp){
    const date = new Date(timestamp);
    if(Number.isNaN(date)) return '';
    const day = pad2(date.getDate());
    const month = pad2(date.getMonth()+1);
    const yearShort = String(date.getFullYear()).slice(-2);
    const format = (settings && settings.dateFormat) ? settings.dateFormat : 'dmy';
    switch(format){
      case 'mdy':
        return `${month}/${day}/${yearShort}`;
      case 'ymd':
        return `${yearShort}-${month}-${day}`;
      default:
        return `${day}/${month}/${yearShort}`;
    }
  }
  function getGraphColorIndex(label){
    const hash = Array.from(label).reduce((acc,char)=> acc + char.charCodeAt(0),0);
    return hash % graphPalette.length;
  }
  function getGraphColor(label){
    if(graphColorCache.has(label)) return graphColorCache.get(label);
    const color = graphPalette[getGraphColorIndex(label)];
    graphColorCache.set(label,color);
    return color;
  }
  function assignSegmentColors(segments){
    const colorMap = new Map();
    let lastColor = null;
    segments.forEach(segment=>{
      const baseIdx = getGraphColorIndex(segment.label);
      let chosen = null;
      for(let i=0;i<graphPalette.length;i++){
        const color = graphPalette[(baseIdx + i) % graphPalette.length];
        if(color !== lastColor){
          chosen = color;
          break;
        }
      }
      if(!chosen) chosen = graphPalette[baseIdx];
      colorMap.set(segment.label, chosen);
      lastColor = chosen;
    });
    return colorMap;
  }
  function computeGraphPresetRange(type){
    const now = new Date();
    const todayStart = startOfDayTs(now.getTime());
    const todayEnd = endOfDayTs(now.getTime());
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday
    const thisWeekStart = startOfDayTs(todayStart - dayOfWeek * 86400000);
    const thisWeekEnd = endOfDayTs(now.getTime());
    const lastWeekStart = startOfDayTs(thisWeekStart - 7 * 86400000);
    const lastWeekEnd = endOfDayTs(lastWeekStart + 6 * 86400000);
    const thisMonthStart = startOfDayTs(new Date(now.getFullYear(), now.getMonth(), 1).getTime());
    const thisMonthEnd = endOfDayTs(now.getTime());
    const lastMonthStart = startOfDayTs(new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime());
    const lastMonthEnd = endOfDayTs(new Date(now.getFullYear(), now.getMonth(), 0).getTime());
    switch(type){
      case 'this_week':
        return { type:'preset', key:'this_week', label:t('this_week'), start:thisWeekStart, end:thisWeekEnd };
      case 'last_week':
        return { type:'preset', key:'last_week', label:t('last_week'), start:lastWeekStart, end:lastWeekEnd };
      case 'this_month':
        return { type:'preset', key:'this_month', label:t('this_month'), start:thisMonthStart, end:thisMonthEnd };
      case 'last_month':
        return { type:'preset', key:'last_month', label:t('last_month'), start:lastMonthStart, end:lastMonthEnd };
      default:
        return { type:'all', start:null, end:null, label:t('all_time') };
    }
  }
  function formatGraphRangeLabel(range){
    if(!range || range.type === 'all') return t('all_time');
    if(range.type === 'preset'){
      const key = range.key;
      if(key === 'this_week') return t('this_week');
      if(key === 'last_week') return t('last_week');
      if(key === 'this_month') return t('this_month');
      if(key === 'last_month') return t('last_month');
      if(range.label) return range.label;
    }
    if(range.type === 'custom' && range.start && range.end){
      return `${t('custom_range_prefix')} ${formatShortDate(range.start)} - ${formatShortDate(range.end)}`;
    }
    return t('all_time');
  }
  function filterTransactionsByGraphRange(list){
    if(!graphDateRange || graphDateRange.type === 'all') return list;
    const { start, end } = graphDateRange;
    if(!start || !end) return list;
    return list.filter(t=> t && typeof t.createdAt === 'number' && t.createdAt >= start && t.createdAt <= end);
  }
  function updateGraphRangeLabel(){
    if(!graphRangeBtn) return;
    const label = formatGraphRangeLabel(graphDateRange);
    graphRangeBtn.textContent = `${t('time_range_prefix')} ${label}`;
    graphRangeBtn.setAttribute('aria-expanded', graphRangeMenu && !graphRangeMenu.hidden ? 'true' : 'false');
  }
  function hideGraphRangeMenu(){
    try{
      console.debug && console.debug('[ftm] hideGraphRangeMenu called');
    }catch(e){}
    if(graphRangeMenu && !graphRangeMenu.hidden){
      graphRangeMenu.hidden = true;
      graphRangeMenu.style.display = 'none';
      if(graphRangeBtn){ graphRangeBtn.setAttribute('aria-expanded','false'); }
      _ftm_lastGraphRangeToggle = Date.now();
      updateGraphRangeLabel();
    }
  }
  function showGraphRangeMenu(){
    try{
      console.debug && console.debug('[ftm] showGraphRangeMenu called');
    }catch(e){}
    // small guard: avoid reopening immediately after a hide (could be from synthetic events)
    const now = Date.now();
    if(now - (_ftm_lastGraphRangeToggle || 0) < 40){
      // ignore near-immediate toggles
      try{ console.debug && console.debug('[ftm] showGraphRangeMenu suppressed (rapid toggle)'); }catch(e){}
      return;
    }
    if(graphRangeMenu){
      graphRangeMenu.hidden = false;
      graphRangeMenu.style.display = 'block';
      if(graphRangeBtn){ graphRangeBtn.setAttribute('aria-expanded','true'); }
      _ftm_lastGraphRangeToggle = Date.now();
      updateGraphRangeLabel();
    }
  }
  function setGraphDateRange(next){
    graphDateRange = next || { type:'all', start:null, end:null };
    updateGraphRangeLabel();
    hideGraphRangeMenu();
    refreshGraphIfVisible();
  }
  function buildGraphSegments(typeOverride, txList){
    const currentType = typeOverride || graphType;
    const filterPositive = currentType === 'income';
    const source = Array.isArray(txList) ? txList : filterTransactionsByGraphRange(transactions);
    const map = new Map();
    source.forEach(tx=>{
      const isIncome = tx.amountCents >= 0;
      if(filterPositive && !isIncome) return;
      if(!filterPositive && isIncome) return;
      const amount = Math.abs(tx.amountCents);
      if(amount <= 0) return;

      let label = '';
      let categoryLabel = null;
      if(graphGrouping === 'name'){
        const nameRaw = (tx.name && tx.name.trim()) || t('unnamed');
        const categoryRaw = (tx.category && tx.category.trim()) || t('uncategorized');
        label = `${categoryRaw} / ${nameRaw}`;
        categoryLabel = categoryRaw;
      } else {
        label = (tx.category && tx.category.trim()) || t('uncategorized');
      }

      if(!map.has(label)){
        map.set(label, { value: 0, categoryLabel });
      }
      const bucket = map.get(label);
      bucket.value += amount;
      if(graphGrouping === 'name' && !bucket.categoryLabel){
        bucket.categoryLabel = categoryLabel;
      }
    });
    return Array.from(map.entries())
      .map(([label,bucket])=> ({ label, value: bucket.value, categoryLabel: bucket.categoryLabel }))
      .sort((a,b)=> b.value - a.value);
  }
  function resizeGraphCanvas(){
    if(!graphCanvas || graphMode === 'timeline') return;
    const wrapper = graphCanvas.parentElement;
    if(!wrapper) return;
    const size = Math.min(wrapper.clientWidth || 0, wrapper.clientHeight || wrapper.clientWidth || 0) || 280;
    const dpr = window.devicePixelRatio || 1;
    graphCanvas.width = size * dpr;
    graphCanvas.height = size * dpr;
    graphCanvas.style.width = `${size}px`;
    graphCanvas.style.height = `${size}px`;
  }
  function updateGraphTypeButtons(){
    if(!graphTypeFiltersEl) return;
    graphTypeFiltersEl.querySelectorAll('.graph-type-pill').forEach(btn=>{
      btn.classList.toggle('active', btn.dataset.graphType === graphType);
    });
  }

  function setGraphEmptyState(isEmpty, message){
    if(!graphEmptyEl) return;
    if(!graphEmptyEl.dataset.defaultMessage){
      graphEmptyEl.dataset.defaultMessage = graphEmptyEl.textContent || '';
    }
    if(isEmpty && message){
      graphEmptyEl.textContent = message;
    } else if(!isEmpty && graphEmptyEl.dataset.defaultMessage){
      graphEmptyEl.textContent = graphEmptyEl.dataset.defaultMessage;
    }
    graphEmptyEl.hidden = !isEmpty;
    graphEmptyEl.style.display = isEmpty ? 'flex' : 'none';
    graphEmptyEl.setAttribute('aria-hidden', isEmpty ? 'false' : 'true');
  }
  function renderGraph(){
    if(graphMode === 'timeline') return;
    if(!graphCanvas || !graphLegendEl) return;
    const ctx = graphCanvas.getContext('2d');
    if(!ctx) return;
    const filteredTxs = filterTransactionsByGraphRange(transactions);
    const segments = buildGraphSegments(undefined, filteredTxs);
    // separate included vs excluded segments so excluded items render at the bottom
    const includedSegments = segments.filter(segment => !isLegendLabelExcluded(segment.label));
    const excludedSegments = segments.filter(segment => isLegendLabelExcluded(segment.label));
    const renderOrder = includedSegments.concat(excludedSegments);
    const colorMap = assignSegmentColors(includedSegments.length ? includedSegments : segments);
    const total = includedSegments.reduce((sum,item)=> sum + item.value, 0);
    const hasSegments = segments.length > 0;
    const groupingLabel = graphGrouping === 'name' ? t('by_names') : t('by_categories');
    const rangeLabel = formatGraphRangeLabel(graphDateRange);
    clearLegendHoldState();
    hideLegendPopup();
    graphLegendEl.innerHTML = '';
    // Render included first, then excluded (renderOrder already ordered)
    renderOrder.forEach(segment=>{
      const color = colorMap.get(segment.label) || getGraphColor(segment.label);
      const legendItem = document.createElement('div');
      legendItem.className = 'graph-legend-item';
      legendItem.dataset.label = segment.label;
      if(segment.categoryLabel) legendItem.dataset.category = segment.categoryLabel;
      legendItem.dataset.graphType = graphType;
      legendItem.dataset.graphGrouping = graphGrouping;
      const dot = document.createElement('span');
      dot.className = 'graph-legend-color';
      dot.style.background = color;
      const text = document.createElement('span');
      text.className = 'legend-label';
      text.textContent = segment.label;
      const amount = document.createElement('span');
      amount.className = 'legend-amount';
      amount.textContent = formatCurrency(segment.value);
      const textWrap = document.createElement('div');
      textWrap.className = 'legend-text';
      textWrap.appendChild(text);
      textWrap.appendChild(amount);
      const pct = document.createElement('strong');
      const excluded = isLegendLabelExcluded(segment.label);
      if(excluded){
        legendItem.classList.add('excluded');
        pct.textContent = t('excluded');
        pct.classList.add('legend-excluded-tag');
      } else {
        const percent = total>0 ? Math.round((segment.value/total)*1000)/10 : 0;
        pct.textContent = `${percent}%`;
      }
      legendItem.appendChild(dot);
      legendItem.appendChild(textWrap);
      legendItem.appendChild(pct);
      legendItem.addEventListener('pointerdown', handleLegendHoldPointerDown);
      legendItem.addEventListener('pointerup', handleLegendHoldPointerCancel);
      legendItem.addEventListener('pointerleave', handleLegendHoldPointerCancel);
      legendItem.addEventListener('pointercancel', handleLegendHoldPointerCancel);
      legendItem.addEventListener('click', handleLegendClickFlash);
      graphLegendEl.appendChild(legendItem);
    });
    updateGraphLegendScrollIndicators();
    // show/hide the center overlay depending on whether there's a meaningful total
    const graphTotalOverlayEl = graphTotalValueEl ? graphTotalValueEl.parentElement : null;
    if(graphTotalOverlayEl){
      // hide overlay when total is zero (no data to show)
      graphTotalOverlayEl.hidden = total <= 0;
    }
    if(graphTotalValueEl){
      graphTotalValueEl.textContent = formatCurrency(total);
    }
    if(graphTotalScopeEl){
      if(total>0){
        const scopeParts = [`${graphType==='income' ? t('income') : t('expense')} · ${groupingLabel}`];
        if(graphDateRange && graphDateRange.type !== 'all' && rangeLabel) scopeParts.push(rangeLabel);
        graphTotalScopeEl.textContent = scopeParts.join(' · ');
      } else if(hasSegments){
        graphTotalScopeEl.textContent = graphGrouping === 'name' ? t('all_names_excluded') : t('all_categories_excluded');
      } else {
        graphTotalScopeEl.textContent = t('no_data_yet');
      }
    }
    if(total<=0){
      if(!hasSegments){
        if(transactions.length){
          const alternateType = graphType === 'income' ? 'expense' : 'income';
          const alternateSegments = buildGraphSegments(alternateType, filteredTxs);
          const alternateTotal = alternateSegments.reduce((sum,item)=> sum + item.value, 0);
          if(alternateTotal > 0){
            graphType = alternateType;
            updateGraphTypeButtons();
            renderGraph();
            return;
          }
        }
        graphCanvas.style.visibility = 'hidden';
        setGraphEmptyState(true);
      } else {
        graphCanvas.style.visibility = 'hidden';
        setGraphEmptyState(true, 'All items are excluded. Long-press a card to include it again.');
      }
      return;
    }
    graphCanvas.style.visibility = 'visible';
    setGraphEmptyState(false);
    resizeGraphCanvas();
    ctx.clearRect(0,0,graphCanvas.width, graphCanvas.height);
    const centerX = graphCanvas.width/2;
    const centerY = graphCanvas.height/2;
    const radius = Math.min(centerX, centerY) - 12*(window.devicePixelRatio||1);
    const innerRadius = radius * 0.55;
    let startAngle = -Math.PI/2;
    // draw only included segments (excluded segments are intentionally hidden)
    includedSegments.forEach(segment=>{
      const sliceAngle = (segment.value/total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const color = colorMap.get(segment.label) || getGraphColor(segment.label);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      if(legendFlashLabel && legendFlashLabel === segment.label){
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.lineWidth = 6*(window.devicePixelRatio||1);
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 6*(window.devicePixelRatio||1), startAngle, endAngle);
        ctx.stroke();
        ctx.restore();
      }
      startAngle = endAngle;

    });
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI*2);
    const bodyStyles = window.getComputedStyle(document.body);
    ctx.fillStyle = bodyStyles.getPropertyValue('background-color') || 'rgba(15,16,36,0.9)';
    ctx.fill();
  }

  function resizeTimelineCanvas(){
    if(!timelineCanvas || graphMode !== 'timeline') return;
    const wrap = timelineCanvas.parentElement;
    if(!wrap) return;
    const width = wrap.clientWidth || 600;
    const height = wrap.clientHeight || 320;
    const dpr = window.devicePixelRatio || 1;
    timelineCanvas.width = width * dpr;
    timelineCanvas.height = height * dpr;
    timelineCanvas.style.width = `${width}px`;
    timelineCanvas.style.height = `${height}px`;
  }

  function buildTimelineSeries(limit=45, txList){
    const dayMap = new Map();
    const source = Array.isArray(txList) ? txList : filterTransactionsByGraphRange(transactions);
    source.forEach(tx=>{
      const date = new Date(tx.createdAt);
      if(Number.isNaN(date)) return;
      date.setHours(0,0,0,0);
      const key = date.getTime();
      if(!dayMap.has(key)) dayMap.set(key,{ income:0, expense:0, entries:[] });
      const bucket = dayMap.get(key);
      bucket.entries.push(tx);
      if(tx.amountCents >= 0){
        bucket.income += tx.amountCents;
      } else {
        bucket.expense += Math.abs(tx.amountCents);
      }
    });
    const keys = Array.from(dayMap.keys()).sort((a,b)=>a-b);
    const trimmed = keys.slice(Math.max(0, keys.length-limit));
    const labels = trimmed.map(ts=>({ ts, label: formatShortDate(ts) }));
    const income = trimmed.map(ts=> (dayMap.get(ts).income||0)/100);
    const expense = trimmed.map(ts=> (dayMap.get(ts).expense||0)/100);
    const entriesByDay = new Map();
    trimmed.forEach(ts=>{
      const bucket = dayMap.get(ts);
      const sorted = (bucket && bucket.entries) ? bucket.entries.slice().sort((a,b)=>b.createdAt-a.createdAt) : [];
      entriesByDay.set(ts, sorted);
    });
    return { labels, income, expense, entriesByDay };
  }

  function renderTimelineGraph(){
    if(graphMode !== 'timeline') return;
    if(!timelineCanvas) return;
    const filteredTxs = filterTransactionsByGraphRange(transactions);
    const { labels, income, expense, entriesByDay } = buildTimelineSeries(undefined, filteredTxs);
    timelineSeriesData = { labels, income, expense };
    timelineEntriesByDay = entriesByDay;
    if(labels.length){
      if(typeof timelineCursorIndex !== 'number' || timelineCursorIndex < 0){
        timelineCursorIndex = labels.length - 1;
      } else if(timelineCursorIndex >= labels.length){
        timelineCursorIndex = labels.length - 1;
      }
    } else {
      timelineCursorIndex = null;
    }
    const hasData = labels.length >= 2 && (income.some(v=>v>0) || expense.some(v=>v>0));
    if(timelineEmptyEl){
      timelineEmptyEl.hidden = hasData;
      timelineEmptyEl.style.display = hasData ? 'none' : 'flex';
    }
    if(!hasData){
      timelineChartMeta = null;
      hideTimelineCursorUI();
    }
    resizeTimelineCanvas();
    const ctx = timelineCanvas.getContext('2d');
    if(!ctx) return;
    const isLightTheme = document.documentElement.classList.contains('theme-light');
    const gridColor = isLightTheme ? 'rgba(35,30,55,0.15)' : 'rgba(255,255,255,0.08)';
    const axisLabelColor = isLightTheme ? 'rgba(32,24,48,0.7)' : 'rgba(255,255,255,0.7)';
    const axisValueColor = isLightTheme ? 'rgba(32,24,48,0.65)' : 'rgba(255,255,255,0.65)';
    const pointInnerColor = isLightTheme ? '#ffffff' : '#05020c';
    ctx.clearRect(0,0,timelineCanvas.width, timelineCanvas.height);
    if(!hasData){
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const width = timelineCanvas.width;
    const height = timelineCanvas.height;
    const cssWidth = width / dpr;
    const cssHeight = height / dpr;
    const padding = { top: 24*dpr, right: 48*dpr, bottom: 38*dpr, left: 62*dpr };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(1, ...income, ...expense);
    const yScale = chartHeight / maxValue;
    const step = labels.length > 1 ? chartWidth / (labels.length - 1) : chartWidth;
    timelineChartMeta = {
      padding,
      chartWidth,
      chartHeight,
      step,
      canvasWidth: width,
      canvasHeight: height,
      cssWidth,
      cssHeight,
      dpr
    };
    ctx.lineWidth = 1*dpr;
    ctx.strokeStyle = gridColor;
    ctx.fillStyle = axisLabelColor;
    ctx.font = `${12*dpr}px "Inter", system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yTicks = 4;
    for(let i=0;i<=yTicks;i++){
      const value = (maxValue / yTicks) * i;
      const y = height - padding.bottom - value * yScale;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = axisValueColor;
      ctx.fillText(value.toFixed(0), padding.left - 10*dpr, y);
      ctx.strokeStyle = gridColor;
    }
    const xTicks = Math.min(6, labels.length);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = axisLabelColor;
    for(let i=0;i<xTicks;i++){
      const idx = Math.round((labels.length-1)/(xTicks-1 || 1) * i);
      const x = padding.left + idx * step;
      const y = height - padding.bottom + 6*dpr;
      ctx.fillText(labels[idx].label, x, y);
    }
    const drawLine = (series, color)=>{
      ctx.lineWidth = 3*dpr;
      ctx.strokeStyle = color;
      ctx.beginPath();
      series.forEach((val,idx)=>{
        const x = padding.left + idx * step;
        const y = height - padding.bottom - val * yScale;
        if(idx===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      });
      ctx.stroke();
      series.forEach((val,idx)=>{
        const x = padding.left + idx * step;
        const y = height - padding.bottom - val * yScale;
        ctx.beginPath();
        ctx.arc(x,y,4*dpr,0,Math.PI*2);
        ctx.fillStyle = pointInnerColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x,y,3*dpr,0,Math.PI*2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };
    drawLine(income, '#30d6a4');
    drawLine(expense, '#ff4f6a');
    refreshTimelineCursorUI();
  }

  function setGraphMode(mode){
    const next = mode === 'timeline' ? 'timeline' : 'classic';
    if(graphMode === next) return;
    graphMode = next;
    if(graphMainEl) graphMainEl.hidden = graphMode === 'timeline';
    if(graphTimelineEl) graphTimelineEl.hidden = graphMode !== 'timeline';
    if(btnGraphTimeline) btnGraphTimeline.setAttribute('aria-pressed', graphMode === 'timeline' ? 'true' : 'false');
    if(graphMode !== 'timeline'){
      hideTimelineCursorUI();
    }
    // wait for layout to settle before resizing canvases and rendering
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        if(graphMode === 'timeline'){
          // timeline uses its own resize helper
          resizeTimelineCanvas();
          renderTimelineGraph();
        } else {
          resizeGraphCanvas();
          renderGraph();
        }
      });
    });
  }
  function isLandscapeMode(){
    return window.innerWidth > window.innerHeight + 80;
  }
  function showGraphScreen(){
    if(!graphScreen) return;
    if(graphScreen.hidden){
      previousNonGraphScreen = currentScreen;
    }
    homeScreen.classList.remove('active');
    homeScreen.hidden = true;
    historyScreen.classList.remove('active');
    historyScreen.hidden = true;
    graphScreen.hidden = false;
    graphScreen.classList.add('active');
    currentScreen = 'graph';
    // Defer rendering until graph screen is visible and layout has settled
    updateGraphTypeButtons();
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        if(graphMode === 'timeline'){
          resizeTimelineCanvas();
          renderTimelineGraph();
        } else {
          resizeGraphCanvas();
          renderGraph();
        }
      });
    });
  }
  function hideGraphScreen(){
    if(!graphScreen || graphScreen.hidden) return;
    graphScreen.hidden = true;
    graphScreen.classList.remove('active');
    if(previousNonGraphScreen === 'history'){
      historyScreen.hidden = false;
      historyScreen.classList.add('active');
      homeScreen.hidden = true;
      homeScreen.classList.remove('active');
      currentScreen = 'history';
    } else {
      homeScreen.hidden = false;
      homeScreen.classList.add('active');
      historyScreen.hidden = true;
      historyScreen.classList.remove('active');
      currentScreen = 'home';
    }
  }
  function syncGraphScreenVisibility(){
    if(!graphScreen) return;
    if(currentScreen === 'summary'){
      graphScreen.hidden = true;
      graphScreen.classList.remove('active');
      return;
    }
    const landscape = isLandscapeMode();
    if(landscape){
      showGraphScreen();
    } else if(!landscape && !graphScreen.hidden){
      hideGraphScreen();
    }
  }
  function refreshGraphIfVisible(){
    if(graphScreen && !graphScreen.hidden){
      if(graphMode === 'timeline') renderTimelineGraph();
      else renderGraph();
    }
  }
  function toLocalInputValue(timestamp){
    const date = new Date(timestamp);
    if(Number.isNaN(date)) return '';
    return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }
  function parseLocalInputValue(value){
    if(!value) return null;
    const date = new Date(value);
    if(Number.isNaN(date)) return null;
    return date.getTime();
  }
  function normalizeCollections(){
    ['incomeCategories','expenseCategories','incomeNames','expenseNames'].forEach(key=>{
      if(!Array.isArray(settings[key])) settings[key] = [];
    });
    ensureGraphExclusions();
  }
  function ensureGraphExclusions(){
    if(!settings.graphExclusions) settings.graphExclusions = {
      income: { category: [], name: [] },
      expense: { category: [], name: [] }
    };
    ['income','expense'].forEach(type=>{
      if(!settings.graphExclusions[type]){
        settings.graphExclusions[type] = { category: [], name: [] };
      }
      ['category','name'].forEach(group=>{
        if(!Array.isArray(settings.graphExclusions[type][group])){
          settings.graphExclusions[type][group] = [];
        }
        const normalized = settings.graphExclusions[type][group]
          .map(val => typeof val === 'string' ? val.trim().toLowerCase() : '')
          .filter(Boolean);
        settings.graphExclusions[type][group] = Array.from(new Set(normalized));
      });
    });
  }
  const normalizeLegendLabel = label => (label || '').trim().toLowerCase();
  function isLegendLabelExcluded(label){
    ensureGraphExclusions();
    const type = graphType === 'income' ? 'income' : 'expense';
    const group = graphGrouping === 'name' ? 'name' : 'category';
    const normalized = normalizeLegendLabel(label);
    const list = settings.graphExclusions[type][group] || [];
    if(list.includes(normalized)) return true;
    if(group === 'name'){
      const parts = (label || '').split('/');
      const nameOnly = normalizeLegendLabel(parts[parts.length - 1] || '');
      if(nameOnly && list.includes(nameOnly)) return true;
    }
    return false;
  }
  function updateLegendExclusion(label, exclude){
    ensureGraphExclusions();
    const type = graphType === 'income' ? 'income' : 'expense';
    const group = graphGrouping === 'name' ? 'name' : 'category';
    const list = settings.graphExclusions[type][group];
    const normalized = normalizeLegendLabel(label);
    const parts = (label || '').split('/');
    const nameOnly = group === 'name' ? normalizeLegendLabel(parts[parts.length - 1] || '') : null;
    let changed = false;
    const add = val => { if(val && !list.includes(val)){ list.push(val); changed = true; } };
    const remove = val => {
      if(!val) return;
      const idx = list.indexOf(val);
      if(idx !== -1){ list.splice(idx,1); changed = true; }
    };
    if(exclude){
      add(normalized);
      if(nameOnly && nameOnly !== normalized) add(nameOnly);
    } else {
      remove(normalized);
      if(nameOnly && nameOnly !== normalized) remove(nameOnly);
    }
    if(!changed) return Promise.resolve();
    return dbSaveSettings(settings).then(()=>{
      scheduleLocalBackup('graph-exclusion-toggle');
      renderGraph();
    });
  }
  function getGraphExclusionList(typeKey, groupKey){
    const grouping = groupKey === 'name' ? 'name' : 'category';
    const type = typeKey === 'income' ? 'income' : 'expense';
    const filterPositive = type === 'income';
    const source = filterTransactionsByGraphRange(transactions);
    const map = new Map();
    source.forEach(tx=>{
      const isIncome = tx.amountCents >= 0;
      if(filterPositive && !isIncome) return;
      if(!filterPositive && isIncome) return;
      const amount = Math.abs(tx.amountCents);
      if(amount <= 0) return;
      const categoryRaw = (tx.category && tx.category.trim()) || t('uncategorized');
      const nameRaw = (tx.name && tx.name.trim()) || t('unnamed');
      const label = grouping === 'name' ? `${categoryRaw} / ${nameRaw}` : categoryRaw;
      const bucket = map.get(label) || { value: 0, categoryLabel: grouping === 'name' ? categoryRaw : null };
      bucket.value += amount;
      map.set(label, bucket);
    });
    return Array.from(map.entries())
      .map(([label,bucket])=> ({ label, value: bucket.value, categoryLabel: bucket.categoryLabel }))
      .sort((a,b)=> b.value - a.value);
  }
  function clearLegendHoldState(){
    if(legendHoldTimer){
      clearTimeout(legendHoldTimer);
      legendHoldTimer = null;
    }
    if(legendHoldTarget){
      legendHoldTarget.classList.remove('hold-arming');
      legendHoldTarget = null;
    }
  }
  function handleLegendHoldPointerDown(evt){
    const item = evt.currentTarget;
    clearLegendHoldState();
    hideLegendPopup();
    legendHoldTarget = item;
    item.classList.add('hold-arming');
    legendHoldTimer = setTimeout(()=>{
      legendHoldTimer = null;
      showLegendPopup(item);
    }, LEGEND_HOLD_DURATION);
  }
  function handleLegendHoldPointerCancel(){
    clearLegendHoldState();
  }
  function showLegendPopup(item){
    clearLegendHoldState();
    if(!item) return;
    hideLegendPopup();
    const label = item.dataset.label || 'This item';
    const excluded = item.classList.contains('excluded');
    const popup = document.createElement('div');
    popup.className = 'legend-hold-popup';
    const title = document.createElement('p');
    title.textContent = excluded ? `${label} is excluded` : `Exclude ${label}?`;
    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.textContent = excluded ? 'Include in graph' : 'Exclude from graph';
    actionBtn.addEventListener('click', ()=>{
      updateLegendExclusion(label, !excluded).finally(()=> hideLegendPopup());
    });
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', hideLegendPopup);
    popup.append(title, actionBtn, cancelBtn);
    popup.addEventListener('pointerdown', evt=> evt.stopPropagation());
    item.appendChild(popup);
    legendPopupEl = popup;
  }
  function hideLegendPopup(){
    if(legendPopupEl){
      const parent = legendPopupEl.parentElement;
      if(parent) parent.classList.remove('hold-arming');
      legendPopupEl.remove();
      legendPopupEl = null;
    }
  }
  function handleGlobalLegendPointerDown(evt){
    if(!legendPopupEl) return;
    if(legendPopupEl.contains(evt.target)) return;
    hideLegendPopup();
  }
  function triggerLegendFlash(label){
    if(!label) return;
    legendFlashLabel = label;
    if(legendFlashTimer) clearTimeout(legendFlashTimer);
    legendFlashTimer = setTimeout(()=>{
      legendFlashLabel = null;
      legendFlashTimer = null;
      renderGraph();
    }, 450);
    renderGraph();
  }
  function handleLegendClickFlash(evt){
    const item = evt.currentTarget;
    if(item.classList.contains('excluded')) return;
    const label = item.dataset.label;
    if(!label) return;
    triggerLegendFlash(label);
  }
  function collectionKey(type, kind){
    const isExpense = type === 'expense';
    if(kind === 'categories') return isExpense ? 'expenseCategories' : 'incomeCategories';
    return isExpense ? 'expenseNames' : 'incomeNames';
  }
  function getCollection(type, kind){
    normalizeCollections();
    const key = collectionKey(type, kind);
    return settings[key];
  }
  function gatherSheetValues(kind, filterText=''){
    if(!sheetType) return [];
    const isCategory = kind === 'category';
    const collectionKeyName = isCategory ? 'categories' : 'names';
    const base = new Set();
    const selectedCategory = categoryInput && categoryInput.value.trim();
    // If a category is selected, names should only come from that category (if any).
    // We don't have a persistent category->names map, so we rely on existing transactions.
    const includeStoredNames = isCategory || !selectedCategory;
    if(includeStoredNames){
      const fromSettings = getCollection(sheetType, collectionKeyName);
      fromSettings.forEach(v=>{ if(v) base.add(v); });
    }
    transactions.forEach(t=>{
      const isIncome = t.amountCents>=0;
      if(sheetType === 'income' && !isIncome) return;
      if(sheetType === 'expense' && isIncome) return;
      if(!isCategory && selectedCategory){
        if(!t.category || !equalsIgnoreCase(t.category, selectedCategory)) return;
      }
      const value = isCategory ? t.category : t.name;
      if(value) base.add(value);
    });
    const text = (filterText || '').trim().toLowerCase();
    return Array.from(base)
      .filter(Boolean)
      .filter(val=> !text || val.toLowerCase().includes(text))
      .sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
  }
  function ensureCollectionEntry(type, kind, value){
    if(!value || !type) return Promise.resolve();
    normalizeCollections();
    const key = collectionKey(type, kind);
    if(!settings[key].includes(value)){
      settings[key].push(value);
      settings[key].sort((a,b)=> a.localeCompare(b,undefined,{sensitivity:'base'}));
      return dbSaveSettings(settings).then(()=>{
        refreshCategoryOptions();
        refreshNameOptions();
        renderFilterChips();
      });
    }
    return Promise.resolve();
  }
  function refreshCategoryOptions(){
    if(!categoryListEl) return;
    categoryListEl.innerHTML='';
    const type = sheetType || historyTypeFilter || 'income';
    getCollection(type,'categories').forEach(cat=>{
      if(!cat) return;
      const opt=document.createElement('option');
      opt.value=cat;
      categoryListEl.appendChild(opt);
    });
  }
  function refreshNameOptions(){
    if(!nameListEl) return;
    nameListEl.innerHTML='';
    const type = sheetType || historyTypeFilter || 'income';
    // In the add/edit sheet, if a category is selected, only suggest names used in that category.
    const selectedCategory = sheetType && categoryInput && categoryInput.value.trim();
    if(sheetType && selectedCategory){
      const set = new Set();
      transactions.forEach(t=>{
        const isIncome = t.amountCents >= 0;
        if(sheetType === 'income' && !isIncome) return;
        if(sheetType === 'expense' && isIncome) return;
        if(!t.category || !equalsIgnoreCase(t.category, selectedCategory)) return;
        if(t.name) set.add(t.name);
      });
      Array.from(set)
        .filter(Boolean)
        .sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}))
        .forEach(n=>{
          const opt=document.createElement('option');
          opt.value=n;
          nameListEl.appendChild(opt);
        });
      return;
    }
    getCollection(type,'names').forEach(n=>{
      if(!n) return;
      const opt=document.createElement('option');
      opt.value=n;
      nameListEl.appendChild(opt);
    });
  }
  function gatherValues(field, type){
    const isCategoryField = field === 'category';
    const collectionName = isCategoryField ? 'categories' : 'names';
    const base = new Set();
    const includeStoredValues = isCategoryField || !historyCategoryFilter;
    const primaryType = type === 'all' ? 'income' : type;
    if(includeStoredValues){
      getCollection(primaryType, collectionName).forEach(v=>{ if(v) base.add(v); });
      if(type === 'all'){
        getCollection('expense', collectionName).forEach(v=>{ if(v) base.add(v); });
      }
    }
    const txValues = new Set();
    const normalizedCategory = historyCategoryFilter ? historyCategoryFilter.toLowerCase() : null;
    const normalizedName = historyNameFilter ? historyNameFilter.toLowerCase() : null;
    transactions.forEach(t=>{
      const isIncome = t.amountCents>=0;
      const matchesType = type==='all' || (type==='income'? isIncome : !isIncome);
      if(!matchesType) return;
      if(!isCategoryField && normalizedCategory){
        if(!t.category || t.category.toLowerCase()!==normalizedCategory) return;
      }
      if(isCategoryField && normalizedName){
        if(!t.name || t.name.toLowerCase()!==normalizedName) return;
      }
      const value = isCategoryField ? t.category : t.name;
      if(value) txValues.add(value);
    });
    txValues.forEach(v=>base.add(v));
    return Array.from(base).filter(Boolean).sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
  }
  function renderFilterChips(){
    if(historyTypeFiltersEl){
      historyTypeFiltersEl.querySelectorAll('.type-pill').forEach(btn=>{
        btn.classList.toggle('active', btn.dataset.type===historyTypeFilter);
      });
    }
    let categoryValues = gatherValues('category', historyTypeFilter);
    if(historyCategoryFilter && !categoryValues.some(cat=>equalsIgnoreCase(cat, historyCategoryFilter))){
      historyCategoryFilter = null;
    }
    let nameValues = gatherValues('name', historyTypeFilter);
    if(historyNameFilter && !nameValues.some(n=>equalsIgnoreCase(n, historyNameFilter))){
      historyNameFilter = null;
    }
    const query = (historyChipSearchText || '').trim().toLowerCase();
    if(query){
      const applyQuery = values => values.filter(v=> String(v).toLowerCase().includes(query));
      categoryValues = applyQuery(categoryValues);
      nameValues = applyQuery(nameValues);
      // keep active filters visible even if they don't match the search text
      if(historyCategoryFilter && !categoryValues.some(v=>equalsIgnoreCase(v, historyCategoryFilter))){
        categoryValues = [historyCategoryFilter, ...categoryValues];
      }
      if(historyNameFilter && !nameValues.some(v=>equalsIgnoreCase(v, historyNameFilter))){
        nameValues = [historyNameFilter, ...nameValues];
      }
      // de-dupe in case we prepended
      categoryValues = Array.from(new Map(categoryValues.map(v=>[String(v).toLowerCase(), v])).values());
      nameValues = Array.from(new Map(nameValues.map(v=>[String(v).toLowerCase(), v])).values());
    }
    renderChipRow(categoryChipRow, categoryValues, historyCategoryFilter, 'category');
    renderChipRow(nameChipRow, nameValues, historyNameFilter, 'name');
  }
  function renderChipRow(rowEl, values, activeValue, kind){
    if(!rowEl) return;
    rowEl.innerHTML='';
    if(!values.length){ rowEl.hidden=true; return; }
    rowEl.hidden=false;
    const clearChip = document.createElement('button');
    clearChip.type='button';
    clearChip.className='chip'+(!activeValue?' active':'');
    clearChip.textContent = kind==='category' ? t('all_categories') : t('all_names');
    clearChip.dataset.value='';
    clearChip.dataset.kind=kind;
    clearChip.dataset.scope='history';
    clearChip.dataset.typeScope=historyTypeFilter;
    rowEl.appendChild(clearChip);
    values.forEach(val=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='chip';
      if(activeValue && activeValue.toLowerCase()===val.toLowerCase()) btn.classList.add('active');
      btn.textContent=val;
      btn.dataset.value=val;
      btn.dataset.kind=kind;
      btn.dataset.scope='history';
      btn.dataset.typeScope=historyTypeFilter;
      rowEl.appendChild(btn);
    });
  }

  const BACKUP_FILENAME = 'followthemoney-backup.json';
  function buildBackupPayload(){
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      settings
    }, null, 2);
  }
  function createBackupBlob(){
    return new Blob([buildBackupPayload()], { type:'application/json' });
  }
  function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  function normalizeImportedTransactions(list){
    if(!Array.isArray(list)) return [];
    const sanitized = list.map(item=>{
      if(!item) return null;
      const amount = Number(item.amountCents);
      if(!Number.isFinite(amount)) return null;
      const createdAt = typeof item.createdAt === 'number' ? item.createdAt : Date.now();
      const tx = {
        id: item.id ? String(item.id) : generateId(),
        amountCents: Math.trunc(amount),
        createdAt,
        recurring: !!item.recurring
      };
      if(item.note) tx.note = String(item.note);
      if(item.name) tx.name = String(item.name);
      if(item.category) tx.category = String(item.category);
      return tx;
    }).filter(Boolean);
    sanitized.sort((a,b)=>b.createdAt - a.createdAt);
    return sanitized;
  }
  function normalizeImportedSettings(raw){
    const base = {
      recurringEnabled:false,
      recurringAmountCents:0,
      lastRecurringAppliedMonth:null,
      theme:'light',
      seasonStart:null,
      seasonEnd:null,
      seasonIncomeCents:0,
      dateFormat:'dmy',
      currencySymbol:'€',
      language:'en',
      historyLocked:true,
      incomeCategories: [],
      expenseCategories: [],
      incomeNames: [],
      expenseNames: [],
      graphExclusions: {
        income: { category: [], name: [] },
        expense: { category: [], name: [] }
      }
    };
    const next = { ...base, ...settings, ...(raw || {}) };
    const allowedFormats = new Set(['dmy','mdy','ymd']);
    if(!allowedFormats.has(next.dateFormat)) next.dateFormat = 'dmy';
    let symbolSource = raw && typeof raw.currencySymbol !== 'undefined' ? String(raw.currencySymbol) : (next.currencySymbol || '€');
    symbolSource = symbolSource.trim();
    next.currencySymbol = symbolSource ? symbolSource.slice(0,3) : '€';
    next.language = String(next.language || 'en').toLowerCase() === 'hr' ? 'hr' : 'en';
    next.historyLocked = !!next.historyLocked;
    ['incomeCategories','expenseCategories','incomeNames','expenseNames'].forEach(key=>{
      if(!Array.isArray(next[key])) next[key] = [];
    });
    if(!next.graphExclusions){
      next.graphExclusions = {
        income: { category: [], name: [] },
        expense: { category: [], name: [] }
      };
    }
    ['income','expense'].forEach(type=>{
      if(!next.graphExclusions[type]){
        next.graphExclusions[type] = { category: [], name: [] };
      }
      ['category','name'].forEach(group=>{
        if(!Array.isArray(next.graphExclusions[type][group])){
          next.graphExclusions[type][group] = [];
        }
        next.graphExclusions[type][group] = Array.from(new Set(
          next.graphExclusions[type][group]
            .map(val => typeof val === 'string' ? val.trim().toLowerCase() : '')
            .filter(Boolean)
        ));
      });
    });
    return next;
  }
  function replaceAllTransactions(newList){
    if(!db) return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(TX_STORE,'readwrite');
      const store = tx.objectStore(TX_STORE);
      const clearReq = store.clear();
      clearReq.onerror = ()=> reject(clearReq.error);
      clearReq.onsuccess = ()=>{
        newList.forEach(item=> store.put(item));
      };
      tx.oncomplete = ()=> resolve();
      tx.onerror = ()=> reject(tx.error);
    });
  }
  async function handleExportShare(){
    if(!btnExportShare) return;
    btnExportShare.disabled = true;
    try{
      const blob = createBackupBlob();
      let shareFile = null;
      if(typeof File !== 'undefined'){
        shareFile = new File([blob], BACKUP_FILENAME, { type:'application/json' });
      }
      const canFileShare = !!(shareFile && typeof navigator !== 'undefined' && navigator.canShare && navigator.share && navigator.canShare({ files:[shareFile] }));
      if(canFileShare){
        await navigator.share({
          files:[shareFile],
          title:'FollowTheMoney Backup',
          text:`Backup created ${new Date().toLocaleString()}`
        });
      } else {
        downloadBlob(blob, BACKUP_FILENAME);
        alert(t('share_sheet_not_available'));
      }
    }catch(err){
      if(err && err.name === 'AbortError'){
        console.warn('Share dismissed by user');
      } else {
        console.error('Export/share error', err);
        alert(t('unable_export_backup'));
      }
    }finally{
      btnExportShare.disabled = false;
    }
  }
  // Email backup removed
  function parseBackupText(text){
    const parsed = JSON.parse(text);
    if(!parsed || typeof parsed !== 'object') throw new Error('Invalid backup format.');
    const importedTxs = normalizeImportedTransactions(parsed.transactions || []);
    const importedSettings = normalizeImportedSettings(parsed.settings || {});
    return { importedTxs, importedSettings };
  }
  async function applyImportedData(importedTxs, importedSettings){
    await replaceAllTransactions(importedTxs);
    await dbSaveSettings(importedSettings);
    transactions = importedTxs.slice();
    settings = { ...importedSettings };
    setLanguage(settings.language || 'en', false);
    normalizeCollections();
    updateBalance();
    renderRecent();
    if(!historyScreen.hidden) renderHistory();
    syncSettingsUI();
    updateSeasonalStats();
    scheduleLocalBackup('import-data');
    refreshGraphIfVisible();
  }

  function renderSheetSuggestions(kind){
    const container = kind==='category' ? categorySuggestionsEl : nameSuggestionsEl;
    if(!container) return;
    if(kind==='name' && nameInput && nameInput.disabled){
      container.hidden = true;
      container.innerHTML='';
      return;
    }
    const inputEl = kind==='category' ? categoryInput : nameInput;
    const filterValue = inputEl ? inputEl.value : '';
    const values = gatherSheetValues(kind, filterValue);
    if(!values.length){
      container.hidden = true;
      container.innerHTML='';
      return;
    }
    container.hidden = false;
    container.innerHTML='';
    values.forEach(val=>{
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='suggestion-chip';
      btn.textContent = val;
      btn.dataset.kind = kind;
      btn.dataset.value = val;
      btn.dataset.scope = 'sheet';
      btn.dataset.typeScope = sheetType || 'income';
      container.appendChild(btn);
    });
  }

  function typeScopesForContext(context){
    if(context === 'income' || context === 'expense') return [context];
    return ['income','expense'];
  }
  function hasTransactionsForGroup(kind,value,_typeScope){
    if(!value) return false;
    const normalized = value.toLowerCase();
    return transactions.some(t=>{
      if(kind==='category') return t.category && t.category.toLowerCase()===normalized;
      return t.name && t.name.toLowerCase()===normalized;
    });
  }
  function removeGroupValue(kind,value,typeScope){
    if(!value) return Promise.resolve();
    normalizeCollections();
    const targetKey = kind==='category' ? 'categories' : 'names';
    const scopes = typeScopesForContext(typeScope);
    scopes.forEach(scope=>{
      const key = collectionKey(scope, targetKey);
      settings[key] = settings[key].filter(item=> !equalsIgnoreCase(item,value));
    });
    return dbSaveSettings(settings).then(()=>{
      refreshCategoryOptions();
      refreshNameOptions();
    });
  }

  const LONG_PRESS_MS = 600;
  const GROUP_DELETE_LONG_PRESS_MS = 3000;
  const longPressTimers = new WeakMap();
  function scheduleLongPress(target, handler, delay){
    clearLongPress(target);
    const timer = setTimeout(()=>{
      longPressTimers.delete(target);
      target.dataset.skipNextClick = '1';
      if(typeof handler === 'function') handler(target);
    }, typeof delay === 'number' ? delay : LONG_PRESS_MS);
    longPressTimers.set(target,timer);
  }
  function clearLongPress(target){
    const timer = longPressTimers.get(target);
    if(timer){
      clearTimeout(timer);
      longPressTimers.delete(target);
    }
  }
  function attachLongPressHandlers(container, selector, handler = handleGroupLongPress, delay = LONG_PRESS_MS){
    if(!container) return;
    const start = e=>{
      if(e.type==='mousedown' && e.button!==0) return;
      const btn = e.target.closest(selector);
      if(!btn) return;
      if(handler === handleGroupLongPress && !btn.dataset.value) return;
      btn.dataset.skipNextClick = '0';
      scheduleLongPress(btn, handler, delay);
    };
    const cancel = e=>{
      const btn = e.target.closest(selector);
      if(!btn) return;
      const triggered = btn.dataset.skipNextClick === '1';
      clearLongPress(btn);
      if(triggered){
        e.preventDefault();
        e.stopPropagation();
        requestAnimationFrame(()=>{ btn.dataset.skipNextClick = '0'; });
      }
    };
    ['touchstart','mousedown'].forEach(evt=> container.addEventListener(evt,start));
    ['touchend','touchcancel','mouseup','mouseleave'].forEach(evt=> container.addEventListener(evt,cancel));
  }
  function handleGroupLongPress(target){
    const kind = target.dataset.kind;
    const value = target.dataset.value;
    if(!kind || !value) return;
    const scope = target.dataset.scope || 'history';
    let typeScope = target.dataset.typeScope || 'all';
    if(scope==='sheet' && sheetType) typeScope = sheetType;
    if(hasTransactionsForGroup(kind,value,typeScope)){
      alert('Unable to delete! There are items in this category/name group.');
      return;
    }
    const confirmed = confirm(`Delete saved ${kind} "${value}"? This cannot be undone.`);
    if(!confirmed) return;
    removeGroupValue(kind,value,typeScope)
      .then(()=>{
        if(scope==='history'){
          renderFilterChips();
          renderHistory();
        } else {
          renderSheetSuggestions(kind);
          if(kind==='category') renderSheetSuggestions('name');
          renderFilterChips();
        }
      })
      .catch(err=>{
        console.error('Failed to delete saved group', err);
        alert('Unable to delete this entry right now. Please try again.');
      });
  }

  function handleRecentCardLongPress(target){
    const txId = target.dataset.txId;
    if(!txId) return;
    pendingHistoryHighlightId = txId;
    const proceedToHistory = ()=>{
      historyFilter = null;
      historyCategoryFilter = null;
      historyNameFilter = null;
      historyTypeFilter = 'all';
      refreshCategoryOptions();
      refreshNameOptions();
      renderFilterChips();
      homeScreen.classList.remove('active');
      homeScreen.hidden = true;
      historyScreen.hidden = false;
      historyScreen.classList.add('active');
      renderHistory();
    };

    const triggerNavigation = (()=>{
      let done = false;
      return ()=>{
        if(done) return;
        done = true;
        target.classList.remove('press-flash');
        proceedToHistory();
      };
    })();

    target.classList.add('press-flash');
    const handleAnimationEnd = e=>{
      if(e && e.animationName !== 'recentPressFlash') return;
      target.removeEventListener('animationend', handleAnimationEnd);
      triggerNavigation();
    };
    target.addEventListener('animationend', handleAnimationEnd);
    setTimeout(triggerNavigation, 220);
  }

  function scrollHistoryCardIntoViewIfNeeded(el){
    if(!el || !historyScreen) return;
    const container = historyScreen;
    const rect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const fullyVisible = rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
    if(fullyVisible) return;
    const offset = rect.top - containerRect.top - ((containerRect.height - rect.height) / 2);
    container.scrollBy({ top: offset, behavior: 'smooth' });
  }

  function updateBalance(){
    const total = transactions.reduce((a,t)=>a+t.amountCents,0);
    balanceEl.textContent = formatCurrency(total);
    // Force dashboard update
    if(window.SeasonalLogic) updateSeasonalStats();
  }

  function renderRecent(){
    if(!recentListEl) return;
    recentListEl.innerHTML = '';
    const list = transactions.slice(0,5);
    if(list.length===0){
      const e = document.createElement('div'); e.className='empty'; e.textContent=t('no_recent_entries'); recentListEl.appendChild(e); return;
    }
    list.forEach(t=>{
      const row = document.createElement('div');
      row.className='recent-item';
      row.dataset.txId = t.id;
      const left = document.createElement('div'); left.style.display='flex'; left.style.alignItems='center'; left.style.gap='0.5rem'; left.style.minWidth='0';
      const title = document.createElement('div');
      title.className='r-title';
      const displayName = buildEntryLabel(t);
      title.textContent = displayName;
      const meta = document.createElement('div');
      meta.className='r-meta';
      meta.textContent = formatShortDate(t.createdAt);
      left.appendChild(title); left.appendChild(meta);
      const amt = document.createElement('div'); amt.className = 'r-amt ' + (t.amountCents>0?'amount-pos':'amount-neg'); amt.textContent = formatCurrency(Math.abs(t.amountCents));
      row.appendChild(left); row.appendChild(amt);
      recentListEl.appendChild(row);
    });
  }

  function buildEntryLabel(t){
    const parts = [];
    if(t.category) parts.push(t.category);
    if(t.name) parts.push(t.name);
    if(parts.length) return parts.join(' / ');
    if(t.note) return t.note;
    return t.amountCents>0 ? 'Income' : 'Expense';
  }

  function updateHistorySummary(list){
    if(!historyGroupSummaryEl) return;
    if(!list.length){
      historyGroupSummaryEl.hidden = true;
      historyGroupSummaryEl.innerHTML = '';
      historySummaryState = null;
      return;
    }
    historyGroupSummaryEl.hidden = false;
    historyGroupSummaryEl.innerHTML = '';
    const labelSpan = document.createElement('span');
    labelSpan.className = 'label';
    const labelParts = [];
    if(historyTypeFilter === 'income') labelParts.push('Income');
    else if(historyTypeFilter === 'expense') labelParts.push('Expenses');
    else labelParts.push('All types');
    if(historyCategoryFilter) labelParts.push(historyCategoryFilter);
    if(historyNameFilter) labelParts.push(historyNameFilter);
    labelSpan.textContent = labelParts.join(' · ') || t('all_entries');

    const sumSpan = document.createElement('span');
    sumSpan.className = 'sum';
    const totalCents = list.reduce((sum,t)=> sum + t.amountCents, 0);
    sumSpan.textContent = formatCurrency(totalCents);

    historyGroupSummaryEl.appendChild(labelSpan);
    historyGroupSummaryEl.appendChild(sumSpan);

    historySummaryState = {
      label: labelSpan.textContent,
      totalCents,
      count: list.length,
      filters: {
        type: historyTypeFilter,
        category: historyCategoryFilter,
        name: historyNameFilter
      },
      transactions: list.map(t=> ({ ...t })),
      excludedIds: new Set()
    };
  }

  function clearHistoryCardOverlay(){
    if(historyOverlayAttachTimer){
      clearTimeout(historyOverlayAttachTimer);
      historyOverlayAttachTimer = null;
    }
    if(historyOverlayDismissHandler){
      historyOverlayDismissEvents.forEach(evt=> document.removeEventListener(evt, historyOverlayDismissHandler));
      historyOverlayDismissHandler = null;
    }
    if(historyFocusCoverEl){
      historyFocusCoverEl.classList.remove('visible');
      if(historyFocusCoverEl.parentNode){
        historyFocusCoverEl.parentNode.removeChild(historyFocusCoverEl);
      }
    }
    if(activeHistoryOverlayEl){
      activeHistoryOverlayEl.classList.remove('focus-overlay');
      activeHistoryOverlayEl = null;
    }
  }

  function setHistoryCardOverlay(el){
    if(!el) return;
    clearHistoryCardOverlay();
    activeHistoryOverlayEl = el;
    el.classList.add('focus-overlay');

    if(!historyFocusCoverEl){
      historyFocusCoverEl = document.createElement('div');
      historyFocusCoverEl.className = 'history-focus-cover';
    }
    historyFocusCoverEl.classList.remove('visible');
    el.appendChild(historyFocusCoverEl);
    requestAnimationFrame(()=> historyFocusCoverEl.classList.add('visible'));

    historyOverlayDismissHandler = ()=>{
      clearHistoryCardOverlay();
    };

    historyOverlayAttachTimer = setTimeout(()=>{
      historyOverlayDismissEvents.forEach(evt=> document.addEventListener(evt, historyOverlayDismissHandler));
    }, 150);
  }

  function scrollHistoryCardIntoView(card){
    if(!card) return;
    const container = historyScreen;
    if(!container){
      card.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }
    const parentRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const currentScroll = container.scrollTop || 0;
    const relativeTop = (cardRect.top - parentRect.top) + currentScroll;
    const targetCenter = relativeTop - (container.clientHeight/2) + (cardRect.height/2);
    const maxScroll = Math.max(container.scrollHeight - container.clientHeight, 0);
    const clamped = Math.min(Math.max(targetCenter, 0), maxScroll);
    container.scrollTo({ top: clamped, behavior: 'smooth' });
  }

  function renderHistory(){
    if(!historyList) return;
    clearHistoryCardOverlay();
    historyList.innerHTML = '';
    let filteredTxs = transactions;
    if(historyFilter && window.SeasonalLogic){
      const now = Date.now();
      const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
      const todayEnd = todayStart.getTime() + 86400000 - 1;
      // Calendar week (Mon-Sun) to match dashboard "Weekly" spent.
      const dayOfWeek = (todayStart.getDay() + 6) % 7; // 0 = Monday
      const weekStart = todayStart.getTime() - (dayOfWeek * 86400000);
      const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1).getTime();
      if(historyFilter === 'day'){
        filteredTxs = transactions.filter(t => t.createdAt >= todayStart.getTime() && t.createdAt <= todayEnd);
      } else if(historyFilter === 'week'){
        filteredTxs = transactions.filter(t => t.createdAt >= weekStart && t.createdAt <= todayEnd);
      } else if(historyFilter === 'month'){
        filteredTxs = transactions.filter(t => t.createdAt >= monthStart && t.createdAt <= todayEnd);
      }
    }
    if(historyTypeFilter !== 'all'){
      filteredTxs = filteredTxs.filter(t=> historyTypeFilter==='income' ? t.amountCents>=0 : t.amountCents<0);
    }
    if(historyCategoryFilter){
      const normCat = historyCategoryFilter.toLowerCase();
      filteredTxs = filteredTxs.filter(t=> t.category && t.category.toLowerCase()===normCat);
    }
    if(historyNameFilter){
      const normName = historyNameFilter.toLowerCase();
      filteredTxs = filteredTxs.filter(t=> t.name && t.name.toLowerCase()===normName);
    }
    if(historyFilterEl){
      if(historyFilter){
        const labels = {day:t('today'),week:t('this_week'),month:t('this_month')};
        historyFilterEl.textContent = `${t('showing_prefix')} ${labels[historyFilter] || t('all')}`;
        historyFilterEl.hidden = false;
      } else {
        historyFilterEl.hidden = true;
      }
    }
    updateHistorySummary(filteredTxs);
    if(filteredTxs.length===0){
      const empty = document.createElement('div');
      empty.className='empty'; 
      empty.textContent= historyFilter ? t('no_transactions_in_period') : t('no_transactions_yet');
      historyList.appendChild(empty); 
      return;
    }
    filteredTxs.forEach(tx=>{
      const wrap = document.createElement('div');
      wrap.className='transaction fade-in';
      wrap.dataset.id = tx.id;

      const info = document.createElement('div');
      info.className = 'left';
      info.style.minWidth='0';
      const title = document.createElement('div');
      title.className='title';
      const displayName = buildEntryLabel(tx);
      title.textContent = displayName;
      title.style.fontWeight='600';
      title.style.whiteSpace='nowrap';
      title.style.overflow='hidden';
      title.style.textOverflow='ellipsis';
      const meta = document.createElement('div');
      const dateStr = formatDateTime(tx.createdAt,true);
      meta.className='meta';
      meta.textContent = dateStr + (tx.recurring ? ` · ${t('recurring')}` : '');
      info.appendChild(title);
      info.appendChild(meta);

      const actions = document.createElement('div');
      actions.className='actions';
      const amt = document.createElement('div');
      amt.className = tx.amountCents>0?'amount-pos':'amount-neg';
      amt.textContent = formatCurrency(Math.abs(tx.amountCents));
      const editBtn = document.createElement('button');
      editBtn.type='button';
      editBtn.className='edit-btn';
      if(tx.note){
        editBtn.classList.add('note-outline');
      }
      editBtn.setAttribute('aria-label', t('edit_transaction_aria'));
      editBtn.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z'/></svg>";
      editBtn.addEventListener('click',e=>{
        e.stopPropagation();
        startEditingTransaction(tx);
      });

      actions.appendChild(amt);
      actions.appendChild(editBtn);

      wrap.appendChild(info);
      wrap.appendChild(actions);

      if(!settings.historyLocked){
        let startX=0;
        let current=0;
        let swiping=false;
        const resetPosition = ()=>{
          wrap.style.transition='transform .25s ease';
          wrap.style.transform='translateX(0)';
        };
        wrap.addEventListener('touchstart',e=>{
          if(e.target.closest('.edit-btn')){ swiping=false; startX=0; current=0; return; }
          swiping=true;
          startX=e.touches[0].clientX;
        });
        wrap.addEventListener('touchmove',e=>{
          if(!swiping) return;
          current=e.touches[0].clientX-startX;
          if(current<0){
            wrap.style.transform=`translateX(${current}px)`;
            wrap.style.transition='none';
          }
        });
        const endSwipe = ()=>{
          if(!swiping){ startX=0; current=0; return; }
          if(current<-100){
            const confirmed = confirm(t('delete_transaction_confirm'));
            if(confirmed){
              deleteTx(tx.id);
            }
          }
          resetPosition();
          swiping=false;
          startX=0;
          current=0;
        };
        wrap.addEventListener('touchend', endSwipe);
        wrap.addEventListener('touchcancel', endSwipe);
      }

      historyList.appendChild(wrap);
    });

    if(pendingHistoryHighlightId){
      const targetId = pendingHistoryHighlightId;
      let attempt = 0;
      const maxAttempts = 8;
      const locateAndFocus = ()=>{
        const highlightEl = historyList.querySelector(`.transaction[data-id="${targetId}"]`);
        if(!highlightEl){
          if(attempt < maxAttempts){
            attempt += 1;
            setTimeout(locateAndFocus, 80);
          }
          return;
        }
        scrollHistoryCardIntoView(highlightEl);
        setTimeout(()=>{
          setHistoryCardOverlay(highlightEl);
        }, 220);
      };
      setTimeout(locateAndFocus, 60);
      pendingHistoryHighlightId = null;
    }
  }

  function renderSummaryScreen(){
    if(!summaryScreen || !historySummaryState) return;
    const { label, totalCents, count, filters, transactions } = historySummaryState;
    const excludedIds = ensureSummaryExcludedSet();
    const { averageCents } = computeSummaryAverage(transactions, excludedIds);
    if(summaryLabelEl) summaryLabelEl.textContent = label || t('all_entries');
    if(summaryNetEl) summaryNetEl.textContent = formatCurrency(totalCents);
    if(summaryCountEl) summaryCountEl.textContent = String(count);
    if(summaryAverageEl) summaryAverageEl.textContent = formatCurrency(averageCents);
    if(summaryFiltersEl){
      const filterParts = [];
      if(filters.type && filters.type !== 'all') filterParts.push(filters.type === 'income' ? t('income_only') : t('expenses_only'));
      if(filters.category) filterParts.push(`${t('filter_category_prefix')} ${filters.category}`);
      if(filters.name) filterParts.push(`${t('filter_name_prefix')} ${filters.name}`);
      if(excludedIds.size>0) filterParts.push(`${t('filter_excluded_prefix')} ${excludedIds.size}`);
      summaryFiltersEl.textContent = filterParts.length ? filterParts.join(' · ') : t('no_filters_applied');
    }
    if(summaryListEl){
      summaryListEl.innerHTML = '';
      transactions.forEach(tx=>{
        const row = document.createElement('div');
        row.className = 'summary-list-item';
        const metaWrap = document.createElement('div');
        metaWrap.className = 'text';
        const titleEl = document.createElement('div');
        titleEl.className = 'title';
        titleEl.textContent = buildEntryLabel(tx);
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = formatDateTime(tx.createdAt, true);
        metaWrap.appendChild(titleEl);
        metaWrap.appendChild(meta);
        const amount = document.createElement('div');
        amount.className = 'amount ' + (tx.amountCents>=0 ? 'amount-pos' : 'amount-neg');
        amount.textContent = formatCurrency(Math.abs(tx.amountCents));
        row.appendChild(metaWrap);
        row.appendChild(amount);
        if(excludedIds.has(tx.id)) row.classList.add('excluded');
        attachSummaryExclusionSwipe(row, tx.id);
        summaryListEl.appendChild(row);
      });
      if(transactions.length === 0){
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = t('no_transactions_in_selection');
        summaryListEl.appendChild(empty);
      }
    }
  }

  function ensureSummaryExcludedSet(){
    if(!historySummaryState) return new Set();
    if(!(historySummaryState.excludedIds instanceof Set)){
      const existing = historySummaryState.excludedIds;
      historySummaryState.excludedIds = new Set(Array.isArray(existing) ? existing : []);
    }
    return historySummaryState.excludedIds;
  }

  function computeSummaryAverage(list, excludedIds){
    if(!Array.isArray(list) || list.length===0) return { averageCents: 0, includedCount: 0 };
    const exclusionSet = excludedIds instanceof Set ? excludedIds : new Set();
    const included = exclusionSet.size ? list.filter(tx=> tx && !exclusionSet.has(tx.id)) : list;
    const includedCount = included.length;
    const totalMagnitude = included.reduce((sum, tx)=> sum + Math.abs(tx.amountCents), 0);
    const averageCents = includedCount ? Math.round(totalMagnitude / includedCount) : 0;
    return { averageCents, includedCount };
  }

  function toggleSummaryExclusion(txId){
    if(!historySummaryState || !txId) return;
    const excludedSet = ensureSummaryExcludedSet();
    if(excludedSet.has(txId)) excludedSet.delete(txId);
    else excludedSet.add(txId);
    renderSummaryScreen();
  }

  function attachSummaryExclusionSwipe(row, txId){
    if(!row || !txId) return;
    const threshold = 80;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let swiping = false;

    const resetPosition = ()=>{
      row.style.transition = 'transform .2s ease';
      row.style.transform = 'translateX(0)';
    };

    row.addEventListener('touchstart', e=>{
      if(e.touches.length !== 1) return;
      swiping = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = 0;
      row.style.transition = 'none';
    });
    row.addEventListener('touchmove', e=>{
      if(!swiping) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if(Math.abs(deltaY) > 25 && Math.abs(deltaX) < 25){
        swiping = false;
        resetPosition();
        return;
      }
      if(deltaX < 0){
        e.preventDefault();
        currentX = deltaX;
        row.style.transform = `translateX(${currentX}px)`;
      }
    });
    const finishSwipe = ()=>{
      if(!swiping) return;
      resetPosition();
      if(currentX < -threshold){
        toggleSummaryExclusion(txId);
      }
      swiping = false;
      currentX = 0;
    };
    row.addEventListener('touchend', finishSwipe);
    row.addEventListener('touchcancel', finishSwipe);
    row.addEventListener('dblclick', e=>{
      e.preventDefault();
      toggleSummaryExclusion(txId);
    });
  }

  function openSummaryScreen(){
    if(!summaryScreen || !historySummaryState) return;
    previousSummaryReturnScreen = currentScreen || 'history';
    homeScreen.classList.remove('active');
    homeScreen.hidden = true;
    historyScreen.classList.remove('active');
    historyScreen.hidden = true;
    if(graphScreen){
      graphScreen.classList.remove('active');
      graphScreen.hidden = true;
    }
    summaryScreen.hidden = false;
    summaryScreen.classList.add('active');
    currentScreen = 'summary';
    renderSummaryScreen();
    if(btnSummaryBack) btnSummaryBack.focus();
  }

  function closeSummaryScreen(){
    if(!summaryScreen) return;
    summaryScreen.classList.remove('active');
    summaryScreen.hidden = true;
    if(previousSummaryReturnScreen === 'home'){
      homeScreen.hidden = false;
      homeScreen.classList.add('active');
      historyScreen.hidden = true;
      historyScreen.classList.remove('active');
      currentScreen = 'home';
    } else if(previousSummaryReturnScreen === 'graph'){
      showGraphScreen();
    } else {
      historyScreen.hidden = false;
      historyScreen.classList.add('active');
      homeScreen.hidden = true;
      homeScreen.classList.remove('active');
      currentScreen = 'history';
      renderHistory();
    }
    syncGraphScreenVisibility();
  }


  function startEditingTransaction(tx){
    const type = tx.amountCents>=0 ? 'income' : 'expense';
    openSheet(type, tx);
  }

  function openSheet(type, existingTx=null){ 
    sheetType=type; 
    sheetMode = existingTx ? 'edit' : 'add';
    editingTransaction = existingTx;
    sheet.hidden=false; 
    if(sheetPanel){
      sheetPanel.dataset.mode = sheetMode;
    }
    if(btnMovePart){
      btnMovePart.hidden = !(sheetMode === 'edit' && !!existingTx);
    }
    closeMovePartOverlay();
    const baseDigits = existingTx ? String(Math.abs(existingTx.amountCents)) : '0';
    rawDigits.value=baseDigits; 
    updateSheetAmount(); 
    if(categoryContainer){
      categoryContainer.hidden=false;
      if(categoryInput){
        categoryInput.placeholder = sheetType==='income' ? t('income_category_placeholder') : t('expense_category_placeholder');
        categoryInput.value = existingTx && existingTx.category ? existingTx.category : '';
      }
    }
    refreshCategoryOptions();
    renderSheetSuggestions('category');
    if(nameContainer){
      nameContainer.hidden=false;
      if(nameInput){
        nameInput.value = existingTx && existingTx.name ? existingTx.name : '';
      }
    }
    refreshNameOptions();
    updateNameInputState();
    renderSheetSuggestions('name');
    if(existingTx && existingTx.note){
      noteContainer.hidden=false;
      noteInput.value=existingTx.note;
      toggleNoteBtn.hidden=true;
    } else {
      noteInput.value='';
      noteContainer.hidden=true; 
      toggleNoteBtn.hidden=false;
      toggleNoteBtn.textContent=t('add_note');
    }
    if(editDateContainer){
      if(sheetMode==='edit' && editingTransaction){
        editDateContainer.hidden=false;
        if(editDateInput) editDateInput.value = toLocalInputValue(editingTransaction.createdAt);
      } else {
        editDateContainer.hidden=true;
        if(editDateInput) editDateInput.value='';
      }
    }
    if(recurringContainer){
      if(sheetMode==='edit' && editingTransaction){
        recurringContainer.hidden=false;
        if(recurringToggle){
          recurringToggle.checked = !!(editingTransaction.recurringFrequency);
          if(recurringFrequency) recurringFrequency.hidden = !recurringToggle.checked;
        }
        if(frequencySelect && editingTransaction.recurringFrequency){
          frequencySelect.value = editingTransaction.recurringFrequency;
        } else if(frequencySelect){
          frequencySelect.value = 'monthly';
        }
      } else {
        recurringContainer.hidden=true;
        if(recurringToggle) recurringToggle.checked = false;
        if(recurringFrequency) recurringFrequency.hidden = true;
        if(frequencySelect) frequencySelect.value = 'monthly';
      }
    }
    confirmBtn.textContent = sheetMode==='edit' ? t('save_changes') : (type==='expense' ? t('add_expense') : t('add_income'));
    // update visible type label below amount
    const sheetTypeLabel = document.getElementById('sheetTypeLabel');
    if(sheetTypeLabel){
      sheetTypeLabel.textContent = type === 'expense' ? t('sheet_type_expense') : t('sheet_type_income');
      sheetTypeLabel.classList.remove('expense','income');
      sheetTypeLabel.classList.add(type === 'expense' ? 'expense' : 'income');
    }
    setTimeout(()=>rawDigits.focus(),100);
  }
  function closeSheet(){ 
    sheet.hidden=true; 
    sheetType=null; 
    sheetMode='add';
    editingTransaction=null;
    if(sheetPanel){
      delete sheetPanel.dataset.mode;
    }
    closeMovePartOverlay();
    if(confirmBtn){
      delete confirmBtn.dataset.processing;
    }
    if(categoryContainer) categoryContainer.hidden=true;
    if(categoryInput) categoryInput.value='';
    if(categorySuggestionsEl){
      categorySuggestionsEl.innerHTML='';
      categorySuggestionsEl.hidden=true;
    }
    noteContainer.hidden=true;
    noteInput.value='';
    toggleNoteBtn.hidden=false;
    toggleNoteBtn.textContent=t('add_note');
    if(nameContainer) nameContainer.hidden=true;
    if(nameInput) nameInput.value='';
    if(nameSuggestionsEl){
      nameSuggestionsEl.innerHTML='';
      nameSuggestionsEl.hidden=true;
    }
    if(editDateContainer) editDateContainer.hidden=true;
    if(editDateInput) editDateInput.value='';
    if(recurringContainer) recurringContainer.hidden=true;
    if(recurringToggle) recurringToggle.checked = false;
    if(recurringFrequency) recurringFrequency.hidden = true;
    if(frequencySelect) frequencySelect.value = 'monthly';
    rawDigits.value='0';
    confirmBtn.textContent=t('add_income');
    sheetAmountEl.textContent = formatCurrency(0);
    confirmBtn.dataset.cents = '0';
    confirmBtn.disabled = true;
    updateNameInputState();
  }

  function openSettings(){ settingsModal.hidden=false; syncSettingsUI(); }
  function closeSettings(){ settingsModal.hidden=true; }

  function openHelp(){ if(helpModal) helpModal.hidden = false; }
  function closeHelp(){ if(helpModal) helpModal.hidden = true; }

  function applyTheme(theme){
    const html = document.documentElement;
    html.classList.remove('theme-light','theme-dark');
    if(theme === 'light') html.classList.add('theme-light');
    else if(theme === 'dark') html.classList.add('theme-dark');
    // if theme is undefined/null -> fall back to system/default
  }

  function applyButtonMode(){
    const singleMode = !!settings.singleButtonMode;
    if(floatButtonsWrap) floatButtonsWrap.classList.toggle('single-mode', singleMode);
    if(btnAddIncome) btnAddIncome.hidden = singleMode;
    if(btnAddExpense){
      btnAddExpense.classList.toggle('single-button-active', singleMode);
      if(!singleMode) resetSingleButtonVisual();
    }
  }

  function syncSettingsUI(){
    // theme toggle: checked = light theme
    if(themeToggleEl) themeToggleEl.checked = settings.theme === 'light';
    if(dateFormatEl) dateFormatEl.value = settings.dateFormat || 'dmy';
    if(currencySymbolInput) currencySymbolInput.value = settings.currencySymbol || '€';
    if(languageSelectEl) languageSelectEl.value = settings.language || 'en';
    if(historyLockToggle) historyLockToggle.checked = !!settings.historyLocked;
    if(singleButtonModeToggle) singleButtonModeToggle.checked = !!settings.singleButtonMode;
    if(seasonalModeToggle) seasonalModeToggle.checked = !!settings.seasonalMode;
    if(seasonalSettingsEl) seasonalSettingsEl.classList.toggle('hidden', !settings.seasonalMode);
    normalizeCollections();
    refreshCategoryOptions();
    refreshNameOptions();
    renderFilterChips();
    applyTheme(settings.theme);
    applyButtonMode();

    // seasonal fields
    if(seasonStartEl) seasonStartEl.value = settings.seasonStart || '';
    if(seasonEndEl) seasonEndEl.value = settings.seasonEnd || '';
    validateSeasonForm();
    updateSeasonalStats();
  }

  function validateSeasonForm(){
    if(!saveSeasonBtn) return;
    const start = seasonStartEl && seasonStartEl.value ? seasonStartEl.value : null;
    const end = seasonEndEl && seasonEndEl.value ? seasonEndEl.value : null;
    let valid = !!start && !!end;
    // Validate date order if both provided
    if(valid){
      try{
        const sd = new Date(start);
        const ed = new Date(end);
        if(isFinite(sd) && isFinite(ed)){
          if(sd.getTime() > ed.getTime()) valid = false;
        }
      }catch(_){ /* ignore */ }
    }
    saveSeasonBtn.disabled = !valid;
  }

  function computeBudgetStats(txs, now){
    const startOfToday = new Date(now);
    startOfToday.setHours(0,0,0,0);
    const todayMs = startOfToday.getTime();
    
    const startOfWeek = new Date(startOfToday);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    const weekMs = startOfWeek.getTime();
    
    const startOfMonth = new Date(startOfToday);
    startOfMonth.setDate(1);
    const monthMs = startOfMonth.getTime();
    
    const today = { income: 0, expense: 0 };
    const week = { income: 0, expense: 0 };
    const month = { income: 0, expense: 0 };
    
    txs.forEach(tx => {
      const isIncome = tx.amountCents >= 0;
      const amount = Math.abs(tx.amountCents);
      
      if(tx.createdAt >= todayMs){
        if(isIncome) today.income += amount;
        else today.expense += amount;
      }
      if(tx.createdAt >= weekMs){
        if(isIncome) week.income += amount;
        else week.expense += amount;
      }
      if(tx.createdAt >= monthMs){
        if(isIncome) month.income += amount;
        else month.expense += amount;
      }
    });
    
    return { today, week, month };
  }

  function updateDashboardCard(period, label, allowance, spent){
    const card = document.querySelector(`.dashboard-card[data-period="${period}"]`);
    if(!card) return;
    const labelEl = card.querySelector('.card-label');
    if(labelEl) labelEl.textContent = label;
    
    // Remove old elements (both seasonal and budget mode)
    card.querySelectorAll('.card-allowance, .card-spent, .card-income, .card-expense, .card-period-label').forEach(el => el.remove());
    
    // Add seasonal mode elements
    const allowanceEl = document.createElement('div');
    allowanceEl.className = 'card-allowance';
    allowanceEl.textContent = allowance;
    
    const spentEl = document.createElement('div');
    spentEl.className = 'card-spent';
    spentEl.textContent = spent;
    
    if(labelEl && labelEl.nextSibling){
      labelEl.parentNode.insertBefore(allowanceEl, labelEl.nextSibling);
      labelEl.parentNode.insertBefore(spentEl, allowanceEl.nextSibling);
    } else {
      card.appendChild(allowanceEl);
      card.appendChild(spentEl);
    }
  }

  function updateDashboardCardBudgetMode(period, label, stats){
    const card = document.querySelector(`.dashboard-card[data-period="${period}"]`);
    if(!card) return;
    const labelEl = card.querySelector('.card-label');
    if(labelEl) labelEl.textContent = label;
    
    // Remove old elements
    card.querySelectorAll('.card-allowance, .card-spent, .card-income, .card-expense, .card-period-label').forEach(el => el.remove());
    
    // Add new budget mode elements
    const incomeEl = document.createElement('div');
    incomeEl.className = 'card-income';
    incomeEl.textContent = `+${formatCurrency(stats.income)}`;
    
    const expenseEl = document.createElement('div');
    expenseEl.className = 'card-expense';
    expenseEl.textContent = `-${formatCurrency(stats.expense)}`;
    
    if(labelEl && labelEl.nextSibling){
      labelEl.parentNode.insertBefore(incomeEl, labelEl.nextSibling);
      labelEl.parentNode.insertBefore(expenseEl, incomeEl.nextSibling);
    } else {
      card.appendChild(incomeEl);
      card.appendChild(expenseEl);
    }
  }

  function updateSeasonalStats(){
    if(!window.SeasonalLogic) return;
    const result = window.SeasonalLogic.computeAllowances(settings, transactions, Date.now());
    if(seasonInfoEl){
      if(!result.phase || !result.phase.hasSeason){
        seasonInfoEl.textContent = t('no_season_set');
      } else if(result.phase.isSeasonActive){
        seasonInfoEl.textContent = t('season_active_sentence');
      } else if(result.phase.isOffSeason){
        let text = t('off_season_mode');
        if(typeof result.phase.daysUntilNextSeason === 'number'){
          const days = result.phase.daysUntilNextSeason;
          text += ' ' + (days === 1 ? t('days_to_start_season_one') : tFmt('days_to_start_season_many', { days }));
        }
        seasonInfoEl.textContent = text;
      } else {
        seasonInfoEl.textContent = '';
      }
    }
    if(allowanceInfoEl){
      if(result.phase && result.phase.isOffSeason){
        const d = formatCurrency(result.dailyAllowance || 0);
        const w = formatCurrency(result.weeklyAllowance || 0);
        const m = formatCurrency(result.monthlyAllowance || 0);
        allowanceInfoEl.textContent = tFmt('allowance_dwm', { d, w, m });
      } else {
        allowanceInfoEl.textContent = '';
      }
    }

    // Dashboard grid (D/W/M)
    if(dashboardGridEl){
      if(settings.seasonalMode && window.SeasonalLogic){
        // Seasonal mode: show allowances and spent
        const spent = window.SeasonalLogic.computeSpent(transactions, Date.now());
        if(result.phase && result.phase.hasSeason && result.phase.isOffSeason){
          updateDashboardCard('day', t('daily'), formatCurrency(result.dailyAllowance || 0), formatCurrency(spent.dailySpent || 0));
          updateDashboardCard('week', t('weekly'), formatCurrency(result.weeklyAllowance || 0), formatCurrency(spent.weeklySpent || 0));
          updateDashboardCard('month', t('monthly'), formatCurrency(result.monthlyAllowance || 0), formatCurrency(spent.monthlySpent || 0));
          dashboardGridEl.hidden = false;
        } else {
          dashboardGridEl.hidden = true;
        }
      } else {
        // Budget mode: show Today/This Week/This Month income & expenses
        const budget = computeBudgetStats(transactions, Date.now());
        updateDashboardCardBudgetMode('day', t('today'), budget.today);
        updateDashboardCardBudgetMode('week', t('this_week'), budget.week);
        updateDashboardCardBudgetMode('month', t('this_month'), budget.month);
        dashboardGridEl.hidden = false;
      }
    }

    if(seasonBadgeEl){
      if(!settings.seasonalMode){
        seasonBadgeEl.textContent = t('budget_mode');
        seasonBadgeEl.hidden = false;
      } else if(settings.seasonalMode && result.phase && result.phase.isOffSeason){
        seasonBadgeEl.textContent = t('off_season');
        seasonBadgeEl.hidden = false;
      } else if(settings.seasonalMode && result.phase && result.phase.isSeasonActive){
        seasonBadgeEl.textContent = t('season_active');
        seasonBadgeEl.hidden = false;
      } else {
        seasonBadgeEl.hidden = true;
      }
    }
  }

  function applyRecurringIfNeeded(){
    if(!settings.recurringEnabled || settings.recurringAmountCents<=0) return;
    const key = monthKey();
    if(settings.lastRecurringAppliedMonth === key) return;
      addTransaction(settings.recurringAmountCents,'Recurring Income',true,'Recurring Income','income','Recurring')
        .then(()=> Promise.all([
          ensureCollectionEntry('income','categories','Recurring'),
          ensureCollectionEntry('income','names','Recurring Income')
        ]))
        .then(()=>{ settings.lastRecurringAppliedMonth = key; dbSaveSettings(settings); });
  }

  function updateSheetAmount(){
    const digits = rawDigits.value.replace(/\D/g,'') || '0';
    const cents = parseInt(digits,10);
    sheetAmountEl.textContent = formatCurrency(cents);
    updateConfirmState();
  }
  function updateNameInputState(){
    if(!nameInput) return;
    const hasCategory = categoryInput && categoryInput.value.trim().length>0;
    nameInput.disabled = !hasCategory;
    if(!hasCategory) nameInput.value='';
    renderSheetSuggestions('name');
    updateConfirmState();
  }
  function updateConfirmState(){
    const digits = rawDigits.value.replace(/\D/g,'') || '0';
    const cents = parseInt(digits,10);
    let ready = cents>0;
    if(sheetType){
      const hasCategory = categoryInput && categoryInput.value.trim().length>0;
      ready = ready && hasCategory;
      const hasName = nameInput && !nameInput.disabled && nameInput.value.trim().length>0;
      ready = ready && hasName;
    }
    confirmBtn.disabled = !ready;
    confirmBtn.dataset.cents = cents;
  }

  function addTransaction(amountCents,note,recurring,name,typeOverride,category){
    const txType = typeOverride || sheetType;
    if(!txType) return Promise.resolve();
    const signed = txType==='expense'? -Math.abs(amountCents) : Math.abs(amountCents);
    const t = { id: generateId(), amountCents:signed, createdAt:Date.now(), recurring:!!recurring };
    if(note){ t.note = note; }
    if(name){ t.name = name; }
    if(category){ t.category = category; }
    return dbAddTransaction(t).then(()=>{ 
      transactions.unshift(t); 
      updateBalance(); 
      renderRecent();
      if(!historyScreen.hidden) renderHistory(); 
      updateSeasonalStats();
      refreshGraphIfVisible();
      scheduleLocalBackup('add-transaction');
    }).catch(err=>{
      console.error('Error adding transaction:', err);
    });
  }

  function saveEditedTransaction(amountCents,note,newTimestamp,name,category,recurringFreq){
    if(!editingTransaction || !sheetType) return Promise.resolve();
    const signed = sheetType==='expense'? -Math.abs(amountCents) : Math.abs(amountCents);
    const updated = { ...editingTransaction, amountCents:signed };
    if(note){
      updated.note = note;
    } else {
      delete updated.note;
    }
    if(name){
      updated.name = name;
    } else {
      delete updated.name;
    }
    if(category){
      updated.category = category;
    } else {
      delete updated.category;
    }
    if(typeof newTimestamp === 'number' && Number.isFinite(newTimestamp)){
      updated.createdAt = newTimestamp;
    }
    if(recurringFreq){
      updated.recurringFrequency = recurringFreq;
    } else {
      delete updated.recurringFrequency;
    }
    return dbAddTransaction(updated).then(()=>{
      const idx = transactions.findIndex(t=>t.id===updated.id);
      if(idx>-1){
        transactions[idx] = updated;
      } else {
        transactions.unshift(updated);
      }
      transactions.sort((a,b)=>b.createdAt - a.createdAt);
      updateBalance();
      renderRecent();
      if(!historyScreen.hidden) renderHistory();
      updateSeasonalStats();
      refreshGraphIfVisible();
      scheduleLocalBackup('edit-transaction');
    }).catch(err=>{
      console.error('Error updating transaction:', err);
    });
  }

  function deleteTx(id){
    return dbDeleteTransaction(id).then(()=>{
      transactions = transactions.filter(t=>t.id!==id);
      updateBalance();
      renderHistory();
      renderRecent();
      updateSeasonalStats();
      refreshGraphIfVisible();
      scheduleLocalBackup('delete-transaction');
    });
  }

  function resetSingleButtonVisual(){
    if(!btnAddExpense) return;
    btnAddExpense.classList.add('expense');
    btnAddExpense.classList.remove('income');
    btnAddExpense.classList.remove('holding-income');
  }

  function handleSingleButtonPointerDown(evt){
    if(!btnAddExpense || !settings.singleButtonMode) return;
    evt.preventDefault();
    singleButtonLongPressTriggered = false;
    btnAddExpense.classList.add('holding-income');
    if(singleButtonHoldTimer) clearTimeout(singleButtonHoldTimer);
    singleButtonHoldTimer = setTimeout(()=>{
      singleButtonHoldTimer = null;
      singleButtonLongPressTriggered = true;
      btnAddExpense.classList.remove('holding-income');
      btnAddExpense.classList.remove('expense');
      btnAddExpense.classList.add('income');
      openSheet('income');
    }, SINGLE_BUTTON_HOLD_MS);
  }

  function handleSingleButtonPointerEnd(triggerExpense){
    if(!btnAddExpense || !settings.singleButtonMode) return;
    btnAddExpense.classList.remove('holding-income');
    if(singleButtonHoldTimer){
      clearTimeout(singleButtonHoldTimer);
      singleButtonHoldTimer = null;
    }
    if(triggerExpense && !singleButtonLongPressTriggered){
      openSheet('expense');
    }
    resetSingleButtonVisual();
    singleButtonLongPressTriggered = false;
  }

  // Event bindings
  if(btnAddIncome) btnAddIncome.addEventListener('click',()=>openSheet('income'));
  if(btnAddExpense){
    btnAddExpense.addEventListener('click',e=>{
      if(settings.singleButtonMode){
        e.preventDefault();
        return;
      }
      openSheet('expense');
    });
    btnAddExpense.addEventListener('pointerdown', handleSingleButtonPointerDown);
    btnAddExpense.addEventListener('pointerup', ()=> handleSingleButtonPointerEnd(true));
    btnAddExpense.addEventListener('pointerleave', ()=> handleSingleButtonPointerEnd(false));
    btnAddExpense.addEventListener('pointercancel', ()=> handleSingleButtonPointerEnd(false));
  }
  document.querySelectorAll('[data-dismiss]').forEach(el=> el.addEventListener('click',()=>{ if(el.closest('#sheet')) closeSheet(); if(el.closest('#settingsModal')) closeSettings(); if(el.closest('#helpModal')) closeHelp(); }));
  $('#btnSettings').addEventListener('click',openSettings);
  const btnHelpManual = $('#btnHelpManual');
  if(btnHelpManual) btnHelpManual.addEventListener('click', ()=>{ openHelp(); });
  if(btnSummaryBack) btnSummaryBack.addEventListener('click', closeSummaryScreen);
  $('#btnHistory').addEventListener('click',()=>{ 
    historyFilter = null; // clear filter
    homeScreen.classList.remove('active'); 
    homeScreen.hidden=true; 
    historyScreen.hidden=false; 
    historyScreen.classList.add('active'); 
    currentScreen = 'history';
    renderHistory(); 
    syncGraphScreenVisibility();
  });
  $('#btnHome').addEventListener('click',()=>{ 
    historyScreen.classList.remove('active'); 
    historyScreen.hidden=true; 
    homeScreen.hidden=false; 
    homeScreen.classList.add('active'); 
    currentScreen = 'home';
    renderRecent();
    syncGraphScreenVisibility();
  });
  if(historyGroupSummaryEl){
    const beginSummaryPress = ()=>{
      if(summaryPressTimer || !historySummaryState) return;
      summaryPressTimer = setTimeout(()=>{
        summaryPressTimer = null;
        openSummaryScreen();
      }, 2000);
    };
    const cancelSummaryPress = ()=>{
      if(summaryPressTimer){
        clearTimeout(summaryPressTimer);
        summaryPressTimer = null;
      }
    };
    historyGroupSummaryEl.addEventListener('pointerdown', beginSummaryPress);
    historyGroupSummaryEl.addEventListener('pointerup', cancelSummaryPress);
    historyGroupSummaryEl.addEventListener('pointerleave', cancelSummaryPress);
    historyGroupSummaryEl.addEventListener('pointercancel', cancelSummaryPress);
  }
  toggleNoteBtn.addEventListener('click',()=>{
    if(noteContainer.hidden){
      noteContainer.hidden=false;
      toggleNoteBtn.hidden=true;
      noteInput.focus();
    }
  });

  if(btnMovePart){
    btnMovePart.addEventListener('click', ()=>{
      openMovePartOverlay();
    });
  }
  if(movePartBackBtn){
    movePartBackBtn.addEventListener('click', ()=>{
      closeMovePartOverlay();
    });
  }
  if(movePartSheetAmountEl && movePartRawDigits){
    movePartSheetAmountEl.addEventListener('click', ()=>{
      movePartRawDigits.focus();
      movePartRawDigits.select && movePartRawDigits.select();
    });
  }
  if(movePartRawDigits){
    movePartRawDigits.addEventListener('keydown', e=>{
      if(e.key==='Backspace'){
        e.preventDefault();
        const v = movePartRawDigits.value.replace(/\D/g,'');
        movePartRawDigits.value = v.length<=1 ? '0' : v.slice(0,-1);
        updateMovePartAmount();
        return;
      }
      if(/^\d$/.test(e.key)){
        e.preventDefault();
        const v = movePartRawDigits.value.replace(/\D/g,'') || '0';
        movePartRawDigits.value = v==='0' ? e.key : v + e.key;
        updateMovePartAmount();
        return;
      }
      if(e.key==='Enter'){
        e.preventDefault();
      }
    });
    movePartRawDigits.addEventListener('input', updateMovePartAmount);
  }
  if(movePartCategoryInput){
    movePartCategoryInput.addEventListener('input', ()=>{
      updateMovePartNameInputState();
      renderMovePartSuggestions('category');
      renderMovePartSuggestions('name');
    });
  }
  if(movePartNameInput){
    movePartNameInput.addEventListener('input', ()=>{
      renderMovePartSuggestions('name');
      updateMovePartConfirmState();
    });
  }
  function handleMovePartSuggestionClick(e){
    const btn = e.target.closest('.suggestion-chip');
    if(!btn) return;
    const kind = btn.dataset.kind;
    const value = btn.dataset.value || '';
    const targetInput = kind === 'category' ? movePartCategoryInput : movePartNameInput;
    if(!targetInput) return;
    if(kind === 'name' && targetInput.disabled) return;
    targetInput.value = value;
    targetInput.dispatchEvent(new Event('input', { bubbles:true }));
    targetInput.focus();
  }
  if(movePartCategorySuggestionsEl) movePartCategorySuggestionsEl.addEventListener('click', handleMovePartSuggestionClick);
  if(movePartNameSuggestionsEl) movePartNameSuggestionsEl.addEventListener('click', handleMovePartSuggestionClick);

  async function handleMovePartConfirm(){
    if(!movePartConfirmBtn || movePartConfirmBtn.disabled) return;
    if(sheetMode !== 'edit' || !editingTransaction || !sheetType) return;

    const moveCents = parseInt(movePartConfirmBtn.dataset.cents || '0', 10);
    const categoryValue = movePartCategoryInput ? movePartCategoryInput.value.trim() : '';
    const nameValue = movePartNameInput && !movePartNameInput.disabled ? movePartNameInput.value.trim() : '';
    if(!moveCents || moveCents <= 0 || !categoryValue || !nameValue){
      return;
    }

    const sourceAbs = Math.abs(editingTransaction.amountCents);
    if(moveCents > sourceAbs){
      alert(t('amount_move_exceeds'));
      return;
    }

    // Prevent creating a negative remainder. If equal, we delete the source tx.
    const remainderAbs = sourceAbs - moveCents;
    if(remainderAbs < 0){
      alert(t('invalid_amount'));
      return;
    }

    movePartConfirmBtn.disabled = true;
    const sign = editingTransaction.amountCents >= 0 ? 1 : -1;
    const newTx = {
      id: generateId(),
      amountCents: sign * moveCents,
      createdAt: editingTransaction.createdAt,
      category: categoryValue,
      name: nameValue
    };

    try{
      await dbAddTransaction(newTx);
      await Promise.all([
        ensureCollectionEntry(sheetType,'categories', categoryValue),
        ensureCollectionEntry(sheetType,'names', nameValue)
      ]);

      if(remainderAbs === 0){
        await dbDeleteTransaction(editingTransaction.id);
        transactions = transactions.filter(t=> t.id !== editingTransaction.id);
        transactions.unshift(newTx);
        updateBalance();
        renderRecent();
        if(!historyScreen.hidden) renderHistory();
        updateSeasonalStats();
        refreshGraphIfVisible();
        scheduleLocalBackup('move-part-transfer');
        closeMovePartOverlay();
        closeSheet();
        return;
      }

      const updatedSource = { ...editingTransaction, amountCents: sign * remainderAbs };
      await dbAddTransaction(updatedSource);

      const idx = transactions.findIndex(t=> t.id === updatedSource.id);
      if(idx !== -1) transactions[idx] = updatedSource;
      transactions.unshift(newTx);
      transactions.sort((a,b)=>b.createdAt - a.createdAt);

      editingTransaction = updatedSource;
      rawDigits.value = String(remainderAbs);
      updateSheetAmount();

      updateBalance();
      renderRecent();
      if(!historyScreen.hidden) renderHistory();
      updateSeasonalStats();
      refreshGraphIfVisible();
      scheduleLocalBackup('move-part-transfer');

      closeMovePartOverlay();
    }catch(err){
      console.error('Move-part transfer failed', err);
      alert(t('transfer_failed'));
      movePartConfirmBtn.disabled = false;
    }
  }

  if(movePartConfirmBtn){
    movePartConfirmBtn.addEventListener('click', handleMovePartConfirm);
  }
  if(recurringToggle && recurringFrequency){
    recurringToggle.addEventListener('change',()=>{
      recurringFrequency.hidden = !recurringToggle.checked;
    });
  }
  rawDigits.addEventListener('keydown',e=>{ if(e.key==='Backspace'){ e.preventDefault(); const v=rawDigits.value.replace(/\D/g,''); rawDigits.value = v.length<=1?'0':v.slice(0,-1); updateSheetAmount(); return; } if(/^\d$/.test(e.key)){ e.preventDefault(); const v=rawDigits.value==='0'? e.key : rawDigits.value+e.key; rawDigits.value=v; updateSheetAmount(); return; } if(e.key==='Enter'){ e.preventDefault(); } });
  rawDigits.addEventListener('input',updateSheetAmount);
  sheetAmountEl.addEventListener('click',()=>{ rawDigits.focus(); rawDigits.select && rawDigits.select(); });
  if(categoryInput){
    categoryInput.addEventListener('input',()=>{
      updateNameInputState();
      refreshNameOptions();
      renderSheetSuggestions('category');
      renderSheetSuggestions('name');
    });
  }
  if(nameInput){
    nameInput.addEventListener('input',()=>{
      renderSheetSuggestions('name');
      updateConfirmState();
    });
  }
  if(historyChipSearchInput){
    historyChipSearchInput.addEventListener('input', ()=>{
      historyChipSearchText = historyChipSearchInput.value || '';
      renderFilterChips();
    });
  }
  if(historyTypeFiltersEl){
    historyTypeFiltersEl.addEventListener('click',e=>{
      const btn = e.target.closest('.type-pill');
      if(!btn) return;
      const nextType = btn.dataset.type || 'all';
      if(nextType === historyTypeFilter) return;
      historyTypeFilter = nextType;
      historyCategoryFilter = null;
      historyNameFilter = null;
      refreshCategoryOptions();
      refreshNameOptions();
      renderFilterChips();
      renderHistory();
    });
  }
  function handleChipRowClick(e){
    const chip = e.target.closest('.chip');
    if(!chip) return;
    if(chip.dataset.skipNextClick === '1'){
      chip.dataset.skipNextClick = '0';
      return;
    }
    const kind = chip.dataset.kind;
    if(!kind) return;
    const nextValue = chip.dataset.value ? chip.dataset.value : null;
    if(kind==='category'){
      if(historyCategoryFilter === nextValue) return;
      historyCategoryFilter = nextValue;
    } else if(kind==='name'){
      if(historyNameFilter === nextValue) return;
      historyNameFilter = nextValue;
    } else {
      return;
    }
    // If the user was searching chips, clear the search after selecting one so
    // the full chip lists come back (and names can reveal for the chosen category).
    if(historyChipSearchInput && historyChipSearchInput.value){
      historyChipSearchInput.value = '';
      historyChipSearchText = '';
    }
    renderFilterChips();
    renderHistory();
  }
  if(categoryChipRow) categoryChipRow.addEventListener('click',handleChipRowClick);
  if(nameChipRow) nameChipRow.addEventListener('click',handleChipRowClick);
  attachLongPressHandlers(categoryChipRow,'.chip', handleGroupLongPress, GROUP_DELETE_LONG_PRESS_MS);
  attachLongPressHandlers(nameChipRow,'.chip', handleGroupLongPress, GROUP_DELETE_LONG_PRESS_MS);
  attachLongPressHandlers(recentListEl,'.recent-item', handleRecentCardLongPress);
  function handleSuggestionClick(e){
    const btn = e.target.closest('.suggestion-chip');
    if(!btn) return;
    if(btn.dataset.skipNextClick === '1'){
      btn.dataset.skipNextClick = '0';
      return;
    }
    const kind = btn.dataset.kind;
    const value = btn.dataset.value || '';
    if(kind==='name' && nameInput && nameInput.disabled) return;
    const targetInput = kind==='category' ? categoryInput : nameInput;
    if(!targetInput) return;
    targetInput.value = value;
    targetInput.dispatchEvent(new Event('input', { bubbles:true }));
    targetInput.focus();
  }
  if(categorySuggestionsEl) categorySuggestionsEl.addEventListener('click',handleSuggestionClick);
  if(nameSuggestionsEl) nameSuggestionsEl.addEventListener('click',handleSuggestionClick);
  attachLongPressHandlers(categorySuggestionsEl,'.suggestion-chip', handleGroupLongPress, GROUP_DELETE_LONG_PRESS_MS);
  attachLongPressHandlers(nameSuggestionsEl,'.suggestion-chip', handleGroupLongPress, GROUP_DELETE_LONG_PRESS_MS);
  if(graphTypeFiltersEl){
    graphTypeFiltersEl.addEventListener('click',e=>{
      const btn = e.target.closest('.graph-type-pill');
      if(!btn) return;
      const next = btn.dataset.graphType || 'expense';
      if(next === graphType) return;
      graphType = next;
      updateGraphTypeButtons();
      renderGraph();
    });
  }
  graphGroupInputs.forEach(input=>{
    input.addEventListener('change',()=>{
      if(!input.checked) return;
      graphGrouping = input.value === 'name' ? 'name' : 'category';
      renderGraph();
    });
  });
  if(btnGraphTimeline){
    btnGraphTimeline.addEventListener('click',()=>{
      const nextMode = graphMode === 'timeline' ? 'classic' : 'timeline';
      setGraphMode(nextMode);
    });
  }
  if(btnTimelineCursorToggle){
    btnTimelineCursorToggle.addEventListener('click',()=>{
      timelineCursorEnabled = !timelineCursorEnabled;
      btnTimelineCursorToggle.classList.toggle('active', timelineCursorEnabled);
      btnTimelineCursorToggle.setAttribute('aria-pressed', timelineCursorEnabled ? 'true' : 'false');
      if(!timelineCursorEnabled){
        hideTimelineCursorUI();
      } else if(timelineSeriesData && timelineSeriesData.labels.length){
        if(typeof timelineCursorIndex !== 'number' || timelineCursorIndex < 0){
          timelineCursorIndex = timelineSeriesData.labels.length - 1;
        }
        refreshTimelineCursorUI();
      }
    });
  }
  if(timelineCanvas){
    timelineCanvas.addEventListener('pointerdown', handleTimelinePointerDown);
    timelineCanvas.addEventListener('pointermove', handleTimelinePointerMove);
  }
  if(timelinePopupListEl){
    timelinePopupListEl.addEventListener('scroll', updateTimelineScrollArrows);
  }
  function handleGraphRangePreset(key){
    const next = computeGraphPresetRange(key);
    graphDateRange = next || { type:'all', start:null, end:null };
    hideGraphRangeMenu();
    updateGraphRangeLabel();
    refreshGraphIfVisible();
  }
  function handleGraphRangeCustom(){
    if(!graphRangeStartInput || !graphRangeEndInput) return;
    const startVal = graphRangeStartInput.value;
    const endVal = graphRangeEndInput.value;
    if(!startVal || !endVal) return;
    const startDate = new Date(startVal);
    const endDate = new Date(endVal);
    if(Number.isNaN(startDate) || Number.isNaN(endDate)) return;
    const startTs = startOfDayTs(startDate.getTime());
    const endTs = endOfDayTs(endDate.getTime());
    if(startTs > endTs) return;
    graphDateRange = { type:'custom', start:startTs, end:endTs };
    hideGraphRangeMenu();
    updateGraphRangeLabel();
    refreshGraphIfVisible();
  }
  function handleGraphRangeMenuClick(evt){
    const presetBtn = evt.target.closest('button[data-range]');
    if(presetBtn){
      handleGraphRangePreset(presetBtn.dataset.range);
      evt.stopPropagation();
      return;
    }
    const clearBtn = evt.target.closest('#graphRangeClear');
    if(clearBtn){
      graphDateRange = { type:'all', start:null, end:null };
      hideGraphRangeMenu();
      updateGraphRangeLabel();
      refreshGraphIfVisible();
      evt.stopPropagation();
      return;
    }
  }
  if(graphRangeMenu){
    graphRangeMenu.addEventListener('click', evt=>{
      handleGraphRangeMenuClick(evt);
      evt.stopPropagation();
    });
  }
  if(graphRangeApplyBtn){
    graphRangeApplyBtn.addEventListener('click', evt=>{
      handleGraphRangeCustom();
      evt.stopPropagation();
    });
  }
  if(graphRangeBtn){
    graphRangeBtn.addEventListener('click',()=>{
      if(!graphRangeMenu) return;
      if(graphRangeMenu.hidden) showGraphRangeMenu();
      else hideGraphRangeMenu();
    });
  }
  document.addEventListener('pointerdown', evt=>{
    try{
      console.debug && console.debug('[ftm] document.pointerdown target:', evt.target && (evt.target.tagName || evt.target.className));
    }catch(e){}
    if(!graphRangeMenu || graphRangeMenu.hidden) return;
    if(graphRangeMenu.contains(evt.target) || (graphRangeBtn && graphRangeBtn.contains(evt.target))) return;
    hideGraphRangeMenu();
  });
  if(graphRangeMenu){ graphRangeMenu.hidden = true; graphRangeMenu.style.display = 'none'; }
  if(graphRangeBtn){ graphRangeBtn.textContent = `${t('time_range_prefix')} ${t('all_time')}`; graphRangeBtn.setAttribute('aria-expanded','false'); }
  if(graphLegendEl){
    graphLegendEl.addEventListener('scroll', updateGraphLegendScrollIndicators);
  }
  window.addEventListener('pointerup', handleTimelinePointerUp);
  window.addEventListener('pointercancel', handleTimelinePointerUp);
  function handleConfirm(e){
    if(e) e.preventDefault();
    if(confirmBtn.disabled) return;
    // Guard against double-invoke (click + touchend). Use a short-lived processing flag.
    if(confirmBtn.dataset.processing === '1') return;
    confirmBtn.dataset.processing = '1';
    confirmBtn.disabled = true;
    const cents=parseInt(confirmBtn.dataset.cents||'0',10); 
    if(cents>0){ 
      const noteValue = noteInput.value.trim();
      const cleanedNote = noteValue.length ? noteValue : undefined;
      const categoryValue = categoryInput ? categoryInput.value.trim() : '';
      let nameValue;
      if(nameInput && !nameInput.disabled){
        const trimmed = nameInput.value.trim();
        nameValue = trimmed.length ? trimmed : undefined;
      }
      let overrideDate = null;
      if(sheetMode==='edit' && editDateInput){
        overrideDate = parseLocalInputValue(editDateInput.value);
      }
      let recurringFreq = null;
      if(sheetMode==='edit' && recurringToggle && recurringToggle.checked && frequencySelect){
        recurringFreq = frequencySelect.value;
      }
      const isIncomeEntry = sheetType === 'income';
      const action = sheetMode==='edit'
        ? saveEditedTransaction(cents, cleanedNote, overrideDate, nameValue, categoryValue, recurringFreq)
        : addTransaction(cents,cleanedNote,false,nameValue, null, categoryValue);
      action
        .then(()=>{
          const promises = [];
          if(categoryValue) promises.push(ensureCollectionEntry(sheetType,'categories',categoryValue));
          if(nameValue) promises.push(ensureCollectionEntry(sheetType,'names',nameValue));
          return Promise.all(promises);
        })
        .then(()=> closeSheet())
        .finally(()=>{
          // Clear the processing flag after the DB work completes
          confirmBtn.dataset.processing = '0';
          // keep disabled until sheet resets/updateSheetAmount runs
          confirmBtn.disabled = true;
        }); 
    }
  }
  confirmBtn.addEventListener('click',handleConfirm);
  confirmBtn.addEventListener('touchend',handleConfirm);

  if(themeToggleEl){
    themeToggleEl.addEventListener('change',()=>{
      settings.theme = themeToggleEl.checked ? 'light' : 'dark';
      dbSaveSettings(settings).then(()=> applyTheme(settings.theme));
    });
  }

  if(singleButtonModeToggle){
    singleButtonModeToggle.addEventListener('change',()=>{
      settings.singleButtonMode = singleButtonModeToggle.checked;
      applyButtonMode();
      dbSaveSettings(settings);
    });
  }

  if(seasonalModeToggle){
    seasonalModeToggle.addEventListener('change',()=>{
      settings.seasonalMode = seasonalModeToggle.checked;
      if(seasonalSettingsEl) seasonalSettingsEl.classList.toggle('hidden', !settings.seasonalMode);
      dbSaveSettings(settings).then(()=> updateSeasonalStats());
    });
  }

  if(dateFormatEl){
    dateFormatEl.addEventListener('change',()=>{
      settings.dateFormat = dateFormatEl.value || 'dmy';
      dbSaveSettings(settings).then(()=>{
        renderRecent();
        if(!historyScreen.hidden) renderHistory();
      });
    });
  }
  if(currencySymbolInput){
    const clampSymbolInput = ()=>{
      if(currencySymbolInput.value.length>3){
        currencySymbolInput.value = currencySymbolInput.value.slice(0,3);
      }
    };
    currencySymbolInput.addEventListener('input', clampSymbolInput);
    const commitCurrencySymbol = ()=>{
      clampSymbolInput();
      let value = currencySymbolInput.value.trim();
      if(!value) value = '€';
      currencySymbolInput.value = value;
      settings.currencySymbol = value;
      dbSaveSettings(settings).then(()=>{
        updateBalance();
        if(sheetAmountEl && confirmBtn && typeof confirmBtn.dataset.cents !== 'undefined'){
          const currentCents = parseInt(confirmBtn.dataset.cents || '0',10);
          sheetAmountEl.textContent = formatCurrency(currentCents);
        }
        renderRecent();
        if(!historyScreen.hidden) renderHistory();
        updateSeasonalStats();
      });
    };
    currencySymbolInput.addEventListener('blur', commitCurrencySymbol);
    currencySymbolInput.addEventListener('change', commitCurrencySymbol);
  }

  if(languageSelectEl){
    languageSelectEl.addEventListener('change', ()=>{
      setLanguage(languageSelectEl.value, true);
    });
  }
  if(historyLockToggle){
    historyLockToggle.addEventListener('change',()=>{
      settings.historyLocked = historyLockToggle.checked;
      dbSaveSettings(settings).then(()=>{
        renderHistory();
      });
    });
  }
  if(btnExportShare){
    btnExportShare.addEventListener('click',()=> handleExportShare());
  }
  if(btnImportData && importFileInput){
    btnImportData.addEventListener('click',()=>{
      importFileInput.value='';
      importFileInput.click();
    });
    importFileInput.addEventListener('change',()=>{
      const file = importFileInput.files && importFileInput.files[0];
      if(!file) return;
      const reader = new FileReader();
      btnImportData.disabled = true;
      reader.onload = async ()=>{
        try{
          const text = typeof reader.result === 'string' ? reader.result : '';
          const { importedTxs, importedSettings } = parseBackupText(text);
          const proceed = confirm(t('import_replace_confirm'));
          if(!proceed) return;
          await applyImportedData(importedTxs, importedSettings);
          alert(t('backup_imported_success'));
        }catch(err){
          console.error('Import error', err);
          alert(t('backup_import_failed'));
        } finally {
          btnImportData.disabled = false;
          importFileInput.value='';
        }
      };
      reader.onerror = ()=>{
        btnImportData.disabled = false;
        importFileInput.value='';
        alert(t('unable_read_file'));
      };
      reader.readAsText(file);
    });
  }

  // Dashboard card clicks to filter history
  document.querySelectorAll('.dashboard-card').forEach(card=>{
    card.addEventListener('click',()=>{
      const period = card.dataset.period;
      historyFilter = period; // 'day', 'week', or 'month'
      homeScreen.classList.remove('active');
      homeScreen.hidden = true;
      historyScreen.hidden = false;
      historyScreen.classList.add('active');
      currentScreen = 'history';
      renderHistory();
      syncGraphScreenVisibility();
    });
  });

  // Seasonal Budget handlers
  if(seasonStartEl) seasonStartEl.addEventListener('change', ()=>{ validateSeasonForm(); settings.seasonStart = seasonStartEl.value || null; dbSaveSettings(settings).then(updateSeasonalStats); });
  if(seasonEndEl) seasonEndEl.addEventListener('change', ()=>{ validateSeasonForm(); settings.seasonEnd = seasonEndEl.value || null; dbSaveSettings(settings).then(updateSeasonalStats); });
  if(saveSeasonBtn) saveSeasonBtn.addEventListener('click',()=>{
    const start = seasonStartEl && seasonStartEl.value ? seasonStartEl.value : null;
    const end = seasonEndEl && seasonEndEl.value ? seasonEndEl.value : null;
    if(!start || !end) return; // guard
    const sd = new Date(start); const ed = new Date(end);
    if(sd.getTime() > ed.getTime()) return; // invalid order
    settings.seasonStart = start;
    settings.seasonEnd = end;
    dbSaveSettings(settings).then(()=>{
      syncSettingsUI(); updateSeasonalStats();
    });
  });

  btnClearAll.addEventListener('click',()=>{
    const confirmed = confirm(t('clear_all_confirm'));
    if(!confirmed) return;
    const delPromises = transactions.map(t=>dbDeleteTransaction(t.id));
    Promise.all(delPromises).then(()=>{
      transactions = [];
      settings = {
        recurringEnabled:false,
        recurringAmountCents:0,
        lastRecurringAppliedMonth:null,
        theme: 'light',
        seasonalMode: false,
        seasonStart:null,
        seasonEnd:null,
        seasonIncomeCents:0,
        dateFormat:'dmy',
        currencySymbol:'€',
        historyLocked:true,
        singleButtonMode:false,
        incomeCategories: [],
        expenseCategories: [],
        incomeNames: [],
        expenseNames: [],
        graphExclusions: {
          income: { category: [], name: [] },
          expense: { category: [], name: [] }
        }
      };
      dbSaveSettings(settings).then(()=>{
        updateBalance();
        renderHistory();
        syncSettingsUI();
        updateSeasonalStats();
        closeSettings();
        scheduleLocalBackup('clear-data');
        refreshGraphIfVisible();
      });
    }).catch(err=>{
      console.error('Error clearing data', err);
    });
  });

  // Handle escape key for modals
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(!sheet.hidden) closeSheet();
      if(!settingsModal.hidden) closeSettings();
      if(helpModal && !helpModal.hidden) closeHelp();
      if(summaryScreen && !summaryScreen.hidden) closeSummaryScreen();
    }
  });
  document.addEventListener('pointerdown', handleGlobalLegendPointerDown);

  const warmBackup = readLocalBackup();
  if(warmBackup){
    applyBackupSnapshot(warmBackup);
  } else {
    renderRecent();
  }

  // Init
  openDB().then(d=>{ db=d; return Promise.all([dbGetAllTransactions(), dbGetSettings()]); })
    .then(([txs,s])=>{
      transactions=txs;
      settings={...settings,...s};
      setLanguage(settings.language || 'en', false);
      updateBalance();
      applyRecurringIfNeeded();
      syncSettingsUI();
      updateSeasonalStats();
      refreshGraphIfVisible();
    })
    .then(()=> scheduleLocalBackup('db-init'))
    .catch(err=>{
      console.error('DB init error', err);
      if(!warmBackup){
        updateBalance();
        renderRecent();
        syncSettingsUI();
      }
    });

  function registerServiceWorker(){
    if(!('serviceWorker' in navigator)) return;
    const monitorInstalling = worker=>{
      if(!worker) return;
      worker.addEventListener('statechange', ()=>{
        if(worker.state === 'installed' && navigator.serviceWorker.controller){
          flushLocalBackup('sw-update-install');
          try{ localStorage.setItem(UPDATE_FLAG_KEY,'1'); }catch(_){ /* ignore */ }
          try{ worker.postMessage({ type:'SKIP_WAITING' }); }catch(_){ /* ignore */ }
          window.dispatchEvent(new CustomEvent('ftm:update-ready'));
        }
      });
    };
    navigator.serviceWorker.register('sw.js').then(reg=>{
      if(reg.installing) monitorInstalling(reg.installing);
      reg.addEventListener('updatefound', ()=> monitorInstalling(reg.installing));
    }).catch(err=> console.error('SW registration failed', err));

    navigator.serviceWorker.addEventListener('controllerchange', ()=>{
      let hadFlag = false;
      try{
        hadFlag = localStorage.getItem(UPDATE_FLAG_KEY) === '1';
        if(hadFlag) localStorage.removeItem(UPDATE_FLAG_KEY);
      }catch(_){ /* ignore */ }
      if(hadFlag){
        flushLocalBackup('sw-controller-change');
        setTimeout(()=> window.location.reload(), 80);
      }
    });
  }
  registerServiceWorker();

  setInterval(()=> updateSeasonalStats(), 30 * 60 * 1000);

  window.addEventListener('beforeunload', ()=> flushLocalBackup('beforeunload'));
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'hidden') flushLocalBackup('visibility-hidden');
  });

  // Prevent quick double-tap from triggering zoom on some mobile browsers.
  // This is a small, focused guard that cancels the second tap within 300ms.
  (function preventDoubleTapZoom(){
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e){
      const now = Date.now();
      if(now - lastTouchEnd <= 300){
        // Cancel the double-tap zoom; allow other handlers to run
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  })();

  // Prevent pinch-to-zoom and long-press selection/context on many mobile browsers.
  // 1) iOS 'gesturestart' — prevent pinch zoom gesture
  document.addEventListener('gesturestart', function(e){ e.preventDefault(); });

  // 2) Block multi-touch move (pinch) except when interacting with inputs/textareas
  document.addEventListener('touchmove', function(e){
    if(e.touches && e.touches.length > 1){
      const tgt = e.target;
      if(tgt && tgt.closest && tgt.closest('input, textarea, .text-input')) return; // allow in text fields
      e.preventDefault();
    }
  }, { passive: false });

  // 3) Prevent long-press contextmenu except on inputs/textareas
  document.addEventListener('contextmenu', function(e){
    const tgt = e.target;
    if(tgt && tgt.closest && tgt.closest('input, textarea, .text-input')) return;
    e.preventDefault();
  });

  window.addEventListener('resize', ()=>{
    // immediate resize of internal canvases, then defer heavy redraw until layout stabilizes
    resizeGraphCanvas();
    resizeTimelineCanvas();
    syncGraphScreenVisibility();
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        if(graphScreen && !graphScreen.hidden){
          if(graphMode === 'timeline') renderTimelineGraph();
          else renderGraph();
        }
      });
    });
  });
  window.addEventListener('orientationchange', ()=>{
    setTimeout(()=>{
      resizeGraphCanvas();
      resizeTimelineCanvas();
      syncGraphScreenVisibility();
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          if(graphScreen && !graphScreen.hidden){
            if(graphMode === 'timeline') renderTimelineGraph();
            else renderGraph();
          }
        });
      });
    }, 150);
  });
  updateGraphTypeButtons();
  resizeGraphCanvas();
  syncGraphScreenVisibility();
  // expose a small debug helper to compare computed styles between timeline and breakdown cards
  window.ftmDebug = {
    logCardStyles: function(){
      try {
        const timeline = document.querySelector('.graph-timeline-card');
        const breakdown = document.querySelector('.graph-breakdown-card');
        if(!timeline || !breakdown) { console.warn('Cards not present'); return; }
        const props = ['display','height','min-height','max-height','flex','align-self','overflow'];
        console.group('FTM card computed styles');
        console.log('Timeline (.graph-timeline-card)');
        const tcs = getComputedStyle(timeline);
        props.forEach(p=> console.log(p+':', tcs.getPropertyValue(p)));
        console.log('Breakdown (.graph-breakdown-card)');
        const bcs = getComputedStyle(breakdown);
        props.forEach(p=> console.log(p+':', bcs.getPropertyValue(p)));
        console.groupEnd();
      } catch(e){ console.error(e); }
    }
  };
})();
