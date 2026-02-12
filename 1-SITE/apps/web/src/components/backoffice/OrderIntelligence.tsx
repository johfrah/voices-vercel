'use client';

import React from 'react';
import { BentoGrid, BentoCard } from '../ui/BentoGrid';
import { OrderHeader } from '../ui/Order/OrderHeader';
import { CustomerInstrument } from '../ui/Order/CustomerInstrument';
import { FinancialInstrument } from '../ui/Order/FinancialInstrument';
import { ProductionStatusInstrument } from '../ui/Order/ProductionStatusInstrument';
import { BriefingInstrument } from '../ui/Order/BriefingInstrument';
import { WorkshopPlanningInstrument } from '../ui/Order/WorkshopPlanningInstrument';

interface OrderItem {
  id: number;
  name: string;
  price: string;
  cost: string;
  delivery_status: string;
  meta_data: any;
  actor?: {
    name: string;
    photo_url: string;
  };
}

interface OrderIntelligenceProps {
  order: {
    id: number;
    display_order_id: string;
    journey: 'agency' | 'studio' | 'academy';
    status: string;
    total: string;
    total_cost: string;
    total_profit: string;
    created_at: string;
    items: OrderItem[];
    user: {
      first_name: string;
      last_name: string;
      email: string;
      customer_insights: any;
    };
  };
}

/**
 * ⚛️ ORDER INTELLIGENCE (NUCLEAR 2026)
 * Orchestrator voor order-inzichten.
 * HTML Zero, CSS Zero, Text Zero.
 */
export const OrderIntelligence: React.FC<OrderIntelligenceProps> = ({ order }) => {
  const isStudio = order.journey === 'studio';
  const isAgency = order.journey === 'agency';

  const formattedDate = new Date(order.created_at).toLocaleDateString('nl-BE', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <OrderHeader 
        id={order.display_order_id}
        date={formattedDate}
        journey={order.journey}
        status={order.status}
      />

      <BentoGrid columns={4}>
        <CustomerInstrument 
          firstName={order.user.first_name}
          lastName={order.user.last_name}
          email={order.user.email}
          company={order.user.customer_insights?.company}
          totalSpent={order.user.customer_insights?.total_spent || 0}
        />

        <FinancialInstrument 
          total={order.total}
          totalCost={order.total_cost}
          totalProfit={order.total_profit}
        />

        {isAgency && (
          <>
            <ProductionStatusInstrument items={order.items} />
            <BriefingInstrument script={order.items[0]?.meta_data?.script} />
          </>
        )}

        {isStudio && (
          <WorkshopPlanningInstrument 
            date={order.items[0]?.meta_data?.workshop_details?.datum}
            time={order.items[0]?.meta_data?.workshop_details?.tijd}
            age={order.items[0]?.meta_data?.workshop_details?.leeftijd}
            profession={order.items[0]?.meta_data?.workshop_details?.beroep}
          />
        )}
      </BentoGrid>
    </div>
  );
};
