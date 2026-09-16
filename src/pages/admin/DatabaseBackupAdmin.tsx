import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

async function requireSuccess(response: Response) {
    if (response.ok) return
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || error?.title || `Операцията е неуспешна (${response.status}).`)
}

export default function DatabaseBackupAdmin() {
    const [archive, setArchive] = useState<File | null>(null)
    const [confirmation, setConfirmation] = useState("")
    const [busy, setBusy] = useState<"export" | "restore" | null>(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        if (!busy) return
        const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
        window.addEventListener("beforeunload", warn)
        return () => window.removeEventListener("beforeunload", warn)
    }, [busy])

    async function exportDatabase() {
        setBusy("export"); setError(""); setSuccess("")
        try {
            const response = await apiFetch("/admin/database-backup/export", { cache: "no-store" })
            await requireSuccess(response)
            const blob = await response.blob()
            if (!blob.size) throw new Error("Полученият архив е празен.")
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `dgvisionstudio-full-database-${new Date().toISOString().replace(/[:.]/g, "-")}.dump`
            document.body.appendChild(link); link.click(); link.remove()
            window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
            setSuccess("Архивът е създаден и изпратен за изтегляне.")
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Архивирането е неуспешно.")
        } finally { setBusy(null) }
    }

    async function restoreDatabase() {
        if (!archive || confirmation !== "RESTORE" || busy) return
        setBusy("restore"); setError(""); setSuccess("")
        try {
            const form = new FormData()
            form.append("archive", archive)
            form.append("confirmation", confirmation)
            const response = await apiFetch("/admin/database-backup/restore", {
                method: "POST", body: form, skipJsonContentType: true,
            })
            await requireSuccess(response)
            setConfirmation("")
            setSuccess("Базата е възстановена успешно. Презаредете сайта; може да е необходимо да влезете отново с профил от архива.")
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Възстановяването е неуспешно.")
        } finally { setBusy(null) }
    }

    const button = "rounded-xl px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
    return (
        <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6" aria-busy={busy !== null}>
            <header><h1 className="text-2xl font-black sm:text-3xl">Архив на базата</h1></header>
            <p className="text-slate-600 dark:text-slate-300">
                Пълен архив на PostgreSQL базата на DGVisionStudio: всички таблици, записи, потребители,
                настройки, връзки, схеми, миграции и последователности. Включва и данни извън текущите модели на приложението.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
                Снимките и видеата в Cloudinary или на диска не са в PostgreSQL — архивът съдържа записите
                и адресите им, но не самите външни файлове. Съхранявайте архива защитено: съдържа лични данни.
            </p>
            {error && <p role="alert" className="rounded-xl bg-red-100 p-4 text-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}
            {success && <div role="status" className="space-y-3 rounded-xl bg-green-100 p-4 text-green-900 dark:bg-green-950 dark:text-green-200">
                <p>{success}</p>
                {success.startsWith("Базата") && <button className={button} onClick={() => window.location.reload()}>Презареди сайта</button>}
            </div>}
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                <h2 className="text-xl font-bold">Изтегляне на пълен архив</h2>
                <p>Създава компресиран PostgreSQL архив във формат .dump.</p>
                <button type="button" disabled={busy !== null} onClick={() => void exportDatabase()}
                    className={`${button} bg-slate-950 text-white dark:bg-white dark:text-black`}>
                    {busy === "export" ? "Архивиране…" : "Изтегли архив"}
                </button>
            </section>
            <section className="space-y-4 rounded-2xl border border-red-300 bg-white p-5 dark:border-red-900 dark:bg-zinc-900">
                <h2 className="text-xl font-bold">Възстановяване от архив</h2>
                <p>Заменя цялото текущо съдържание на базата със състоянието от архива.
                    По-новите данни ще бъдат премахнати. Първо изтеглете архив на текущото състояние.</p>
                <p className="text-sm">Използвайте само доверен архив от тази база. При грешка промените се отменят.
                    Не затваряйте страницата по време на операцията.</p>
                <label className="block space-y-2"><span className="font-bold">PostgreSQL архив (.dump)</span>
                    <input type="file" accept=".dump" disabled={busy !== null} className="block w-full min-w-0 text-sm"
                        onChange={event => { setArchive(event.target.files?.[0] || null); setConfirmation(""); setError(""); setSuccess("") }} />
                </label>
                {archive && <p className="break-all text-sm">{archive.name} — {(archive.size / 1024 / 1024).toFixed(2)} MB</p>}
                <label className="block space-y-2"><span className="font-bold">Въведете RESTORE за потвърждение</span>
                    <input value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={busy !== null}
                        autoComplete="off" spellCheck={false} className="block w-full rounded-xl border border-slate-300 bg-transparent p-3 dark:border-white/20" />
                </label>
                <button type="button" disabled={busy !== null || !archive?.size || confirmation !== "RESTORE"}
                    onClick={() => void restoreDatabase()} className={`${button} bg-red-700 text-white`}>
                    {busy === "restore" ? "Възстановяване…" : "Възстанови цялата база"}
                </button>
            </section>
        </div>
    )
}
