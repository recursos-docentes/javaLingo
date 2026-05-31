export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, stdin } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  // Renombrar clase pública a Main (requerido por JDoodle)
  const normalized = code.replace(/public\s+class\s+\w+/, 'public class Main');

  try {
    const jdRes = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: normalized,
        language: 'java',
        versionIndex: '0',
        stdin: stdin || ''
      })
    });
    const data = await jdRes.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
