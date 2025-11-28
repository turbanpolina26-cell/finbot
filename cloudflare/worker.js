export default {
  async fetch(request, env) {
    const corsHeaders = (origin) => ({
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,apikey,x-client-info',
    });

    const url = new URL(request.url);
    const origin = request.headers.get('origin') || '*';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Simple health
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, service: 'finbot-proxy-worker' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    const SUPABASE_REST_HOST = env.SUPABASE_REST_HOST || 'wdoymosbqdlqqzujgmax.supabase.co';
    const SUPABASE_KEY = env.SUPABASE_KEY || '';

    // Helper to build headers safely (only include Authorization/apikey when present)
    const makeHeaders = (opts = {}) => {
      const h = {};
      if (opts.contentType) h['Content-Type'] = opts.contentType;
      if (SUPABASE_KEY) {
        const raw = SUPABASE_KEY.startsWith('Bearer ') ? SUPABASE_KEY : `Bearer ${SUPABASE_KEY}`;
        h['Authorization'] = raw;
        h['apikey'] = SUPABASE_KEY.replace(/^Bearer\s+/i, '');
      }
      return h;
    };

    // Ensure only our simple /api endpoints are exposed (no open proxy)
    if (!url.pathname.startsWith('/api/')) {
      return new Response('Not Found', { status: 404, headers: corsHeaders(origin) });
    }

    // Map endpoints
    try {
      if (url.pathname === '/api/transactions' && request.method === 'GET') {
        const target = `https://${SUPABASE_REST_HOST}/rest/v1/transactions?select=*&order=date.desc&limit=100`;
        const resp = await fetch(target, { method: 'GET', headers: makeHeaders() });
        const text = await resp.text();
        return new Response(text, { status: resp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
      }

      if (url.pathname === '/api/transactions' && request.method === 'POST') {
        const bodyText = await request.text();
        const jsonBody = bodyText ? JSON.parse(bodyText) : {};
        const target = `https://${SUPABASE_REST_HOST}/rest/v1/transactions`;
        const resp = await fetch(target, {
          method: 'POST',
          headers: makeHeaders({ contentType: 'application/json' }),
          body: JSON.stringify(jsonBody),
        });
        const text = await resp.text();
        return new Response(text, { status: resp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
      }

      if (url.pathname === '/api/deleteTransaction' && request.method === 'POST') {
        const bodyText = await request.text();
        const parsed = bodyText ? JSON.parse(bodyText) : {};
        const id = parsed.id || parsed;
        if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
        const target = `https://${SUPABASE_REST_HOST}/rest/v1/transactions?id=eq.${encodeURIComponent(id)}`;
        const resp = await fetch(target, { method: 'DELETE', headers: makeHeaders() });
        const text = await resp.text();
        return new Response(text || JSON.stringify({ success: true }), { status: resp.status || 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
      }

      if (url.pathname === '/api/savings' && request.method === 'GET') {
        const target = `https://${SUPABASE_REST_HOST}/rest/v1/savings?select=*`;
        const resp = await fetch(target, { method: 'GET', headers: makeHeaders() });
        const text = await resp.text();
        return new Response(text, { status: resp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
      }

      if (url.pathname === '/api/savings' && request.method === 'POST') {
        const bodyText = await request.text();
        const jsonBody = bodyText ? JSON.parse(bodyText) : {};
        const target = `https://${SUPABASE_REST_HOST}/rest/v1/savings`;
        const resp = await fetch(target, {
          method: 'POST',
          headers: makeHeaders({ contentType: 'application/json' }),
          body: JSON.stringify(jsonBody),
        });
        const text = await resp.text();
        return new Response(text, { status: resp.status, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
      }

      if (url.pathname === '/api/deleteSaving' && request.method === 'POST') {
        const bodyText = await request.text();
        const parsed = bodyText ? JSON.parse(bodyText) : {};
        const id = parsed.id || parsed;
        if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
        const target = `https://${SUPABASE_REST_HOST}/rest/v1/savings?id=eq.${encodeURIComponent(id)}`;
        const resp = await fetch(target, { method: 'DELETE', headers: makeHeaders() });
        const text = await resp.text();
        return new Response(text || JSON.stringify({ success: true }), { status: resp.status || 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
      }

      return new Response(JSON.stringify({ error: 'Unsupported endpoint or method' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } });
    }
  }
};
