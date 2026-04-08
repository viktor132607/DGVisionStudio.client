type ClientGalleryStatusBadgeProps = {
    previewEnabled: boolean
    downloadEnabled: boolean
    isExpired: boolean
    isBg: boolean
}

export default function ClientGalleryStatusBadge({
    previewEnabled,
    downloadEnabled,
    isExpired,
    isBg,
}: ClientGalleryStatusBadgeProps) {
    const text = isExpired
        ? isBg
            ? "Изтекъл достъп"
            : "Expired"
        : downloadEnabled
          ? isBg
              ? "Платено / Изтегляне"
              : "Paid / Download"
          : previewEnabled
            ? isBg
                ? "Преглед"
                : "Preview"
            : isBg
              ? "Без достъп"
              : "No access"

    const className = isExpired
        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        : downloadEnabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"

    return (
        <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold ${className}`}>
            {text}
        </span>
    )
}