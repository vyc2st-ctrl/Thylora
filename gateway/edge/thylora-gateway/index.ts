// THYLORA CONNECTION GATEWAY · edge function
//
// AI CLIENT -> THYLORA GATEWAY -> AUTHORIZED RPC -> SUPABASE SOURCE OF TRUTH
//
// This function is the only thing an external agent can reach. It holds no
// service-role key, no database password and no JWT signing secret. What it
// holds is one short-lived PostgREST token per agent, each minted by the
// Chairman for the NOLOGIN role `thylora_gateway`, which has zero table
// privileges and EXECUTE on exactly the nine functions in db/gateway.
//
// So the blast radius of a total compromise of this function is: the nine
// operations below, for the agents whose tokens it holds. Not the database.
//
// NOT DEPLOYED. Held for Chairman execution. Deploy with verify_jwt = false:
// this function performs its own authentication and must see the agent key.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

// Token used only to identify which agent presented a key. Carries role
// thylora_gateway and NO agent_code claim, so it can call nothing but
// thylora_gw_authenticate.
const AUTH_TOKEN = Deno.env.get("THYLORA_GW_TOKEN_AUTH") ?? "";

// One token per agent, each carrying role thylora_gateway + its agent_code.
// An agent's identity therefore comes from a token it never holds, so no agent
// can present itself as another.
const AGENT_TOKENS: Record<string, string> = {
  CHATGPT:   Deno.env.get("THYLORA_GW_TOKEN_CHATGPT")   ?? "",
  CLAUDE:    Deno.env.get("THYLORA_GW_TOKEN_CLAUDE")    ?? "",
  GEMINI:    Deno.env.get("THYLORA_GW_TOKEN_GEMINI")    ?? "",
  DASHBOARD: Deno.env.get("THYLORA_GW_TOKEN_DASHBOARD") ?? "",
  APP:       Deno.env.get("THYLORA_GW_TOKEN_APP")       ?? "",
};

// The allowlist IS the API. A path that is not a key here does not exist.
// There is no passthrough, no `rpc` parameter and no SQL anywhere in this file.
type Op = { rpc: string; map: (b: Record<string, unknown>) => Record<string, unknown> };

const OPERATIONS: Record<string, Op> = {
  boot_thylora: { rpc: "thylora_gw_boot", map: () => ({}) },

  read_latest_continuity: {
    rpc: "thylora_gw_latest_continuity",
    map: (b) => ({ p_limit: b.limit ?? 10, p_workstream: b.workstream ?? null }),
  },

  record_turn: {
    rpc: "thylora_gw_record_turn",
    map: (b) => ({
      p_query_id: b.query_id,
      p_source_agent: b.source_agent,
      p_destination_thread: b.destination_thread,
      p_user_message: b.user_message,
      p_assistant_message: b.assistant_message ?? null,
      p_truth_class: b.truth_class ?? "UNVERIFIED",
      p_restart_point: b.restart_point ?? null,
      p_continuity_refs: b.continuity_refs ?? [],
      p_session_label: b.session_label ?? null,
      p_custody_context: b.custody_context ?? {},
    }),
  },

  read_workstream: {
    rpc: "thylora_gw_read_workstream",
    map: (b) => ({ p_workstream: b.workstream ?? null }),
  },

  update_workstream: {
    rpc: "thylora_gw_update_workstream",
    map: (b) => ({
      p_workroom_code: b.workroom_code,
      p_state: b.state ?? null,
      p_current_task: b.current_task ?? null,
      p_owner: b.owner ?? null,
      p_blockers: b.blockers ?? null,
      p_next_action: b.next_action ?? null,
      p_restart_point: b.restart_point ?? null,
    }),
  },

  read_store_release_board: {
    rpc: "thylora_gw_store_release_board",
    map: (b) => ({ p_sell_intent_only: b.sell_intent_only ?? true }),
  },

  read_product: {
    rpc: "thylora_gw_read_product",
    map: (b) => ({ p_ref: b.ref }),
  },

  record_external_agent_result: {
    rpc: "thylora_gw_record_external_agent_result",
    map: (b) => ({
      p_query_id: b.query_id,
      p_agent: b.agent,
      p_originating_prompt_id: b.originating_prompt_id ?? null,
      p_source_thread: b.source_thread,
      p_returned_text: b.returned_text,
      p_verification_state: b.verification_state ?? "UNVERIFIED",
      p_disposition: b.disposition ?? "PENDING",
      p_request_chairman_review: b.request_chairman_review ?? false,
      p_note: b.note ?? null,
    }),
  },

  get_open_gates: {
    rpc: "thylora_gw_open_gates",
    map: (b) => ({ p_category: b.category ?? null }),
  },
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function callRpc(token: string, name: string, params: Record<string, unknown>) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      // The agent key is never forwarded. It stops here.
      Authorization: `Bearer ${token}`,
      apikey: token,
    },
    body: JSON.stringify(params),
  });
  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: response.ok, status: response.status, data };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json(405, { error: "THY-DENY: the gateway accepts POST only" });
  }

  const operation = new URL(request.url).pathname.split("/").filter(Boolean).pop() ?? "";
  const op = OPERATIONS[operation];
  if (!op) {
    return json(404, {
      error: `THY-DENY: '${operation}' is not a gateway operation`,
      operations: Object.keys(OPERATIONS),
    });
  }

  const presented = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!presented) {
    return json(401, { error: "THY-DENY: no agent key presented", operation });
  }
  if (!AUTH_TOKEN) {
    return json(503, { error: "THY-DENY: gateway is not provisioned", operation });
  }

  // 1. Identify the agent from the digest of its key. The key itself is never
  //    sent to the database and never logged.
  const auth = await callRpc(AUTH_TOKEN, "thylora_gw_authenticate", {
    p_key_sha256: await sha256Hex(presented),
  });
  const identified = auth.data as { authenticated?: boolean; agent_code?: string } | null;
  if (!auth.ok || !identified?.authenticated || !identified.agent_code) {
    return json(403, { error: "THY-DENY: agent key is not recognised or not enabled", operation });
  }

  const agent = identified.agent_code.toUpperCase();
  const agentToken = AGENT_TOKENS[agent];
  if (!agentToken) {
    return json(403, { error: `THY-DENY: no gateway token provisioned for agent ${agent}`, operation });
  }

  // 2. Run the one allowlisted RPC with that agent's token.
  let body: Record<string, unknown> = {};
  try {
    const raw = await request.text();
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return json(400, { error: "THY-DENY: request body is not valid JSON", operation });
  }

  const result = await callRpc(agentToken, op.rpc, op.map(body));
  if (!result.ok) {
    const detail = result.data as { message?: string } | null;
    return json(result.status === 401 ? 403 : result.status, {
      error: detail?.message ?? "THY-DENY: refused by the backend",
      operation,
      agent,
    });
  }
  return json(200, result.data);
});
