import { useEffect, useRef, useState } from "react"
import type { ComponentProps } from "react"
import { useTranslation } from "react-i18next"

type Props = Omit<ComponentProps<"img">, "src" | "srcSet" | "onError"> & {
    src?: string | null
    fallbackSrc?: string | null
}

export default function GalleryImage(props: Props) {
    // Remount when either URL changes, including after replacing a failed upload.
    return <ImageAttempt key={JSON.stringify([props.src, props.fallbackSrc])} {...props} />
}

function ImageAttempt({ src, fallbackSrc, alt, onLoad, style, ...props }: Props) {
    const { i18n } = useTranslation()
    const sources = [...new Set([src?.trim(), fallbackSrc?.trim()].filter((url): url is string => Boolean(url)))]
    const [attempt, setAttempt] = useState(0)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const failed = sources.length === 0 || attempt >= sources.length * 2

    useEffect(() => () => {
        if (timer.current !== null) clearTimeout(timer.current)
    }, [])

    if (failed) return <span role="status" style={style}
        className={`${props.className || ""} flex min-h-20 min-w-20 items-center justify-center bg-neutral-100 p-3 text-center text-xs text-neutral-700 dark:bg-zinc-800 dark:text-zinc-200`}>
        {i18n.language?.startsWith("en") ? "Image could not be loaded" : "Снимката не може да се зареди"}
    </span>

    return <img {...props} key={attempt} src={sources[attempt % sources.length]}
            alt={alt} style={style}
            onLoad={(event) => {
                if (timer.current !== null) {
                    clearTimeout(timer.current)
                    timer.current = null
                }
                onLoad?.(event)
            }}
            onError={() => {
                if (failed || timer.current !== null) return
                const next = attempt + 1
                if (next === sources.length) {
                    // Retry once after transient network/CDN failures; never loop indefinitely.
                    timer.current = setTimeout(() => {
                        timer.current = null
                        setAttempt(next)
                    }, 1500)
                } else {
                    setAttempt(next)
                }
            }} />
}
