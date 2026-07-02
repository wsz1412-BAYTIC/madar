import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Try to extract a Madar JWT: from the request Authorization header,
    // or from the payload body.
    let token = '';
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
    let body: any = {};
    try { body = await req.json(); } catch { /* not JSON */ }
    if (!token && body.token) token = body.token;

    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const BASE = 'https://api.aimadar.com/api';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const [propsRes, oppsRes] = await Promise.all([
      fetch(`${BASE}/properties/`, { headers }),
      fetch(`${BASE}/opportunities/`, { headers }),
    ]);

    const propsText = await propsRes.text();
    const oppsText = await oppsRes.text();

    let propsBody: any = propsText;
    try { propsBody = JSON.parse(propsText); } catch { /* keep text */ }

    let oppsBody: any = oppsText;
    try { oppsBody = JSON.parse(oppsText); } catch { /* keep text */ }

    return Response.json({
      properties: { status: propsRes.status, body: propsBody },
      opportunities: { status: oppsRes.status, body: oppsBody },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});