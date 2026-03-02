import ical from 'node-ical';
import { addHours, addMinutes, format, isAfter, isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { db, appointments } from '@/lib/system/voices-config';
import { eq, and, ne } from 'drizzle-orm';

const ICLOUD_URL = 'https://p66-caldav.icloud.com/published/2/NjMzMjQ3MDA5NjMzMjQ3MGU_sLegwSHEot0vGCikjVp_XNhRFSCIqfLDAvExWJrjsa_Yrrnz6UO9TgPLKpU8OAN8Cobb6CFk1Aw7fq7CD84';

export interface TimeSlot {
  start: string;
  end: string;
  time: string;
}

export class CalendarSyncService {
  /**
   * Fetch availability blocks from iCloud
   */
  static async getAvailabilityBlocks() {
    try {
      const response = await fetch(ICLOUD_URL);
      const icsData = await response.text();
      const events = ical.parseICS(icsData);
      
      const blocks: { start: Date; end: Date }[] = [];

      for (const k in events) {
        if (events.hasOwnProperty(k)) {
          const ev = events[k];
          if (ev.type === 'VEVENT') {
            const summary = ev.summary || '';
            // Look for "Studio", "Available", or "Beschikbaar"
            if (
              summary.toLowerCase().includes('studio') ||
              summary.toLowerCase().includes('available') ||
              summary.toLowerCase().includes('beschikbaar')
            ) {
              blocks.push({
                start: new Date(ev.start),
                end: new Date(ev.end)
              });
            }
          }
        }
      }

      return blocks;
    } catch (error) {
      console.error('Error fetching iCloud calendar:', error);
      return [];
    }
  }

  /**
   * Calculate 15-minute slots with 10-minute buffer
   */
  static async getAvailableSlots(startDate: Date, endDate?: Date) {
    const blocks = await this.getAvailabilityBlocks();
    const slots: TimeSlot[] = [];
    const slotDuration = 15;
    const bufferDuration = 10;

    const startLimit = startOfDay(startDate);
    const endLimit = endDate ? endOfDay(endDate) : endOfDay(startDate);
    
    const now = new Date();
    const minBookableTime = addHours(now, 24); // 24h notice

    for (const block of blocks) {
      // Check if block overlaps with requested range
      if (isAfter(block.start, endLimit) || isBefore(block.end, startLimit)) {
        continue;
      }

      let currentSlot = new Date(block.start);
      while (isBefore(currentSlot, block.end)) {
        const slotEnd = addMinutes(currentSlot, slotDuration);

        if (isBefore(slotEnd, block.end) || slotEnd.getTime() === block.end.getTime()) {
          if (isAfter(currentSlot, minBookableTime)) {
            // Check if already booked in DB
            const isBooked = await this.isSlotBooked(currentSlot);
            if (!isBooked) {
              slots.push({
                start: currentSlot.toISOString(),
                end: slotEnd.toISOString(),
                time: format(currentSlot, 'HH:mm')
              });
            }
          }
        }
        
        currentSlot = addMinutes(currentSlot, slotDuration + bufferDuration);
      }
    }

    return slots.sort((a, b) => a.start.localeCompare(b.start));
  }

  private static async isSlotBooked(startTime: Date) {
    const existing = await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.startTime, startTime),
          ne(appointments.status, 'cancelled')
        )
      )
      .limit(1);
    
    return existing.length > 0;
  }
}
