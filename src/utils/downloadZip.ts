type ZipFile = {
    name: string
    data: Uint8Array
}

const crcTable = (() => {
    const table = new Uint32Array(256)

    for (let i = 0; i < 256; i += 1) {
        let value = i
        for (let j = 0; j < 8; j += 1) {
            value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
        }
        table[i] = value >>> 0
    }

    return table
})()

function crc32(data: Uint8Array) {
    let crc = 0xffffffff

    for (let i = 0; i < data.length; i += 1) {
        crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
    }

    return (crc ^ 0xffffffff) >>> 0
}

function writeUint16(output: number[], value: number) {
    output.push(value & 0xff, (value >>> 8) & 0xff)
}

function writeUint32(output: number[], value: number) {
    output.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff)
}

function dosDateTime(date = new Date()) {
    const dosTime =
        (date.getHours() << 11) |
        (date.getMinutes() << 5) |
        Math.floor(date.getSeconds() / 2)

    const dosDate =
        ((date.getFullYear() - 1980) << 9) |
        ((date.getMonth() + 1) << 5) |
        date.getDate()

    return { dosDate, dosTime }
}

function sanitizeFileName(name: string) {
    return name.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim() || "file"
}

function getExtension(url: string, contentType: string) {
    const cleanUrl = url.split("?")[0]
    const match = cleanUrl.match(/\.([a-z0-9]{2,5})$/i)
    if (match?.[1]) return match[1].toLowerCase()

    if (contentType.includes("png")) return "png"
    if (contentType.includes("webp")) return "webp"
    if (contentType.includes("gif")) return "gif"

    return "jpg"
}

export async function downloadUrlAsFile(url: string, fileName: string) {
    const response = await fetch(url, { credentials: "include" })
    if (!response.ok) throw new Error("Неуспешно изтегляне на снимка.")

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = objectUrl
    link.download = sanitizeFileName(fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export async function downloadUrlsAsZip(
    files: { url: string; name: string }[],
    zipName: string
) {
    const fetchedFiles: ZipFile[] = []

    for (let i = 0; i < files.length; i += 1) {
        const item = files[i]
        const response = await fetch(item.url, { credentials: "include" })
        if (!response.ok) throw new Error("Неуспешно изтегляне на снимките.")

        const contentType = response.headers.get("content-type") || ""
        const extension = getExtension(item.url, contentType)
        const baseName = sanitizeFileName(item.name.replace(/\.[a-z0-9]{2,5}$/i, ""))
        const arrayBuffer = await response.arrayBuffer()

        fetchedFiles.push({
            name: `${String(i + 1).padStart(3, "0")}-${baseName}.${extension}`,
            data: new Uint8Array(arrayBuffer),
        })
    }

    const encoder = new TextEncoder()
    const output: number[] = []
    const centralDirectory: number[] = []
    const { dosDate, dosTime } = dosDateTime()

    for (const file of fetchedFiles) {
        const nameBytes = encoder.encode(file.name)
        const offset = output.length
        const checksum = crc32(file.data)

        writeUint32(output, 0x04034b50)
        writeUint16(output, 20)
        writeUint16(output, 0)
        writeUint16(output, 0)
        writeUint16(output, dosTime)
        writeUint16(output, dosDate)
        writeUint32(output, checksum)
        writeUint32(output, file.data.length)
        writeUint32(output, file.data.length)
        writeUint16(output, nameBytes.length)
        writeUint16(output, 0)
        output.push(...nameBytes, ...file.data)

        writeUint32(centralDirectory, 0x02014b50)
        writeUint16(centralDirectory, 20)
        writeUint16(centralDirectory, 20)
        writeUint16(centralDirectory, 0)
        writeUint16(centralDirectory, 0)
        writeUint16(centralDirectory, dosTime)
        writeUint16(centralDirectory, dosDate)
        writeUint32(centralDirectory, checksum)
        writeUint32(centralDirectory, file.data.length)
        writeUint32(centralDirectory, file.data.length)
        writeUint16(centralDirectory, nameBytes.length)
        writeUint16(centralDirectory, 0)
        writeUint16(centralDirectory, 0)
        writeUint16(centralDirectory, 0)
        writeUint16(centralDirectory, 0)
        writeUint32(centralDirectory, 0)
        writeUint32(centralDirectory, offset)
        centralDirectory.push(...nameBytes)
    }

    const centralDirectoryOffset = output.length
    output.push(...centralDirectory)

    writeUint32(output, 0x06054b50)
    writeUint16(output, 0)
    writeUint16(output, 0)
    writeUint16(output, fetchedFiles.length)
    writeUint16(output, fetchedFiles.length)
    writeUint32(output, centralDirectory.length)
    writeUint32(output, centralDirectoryOffset)
    writeUint16(output, 0)

    const blob = new Blob([new Uint8Array(output)], { type: "application/zip" })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = objectUrl
    link.download = sanitizeFileName(zipName.endsWith(".zip") ? zipName : `${zipName}.zip`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
