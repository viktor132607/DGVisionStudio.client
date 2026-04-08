const CYRILLIC_TO_LATIN: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sht",
    ъ: "a",
    ь: "y",
    ю: "yu",
    я: "ya",
}

function transliterate(input: string) {
    return input
        .split("")
        .map((char) => {
            const lower = char.toLowerCase()
            return CYRILLIC_TO_LATIN[lower] ?? lower
        })
        .join("")
}

export function slugify(input: string) {
    return transliterate(input)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/&/g, " and ")
        .replace(/['’"]/g, "")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
}

export function ensureUniqueSlug(input: string, usedSlugs: string[], currentSlug?: string) {
    const base = slugify(input) || "category"
    const normalizedCurrentSlug = (currentSlug || "").trim().toLowerCase()
    const normalizedUsed = usedSlugs
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item && item !== normalizedCurrentSlug)

    if (!normalizedUsed.includes(base)) {
        return base
    }

    let counter = 2
    let candidate = `${base}-${counter}`

    while (normalizedUsed.includes(candidate)) {
        counter += 1
        candidate = `${base}-${counter}`
    }

    return candidate
}