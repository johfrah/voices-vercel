import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { db } from '@db';
import { orderItems, orders, users, vaultFiles } from '@db/schema';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { desc, eq } from 'drizzle-orm';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Eye, FileText, Mail, Mic, Send } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getAssignments() {
  try {
    const assignmentsData = await db.select({
      item: orderItems,
      order: orders,
      customer: users
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.journey, 'agency'))
    .orderBy(desc(orderItems.createdAt));

    const invoices = await db.query.vaultFiles.findMany({
      where: eq(vaultFiles.category, 'invoice')
    });

    const actorsData = await db.query.actors.findMany({
      with: { user: true }
    } as any);

    const actorsMap = new Map(actorsData.map(a => [a.id, a]));
    const actorsByWpProductIdMap = new Map(actorsData.map(a => [a.wpProductId, a]));

    return assignmentsData.map(({ item, order, customer }) => {
      const hasInvoice = invoices.some(inv => inv.actorId === item.actorId && inv.aiMetadata && (inv.aiMetadata as any).mailSubject?.includes(item.orderId?.toString()));
      
      let actor = item.actorId ? actorsMap.get(item.actorId) : null;
      
      if (!actor && item.productId) {
        actor = actorsByWpProductIdMap.get(item.productId) || null;
      }

      const sentDate = item.createdAt ? new Date(item.createdAt) : new Date();
      const expectedDate = order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : new Date(sentDate.getTime() + 24 * 60 * 60 * 1000);

      return {
        ...item,
        hasInvoice,
        customerName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || customer?.email || 'Onbekende Klant',
        customerCompany: customer?.companyName || '',
        actorName: `${(actor as any)?.firstName || ''} ${(actor as any)?.lastName || ''}`.trim() || item.name || 'Onbekende Acteur',
        displayOrderId: order.wpOrderId || item.orderId,
        budget: item.price,
        cost: item.cost,
        sentAtFormatted: format(sentDate, 'd MMM, HH:mm', { locale: nl }),
        expectedAtFormatted: format(expectedDate, 'd MMM, HH:mm', { locale: nl }),
        isOverdue: new Date() > expectedDate && item.deliveryStatus !== 'approved',
        emailStatus: 'opened',
      };
    });
  } catch (error) {
    console.error('❌ Error in getAssignments:', error);
    return [];
  }
}

export default async function ActorAssignmentCockpit() {
  const assignments = await getAssignments();

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        <SectionInstrument className="mb-12">
          <ContainerInstrument className="inline-block bg-black text-white text-[10px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
            <VoiceglotText translationKey="admin.assignments.badge" defaultText="Production" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter leading-none mb-4">
            <VoiceglotText translationKey="admin.assignments.title_part1" defaultText="Actor" /> <TextInstrument as="span" className="text-va-primary"><VoiceglotText translationKey="admin.assignments.title_part2" defaultText="Assignments." /></TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-xl text-black/40 font-medium tracking-tight">
            <VoiceglotText translationKey="admin.assignments.subtitle" defaultText="Beheer uitgaande opdrachten, volg audio-leveringen en valideer facturen." />
          </TextInstrument>
        </SectionInstrument>

        <ContainerInstrument className="grid grid-cols-1 gap-4">
          {assignments.map((item) => (
            <ContainerInstrument key={item.id} className="bg-white rounded-[40px] p-6 border border-black/[0.03] shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-va-primary/10 group-hover:text-va-primary transition-colors">
                  <Mic size={20} />
                </div>
                
                <div className="min-w-[200px]">
                  <TextInstrument className="text-sm font-black">
                    <VoiceglotText translationKey={`actor.${item.actorId}.name`} defaultText={item.actorName} noTranslate={true} />
                  </TextInstrument>
                  <TextInstrument className="text-[10px] text-black/40 uppercase font-bold tracking-wider">
                    <VoiceglotText translationKey="common.order" defaultText="Order" /> #{item.displayOrderId} • <VoiceglotText translationKey={`user.${item.userId}.name`} defaultText={item.customerName} noTranslate={true} />
                    {item.customerCompany && ` (${item.customerCompany})`}
                  </TextInstrument>
                  <TextInstrument className="text-[10px] text-va-primary font-black uppercase mt-1">
                    <VoiceglotText translationKey="common.budget" defaultText="Budget" />: € {item.budget}
                  </TextInstrument>
                </div>

                <div className="flex items-center gap-4 px-6 border-l border-black/5">
                  <div className="flex flex-col items-center">
                    <Mail size={14} className={clsx(item.emailStatus ? "text-green-500" : "text-slate-300")} />
                    <TextInstrument className="text-[8px] font-black uppercase mt-1">
                      <VoiceglotText translationKey="common.sent" defaultText="Sent" />
                    </TextInstrument>
                  </div>
                  <div className="flex flex-col items-center">
                    <Eye size={14} className={clsx(item.emailStatus === 'opened' ? "text-blue-500" : "text-slate-300")} />
                    <TextInstrument className="text-[8px] font-black uppercase mt-1">
                      <VoiceglotText translationKey="common.read" defaultText="Read" />
                    </TextInstrument>
                  </div>
                </div>

                <div className="flex flex-col gap-1 px-6 border-l border-black/5 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <Send size={10} className="text-black/20" />
                    <TextInstrument className="text-[9px] font-bold text-black/40 uppercase tracking-tight">
                      {item.sentAtFormatted}
                    </TextInstrument>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={10} className={clsx(item.isOverdue ? "text-red-500" : "text-black/20")} />
                    <TextInstrument className={clsx("text-[9px] font-black uppercase tracking-tight", item.isOverdue ? "text-red-500" : "text-black/60")}>
                      {item.expectedAtFormatted}
                    </TextInstrument>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 border-l border-black/5">
                  <div className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                    item.deliveryStatus === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {item.deliveryStatus === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    <VoiceglotText translationKey={`common.status.${item.deliveryStatus}`} defaultText={item.deliveryStatus || ''} />
                  </div>
                  {item.isOverdue && (
                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={12} /> <VoiceglotText translationKey="common.overdue" defaultText="Overdue" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 px-6 border-l border-black/5">
                  <div className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                    item.hasInvoice ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"
                  )}>
                    <FileText size={12} />
                    {item.hasInvoice ? <VoiceglotText translationKey="common.invoice_ok" defaultText="Factuur OK" /> : <VoiceglotText translationKey="common.no_invoice" defaultText="Geen Factuur" />}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/backoffice/orders/${item.displayOrderId}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-black">
                  <ExternalLink size={18} />
                </Link>
                {item.deliveryStatus === 'approved' && item.hasInvoice && (
                  <button className="va-btn-pro py-2 px-4 text-[10px]">
                    <VoiceglotText translationKey="admin.cta.pay_ponto" defaultText="PAY WITH PONTO" />
                  </button>
                )}
              </div>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
