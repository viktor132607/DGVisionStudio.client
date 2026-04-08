import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { getPasswordRuleChecks } from "../utils/identity"

type PasswordRequirementsProps = {
    password: string
}

export default function PasswordRequirements({
    password,
}: PasswordRequirementsProps) {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const rules = useMemo(() => getPasswordRuleChecks(password), [password])
    const hasStartedTyping = password.trim().length > 0
    const allValid = rules.every((rule) => rule.valid)

    const labels = isBg
        ? {
              title: "Изисквания за парола",
              length: "Поне 8 символа",
              lowercase: "Поне една малка буква",
              uppercase: "Поне една главна буква",
              digit: "Поне една цифра",
              special: "Поне един специален символ",
          }
        : {
              title: "Password requirements",
              length: "At least 8 characters",
              lowercase: "At least one lowercase letter",
              uppercase: "At least one uppercase letter",
              digit: "At least one number",
              special: "At least one special character",
          }

    const localizedRules = rules.map((rule) => ({
        ...rule,
        label:
            rule.key === "length"
                ? labels.length
                : rule.key === "lowercase"
                  ? labels.lowercase
                  : rule.key === "uppercase"
                    ? labels.uppercase
                    : rule.key === "digit"
                      ? labels.digit
                      : labels.special,
    }))

    if (!hasStartedTyping || allValid) return null

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-zinc-400">
                {labels.title}
            </p>

            <ul className="mt-3 space-y-2">
                {localizedRules.map((rule) => (
                    <li
                        key={rule.key}
                        className={`text-[14px] leading-6 ${
                            rule.valid
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-neutral-600 dark:text-zinc-300"
                        }`}
                    >
                        {rule.valid ? "✓" : "•"} {rule.label}
                    </li>
                ))}
            </ul>
        </div>
    )
}