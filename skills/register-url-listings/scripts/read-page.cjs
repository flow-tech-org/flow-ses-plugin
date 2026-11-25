#!/usr/bin/env node
// Opens one page in headless Chromium without signing in and prints what it shows as JSON:
// { url, finalUrl, status, title, text, links: [{ text, href }], hosts, refusedHosts, signIn, botCheck }.
// Used by flow-ses:register-url-listings and flow-ses:onboarding for pages drawn with JavaScript.
// Usage: node read-page.cjs <url> [--out <file.json>] [--scroll] [--wait <ms>]
"use strict";

const args = process.argv.slice(2);
const url = args.find((a, i) => !a.startsWith("--") && !["--out", "--wait"].includes(args[i - 1]));
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const out = opt("--out");
const extraWait = Number(opt("--wait") || 0);
const scroll = args.includes("--scroll");

function emit(result, code = 0) {
  const json = JSON.stringify(result, null, 1);
  if (out) require("fs").writeFileSync(out, json);
  else process.stdout.write(json + "\n");
  process.exit(code);
}

if (!url || !/^https?:\/\//.test(url)) emit({ error: "usage", message: "node read-page.cjs <http(s) url> [--out file] [--scroll] [--wait ms]" }, 2);

let chromium;
try { ({ chromium } = require("playwright")); } catch {
  emit({ url, error: "noBrowser", message: "Playwright is not installed in this environment" }, 3);
}

const BOT = /captcha|recaptcha|(confirm|verify) you are (a )?human|hcaptcha|turnstile|awswaf|challenges\.cloudflare|cf-chl|just a moment|ロボットではありません|アクセスが拒否/i;

(async () => {
  let browser;
  try { browser = await chromium.launch(); } catch (e) {
    emit({ url, error: "noBrowser", message: String(e.message).split("\n")[0] }, 3);
  }
  const page = await browser.newPage({ locale: "ja-JP" });
  const hosts = new Set();
  const refused = new Map();
  page.on("request", (r) => { try { hosts.add(new URL(r.url()).host); } catch {} });
  page.on("requestfailed", (r) => {
    const err = (r.failure() || {}).errorText || "";
    if (/TUNNEL|PROXY|CONNECTION_REFUSED|NAME_NOT_RESOLVED|BLOCKED|ADDRESS_UNREACHABLE/i.test(err)) {
      try { refused.set(new URL(r.url()).host, err); } catch {}
    }
  });

  let response;
  try {
    response = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch (e) {
    // networkidle may never come on pages that poll; use what has loaded.
    if (!/Timeout/i.test(e.message)) {
      const host = (() => { try { return new URL(url).host; } catch { return url; } })();
      await browser.close();
      emit({ url, error: refused.has(host) ? "downloadBlocked" : "openFailed", host, message: String(e.message).split("\n")[0], refusedHosts: [...refused.keys()] }, 4);
    }
  }
  if (scroll) {
    for (let i = 0; i < 20; i++) {
      const h = await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); return document.body.scrollHeight; });
      await page.waitForTimeout(800);
      const h2 = await page.evaluate(() => document.body.scrollHeight);
      if (h2 === h) break;
    }
  }
  if (extraWait > 0) await page.waitForTimeout(Math.min(extraWait, 30000));

  const data = await page.evaluate(() => {
    for (const el of document.querySelectorAll("script, style, noscript, template")) el.remove();
    return {
      title: document.title,
      text: document.body ? document.body.innerText : "",
      links: [...document.querySelectorAll("a[href]")]
        .map((a) => ({ text: (a.innerText || a.getAttribute("aria-label") || "").trim().replace(/\s+/g, " "), href: a.href }))
        .filter((l) => /^https?:/.test(l.href)),
      signIn: !!document.querySelector('input[type="password"]'),
      frames: [...document.querySelectorAll("iframe[src]")].map((f) => f.src),
    };
  });
  const allHosts = [...hosts];
  const botCheck = BOT.test(data.title) || BOT.test(data.text.slice(0, 2000)) || allHosts.some((h) => /captcha|awswaf|challenges\.cloudflare/i.test(h)) || data.frames.some((f) => BOT.test(f));
  await browser.close();
  emit({
    url,
    finalUrl: page.url(),
    status: response ? response.status() : null,
    title: data.title,
    text: data.text,
    links: data.links,
    hosts: allHosts,
    refusedHosts: [...refused.keys()],
    signIn: data.signIn,
    botCheck,
  });
})().catch((e) => emit({ url, error: "openFailed", message: String(e && e.message).split("\n")[0] }, 4));
