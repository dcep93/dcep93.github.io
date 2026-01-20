// colonist intercept logger
(() => {
  // ---- log sink ----
  const LOG_KEY = "colonistInterceptLog";
  if (!Array.isArray(window[LOG_KEY])) window[LOG_KEY] = [];
  const log = (entry) => {
    try {
      // keep it JSON-safe; avoid throwing on cyclic stuff
      window[LOG_KEY].push(entry);
    } catch (e) {
      // last resort: stringify
      try {
        window[LOG_KEY].push({
          trigger: "log.error",
          error: String(e),
          entry: String(entry),
        });
      } catch {}
    }
  };

  const safeString = (x) => {
    if (x == null) return undefined;
    if (typeof x === "string") return x;
    if (x instanceof ArrayBuffer) return `ArrayBuffer(${x.byteLength})`;
    if (ArrayBuffer.isView(x))
      return `${x.constructor?.name || "View"}(${x.byteLength ?? x.length ?? "?"})`;
    if (x instanceof Blob) return `Blob(${x.type || "?"}, ${x.size})`;
    if (x instanceof FormData) {
      const out = {};
      try {
        for (const [k, v] of x.entries())
          out[k] =
            typeof v === "string"
              ? v
              : `File(${v.name || "?"}, ${v.type || "?"}, ${v.size})`;
      } catch {}
      return out;
    }
    if (x instanceof URLSearchParams) return x.toString();
    try {
      return JSON.stringify(x);
    } catch {
      return String(x);
    }
  };

  // ---- XHR ----
  (function overrideXHR() {
    const OrigXHR = window.XMLHttpRequest;
    if (!OrigXHR) return;

    function InterceptedXHR() {
      const xhr = new OrigXHR();

      const meta = { method: undefined, url: undefined, body: undefined };

      const origOpen = xhr.open;
      xhr.open = function (method, url, async, username, password) {
        meta.method = (method && String(method).toUpperCase()) || "GET";
        meta.url =
          typeof url === "string"
            ? url
            : (url && url.toString && url.toString()) || String(url);
        return origOpen.call(this, method, url, async, username, password);
      };

      const origSend = xhr.send;
      xhr.send = function (body) {
        meta.body = body;

        const onDone = () => {
          // responseText can throw on some types; guard
          let resp;
          try {
            resp = xhr.responseText;
          } catch {
            try {
              resp = xhr.response;
            } catch {
              resp = undefined;
            }
          }

          log({
            trigger: "xhr",
            url: meta.url,
            body: safeString(meta.body),
            resp: safeString(resp),
          });
        };

        // loadend fires for success/error/abort
        xhr.addEventListener("loadend", onDone, { once: true });

        return origSend.call(this, body);
      };

      return xhr;
    }

    // preserve prototype / static props
    InterceptedXHR.prototype = OrigXHR.prototype;
    Object.getOwnPropertyNames(OrigXHR).forEach((k) => {
      try {
        InterceptedXHR[k] = OrigXHR[k];
      } catch {}
    });

    window.XMLHttpRequest = InterceptedXHR;
  })();

  // ---- fetch ----
  (function overrideFetch() {
    const origFetch = window.fetch;
    if (typeof origFetch !== "function") return;

    window.fetch = async function (input, init) {
      // build url/body early
      let url;
      try {
        if (typeof input === "string") url = input;
        else if (input instanceof Request) url = input.url;
        else url = String(input);
      } catch {
        url = undefined;
      }

      // best-effort body capture (don’t consume streams)
      let body = undefined;
      try {
        if (init && "body" in init) body = init.body;
        else if (input instanceof Request) {
          // request body may be a stream; don't clone+read unless you accept side effects
          body = undefined;
        }
      } catch {}

      const resp = await origFetch.call(this, input, init);

      // clone and read (won't consume the original response)
      let respText;
      try {
        const c = resp.clone();
        // try text always; if it's binary it'll still give something or throw
        respText = await c.text();
      } catch (e) {
        respText = `<<unreadable response: ${String(e)}>>`;
      }

      log({
        trigger: "fetch",
        url,
        body: safeString(body),
        resp: safeString(respText),
      });

      return resp;
    };
  })();

  // ---- WebSocket ----
  (function overrideWebSocket() {
    const OrigWS = window.WebSocket;
    if (typeof OrigWS !== "function") return;

    const socketMeta = new WeakMap();

    function socketAddressFromArgs(url, protocols) {
      if (!url) return "unknown";
      if (Array.isArray(protocols)) return `${url} [${protocols.join(",")}]`;
      if (protocols) return `${url} [${String(protocols)}]`;
      return String(url);
    }

    window.WebSocket = function (url, protocols) {
      const ws =
        protocols !== undefined ? new OrigWS(url, protocols) : new OrigWS(url);

      const addr = socketAddressFromArgs(url, protocols);
      socketMeta.set(ws, { socketAddress: addr });

      // receive
      ws.addEventListener("message", (ev) => {
        const { socketAddress } = socketMeta.get(ws) || { socketAddress: addr };
        log({
          trigger: "socket.receive",
          data: safeString(ev && ev.data),
          socketAddress,
        });
      });

      // optional: log close/error/open? (not requested)
      return ws;
    };

    // preserve constants + prototype
    window.WebSocket.prototype = OrigWS.prototype;
    Object.getOwnPropertyNames(OrigWS).forEach((k) => {
      try {
        window.WebSocket[k] = OrigWS[k];
      } catch {}
    });

    const origSend = OrigWS.prototype.send;
    OrigWS.prototype.send = function (data) {
      const meta = socketMeta.get(this) || {};
      const socketAddress = meta.socketAddress || "unknown";
      log({
        trigger: "socket.send",
        data: safeString(data),
        socketAddress,
      });
      return origSend.call(this, data);
    };
  })();

  // convenience
  window.colonistInterceptLogClear = () =>
    (window.colonistInterceptLog.length = 0);
  window.colonistInterceptLogDump = (n = 50) =>
    window.colonistInterceptLog.slice(-Math.max(0, n));
})();
