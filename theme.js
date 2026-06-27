/* FollowTheMoney theme module — light/dark/dynamic with sunrise/sunset calculation */
(function(){
  let timerId = null;

  function calcSunriseSunset(lat, lng, date) {
    const zenith = 90.833, D2R = Math.PI / 180, R2D = 180 / Math.PI;
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const julDay = Math.floor(367 * y - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4) + Math.floor(275 * m / 9) + d - 730531.5);
    const julCent = (julDay - 2451545) / 36525;
    const geomMeanLong = (280.46646 + julCent * (36000.76983 + julCent * 0.0003032)) % 360;
    const geomMeanAnom = 357.52911 + julCent * (35999.05029 - 0.0001537 * julCent);
    const eccent = 0.016708634 - julCent * (0.000042037 + 0.0000001267 * julCent);
    const sunEq = Math.sin(geomMeanAnom * D2R) * (1.914602 - julCent * (0.004817 + 0.000014 * julCent)) + Math.sin(2 * geomMeanAnom * D2R) * (0.019993 - 0.000101 * julCent) + Math.sin(3 * geomMeanAnom * D2R) * 0.000289;
    const sunTrueLong = geomMeanLong + sunEq;
    const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin(D2R * (125.04 - 1934.136 * julCent));
    const meanObliq = 23 + (26 + (21.448 - julCent * (46.815 + julCent * (0.00059 - julCent * 0.001813))) / 60) / 60;
    const obliqCorr = meanObliq + 0.00256 * Math.cos(D2R * (125.04 - 1934.136 * julCent));
    const declination = R2D * Math.asin(Math.sin(obliqCorr * D2R) * Math.sin(sunAppLong * D2R));
    const varY = Math.tan(obliqCorr / 2 * D2R) * Math.tan(obliqCorr / 2 * D2R);
    const eqOfTime = 4 * R2D * (varY * Math.sin(2 * geomMeanLong * D2R) - 2 * eccent * Math.sin(geomMeanAnom * D2R) + 4 * eccent * varY * Math.sin(geomMeanAnom * D2R) * Math.cos(2 * geomMeanLong * D2R) - 0.5 * varY * varY * Math.sin(4 * geomMeanLong * D2R) - 1.25 * eccent * eccent * Math.sin(2 * geomMeanAnom * D2R));
    let ha = R2D * Math.acos(Math.cos(zenith * D2R) / (Math.cos(lat * D2R) * Math.cos(declination * D2R)) - Math.tan(lat * D2R) * Math.tan(declination * D2R));
    const sunriseMin = 720 - 4 * (lng + ha) - eqOfTime;
    const sunsetMin = 720 - 4 * (lng - ha) - eqOfTime;
    const tzOff = date.getTimezoneOffset();
    return { sunrise: (sunriseMin - tzOff) / 60, sunset: (sunsetMin - tzOff) / 60 };
  }

  function isDaytime(lat, lng) {
    const now = new Date(), { sunrise, sunset } = calcSunriseSunset(lat, lng, now);
    const h = now.getHours() + now.getMinutes() / 60;
    return h >= sunrise && h < sunset;
  }

  function setTheme(t) { document.documentElement.dataset.theme = t; }

  function applyDynamicTheme(lat, lng) { setTheme(isDaytime(lat, lng) ? 'light' : 'dark'); }

  function scheduleNextSwitch(lat, lng) {
    const now = new Date(), { sunrise, sunset } = calcSunriseSunset(lat, lng, now);
    const h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const day = h >= sunrise && h < sunset;
    let next = day ? sunset : sunrise + 24;
    let delay = (next - h) * 3600 * 1000;
    if (delay < 10000) delay = 10000;
    timerId = setTimeout(() => { applyDynamicTheme(lat, lng); scheduleNextSwitch(lat, lng); }, delay);
  }

  window.applyTheme = function applyTheme(theme, lat, lng) {
    if (theme === 'dynamic') {
      if (lat != null && lng != null) {
        clearTimeout(timerId); timerId = null;
        applyDynamicTheme(lat, lng);
        scheduleNextSwitch(lat, lng);
        return;
      }
      const h = new Date().getHours();
      setTheme(h >= 7 && h < 19 ? 'light' : 'dark');
      return;
    }
    clearTimeout(timerId); timerId = null;
    setTheme(theme === 'light' ? 'light' : 'dark');
  };

  window.stopDynamicTimer = function stopDynamicTimer() { clearTimeout(timerId); timerId = null; };
})();
