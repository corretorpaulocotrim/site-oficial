#!/usr/bin/env python3
"""
Smoke test para paulocotrim.com — roda ANTES de qualquer push.
Verifica: HTTP 200, sintaxe de todo <script> inline, balanceamento de tags criticas.
Uso: python3 smoke_test.py [--base https://www.paulocotrim.com] [--pages pages.txt]
"""
import urllib.request, re, subprocess, sys, os, tempfile

BASE = "https://www.paulocotrim.com"
PAGES_FILE = os.path.join(os.path.dirname(__file__), "pages.txt")

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "smoke-test/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return None, str(e)

def check_inline_js(html, url):
    errors = []
    for m in re.finditer(r'<script([^>]*)>(.*?)</script>', html, re.DOTALL | re.IGNORECASE):
        attrs, code = m.group(1), m.group(2)
        if 'src=' in attrs or 'application/ld+json' in attrs or not code.strip():
            continue
        with tempfile.NamedTemporaryFile(mode="w", suffix=".js", delete=False, encoding="utf-8") as f:
            f.write(code)
            path = f.name
        try:
            res = subprocess.run(["node", "--check", path], capture_output=True, text=True, timeout=15)
            if res.returncode != 0:
                errors.append(f"  JS SYNTAX ERROR: {res.stderr.strip()[:300]}")
        finally:
            os.unlink(path)
    return errors

def check_balance(html):
    errors = []
    for tag in ["div", "section", "script", "style"]:
        opens = len(re.findall(rf'<{tag}(?:\s[^>]*)?>', html, re.IGNORECASE))
        closes = len(re.findall(rf'</{tag}>', html, re.IGNORECASE))
        if opens != closes:
            errors.append(f"  TAG IMBALANCE <{tag}>: {opens} open vs {closes} close")
    return errors

def main():
    pages_file = sys.argv[sys.argv.index("--pages")+1] if "--pages" in sys.argv else PAGES_FILE
    with open(pages_file) as f:
        urls = [l.strip() for l in f if l.strip()]

    total_errors = 0
    print(f"Smoke test: {len(urls)} paginas\n")
    for url in urls:
        status, html = fetch(url)
        problems = []
        if status != 200:
            problems.append(f"  HTTP STATUS: {status}")
        else:
            problems += check_inline_js(html, url)
            problems += check_balance(html)
        if problems:
            total_errors += len(problems)
            print(f"[FALHOU] {url}")
            for p in problems:
                print(p)
        else:
            print(f"[OK]     {url}")

    print(f"\n{'='*50}")
    if total_errors:
        print(f"RESULTADO: {total_errors} problema(s) encontrado(s). NAO FAZER PUSH ate corrigir.")
        sys.exit(1)
    else:
        print("RESULTADO: tudo OK. Seguro para push.")
        sys.exit(0)

if __name__ == "__main__":
    main()
