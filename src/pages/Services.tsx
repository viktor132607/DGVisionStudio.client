import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Seo from "../components/Seo"

type CategoryKey =
    | "all"
    | "portrait"
    | "product"
    | "commercial"
    | "corporate"
    | "event"
    | "graduate"
    | "birthday"
    | "christmas"
    | "baptism"
    | "wedding"
    | "family"
    | "maternity"
    | "landscape"

type PortfolioItem = {
    src: string
    category: Exclude<CategoryKey, "all">
    categoryBg: string
    categoryEn: string
    albumKey: string
    albumBg: string
    albumEn: string
    titleBg: string
    titleEn: string
}

function normalizeHashToCategory(hash: string): CategoryKey {
    const value = hash.replace("#", "").trim().toLowerCase()

    switch (value) {
        case "":
        case "all":
            return "all"

        case "portrait":
        case "portraits":
        case "snow":
            return "portrait"

        case "product":
        case "products":
            return "product"

        case "commercial":
        case "campaign":
        case "campaigns":
            return "commercial"

        case "corporate":
            return "corporate"

        case "event":
        case "events":
        case "event-photography":
        case "bulgare":
            return "event"

        case "graduate":
        case "graduation":
        case "prom":
        case "proms":
        case "turquoise":
            return "graduate"

        case "birthday":
        case "birthdays":
            return "birthday"

        case "christmas":
            return "christmas"

        case "baptism":
            return "baptism"

        case "wedding":
        case "weddings":
            return "wedding"

        case "family":
            return "family"

        case "maternity":
            return "maternity"

        case "landscape":
        case "landscapes":
            return "landscape"

        default:
            return "all"
    }
}

const commercialPaths = [] as const

const eventBulgarePaths = [
    "/images/porfolio/events/bulgare/1.jpg",
    "/images/porfolio/events/bulgare/2.jpg",
    "/images/porfolio/events/bulgare/3.jpg",
    "/images/porfolio/events/bulgare/13.jpg",
] as const

const graduateAzraPaths = [
    "/images/porfolio/балове/Бал Азра/639766578_122099975367277251_3978753087381724830_n.jpg",
    "/images/porfolio/балове/Бал Азра/640072369_122099975331277251_8854217072496019133_n.jpg",
    "/images/porfolio/балове/Бал Азра/640365873_122099976543277251_3510489861658993091_n.jpg",
    "/images/porfolio/балове/Бал Азра/640973347_122099975325277251_9203183424506999673_n.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _4.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _5.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _8.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _17.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _18.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _22.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _26.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _32.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _39.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _42.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _43.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _54.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _60.jpg",
    "/images/porfolio/балове/Бал Азра/ГОТОВИ втори вариант _64.jpg",
] as const

const graduateVeronicaPaths = [
    "/images/porfolio/балове/Бал Вероника/DSC_1006.jpg",
    "/images/porfolio/балове/Бал Вероника/DSC_1015.jpg",
    "/images/porfolio/балове/Бал Вероника/DSC_1036.jpg",
    "/images/porfolio/балове/Бал Вероника/DSC_1041.jpg",
    "/images/porfolio/балове/Бал Вероника/DSC_1050.jpg",
    "/images/porfolio/балове/Бал Вероника/DSC_1060.jpg",
    "/images/porfolio/балове/Бал Вероника/DSC_1236.jpg",
    "/images/porfolio/балове/Бал Вероника/DSC_1283.jpg",
    "/images/porfolio/балове/Бал Вероника/DSC_1335.jpg",
    "/images/porfolio/балове/Бал Вероника/DSC_1374.jpg",
] as const

