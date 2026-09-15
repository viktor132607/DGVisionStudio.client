export const SITE_URL = "https://dgvisionstudio.com"
export const SITE_NAME = "DG Vision Studio"
export const DEFAULT_IMAGE = "/images/og-cover.jpg"
export type Language = "bg" | "en"
type ServiceCopy = { title: string; description: string; paragraphs: string[]; preparation: string[] }
export type PhotographyService = { slug: string; category?: string; bg: ServiceCopy; en: ServiceCopy }

// Services already described in the public site and its photography categories.
// Do not add prices, ratings, opening hours or delivery promises without verified business data.
export const photographyServices: PhotographyService[] = [
  {
    slug: "svatben-fotograf-ruse", category: "wedding",
    bg: {
      title: "Сватбен фотограф в Русе",
      description: "Сватбена фотография в Русе от DG Vision Studio. Разгледайте сватбени албуми и изпратете запитване за вашата дата, церемония и празненство.",
      paragraphs: ["Сватбените снимки разказват историята на деня чрез хората, атмосферата и малките детайли. DG Vision Studio заснема сватби в Русе с внимание към емоциите, портретите на младоженците и моментите с близките.", "За да планираме заснемането, обсъждаме програмата: подготовка, граждански или църковен ритуал, фотосесия и празненство. Отделете време между локациите и уточнете кои семейни снимки са най-важни за вас. При фотосесия навън е полезно да имаме резервен вариант при дъжд."],
      preparation: ["Дата и локации на сватбата в Русе", "Часове на ритуалите и желана продължителност на заснемането", "Приблизителен брой гости и идеи за фотосесията"],
    },
    en: {
      title: "Wedding photographer in Ruse",
      description: "Wedding photography in Ruse by DG Vision Studio. Browse wedding albums and enquire about photography for your ceremony and celebration.",
      paragraphs: ["Wedding photographs tell the story through people, atmosphere and small details. DG Vision Studio photographs weddings in Ruse with attention to emotions, couple portraits and moments shared with family and friends.", "We discuss the schedule together: preparations, civil or church ceremony, portraits and reception. Allow time between locations and tell us which family photographs matter most. For outdoor portraits, consider a backup location in case of rain."],
      preparation: ["Wedding date and locations in Ruse", "Ceremony times and required coverage", "Approximate guest count and portrait ideas"],
    },
  },
  {
    slug: "portretna-fotosesiya-ruse", category: "portrait",
    bg: {
      title: "Портретна фотосесия в Русе",
      description: "Индивидуални, артистични и бизнес портрети в Русе. Разгледайте портретната фотография на DG Vision Studio и обсъдете идея за своята фотосесия.",
      paragraphs: ["Портретът може да бъде личен спомен, артистичен кадър или професионална снимка за сайт и представяне. При портретните фотосесии в Русе започваме от това как искате да изглеждате и къде ще използвате снимките.", "За бизнес портрет е полезно да уточните фона, облеклото и формата на изображението. За лична или артистична фотосесия можем да обсъдим настроение, цветове и локация. Подберете дрехи, в които се чувствате удобно, и изпратете примери за визията, която харесвате."],
      preparation: ["Лична, артистична или бизнес фотосесия", "Предпочитани дата, локация и облекло", "Къде ще използвате портретите и нужен ли е конкретен формат"],
    },
    en: {
      title: "Portrait photoshoot in Ruse",
      description: "Individual, creative and business portraits in Ruse. Explore DG Vision Studio portrait photography and discuss your photoshoot ideas.",
      paragraphs: ["A portrait can be a personal memory, a creative image or a professional photograph for your website and profile. For portrait sessions in Ruse, we begin with how you would like to present yourself and where the pictures will be used.", "For business headshots, tell us about the background, clothing and image format you need. For a personal session, we can discuss mood, colours and location. Choose comfortable outfits and share examples of the visual style you like."],
      preparation: ["Personal, creative or business portraits", "Preferred date, location and outfits", "Intended use and required image formats"],
    },
  },
  {
    slug: "fotograf-abiturientski-bal-ruse", category: "graduate",
    bg: {
      title: "Фотограф за абитуриентски бал в Русе",
      description: "Абитуриентска фотография в Русе: индивидуална фотосесия, снимки с близки и моменти от бала. Портфолио и запитвания към DG Vision Studio.",
      paragraphs: ["Абитуриентският бал събира личния стил и емоцията от завършването. Снимките могат да включват индивидуални портрети, детайли от облеклото и кадри с приятели и семейство. Разгледайте абитуриентските албуми, за да прецените какъв подход ви допада.", "При планиране на фотосесия в Русе съобразете часа с програмата на бала, придвижването и светлината. Ако искате снимки на няколко места, уточнете ги предварително. Кажете дали запитването е за един абитуриент, двойка или група."],
      preparation: ["Дата на бала и свободен часови диапазон", "Брой участници и предпочитани места", "Индивидуална фотосесия или заснемане на празненството"],
    },
    en: {
      title: "Prom and graduation photographer in Ruse",
      description: "Prom and graduation photography in Ruse: portraits, family pictures and celebration coverage. Explore albums and enquire with DG Vision Studio.",
      paragraphs: ["Graduation photographs combine personal style with the excitement of finishing school. A session may focus on individual portraits, outfit details and moments with friends and family. Browse our graduation albums to find the approach you like.", "When planning a session in Ruse, allow time for travel and consider the light and the prom schedule. Discuss multiple locations in advance and tell us whether you are enquiring for one graduate, a couple or a group."],
      preparation: ["Prom date and available time", "Number of people and preferred locations", "Portrait session or celebration coverage"],
    },
  },
  {
    slug: "fotograf-krashtene-ruse", category: "baptism",
    bg: {
      title: "Фотограф за кръщене в Русе",
      description: "Заснемане на кръщене в Русе от DG Vision Studio: ритуал, семейни портрети и важни моменти. Разгледайте албуми и изпратете запитване.",
      paragraphs: ["Кръщенето е семеен момент, в който важни са както ритуалът, така и връзката между детето, родителите и кръстниците. Фотографията запазва тези спомени чрез дискретно заснемане и общи снимки след церемонията.", "За заснемане на кръщене в Русе уточнете храма, началния час и дали искате снимки и на последващото празненство. Проверете предварително правилата за фотографиране в храма. Планирайте семейните портрети според комфорта и режима на детето."],
      preparation: ["Дата, храм и начален час на ритуала", "Възраст на детето и брой близки за общи снимки", "Нужно ли е заснемане и на празненството"],
    },
    en: {
      title: "Baptism photographer in Ruse",
      description: "Baptism photography in Ruse by DG Vision Studio. Ceremony coverage, family portraits and important moments. View albums and send an enquiry.",
      paragraphs: ["A baptism brings together the child, parents, godparents and family. Discreet coverage of the ceremony and group portraits afterwards help preserve both the ritual and the relationships around it.", "For a baptism in Ruse, tell us the church, start time and whether you also need photographs of the celebration. Check the church's photography rules beforehand and plan family portraits around the child's comfort and routine."],
      preparation: ["Date, church and ceremony time", "Child's age and family group size", "Whether celebration coverage is also needed"],
    },
  },
  {
    slug: "semeyna-detska-fotosesiya-ruse", category: "family",
    bg: {
      title: "Семейни и детски фотосесии в Русе",
      description: "Семейна и детска фотография в Русе. Естествени портрети и спомени с близките от DG Vision Studio. Обсъдете своята идея и подходяща локация.",
      paragraphs: ["Семейната фотосесия е време за снимки заедно: родители, деца и близки в естествена обстановка. За детските портрети е важно да има пространство за движение, игра и паузи, вместо всяка снимка да бъде строго позирана.", "Преди семейна фотосесия в Русе обсъждаме броя участници, възрастта на децата и подходящо място. Изберете удобни дрехи в съчетаващи се цветове и час, в който децата обичайно са отпочинали. Споделете, ако имате конкретен повод или идея за общ портрет."],
      preparation: ["Брой участници и възраст на децата", "Предпочитан ден и подходящ час за семейството", "Локация, повод и специални желания"],
    },
    en: {
      title: "Family and children's photoshoots in Ruse",
      description: "Family and children's photography in Ruse. Natural portraits and memories with loved ones by DG Vision Studio. Discuss your ideas and location.",
      paragraphs: ["A family session makes time for pictures together: parents, children and loved ones in a natural setting. Children's portraits benefit from room to play, move and take breaks, instead of posing for every photograph.", "Before a family session in Ruse, we discuss the group size, children's ages and location. Choose comfortable clothes in coordinating colours and a time when children are usually rested. Tell us about any special occasion or group portrait you have in mind."],
      preparation: ["Number of participants and children's ages", "Preferred date and a suitable time for the family", "Location, occasion and particular wishes"],
    },
  },
  {
    slug: "fotosesiya-bremenni-ruse", category: "maternity",
    bg: {
      title: "Фотосесия за бременни в Русе",
      description: "Фотосесии за бременни в Русе от DG Vision Studio. Нежни портрети, лични идеи и кадри с партньора. Изпратете запитване за дата и визия.",
      paragraphs: ["Фотосесията за бременни запазва личен и емоционален период чрез нежни портрети. Визията може да бъде изчистена или артистична, самостоятелна или с партньора и семейството. Началната точка е вашето усещане за снимките.", "За фотосесия в Русе обсъдете удобна локация, предпочитано облекло и време за почивки. Не е необходимо да имате опит пред камера. Ако има пози или условия, които не са комфортни за вас, кажете предварително, за да съобразим идеята."],
      preparation: ["Предпочитан период и удобна локация", "Самостоятелна фотосесия или участие на близки", "Идеи за облекло, настроение и личен комфорт"],
    },
    en: {
      title: "Maternity photoshoot in Ruse",
      description: "Maternity photography in Ruse by DG Vision Studio. Gentle portraits, personal ideas and pictures with your partner. Enquire about dates and style.",
      paragraphs: ["A maternity photoshoot preserves a personal and emotional period through gentle portraits. The style can be simple or creative, with solo pictures or photographs alongside your partner and family. We start with your ideas and preferences.", "For a session in Ruse, discuss a comfortable location, clothing and time for breaks. You do not need experience in front of a camera. Tell us beforehand about poses or conditions that do not feel comfortable so we can adapt the idea."],
      preparation: ["Preferred period and comfortable location", "Solo session or pictures with loved ones", "Clothing, mood and comfort preferences"],
    },
  },
  {
    slug: "fotograf-sabitia-ruse", category: "event",
    bg: {
      title: "Фотограф за събития в Русе",
      description: "Фотографско заснемане на събития в Русе: празници, концерти и фирмени събития. Портфолио и запитвания към DG Vision Studio.",
      paragraphs: ["При заснемане на събитие търсим както ключовите моменти, така и атмосферата между тях. Репортажните кадри могат да покажат участниците, сцената, детайлите и реакциите на публиката, а организираните портрети допълват историята.", "За събитие в Русе изпратете програма и посочете моментите, които задължително трябва да бъдат заснети. За фирмено събитие уточнете дали снимките са за вътрешна комуникация, публикации или реклама. Важни са също достъпът до локацията и условията за снимане."],
      preparation: ["Тип събитие, дата, място и продължителност", "Програма и важни участници или моменти", "Предназначение на снимките и правила за достъп"],
    },
    en: {
      title: "Event photographer in Ruse",
      description: "Event photography in Ruse for celebrations, concerts and corporate events. Explore the DG Vision Studio portfolio and send an enquiry.",
      paragraphs: ["Event photography captures the key moments and the atmosphere between them. Documentary images can show participants, the stage, details and audience reactions, with organised portraits adding another part of the story.", "For an event in Ruse, share the programme and the moments that must be photographed. For corporate coverage, specify whether images are for internal communication, publications or advertising. Venue access and photography restrictions are also useful to discuss."],
      preparation: ["Event type, date, venue and duration", "Programme and key participants or moments", "Intended image use and venue access rules"],
    },
  },
  {
    slug: "produktova-fotografiya-ruse",
    bg: {
      title: "Продуктова и рекламна фотография в Русе",
      description: "Продуктова фотография в Русе за брандове, сайтове и кампании. Обсъдете продуктите, визуалния стил и нужните кадри с DG Vision Studio.",
      paragraphs: ["Продуктовите снимки трябва да показват ясно формата, материалите и детайлите, които са важни за клиента. За онлайн магазин често е нужна последователна визия между артикулите, а за рекламна кампания — кадри с настроение и контекст.", "При запитване за продуктова фотография в Русе изпратете информация за броя и размерите на продуктите. Уточнете нужните гледни точки, фон и канали за използване: сайт, каталог или социални мрежи. Примерни кадри и бранд насоки помагат да определим подходящия обхват на проекта."],
      preparation: ["Вид, брой и размери на продуктите", "Фон, гледни точки и референции за визията", "Канали за публикуване и срок на проекта"],
    },
    en: {
      title: "Product and advertising photography in Ruse",
      description: "Product photography in Ruse for brands, websites and campaigns. Discuss your products, visual style and required images with DG Vision Studio.",
      paragraphs: ["Product photographs should clearly show shape, materials and details that matter to a customer. Online shops often need a consistent look across products, while advertising campaigns may call for mood and context.", "For product photography in Ruse, tell us the number and size of the items. Specify angles, backgrounds and intended channels such as a website, catalogue or social media. Reference images and brand guidelines help define the scope of the project."],
      preparation: ["Product types, quantities and dimensions", "Backgrounds, angles and visual references", "Publishing channels and project deadline"],
    },
  },
  {
    slug: "peyzazhna-fotografiya-ruse", category: "landscape",
    bg: {
      title: "Пейзажна фотография — Русе и природата",
      description: "Пейзажна фотография от DG Vision Studio в Русе. Разгледайте природни и градски кадри и обсъдете визуално съдържание за своя проект.",
      paragraphs: ["Пейзажната фотография поставя мястото в центъра на историята: светлината, сезонът, архитектурата или природните форми. В портфолиото на DG Vision Studio можете да разгледате природни и градски кадри с различна атмосфера.", "Ако търсите визуално съдържание за място или проект в Русе, посочете конкретната локация и как ще се използват изображенията. Сезонът, часът и времето влияят на крайния резултат. За използване на съществуваща снимка изпратете връзка към нея и опишете предназначението."],
      preparation: ["Локация или връзка към избрана снимка", "Желан сезон, настроение и формат", "Предназначение на изображенията"],
    },
    en: {
      title: "Landscape photography — Ruse and nature",
      description: "Landscape photography by DG Vision Studio in Ruse. Explore natural and urban scenes and discuss visual content for your project.",
      paragraphs: ["Landscape photography makes the location the subject: its light, season, architecture and natural shapes. The DG Vision Studio portfolio includes natural and urban scenes with different moods.", "If you need visual content for a place or project in Ruse, specify the location and intended use. Season, time of day and weather shape the result. To enquire about using an existing photograph, send its link and explain the proposed use."],
      preparation: ["Location or link to a selected photograph", "Preferred season, mood and format", "Intended use of the images"],
    },
  },
]

