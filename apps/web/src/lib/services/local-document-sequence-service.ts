import { appConfigs, db, orderNotes, orders, systemEvents, yukiOutstanding } from '@/lib/system/voices-config';
import { desc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export type DocumentType = 'invoice' | 'credit_note';

type SequenceConfig = {
  document_type: DocumentType;
  market_code: string;
  series_prefix: string;
  series_year: number;
  padding: number;
  next_number: number;
  last_issued_number: number | null;
  last_issued_order_id: number | null;
  last_issued_at: string | null;
  last_reset_at: string | null;
  last_reset_note: string | null;
  last_reset_by_admin_email: string | null;
  version: number;
};

type SequenceState = {
  sequence_key: string;
  document_type: DocumentType;
  market_code: string;
  exists: boolean;
  next_number: number;
  next_formatted_number: string;
  config: SequenceConfig;
};

type ReserveOptions = {
  order_id: number;
  document_type: DocumentType;
  market_code?: string;
  idempotency_key: string;
  admin_email?: string | null;
  audit_note?: string | null;
};

type ReserveResult = {
  order_id: number;
  document_type: DocumentType;
  sequence_key: string;
  local_number: string;
  local_number_int: number;
  reserved_at: string;
  already_reserved: boolean;
  state: 'reserved';
};

type ResetOptions = {
  document_type: DocumentType;
  market_code?: string;
  new_next_number: number;
  reason_note: string;
  admin_email?: string | null;
};

function asRows<T = any>(value: any): T[] {
  if (Array.isArray(value)) return value as T[];
  if (Array.isArray(value?.rows)) return value.rows as T[];
  return [];
}

function parseJson(value: any): Record<string, any> {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  if (typeof value === 'object') return value as Record<string, any>;
  return {};
}

function normalizeMarketCode(value?: string | null): string {
  const normalized = String(value || 'BE').trim().toUpperCase();
  return normalized || 'BE';
}

export function normalizeDocumentType(value: string): DocumentType {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'invoice') return 'invoice';
  if (normalized === 'credit_note') return 'credit_note';
  throw new Error(`Unsupported document_type: ${value}`);
}

function getSequenceKey(documentType: DocumentType, marketCode: string): string {
  return `finance_sequence_${documentType}_${marketCode.toLowerCase()}`;
}

function defaultPrefix(documentType: DocumentType): string {
  return documentType === 'credit_note' ? 'CN-' : '';
}

function buildDefaultConfig(documentType: DocumentType, marketCode: string, nextNumber: number): SequenceConfig {
  return {
    document_type: documentType,
    market_code: marketCode,
    series_prefix: defaultPrefix(documentType),
    series_year: new Date().getFullYear(),
    padding: 0,
    next_number: Math.max(1, Math.round(Number(nextNumber || 1))),
    last_issued_number: null,
    last_issued_order_id: null,
    last_issued_at: null,
    last_reset_at: null,
    last_reset_note: null,
    last_reset_by_admin_email: null,
    version: 1,
  };
}

