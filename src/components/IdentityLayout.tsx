import type { ReactNode } from "react"

type IdentityLayoutProps = {
    title: string
    description?: string
    children: ReactNode
}

export default function IdentityLayout({
    title,
    description,
    children,
}: IdentityLayoutProps) {
    return (
        <div className="min-h-[calc(100vh-84px)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="mx-auto w-full max-w-[1920px]">
                <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)] dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="border-b border-neutral-200 px-6 py-6 dark:border-zinc-800 sm:px-8 sm:py-8">
                        <h1 className="text-[28px] font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-[34px]">
                            {title}
                        </h1>

                        {description ? (
                            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[16px]">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    <div className="px-6 py-6 sm:px-8 sm:py-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}