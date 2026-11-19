// DG Learn — server-side AI proxy (Vercel Function).
// The Anthropic API key lives only in the ANTHROPIC_API_KEY environment variable on Vercel; it is never sent to the browser.
const MAX_MESSAGES = 20, MAX_CHARS = 60000;

module.exports = async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') return res.status(200).json({ ok: true, ai: Boolean(key) });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!key) return res.status(503).json({ error: 'ai_not_configured' });

  // Only accept calls from the DG Learn page itself (browsers send Sec-Fetch-Site).
  const site = req.headers['sec-fetch-site'];
  if (site && site !== 'same-origin') return res.status(403).json({ error: 'forbidden' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  const messages = body && Array.isArray(body.messages) ? body.messages : null;
  const valid = messages && messages.length >= 1 && messages.length <= MAX_MESSAGES &&
    messages.every(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length > 0) &&
    messages[messages.length - 1].role === 'user' &&
    messages.reduce((n, m) => n + m.content.length, 0) <= MAX_CHARS;
  if (!valid) return res.status(400).json({ error: 'bad_request' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 1200, messages })
    });
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: 'upstream_error' });
    const j = await r.json();
    const text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'upstream_unreachable' });
  }
};
