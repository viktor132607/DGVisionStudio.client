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

export default function MyGalleryDetails() {
    const { id } = useParams()
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const galleryId = Number(id)
    const resolvedGalleryId = Number.isFinite(galleryId) ? galleryId : undefined

    const { gallery, loading, error } = useClientGalleryDetails(resolvedGalleryId)

    const t = isBg
        ? {
              title: "Галерия",
              back: "Назад към профила",
              loading: "Зареждане на галерия...",
              empty: "Няма налични снимки.",
              unavailable: "Галерията не е намерена.",
          }
        : {
              title: "Gallery",
              back: "Back to profile",
              loading: "Loading gallery...",
              empty: "No photos available.",
              unavailable: "Gallery not found.",
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
                        {gallery.coverImageUrl ? (
                            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                                <img
                                    src={gallery.coverImageUrl}
                                    alt={gallery.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : null}

                        <ClientDownloadPanel
                            downloadEnabled={gallery.downloadEnabled}
                            isExpired={gallery.isExpired}
                            remainingDownloadDays={gallery.remainingDownloadDays}
                            downloadAllUrl={resolvedGalleryId ? getGalleryZipDownloadUrl(resolvedGalleryId) : undefined}
                            isBg={isBg}
                        />

                        {gallery.photos.length ? (
                            <ClientPhotoGrid
                                photos={gallery.photos}
                                getPhotoDownloadUrl={(photoId) =>
                                    resolvedGalleryId
                                        ? getGalleryPhotoDownloadUrl(resolvedGalleryId, photoId)
                                        : "#"
                                }
                                isBg={isBg}
                            />
                        ) : (
                            <p className="text-[14px] text-neutral-500 dark:text-zinc-400">{t.empty}</p>
                        )}
                    </>
                ) : null}
            </div>
        </IdentityLayout>
    )
}