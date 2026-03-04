import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import {
  getLocalSequenceState,
  normalizeDocumentType,
  resetLocalSequence,
  reserveLocalDocumentNumber,
} from '@/lib/services/local-document-sequence-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const marketCode = String(searchParams.get('market_code') || 'BE').trim().toUpperCase();
    const documentTypeRaw = searchParams.get('document_type');

    if (documentTypeRaw) {
      const documentType = normalizeDocumentType(documentTypeRaw);
      const state = await getLocalSequenceState(documentType, marketCode);
      return NextResponse.json({ success: true, sequence: state });
    }

    const [invoice, creditNote] = await Promise.all([
      getLocalSequenceState('invoice', marketCode),
      getLocalSequenceState('credit_note', marketCode),
    ]);

    return NextResponse.json({
      success: true,
      sequences: {
        invoice,
        credit_note: creditNote,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch local sequence state' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const action = String(body.action || '').trim().toLowerCase();
    const adminEmail = auth.user?.email || null;

    if (action === 'reserve_next') {
      const orderId = Number(body.order_id);
      const documentType = normalizeDocumentType(String(body.document_type || 'invoice'));
      const marketCode = String(body.market_code || 'BE').trim().toUpperCase();
      const idempotencyKey =
        String(body.idempotency_key || '').trim() ||
        `${documentType}-${orderId}-${Date.now()}`;
      const auditNote = String(body.audit_note || '').trim() || null;

      const result = await reserveLocalDocumentNumber({
        order_id: orderId,
        document_type: documentType,
        market_code: marketCode,
        idempotency_key: idempotencyKey,
        admin_email: adminEmail,
        audit_note: auditNote,
      });

      return NextResponse.json({ success: true, result });
    }

    if (action === 'reset') {
      const documentType = normalizeDocumentType(String(body.document_type || 'invoice'));
      const marketCode = String(body.market_code || 'BE').trim().toUpperCase();
      const newNextNumber = Number(body.new_next_number);
      const reasonNote = String(body.reason_note || '').trim();
      if (!Number.isFinite(newNextNumber) || newNextNumber <= 0) {
        return NextResponse.json(
          { error: 'new_next_number must be a positive number' },
          { status: 400 }
        );
      }
      if (!reasonNote) {
        return NextResponse.json({ error: 'reason_note is required' }, { status: 400 });
      }

      const sequence = await resetLocalSequence({
        document_type: documentType,
        market_code: marketCode,
        new_next_number: newNextNumber,
        reason_note: reasonNote,
        admin_email: adminEmail,
      });

      return NextResponse.json({ success: true, sequence });
    }

    return NextResponse.json(
      { error: 'Unsupported action. Use reserve_next or reset.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process sequence action' },
      { status: 500 }
    );
  }
}
