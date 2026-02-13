import { PontoBridge } from '@/lib/payments/ponto-bridge';
import { YukiService } from '@/services/YukiService';
import { db } from '@db';
import { yukiOutstanding } from '@db/schema';
import { desc } from 'drizzle-orm';
import { SyncButton } from './sync-button';

export const dynamic = 'force-dynamic';

export default async function FinanceDashboard() {
  // 1. Fetch Live Data
  const [yukiLive, pontoPending, dbOutstanding] = await Promise.all([
    YukiService.getOutstandingInvoices(),
    PontoBridge.getPendingPayouts(),
    db.select().from(yukiOutstanding).orderBy(desc(yukiOutstanding.invoiceDate))
  ]);

  // 2. Calculate Stats
  const totalOutstanding = yukiLive.reduce((acc, inv) => acc + inv.openAmount, 0);
  const totalPendingPayout = pontoPending.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-va-black mb-2">Finance Dashboard</h1>
          <p className="text-va-gray-500">Yuki & Ponto Reconciliatie Centrum</p>
        </div>
        <SyncButton strokeWidth={1.5} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] shadow-aura border border-va-gray-100">
          <h3 className="text-[15px] font-medium text-va-gray-400 tracking-wider mb-2">Openstaand (Yuki)</h3>
          <p className="text-3xl font-light text-va-black">€{totalOutstanding.toFixed(2)}</p>
          <p className="text-[15px] text-va-gray-400 mt-2">{yukiLive.length} facturen</p>
        </div>
        <div className="bg-white p-6 rounded-[20px] shadow-aura border border-va-gray-100">
          <h3 className="text-[15px] font-medium text-va-gray-400 tracking-wider mb-2">Wacht op Ponto</h3>
          <p className="text-3xl font-light text-va-black">€{totalPendingPayout.toFixed(2)}</p>
          <p className="text-[15px] text-va-gray-400 mt-2">{pontoPending.length} uitbetalingen</p>
        </div>
        <div className="bg-white p-6 rounded-[20px] shadow-aura border border-va-gray-100">
          <h3 className="text-[15px] font-medium text-va-gray-400 tracking-wider mb-2">Reconciliatie Gap</h3>
          <p className="text-3xl font-light text-va-black">€{(totalOutstanding - totalPendingPayout).toFixed(2)}</p>
          <p className="text-[15px] text-green-500 mt-2">Te ontvangen</p>
        </div>
      </div>

      {/* Yuki Outstanding Table */}
      <div className="bg-white rounded-[20px] shadow-aura border border-va-gray-100 overflow-hidden">
        <div className="p-6 border-b border-va-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-light">Openstaande Facturen (Live)</h2>
          <span className="text-[15px] bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Yuki Connected
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-va-off-white">
              <tr>
                <th className="px-6 py-3 text-left text-[15px] font-medium text-va-gray-500 tracking-wider">Factuur</th>
                <th className="px-6 py-3 text-left text-[15px] font-medium text-va-gray-500 tracking-wider">Klant</th>
                <th className="px-6 py-3 text-left text-[15px] font-medium text-va-gray-500 tracking-wider">Datum</th>
                <th className="px-6 py-3 text-left text-[15px] font-medium text-va-gray-500 tracking-wider">Vervaldatum</th>
                <th className="px-6 py-3 text-right text-[15px] font-medium text-va-gray-500 tracking-wider">Bedrag</th>
                <th className="px-6 py-3 text-right text-[15px] font-medium text-va-gray-500 tracking-wider">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-va-gray-100">
              {yukiLive.map((inv) => (
                <tr key={inv.id} className="hover:bg-va-off-white/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] font-medium text-va-black">{inv.invoiceNr}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-va-gray-600">{inv.contactName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-va-gray-500">
                    {new Date(inv.invoiceDate).toLocaleDateString('nl-BE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-va-gray-500">
                    {new Date(inv.dueDate).toLocaleDateString('nl-BE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-right text-va-gray-600">€{inv.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-right font-medium text-red-500">€{inv.openAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ponto Pending Table */}
      <div className="bg-white rounded-[20px] shadow-aura border border-va-gray-100 overflow-hidden">
        <div className="p-6 border-b border-va-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-light">Wachtend op Uitbetaling (Ponto)</h2>
          <span className="text-[15px] bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Ready for Approval
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-va-off-white">
              <tr>
                <th className="px-6 py-3 text-left text-[15px] font-medium text-va-gray-500 tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-[15px] font-medium text-va-gray-500 tracking-wider">Ontvanger</th>
                <th className="px-6 py-3 text-left text-[15px] font-medium text-va-gray-500 tracking-wider">IBAN</th>
                <th className="px-6 py-3 text-left text-[15px] font-medium text-va-gray-500 tracking-wider">Referentie</th>
                <th className="px-6 py-3 text-right text-[15px] font-medium text-va-gray-500 tracking-wider">Bedrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-va-gray-100">
              {pontoPending.map((payout) => (
                <tr key={payout.orderId} className="hover:bg-va-off-white/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] font-medium text-va-black">#{payout.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-va-gray-600">{payout.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-va-gray-500 font-mono">{payout.iban}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-va-gray-500">{payout.reference}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-right font-medium text-va-black">€{payout.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
