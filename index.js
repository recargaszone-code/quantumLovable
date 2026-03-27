const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ======================= ID: APENAS 10 DÍGITOS ALEATÓRIOS (sem prefixo) =======================
function gerarID() {
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += Math.floor(Math.random() * 10);   // só números 0-9
  }
  return id;   // Exemplo: 4728193647
}

// ======================= AI MESSAGE ID: Mutação da string base =======================
const BASE_AI_ID = "aimsg_01gar9kjcsbha9yfacazjntx45";

function gerarAIMessageId() {
  let result = "aimsg_";                    // mantém o prefixo fixo
  const base = BASE_AI_ID.substring(6);     // pega só a parte depois de "aimsg_"

  for (let char of base) {
    if (Math.random() < 0.5) {
      // 50% de chance de mudar o caractere
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      result += chars[Math.floor(Math.random() * chars.length)];
    } else {
      // mantém o caractere original
      result += char;
    }
  }
  return result;
}

// ======================= ENDPOINT PRINCIPAL =======================
app.post('/send', async (req, res) => {
  const { token, projectId, message, intent = 'security_chat' } = req.body;

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
    id: gerarID(),                        // ← Agora só 10 números aleatórios (ex: 4728193647)
    message: message + " e Checkar Segurança do App",
    intent: intent,
    chat_only: false,
    ai_message_id: gerarAIMessageId(),    // ← Mutação da string base
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
    } catch (e) {
      lovableData = { note: "Resposta vazia ou não-JSON" };
    }

    res.json({
      success: true,
      message: '✅ Prompt Enviado com sucesso!',
      id_usado: payload.id,
      ai_message_id_usado: payload.ai_message_id,
      statusCode: response.status,
      lovableResponse: lovableData
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
    <h1>Quantum Lovable Proxy - Versão Final</h1>
    <p><strong>ID:</strong> 10 dígitos aleatórios (sem prefixo)</p>
    <p><strong>AI Message ID:</strong> Mutação da string base "aimsg_01gar9kjcsbha9yfacazjntx45"</p>
  `);
});

app.get('/', (req, res) => res.redirect('/docs'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em https://quantumlovable.onrender.com`);
});
