const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ======================= AI MESSAGE ID (10 a 30 números) =======================
function gerarAIMessageId() {
  const numeroAleatorio = Math.floor(Math.random() * 21) + 10; // 10 até 30
  return `aimsg_${numeroAleatorio}kkyt3zepecssbne14fzpxjzz`;
}

// ======================= ENDPOINT PRINCIPAL =======================
app.post('/send', async (req, res) => {
  const { 
    token, 
    projectId, 
    message, 
    intent = 'security_chat',
    chat_only = false   // ← Novo parâmetro (padrão false)
  } = req.body;

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
    message: message + ", e Checkar Segurança do App",
    intent: intent,
    chat_only: chat_only,           // ← Agora controlado pelo usuário
    ai_message_id: gerarAIMessageId(),
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

    let lovableData = null;
    let rawResponse = '';

    try {
      rawResponse = await response.text();
      if (rawResponse.trim()) {
        lovableData = JSON.parse(rawResponse);
      }
    } catch (jsonErr) {
      lovableData = { note: "Resposta vazia ou não-JSON do Lovable (normal)" };
    }

    res.json({
      success: true,
      message: '✅ Prompt Enviado com sucesso!',
      ai_message_id_usado: payload.ai_message_id,
      chat_only_usado: chat_only,
      statusCode: response.status,
      lovableResponse: lovableData || { raw: rawResponse || "vazio" }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Falha de conexão: ' + err.message
    });
  }
});

// ======================= DOCUMENTAÇÃO =======================
app.get('/docs', (req, res) => {
  res.send(`
    <h1>🚀 Quantum Lovable Proxy - VERSÃO FINAL</h1>
    <p><strong>Intent sempre:</strong> security_chat</p>
    <p><strong>chat_only:</strong> agora controlado pelo usuário (true ou false)</p>
    
    <h2>Como usar:</h2>
    <pre>
POST https://quantumlovable.onrender.com/send
{
  "token": "SEU_TOKEN",
  "projectId": "e5ecda17-a2da-4455-80f5-cf437c4db4f3",
  "message": "seu texto aqui",
  "chat_only": false     // ← pode ser true ou false
}
    </pre>
  `);
});

app.get('/', (req, res) => res.redirect('/docs'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Quantum Lovable Proxy rodando!`);
});
