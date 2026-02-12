/**
 * 🚚 NUCLEAR DELIVERY LOGIC (2026 EDITION) - NATIVE JS VERSION
 * 
 * Port van de legacy PHP delivery date helpers naar TypeScript.
 * Berekent de verwachte leverdatum op basis van:
 * - Werkdagen (ma-vr)
 * - Belgische feestdagen
 * - Individuele vakanties van acteurs
 * - Cutoff tijden (bijv. 18:00)
 * 
 * GEEN EXTERNE DEPENDENCIES (zoals date-fns) om build issues te voorkomen.
 */

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
function startOfDayNative(date: Date): Date {
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
 * Checkt of een specifieke datum een werkdag is
 */
export function isWorkingDay(date: Date, holidays: string[]): boolean {
  if (isWeekendNative(date)) return false;
  const dateStr = formatDateISO(date);
  return !holidays.includes(dateStr);
}

/**
 * Haalt de eerstvolgende werkdag op
 */
export function getNextWorkingDay(startDate: Date, holidays: string[], availability: any[] = []): Date {
  let current = addDaysNative(startDate, 1);
  
  while (true) {
    const isWeekendDay = isWeekendNative(current);
    const isHoliday = holidays.includes(formatDateISO(current));
    
    // Check acteur beschikbaarheid (vakanties)
    const isOnHoliday = availability.some(v => {
      const start = startOfDayNative(new Date(v.start));
      const end = startOfDayNative(new Date(v.end));
      const check = startOfDayNative(current);
      return check >= start && check <= end;
    });

    if (!isWeekendDay && !isHoliday && !isOnHoliday) {
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
 * De Master Functie: Berekent de leverdatum voor een acteur
 */
export function calculateDeliveryDate(
  actor: {
    deliveryDaysMin: number;
    deliveryDaysMax: number;
    cutoffTime: string;
    availability?: any[];
  },
  baseDate: Date = new Date()
): DeliveryInfo {
  const currentYear = baseDate.getFullYear();
  const holidays = [...getBelgianHolidays(currentYear), ...getBelgianHolidays(currentYear + 1)];
  
  // 1. Bepaal effectieve startdatum (rekening houdend met cutoff)
  let effectiveStart = new Date(baseDate);
  const [cutoffHour, cutoffMinute] = actor.cutoffTime.split(':').map(Number);
  const currentHour = baseDate.getHours();
  const currentMinute = baseDate.getMinutes();

  const isAfterCutoff = currentHour > cutoffHour || (currentHour === cutoffHour && currentMinute >= cutoffMinute);
  
  // Als het na de cutoff is, of geen werkdag, begin pas de volgende werkdag te tellen
  if (isAfterCutoff || !isWorkingDay(effectiveStart, holidays)) {
    effectiveStart = getNextWorkingDay(effectiveStart, holidays, actor.availability);
  }

  // 2. Bereken min en max leverdatum
  const calculateDate = (days: number) => {
    let date = new Date(effectiveStart);
    let remainingDays = days;
    while (remainingDays > 0) {
      date = addDaysNative(date, 1);
      if (isWorkingDay(date, holidays)) {
        // Check ook hier vakanties van de acteur
        const isOnHoliday = actor.availability?.some(v => {
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

  const dateMin = calculateDate(actor.deliveryDaysMin);
  const dateMax = actor.deliveryDaysMax > actor.deliveryDaysMin 
    ? calculateDate(actor.deliveryDaysMax) 
    : null;

  // 3. Formatteren
  let formatted = formatDutchLong(dateMin);
  if (dateMax) {
    formatted = `tussen ${formatDutchLong(dateMin)} en ${formatDutchLong(dateMax)}`;
  }

  return {
    dateMin,
    dateMax,
    formatted,
    formattedShort: formatShortDate(dateMin),
    isRange: !!dateMax,
    deliveryDaysMin: actor.deliveryDaysMin,
    deliveryDaysMax: actor.deliveryDaysMax
  };
}
