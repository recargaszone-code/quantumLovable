const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ======================= FUNÇÃO NOVA - AI MESSAGE ID (10 a 30) =======================
function gerarAIMessageId() {
  const numeroAleatorio = Math.floor(Math.random() * 21) + 10; // gera 10 até 30
  return `aimsg_${numeroAleatorio}kkyt3zepecssbne14fzpxjzz`;
}

// ======================= ENDPOINT PRINCIPAL =======================
app.post('/send', async (req, res) => {
  const { token, projectId, message, intent = 'security_fix_v2' } = req.body;

  if (!token || !projectId || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Faltando token, projectId ou message' 
    });
  }

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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
  };

  const payload = {
    id: `umsg_${Math.random().toString(36).slice(2, 15)}`,
    message: message,
    intent: "security_chat",
    chat_only: false,
    ai_message_id: gerarAIMessageId(),   // ← AGORA É aimsg_13kkyt... ou aimsg_27kkyt... (10~30)
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
      ai_message_id_usado: payload.ai_message_id,   // só pra você ver qual número gerou
      lovableResponse: data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Falha ao conectar: ' + err.message
    });
  }
});

// ======================= DOCUMENTAÇÃO =======================
app.get('/docs', (req, res) => {
  res.send(`
    <h1>🚀 Quantum Lovable Proxy - Versão Final</h1>
    <h2>Endpoint: POST /send</h2>
    
    <h3>Body obrigatório:</h3>
    <pre>
{
  "token": "seu_token_completo",
  "projectId": "bf5c0615-6f19-4e03-bc41-d881814c1532",
  "message": "sua mensagem aqui"
}
    </pre>

    <p><strong>ai_message_id agora gerado automaticamente:</strong><br>
    aimsg_10kkyt3zepecssbne14fzpxjzz até aimsg_30kkyt3zepecssbne14fzpxjzz</p>

    <p>Deploy feito em: https://quantumlovable.onrender.com</p>
  `);
});

app.get('/', (req, res) => res.redirect('/docs'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em https://quantumlovable.onrender.com`);
});