const graduateZaraPaths = [
    "/images/porfolio/балове/Бал Зара/DSC_0010.jpg",
    "/images/porfolio/балове/Бал Зара/DSC_0023.jpg",
    "/images/porfolio/балове/Бал Зара/DSC_0024.jpg",
    "/images/porfolio/балове/Бал Зара/DSC_0238.jpg",
    "/images/porfolio/балове/Бал Зара/DSC_0307.jpg",
    "/images/porfolio/балове/Бал Зара/DSC_0468.jpg",
    "/images/porfolio/балове/Бал Зара/DSC_9778.jpg",
    "/images/porfolio/балове/Бал Зара/DSC_9783.jpg",
    "/images/porfolio/балове/Бал Зара/DSC_9842.jpg",
    "/images/porfolio/балове/Бал Зара/DSC_9893.jpg",
] as const

const graduateYanaPaths = [
    "/images/porfolio/балове/Бал Яна/DSC_0606-3.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0607-4.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0632-9.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0676-17.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0696-21.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0700-23.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0725-26.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0777-38.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0837-48.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0860-52.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0910-64.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0916-67.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0964-77.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0971-79.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0981-80.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0987-81.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0993-82.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_0997-83.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_1000-84.jpg",
    "/images/porfolio/балове/Бал Яна/DSC_1003-85.jpg",
] as const

const winterPortraitPaths = [
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2362.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2395.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2399.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2406.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2429.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2476.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2534.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2573.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A2594.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4022.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4028.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4139.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4164.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4174.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4214.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4243.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4253.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4301.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4356.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4359.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4440.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4446.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4463.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4567.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4571.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4609.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4618.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4644.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/2U2A4663.jpg",
    "/images/porfolio/ПОРТРЕТ/зимна фотосесия ПОРТРЕТ/641416539_122101709805277251_8677250284073032946_n.jpg",
] as const

const springPortraitPaths = [
    "/images/porfolio/ПОРТРЕТ/ПРОЛЕТ ПОРТРЕТ/2U2A6320.jpg",
    "/images/porfolio/ПОРТРЕТ/ПРОЛЕТ ПОРТРЕТ/2U2A6355.jpg",
    "/images/porfolio/ПОРТРЕТ/ПРОЛЕТ ПОРТРЕТ/2U2A6399.jpg",
    "/images/porfolio/ПОРТРЕТ/ПРОЛЕТ ПОРТРЕТ/2U2A6404.jpg",
    "/images/porfolio/ПОРТРЕТ/ПРОЛЕТ ПОРТРЕТ/2U2A6442.jpg",
] as const

const theodoraPortraitPaths = [
    "/images/porfolio/ПОРТРЕТ/ТЕОДОРА портрет/2U2A9140.jpg",
    "/images/porfolio/ПОРТРЕТ/ТЕОДОРА портрет/2U2A9146.jpg",
    "/images/porfolio/ПОРТРЕТ/ТЕОДОРА портрет/2U2A9150.jpg",
    "/images/porfolio/ПОРТРЕТ/ТЕОДОРА портрет/2U2A9183.jpg",
    "/images/porfolio/ПОРТРЕТ/ТЕОДОРА портрет/2U2A9187.jpg",
    "/images/porfolio/ПОРТРЕТ/ТЕОДОРА портрет/2U2A9206.jpg",
] as const

const baptismPaths = [
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A8969.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A8978.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A8999.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9018.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9040.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9089.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9102.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9202.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9210.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9220.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9253.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9256.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9287.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9344.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9495.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9506.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9507.jpg",
    "/images/porfolio/кръщенета/КРЪЩЕНЕ 2/2U2A9551.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1842.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1866.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1882.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1897.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1917.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1924.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1928.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1940.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1958.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1980.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1984.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A1999.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2106.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2111.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2116.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2128.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2134.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2141.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2152.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2186.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2198.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2410.jpg",
    "/images/porfolio/кръщенета/Кръщене 1/2U2A2419.jpg",
] as const

