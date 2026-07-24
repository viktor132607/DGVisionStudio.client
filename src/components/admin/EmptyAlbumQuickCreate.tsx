import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { createAdminClientGallery } from "../../services/clientGalleries"
import { useAdminToast } from "../../hooks/useAdminToast"

export default function EmptyAlbumQuickCreate() {
    const location = useLocation()
    const navigate = useNavigate()
    const { showToast } = useAdminToast()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [titleEn, setTitleEn] = useState("")
    const [description, setDescription] = useState("")
    const [saving, setSaving] = useState(false)

    if (location.pathname !== "/admin/client-galleries/new") return null

    const createEmptyAlbum = async () => {
        if (!title.trim()) {
            showToast({ type: "error", title: "Грешка", message: "Въведи име на албума." })
            return
        }

        setSaving(true)

        try {
            const created = await createAdminClientGallery({
                title: title.trim(),
                titleEn: titleEn.trim() || null,
                description: description.trim() || null,
                isActive: true,
                isPublic: false,
                portfolioCategoryId: null,
                isPublished: false,
                galleryType: "Photoshoot",
                userGalleryStatus: "PhotoshootUploaded",
                userAccesses: [],
            } as any)

            if (!created.id) throw new Error("Албумът не беше създаден.")

            showToast({
                type: "success",
                title: "Готово",
                message: "Празният албум е създаден. Вече можеш да добавяш снимки.",
            })

            navigate(`/admin/client-galleries/edit?id=${created.id}`)
        } catch (error) {
            showToast({
                type: "error",
                title: "Грешка",
                message: error instanceof Error ? error.message : "Албумът не беше създаден.",
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-[80] rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
                + Празен албум
            </button>

            {open ? (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-4" onMouseDown={() => setOpen(false)}>
                    <div
                        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-950 dark:text-white">Празен албум</h2>
                                <p className="mt-1 text-sm text-neutral-500 dark:text-zinc-400">Създава заготовка без снимки. След това се отваря редакцията за качване.</p>
                            </div>
                            <button type="button" onClick={() => setOpen(false)} className="h-10 w-10 rounded-full border border-neutral-300 text-lg dark:border-zinc-700 dark:text-white">×</button>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">Име на български</span>
                                <input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus className="h-11 w-full rounded-2xl border border-neutral-300 px-4 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">Име на английски</span>
                                <input value={titleEn} onChange={(event) => setTitleEn(event.target.value)} className="h-11 w-full rounded-2xl border border-neutral-300 px-4 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-neutral-800 dark:text-zinc-200">Описание</span>
                                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                            </label>

                            <button
                                type="button"
                                onClick={() => void createEmptyAlbum()}
                                disabled={saving || !title.trim()}
                                className="h-11 w-full rounded-2xl bg-neutral-950 px-5 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-black"
                            >
                                {saving ? "Създаване..." : "Създай празен албум"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}
