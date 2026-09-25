import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("API client facade", () => {
    it("preserves API URL composition", async () => {
        const { apiUrl } = await import("../src/services/api")

        expect(apiUrl("/health")).toBe(
            "https://api.dgvisionstudio.com/api/health"
        )
        expect(apiUrl("health")).toBe(
            "https://api.dgvisionstudio.com/api/health"
        )
    })

    it("keeps GET request headers and credentials behaviour", async () => {
        const fetchMock = vi.mocked(fetch)
        fetchMock.mockResolvedValueOnce(
            new Response(null, { status: 200 })
        )
        const { apiFetch } = await import("../src/services/api")

        await apiFetch("/health")

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [, init] = fetchMock.mock.calls[0]
        expect(init?.credentials).toBe("include")
        expect(new Headers(init?.headers).get("Content-Type"))
            .toBe("application/json")
    })

    it("fetches and applies one CSRF token for unsafe requests", async () => {
        const fetchMock = vi.mocked(fetch)
        fetchMock
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ csrfToken: "csrf-123" }),
                    {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
            )
            .mockResolvedValueOnce(
                new Response(null, { status: 204 })
            )

        const { apiFetch } = await import("../src/services/api")
        await apiFetch("/account/delete", {
            method: "DELETE",
            body: JSON.stringify({ password: "secret" }),
        })

        expect(fetchMock).toHaveBeenCalledTimes(2)
        const [, requestInit] = fetchMock.mock.calls[1]
        expect(
            new Headers(requestInit?.headers).get("X-CSRF-TOKEN")
        ).toBe("csrf-123")
    })

    it("preserves JSON, text and 204 response handling", async () => {
        const fetchMock = vi.mocked(fetch)
        fetchMock
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ message: "Bad request" }),
                    {
                        status: 400,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
            )
            .mockResolvedValueOnce(
                new Response("Plain failure", {
                    status: 500,
                    headers: {
                        "Content-Type": "text/plain",
                    },
                })
            )
            .mockResolvedValueOnce(
                new Response(null, { status: 204 })
            )

        const { apiFetchJson } = await import("../src/services/api")

        await expect(
            apiFetchJson("/first", {
                skipCsrfToken: true,
            })
        ).rejects.toThrow("Bad request")

        await expect(
            apiFetchJson("/second", {
                skipCsrfToken: true,
            })
        ).rejects.toThrow("Plain failure")

        await expect(
            apiFetchJson<void>("/third", {
                skipCsrfToken: true,
            })
        ).resolves.toBeUndefined()
    })

    it("preserves admin upload metadata synchronization side effect", async () => {
        const fetchMock = vi.mocked(fetch)
        fetchMock
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ csrfToken: "csrf-upload" }),
                    {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ id: 17 }),
                    {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
            )
            .mockResolvedValueOnce(
                new Response(null, { status: 204 })
            )

        const formData = new FormData()
        formData.append(
            "file",
            new File(["image"], "  portrait.final.jpg", {
                type: "image/jpeg",
            })
        )

        const { apiFetch } = await import("../src/services/api")
        await apiFetch(
            "/admin/client-galleries/5/photos/upload",
            {
                method: "POST",
                body: formData,
                skipJsonContentType: true,
            }
        )

        await vi.waitFor(() =>
            expect(fetchMock).toHaveBeenCalledTimes(3)
        )

        const [metadataUrl, metadataInit] =
            fetchMock.mock.calls[2]

        expect(metadataUrl).toBe(
            "https://api.dgvisionstudio.com/api/admin/client-galleries/5/media/17/metadata"
        )
        expect(metadataInit?.method).toBe("PUT")
        expect(
            new Headers(metadataInit?.headers).get("X-CSRF-TOKEN")
        ).toBe("csrf-upload")
        expect(JSON.parse(metadataInit?.body as string)).toEqual({
            name: "portrait.final",
            clearAltAndCaption: true,
        })
    })
})
