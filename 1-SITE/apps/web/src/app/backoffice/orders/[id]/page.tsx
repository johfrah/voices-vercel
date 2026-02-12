import { OrderIntelligence } from '@/components/backoffice/OrderIntelligence';
import { PageWrapperInstrument, SectionInstrument } from '@/components/ui/LayoutInstruments';
import { db } from '@db';
import { orders } from '@db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getOrderData(id: string) {
  // We zoeken op wp_order_id of onze interne id
  const orderId = parseInt(id);
  
  const result = await db.query.orders.findFirst({
    where: eq(orders.wpOrderId, orderId),
    with: {
      user: true,
      items: {
        with: {
          actor: true
        }
      }
    }
  });

  return result;
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderData = await getOrderData(params.id);

  if (!orderData) {
    notFound();
  }

  // Transform for the component
  const transformedOrder = {
    ...orderData,
    display_order_id: orderData.wpOrderId?.toString() || orderData.id.toString(),
    journey: orderData.journey as 'agency' | 'studio' | 'academy',
    total: orderData.total?.toString() || '0',
    total_cost: orderData.totalCost?.toString() || '0',
    total_profit: orderData.totalProfit?.toString() || '0',
    user: {
      first_name: orderData.user?.firstName || 'Onbekende',
      last_name: orderData.user?.lastName || 'Klant',
      email: orderData.user?.email || '',
      customer_insights: orderData.user?.customerInsights || {}
    },
    items: orderData.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price?.toString() || '0',
      cost: item.cost?.toString() || '0',
      delivery_status: item.deliveryStatus || 'waiting',
      meta_data: item.metaData,
      actor: item.actor ? {
        name: item.actor.firstName,
        photo_url: '' // TODO: Add photo mapping
      } : undefined
    }))
  };

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white">
      <SectionInstrument className="max-w-7xl mx-auto px-6 py-12">
        <OrderIntelligence order={transformedOrder as any} />
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