const weddingPaths = [
    "/images/porfolio/СВАТБИ/СВАТБА 1/652218256_122105935065277251_6910562629463362805_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 1/652324174_122105935173277251_928166735313199811_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 1/652662412_122105935227277251_5451408023515913260_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 1/652929756_122105935101277251_5371404381692777414_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 1/653345408_122105935437277251_4254495819981584913_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 1/653759335_122105935497277251_2075686935719957022_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 1/654688641_122105935335277251_7457760121515071198_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 1/654796604_122105935269277251_6083788571253739878_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 1/654846086_122105935389277251_2252568087198579211_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 1/654965058_122105935551277251_1647099086538045574_n.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8184-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8185-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8186-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8187-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8190-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8192-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8197.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8200-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8203-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8210-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8214-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8217-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8221-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8231-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8233-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8239-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8243-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8249-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8254-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8269-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8274-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8285-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8328-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8335-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8351-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8352-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8353-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8412-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8419-Enhanced-NR.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 2/2U2A8424-Enhanced-NR.jpg",
] as const

const wedding3Paths = [
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1549.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1570.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1646.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1648.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1654.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1656.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1658.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1661.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1677.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1688.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1693.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1707.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1723.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1779.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1788.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1895.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1954.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1958.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1968.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1975.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A1976.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A2042.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A2047.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A2049.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A2060.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A2077.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A2095.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A2096.jpg",
    "/images/porfolio/СВАТБИ/СВАТБА 3/2U2A2104.jpg",
] as const

const landscapePaths = ["/images/porfolio/ПЕЙЗАЖИ/650235666_122104710225277251_7176854112806431771_n.jpg"] as const

const productPaths: readonly string[] = []
const corporatePaths: readonly string[] = []
const birthdayPaths: readonly string[] = []
const christmasPaths: readonly string[] = []
const familyPaths: readonly string[] = []
const maternityPaths: readonly string[] = []

const baptism2Paths = baptismPaths.filter((src) => src.includes("/КРЪЩЕНЕ 2/"))
const baptism1Paths = baptismPaths.filter((src) => src.includes("/Кръщене 1/"))

const wedding1Paths = weddingPaths.filter((src) => src.includes("/СВАТБА 1/"))
const wedding2Paths = weddingPaths.filter((src) => src.includes("/СВАТБА 2/"))

function buildAlbumItems(
    paths: readonly string[],
    category: Exclude<CategoryKey, "all">,
    categoryBg: string,
    categoryEn: string,
    albumKey: string,
    albumBg: string,
    albumEn: string,
    titleBgPrefix: string,
    titleEnPrefix: string
): PortfolioItem[] {
    return paths.map((src, index) => ({
        src,
        category,
        categoryBg,
        categoryEn,
        albumKey,
        albumBg,
        albumEn,
        titleBg: `${titleBgPrefix} ${index + 1}`,
        titleEn: `${titleEnPrefix} ${index + 1}`,
    }))
}

