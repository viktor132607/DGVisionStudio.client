import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import IdentityLayout from "../../components/IdentityLayout"
import ClientPhotoGrid from "../../components/client-galleries/ClientPhotoGrid"
import ClientDownloadPanel from "../../components/client-galleries/ClientDownloadPanel"
import { useClientGalleryDetails } from "../../hooks/useClientGalleryDetails"
import {
    getGalleryPhotoDownloadUrl,
    getGalleryZipDownloadUrl,
} from "../../services/clientGalleries"
import { createPrintRequest } from "../../services/printRequests"
import type { GalleryType, UserClientGalleryStatus } from "../../types/clientGallery"

type SelectedPrintPhoto = {
    portfolioImageId: number
    quantity: number
    size: string
    paperType: string
    notes: string
}

const defaultSize = "10x15"
const defaultPaperType = "Glossy"

const isClientPrintUpload = (galleryType?: GalleryType) => {
    return galleryType === "ClientPrintUpload" || galleryType === 2
}

const getStatusLabel = (
    galleryType: GalleryType | undefined,
    status: UserClientGalleryStatus | undefined,
    isBg: boolean
) => {
    if (isClientPrintUpload(galleryType)) {
        if (status === "Processed" || status === 2) return isBg ? "Обработена" : "Processed"
        if (status === "Expired" || status === 3) return isBg ? "Изтекла" : "Expired"

        return isBg ? "Качена за печат" : "Uploaded for print"
    }

    if (status === "PhotoshootInProgress" || status === 5) return isBg ? "В обработка" : "In progress"
    if (status === "PhotoshootReadyForPickup" || status === 6) return isBg ? "Готова за вземане" : "Ready for pickup"
    if (status === "PhotoshootCancelled" || status === 7) return isBg ? "Отказана" : "Cancelled"

    return isBg ? "Качена" : "Uploaded"
}

