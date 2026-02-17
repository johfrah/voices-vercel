import { YukiService } from '@/services/YukiService';
import { db } from '@db';
import { yukiOutstanding } from '@db/schema';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log(' Starting Yuki Finance Sync...');

    // 1. Fetch from Yuki
    const outstanding = await YukiService.getOutstandingInvoices();
    console.log(` Fetched ${outstanding.length} outstanding invoices from Yuki`);

    // 2. Refresh Database Mirror
    // We treat this table as a snapshot of the current state
    await db.transaction(async (tx) => {
      await tx.delete(yukiOutstanding);

      if (outstanding.length > 0) {
        await tx.insert(yukiOutstanding).values(outstanding.map(inv => ({
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
