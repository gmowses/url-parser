import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, Sun, Moon, Languages, Link, Plus, Trash2 } from 'lucide-react'

// ── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: 'URL Parser',
    subtitle: 'Parse, inspect, and reconstruct URLs. Edit individual parts and encode/decode. Client-side only.',
    input: 'URL Input',
    inputDesc: 'Paste a URL to parse',
    inputPlaceholder: 'https://example.com:8080/path?foo=bar&baz=qux#section',
    parsed: 'Parsed Components',
    parsedDesc: 'Individual URL parts',
    queryParams: 'Query Parameters',
    queryParamsDesc: 'Key-value pairs from the query string',
    reconstructed: 'Reconstructed URL',
    reconstructedDesc: 'URL built from edited components',
    protocol: 'Protocol',
    host: 'Host',
    port: 'Port',
    pathname: 'Path',
    search: 'Query String',
    hash: 'Fragment',
    origin: 'Origin',
    key: 'Key',
    value: 'Value',
    addParam: 'Add Param',
    copy: 'Copy',
    copied: 'Copied!',
    encode: 'Encode',
    decode: 'Decode',
    invalid: 'Invalid URL. Example: https://example.com/path?q=1#section',
    builtBy: 'Built by',
    deleteParam: 'Delete',
    noParams: 'No query parameters',
  },
  pt: {
    title: 'Parser de URL',
    subtitle: 'Parse, inspecione e reconstrua URLs. Edite partes individuais e encode/decode. Tudo no navegador.',
    input: 'Entrada de URL',
    inputDesc: 'Cole uma URL para analisar',
    inputPlaceholder: 'https://exemplo.com:8080/caminho?foo=bar&baz=qux#secao',
    parsed: 'Componentes Analisados',
    parsedDesc: 'Partes individuais da URL',
    queryParams: 'Parametros de Query',
    queryParamsDesc: 'Pares chave-valor da query string',
    reconstructed: 'URL Reconstruida',
    reconstructedDesc: 'URL construida a partir dos componentes editados',
    protocol: 'Protocolo',
    host: 'Host',
    port: 'Porta',
    pathname: 'Caminho',
    search: 'Query String',
    hash: 'Fragmento',
    origin: 'Origem',
    key: 'Chave',
    value: 'Valor',
    addParam: 'Adicionar',
    copy: 'Copiar',
    copied: 'Copiado!',
    encode: 'Codificar',
    decode: 'Decodificar',
    invalid: 'URL invalida. Exemplo: https://exemplo.com/caminho?q=1#secao',
    builtBy: 'Criado por',
    deleteParam: 'Remover',
    noParams: 'Sem parametros de query',
  }
} as const
type Lang = keyof typeof translations

interface QParam { key: string; value: string }

function parseUrl(raw: string): URL | null {
  try { return new URL(raw.trim()) } catch { return null }
}

function buildUrl(protocol: string, host: string, port: string, pathname: string, params: QParam[], hash: string): string {
  const portPart = port ? `:${port}` : ''
  const hashPart = hash ? `#${hash.replace(/^#/, '')}` : ''
  const query = params.filter(p => p.key).map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
  const searchPart = query ? `?${query}` : ''
  return `${protocol}//${host}${portPart}${pathname}${searchPart}${hashPart}`
}

