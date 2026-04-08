import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type AdminClientPhotoDropzoneProps = {
    disabled?: boolean
    onUpload: (files: File[]) => Promise<void>
}

export default function AdminClientPhotoDropzone({
    disabled = false,
    onUpload,
}: AdminClientPhotoDropzoneProps) {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")
    const inputRef = useRef<HTMLInputElement | null>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const t = isBg
        ? {
              title: "Качи снимки",
              subtitle: "Пусни снимките тук или избери от устройството.",
              button: "Качи от устройство",
              uploading: "Качване...",
              success: "Снимките бяха качени успешно.",
              disabled: "Първо създай галерията.",
          }
        : {
              title: "Upload photos",
              subtitle: "Drop photos here or choose them from your device.",
              button: "Upload from device",
              uploading: "Uploading...",
              success: "Photos uploaded successfully.",
              disabled: "Create the gallery first.",
          }

    const handleFiles = async (fileList: FileList | File[]) => {
        const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"))

        if (!files.length || disabled) {
            if (disabled) setError(t.disabled)
            return
        }

        setUploading(true)
        setError("")
        setSuccess("")

        try {
            await onUpload(files)
            setSuccess(t.success)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed.")
        } finally {
            setUploading(false)
            setIsDragging(false)
            if (inputRef.current) inputRef.current.value = ""
        }
    }

    return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4">
                <h3 className="text-[16px] font-semibold text-neutral-950 dark:text-white">
                    {t.title}
                </h3>
                <p className="mt-1 text-[14px] text-neutral-500 dark:text-zinc-400">
                    {t.subtitle}
                </p>
            </div>

            <div
                onDragOver={(e) => {
                    e.preventDefault()
                    if (!disabled) setIsDragging(true)
                }}
                onDragLeave={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                }}
                onDrop={(e) => {
                    e.preventDefault()
                    void handleFiles(e.dataTransfer.files)
                }}
                className={`flex min-h-[180px] flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition ${
                    isDragging
                        ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-zinc-800"
                        : "border-neutral-300 bg-neutral-50/60 dark:border-zinc-700 dark:bg-zinc-950"
                } ${disabled ? "opacity-60" : ""}`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files?.length) {
                            void handleFiles(e.target.files)
                        }
                    }}
                />

                <button
                    type="button"
                    disabled={disabled || uploading}
                    onClick={() => inputRef.current?.click()}
                    className="rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    {uploading ? t.uploading : t.button}
                </button>
            </div>

            <div className="mt-4 min-h-[20px] text-[13px] text-red-600 dark:text-red-400">
                {error ? <p>{error}</p> : null}
            </div>

            <div className="min-h-[20px] text-[13px] text-emerald-600 dark:text-emerald-400">
                {success ? <p>{success}</p> : null}
            </div>
        </div>
    )
}