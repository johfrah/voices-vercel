/**
 *  NUCLEAR DELIVERY LOGIC (2026 EDITION) - NATIVE JS VERSION
 * 
 * Port van de legacy PHP delivery date helpers naar TypeScript.
 * Berekent de verwachte leverdatum op basis van:
 * - Werkdagen (ma-vr) of Custom Weekly Schedule
 * - Belgische feestdagen
 * - Individuele vakanties van acteurs
 * - Cutoff tijden (bijv. 18:00)
 * - Service Levels (Direct, SameDay, 24h, 72u, Custom)
 * 
 * GEEN EXTERNE DEPENDENCIES (zoals date-fns) om build issues te voorkomen.
 */

import { DeliveryConfig } from "../types";

export interface DeliveryInfo {
  dateMin: Date;
  dateMax: Date | null;
  formatted: string;
  formattedShort: string;
  isRange: boolean;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
}

/**
 * Helper om een datum te formatteren als yyyy-MM-dd
 */
function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Helper om een datum toe te voegen
 */
function addDaysNative(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Checkt of het weekend is
 */
function isWeekendNative(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Zondag, 6 = Zaterdag
}

/**
 * Zet een datum op het begin van de dag (00:00:00)
 */
export function startOfDayNative(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Berekent de Belgische feestdagen voor een specifiek jaar
 */
export function getBelgianHolidays(year: number): string[] {
  const holidays: string[] = [
    `${year}-01-01`, // Nieuwjaar
    `${year}-05-01`, // Dag van de Arbeid
    `${year}-07-21`, // Nationale Feestdag
    `${year}-08-15`, // OLG Hemelvaart
    `${year}-11-01`, // Allerheiligen
    `${year}-11-11`, // Wapenstilstand
    `${year}-12-25`, // Kerstmis
  ];

  // Pasen en gerelateerde dagen (Paasmaandag, Hemelvaart, Pinkstermaandag)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  const easter = new Date(year, month - 1, day);
  
  const addHoliday = (date: Date, days: number) => {
    const d = addDaysNative(date, days);
    holidays.push(formatDateISO(d));
  };

  addHoliday(easter, 1);  // Paasmaandag
  addHoliday(easter, 39); // Hemelvaart
  addHoliday(easter, 50); // Pinkstermaandag

  return holidays;
}

/**
 * Checkt of een specifieke datum een werkdag is voor de acteur
 */
export function isWorkingDay(date: Date, holidays: string[], weeklyOn?: string[]): boolean {
  // Als er een wekelijks schema is, check dat eerst
  if (weeklyOn && weeklyOn.length > 0) {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDay = days[date.getDay()];
    if (!weeklyOn.includes(currentDay)) return false;
  } else {
    // Standaard: ma-vr
    if (isWeekendNative(date)) return false;
  }

  const dateStr = formatDateISO(date);
  return !holidays.includes(dateStr);
}

/**
 * Haalt de eerstvolgende werkdag op
 */
export function getNextWorkingDay(startDate: Date, holidays: string[], availability: any[] = [], weeklyOn?: string[]): Date {
  let current = addDaysNative(startDate, 1);
  
  while (true) {
    const isWorkDay = isWorkingDay(current, holidays, weeklyOn);
    
    // Check acteur beschikbaarheid (vakanties)
    const isOnHoliday = availability.some(v => {
      const start = startOfDayNative(new Date(v.start));
      const end = startOfDayNative(new Date(v.end));
      const check = startOfDayNative(current);
      return check >= start && check <= end;
    });

    if (isWorkDay && !isOnHoliday) {
      return current;
    }
    current = addDaysNative(current, 1);
  }
}

/**
 * Formatteert een datum in het Nederlands (eeee d MMMM)
 */
function formatDutchLong(date: Date): string {
  const days = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const months = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ];
  
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Formatteert een datum als dd/MM/yyyy
 */
function formatShortDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Checkt of het kantoor momenteel open is op basis van de gestructureerde openingstijden
 */
export function isOfficeOpen(
  openingHours: Record<string, { active: boolean, start: string, end: string }>,
  date: Date = new Date()
): boolean {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDay = days[date.getDay()];
  const config = openingHours[currentDay];

  if (!config || !config.active) return false;

  const [startH, startM] = config.start.split(':').map(Number);
  const [endH, endM] = config.end.split(':').map(Number);
  
  const currentH = date.getHours();
  const currentM = date.getMinutes();

  const currentTotal = currentH * 60 + currentM;
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  return currentTotal >= startTotal && currentTotal < endTotal;
}

/**
 * Formatteert de openingstijden voor weergave
 */
export function formatOpeningHours(
  openingHours: Record<string, { active: boolean, start: string, end: string }>,
  lang: string = 'nl'
): string {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const workDaysConfig = days.map(d => openingHours[d]).filter(Boolean);
  
  const allSame = workDaysConfig.every(c => 
    c.active === workDaysConfig[0].active && 
    c.start === workDaysConfig[0].start && 
    c.end === workDaysConfig[0].end
  );

  if (allSame && workDaysConfig[0]?.active) {
    const prefix = lang === 'nl' ? 'Ma-Vr' : 'Mon-Fri';
    return `${prefix}: ${workDaysConfig[0].start} - ${workDaysConfig[0].end}`;
  }

  // Fallback naar een simpele lijst voor de huidige dag
  const dayNames: Record<string, string> = lang === 'nl' 
    ? { mon: 'Ma', tue: 'Di', wed: 'Wo', thu: 'Do', fri: 'Vr', sat: 'Za', sun: 'Zo' }
    : { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
    
  const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
  const config = openingHours[currentDay];
  
  if (config?.active) {
    return `${dayNames[currentDay]}: ${config.start} - ${config.end}`;
  }
  
  return lang === 'nl' ? 'Momenteel gesloten' : 'Currently closed';
}

/**
 * Haalt de eerstvolgende openingstijd op
 */
export function getNextOpeningTime(
  openingHours: Record<string, { active: boolean, start: string, end: string }>,
  baseDate: Date = new Date()
): { day: string, time: string } | null {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayNames: Record<string, string> = { 
    mon: 'maandag', tue: 'dinsdag', wed: 'woensdag', thu: 'donderdag', 
    fri: 'vrijdag', sat: 'zaterdag', sun: 'zondag' 
  };
  
  let current = new Date(baseDate);
  
  // Check de komende 7 dagen
  for (let i = 0; i < 7; i++) {
    const dayKey = days[current.getDay()];
    const config = openingHours[dayKey];
    
    if (config?.active) {
      const [startH, startM] = config.start.split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const currentTotal = (i === 0) ? (current.getHours() * 60 + current.getMinutes()) : -1;

      if (currentTotal < startTotal) {
        return { 
          day: i === 0 ? 'vandaag' : (i === 1 ? 'morgen' : dayNames[dayKey]), 
          time: config.start 
        };
      }
    }
    current.setDate(current.getDate() + 1);
  }
  
  return null;
}

/**
 * De Master Functie: Berekent de leverdatum voor een acteur
 */
export function calculateDeliveryDate(
  actor: {
    deliveryDaysMin: number;
    deliveryDaysMax: number;
    cutoffTime: string;
    availability?: any[];
    holidayFrom?: string | null;
    holidayTill?: string | null;
    delivery_config?: DeliveryConfig;
    deliveryPenaltyDays?: number; // ⚠️ Accountability penalty
  },
  baseDate: Date = new Date(),
  systemWorkingDays: string[] = ['mon', 'tue', 'wed', 'thu', 'fri']
): DeliveryInfo {
  const currentYear = baseDate.getFullYear();
  const holidays = [...getBelgianHolidays(currentYear), ...getBelgianHolidays(currentYear + 1)];
  
  //  CHRIS-PROTOCOL: Combine availability array with flat holiday fields
  const effectiveAvailability = [...(actor.availability || [])];
  if (actor.holidayFrom && actor.holidayTill) {
    effectiveAvailability.push({ start: actor.holidayFrom, end: actor.holidayTill });
  }

  // NUCLEAR GOD MODE: Gebruik de nieuwe delivery_config indien aanwezig
  const config = actor.delivery_config || {
    type: actor.deliveryDaysMin === 0 ? 'sameday' : (actor.deliveryDaysMax <= 1 ? '24h' : '72u'),
    cutoff: actor.cutoffTime || '18:00',
    weekly_on: ['mon', 'tue', 'wed', 'thu', 'fri']
  };

  // 1. Bepaal effectieve startdatum (rekening houdend met cutoff)
  let effectiveStart = new Date(baseDate);
  const cutoff = config.cutoff || '18:00';
  const [cutoffHour, cutoffMinute] = cutoff.split(':').map(Number);
  
  const currentHour = baseDate.getHours();
  const currentMinute = baseDate.getMinutes();

  const isAfterCutoff = currentHour > cutoffHour || (currentHour === cutoffHour && currentMinute >= cutoffMinute);
  
  // Als het na de cutoff is, of geen werkdag, begin pas de volgende werkdag te tellen.
  if (isAfterCutoff || !isWorkingDay(effectiveStart, holidays, config.weekly_on)) {
    effectiveStart = getNextWorkingDay(effectiveStart, holidays, effectiveAvailability, config.weekly_on);
  } else {
    // Voor de cutoff op een werkdag? Dan is de startdatum vandaag om 00:00 om correct te rekenen.
    effectiveStart = startOfDayNative(effectiveStart);
  }

  // 2. Bereken min en max leverdatum
  const calculateDate = (days: number) => {
    //  BOB-METHODE: Voeg accountability penalty toe aan de gevraagde dagen
    const totalDays = days + (actor.deliveryPenaltyDays || 0);
    let date = new Date(effectiveStart);
    let remainingDays = totalDays;
    
    if (remainingDays === 0) return date;

    while (remainingDays > 0) {
      date = addDaysNative(date, 1);
      if (isWorkingDay(date, holidays, config.weekly_on)) {
        const isOnHoliday = effectiveAvailability.some(v => {
          const start = startOfDayNative(new Date(v.start));
          const end = startOfDayNative(new Date(v.end));
          const check = startOfDayNative(date);
          return check >= start && check <= end;
        });
        
        if (!isOnHoliday) {
          remainingDays--;
        }
      }
    }
    return date;
  };

  // Map config type naar dagen indien niet expliciet opgegeven
  let daysMin = actor.deliveryDaysMin;
  let daysMax = actor.deliveryDaysMax;

  if (config.type === 'sameday') {
    daysMin = 0;
    daysMax = 0;
  } else if (config.type === '24h') {
    daysMin = 1;
    daysMax = 1;
  } else if (config.type === '48h') {
    daysMin = 1;
    daysMax = 2;
  } else if (config.type === '72u') {
    daysMin = 1;
    daysMax = 3;
  }

  const dateMin = calculateDate(daysMin);
  
  //  BOB-METHODE: Support voor 'Same-Day' turnaround uren
  if (config.type === 'sameday' && config.avg_turnaround_hours && daysMin === 0) {
    dateMin.setHours(dateMin.getHours() + (config.avg_turnaround_hours || 4));
  }

  //  BOB-METHODE: Tie-breaker voor sortering
  if (daysMin === 0) {
    // Voor Same-Day houden we de tijd laag voor sortering
    dateMin.setHours(1, 0, 0, 0); 
  } else {
    dateMin.setHours(12, 0, 0, 0); // 24u+ later
  }

  //  CHRIS-PROTOCOL: HITL (Human In The Loop) Validation
  // Zelfs als de acteur op een weekenddag levert, kan de admin pas op de eerstvolgende 
  // systeem-werkdag valideren en doorsturen naar de klant.
  const systemHolidays = getBelgianHolidays(dateMin.getFullYear());
  while (!isWorkingDay(dateMin, systemHolidays, systemWorkingDays)) {
    const nextDate = addDaysNative(dateMin, 1);
    dateMin.setTime(nextDate.getTime());
    // Reset uren bij verschuiven naar volgende werkdag om sortering consistent te houden
    dateMin.setHours(9, 0, 0, 0); 
  }

  const dateMax = daysMax > daysMin ? calculateDate(daysMax) : null;

  // 3. Formatteren
  let formatted = formatDutchLong(dateMin);
  
  const today = startOfDayNative(new Date(baseDate));
  if (formatDateISO(dateMin) === formatDateISO(today)) {
    formatted = "vandaag";
  }
  if (dateMax) {
    formatted = `tussen ${formatDutchLong(dateMin)} en ${formatDutchLong(dateMax)}`;
  }

  return {
    dateMin,
    dateMax,
    formatted,
    formattedShort: formatShortDate(dateMin),
    isRange: !!dateMax,
    deliveryDaysMin: daysMin,
    deliveryDaysMax: daysMax
  };
}