export default function Services() {
    const { i18n } = useTranslation()
    const location = useLocation()
    const lang = i18n.language
    const isBg = lang?.toLowerCase().startsWith("bg")

    const [activeCategory, setActiveCategory] = useState<CategoryKey>("all")
    const [activeAlbum, setActiveAlbum] = useState("all")
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const portfolioJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: isBg ? "Портфолио" : "Portfolio",
        url: "https://dgvisionstudio.com/portfolio",
        description: isBg
            ? "Разгледайте портфолиото на DG Vision Studio – портрети, събития, абитуриентски балове, кръщенета, сватби, пейзажи и още категории."
            : "Explore the DG Vision Studio portfolio – portraits, events, proms, baptisms, weddings, landscapes, and more categories.",
        isPartOf: {
            "@type": "WebSite",
            name: "DG Vision Studio",
            url: "https://dgvisionstudio.com",
        },
    }

    const categories: {
        key: CategoryKey
        labelBg: string
        labelEn: string
    }[] = [
        { key: "all", labelBg: "Всички", labelEn: "All" },
        { key: "portrait", labelBg: "Портретна фотография", labelEn: "Portrait Photography" },
        { key: "product", labelBg: "Продуктова фотография", labelEn: "Product Photography" },
        { key: "commercial", labelBg: "Рекламна фотография", labelEn: "Commercial Photography" },
        { key: "corporate", labelBg: "Корпоративна фотография", labelEn: "Corporate Photography" },
        { key: "event", labelBg: "Събития", labelEn: "Events" },
        { key: "graduate", labelBg: "Абитуриентски балове", labelEn: "Proms" },
        { key: "birthday", labelBg: "Детски рожден ден", labelEn: "Kids Birthday" },
        { key: "christmas", labelBg: "Коледни", labelEn: "Christmas" },
        { key: "baptism", labelBg: "Кръщене", labelEn: "Baptism" },
        { key: "wedding", labelBg: "Сватбена фотография", labelEn: "Wedding Photography" },
        { key: "family", labelBg: "Семейна фотография", labelEn: "Family Photography" },
        { key: "landscape", labelBg: "Пейзажи", labelEn: "Landscapes" },
    ]

    const portfolioItems: PortfolioItem[] = [
        ...buildAlbumItems(
            winterPortraitPaths,
            "portrait",
            "Портретна фотография",
            "Portrait Photography",
            "portrait-winter",
            "Зимна фотосесия",
            "Winter Session",
            "Портрет",
            "Portrait"
        ),
        ...buildAlbumItems(
            springPortraitPaths,
            "portrait",
            "Портретна фотография",
            "Portrait Photography",
            "portrait-spring",
            "Пролетен портрет",
            "Spring Portrait",
            "Портрет",
            "Portrait"
        ),
        ...buildAlbumItems(
            theodoraPortraitPaths,
            "portrait",
            "Портретна фотография",
            "Portrait Photography",
            "portrait-theodora",
            "Теодора портрет",
            "Theodora Portrait",
            "Портрет",
            "Portrait"
        ),

        ...buildAlbumItems(
            productPaths,
            "product",
            "Продуктова фотография",
            "Product Photography",
            "product-main",
            "Продуктова фотография",
            "Product Photography",
            "Продуктов кадър",
            "Product Shot"
        ),

        ...buildAlbumItems(
            commercialPaths,
            "commercial",
            "Рекламна фотография",
            "Commercial Photography",
            "commercial-main",
            "Рекламна фотография",
            "Commercial Photography",
            "Рекламен кадър",
            "Commercial Shot"
        ),

        ...buildAlbumItems(
            corporatePaths,
            "corporate",
            "Корпоративна фотография",
            "Corporate Photography",
            "corporate-main",
            "Корпоративна фотография",
            "Corporate Photography",
            "Корпоративен кадър",
            "Corporate Shot"
        ),

        ...buildAlbumItems(
            eventBulgarePaths,
            "event",
            "Събития",
            "Events",
            "event-bulgare",
            "Bulgare",
            "Bulgare",
            "Събитие",
            "Event"
        ),

        ...buildAlbumItems(
            graduateAzraPaths,
            "graduate",
            "Абитуриентски балове",
            "Proms",
            "graduate-azra",
            "Бал Азра",
            "Azra Prom",
            "Абитуриентски кадър",
            "Prom Shot"
        ),
        ...buildAlbumItems(
            graduateVeronicaPaths,
            "graduate",
            "Абитуриентски балове",
            "Proms",
            "graduate-veronica",
            "Бал Вероника",
            "Veronica Prom",
            "Абитуриентски кадър",
            "Prom Shot"
        ),
        ...buildAlbumItems(
            graduateZaraPaths,
            "graduate",
            "Абитуриентски балове",
            "Proms",
            "graduate-zara",
            "Бал Зара",
            "Zara Prom",
            "Абитуриентски кадър",
            "Prom Shot"
        ),
        ...buildAlbumItems(
            graduateYanaPaths,
            "graduate",
            "Абитуриентски балове",
            "Proms",
            "graduate-yana",
            "Бал Яна",
            "Yana Prom",
            "Абитуриентски кадър",
            "Prom Shot"
        ),

        ...buildAlbumItems(
            birthdayPaths,
            "birthday",
            "Детски рожден ден",
            "Kids Birthday",
            "birthday-main",
            "Детски рожден ден",
            "Kids Birthday",
            "Рожден ден",
            "Birthday"
        ),

        ...buildAlbumItems(
            christmasPaths,
            "christmas",
            "Коледни",
            "Christmas",
            "christmas-main",
            "Коледни",
            "Christmas",
            "Коледен кадър",
            "Christmas Shot"
        ),

        ...buildAlbumItems(
            baptism1Paths,
            "baptism",
            "Кръщене",
            "Baptism",
            "baptism-1",
            "Кръщене 1",
            "Baptism 1",
            "Кръщене",
            "Baptism"
        ),
        ...buildAlbumItems(
            baptism2Paths,
            "baptism",
            "Кръщене",
            "Baptism",
            "baptism-2",
            "Кръщене 2",
            "Baptism 2",
            "Кръщене",
            "Baptism"
        ),

        ...buildAlbumItems(
            wedding1Paths,
            "wedding",
            "Сватбена фотография",
            "Wedding Photography",
            "wedding-1",
            "Сватба 1",
            "Wedding 1",
            "Сватба",
            "Wedding"
        ),
        ...buildAlbumItems(
            wedding2Paths,
            "wedding",
            "Сватбена фотография",
            "Wedding Photography",
            "wedding-2",
            "Сватба 2",
            "Wedding 2",
            "Сватба",
            "Wedding"
        ),
        ...buildAlbumItems(
            wedding3Paths,
            "wedding",
            "Сватбена фотография",
            "Wedding Photography",
            "wedding-3",
            "Сватба 3",
            "Wedding 3",
            "Сватба",
            "Wedding"
        ),

        ...buildAlbumItems(
            familyPaths,
            "family",
            "Семейна фотография",
            "Family Photography",
            "family-main",
            "Семейна фотография",
            "Family Photography",
            "Семеен кадър",
            "Family Shot"
        ),

        ...buildAlbumItems(
            maternityPaths,
            "maternity",
            "Бременност",
            "Maternity",
            "maternity-main",
            "Бременност",
            "Maternity",
            "Бременност",
            "Maternity"
        ),

        ...buildAlbumItems(
            landscapePaths,
            "landscape",
            "Пейзажи",
            "Landscapes",
            "landscape-main",
            "Пейзажи",
            "Landscapes",
            "Пейзаж",
            "Landscape"
        ),
    ]

    useEffect(() => {
        setActiveCategory(normalizeHashToCategory(location.hash))
    }, [location.hash])

    const albumTabs = useMemo(() => {
        const sourceItems =
            activeCategory === "all"
                ? portfolioItems
                : portfolioItems.filter((item) => item.category === activeCategory)

        const uniqueAlbums = Array.from(
            new Map(
                sourceItems.map((item) => [
                    item.albumKey,
                    {
                        key: item.albumKey,
                        labelBg: item.albumBg,
                        labelEn: item.albumEn,
                    },
                ])
            ).values()
        )

        return [{ key: "all", labelBg: "Всички албуми", labelEn: "All Albums" }, ...uniqueAlbums]
    }, [activeCategory])

    const filteredItems = useMemo(() => {
        return portfolioItems.filter((item) => {
            const categoryMatch = activeCategory === "all" || item.category === activeCategory
            const albumMatch = activeAlbum === "all" || item.albumKey === activeAlbum
            return categoryMatch && albumMatch
        })
    }, [activeCategory, activeAlbum])

    const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null

    useEffect(() => {
        setActiveAlbum("all")
        setSelectedIndex(null)
    }, [activeCategory])

    useEffect(() => {
        setSelectedIndex(null)
    }, [activeAlbum])

    useEffect(() => {
        if (selectedIndex === null) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedIndex(null)

            if (e.key === "ArrowRight") {
                setSelectedIndex((prev) => {
                    if (prev === null) return prev
                    return prev === filteredItems.length - 1 ? 0 : prev + 1
                })
            }

            if (e.key === "ArrowLeft") {
                setSelectedIndex((prev) => {
                    if (prev === null) return prev
                    return prev === 0 ? filteredItems.length - 1 : prev - 1
                })
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [selectedIndex, filteredItems])

    const handleCategoryChange = (category: CategoryKey) => {
        setActiveCategory(category)
        setActiveAlbum("all")
        setSelectedIndex(null)

        const nextHash = category === "all" ? "" : `#${category}`
        const nextUrl = `${window.location.pathname}${nextHash}`
        window.history.replaceState(null, "", nextUrl)
    }

    return (
        <>
            <Seo
                title={isBg ? "Портфолио" : "Portfolio"}
                description={
                    isBg
                        ? "Разгледайте портфолиото на DG Vision Studio – портрети, събития, абитуриентски балове, кръщенета, сватби, пейзажи и още категории."
                        : "Explore the DG Vision Studio portfolio – portraits, events, proms, baptisms, weddings, landscapes, and more categories."
                }
                canonical="/portfolio"
                image="/og-cover.jpg"
                type="website"
                jsonLd={portfolioJsonLd}
            />

            <div className="min-h-screen w-full overflow-x-hidden bg-neutral-100 dark:bg-zinc-900">
                <div className="border-b border-neutral-300 bg-neutral-50 px-[5mm] py-8 dark:border-zinc-700 dark:bg-zinc-800 sm:py-10 lg:py-12">
                    <div className="w-full">
                        <h1 className="text-center text-[28px] font-bold uppercase tracking-[0.12em] text-slate-900 dark:text-white sm:text-[36px] sm:tracking-[0.14em] lg:text-[44px] xl:text-[52px]">
                            {isBg ? "Портфолио" : "Portfolio"}
                        </h1>
                    </div>
                </div>

                <div className="border-b border-neutral-300 bg-neutral-200 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-400 dark:scrollbar-thumb-zinc-600 w-full overflow-x-auto">
                        <div className="flex min-w-full w-max items-center justify-center gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:gap-8 lg:px-8">
                            {categories.map((category) => {
                                const active = activeCategory === category.key

                                return (
                                    <button
                                        key={category.key}
                                        type="button"
                                        onClick={() => handleCategoryChange(category.key)}
                                        className={`relative whitespace-nowrap pb-2 text-[11px] font-bold uppercase tracking-[0.06em] transition sm:text-sm ${
                                            active
                                                ? "text-neutral-900 dark:text-white"
                                                : "text-neutral-600 hover:text-neutral-900 dark:text-zinc-300 dark:hover:text-white"
                                        }`}
                                    >
                                        {isBg ? category.labelBg : category.labelEn}

                                        <span
                                            className={`absolute bottom-0 left-0 h-[3px] transition-all ${
                                                active
                                                    ? "w-full bg-neutral-900 dark:bg-white"
                                                    : "w-0 bg-neutral-900 dark:bg-white"
                                            }`}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="border-b border-neutral-300 bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-400 dark:scrollbar-thumb-zinc-600 w-full overflow-x-auto">
                        <div className="flex min-w-full w-max items-center justify-center gap-4 px-4 py-3 sm:gap-5 sm:px-6 sm:py-4 lg:gap-6 lg:px-8">
                            {albumTabs.map((album) => {
                                const active = activeAlbum === album.key

                                return (
                                    <button
                                        key={album.key}
                                        type="button"
                                        onClick={() => setActiveAlbum(album.key)}
                                        className={`relative whitespace-nowrap pb-2 text-[10px] font-bold uppercase tracking-[0.08em] transition sm:text-xs ${
                                            active
                                                ? "text-neutral-900 dark:text-white"
                                                : "text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white"
                                        }`}
                                    >
                                        {isBg ? album.labelBg : album.labelEn}

                                        <span
                                            className={`absolute bottom-0 left-0 h-[2px] transition-all ${
                                                active
                                                    ? "w-full bg-neutral-900 dark:bg-white"
                                                    : "w-0 bg-neutral-900 dark:bg-white"
                                            }`}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {filteredItems.length > 0 ? (
                    <div className="w-full bg-neutral-300 px-[5mm] py-[1px] dark:bg-zinc-800">
                        <div
                            className="grid gap-[1px]"
                            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))" }}
                        >
                            {filteredItems.map((item, index) => (
                                <button
                                    key={`${item.src}-${index}`}
                                    type="button"
                                    onClick={() => setSelectedIndex(index)}
                                    className="group relative block aspect-[4/5] w-full overflow-hidden bg-neutral-100 text-left dark:bg-zinc-900"
                                >
                                    <img
                                        src={item.src}
                                        alt={isBg ? item.titleBg : item.titleEn}
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                    />

                                    <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20 dark:group-hover:bg-black/30" />

                                    <div className="absolute inset-x-0 bottom-0 translate-y-3 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:translate-y-4 sm:p-4">
                                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/70 sm:tracking-[0.28em]">
                                            {isBg ? item.albumBg : item.albumEn}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-white sm:text-[15px]">
                                            {isBg ? item.titleBg : item.titleEn}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full px-[5mm] py-12">
                        <div className="rounded-[26px] border border-neutral-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-800">
                            <h2 className="text-[20px] font-bold uppercase tracking-[0.08em] text-neutral-900 dark:text-white sm:text-[24px]">
                                {isBg ? "Категорията е празна" : "This category is empty"}
                            </h2>

                            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-neutral-600 dark:text-zinc-300 sm:text-base">
                                {isBg
                                    ? "Категорията е добавена в навигацията. Съдържанието за нея ще бъде качено по-късно."
                                    : "This category is already added to the navigation. Content for it will be uploaded later."}
                            </p>
                        </div>
                    </div>
                )}

                {selectedItem && (
                    <div
                        className="fixed inset-0 z-[9999] bg-slate-950/95"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedIndex(null)}
                            className="absolute right-2 top-2 z-[10001] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-900/70 text-white transition hover:bg-white/10 sm:right-4 sm:top-4 sm:h-11 sm:w-11 lg:right-6 lg:top-6"
                            aria-label={isBg ? "Затвори" : "Close"}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5 sm:h-6 sm:w-6"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>

                        {filteredItems.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedIndex((prev) =>
                                            prev === null ? prev : prev === 0 ? filteredItems.length - 1 : prev - 1
                                        )
                                    }}
                                    className="absolute left-2 top-1/2 z-[10001] inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/70 text-white transition hover:bg-white/10 sm:left-4 sm:h-11 sm:w-11 lg:left-6 lg:h-12 lg:w-12"
                                    aria-label={isBg ? "Предишна" : "Previous"}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5 sm:h-6 sm:w-6"
                                    >
                                        <path d="m15 18-6-6 6-6" />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedIndex((prev) =>
                                            prev === null ? prev : prev === filteredItems.length - 1 ? 0 : prev + 1
                                        )
                                    }}
                                    className="absolute right-2 top-1/2 z-[10001] inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/70 text-white transition hover:bg-white/10 sm:right-4 sm:h-11 sm:w-11 lg:right-6 lg:h-12 lg:w-12"
                                    aria-label={isBg ? "Следваща" : "Next"}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5 sm:h-6 sm:w-6"
                                    >
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </button>
                            </>
                        )}

                        <div
                            className="flex min-h-screen w-full items-center justify-center px-14 py-16 sm:px-20 sm:py-20 lg:px-24 lg:py-24"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex max-w-full flex-col items-center">
                                <img
                                    src={selectedItem.src}
                                    alt={isBg ? selectedItem.titleBg : selectedItem.titleEn}
                                    className="block max-h-[calc(100vh-220px)] max-w-full object-contain"
                                />

                                <div className="mt-4 px-4 text-center sm:px-6">
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/65 sm:text-[11px] sm:tracking-[0.3em]">
                                        {isBg ? selectedItem.categoryBg : selectedItem.categoryEn}
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-white sm:text-base lg:text-lg">
                                        {isBg ? selectedItem.albumBg : selectedItem.albumEn}
                                    </p>

                                    <p className="mt-1 text-xs text-white/70 sm:text-sm">
                                        {selectedIndex !== null ? `${selectedIndex + 1} / ${filteredItems.length}` : ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}