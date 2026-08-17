import { useEffect } from "react"

const euroCurrencyPattern = /(?<![\p{L}\p{N}])(?:лв\.?|BGN)(?![\p{L}\p{N}])/giu

export function normalizeEuroCurrency(value: string) {
    return value.replace(euroCurrencyPattern, "€")
}

function shouldSkipTextNode(node: Text) {
    const parent = node.parentElement
    if (!parent) return true
    return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(parent.tagName)
}

function normalizeTextNode(node: Text) {
    if (shouldSkipTextNode(node)) return
    const current = node.nodeValue || ""
    const next = normalizeEuroCurrency(current)
    if (next !== current) node.nodeValue = next
}

function normalizeElement(element: Element) {
    for (const attribute of ["placeholder", "title", "aria-label"]) {
        const current = element.getAttribute(attribute)
        if (!current) continue
        const next = normalizeEuroCurrency(current)
        if (next !== current) element.setAttribute(attribute, next)
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        const nextValue = normalizeEuroCurrency(element.value)
        if (nextValue !== element.value) element.value = nextValue
    }

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    let current = walker.nextNode()
    while (current) {
        normalizeTextNode(current as Text)
        current = walker.nextNode()
    }
}

function normalizeNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
        normalizeTextNode(node as Text)
        return
    }

    if (node instanceof Element) normalizeElement(node)
}

export default function EuroCurrencyGuard() {
    useEffect(() => {
        normalizeElement(document.body)

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "characterData") {
                    normalizeNode(mutation.target)
                    continue
                }

                if (mutation.type === "attributes") {
                    if (mutation.target instanceof Element) normalizeElement(mutation.target)
                    continue
                }

                mutation.addedNodes.forEach(normalizeNode)
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["placeholder", "title", "aria-label"],
        })

        const normalizeFormValue = (event: Event) => {
            const target = event.target
            if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
            const next = normalizeEuroCurrency(target.value)
            if (next !== target.value) target.value = next
        }

        document.addEventListener("input", normalizeFormValue, true)
        document.addEventListener("change", normalizeFormValue, true)
        document.addEventListener("blur", normalizeFormValue, true)

        return () => {
            observer.disconnect()
            document.removeEventListener("input", normalizeFormValue, true)
            document.removeEventListener("change", normalizeFormValue, true)
            document.removeEventListener("blur", normalizeFormValue, true)
        }
    }, [])

    return null
}