export const hubPath = "/fotograf-ruse"
export const servicePath = (service: PhotographyService) => `/fotograf-ruse/${service.slug}`
export const homeMetadata = {
  bg: { title: "Фотограф в Русе — фотосесии и събития", description: "DG Vision Studio — фотограф в Русе за сватби, балове, кръщенета, портретни, семейни и продуктови фотосесии. Портфолио, цени и запитвания." },
  en: { title: "Photographer in Ruse — photoshoots and events", description: "DG Vision Studio — photographer in Ruse for weddings, proms, baptisms, portraits, family and product photoshoots. View our portfolio, pricing and contact details." },
}

export function businessSchema(language: Language) {
  return {
    "@type": "LocalBusiness", "@id": `${SITE_URL}/#business`, name: SITE_NAME,
    url: `${SITE_URL}/`, image: `${SITE_URL}${DEFAULT_IMAGE}`, logo: `${SITE_URL}/images/mainlogo.png`,
    description: homeMetadata[language].description,
    telephone: "+359988758434", email: "dgvisionstudio@gmail.com",
    address: { "@type": "PostalAddress", streetAddress: language === "bg" ? "Търговски комплекс Ялта" : "Yalta Shopping Complex", addressLocality: language === "bg" ? "Русе" : "Ruse", addressCountry: "BG" },
    areaServed: { "@type": "City", name: "Русе", alternateName: "Ruse" },
    hasMap: "https://www.google.com/maps/search/?api=1&query=Yalta%20Shopping%20Complex%2C%20Ruse",
    sameAs: ["https://www.facebook.com/profile.php?id=61588317548349", "https://www.tiktok.com/@dgvisionstudio1"],
  }
}

export function photographySchema(language: Language, service?: PhotographyService) {
  const path = service ? servicePath(service) : hubPath
  const name = service ? service[language].title : homeMetadata[language].title
  return {
    "@context": "https://schema.org",
    "@graph": [
      businessSchema(language),
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: ["bg", "en"], publisher: { "@id": `${SITE_URL}/#business` } },
      { "@type": service ? "WebPage" : "CollectionPage", "@id": `${SITE_URL}${path}#page`, url: `${SITE_URL}${path}`, name, inLanguage: language, isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#business` } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: language === "bg" ? "Начало" : "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: language === "bg" ? "Фотограф в Русе" : "Photographer in Ruse", item: `${SITE_URL}${hubPath}` },
        ...(service ? [{ "@type": "ListItem", position: 3, name, item: `${SITE_URL}${path}` }] : []),
      ] },
      ...(service ? [{ "@type": "Service", "@id": `${SITE_URL}${path}#service`, name, serviceType: name, description: service[language].description, url: `${SITE_URL}${path}`, areaServed: { "@type": "City", name: "Ruse" }, provider: { "@id": `${SITE_URL}/#business` } }] : []),
    ],
  }
}
