import { useThemeLogo } from "../hooks/useThemeLogo"

export default function GlobalPageLoader() {
    const logoSrc = useThemeLogo()

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-zinc-950">
            <div className="flex flex-col items-center gap-6">
                <img
                    src={logoSrc}
                    alt="DG Vision Studio"
                    className="w-[180px] animate-[loaderLogo_1.6s_ease-in-out_infinite] sm:w-[220px]"
                />

                <div className="h-[2px] w-[180px] overflow-hidden bg-neutral-200 dark:bg-zinc-800 sm:w-[220px]">
                    <div className="h-full w-1/2 animate-[loaderBar_1.2s_ease-in-out_infinite] bg-neutral-950 dark:bg-white" />
                </div>
            </div>

            <style>
                {`
                    @keyframes loaderLogo {
                        0%, 100% {
                            opacity: 0.45;
                            transform: scale(0.96);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    @keyframes loaderBar {
                        0% {
                            transform: translateX(-100%);
                        }
                        100% {
                            transform: translateX(220%);
                        }
                    }
                `}
            </style>
        </div>
    )
}