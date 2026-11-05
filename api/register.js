/**
 * בית חב"ד הערבה — צינור הרשמה דרך השרת של Vercel
 *
 * למה זה קיים: בטלפונים מסוננים ובדפדפנים בתוך אפליקציות, פנייה ישירה
 * מהטלפון אל script.google.com נחסמת לפעמים. כאן הטלפון מדבר רק עם האתר עצמו
 * (אותה כתובת שממנה נטען הדף), והשרת של Vercel מעביר את ההרשמה לגיליון.
 */

var SHEET_URL = 'https://script.google.com/macros/s/AKfycbzU47HYM2ummy6N7IUSfNo-GQMRoXIyfQUP7f61Bx4B1q4seXdz4Vh8KKETa3qw8Zw/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }

  var body = req.body;
  if (body && typeof body === 'object') body = JSON.stringify(body);
  if (typeof body !== 'string' || !body) {
    res.status(400).json({ ok: false, error: 'empty body' });
    return;
  }

  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, 50000);
  try {
    var r = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: body,
      redirect: 'follow',
      signal: ctrl.signal
    });
    var text = await r.text();
    var json;
    try { json = JSON.parse(text); } catch (e) { json = { ok: false, error: 'unreadable response', status: r.status }; }
    res.status(200).json(json);
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e && e.message || e) });
  } finally {
    clearTimeout(timer);
  }
};
