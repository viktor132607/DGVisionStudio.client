import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type ClientPhotoUploadFormProps = {
    title?: string
    galleryId?: number
    accept?: string
    buttonLabel?: string
    uploadingLabel?: string
    allowMultiple?: boolean
    onUpload: (files: File[]) => Promise<void>
}

export default function ClientPhotoUploadForm({
    title,
    galleryId,
    accept = "image/*",
    buttonLabel,
    uploadingLabel,
    allowMultiple = true,
    onUpload,
}: ClientPhotoUploadFormProps) {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const inputRef = useRef<HTMLInputElement | null>(null)

    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [dragging, setDragging] = useState(false)

    const t = isBg
        ? {
              defaultTitle: "Качване на снимки",
              choose: "Избери файлове",
              missingFile: "Избери поне една снимка.",
              upload: "Качи",
              uploading: "Качване...",
              uploaded: "Снимките бяха качени успешно.",
              dragHere: "Плъзни снимки тук",
              orPaste: "или постави с Ctrl + V",
              selected: "Избрани файлове",
          }
        : {
              defaultTitle: "Upload photos",
              choose: "Choose files",
              missingFile: "Choose at least one photo.",
              upload: "Upload",
              uploading: "Uploading...",
              uploaded: "Photos uploaded successfully.",
              dragHere: "Drag photos here",
              orPaste: "or paste with Ctrl + V",
              selected: "Selected files",
          }

    const setSelectedFiles = (incoming: FileList | File[] | null | undefined) => {
        const next = Array.from(incoming || []).filter((file) => file.type.startsWith("image/"))
        setFiles(next)
        setError("")
        setSuccess("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!files.length) {
            setError(t.missingFile)
            return
        }

        setUploading(true)

        try {
            await onUpload(files)
            setSuccess(t.uploaded)
            setFiles([])
            if (inputRef.current) {
                inputRef.current.value = ""
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed.")
        } finally {
            setUploading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                setSelectedFiles(e.dataTransfer.files)
            }}
            className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
        >
            <h3 className="text-[16px] font-semibold text-neutral-950 dark:text-white">
                {title || t.defaultTitle}
            </h3>

            <div
                className={`rounded-2xl border border-dashed p-5 text-center transition ${
                    dragging
                        ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                        : "border-neutral-300 bg-neutral-50 dark:border-zinc-700 dark:bg-zinc-950"
                }`}
            >
                <p className="text-[14px] font-semibold text-neutral-900 dark:text-white">
                    {t.dragHere}
                </p>
                <p className="mt-1 text-[13px] text-neutral-500 dark:text-zinc-400">
                    {t.orPaste}
                </p>

                <div className="mt-4">
                    <label className="inline-flex cursor-pointer items-center rounded-full border border-neutral-950 bg-neutral-950 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                        {t.choose}
                        <input
                            ref={inputRef}
                            id={`file-upload-${galleryId || "draft"}-${title || "default"}`}
                            type="file"
                            accept={accept}
                            multiple={allowMultiple}
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {files.length > 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
                    <div className="mb-2 text-[13px] font-semibold text-neutral-800 dark:text-zinc-200">
                        {t.selected}: {files.length}
                    </div>

                    <div className="max-h-40 space-y-1 overflow-auto">
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}-${file.size}`}
                                className="truncate text-[13px] text-neutral-600 dark:text-zinc-400"
                            >
                                {file.name}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="min-h-[20px] text-[13px] leading-5 text-red-600 dark:text-red-400">
                {error ? <p>{error}</p> : null}
            </div>

            <div className="min-h-[20px] text-[13px] leading-5 text-emerald-600 dark:text-emerald-400">
                {success ? <p>{success}</p> : null}
            </div>

            <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
                {uploading ? uploadingLabel || t.uploading : buttonLabel || t.upload}
            </button>
        </form>
    )
}