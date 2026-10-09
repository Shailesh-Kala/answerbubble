/*! AnswerBubble Pro v1.0.1 | Pro licence, see LICENSE-PRO.md: do not resell or redistribute | (c) 2026 Shailesh Kala */
// AnswerBubble: FAQ answers + WhatsApp chat. Config: window.HelpWidget. See README.md.
(function () {
  "use strict";
  const VERSION = "1.0.1";
  let PRO = false;
  PRO = true;
  const PRO_KEYS = ["contacts", "hours", "strings", "messageTemplate", "launcherLabel", "hideOn"];
  const DEFAULT_COLOR = "#0F766E";

  const STRINGS = {
    en: {
      launcher: "Help and chat",
      title: "Help",
      close: "Close",
      welcome: "Hi! Ask us anything, or chat with us on WhatsApp.",
      label: "Type your question",
      placeholder: "Type your question, e.g. timings",
      popular: "Popular questions",
      matches: "Best answers",
      found: "{n} answers found",
      found1: "1 answer found",
      none: "No answer found.",
      noneHint: "Send us your question on WhatsApp and we'll reply.",
      chat: "Chat on WhatsApp",
      ask: "I have a question.",
      message: "Hi {business}, {question}\n(From: {page})",
    },
    hi: {
      launcher: "मदद और चैट",
      title: "मदद",
      close: "बंद करें",
      welcome: "नमस्ते! कुछ भी पूछें, या WhatsApp पर हमसे बात करें।",
      label: "अपना सवाल लिखें",
      placeholder: "अपना सवाल लिखें, जैसे: समय",
      popular: "आम सवाल",
      matches: "सबसे सही जवाब",
      found: "{n} जवाब मिले",
      found1: "1 जवाब मिला",
      none: "कोई जवाब नहीं मिला।",
      noneHint: "अपना सवाल WhatsApp पर भेजें, हम जवाब देंगे।",
      chat: "WhatsApp पर बात करें",
      ask: "मेरा एक सवाल है।",
      message: "नमस्ते {business}, {question}\n(पेज: {page})",
    },
  };
  Object.assign(STRINGS.en, {
    pick: "Who would you like to chat with?",
    closed: "We're closed now. We'll reply from {when}.",
    closedSoon: "We're closed now. We'll reply as soon as we can.",
    today: "today",
    tomorrow: "tomorrow",
    days: "Sun Mon Tue Wed Thu Fri Sat",
  });
  Object.assign(STRINGS.hi, {
    pick: "आप किससे बात करना चाहेंगे?",
    closed: "अभी हम बंद हैं। हम {when} से जवाब देंगे।",
    closedSoon: "अभी हम बंद हैं। हम जल्द से जल्द जवाब देंगे।",
    today: "आज",
    tomorrow: "कल",
    days: "रवि सोम मंगल बुध गुरु शुक्र शनि",
  });

  // Search
  // Lowercase, NFKD, drop Latin accents, keep letters/digits/marks of any script (marks keep Hindi vowel signs).
  const norm = (s) =>
    String(s == null ? "" : s).normalize("NFKD").toLowerCase()
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\p{L}\p{N}\p{M}]+/gu, " ").trim();

  const STOP = new Set(norm(
    "a an the is are am was be do does did you your i me my we our us to of in on at for and or it its this that " +
    "what how when where which who can could will would there any have has with from about please hi hello " +
    "kya hai hain ka ki ke ko se mein aap क्या है हैं का की के को से में आप"
  ).split(" "));

  const tokens = (s) => norm(s).split(" ").filter((t) => t && !STOP.has(t));

  // True when edit distance (with swapped neighbours counting as one edit) is at most 1.
  function within1(a, b) {
    const la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return false;
    let i = 0, j = 0, d = 0;
    while (i < la && j < lb) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++d > 1) return false;
      if (la > lb) i++;
      else if (lb > la) j++;
      else if (a[i] === b[j + 1] && a[i + 1] === b[j]) { i += 2; j += 2; }
      else { i++; j++; }
    }
    return d + (la - i) + (lb - j) <= 1;
  }

  const hit = (t, w) => w === t || (t.length > 1 && w.startsWith(t)) || (t.length > 3 && within1(t, w));

  function search(query, faqs) {
    const q = tokens(query);
    if (!q.length) return [];
    return (faqs || []).map((f, i) => {
      const head = tokens(f.q + " " + [].concat(f.keywords || []).join(" ")), body = tokens(f.a);
      let score = 0;
      q.forEach((t) => {
        score += head.some((w) => hit(t, w)) ? 3 : body.some((w) => hit(t, w)) ? 1 : 0;
      });
      return { f, score, i };
    }).filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .slice(0, 3).map((r) => r.f);
  }

  // Answer formatting: **bold**, line breaks, [text](url) links
  function safeUrl(u) {
    try {
      const x = new URL(String(u).trim());
      return /^(https?|mailto|tel):$/.test(x.protocol) ? x.href : "";
    } catch (e) {
      return "";
    }
  }

  const parseAnswer = (text) =>
    String(text == null ? "" : text).split(/\r?\n/).map((line) => {
      const out = [], re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
      let last = 0, m;
      while ((m = re.exec(line))) {
        if (m.index > last) out.push({ t: "text", v: line.slice(last, m.index) });
        if (m[1] != null) out.push({ t: "b", v: m[1] });
        else {
          const href = safeUrl(m[3]);
          out.push(href ? { t: "a", v: m[2], href } : { t: "text", v: m[2] });
        }
        last = re.lastIndex;
      }
      if (last < line.length) out.push({ t: "text", v: line.slice(last) });
      return out;
    });

  // Colour
  function hexRgb(hex) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || "").trim());
    if (!m) return null;
    const h = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }

  const luminance = (rgb) => {
    const [r, g, b] = rgb.map((v) => (v /= 255) <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Black or white, whichever has more contrast on the brand colour (always >= 4.5:1).
  function textColor(hex) {
    const c = hexRgb(hex);
    if (!c) return null;
    const L = luminance(c);
    return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? "#000000" : "#ffffff";
  }

  // WhatsApp
  const cleanNumber = (n) => {
    const d = String(n == null ? "" : n).replace(/[\s+\-()[\]]/g, "");
    return /^[1-9]\d{7,14}$/.test(d) ? d : null;
  };

  // Web pages only, origin + path: no query/hash (private data), no file: paths.
  function pageUrl(href) {
    try {
      const u = new URL(href);
      return /^https?:$/.test(u.protocol) ? u.origin + u.pathname : "";
    } catch (e) {
      return "";
    }
  }

  const fill = (tpl, vals) => String(tpl).replace(/\{(\w+)\}/g, (m, k) => (k in vals ? vals[k] : m));

  // No page: drop its line.
  const message = (tpl, business, question, page, ask) =>
    fill(page ? tpl : String(tpl).replace(/\n[^\n]*\{page\}[^\n]*/g, ""), { business: business || "", question: String(question || "").trim() || ask, page }).replace(/ +,/g, ",");

  const waLink = (num, text) => "https://wa.me/" + num + "?text=" + encodeURIComponent(text);

  // Office hours (computed in the business's timezone)
  const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const toMin = (t) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(t).trim());
    return m ? +m[1] * 60 + +m[2] : NaN;
  };

  function zoned(date, tz) {
    const p = {};
    new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(date).forEach((x) => (p[x.type] = x.value));
    return { day: DAYS.indexOf(p.weekday.toLowerCase()), min: (+p.hour % 24) * 60 + +p.minute };
  }

  // { open: true } or { open: false, inDays, day, time } (time in minutes); no `time` if never open.
  // ponytail: no overnight ranges; write 22:00-24:00 plus 00:00-02:00 on the next day.
  function hoursStatus(hours, date) {
    const now = zoned(date || new Date(), hours.timezone || "Asia/Kolkata");
    const ranges = (d) => (hours[DAYS[d]] || []).map((r) => [toMin(r[0]), toMin(r[1])])
      .filter((r) => r[0] < r[1]).sort((a, b) => a[0] - b[0]);
    if (ranges(now.day).some((r) => now.min >= r[0] && now.min < r[1])) return { open: true };
    for (let k = 0; k < 8; k++) {
      const d = (now.day + k) % 7, r = ranges(d).find((x) => k > 0 || x[0] > now.min);
      if (r) return { open: false, inDays: k, day: d, time: r[0] };
    }
    return { open: false };
  }

  function nextText(st, s) {
    const h = Math.floor(st.time / 60), m = String(st.time % 60).padStart(2, "0");
    const day = st.inDays === 0 ? s.today : st.inDays === 1 ? s.tomorrow : s.days.split(" ")[st.day];
    return day + " " + (h % 12 || 12) + ":" + m + (h < 12 ? " AM" : " PM");
  }

  // Widget UI (browser only)
  const warn = (msg) => console.warn("Help widget: " + msg);
  const fail = (e) => warn("could not start (" + e.message + "). Check your window.HelpWidget settings.");
  const CHAT = "M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v7a3.5 3.5 0 0 1-3.5 3.5H11l-4.4 3.7c-.6.5-1.6.1-1.6-.7V17a3.5 3.5 0 0 1-1-2.5zM8 9a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 8 9zm4 0a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 12 9zm4 0a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 16 9z";
  const CLOSE = "M6 6l12 12M18 6L6 18";

  let CSS = `
:host{all:initial!important}
*{box-sizing:border-box}
[hidden]{display:none!important}
.hw{font:16px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1f2328}
button,input{font:inherit;color:inherit}
:focus-visible{outline:2px solid #fff;outline-offset:0;box-shadow:0 0 0 5px #111}
svg{width:22px;height:22px;flex:none;fill:currentColor}
.launch,.wa{display:flex;align-items:center;justify-content:center;gap:8px;border:0;background:var(--c);color:var(--fg);font-weight:700;text-decoration:none;cursor:pointer}
.launch{position:fixed;z-index:2147483000;bottom:calc(20px + env(safe-area-inset-bottom));right:calc(20px + env(safe-area-inset-right));min-width:56px;height:56px;padding:0 15px;border-radius:28px;box-shadow:0 4px 14px rgba(0,0,0,.25)}
.left .launch{right:auto;left:calc(20px + env(safe-area-inset-left))}
.launch svg{width:26px;height:26px}
.panel{position:fixed;z-index:2147483000;right:calc(20px + env(safe-area-inset-right));bottom:calc(88px + env(safe-area-inset-bottom));width:min(380px,calc(100vw - 40px));max-height:min(620px,calc(100vh - 120px));display:flex;flex-direction:column;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.28);overflow:hidden;animation:hw-in .18s ease-out}
.left .panel{right:auto;left:calc(20px + env(safe-area-inset-left))}
@keyframes hw-in{from{opacity:0;transform:translateY(12px)}}
.head{display:flex;align-items:center;gap:8px;padding:6px 6px 6px 18px;background:var(--c);color:var(--fg)}
.head h2{flex:1;margin:0;font-size:18px;line-height:1.3}
.x{display:grid;place-items:center;width:44px;height:44px;flex:none;padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}
.x svg{fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
.body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:16px 18px}
.body p{margin:0 0 12px}
.q{width:100%;min-height:48px;padding:10px 14px;font-size:16px;border:1.5px solid #858b94;border-radius:12px;background:#fff}
.q::placeholder{color:#636c76}
.lt{margin:16px 0 4px;font-size:14px;color:#57606a}
details{border-bottom:1px solid #e1e4e8}
summary{position:relative;min-height:44px;padding:11px 30px 11px 0;font-weight:600;cursor:pointer;list-style:none}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";position:absolute;right:6px;top:9px;font-size:22px;line-height:1;color:#57606a}
details[open] summary::after{content:"\\2212"}
.ans{padding:0 0 14px;color:#30363d;overflow-wrap:anywhere}
.ans a{color:inherit;font-weight:600}
.none{padding-top:12px}
.none p:first-child{margin-bottom:4px;font-weight:700}
.foot{padding:12px 18px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #e1e4e8}
.wa{width:100%;min-height:48px;padding:10px 16px;border-radius:12px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:479px){.panel,.left .panel{left:8px;right:8px;width:auto;top:calc(8px + env(safe-area-inset-top));bottom:calc(8px + env(safe-area-inset-bottom));max-height:none}}
@media (prefers-reduced-motion:reduce){.panel{animation:none}}`;
  CSS += `
.pill{white-space:nowrap}
.banner{padding:10px 12px;border-radius:10px;background:#fff4d6;color:#4d3300;font-size:15px}
.pick p{margin:0 0 8px;font-weight:700}
.pick a{display:flex;align-items:center;min-height:44px;margin-bottom:8px;padding:8px 14px;border:1.5px solid #858b94;border-radius:12px;color:inherit;font-weight:600;text-decoration:none}`;

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function icon(d) {
    const NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    p.setAttribute("d", d);
    svg.append(p);
    return svg;
  }

  function linkOut(a) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }

  function answerNodes(text) {
    const out = [];
    parseAnswer(text).forEach((line, i) => {
      if (i) out.push(el("br"));
      line.forEach((p) => {
        if (p.t === "b") out.push(el("strong", "", p.v));
        else if (p.t === "a") {
          const a = el("a", "", p.v);
          a.href = p.href;
          out.push(/^https?:/.test(p.href) ? linkOut(a) : a);
        } else out.push(document.createTextNode(p.v));
      });
    });
    return out;
  }

  function start() {
    const cfg = window.HelpWidget;
    if (!cfg || typeof cfg !== "object")
      return warn('add window.HelpWidget = { whatsapp: "910000000000" } before the widget script. Nothing is shown until then.');
    const num = cleanNumber(cfg.whatsapp);
    if (!num)
      return warn('the WhatsApp number "' + (cfg.whatsapp == null ? "" : cfg.whatsapp) + '" is not valid, so nothing is shown. ' +
        "Use digits only with your country code, e.g. 910000000000 (91 for India), and don't start with 0.");
    if (!PRO) {
      const ignored = PRO_KEYS.filter((k) => cfg[k] != null);
      if (ignored.length) console.info("Help widget: ignored " + ignored.join(", ") + " (Pro options; this is the free version).");
    }
    if ([].concat(cfg.hideOn || []).some((p) => p && location.pathname.startsWith(p))) return;
    const go = () => {
      try {
        mount(cfg, num);
      } catch (e) {
        fail(e);
      }
    };
    if (document.body) go();
    else document.addEventListener("DOMContentLoaded", go);
  }

  function mount(cfg, num) {
    if (document.querySelector("[data-help-widget]")) return; // already running
    const lang = STRINGS[cfg.language] ? cfg.language : "en";
    let s = STRINGS[lang], label = "", contacts = [];
    let tpl = s.message;
    s = Object.assign({}, s, cfg.strings);
    tpl = cfg.messageTemplate ? String(cfg.messageTemplate) : s.message;
    label = cfg.launcherLabel ? String(cfg.launcherLabel) : "";
    contacts = [].concat(cfg.contacts || []).map((c) => ({ label: c && c.label ? String(c.label) : "", n: c && cleanNumber(c.whatsapp) }));
    if (contacts.some((c) => !c.label || !c.n)) warn("a contact was skipped. Each contact needs a label and a valid WhatsApp number.");
    contacts = contacts.filter((c) => c.label && c.n);
    const faqs = (Array.isArray(cfg.faqs) ? cfg.faqs : []).filter((f) => f && f.q && f.a);
    let color = cfg.color || DEFAULT_COLOR;
    if (!hexRgb(color)) {
      warn('color "' + color + '" is not a hex colour like #0F766E, so the default is used.');
      color = DEFAULT_COLOR;
    }
    const business = cfg.businessName ? String(cfg.businessName) : "";

    const host = el("div");
    host.setAttribute("data-help-widget", "");
    const root = host.attachShadow({ mode: "open" });
    const style = el("style", "", CSS);
    const wrap = el("div", cfg.position === "left" ? "hw left" : "hw");
    wrap.lang = lang;
    wrap.style.setProperty("--c", "#" + hexRgb(color).map((v) => v.toString(16).padStart(2, "0")).join(""));
    wrap.style.setProperty("--fg", textColor(color));

    const btn = el("button", "launch");
    btn.type = "button";
    btn.setAttribute("aria-label", label ? label + " (" + s.launcher + ")" : s.launcher);
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "hw-panel");
    btn.append(icon(CHAT));
    if (label) btn.append(el("span", "pill", label));
    wrap.append(btn);
    root.append(style, wrap);
    document.body.append(host);

    let panel, input, listTitle, list, none, live, liveTimer, banner;
    const links = []; // [anchor, number]
    const link = (n) => waLink(n, message(tpl, business, input ? input.value : "", pageUrl(location.href), s.ask));
    const refresh = () => links.forEach(([a, n]) => (a.href = link(n)));
    const announce = (text) => {
      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => (live.textContent = text), 600);
    };

    function render() {
      const has = tokens(input.value).length, res = search(input.value, faqs), shown = has ? res : faqs.slice(0, 5);
      listTitle.textContent = has ? s.matches : s.popular;
      listTitle.hidden = !shown.length;
      list.replaceChildren(...shown.map((f) => {
        const d = el("details"), a = el("div", "ans");
        a.append(...answerNodes(f.a));
        d.append(el("summary", "", f.q), a);
        return d;
      }));
      none.hidden = !has || res.length > 0;
      announce(!has ? "" : !res.length ? s.none : res.length === 1 ? s.found1 : fill(s.found, { n: res.length }));
      refresh();
    }

    function build() {
      panel = el("div", "panel");
      panel.id = "hw-panel";
      panel.hidden = true;
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-labelledby", "hw-title");
      const head = el("div", "head"), title = el("h2", "", business || s.title), x = el("button", "x");
      title.id = "hw-title";
      x.type = "button";
      x.setAttribute("aria-label", s.close);
      x.append(icon(CLOSE));
      x.addEventListener("click", () => close(true));
      head.append(title, x);

      const body = el("div", "body");
      if (cfg.hours && typeof cfg.hours === "object") body.append((banner = el("p", "banner")));
      body.append(el("p", "", cfg.welcome ? String(cfg.welcome) : s.welcome));
      if (faqs.length) {
        const lab = el("label", "sr", s.label);
        lab.htmlFor = "hw-q";
        input = el("input", "q");
        Object.assign(input, { id: "hw-q", type: "search", placeholder: s.placeholder, autocomplete: "off", maxLength: 200 });
        input.setAttribute("enterkeyhint", "search");
        input.addEventListener("input", render);
        listTitle = el("h3", "lt");
        list = el("div");
        none = el("div", "none");
        none.append(el("p", "", s.none), el("p", "", s.noneHint));
        body.append(lab, input, listTitle, list, none);
      }

      const foot = el("div", "foot");
      let wa;
      if (contacts.length) {
        const pick = el("div", "pick");
        pick.hidden = true;
        pick.append(el("p", "", s.pick));
        contacts.forEach((c) => {
          const a = linkOut(el("a", "", c.label));
          links.push([a, c.n]);
          pick.append(a);
        });
        wa = el("button", "wa");
        wa.type = "button";
        wa.setAttribute("aria-expanded", "false");
        wa.addEventListener("click", () => {
          pick.hidden = !pick.hidden;
          wa.setAttribute("aria-expanded", String(!pick.hidden));
          if (!pick.hidden) pick.querySelector("a").focus();
        });
        foot.append(pick);
      }
      if (!wa) links.push([(wa = linkOut(el("a", "wa"))), num]);
      wa.append(icon(CHAT), el("span", "", s.chat));
      foot.append(wa);
      foot.addEventListener("click", refresh, true); // page path may have changed (single-page sites)

      live = el("div", "sr");
      live.setAttribute("aria-live", "polite");
      panel.append(head, body, foot, live);
      wrap.append(panel);
      if (input) render();
      else refresh();
    }

    function updateBanner() {
      if (!banner) return;
      try {
        const st = hoursStatus(cfg.hours);
        banner.hidden = st.open;
        const when = st.time != null ? nextText(st, s) : "";
        banner.textContent = fill(cfg.hours.offlineMessage || (when ? s.closed : s.closedSoon), { when });
      } catch (e) {
        banner.hidden = true;
        warn('office hours were skipped. Check hours.timezone (e.g. "Asia/Kolkata") and times like ["10:00", "19:00"].');
      }
    }

    function open() {
      if (!panel) build();
      updateBanner();
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      (input || panel.querySelector(".wa")).focus();
    }

    function close(focusLauncher) {
      if (!panel || panel.hidden) return;
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      if (focusLauncher) btn.focus();
    }

    btn.addEventListener("click", () => (panel && !panel.hidden ? close(false) : open()));
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close(true);
      else if (e.target === input) e.stopPropagation(); // keep typing away from the site's own keyboard shortcuts
    });
    document.addEventListener("click", (e) => {
      const t = e.target && e.target.closest && e.target.closest("[data-help-open]");
      if (t && host.isConnected) {
        e.preventDefault();
        open();
      }
    });
  }

  if (typeof document !== "undefined") {
    try {
      start();
    } catch (e) {
      fail(e);
    }
  }

  if (typeof module !== "undefined") {
    module.exports = {
      VERSION, STRINGS, norm, tokens, within1, search, safeUrl, parseAnswer, hexRgb, textColor,
      cleanNumber, pageUrl, fill, message, waLink,
      hoursStatus, nextText,
    };
  }
})();
