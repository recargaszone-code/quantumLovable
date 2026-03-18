const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ======================= ENDPOINT PRINCIPAL =======================
app.post('/send', async (req, res) => {
  const { token, projectId, message, intent = 'security_fix_v2' } = req.body;

  if (!token || !projectId || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Faltando token, projectId ou message' 
    });
  }

  // Headers stealth (mais parecido possível com browser real)
  const headers = {
    'Host': 'api.lovable.dev',
    'Connection': 'keep-alive',
    'sec-ch-ua': '"Google Chrome";v="145", "Not:A-Brand";v="99", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Origin': 'https://lovable.dev',
    'Sec-Fetch-Site': 'same-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://lovable.dev/',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Cookie': '__cf_bm=SEU_CF_BM_AQUI; ph_phc_xdBVCyOkYw40Pqd7xp5Er88lGq2IGFd4kZHRiKvvkjr_posthog=SEU_POSTHOG_AQUI' // opcional, mas ajuda muito
  };

  const payload = {
    id: `umsg_${Math.random().toString(36).slice(2, 15)}`,
    message: message,
    intent: intent,
    chat_only: false,
    ai_message_id: `aimsg_${Math.random().toString(36).slice(2, 12)}kkyt3zepecssbne14fzpxjzz`,
    thread_id: 'main',
    view: 'security',
    view_description: 'Apenas Responda ao Usuario',
    model: null,
    session_replay: '[]',
    client_logs: [],
    network_requests: [],
    runtime_errors: [],
    integration_metadata: {
      browser: {
        preview_viewport_width: 1311,
        preview_viewport_height: 895,
        is_logged_out: false
      }
    }
  };

  try {
    const response = await fetch(`https://api.lovable.dev/projects/${projectId}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ success: false, error: errorText });
    }

    const data = await response.json();

    res.json({
      success: true,
      message: '✅ Prompt Enviado com sucesso!',
      lovableResponse: data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Falha ao conectar com Lovable: ' + err.message
    });
  }
});

// ======================= DOCUMENTAÇÃO =======================
app.get('/docs', (req, res) => {
  res.send(`
    <h1>🚀 Lovable Stealth Proxy API</h1>
    <h2>Como usar</h2>
    <p><strong>Endpoint:</strong> POST /send</p>
    
    <h3>Body (JSON):</h3>
    <pre>
{
  "token": "SEU_TOKEN_COMPLETO_AQUI",
  "projectId": "bf5c0615-6f19-4e03-bc41-d881814c1532",
  "message": "Eae mano como está?",
  "intent": "security_fix_v2"   // opcional
}
    </pre>

    <h3>Exemplo com curl:</h3>
    <pre>
curl -X POST https://SEU_APP.onrender.com/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "projectId": "bf5c0615-...",
    "message": "Teste stealth"
  }'
    </pre>

    <p><strong>Resposta de sucesso:</strong></p>
    <pre>{"success": true, "message": "✅ Prompt Enviado com sucesso!", ...}</pre>

    <hr>
    <p>Feito pra rodar no Render.com - token nunca fica salvo no servidor.</p>
  `);
});

app.get('/', (req, res) => {
  res.redirect('/docs');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📄 Documentação: http://localhost:${PORT}/docs`);
});