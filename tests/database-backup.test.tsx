import { afterEach, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import DatabaseBackupAdmin from "../src/pages/admin/DatabaseBackupAdmin"
import { apiFetch } from "../src/services/api"
vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }))
afterEach(cleanup)
it("requires a file and confirmation and uploads the entire archive", async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response("{}", { status: 200 }))
    render(<DatabaseBackupAdmin />)
    const button = screen.getByRole("button", { name: "Възстанови цялата база" }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    const archive = new File(["PGDMP complete archive"], "backup.dump")
    fireEvent.change(screen.getByLabelText("PostgreSQL архив (.dump)"), { target: { files: [archive] } })
    expect(button.disabled).toBe(true)
    fireEvent.change(screen.getByLabelText("Въведете RESTORE за потвърждение"), { target: { value: "RESTORE" } })
    expect(button.disabled).toBe(false)
    fireEvent.click(button)
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Базата е възстановена успешно"))
    const [path, options] = vi.mocked(apiFetch).mock.calls[0]
    expect(path).toBe("/admin/database-backup/restore")
    expect(options?.skipJsonContentType).toBe(true)
    expect((options?.body as FormData).get("archive")).toBe(archive)
    expect((options?.body as FormData).get("confirmation")).toBe("RESTORE")
})
it("shows a failed export without claiming success", async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response(JSON.stringify({ message: "Backup unavailable" }), { status: 500 }))
    render(<DatabaseBackupAdmin />)
    fireEvent.click(screen.getByRole("button", { name: "Изтегли архив" }))
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Backup unavailable"))
    expect(screen.queryByRole("status")).toBeNull()
})
