// Простой WebSocket signaling server (CommonJS)
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Map(); // userId -> ws

function safeSend(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch (e) { /* ignore */ }
}

function broadcastOnline() {
  const online = Array.from(clients.keys());
  const msg = JSON.stringify({ type: 'onlineList', online });
  for (const [, ws] of clients) {
    try { ws.send(msg); } catch {}
  }
}

wss.on('connection', function connection(ws) {
  ws.isAlive = true;
  ws.on('pong', () => ws.isAlive = true);

  ws.on('message', function incoming(raw) {
    let data;
    try { data = JSON.parse(raw.toString()); } catch (e) { return; }
    const { type } = data;

    if (type === 'login') {
      const { userId } = data;
      if (!userId) {
        safeSend(ws, { type: 'error', message: 'login requires userId' });
        return;
      }
      ws.userId = userId;
      clients.set(userId, ws);
      safeSend(ws, { type: 'login', ok: true });
      broadcastOnline();
      return;
    }

    if (type === 'getOnline') {
      const online = Array.from(clients.keys());
      safeSend(ws, { type: 'onlineList', online });
      return;
    }

    if (type === 'offer' || type === 'answer' || type === 'ice' || type === 'call') {
      const { to, from, payload } = data;
      if (!to) return;
      const target = clients.get(to);
      if (target && target.readyState === WebSocket.OPEN) {
        safeSend(target, { type, from, payload });
      } else {
        safeSend(ws, { type: 'error', message: 'peer not available', to });
      }
      return;
    }

    if (type === 'logout') {
      const { userId } = data;
      if (userId && clients.has(userId)) {
        clients.delete(userId);
        broadcastOnline();
      }
      return;
    }
  });

  ws.on('close', () => {
    if (ws.userId && clients.has(ws.userId)) {
      clients.delete(ws.userId);
      broadcastOnline();
    }
  });
});

// heartbeat
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    try { ws.ping(); } catch (e) {}
  });
}, 30000);

server.on('request', (req, res) => {
  res.writeHead(200); res.end('OK');
});

server.listen(PORT, () => {
  console.log('Signaling server listening on', PORT);
});