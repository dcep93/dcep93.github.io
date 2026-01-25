(() => {
  const LOG_KEY = "colonistInterceptLog";
  if (!Array.isArray(window[LOG_KEY])) window[LOG_KEY] = [];
  const pushLog = (e) => {
    try {
      window[LOG_KEY].push(e);
    } catch {}
  };

  const bytesToArray = (u8) => Array.from(u8);
  const decodeWsData = async (data) => {
    if (typeof data === "string") return data;
    if (data instanceof ArrayBuffer) return bytesToArray(new Uint8Array(data));
    if (ArrayBuffer.isView(data)) {
      const u8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      return bytesToArray(u8);
    }
    if (typeof Blob !== "undefined" && data instanceof Blob) {
      const ab = await data.arrayBuffer();
      return bytesToArray(new Uint8Array(ab));
    }
    try {
      return JSON.parse(JSON.stringify(data));
    } catch {}
    return String(data);
  };

  const OrigWS = window.WebSocket;
  if (typeof OrigWS !== "function") return;

  // metadata for sockets we see constructed AFTER injection
  const metaBySocket = new WeakMap();

  // --- LATE-INJECTION RECEIVE HOOK ---
  // logs any MessageEvent("message") dispatched on any WebSocket in this realm
  const origDispatch = EventTarget.prototype.dispatchEvent;
  if (!EventTarget.prototype.__wsDispatchHooked) {
    Object.defineProperty(EventTarget.prototype, "__wsDispatchHooked", {
      value: true,
    });

    EventTarget.prototype.dispatchEvent = function (event) {
      try {
        if (event && event.type === "message" && this instanceof OrigWS) {
          const ws = this;
          const socketAddress =
            metaBySocket.get(ws)?.socketAddress || ws.url || "unknown";
          const data = event.data;
          (async () => {
            const decoded = await decodeWsData(data);
            pushLog({
              trigger: "socket.receive",
              data: decoded,
              time: Date.now(),
              // socketAddress,
            });
          })();
        }
      } catch {}
      return origDispatch.call(this, event);
    };
  }

  // --- SEND HOOK (prototype-level) ---
  // might fail if non-writable, but try anyway; still useful for existing sockets
  try {
    const origSend = OrigWS.prototype.send;
    if (!OrigWS.prototype.__wsSendHooked) {
      Object.defineProperty(OrigWS.prototype, "__wsSendHooked", {
        value: true,
      });

      OrigWS.prototype.send = function (data) {
        const ws = this;
        const socketAddress =
          metaBySocket.get(ws)?.socketAddress || ws.url || "unknown";
        (async () => {
          const decoded = await decodeWsData(data);
          pushLog({ trigger: "socket.send", data: decoded, time: Date.now() });
        })();
        return origSend.call(this, data);
      };
    }
  } catch {
    // ignore if locked down
  }

  // --- OPTIONAL: detect wiring (helps debug why you aren't seeing receives) ---
  const origAdd = OrigWS.prototype.addEventListener;
  if (!OrigWS.prototype.__wsAddHooked) {
    Object.defineProperty(OrigWS.prototype, "__wsAddHooked", { value: true });
    OrigWS.prototype.addEventListener = function (type, listener, options) {
      if (type === "message") {
        pushLog({
          trigger: "socket.listener.add",
          socketAddress: this.url || "unknown",
        });
      }
      return origAdd.call(this, type, listener, options);
    };
  }

  // --- constructor override for sockets created AFTER injection (adds init + per-instance send wrapper too) ---
  function InterceptedWebSocket(url, protocols) {
    const ws =
      protocols !== undefined ? new OrigWS(url, protocols) : new OrigWS(url);
    const socketAddress =
      protocols == null
        ? String(url)
        : `${String(url)} [${Array.isArray(protocols) ? protocols.join(",") : String(protocols)}]`;

    metaBySocket.set(ws, { socketAddress });
    pushLog({ trigger: "socket.init", socketAddress });

    // instance-level send wrapper (more reliable for new sockets)
    const boundOrigSend = ws.send.bind(ws);
    try {
      Object.defineProperty(ws, "send", {
        configurable: true,
        writable: true,
        value: function (data) {
          (async () => {
            const decoded = await decodeWsData(data);
            pushLog({
              trigger: "socket.send",
              data: decoded,
              time: Date.now(),
            });
          })();
          return boundOrigSend(data);
        },
      });
    } catch {}

    return ws;
  }

  InterceptedWebSocket.prototype = OrigWS.prototype;
  Object.getOwnPropertyNames(OrigWS).forEach((k) => {
    try {
      InterceptedWebSocket[k] = OrigWS[k];
    } catch {}
  });
  window.WebSocket = InterceptedWebSocket;

  window.colonistInterceptLogClear = () =>
    (window.colonistInterceptLog.length = 0);
  window.colonistInterceptLogDump = (n = 50) =>
    window.colonistInterceptLog.slice(-Math.max(0, n));
})();
