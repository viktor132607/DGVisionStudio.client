import { hubPath, photographyServices, servicePath, type Language, type PhotographyService } from "../seo/photography"

export function PhotographyLinks({ language }: { language: Language }) {
  return <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {photographyServices.map((service) => <li key={service.slug} className="min-w-0">
      <a href={servicePath(service)} className="block h-full rounded-2xl border border-slate-200 p-5 transition hover:border-slate-600 dark:border-zinc-700 dark:hover:border-white">
        <h3 className="text-lg font-semibold">{service[language].title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-zinc-300">{service[language].description}</p>
      </a>
    </li>)}
  </ul>
}

export function PhotographyIntro({ language, standalone = false }: { language: Language; standalone?: boolean }) {
  const bg = language === "bg"
  const Heading = standalone ? "h1" : "h2"
  return <section className="mx-auto max-w-6xl px-4 py-12 text-slate-900 dark:text-white sm:px-6 sm:py-16" aria-label={bg ? "Фотография в Русе" : "Photography in Ruse"}>
    <Heading className="text-3xl font-bold sm:text-4xl">{bg ? "Фотограф в Русе — DG Vision Studio" : "Photographer in Ruse — DG Vision Studio"}</Heading>
    <p className="my-6 max-w-3xl text-base leading-8 text-slate-600 dark:text-zinc-300">{bg
      ? "Сватба, абитуриентски бал, кръщене или лична фотосесия — изберете фотографска услуга и разгледайте нашия подход. DG Vision Studio създава портрети, семейни снимки, репортажи от събития и визуално съдържание за брандове в Русе."
      : "A wedding, prom, baptism or personal photoshoot — choose a photography service and explore our approach. DG Vision Studio creates portraits, family pictures, event coverage and visual content for brands in Ruse."}</p>
    <PhotographyLinks language={language} />
    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-semibold underline underline-offset-4">
      <a href="/portfolio">{bg ? "Разгледайте портфолиото" : "Explore our portfolio"}</a>
      <a href="/pricing">{bg ? "Цени за фотография" : "Photography pricing"}</a>
      <a href="/contact">{bg ? "Запитване за фотосесия" : "Photoshoot enquiry"}</a>
      {!standalone && <a href={hubPath}>{bg ? "Всички фотографски услуги в Русе" : "All photography services in Ruse"}</a>}
    </div>
    <address className="mt-8 text-sm not-italic leading-7 text-slate-600 dark:text-zinc-300">
      DG Vision Studio · {bg ? "Търговски комплекс Ялта, Русе" : "Yalta Shopping Complex, Ruse"}<br />
      <a href="tel:+359988758434">+359 988 758 434</a> · <a href="mailto:dgvisionstudio@gmail.com" className="break-all">dgvisionstudio@gmail.com</a>
    </address>
  </section>
}

export default function PhotographyContent({ language, service }: { language: Language; service?: PhotographyService }) {
  const bg = language === "bg"
  if (!service) return <PhotographyIntro language={language} standalone />
  const copy = service[language]
  return <article className="mx-auto max-w-6xl px-4 py-8 text-slate-900 dark:text-white sm:px-6 sm:py-14">
    <nav aria-label={bg ? "Път до страницата" : "Breadcrumb"} className="mb-8 flex flex-wrap gap-x-3 gap-y-2 text-sm text-slate-600 dark:text-zinc-300">
      <a className="underline underline-offset-4" href="/">{bg ? "Начало" : "Home"}</a><span aria-hidden="true">/</span>
      <a className="underline underline-offset-4" href={hubPath}>{bg ? "Фотограф в Русе" : "Photographer in Ruse"}</a><span aria-hidden="true">/</span>
      <span aria-current="page">{copy.title}</span>
    </nav>
    <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-5xl">{copy.title}</h1>
    <div className="my-8 max-w-3xl space-y-5 text-base leading-8 text-slate-600 dark:text-zinc-300">
      {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </div>
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-zinc-700 dark:bg-zinc-800 sm:p-8">
      <h2 className="text-2xl font-semibold">{bg ? "Какво да включите в запитването" : "What to include in your enquiry"}</h2>
      <ul className="my-5 list-disc space-y-3 pl-5 leading-7">{copy.preparation.map((item) => <li key={item}>{item}</li>)}</ul>
      <p className="max-w-3xl leading-7 text-slate-600 dark:text-zinc-300">{bg
        ? "Цената и обхватът зависят от конкретната фотосесия, локацията, продължителността и изискванията. Разгледайте ценоразписа и се свържете с нас, за да уточним свободна дата, включени кадри и срок за предаване."
        : "Pricing and scope depend on the session, location, duration and requirements. View the price list and contact us to discuss availability, included images and delivery timing."}</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <a href="/contact" className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white dark:bg-white dark:text-black">{bg ? "Изпратете запитване" : "Send an enquiry"}</a>
        <a href={service.category ? `/portfolio#${service.category}` : "/portfolio"} className="rounded-full border border-slate-400 px-6 py-3 font-semibold">{bg ? "Вижте снимки" : "View photographs"}</a>
        <a href="/pricing" className="px-4 py-3 font-semibold underline underline-offset-4">{bg ? "Услуги и цени" : "Services and pricing"}</a>
      </div>
    </section>
    <section className="my-10 max-w-3xl">
      <h2 className="text-2xl font-semibold">{bg ? "Свържете се с DG Vision Studio в Русе" : "Contact DG Vision Studio in Ruse"}</h2>
      <address className="mt-4 not-italic leading-8">
        {bg ? "Търговски комплекс Ялта, Русе" : "Yalta Shopping Complex, Ruse"}<br />
        <a href="tel:+359988758434">+359 988 758 434</a><br />
        <a href="mailto:dgvisionstudio@gmail.com" className="break-all">dgvisionstudio@gmail.com</a>
      </address>
    </section>
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-semibold">{bg ? "Разгледайте и другите фотографски услуги" : "Explore our other photography services"}</h2>
      <PhotographyLinks language={language} />
    </section>
  </article>
}
