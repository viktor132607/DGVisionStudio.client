import { homeMetadata, hubPath, photographyServices, servicePath } from "./photography"

export const staticPages = [
  { path: "/", ...homeMetadata.bg },
  { path: hubPath, title: "Фотографски услуги в Русе", description: "Фотографски услуги от DG Vision Studio в Русе. Изберете сватбена, портретна, семейна, продуктова или събитийна фотография и разгледайте нашия подход." },
  ...photographyServices.map((service) => ({ path: servicePath(service), title: service.bg.title, description: service.bg.description })),
  { path: "/portfolio", title: "Фотографско портфолио — Русе", description: "Фотографско портфолио на DG Vision Studio в Русе — сватби, портрети, абитуриентски балове, кръщенета и събития. Разгледайте публикуваните албуми." },
  { path: "/pricing", title: "Цени за фотографски услуги в Русе", description: "Цени за фотосесии и фотографски услуги в Русе от DG Vision Studio. Разгледайте ценоразписа и изпратете запитване за своята дата и проект." },
  { path: "/about", title: "За нас — фотографско студио в Русе", description: "DG Vision Studio в Русе — запознайте се с екипа и нашия подход към портретната фотография, събитията и визуалното съдържание за брандове." },
  { path: "/contact", title: "Контакти — фотограф в Русе", description: "Свържете се с DG Vision Studio за фотосесия или заснемане на събитие в Русе. Търговски комплекс Ялта. Телефон: +359 988 758 434." },
  { path: "/blog", title: "Блог за фотография — Русе", description: "Публикации за фотография, фотосесии и визуално съдържание от DG Vision Studio в Русе." },
  { path: "/privacy", title: "Политика за поверителност", description: "Политика за поверителност на DG Vision Studio и информация за обработването на лични данни." },
  { path: "/cookies", title: "Политика за бисквитки", description: "Информация за използването на бисквитки в сайта на DG Vision Studio." },
  { path: "/terms", title: "Общи условия", description: "Общи условия за използване на сайта на DG Vision Studio." },
]
