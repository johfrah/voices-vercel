import { YukiService } from '@/lib/services/yuki-service';
import { db } from '@/lib/system/voices-config';
import { yukiOutstanding } from '@/lib/system/voices-config';
import { NextResponse } from 'next/server';
import { count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    if (!process.env.YUKI_ACCESS_KEY || !process.env.YUKI_ADMINISTRATION_ID) {
      return NextResponse.json(
        {
          success: false,
          skipped: true,
          reason: 'Yuki credentials missing',
          message: 'Finance sync overgeslagen: YUKI credentials ontbreken.',
        },
        { status: 503 }
      );
    }

    console.log(' Starting Yuki Finance Sync...');

    // 1. Fetch from Yuki
    const outstanding = await YukiService.getOutstandingInvoices();
    console.log(` Fetched ${outstanding.length} outstanding invoices from Yuki`);

    const existingCountRows = await db
      .select({ value: count() })
      .from(yukiOutstanding);
    const existingCount = Number(existingCountRows[0]?.value || 0);

    if (outstanding.length === 0 && existingCount > 0) {
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: 'empty_fetch_preserved_snapshot',
        previousSnapshotCount: existingCount,
        message: 'Lege Yuki response gedetecteerd; bestaande snapshot behouden.',
      });
    }

    // 2. Refresh Database Mirror
    // We treat this table as a snapshot of the current state
    await db.transaction(async (tx: any) => {
      await tx.delete(yukiOutstanding);

      if (outstanding.length > 0) {
        await tx.insert(yukiOutstanding).values(outstanding.map((inv: any) => ({
          contactId: inv.contactName, // Using name as ID for display purposes
          invoiceNr: inv.invoiceNr,
          invoiceDate: new Date(inv.invoiceDate),
          dueDate: new Date(inv.dueDate),
          amount: inv.amount.toString(),
          openAmount: inv.openAmount.toString(),
          currency: 'EUR'
        })));
      }
    });

    return NextResponse.json({ success: true, synced: outstanding.length });
  } catch (error: any) {
    console.error(' Finance Sync Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