export default function UrlParser() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [input, setInput] = useState('https://api.example.com:8080/v1/users?limit=10&offset=0&sort=asc#results')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  // Editable parts
  const [protocol, setProtocol] = useState('https:')
  const [host, setHost] = useState('')
  const [port, setPort] = useState('')
  const [pathname, setPathname] = useState('')
  const [params, setParams] = useState<QParam[]>([])
  const [hash, setHash] = useState('')

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const applyParsed = useCallback((url: URL) => {
    setProtocol(url.protocol)
    setHost(url.hostname)
    setPort(url.port)
    setPathname(url.pathname)
    const ps: QParam[] = []
    url.searchParams.forEach((v, k) => ps.push({ key: k, value: v }))
    setParams(ps)
    setHash(url.hash.replace(/^#/, ''))
  }, [])

  useEffect(() => {
    const parsed = parseUrl(input)
    if (parsed) { setError(''); applyParsed(parsed) }
    else if (input.trim()) setError(t.invalid)
    else setError('')
  }, [input, t, applyParsed])

  const reconstructed = buildUrl(protocol, host, port, pathname, params, hash)

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(text); setTimeout(() => setCopied(null), 2000) })
  }

  const CopyBtn = ({ text, small }: { text: string; small?: boolean }) => (
    <button onClick={() => copyText(text)} className={`${small ? 'p-1' : 'p-1.5'} rounded-md text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0`} title={t.copy}>
      {copied === text ? <Check size={small ? 12 : 14} className="text-green-500" /> : <Copy size={small ? 12 : 14} />}
    </button>
  )

  const parsed = parseUrl(input)

  const field = (label: string, value: string, onChange: (v: string) => void) => (
    <div className="grid grid-cols-[120px_1fr] items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="font-mono text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Link size={18} className="text-white" />
            </div>
            <span className="font-semibold">URL Parser</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/url-parser" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Input */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
            <div>
              <h2 className="font-semibold">{t.input}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.inputDesc}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="flex-1 font-mono text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => { setInput(encodeURI(input)) }} className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium">{t.encode}</button>
              <button onClick={() => { try { setInput(decodeURI(input)) } catch { /* ignore */ } }} className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium">{t.decode}</button>
            </div>
            {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
          </div>

          {parsed && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Parsed Components */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <div>
                  <h2 className="font-semibold">{t.parsed}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.parsedDesc}</p>
                </div>
                <div>
                  {[
                    { label: t.protocol, value: parsed.protocol },
                    { label: t.host, value: parsed.hostname },
                    { label: t.port, value: parsed.port || '(default)' },
                    { label: t.pathname, value: parsed.pathname },
                    { label: t.search, value: parsed.search || '(none)' },
                    { label: t.hash, value: parsed.hash || '(none)' },
                    { label: t.origin, value: parsed.origin },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                      <span className="text-xs text-zinc-400 font-medium w-24 shrink-0">{label}</span>
                      <span className="font-mono text-xs flex-1 text-zinc-700 dark:text-zinc-300 truncate">{value}</span>
                      {value !== '(none)' && value !== '(default)' && <CopyBtn text={value} small />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit & Reconstruct */}
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
                  <h2 className="font-semibold">{t.parsed} (editable)</h2>
                  {field(t.protocol, protocol, setProtocol)}
                  {field(t.host, host, setHost)}
                  {field(t.port, port, setPort)}
                  {field(t.pathname, pathname, setPathname)}
                  {field(t.hash, hash, setHash)}
                </div>

                {/* Query Params */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{t.queryParams}</h2>
                    <button onClick={() => setParams(p => [...p, { key: '', value: '' }])} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors">
                      <Plus size={12} />{t.addParam}
                    </button>
                  </div>
                  {params.length === 0 && <p className="text-xs text-zinc-400 italic">{t.noParams}</p>}
                  {params.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={p.key}
                        onChange={e => setParams(ps => ps.map((pp, ii) => ii === i ? { ...pp, key: e.target.value } : pp))}
                        placeholder={t.key}
                        className="flex-1 font-mono text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-zinc-300">=</span>
                      <input
                        type="text"
                        value={p.value}
                        onChange={e => setParams(ps => ps.map((pp, ii) => ii === i ? { ...pp, value: e.target.value } : pp))}
                        placeholder={t.value}
                        className="flex-1 font-mono text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button onClick={() => setParams(ps => ps.filter((_, ii) => ii !== i))} className="text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reconstructed URL */}
          {parsed && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
              <div>
                <h2 className="font-semibold">{t.reconstructed}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.reconstructedDesc}</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
                <span className="font-mono text-sm flex-1 break-all text-blue-700 dark:text-blue-300">{reconstructed}</span>
                <CopyBtn text={reconstructed} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-blue-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
