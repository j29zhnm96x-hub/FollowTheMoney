/* Seasonal / Off-Season core logic module */
(function(){
  function parseDateISO(iso){ if(!iso) return null; const d=new Date(iso+'T00:00:00'); return isFinite(d)? d : null; }
  function startOfDay(ts){ const d=new Date(ts); d.setHours(0,0,0,0); return d.getTime(); }
  function addDays(ts,days){ const d=new Date(ts); d.setDate(d.getDate()+days); return d.getTime(); }
  function nextYearSameDate(iso){ 
    if(!iso) return null; 
    const parts = iso.split('-');
    if(parts.length !== 3) return null;
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const d = new Date(year + 1, month, day, 0, 0, 0, 0);
    return isFinite(d) ? d : null;
  }
  function daysInCurrentMonth(now){
    return new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
  }

  function computePhase(settings, nowTs){
    const now = new Date(nowTs);
    const sStart = parseDateISO(settings.seasonStart);
    const sEnd = parseDateISO(settings.seasonEnd);
    if(!sStart || !sEnd) return { hasSeason:false };
    const seasonStartTs = startOfDay(sStart.getTime());
    const seasonEndTs = startOfDay(sEnd.getTime());
    const offSeasonStartTs = addDays(seasonEndTs,1); // day after season end
    const isSeasonActive = now.getTime() >= seasonStartTs && now.getTime() <= (seasonEndTs + 24*3600*1000 - 1);
    const isOffSeason = now.getTime() >= offSeasonStartTs;
    // Assume next season begins next year same start date
    const nextSeasonStart = nextYearSameDate(settings.seasonStart);
    const nextSeasonStartTs = nextSeasonStart ? startOfDay(nextSeasonStart.getTime()) : null;
    let offSeasonTotalDays = null;
    if(isOffSeason && nextSeasonStartTs){
      offSeasonTotalDays = Math.round((nextSeasonStartTs - offSeasonStartTs)/(86400000));
      if(offSeasonTotalDays < 1) offSeasonTotalDays = 1;
    }
    let daysElapsedOff = null, daysRemainingOff = null;
    if(isOffSeason && offSeasonTotalDays!=null){
      daysElapsedOff = Math.floor((startOfDay(now.getTime()) - offSeasonStartTs)/86400000);
      if(daysElapsedOff < 0) daysElapsedOff = 0;
      daysRemainingOff = offSeasonTotalDays - daysElapsedOff;
      if(daysRemainingOff < 1) daysRemainingOff = 1;
    }
    let daysUntilNextSeason = null;
    if(nextSeasonStartTs){
      const diff = Math.ceil((nextSeasonStartTs - startOfDay(now.getTime())) / 86400000);
      if(diff >= 0) daysUntilNextSeason = diff;
    }
    return { hasSeason:true, isSeasonActive, isOffSeason, seasonStartTs, seasonEndTs, offSeasonStartTs, offSeasonTotalDays, daysElapsedOff, daysRemainingOff, daysUntilNextSeason };
  }

  function sumTransactions(transactions, filterFn){
    return transactions.reduce((acc,t)=> filterFn(t) ? acc + t.amountCents : acc, 0);
  }

  function computeSpent(transactions, nowTs){
    const now = new Date(nowTs);
    const todayStart = startOfDay(now.getTime());
    const todayEnd = todayStart + 86400000 - 1;

    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday
    const weekStart = startOfDay(addDays(todayStart, -dayOfWeek));
    const weekEnd = weekStart + (7 * 86400000) - 1;

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth()+1, 1).getTime();
    const monthEnd = nextMonthStart - 1;

    const spendReducer = (rangeStart, rangeEnd)=>
      transactions
        .filter(t => t.amountCents < 0 && t.createdAt >= rangeStart && t.createdAt <= rangeEnd)
        .reduce((a,t)=> a + Math.abs(t.amountCents), 0);

    return {
      dailySpent: spendReducer(todayStart, todayEnd),
      weeklySpent: spendReducer(weekStart, weekEnd),
      monthlySpent: spendReducer(monthStart, monthEnd)
    };
  }

  function computeAllowances(settings, transactions, nowTs){
    const phase = computePhase(settings, nowTs);
    if(!phase.hasSeason) return { phase };
    const totalBalanceCents = transactions.reduce((a,t)=> a + t.amountCents, 0);
    const safeBudget = Math.max(0, totalBalanceCents);

    let dailyAllowance=null, weeklyAllowance=null, monthlyAllowance=null;
    if(phase.isOffSeason && phase.daysRemainingOff){
      const now = new Date(nowTs);
      const daysRemaining = phase.daysRemainingOff;
      dailyAllowance = Math.floor(safeBudget / daysRemaining);
      const weekDays = Math.min(daysRemaining, 7);
      const monthDays = Math.min(daysRemaining, daysInCurrentMonth(now));
      weeklyAllowance = Math.floor(dailyAllowance * Math.max(1, weekDays));
      monthlyAllowance = Math.floor(dailyAllowance * Math.max(1, monthDays));
    }

    return {
      phase,
      remainingBudget: safeBudget,
      dailyAllowance,
      weeklyAllowance,
      monthlyAllowance
    };
  }

  window.SeasonalLogic = { computePhase, computeAllowances, computeSpent };
})();
