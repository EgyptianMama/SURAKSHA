import { NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"
import { SEED_SCHOOLS } from "@/lib/firestore-collections"

export const revalidate = 300 // cache for 5 minutes

// ============================================================
// REAL NDMA SACHET CAP Alert Feed Integration
// Source: https://sachet.ndma.gov.in (National Disaster Management Authority)
// 
// Flow:
//   1. Fetch RSS feed from sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml
//   2. Each <item> contains a <link> to a full CAP 1.2 XML alert
//   3. Fetch top N individual CAP alerts for detailed severity/area/event data
//   4. Match affected areas to registered schools by state/region keywords
// ============================================================

const RSS_FEED_URL = "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml"
const MAX_ALERTS_TO_FETCH = 15 // Limit individual CAP fetches for performance

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true, // Strip cap: namespace prefix for easier access
})

// Helper to safely extract string from XML parsed nodes which might be objects if they have attributes
const extractString = (val: any): string => {
  if (!val) return ""
  if (typeof val === "string") return val
  if (Array.isArray(val)) return extractString(val[0])
  if (typeof val === "object") {
    if (val["#text"]) return String(val["#text"])
    // If it's an object without #text, just stringify it or return empty
    return JSON.stringify(val)
  }
  return String(val)
}

export async function GET() {
  try {
    // Step 1: Fetch the RSS feed
    const rssRes = await fetch(RSS_FEED_URL, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    if (!rssRes.ok) {
      throw new Error(`RSS feed returned ${rssRes.status}`)
    }

    const rssXml = await rssRes.text()
    const rssData = parser.parse(rssXml)
    const items = rssData?.rss?.channel?.item || []
    const itemsArray = Array.isArray(items) ? items : [items]

    // Step 2: Fetch individual CAP XML alerts (limit to MAX_ALERTS_TO_FETCH)
    const alertPromises = itemsArray.slice(0, MAX_ALERTS_TO_FETCH).map(async (item: any) => {
      try {
        const capUrl = item.link
        if (!capUrl) return null

        const capRes = await fetch(capUrl, {
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(8000),
        })
        if (!capRes.ok) return null

        const capXml = await capRes.text()
        const capData = parser.parse(capXml)

        // Navigate CAP structure (namespace-stripped)
        const alert = capData?.alert
        if (!alert) return null

        const info = Array.isArray(alert.info) ? alert.info[0] : alert.info
        if (!info) return null

        const area = Array.isArray(info.area) ? info.area[0] : info.area
        const headline = extractString(info.headline || item.title) || "Disaster Alert"
        const areaDesc = extractString(area?.areaDesc) || ""

        // Build a searchable text from headline + areaDesc for school matching
        const searchText = `${headline} ${areaDesc} ${extractString(item.title)}`.toLowerCase()

        // Match affected schools by state, region, or city keywords
        const affectedSchools = SEED_SCHOOLS.filter(school => {
          const state = school.state.toLowerCase()
          const region = school.region.toLowerCase()
          const city = school.shortName.toLowerCase()

          return (
            searchText.includes(state) ||
            searchText.includes(region) ||
            searchText.includes(city.split(" ")[0]) || // e.g. "bengaluru"
            // NCR matching for Delhi
            (state === "delhi" && (searchText.includes("ncr") || searchText.includes("new delhi"))) ||
            // Karnataka matching for Bengaluru
            (state === "karnataka" && (searchText.includes("bengaluru") || searchText.includes("bangalore"))) ||
            // Maharashtra matching for Mumbai
            (state === "maharashtra" && (searchText.includes("mumbai") || searchText.includes("bombay")))
          )
        }).map(s => s.id)

        return {
          id: extractString(alert.identifier || item.guid) || `ndma-${Date.now()}`,
          headline,
          description: extractString(info.description || info.instruction),
          severity: extractString(info.severity) || "Unknown",
          urgency: extractString(info.urgency) || "Unknown",
          certainty: extractString(info.certainty) || "Unknown",
          event: extractString(info.event || info.category) || "Alert",
          areaDesc: areaDesc || "India",
          effective: extractString(info.effective || info.onset || item.pubDate) || new Date().toISOString(),
          expires: extractString(info.expires) || new Date(Date.now() + 86400000).toISOString(),
          source: `${extractString(alert.sender || item.author)} (Live)`,
          affectedSchools,
        }
      } catch {
        return null // Skip failed individual fetches
      }
    })

    const results = await Promise.allSettled(alertPromises)
    const parsedAlerts = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value !== null)
      .map(r => r.value)

    // Same warning is often issued per-region by several agencies: merge into one card
    const merged = new Map<string, any>()
    for (const a of parsedAlerts) {
      const key = `${a.headline.replace(/\s+/g, " ").trim()}|${a.effective}|${a.expires}`
      const prev = merged.get(key)
      if (!prev) { merged.set(key, a); continue }
      prev.areaDesc = [...new Set([...prev.areaDesc.split(","), ...a.areaDesc.split(",")].map((s: string) => s.trim()))].join(", ")
      prev.affectedSchools = [...new Set([...prev.affectedSchools, ...a.affectedSchools])]
      if (!prev.source.includes(a.source)) prev.source += `, ${a.source}`
    }

    // If we got real alerts, return them
    if (merged.size > 0) {
      // Hide expired alerts (unparseable expiry => keep)
      const active = [...merged.values()].filter(a => !(Date.parse(a.expires) < Date.now()))
      return NextResponse.json(active)
    }

    // If RSS worked but no individual CAP alerts could be fetched, 
    // create alerts from the RSS items directly (less detailed but still real)
    const rssAlerts = itemsArray.slice(0, 10).map((item: any, idx: number) => {
      const title = extractString(item.title) || "Weather Alert"
      const searchText = title.toLowerCase()

      const affectedSchools = SEED_SCHOOLS.filter(school => {
        const state = school.state.toLowerCase()
        return (
          searchText.includes(state) ||
          (state === "delhi" && searchText.includes("ncr")) ||
          (state === "karnataka" && (searchText.includes("bengaluru") || searchText.includes("bangalore"))) ||
          (state === "maharashtra" && (searchText.includes("mumbai") || searchText.includes("bombay")))
        )
      }).map(s => s.id)

      return {
        id: extractString(item.guid) || `rss-${idx}`,
        headline: title,
        description: extractString(item.description),
        severity: "Moderate",
        urgency: "Expected",
        certainty: "Likely",
        event: extractString(item.category) || "Met",
        areaDesc: title,
        effective: extractString(item.pubDate) || new Date().toISOString(),
        expires: new Date(Date.now() + 10800000).toISOString(), // 3 hours
        source: `${extractString(item.author) || "NDMA SACHET"} (Live RSS)`,
        affectedSchools,
      }
    })

    if (rssAlerts.length > 0) {
      return NextResponse.json(rssAlerts)
    }

    throw new Error("No alerts found in feed")

  } catch (error) {
    console.error("Error fetching NDMA alerts:", error)
    // Fallback to mock data ONLY if ALL real APIs fail
    return NextResponse.json([
      {
        id: "ndma-fallback-1",
        headline: "Heavy Rainfall Warning — Karnataka",
        description: "IMD has issued an orange alert for heavy rainfall (115–204mm) expected in Bengaluru Urban and Bengaluru Rural districts. Schools in flood-prone areas should activate their flood response protocols.",
        severity: "Severe",
        urgency: "Expected",
        event: "Flood",
        areaDesc: "Bengaluru Urban, Bengaluru Rural, Ramanagara",
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 172800000).toISOString(),
        source: "IMD / NDMA SACHET (Fallback — API Unreachable)",
        affectedSchools: ["kv-bengaluru"],
      },
      {
        id: "ndma-fallback-2",
        headline: "Heat Wave Advisory — Delhi-NCR",
        description: "Severe heat wave conditions likely over Delhi. Maximum temperatures may reach 45°C. Schools should suspend outdoor activities between 12 PM and 4 PM.",
        severity: "Moderate",
        urgency: "Future",
        event: "Heat Wave",
        areaDesc: "Delhi, Gurgaon, Noida, Faridabad",
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 432000000).toISOString(),
        source: "IMD (Fallback — API Unreachable)",
        affectedSchools: ["dps-rkpuram"],
      },
    ])
  }
}
