import { useState } from "react"
import { apiFetchJson } from "../../services/api"

type CommandResult = {
    command: string
    count: number
    albumCount: number
    message: string
}

const examples = [
    { command: "albums.photos.clear-text --all", label: "Всички албуми" },
    { command: "albums.photos.clear-text --album 123", label: "Един албум (ID 123)" },
]

export default function AdminCommandPrompt() {
    const [command, setCommand] = useState("")
    const [preview, setPreview] = useState<CommandResult | null>(null)
    const [confirmation, setConfirmation] = useState("")
    const [busy, setBusy] = useState<"preview" | "execute" | null>(null)
    const [error, setError] = useState("")
    const [output, setOutput] = useState("")

    const editCommand = (value: string) => {
        setCommand(value)
        setPreview(null)
        setConfirmation("")
        setError("")
        setOutput("")
    }

    const checkCommand = async () => {
        if (!command.trim() || busy) return
        setBusy("preview")
        setError("")
        setOutput("")
        setPreview(null)
        setConfirmation("")
        try {
            const result = await apiFetchJson<CommandResult>("/admin/commands/preview", {
                method: "POST",
                body: JSON.stringify({ command }),
            })
            setPreview(result)
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Командата не може да бъде проверена.")
        } finally {
            setBusy(null)
        }
    }

    const executeCommand = async () => {
        if (!preview || confirmation !== "ИЗПЪЛНИ" || busy || command.trim() !== preview.command) return
        setBusy("execute")
        setError("")
        setOutput("")
        try {
            const result = await apiFetchJson<CommandResult>("/admin/commands/execute", {
                method: "POST",
                body: JSON.stringify({
                    command: preview.command,
                    expectedCount: preview.count,
                    confirm: true,
                }),
            })
            setOutput(result.message)
            setPreview(null)
            setConfirmation("")
        } catch (cause) {
            setPreview(null)
            setConfirmation("")
            setError(cause instanceof Error ? cause.message : "Командата не беше изпълнена.")
        } finally {
            setBusy(null)
        }
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-6" aria-busy={busy !== null}>
            <header className="space-y-2">
                <h1 className="text-2xl font-black sm:text-3xl">Команден промпт</h1>
                
            </header>

            <section className="overflow-hidden rounded-2xl border border-slate-700 bg-zinc-950 text-zinc-100 shadow-xl">
                <div className="border-b border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    DG Vision Studio / Admin Console
                </div>
                <form className="space-y-4 p-5" onSubmit={event => { event.preventDefault(); void checkCommand() }}>
                    <label htmlFor="admin-command" className="block text-sm font-semibold text-zinc-300">Въведи команда</label>
                    <div className="flex items-start gap-3 rounded-xl border border-zinc-700 bg-black p-3 focus-within:border-sky-400">
                        <span aria-hidden="true" className="pt-1 font-mono text-green-400">$</span>
                        <textarea
                            id="admin-command"
                            value={command}
                            onChange={event => editCommand(event.target.value)}
                            placeholder="albums.photos.clear-text --all"
                            spellCheck={false}
                            autoCapitalize="off"
                            autoComplete="off"
                            rows={2}
                            maxLength={256}
                            disabled={busy !== null}
                            className="min-h-14 w-full resize-y bg-transparent font-mono text-sm text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!command.trim() || busy !== null}
                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {busy === "preview" ? "Проверка…" : "Провери командата"}
                    </button>
                </form>
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                <h2 className="text-lg font-bold">Налични команди</h2>
                {examples.map(example => (
                    <div key={example.command} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-2 last:border-0 dark:border-white/10">
                        <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium">{example.label}</p>
                            <code className="block break-all text-xs text-slate-600 dark:text-zinc-300">{example.command}</code>
                        </div>
                        <button type="button" disabled={busy !== null} onClick={() => editCommand(example.command)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 disabled:opacity-50 dark:border-white/20 dark:hover:bg-zinc-800">
                            Използвай
                        </button>
                    </div>
                ))}
                
            </section>

            {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}
            {output && <p role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{output}</p>}

            {preview && (
                <section className="space-y-4 rounded-2xl border border-amber-300 bg-white p-5 dark:border-amber-700 dark:bg-zinc-900">
                    <h2 className="text-lg font-bold">Предварителен резултат</h2>
                    <p className="text-sm">Снимки с текст: <strong>{preview.count}</strong>. Засегнати албуми: <strong>{preview.albumCount}</strong>.</p>
                    <p className="text-sm text-slate-600 dark:text-zinc-300">{preview.message}</p>
                    {preview.count > 0 ? (
                        <>
                            <label htmlFor="admin-command-confirm" className="block space-y-2 text-sm font-semibold">
                                <span>За потвърждение въведи ИЗПЪЛНИ</span>
                                <input id="admin-command-confirm" value={confirmation}
                                    onChange={event => setConfirmation(event.target.value)}
                                    disabled={busy !== null} autoComplete="off" spellCheck={false}
                                    className="block w-full max-w-sm rounded-xl border border-slate-300 bg-transparent px-4 py-3 font-mono outline-none focus:border-sky-500 dark:border-white/20" />
                            </label>
                            <button type="button" onClick={() => void executeCommand()}
                                disabled={confirmation !== "ИЗПЪЛНИ" || busy !== null}
                                className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
                                {busy === "execute" ? "Изпълняване…" : "Изпълни командата"}
                            </button>
                        </>
                    ) : <p className="text-sm font-medium">Няма снимки с текст за премахване.</p>}
                </section>
            )}
        </div>
    )
}
