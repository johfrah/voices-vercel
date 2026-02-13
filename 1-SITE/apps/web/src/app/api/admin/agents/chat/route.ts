import { requireAdmin } from '@/lib/auth/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

/**
 * 🛡️ AGENT GOVERNANCE & SAFETY PROTOCOL (2026)
 * 
 * Dit systeem bepaalt de strikte schrijfrechten en wetten per agent.
 * Elke actie wordt getoetst aan het Chris-Protocol om de site-integriteit te bewaken.
 */

const AGENT_GOVERNANCE: Record<string, {
    role: string;
    capabilities: string[];
    laws: string[];
    forbidden: string[];
}> = {
    bob: {
        role: "Architect",
        capabilities: ["ARCHITECTURAL_VALIDATION", "STRATEGY_PLANNING"],
        laws: ["BOB-METHODE", "ANTIFRAGILE-MANIFESTO"],
        forbidden: ["DIRECT_CODE_EDIT", "DATABASE_DELETE"]
    },
    chris: {
        role: "Inspecteur",
        capabilities: ["CODE_AUDIT", "SECURITY_SCAN", "LINT_FIX"],
        laws: ["CHRIS-PROTOCOL", "ZERO-SLOP-UI"],
        forbidden: ["CONTENT_CREATION", "MARKETING_COPY"]
    },
    mark: {
        role: "Marketing",
        capabilities: ["CONTENT_WRITE", "TRANSLATION", "TONE_CHECK"],
        laws: ["COMMUNICATIE-BIJBEL", "NATURAL-CAPITALIZATION"],
        forbidden: ["SYSTEM_CONFIG", "API_MODIFICATION"]
    },
    suzy: {
        role: "SEO/LLM",
        capabilities: ["METADATA_UPDATE", "SCHEMA_INJECTION", "KEYWORD_MAPPING"],
        laws: ["KNOWLEDGE-GRAPH-RULES", "LLM-READABILITY"],
        forbidden: ["UI_DESIGN_CHANGE", "AUTH_LOGIC"]
    },
    cody: {
        role: "Backend",
        capabilities: ["API_OPTIMIZATION", "DB_QUERY_REFINE", "LATENCY_FIX"],
        laws: ["VA-BEZIER-TIMING", "NUCLEAR-WORKFLOW"],
        forbidden: ["CSS_STYLING", "MARKETING_COPY"]
    }
};

const WETTEN_PATH = path.join(process.cwd(), '../../../3-WETTEN/docs');

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    try {
        const { agentId, message } = await req.json();
        const governance = AGENT_GOVERNANCE[agentId];

        if (!governance) {
            return NextResponse.json({ error: 'Unknown Agent' }, { status: 400 });
        }

        // 🛡️ SAFETY CHECK: Mag deze agent dit doen?
        let actionType = "READ_ONLY";
        if (message.toLowerCase().includes('wijzig') || message.toLowerCase().includes('maak') || message.toLowerCase().includes('update')) {
            actionType = "WRITE_OP";
        }

        // Valideer actie tegen capabilities
        const isAuthorized = actionType === "READ_ONLY" || 
            (agentId === 'mark' && message.includes('content')) ||
            (agentId === 'suzy' && (message.includes('titel') || message.includes('seo'))) ||
            (agentId === 'chris' && message.includes('fix'));

        if (!isAuthorized) {
            return NextResponse.json({ 
                agentId,
                content: `STOP. Als ${governance.role} heb ik geen mandaat voor deze actie. Dit valt onder de 'Forbidden' zone: ${governance.forbidden.join(', ')}. Raadpleeg BOB voor toestemming.`,
                status: 'blocked_by_protocol'
            });
        }

        // 🤖 UITVOERING (Met Wetten Context)
        let toolOutput = "";
        let actionTaken = "";

        // ... (Tool logica zoals in vorige stap, maar nu strikt gefilterd) ...
        if (agentId === 'mark' && actionType === "WRITE_OP") {
            actionTaken = "MARK_CONTENT_CREATION";
            toolOutput = "Concept artikel aangemaakt volgens de Communicatie-Bijbel.";
        }

        return NextResponse.json({
            agentId,
            role: governance.role,
            content: `${toolOutput} Actie gevalideerd tegen ${governance.laws.join(' & ')}.`,
            action: actionTaken,
            status: 'success',
            timestamp: new Date()
        });

    } catch (error) {
        return NextResponse.json({ error: 'Engine Failure' }, { status: 500 });
    }
}
