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
  const settingsModal = $('#settingsModal');
  const helpModal = $('#helpModal');
  const themeToggleEl = $('#themeToggle');
  const btnClearAll = $('#btnClearAll');
  // Seasonal Budget elements
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
  const historyGroupSummaryEl = $('#historyGroupSummary');
  const editDateContainer = $('#editDateContainer');
  const editDateInput = $('#editDateInput');
  const dateFormatEl = $('#dateFormat');
  const currencySymbolInput = $('#currencySymbol');
  const btnExportShare = $('#btnExportShare');
  const btnExportEmail = $('#btnExportEmail');
  const btnImportData = $('#btnImportData');
  const importFileInput = $('#importFile');
  const historyLockToggle = $('#historyLockToggle');
  const graphScreen = $('#screen-graph');
  const graphTypeFiltersEl = $('#graphTypeFilters');
  const graphLegendEl = $('#graphLegend');
  const graphCanvas = $('#graphCanvas');
  const graphEmptyEl = $('#graphEmpty');
  const graphTotalValueEl = $('#graphTotalValue');
  const graphTotalScopeEl = $('#graphTotalScope');
  const graphGroupInputs = Array.from(document.querySelectorAll('input[name="graphGroup"]'));

  let sheetType = null; // 'income' | 'expense'
  let sheetMode = 'add'; // 'add' | 'edit'
  let editingTransaction = null;
  let transactions = [];
  let historyFilter = null; // null | 'day' | 'week' | 'month'
  let historyTypeFilter = 'all'; // 'all' | 'income' | 'expense'
  let historyCategoryFilter = null;
  let historyNameFilter = null;
  let settings = { 
    recurringEnabled:false, 
    recurringAmountCents:0, 
    lastRecurringAppliedMonth:null, 
    theme: 'light',
    seasonStart: null,
    seasonEnd: null,
    seasonIncomeCents: 0,
    dateFormat: 'dmy',
    currencySymbol: '€',
    historyLocked: true,
    incomeCategories: [],
    expenseCategories: [],
    incomeNames: [],
    expenseNames: []
  };
  let pendingHistoryHighlightId = null;
  let graphType = 'expense';
  let graphGrouping = 'category';
  let previousNonGraphScreen = 'home';
  let currentScreen = 'home';
  const graphColorCache = new Map();
  const graphPalette = ['#30d6a4','#ff4f6a','#6580ff','#f6c343','#58c7ff','#ff9fd5','#8be28b','#ffa25e','#ffd166','#b388ff'];

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
      updateBalance();
      renderRecent();
      if(!historyScreen.hidden) renderHistory();
      syncSettingsUI();
    }
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
        seasonStart: null,
        seasonEnd: null,
        seasonIncomeCents: 0,
        dateFormat: 'dmy',
        currencySymbol: '€',
        historyLocked: true,
        incomeCategories: [],
        expenseCategories: [],
        incomeNames: [],
        expenseNames: []
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
    const formatted = value.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    const symbol = (settings && settings.currencySymbol) ? settings.currencySymbol : '€';
    return formatted + '\u202F' + symbol;
  };
  const equalsIgnoreCase = (a,b)=>{
    if(a==null || b==null) return false;
    return String(a).toLowerCase() === String(b).toLowerCase();
  };
  const pad2 = num => String(num).padStart(2,'0');
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
  function getGraphColor(label){
    if(graphColorCache.has(label)) return graphColorCache.get(label);
    const hash = Array.from(label).reduce((acc,char)=> acc + char.charCodeAt(0),0);
    const color = graphPalette[hash % graphPalette.length];
    graphColorCache.set(label,color);
    return color;
  }
  function buildGraphSegments(typeOverride){
    const currentType = typeOverride || graphType;
    const filterPositive = currentType === 'income';
    const key = graphGrouping === 'name' ? 'name' : 'category';
    const fallback = graphGrouping === 'name' ? 'Unnamed' : 'Uncategorized';
    const map = new Map();
    transactions.forEach(t=>{
      if(filterPositive && t.amountCents < 0) return;
      if(!filterPositive && t.amountCents >= 0) return;
      const labelRaw = (t[key] && t[key].trim()) || fallback;
      const amount = Math.abs(t.amountCents);
      if(amount<=0) return;
      map.set(labelRaw, (map.get(labelRaw)||0) + amount);
    });
    return Array.from(map.entries())
      .map(([label,value])=>({ label, value }))
      .sort((a,b)=> b.value - a.value);
  }
  function resizeGraphCanvas(){
    if(!graphCanvas) return;
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
  function renderGraph(){
    if(!graphCanvas || !graphLegendEl) return;
    const ctx = graphCanvas.getContext('2d');
    if(!ctx) return;
    const segments = buildGraphSegments();
    const total = segments.reduce((sum,item)=> sum + item.value, 0);
    graphLegendEl.innerHTML = '';
    if(graphTotalValueEl){
      graphTotalValueEl.textContent = total>0 ? formatCurrency(total) : formatCurrency(0);
    }
    if(graphTotalScopeEl){
      const groupingLabel = graphGrouping === 'name' ? 'by names' : 'by categories';
      graphTotalScopeEl.textContent = total>0
        ? `${graphType==='income'?'Income':'Expense'} · ${groupingLabel}`
        : 'No data yet';
    }
    if(total<=0){
      if(transactions.length){
        const alternateType = graphType === 'income' ? 'expense' : 'income';
        const alternateSegments = buildGraphSegments(alternateType);
        const alternateTotal = alternateSegments.reduce((sum,item)=> sum + item.value, 0);
        if(alternateTotal > 0){
          graphType = alternateType;
          updateGraphTypeButtons();
          renderGraph();
          return;
        }
      }
      graphCanvas.style.visibility = 'hidden';
      if(graphEmptyEl) graphEmptyEl.hidden = false;
      return;
    }
    graphCanvas.style.visibility = 'visible';
    if(graphEmptyEl) graphEmptyEl.hidden = true;
    resizeGraphCanvas();
    ctx.clearRect(0,0,graphCanvas.width, graphCanvas.height);
    const centerX = graphCanvas.width/2;
    const centerY = graphCanvas.height/2;
    const radius = Math.min(centerX, centerY) - 12*(window.devicePixelRatio||1);
    const innerRadius = radius * 0.55;
    let startAngle = -Math.PI/2;
    segments.forEach(segment=>{
      const sliceAngle = (segment.value/total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const color = getGraphColor(segment.label);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      startAngle = endAngle;

      const legendItem = document.createElement('div');
      legendItem.className = 'graph-legend-item';
      const dot = document.createElement('span');
      dot.className = 'graph-legend-color';
      dot.style.background = color;
      const percent = Math.round((segment.value/total)*1000)/10;
      const text = document.createElement('span');
      text.className = 'legend-label';
      text.textContent = segment.label;
      const pct = document.createElement('strong');
      pct.textContent = `${percent}%`;
      legendItem.appendChild(dot);
      legendItem.appendChild(text);
      legendItem.appendChild(pct);
      graphLegendEl.appendChild(legendItem);
    });
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI*2);
    const bodyStyles = window.getComputedStyle(document.body);
    ctx.fillStyle = bodyStyles.getPropertyValue('background-color') || 'rgba(15,16,36,0.9)';
    ctx.fill();
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
    resizeGraphCanvas();
    updateGraphTypeButtons();
    renderGraph();
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
    const landscape = isLandscapeMode();
    if(landscape){
      showGraphScreen();
    } else if(!landscape && !graphScreen.hidden){
      hideGraphScreen();
    }
  }
  function refreshGraphIfVisible(){
    if(graphScreen && !graphScreen.hidden){
      renderGraph();
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
    const fromSettings = getCollection(sheetType, collectionKeyName);
    fromSettings.forEach(v=>{ if(v) base.add(v); });
    const selectedCategory = categoryInput && categoryInput.value.trim();
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
    const categoryValues = gatherValues('category', historyTypeFilter);
    if(historyCategoryFilter && !categoryValues.some(cat=>equalsIgnoreCase(cat, historyCategoryFilter))){
      historyCategoryFilter = null;
    }
    const nameValues = gatherValues('name', historyTypeFilter);
    if(historyNameFilter && !nameValues.some(n=>equalsIgnoreCase(n, historyNameFilter))){
      historyNameFilter = null;
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
    clearChip.textContent = kind==='category'?'All categories':'All names';
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
      historyLocked:true,
      incomeCategories: [],
      expenseCategories: [],
      incomeNames: [],
      expenseNames: []
    };
    const next = { ...base, ...settings, ...(raw || {}) };
    const allowedFormats = new Set(['dmy','mdy','ymd']);
    if(!allowedFormats.has(next.dateFormat)) next.dateFormat = 'dmy';
    let symbolSource = raw && typeof raw.currencySymbol !== 'undefined' ? String(raw.currencySymbol) : (next.currencySymbol || '€');
    symbolSource = symbolSource.trim();
    next.currencySymbol = symbolSource ? symbolSource.slice(0,3) : '€';
    next.historyLocked = !!next.historyLocked;
    ['incomeCategories','expenseCategories','incomeNames','expenseNames'].forEach(key=>{
      if(!Array.isArray(next[key])) next[key] = [];
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
        alert('Share sheet not available. Backup downloaded instead.');
      }
    }catch(err){
      if(err && err.name === 'AbortError'){
        console.warn('Share dismissed by user');
      } else {
        console.error('Export/share error', err);
        alert('Unable to export backup right now. Please try again.');
      }
    }finally{
      btnExportShare.disabled = false;
    }
  }
  async function handleExportEmail(){
    if(!btnExportEmail) return;
    btnExportEmail.disabled = true;
    try{
      const payload = buildBackupPayload();
      if(typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText){
        try{ await navigator.clipboard.writeText(payload); }catch(_){ /* clipboard may be denied */ }
      }
      const previewLimit = 1800;
      const snippet = payload.length>previewLimit ? `${payload.slice(0,previewLimit)}\n… (truncated)` : payload;
      const body = `Backup data (full JSON copied to clipboard):\n\n${snippet}`;
      window.location.href = `mailto:?subject=${encodeURIComponent('FollowTheMoney Backup')}&body=${encodeURIComponent(body)}`;
    }catch(err){
      console.error('Export/email error', err);
      alert('Unable to prepare email backup. Please try again.');
    }finally{
      btnExportEmail.disabled = false;
    }
  }
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
      const e = document.createElement('div'); e.className='empty'; e.textContent='No recent entries'; recentListEl.appendChild(e); return;
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
    labelSpan.textContent = labelParts.join(' · ') || 'All entries';

    const sumSpan = document.createElement('span');
    sumSpan.className = 'sum';
    const totalCents = list.reduce((sum,t)=> sum + t.amountCents, 0);
    sumSpan.textContent = formatCurrency(totalCents);

    historyGroupSummaryEl.appendChild(labelSpan);
    historyGroupSummaryEl.appendChild(sumSpan);
  }

  function renderHistory(){
    if(!historyList) return;
    historyList.innerHTML = '';
    let filteredTxs = transactions;
    if(historyFilter && window.SeasonalLogic){
      const now = Date.now();
      const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
      const todayEnd = todayStart.getTime() + 86400000 - 1;
      const weekStart = todayStart.getTime() - (6*86400000);
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
        const labels = {day:'Today',week:'This Week',month:'This Month'};
        historyFilterEl.textContent = `Showing: ${labels[historyFilter] || 'All'}`;
        historyFilterEl.hidden = false;
      } else {
        historyFilterEl.hidden = true;
      }
    }
    updateHistorySummary(filteredTxs);
    if(filteredTxs.length===0){
      const empty = document.createElement('div');
      empty.className='empty'; 
      empty.textContent= historyFilter ? 'No transactions in this period.' : 'No transactions yet.';
      historyList.appendChild(empty); 
      return;
    }
    filteredTxs.forEach(t=>{
      const wrap = document.createElement('div');
      wrap.className='transaction fade-in';
      wrap.dataset.id = t.id;

      const info = document.createElement('div');
      info.className = 'left';
      info.style.minWidth='0';
      const title = document.createElement('div');
      title.className='title';
      const displayName = buildEntryLabel(t);
      title.textContent = displayName;
      title.style.fontWeight='600';
      title.style.whiteSpace='nowrap';
      title.style.overflow='hidden';
      title.style.textOverflow='ellipsis';
      const meta = document.createElement('div');
      const dateStr = formatDateTime(t.createdAt,true);
      meta.className='meta';
      meta.textContent = dateStr + (t.recurring?' · Recurring':'');
      info.appendChild(title);
      info.appendChild(meta);

      const actions = document.createElement('div');
      actions.className='actions';
      const amt = document.createElement('div');
      amt.className = t.amountCents>0?'amount-pos':'amount-neg';
      amt.textContent = formatCurrency(Math.abs(t.amountCents));
      const editBtn = document.createElement('button');
      editBtn.type='button';
      editBtn.className='edit-btn';
      if(t.note){
        editBtn.classList.add('note-outline');
      }
      editBtn.setAttribute('aria-label','Edit transaction');
      editBtn.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z'/></svg>";
      editBtn.addEventListener('click',e=>{
        e.stopPropagation();
        startEditingTransaction(t);
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
            const confirmed = confirm('Delete this transaction?');
            if(confirmed){
              deleteTx(t.id);
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
      const highlightEl = historyList.querySelector(`.transaction[data-id="${pendingHistoryHighlightId}"]`);
      if(highlightEl){
        const removeAfterAnimation = e=>{
          if(e && e.animationName !== 'historyFlash') return;
          highlightEl.removeEventListener('animationend', removeAfterAnimation);
          highlightEl.classList.remove('flash-highlight');
        };
        highlightEl.addEventListener('animationend', removeAfterAnimation);
        highlightEl.classList.add('flash-highlight');
        highlightEl.scrollIntoView({ behavior:'smooth', block:'center' });
      }
      pendingHistoryHighlightId = null;
    }
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
    const baseDigits = existingTx ? String(Math.abs(existingTx.amountCents)) : '0';
    rawDigits.value=baseDigits; 
    updateSheetAmount(); 
    if(categoryContainer){
      categoryContainer.hidden=false;
      if(categoryInput){
        categoryInput.placeholder = sheetType==='income' ? 'Income category' : 'Expense category';
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
      toggleNoteBtn.textContent='Add note';
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
    confirmBtn.textContent = sheetMode==='edit' ? 'Save Changes' : (type==='expense'?'Add Expense':'Add Income');
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
    toggleNoteBtn.textContent='Add note';
    if(nameContainer) nameContainer.hidden=true;
    if(nameInput) nameInput.value='';
    if(nameSuggestionsEl){
      nameSuggestionsEl.innerHTML='';
      nameSuggestionsEl.hidden=true;
    }
    if(editDateContainer) editDateContainer.hidden=true;
    if(editDateInput) editDateInput.value='';
    rawDigits.value='0';
    confirmBtn.textContent='Add Income';
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

  function syncSettingsUI(){
    // theme toggle: checked = light theme
    if(themeToggleEl) themeToggleEl.checked = settings.theme === 'light';
    if(dateFormatEl) dateFormatEl.value = settings.dateFormat || 'dmy';
    if(currencySymbolInput) currencySymbolInput.value = settings.currencySymbol || '€';
    if(historyLockToggle) historyLockToggle.checked = !!settings.historyLocked;
    normalizeCollections();
    refreshCategoryOptions();
    refreshNameOptions();
    renderFilterChips();
    applyTheme(settings.theme);

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

  function updateSeasonalStats(){
    if(!window.SeasonalLogic) return;
    const result = window.SeasonalLogic.computeAllowances(settings, transactions, Date.now());
    if(seasonInfoEl){
      if(!result.phase || !result.phase.hasSeason){
        seasonInfoEl.textContent = 'No season set.';
      } else if(result.phase.isSeasonActive){
        seasonInfoEl.textContent = 'Season active.';
      } else if(result.phase.isOffSeason){
        let text = 'Off-season mode.';
        if(typeof result.phase.daysUntilNextSeason === 'number'){
          const days = result.phase.daysUntilNextSeason;
          const label = days === 1 ? '1 day' : `${days} days`;
          text += ` ${label} to start of working season.`;
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
        allowanceInfoEl.textContent = `Allowance (D/W/M): ${d} / ${w} / ${m}`;
      } else {
        allowanceInfoEl.textContent = '';
      }
    }

    // Dashboard grid (D/W/M)
    if(dashboardGridEl && window.SeasonalLogic){
      const spent = window.SeasonalLogic.computeSpent(transactions, Date.now());
      if(result.phase && result.phase.hasSeason && result.phase.isOffSeason){
        if(dailyAllowanceEl) dailyAllowanceEl.textContent = formatCurrency(result.dailyAllowance || 0);
        if(dailySpentEl) dailySpentEl.textContent = formatCurrency(spent.dailySpent || 0);
        if(weeklyAllowanceEl) weeklyAllowanceEl.textContent = formatCurrency(result.weeklyAllowance || 0);
        if(weeklySpentEl) weeklySpentEl.textContent = formatCurrency(spent.weeklySpent || 0);
        if(monthlyAllowanceEl) monthlyAllowanceEl.textContent = formatCurrency(result.monthlyAllowance || 0);
        if(monthlySpentEl) monthlySpentEl.textContent = formatCurrency(spent.monthlySpent || 0);
        dashboardGridEl.hidden = false;
      } else {
        dashboardGridEl.hidden = true;
      }
    }

    if(seasonBadgeEl){
      if(result.phase && result.phase.isOffSeason){
        seasonBadgeEl.textContent = 'Off-season';
        seasonBadgeEl.hidden = false;
      } else if(result.phase && result.phase.isSeasonActive){
        seasonBadgeEl.textContent = 'Season active';
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

  function saveEditedTransaction(amountCents,note,newTimestamp,name,category){
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

  // Event bindings
  $('#btnAddIncome').addEventListener('click',()=>openSheet('income'));
  $('#btnAddExpense').addEventListener('click',()=>openSheet('expense'));
  document.querySelectorAll('[data-dismiss]').forEach(el=> el.addEventListener('click',()=>{ if(el.closest('#sheet')) closeSheet(); if(el.closest('#settingsModal')) closeSettings(); if(el.closest('#helpModal')) closeHelp(); }));
  $('#btnSettings').addEventListener('click',openSettings);
  const btnHelpManual = $('#btnHelpManual');
  if(btnHelpManual) btnHelpManual.addEventListener('click', ()=>{ openHelp(); });
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
  toggleNoteBtn.addEventListener('click',()=>{
    if(noteContainer.hidden){
      noteContainer.hidden=false;
      toggleNoteBtn.hidden=true;
      noteInput.focus();
    }
  });
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
      const isIncomeEntry = sheetType === 'income';
      const action = sheetMode==='edit'
        ? saveEditedTransaction(cents, cleanedNote, overrideDate, nameValue, categoryValue)
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
  if(btnExportEmail){
    btnExportEmail.addEventListener('click',()=> handleExportEmail());
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
          const proceed = confirm('Importing will replace current data. Continue?');
          if(!proceed) return;
          await applyImportedData(importedTxs, importedSettings);
          alert('Backup imported successfully.');
        }catch(err){
          console.error('Import error', err);
          alert('Could not import this backup file. Please make sure it was exported from FollowTheMoney.');
        } finally {
          btnImportData.disabled = false;
          importFileInput.value='';
        }
      };
      reader.onerror = ()=>{
        btnImportData.disabled = false;
        importFileInput.value='';
        alert('Unable to read the selected file.');
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
    const confirmed = confirm('Clear all data? This will delete all transactions and reset settings. This cannot be undone.');
    if(!confirmed) return;
    const delPromises = transactions.map(t=>dbDeleteTransaction(t.id));
    Promise.all(delPromises).then(()=>{
      transactions = [];
      settings = {
        recurringEnabled:false,
        recurringAmountCents:0,
        lastRecurringAppliedMonth:null,
        theme: 'light',
        seasonStart:null,
        seasonEnd:null,
        seasonIncomeCents:0,
        dateFormat:'dmy',
        currencySymbol:'€',
        historyLocked:true,
        incomeCategories: [],
        expenseCategories: [],
        incomeNames: [],
        expenseNames: []
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
    }
  });

  const warmBackup = readLocalBackup();
  if(warmBackup){
    applyBackupSnapshot(warmBackup);
  } else {
    renderRecent();
  }

  // Init
  openDB().then(d=>{ db=d; return Promise.all([dbGetAllTransactions(), dbGetSettings()]); })
    .then(([txs,s])=>{ transactions=txs; settings={...settings,...s}; updateBalance(); applyRecurringIfNeeded(); syncSettingsUI(); updateSeasonalStats(); })
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
    resizeGraphCanvas();
    syncGraphScreenVisibility();
    if(graphScreen && !graphScreen.hidden) renderGraph();
  });
  window.addEventListener('orientationchange', ()=>{
    setTimeout(()=>{
      resizeGraphCanvas();
      syncGraphScreenVisibility();
    }, 150);
  });
  updateGraphTypeButtons();
  resizeGraphCanvas();
  syncGraphScreenVisibility();
})();
