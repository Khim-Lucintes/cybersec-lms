// CDI 409 Unit 8: Caraga & Agusan River Basin Environmental GIS Hotspot Dataset
export const CARAGA_HOTSPOTS = [
  {
    id: "hotspot-01",
    name: "Agusan Marsh Wildlife Sanctuary (AMWS)",
    lat: 8.2833,
    lng: 125.8667,
    province: "Agusan del Sur",
    protectedStatus: "NIPAS Act Protected Ramsar Wetland Site",
    crimeType: "Illegal Wildlife Poaching (CITES App I)",
    targetSpecies: "Philippine Crocodile (Crocodylus mindorensis) & Waterbirds",
    violationStatute: "RA 9147 (Wildlife Act) & RA 11038 (Expanded NIPAS Act)",
    riskLevel: "CRITICAL",
    riskColor: "rose",
    evidenceFound: "Unregistered nylon gillnets, holding crates with juvenile hatchlings",
    investigationAction: "Deploy RACU 13 drone patrol & coordinate with DENR-CENRO San Francisco."
  },
  {
    id: "hotspot-02",
    name: "Agusan River Basin Timber Transit Corridor",
    lat: 8.9500,
    lng: 125.5333,
    province: "Butuan City / Agusan del Norte",
    protectedStatus: "Critical River Basin Buffer Zone",
    crimeType: "Illegal Log Flotation & Timber Smuggling",
    targetSpecies: "Yakal (Shorea astylosa) & Premium Red Lauan",
    violationStatute: "PD 705 (Revised Forestry Code) Sec. 68 as amended by EO 23",
    riskLevel: "HIGH",
    riskColor: "amber",
    evidenceFound: "Submerged timber rafts flagged during midnight river sonar sweeps",
    investigationAction: "Issue Warrant to Seize Conveyances and apply wood morphology sampling."
  },
  {
    id: "hotspot-03",
    name: "Mount Mayapay Watershed & Forest Reserve",
    lat: 8.9056,
    lng: 125.4222,
    province: "Agusan del Norte (Bordering Butuan City)",
    protectedStatus: "Key Biodiversity Area & Watershed Protected Zone",
    crimeType: "Encroachment, Charcoal Making (Uling) & Kaingin",
    targetSpecies: "Native Hardwoods & Biodiversity Microhabitats",
    violationStatute: "PD 705 Sec. 69 & RA 8749 (Clean Air Act - Open Burning)",
    riskLevel: "MODERATE",
    riskColor: "yellow",
    evidenceFound: "Thermal infrared satellite hot spots detected in secondary growth canopy",
    investigationAction: "On-site GPS boundary verification with FSUU Forest Rangers."
  },
  {
    id: "hotspot-04",
    name: "Port of Nasipit Coastal Seaport Gateway",
    lat: 8.9833,
    lng: 125.3333,
    province: "Agusan del Norte",
    protectedStatus: "Primary Maritime Inter-Island Shipping Hub",
    crimeType: "Inter-island Wildlife Trafficking & Falsified Transport Permits",
    targetSpecies: "Philippine Pangolin (Manis culionensis) & Palawan Hornbill",
    violationStatute: "RA 9147 Sec. 27 & Custom Modernization and Tariff Act (CMTA)",
    riskLevel: "CRITICAL",
    riskColor: "rose",
    evidenceFound: "False-bottom refrigerated container vans containing 48kg dried scales",
    investigationAction: "Execute X-Ray cargo screening and submit keratin specimen to NBI Lab."
  },
  {
    id: "hotspot-05",
    name: "Surigao - Cantilan Nickel Mining Watershed Zone",
    lat: 9.3167,
    lng: 125.9667,
    province: "Surigao del Sur",
    protectedStatus: "Ancestral Domain & Priority River Tributary",
    crimeType: "Toxic Tailings Runoff & Siltation Discharge",
    targetSpecies: "Freshwater Aquatic Biota & Downstream Rice Agriculture",
    violationStatute: "RA 9275 (Philippine Clean Water Act of 2004)",
    riskLevel: "HIGH",
    riskColor: "amber",
    evidenceFound: "Heavy metal turbidity exceeds DENR Class B DAO 2016-08 effluent threshold",
    investigationAction: "Petition for Writ of Kalikasan & Temporary Environmental Protection Order (TEPO)."
  }
];

export const GIS_REGIONAL_STATS = {
  regionName: "Caraga Region XIII (Agusan-Surigao Green Forensic Corridor)",
  totalProtectedHectares: "324,500 Hectares",
  activeForestryCases: 14,
  wildlifeInterdictions2026: 9,
  writOfKalikasanFilings: 3
};