function extractNumericTail(value: unknown): number | null {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const match = raw.match(/(\d{3,})$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatLocalNumber(config: SequenceConfig, numberValue: number): string {
  const prefix = String(config.series_prefix || '');
  const padding = Math.max(0, Number(config.padding || 0));
  const numeric = padding > 0 ? String(numberValue).padStart(padding, '0') : String(numberValue);
  return `${prefix}${numeric}`;
}

async function inferInitialNextNumber(documentType: DocumentType, marketCode: string): Promise<number> {
  if (documentType === 'credit_note') {
    const recentOrders = await db
      .select({ rawMeta: orders.rawMeta })
      .from(orders)
      .where(sql`${orders.rawMeta} is not null`)
      .orderBy(desc(orders.id))
      .limit(1000);
    const tails = recentOrders
      .map((row: any) => {
        const meta = parseJson(row.rawMeta);
        const localCredit =
          meta?.local_documents?.credit_note?.local_number ||
          meta?._credit_note_number ||
          null;
        return extractNumericTail(localCredit);
      })
      .filter((value: number | null): value is number => Number.isFinite(value));
    const maxValue = tails.length > 0 ? Math.max(...tails) : 0;
    return Math.max(1, maxValue + 1);
  }

  const recentOrders = await db
    .select({
      rawMeta: orders.rawMeta,
      yukiInvoiceId: orders.yukiInvoiceId,
    })
    .from(orders)
    .where(sql`${orders.rawMeta} is not null or ${orders.yukiInvoiceId} is not null`)
    .orderBy(desc(orders.id))
    .limit(1000);

  const outstandingRows = await db
    .select({ invoiceNr: yukiOutstanding.invoiceNr })
    .from(yukiOutstanding)
    .orderBy(desc(yukiOutstanding.id))
    .limit(1000);

  const values: string[] = [];
  for (const row of recentOrders as any[]) {
    const meta = parseJson(row.rawMeta);
    const invoiceNumber =
      meta?._invoice_number ||
      meta?.yuki_invoice_number ||
      meta?.local_documents?.invoice?.local_number ||
      null;
    if (invoiceNumber) values.push(String(invoiceNumber));
    if (row.yukiInvoiceId && !String(row.yukiInvoiceId).toUpperCase().startsWith('YUK-')) {
      values.push(String(row.yukiInvoiceId));
    }
  }

  for (const row of outstandingRows as any[]) {
    if (row.invoiceNr) values.push(String(row.invoiceNr));
  }

  const tails = values
    .map(extractNumericTail)
    .filter((value: number | null): value is number => Number.isFinite(value));

  const maxValue = tails.length > 0 ? Math.max(...tails) : 0;
  return Math.max(1, maxValue + 1);
}

async function ensureSequenceConfigRow(
  tx: any,
  documentType: DocumentType,
  marketCode: string
): Promise<{ sequence_key: string; config: SequenceConfig; exists: boolean }> {
  const sequenceKey = getSequenceKey(documentType, marketCode);
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${sequenceKey}))`);

  let configRowsRaw = await tx.execute(
    sql`select id, value from app_configs where key = ${sequenceKey} for update`
  );
  let configRows = asRows<{ id: number; value: any }>(configRowsRaw);
  let exists = configRows.length > 0;

  if (!exists) {
    const inferredNext = await inferInitialNextNumber(documentType, marketCode);
    const seededConfig = buildDefaultConfig(documentType, marketCode, inferredNext);
    await tx
      .insert(appConfigs)
      .values({
        key: sequenceKey,
        value: seededConfig,
        description: `Local ${documentType} sequence for market ${marketCode}`,
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
    configRowsRaw = await tx.execute(
      sql`select id, value from app_configs where key = ${sequenceKey} for update`
    );
    configRows = asRows<{ id: number; value: any }>(configRowsRaw);
  }

  const row = configRows[0];
  const parsed = parseJson(row?.value);
  const config: SequenceConfig = {
    ...buildDefaultConfig(documentType, marketCode, 1),
    ...parsed,
    document_type: documentType,
    market_code: marketCode,
    next_number: Math.max(1, Number(parsed.next_number || 1)),
    series_prefix: String(
      parsed.series_prefix ?? defaultPrefix(documentType)
    ),
    padding: Math.max(0, Number(parsed.padding || 0)),
    version: Math.max(1, Number(parsed.version || 1)),
  };

  return { sequence_key: sequenceKey, config, exists };
}

async function isCandidateTaken(
  tx: any,
  documentType: DocumentType,
  orderId: number,
  candidate: string
): Promise<boolean> {
  if (documentType === 'credit_note') {
    const raw = await tx.execute(sql`
      select exists(
        select 1
        from orders
        where id <> ${orderId}
          and (
            coalesce(raw_meta->>'_credit_note_number', '') = ${candidate}
            or coalesce(raw_meta #>> '{local_documents,credit_note,local_number}', '') = ${candidate}
          )
      ) as taken
    `);
    const rows = asRows<{ taken: boolean }>(raw);
    return Boolean(rows[0]?.taken);
  }

  const raw = await tx.execute(sql`
    select exists(
      select 1
      from orders
      where id <> ${orderId}
        and (
          coalesce(raw_meta->>'_invoice_number', '') = ${candidate}
          or coalesce(raw_meta->>'yuki_invoice_number', '') = ${candidate}
          or coalesce(raw_meta #>> '{local_documents,invoice,local_number}', '') = ${candidate}
        )
    ) as taken
  `);
  const rows = asRows<{ taken: boolean }>(raw);
  return Boolean(rows[0]?.taken);
}

export async function getLocalSequenceState(
  documentType: DocumentType,
  marketCodeInput?: string
): Promise<SequenceState> {
  const marketCode = normalizeMarketCode(marketCodeInput);
  const sequenceKey = getSequenceKey(documentType, marketCode);
  const row = await db
    .select({ value: appConfigs.value })
    .from(appConfigs)
    .where(eq(appConfigs.key, sequenceKey))
    .limit(1)
    .then((rows: any[]) => rows[0] || null);

  if (!row) {
    const inferred = await inferInitialNextNumber(documentType, marketCode);
    const config = buildDefaultConfig(documentType, marketCode, inferred);
    return {
      sequence_key: sequenceKey,
      document_type: documentType,
      market_code: marketCode,
      exists: false,
      next_number: config.next_number,
      next_formatted_number: formatLocalNumber(config, config.next_number),
      config,
    };
  }

  const parsed = parseJson(row.value);
  const config: SequenceConfig = {
    ...buildDefaultConfig(documentType, marketCode, 1),
    ...parsed,
    document_type: documentType,
    market_code: marketCode,
    next_number: Math.max(1, Number(parsed.next_number || 1)),
    series_prefix: String(parsed.series_prefix ?? defaultPrefix(documentType)),
    padding: Math.max(0, Number(parsed.padding || 0)),
    version: Math.max(1, Number(parsed.version || 1)),
  };

  return {
    sequence_key: sequenceKey,
    document_type: documentType,
    market_code: marketCode,
    exists: true,
    next_number: config.next_number,
    next_formatted_number: formatLocalNumber(config, config.next_number),
    config,
  };
}

export async function reserveLocalDocumentNumber(options: ReserveOptions): Promise<ReserveResult> {
  const orderId = Number(options.order_id);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    throw new Error('Invalid order_id');
  }
  const documentType = options.document_type;
  const marketCode = normalizeMarketCode(options.market_code);
  const idempotencyKey = String(options.idempotency_key || '').trim();
  if (!idempotencyKey) {
    throw new Error('idempotency_key is required');
  }

  return db.transaction(async (tx: any) => {
    await tx.execute(sql`set local lock_timeout = '5s'`);

    const orderRaw = await tx.execute(
      sql`select id, market, raw_meta from orders where id = ${orderId} for update`
    );
    const orderRows = asRows<{ id: number; market: string | null; raw_meta: any }>(orderRaw);
    const orderRow = orderRows[0];
    if (!orderRow) {
      throw new Error(`Order ${orderId} not found`);
    }

    const effectiveMarketCode = normalizeMarketCode(orderRow.market || marketCode);
    const existingRawMeta = parseJson(orderRow.raw_meta);
    const existingNumber =
      documentType === 'invoice'
        ? String(
            existingRawMeta?.local_documents?.invoice?.local_number ||
              existingRawMeta?._invoice_number ||
              ''
          ).trim()
        : String(
            existingRawMeta?.local_documents?.credit_note?.local_number ||
              existingRawMeta?._credit_note_number ||
              ''
          ).trim();

    if (existingNumber) {
      const existingInt = extractNumericTail(existingNumber) || 0;
      return {
        order_id: orderId,
        document_type: documentType,
        sequence_key: getSequenceKey(documentType, effectiveMarketCode),
        local_number: existingNumber,
        local_number_int: existingInt,
        reserved_at:
          existingRawMeta?.local_documents?.[documentType]?.reserved_at ||
          new Date().toISOString(),
        already_reserved: true,
        state: 'reserved',
      };
    }

    const { sequence_key, config } = await ensureSequenceConfigRow(
      tx,
      documentType,
      effectiveMarketCode
    );

    let candidateInt = Math.max(1, Number(config.next_number || 1));
    let candidateFormatted = formatLocalNumber(config, candidateInt);

    for (let guard = 0; guard < 200; guard += 1) {
      // eslint-disable-next-line no-await-in-loop
      const taken = await isCandidateTaken(tx, documentType, orderId, candidateFormatted);
      if (!taken) break;
      candidateInt += 1;
      candidateFormatted = formatLocalNumber(config, candidateInt);
    }

    const now = new Date().toISOString();
    const reservationId = randomUUID();
    const documentPayload = {
      reservation_id: reservationId,
      sequence_key,
      local_number: candidateFormatted,
      local_number_int: candidateInt,
      series_year: config.series_year,
      reserved_at: now,
      reserved_by_admin_email: options.admin_email || null,
      idempotency_key: idempotencyKey,
      state: 'reserved',
      reconciliation: {
        yuki_sync_status: 'pending_yuki',
        yuki_document_id: null,
        yuki_official_number: null,
        mapped_at: null,
        mapped_by_admin_email: null,
        last_error: null,
      },
    };

    const nextRawMeta = {
      ...existingRawMeta,
      local_documents: {
        ...(existingRawMeta.local_documents || {}),
        [documentType]: documentPayload,
      },
      ...(documentType === 'invoice'
        ? { _invoice_number: candidateFormatted }
        : { _credit_note_number: candidateFormatted }),
    };

    const nextConfig: SequenceConfig = {
      ...config,
      market_code: effectiveMarketCode,
      next_number: candidateInt + 1,
      last_issued_number: candidateInt,
      last_issued_order_id: orderId,
      last_issued_at: now,
      version: Math.max(1, Number(config.version || 1)) + 1,
    };

    await tx
      .update(appConfigs)
      .set({
        value: nextConfig,
        updatedAt: new Date(),
      })
      .where(eq(appConfigs.key, sequence_key));

    await tx
      .update(orders)
      .set({
        rawMeta: nextRawMeta,
        is_manually_edited: true,
      })
      .where(eq(orders.id, orderId));

    const noteLabel =
      documentType === 'invoice' ? 'Lokaal factuurnummer' : 'Lokaal creditnotanummer';
    await tx.insert(orderNotes).values({
      orderId,
      note: `${noteLabel} gereserveerd: ${candidateFormatted}${
        options.audit_note ? ` • ${options.audit_note}` : ''
      }`,
      isCustomerNote: false,
    });

    await tx.insert(systemEvents).values({
      source: 'finance/local-sequence',
      level: 'info',
      message: `${noteLabel} gereserveerd voor order ${orderId}`,
      details: {
        order_id: orderId,
        document_type: documentType,
        sequence_key,
        local_number: candidateFormatted,
        local_number_int: candidateInt,
        reserved_by_admin_email: options.admin_email || null,
      },
      createdAt: new Date(),
    });

    return {
      order_id: orderId,
      document_type: documentType,
      sequence_key,
      local_number: candidateFormatted,
      local_number_int: candidateInt,
      reserved_at: now,
      already_reserved: false,
      state: 'reserved',
    };
  });
}

export async function resetLocalSequence(options: ResetOptions): Promise<SequenceState> {
  const documentType = options.document_type;
  const marketCode = normalizeMarketCode(options.market_code);
  const newNextNumber = Math.max(1, Number(options.new_next_number || 1));
  const reasonNote = String(options.reason_note || '').trim();
  if (!reasonNote) {
    throw new Error('reason_note is required');
  }

  const sequenceKey = getSequenceKey(documentType, marketCode);

  return db.transaction(async (tx: any) => {
    await tx.execute(sql`set local lock_timeout = '5s'`);
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${sequenceKey}))`);

    const ensured = await ensureSequenceConfigRow(tx, documentType, marketCode);
    const previousConfig = ensured.config;
    const nextConfig: SequenceConfig = {
      ...previousConfig,
      next_number: newNextNumber,
      last_reset_at: new Date().toISOString(),
      last_reset_note: reasonNote,
      last_reset_by_admin_email: options.admin_email || null,
      version: Math.max(1, Number(previousConfig.version || 1)) + 1,
    };

    await tx
      .update(appConfigs)
      .set({
        value: nextConfig,
        updatedAt: new Date(),
      })
      .where(eq(appConfigs.key, sequenceKey));

    await tx.insert(systemEvents).values({
      source: 'finance/local-sequence',
      level: 'warn',
      message: `Lokale sequence reset (${documentType}, ${marketCode})`,
      details: {
        sequence_key: sequenceKey,
        previous_next_number: previousConfig.next_number,
        new_next_number: newNextNumber,
        reason_note: reasonNote,
        admin_email: options.admin_email || null,
      },
      createdAt: new Date(),
    });

    return {
      sequence_key: sequenceKey,
      document_type: documentType,
      market_code: marketCode,
      exists: true,
      next_number: nextConfig.next_number,
      next_formatted_number: formatLocalNumber(nextConfig, nextConfig.next_number),
      config: nextConfig,
    };
  });
}
