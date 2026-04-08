import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Seo from "../components/Seo"

type PriceItem = {
    title: string
    description: string
    price: string
}

export default function PriceList() {
    const { i18n } = useTranslation()
    const isBg = i18n.language?.toLowerCase().startsWith("bg")

    const t = isBg
        ? {
              seoTitle: "Ценоразпис | DG Vision Studio",
              seoDescription: "Цени за фотографски услуги от DG Vision Studio.",
              eyebrow: "УСЛУГИ И ЦЕНИ",
              title: "Ценоразпис",
              description:
                  "Ясен и изчистен преглед на основните фотографски услуги и началните им цени.",
              includedTitle: "Важно",
              includedText:
                  "При услуги с цена „По запитване“ офертата се определя според обем, локация, продължителност и конкретни изисквания.",
              ctaTitle: "Имаш конкретно запитване?",
              ctaText:
                  "Свържи се с нас за персонална оферта според твоя проект, събитие или фотосесия.",
              contact: "Изпрати запитване",
              priceLabel: "Цена",
              items: [
                  {
                      title: "Портретна фотография",
                      description: "Индивидуални, артистични и професионални портретни фотосесии.",
                      price: "От 60 € / фотосесия",
                  },
                  {
                      title: "Абитуриентска фотография",
                      description: "Сесии за абитуриенти с акцент върху стил, присъствие и детайл.",
                      price: "От 60 € / час",
                  },
                  {
                      title: "Заснемане на кръщене",
                      description: "Дискретно и емоционално заснемане на важни семейни моменти.",
                      price: "От 60 € / час",
                  },
                  {
                      title: "Сватбена фотография",
                      description: "Заснемане на сватбен ден, ключови моменти и атмосфера.",
                      price: "120 € / час + 30 € дрон",
                  },
                  {
                      title: "Продуктова фотография",
                      description: "Кадри за продукти, брандове и онлайн магазини.",
                      price: "По запитване",
                  },
                  {
                      title: "Рекламна фотография",
                      description: "Съдържание за кампании, социални мрежи и бранд присъствие.",
                      price: "По запитване",
                  },
                  {
                      title: "Корпоративна фотография",
                      description: "Професионални кадри за екипи, бизнес среда и услуги.",
                      price: "По запитване",
                  },
                  {
                      title: "Семейна фотография",
                      description: "Естествени и емоционални кадри за семейства и деца.",
                      price: "По запитване",
                  },
                  {
                      title: "Заснемане на събития",
                      description: "Заснемане на частни, фирмени и сценични събития.",
                      price: "От 60 € / час",
                  },
              ] as PriceItem[],
          }
        : {
              seoTitle: "Price List | DG Vision Studio",
              seoDescription: "Photography service prices by DG Vision Studio.",
              eyebrow: "SERVICES & PRICING",
              title: "Price List",
              description:
                  "A clean overview of the main photography services and their starting prices.",
              includedTitle: "Important",
              includedText:
                  "For services marked as “On request”, the final offer depends on scope, location, duration, and specific requirements.",
              ctaTitle: "Have a specific request?",
              ctaText:
                  "Get in touch for a custom quote based on your project, event, or photo session.",
              contact: "Send inquiry",
              priceLabel: "Price",
              items: [
                  {
                      title: "Portrait Photography",
                      description: "Individual, artistic, and professional portrait sessions.",
                      price: "From €60 / session",
                  },
                  {
                      title: "Graduation Photography",
                      description: "Graduation sessions focused on style, presence, and detail.",
                      price: "From €60 / hour",
                  },
                  {
                      title: "Baptism Photography",
                      description: "Discreet and emotional coverage of important family moments.",
                      price: "From €60 / hour",
                  },
                  {
                      title: "Wedding Photography",
                      description: "Wedding day coverage with focus on key moments and atmosphere.",
                      price: "€120 / hour + €30 drone",
                  },
                  {
                      title: "Product Photography",
                      description: "Visual content for products, brands, and online stores.",
                      price: "On request",
                  },
                  {
                      title: "Commercial Photography",
                      description: "Photography for campaigns, social media, and brand presence.",
                      price: "On request",
                  },
                  {
                      title: "Corporate Photography",
                      description: "Professional imagery for teams, business spaces, and services.",
                      price: "On request",
                  },
                  {
                      title: "Family Photography",
                      description: "Natural and emotional sessions for families and children.",
                      price: "On request",
                  },
                  {
                      title: "Event Photography",
                      description: "Coverage for private, corporate, and stage events.",
                      price: "From €60 / hour",
                  },
              ] as PriceItem[],
          }

    return (
        <>
            <Seo title={t.seoTitle} description={t.seoDescription} canonical="/pricing" />

            <section className="bg-neutral-100 py-10 dark:bg-zinc-900 sm:py-12 lg:py-16 xl:py-20">
                <div className="mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8 xl:px-10">
                    <div className="overflow-hidden rounded-[28px] border border-neutral-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="border-b border-neutral-300 bg-neutral-50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-neutral-500 dark:text-zinc-400 sm:text-[11px] sm:tracking-[0.3em]">
                                {t.eyebrow}
                            </p>

                            <h1 className="mt-4 text-[32px] font-extrabold tracking-tight text-neutral-950 dark:text-white sm:text-[40px] lg:text-[52px]">
                                {t.title}
                            </h1>

                            <p className="mx-auto mt-5 max-w-3xl text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px] sm:leading-8 md:text-[16px]">
                                {t.description}
                            </p>
                        </div>

                        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {t.items.map((item) => (
                                    <article
                                        key={item.title}
                                        className="rounded-[26px] border border-neutral-300 bg-neutral-50 p-5 dark:border-zinc-700 dark:bg-zinc-800 sm:p-6"
                                    >
                                        <div className="flex h-full flex-col">
                                            <h2 className="text-[20px] font-bold text-neutral-950 dark:text-white">
                                                {item.title}
                                            </h2>

                                            <p className="mt-4 flex-1 text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px]">
                                                {item.description}
                                            </p>

                                            <div className="mt-6 border-t border-neutral-300 pt-4 dark:border-zinc-700">
                                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-500 dark:text-zinc-400">
                                                    {t.priceLabel}
                                                </p>
                                                <p className="mt-3 text-[18px] font-extrabold text-neutral-950 dark:text-white">
                                                    {item.price}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                                <div className="rounded-[26px] border border-neutral-300 bg-neutral-50 p-6 dark:border-zinc-700 dark:bg-zinc-800">
                                    <h3 className="text-[24px] font-bold text-neutral-950 dark:text-white">
                                        {t.includedTitle}
                                    </h3>
                                    <p className="mt-4 text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px] sm:leading-8">
                                        {t.includedText}
                                    </p>
                                </div>

                                <div className="rounded-[26px] border border-neutral-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
                                    <h3 className="text-[24px] font-bold text-neutral-950 dark:text-white">
                                        {t.ctaTitle}
                                    </h3>
                                    <p className="mt-4 text-[14px] leading-7 text-neutral-600 dark:text-zinc-300 sm:text-[15px] sm:leading-8">
                                        {t.ctaText}
                                    </p>

                                    <Link
                                        to="/contact"
                                        className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-6 py-3 text-[13px] font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                    >
                                        {t.contact}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}