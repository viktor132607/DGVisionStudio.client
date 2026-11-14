/** Attempt every file, retaining per-file failures without replaying confirmed uploads. */
export async function uploadPhotoBatch(
    files: File[],
    upload: (file: File) => Promise<unknown>,
    onUploaded: (file: File) => void = () => {},
): Promise<string[]> {
    const failures: string[] = []
    for (const file of files) {
        try {
            await upload(file)
            onUploaded(file)
        } catch (error) {
            failures.push(`${file.name}: ${error instanceof Error ? error.message : "Upload failed."}`)
        }
    }
    return failures
}
