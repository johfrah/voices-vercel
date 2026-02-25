import {
  ButtonInstrument,
  ContainerInstrument,
  HeadingInstrument,
  PageWrapperInstrument,
  SectionInstrument,
  TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { db } from '@/../../packages/database/src/index';
import { orderItems, orders, users, vaultFiles } from '@/../../packages/database/src/schema';
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
        userId: order.userId,
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
    console.error(' Error in getAssignments:', error);
    return [];
  }
}

export default async function ActorAssignmentDashboard() {
  const assignments = await getAssignments();

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        <SectionInstrument className="mb-12">
          <ContainerInstrument className="inline-block bg-black text-white text-[15px] font-light px-3 py-1 rounded-full mb-6 tracking-widest "><VoiceglotText  translationKey="admin.assignments.badge" defaultText="Production" /></ContainerInstrument>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter leading-none mb-4">
            <VoiceglotText  translationKey="admin.assignments.title_part1" defaultText="Actor" />
            <TextInstrument as="span" className="text-va-primary font-light">
              <VoiceglotText  translationKey="admin.assignments.title_part2" defaultText="Assignments." />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-xl text-black/40 font-medium tracking-tight"><VoiceglotText  translationKey="admin.assignments.subtitle" defaultText="Beheer uitgaande opdrachten, volg audio-leveringen en valideer facturen." /></TextInstrument>
        </SectionInstrument>

        <ContainerInstrument className="grid grid-cols-1 gap-4">
          {assignments.map((item) => (
            <ContainerInstrument key={item.id} className="bg-white rounded-[20px] p-6 border border-black/[0.03] shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
              <ContainerInstrument className="flex items-center gap-6 flex-1">
                <ContainerInstrument className="w-12 h-12 rounded-full bg-va-off-white flex items-center justify-center text-va-black/20 group-hover:bg-va-primary/10 group-hover:text-va-primary transition-colors">
                  <Mic strokeWidth={1.5} size={20} />
                </ContainerInstrument>
                
                <ContainerInstrument className="min-w-[200px]">
                  <TextInstrument className="text-[15px] font-light"><VoiceglotText  translationKey={`actor.${item.actorId}.name`} defaultText={item.actorName} noTranslate={true} /></TextInstrument>
                  <TextInstrument className="text-[15px] text-black/40 font-light tracking-wider">
                    <VoiceglotText  translationKey="common.order" defaultText="Order" />#{item.displayOrderId}  <VoiceglotText  translationKey={`user.${item.userId}.name`} defaultText={item.customerName} noTranslate={true} />
                    {item.customerCompany && ` (${item.customerCompany})`}
                  </TextInstrument>
                  <TextInstrument className="text-[15px] text-va-primary font-light mt-1">
                    <VoiceglotText  translationKey="common.budget" defaultText="Budget" />:  {item.budget}
                  </TextInstrument>
                </ContainerInstrument>

                <ContainerInstrument className="flex items-center gap-4 px-6 border-l border-black/5">
                  <ContainerInstrument className="flex flex-col items-center">
                    <Mail strokeWidth={1.5} size={14} className={clsx(item.emailStatus ? "text-green-500" : "text-va-black/20")} />
                    <TextInstrument className="text-[15px] font-light mt-1"><VoiceglotText  translationKey="common.sent" defaultText="Sent" /></TextInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="flex flex-col items-center">
                    <Eye strokeWidth={1.5} size={14} className={clsx(item.emailStatus === 'opened' ? "text-blue-500" : "text-va-black/20")} />
                    <TextInstrument className="text-[15px] font-light mt-1"><VoiceglotText  translationKey="common.read" defaultText="Read" /></TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>

                <ContainerInstrument className="flex flex-col gap-1 px-6 border-l border-black/5 min-w-[140px]">
                  <ContainerInstrument className="flex items-center gap-2">
                    <Send strokeWidth={1.5} size={10} className="text-black/20" />
                    <TextInstrument className="text-[15px] font-light text-black/40 tracking-tight">
                      {item.sentAtFormatted}
                    </TextInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="flex items-center gap-2">
                    <Clock strokeWidth={1.5} size={10} className={clsx(item.isOverdue ? "text-red-500" : "text-black/20")} />
                    <TextInstrument className={clsx("text-[15px] font-light tracking-tight", item.isOverdue ? "text-red-500" : "text-black/60")}>
                      {item.expectedAtFormatted}
                    </TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>

                <ContainerInstrument className="flex items-center gap-3 px-6 border-l border-black/5">
                  <ContainerInstrument className={clsx(
                    "px-3 py-1 rounded-full text-[15px] font-light tracking-widest flex items-center gap-2 uppercase",
                    item.deliveryStatus === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {item.deliveryStatus === 'approved' ? <CheckCircle2 strokeWidth={1.5} size={12} /> : <Clock strokeWidth={1.5} size={12} />}
                    <VoiceglotText  translationKey={`common.status.${item.deliveryStatus}`} defaultText={item.deliveryStatus || ''} />
                  </ContainerInstrument>
                  {item.isOverdue && (
                    <ContainerInstrument className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[15px] font-light tracking-widest flex items-center gap-2 ">
                      <AlertCircle strokeWidth={1.5} size={12} /> <VoiceglotText  translationKey="common.overdue" defaultText="Overdue" />
                    </ContainerInstrument>
                  )}
                </ContainerInstrument>

                <ContainerInstrument className="flex items-center gap-3 px-6 border-l border-black/5">
                  <ContainerInstrument className={clsx(
                    "px-3 py-1 rounded-full text-[15px] font-light tracking-widest flex items-center gap-2 uppercase",
                    item.hasInvoice ? "bg-blue-100 text-blue-700" : "bg-va-off-white text-va-black/40"
                  )}>
                    <FileText strokeWidth={1.5} size={12} />
                    {item.hasInvoice ? <VoiceglotText  translationKey="common.invoice_ok" defaultText="Factuur OK" /> : <VoiceglotText  translationKey="common.no_invoice" defaultText="Geen Factuur" />}
                  </ContainerInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="flex items-center gap-2">
                <ButtonInstrument as={Link} href={`/backoffice/orders/${item.displayOrderId}`} className="p-2 hover:bg-va-off-white rounded-[10px] transition-colors text-va-black/20 hover:text-va-black">
                  <ExternalLink strokeWidth={1.5} size={18} />
                </ButtonInstrument>
                {item.deliveryStatus === 'approved' && item.hasInvoice && (
                  <ButtonInstrument className="va-btn-pro py-2 px-4 text-[15px]"><VoiceglotText  translationKey="admin.cta.pay_ponto" defaultText="PAY WITH PONTO" /></ButtonInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