export default function MyGalleryDetails() {
    const { id } = useParams()
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const galleryId = Number(id)
    const resolvedGalleryId = Number.isFinite(galleryId) ? galleryId : undefined

    const { gallery, loading, error } = useClientGalleryDetails(resolvedGalleryId)

    const [selectedPhotos, setSelectedPhotos] = useState<Record<number, SelectedPrintPhoto>>({})
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [notes, setNotes] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [printError, setPrintError] = useState("")
    const [printSuccess, setPrintSuccess] = useState("")

    const selectedItems = useMemo(() => Object.values(selectedPhotos), [selectedPhotos])
    const galleryIsClientPrintUpload = isClientPrintUpload(gallery?.galleryType)

    const t = isBg
        ? {
              title: "Галерия",
              back: "Назад към профила",
              loading: "Зареждане на галерия...",
              empty: "Няма налични снимки.",
              unavailable: "Галерията не е намерена.",
              printTitle: "Заявка за принтиране",
              printDescription: "Избери снимки от тази галерия и изпрати заявка за принтиране.",
              fullName: "Име",
              email: "Имейл",
              phone: "Телефон",
              notes: "Бележки",
              quantity: "Брой",
              size: "Размер",
              paperType: "Хартия",
              photoNotes: "Бележка към снимката",
              selectForPrint: "Избери за принтиране",
              selected: "Избрана",
              submit: "Изпрати заявка",
              submitting: "Изпращане...",
              success: "Заявката за принтиране е изпратена успешно.",
              selectAtLeastOne: "Избери поне една снимка.",
              fillRequired: "Попълни име и имейл.",
              status: "Статус",
              remaining: "Оставащи дни",
          }
        : {
              title: "Gallery",
              back: "Back to profile",
              loading: "Loading gallery...",
              empty: "No photos available.",
              unavailable: "Gallery not found.",
              printTitle: "Print request",
              printDescription: "Select photos from this gallery and submit a print request.",
              fullName: "Full name",
              email: "Email",
              phone: "Phone",
              notes: "Notes",
              quantity: "Quantity",
              size: "Size",
              paperType: "Paper type",
              photoNotes: "Photo note",
              selectForPrint: "Select for print",
              selected: "Selected",
              submit: "Submit request",
              submitting: "Submitting...",
              success: "Print request submitted successfully.",
              selectAtLeastOne: "Select at least one photo.",
              fillRequired: "Fill full name and email.",
              status: "Status",
              remaining: "Remaining days",
          }

    const togglePhoto = (photoId: number) => {
        setPrintError("")
        setPrintSuccess("")

        setSelectedPhotos(current => {
            if (current[photoId]) {
                const copy = { ...current }
                delete copy[photoId]
                return copy
            }

            return {
                ...current,
                [photoId]: {
                    portfolioImageId: photoId,
                    quantity: 1,
                    size: defaultSize,
                    paperType: defaultPaperType,
                    notes: "",
                },
            }
        })
    }

    const updateSelectedPhoto = (
        photoId: number,
        field: keyof SelectedPrintPhoto,
        value: string | number
    ) => {
        setSelectedPhotos(current => {
            const existing = current[photoId]

            if (!existing) return current

            return {
                ...current,
                [photoId]: {
                    ...existing,
                    [field]: value,
                },
            }
        })
    }

    const handleSubmitPrintRequest = async () => {
        setPrintError("")
        setPrintSuccess("")

        if (!resolvedGalleryId) return

        if (!fullName.trim() || !email.trim()) {
            setPrintError(t.fillRequired)
            return
        }

        if (!selectedItems.length) {
            setPrintError(t.selectAtLeastOne)
            return
        }

        setSubmitting(true)

        try {
            await createPrintRequest({
                portfolioAlbumId: resolvedGalleryId,
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim() || null,
                notes: notes.trim() || null,
                items: selectedItems.map(item => ({
                    portfolioImageId: item.portfolioImageId,
                    quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
                    size: item.size.trim() || defaultSize,
                    paperType: item.paperType.trim() || null,
                    notes: item.notes.trim() || null,
                })),
            })

            setSelectedPhotos({})
            setNotes("")
            setPrintSuccess(t.success)
        } catch (err) {
            setPrintError(err instanceof Error ? err.message : "Request failed.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <IdentityLayout title={gallery?.title || t.title} description={gallery?.description || undefined}>
            <div className="space-y-5">
                <div>
                    <Link
                        to="/identity/profile"
                        className="text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {t.back}
                    </Link>
                </div>

                {loading ? (
                    <p className="text-[14px] text-neutral-500 dark:text-zinc-400">{t.loading}</p>
                ) : null}

                {!loading && error ? (
                    <p className="text-[14px] text-red-600 dark:text-red-400">{error}</p>
                ) : null}

                {!loading && !error && !gallery ? (
                    <p className="text-[14px] text-neutral-500 dark:text-zinc-400">{t.unavailable}</p>
                ) : null}

                {gallery ? (
                    <>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-semibold text-neutral-700 dark:text-zinc-300">
                                    {t.status}:
                                </span>
                                <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-black">
                                    {getStatusLabel(gallery.galleryType, gallery.userGalleryStatus, isBg)}
                                </span>

                                {galleryIsClientPrintUpload ? (
                                    <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 dark:border-zinc-700 dark:text-zinc-300">
                                        {t.remaining}: {gallery.remainingLifetimeDays ?? 0}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        {gallery.coverImageUrl ? (
                            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                                <img
                                    src={gallery.coverImageUrl}
                                    alt={gallery.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : null}

                        {!galleryIsClientPrintUpload ? (
                            <ClientDownloadPanel
                                downloadEnabled={gallery.downloadEnabled}
                                isExpired={gallery.isExpired}
                                remainingDownloadDays={gallery.remainingDownloadDays}
                                downloadAllUrl={resolvedGalleryId ? getGalleryZipDownloadUrl(resolvedGalleryId) : undefined}
                                isBg={isBg}
                            />
                        ) : null}

                        {gallery.photos.length ? (
                            <>
                                <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                                    <div className="mb-4">
                                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                            {t.printTitle}
                                        </h2>
                                        <p className="mt-1 text-sm text-neutral-500 dark:text-zinc-400">
                                            {t.printDescription}
                                        </p>
                                    </div>

                                    <div className="mb-4 grid gap-3 md:grid-cols-3">
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={event => setFullName(event.target.value)}
                                            placeholder={t.fullName}
                                            className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                        />

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={event => setEmail(event.target.value)}
                                            placeholder={t.email}
                                            className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                        />

                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={event => setPhone(event.target.value)}
                                            placeholder={t.phone}
                                            className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                        />
                                    </div>

                                    <textarea
                                        value={notes}
                                        onChange={event => setNotes(event.target.value)}
                                        placeholder={t.notes}
                                        rows={3}
                                        className="mb-4 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                    />

                                    {printError ? (
                                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                                            {printError}
                                        </div>
                                    ) : null}

                                    {printSuccess ? (
                                        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
                                            {printSuccess}
                                        </div>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={() => void handleSubmitPrintRequest()}
                                        disabled={submitting || !selectedItems.length}
                                        className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                    >
                                        {submitting ? t.submitting : `${t.submit} (${selectedItems.length})`}
                                    </button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {gallery.photos.map(photo => {
                                        const selected = selectedPhotos[photo.id]

                                        return (
                                            <div
                                                key={photo.id}
                                                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => togglePhoto(photo.id)}
                                                    className="relative block w-full overflow-hidden bg-neutral-100 text-left dark:bg-zinc-800"
                                                >
                                                    <img
                                                        src={photo.previewUrl}
                                                        alt={photo.altText || photo.caption || ""}
                                                        className="aspect-square w-full object-cover"
                                                    />

                                                    <span
                                                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                                                            selected
                                                                ? "bg-green-600 text-white"
                                                                : "bg-white/90 text-neutral-900"
                                                        }`}
                                                    >
                                                        {selected ? t.selected : t.selectForPrint}
                                                    </span>
                                                </button>

                                                {selected ? (
                                                    <div className="space-y-3 p-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <label className="block">
                                                                <span className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-zinc-400">
                                                                    {t.quantity}
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    value={selected.quantity}
                                                                    onChange={event =>
                                                                        updateSelectedPhoto(
                                                                            photo.id,
                                                                            "quantity",
                                                                            Number(event.target.value)
                                                                        )
                                                                    }
                                                                    className="h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                                                />
                                                            </label>

                                                            <label className="block">
                                                                <span className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-zinc-400">
                                                                    {t.size}
                                                                </span>
                                                                <select
                                                                    value={selected.size}
                                                                    onChange={event =>
                                                                        updateSelectedPhoto(photo.id, "size", event.target.value)
                                                                    }
                                                                    className="h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                                                >
                                                                    <option value="10x15">10x15</option>
                                                                    <option value="13x18">13x18</option>
                                                                    <option value="15x21">15x21</option>
                                                                    <option value="20x30">20x30</option>
                                                                </select>
                                                            </label>
                                                        </div>

                                                        <label className="block">
                                                            <span className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-zinc-400">
                                                                {t.paperType}
                                                            </span>
                                                            <select
                                                                value={selected.paperType}
                                                                onChange={event =>
                                                                    updateSelectedPhoto(photo.id, "paperType", event.target.value)
                                                                }
                                                                className="h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                                            >
                                                                <option value="Glossy">Glossy</option>
                                                                <option value="Matte">Matte</option>
                                                            </select>
                                                        </label>

                                                        <textarea
                                                            value={selected.notes}
                                                            onChange={event =>
                                                                updateSelectedPhoto(photo.id, "notes", event.target.value)
                                                            }
                                                            placeholder={t.photoNotes}
                                                            rows={2}
                                                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>
                                        )
                                    })}
                                </div>

                                {!galleryIsClientPrintUpload ? (
                                    <ClientPhotoGrid
                                        photos={gallery.photos}
                                        getPhotoDownloadUrl={(photoId) =>
                                            resolvedGalleryId
                                                ? getGalleryPhotoDownloadUrl(resolvedGalleryId, photoId)
                                                : "#"
                                        }
                                        isBg={isBg}
                                    />
                                ) : null}
                            </>
                        ) : (
                            <p className="text-[14px] text-neutral-500 dark:text-zinc-400">{t.empty}</p>
                        )}
                    </>
                ) : null}
            </div>
        </IdentityLayout>
    )
}