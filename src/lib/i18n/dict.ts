export type Language = "en" | "ar";

export const DICT = {
  en: {
    // Header & Footer
    headerTitle: "Oman Rooftop Solar",
    headerSubtitle: "Energy Estimator · سلطنة عُمان",
    sdg7Tag: "SDG 7",
    sdg11Tag: "SDG 11",
    netZeroTag: "Net Zero 2050",
    switchLang: "العربية",

    footerTitle: "Oman Rooftop Solar Estimator",
    footerText:
      "Supporting UN SDG 7 (Affordable & Clean Energy), SDG 11 (Sustainable Cities & Communities) and Oman's Net Zero 2050 ambition.",
    footerDisclaimer:
      "Estimates are indicative planning figures. Data sources: Oman Solar Atlas (irradiance), APSR tariff regulation effective 1 Jan 2025 (14/18/32 baisa residential, 25 baisa non-residential), IEA-grid average carbon intensity for Oman (0.65 tCO₂/MWh). Satellite imagery © Esri / © Mapbox. Address search via Mapbox Geocoding / Photon / OpenStreetMap Nominatim. Always obtain a professional site survey and licensed installer quote before purchase.",

    // Hero
    heroTagOman: "🇴🇲 Oman · سلطنة عُمان",
    heroTagSdg7: "SDG 7 · Affordable & Clean Energy",
    heroTagSdg11: "SDG 11 · Sustainable Cities",
    heroTagNetZero: "Net Zero 2050",
    heroTitlePart1: "How much ",
    heroTitleSun: "sun",
    heroTitlePart2: " can your roof turn into ",
    heroTitleSavings: "savings",
    heroTitleEnd: "?",
    heroSub:
      "Trace your rooftop on a satellite map and get an Oman-specific solar estimate in seconds — system size, energy yield, bill savings, payback period and CO₂ avoided — built on real Omani irradiance, climate and Nama tariff data.",
    heroCta: "Start estimating",
    heroStat1Value: "5.5–6.5",
    heroStat1Unit: "kWh/m²/day",
    heroStat1Label: "Average solar irradiance (GHI)",
    heroStat2Value: "300+",
    heroStat2Unit: "days",
    heroStat2Label: "Of sunshine per year",
    heroStat3Value: "2050",
    heroStat3Unit: "target",
    heroStat3Label: "Oman Net Zero ambition",

    // Landing sections
    heroMapLabel: "Muscat · Darsait — demo zone, cached satellite imagery",
    howEyebrow: "Three steps",
    how1Title: "Trace",
    how1Body:
      "Draw your rooftop on high-resolution satellite imagery — or fly straight to a demo roof.",
    how2Title: "Tune",
    how2Body:
      "Omani irradiance, heat, dust and Nama's 2025 tariff tiers applied to your exact roof.",
    how3Title: "Decide",
    how3Body:
      "System size, payback, ROI, LCOE and CO₂ avoided — plus your SDG 7 / 11 / Net Zero 2050 impact.",
    statsEyebrow: "Why Oman",
    estimatorEyebrow: "The estimator",
    estimatorTitle: "Estimate your roof",

    // Steps indicator
    step1Label: "Find your roof",
    step2Label: "Property details",
    step3Label: "Results",

    // Step 1: Location & Map
    step1Title: "Step 1 · Trace your roof",
    step1Inst1: "Search your address, or click a city below the search bar.",
    step1Inst2:
      "Click Trace my roof, then click the corners of your roof on the satellite image.",
    step1Inst3:
      "Double-click (or press Finish polygon) when done. Right-click cancels.",
    step1Inst4: "Not sure where? Click Demo roof to fly directly to a sample rooftop.",
    drawnRooftop: "Drawn rooftop",
    usable75: "Usable (75%)",
    panelsCount: "Panels (550 W each)",
    capacityDensity: "Capacity density",
    whyTraceTitle: "Why trace the roof?",
    whyTraceBody:
      "The drawn area drives everything downstream: system size (kWp), generation, savings and CO₂ avoided. Be as accurate as you can — exclude AC units, water tanks and shaded sections.",

    mapSearchPlaceholder: "Search an address in Oman…",
    traceRoofBtn: "✦ Trace my roof",
    demoRoofBtn: "Demo roof",
    clearBtn: "Clear",
    tracingInProgress: "Tracing in progress",
    cornersPlaced: "corner(s) placed",
    undoBtn: "Undo",
    finishPolygonBtn: "Finish polygon",
    cancelBtn: "Cancel",
    rooftopAreaLabel: "Rooftop area",
    usableApprox: "Usable ≈",
    panelsApprox: "panels",
    loadingSatellite: "Loading satellite imagery…",
    loadingMap: "Loading map…",
    minAreaWarning: "Trace your roof on the map to continue (min. 20 m²).",
    continueToDetails: "Continue to property details →",

    // Step 2: Property
    step2Title: "Property type & consumption",
    step2Sub: "Tells us which Nama tariff applies to you.",
    propTypeLabel: "Property type",
    residentialLabel: "Home / Villa",
    residentialHint: "Nama residential tiers",
    commercialLabel: "Business / Building",
    commercialHint: "Nama non-residential flat rate",
    avgConsumptionLabel: "Average monthly consumption",
    billOmrTab: "My bill (OMR)",
    usageKwhTab: "My usage (kWh)",
    approxKwhMonth: "kWh/month on",
    approxOmrMonth: "OMR / month",
    govLabel: "Governorate",
    govHint: "Solar resource:",
    tariffScheduleLabel: "Tariff schedule",
    tariffScheduleHint:
      "Primary = main home account · Additional = second account on same premises",
    commercialCallout:
      "Commercial tariff: flat 25 baisa/kWh applies across all consumption levels.",

    roofEnvTitle: "Roof & environment",
    roofEnvSub: "How your roof and Oman's climate shape the yield.",
    roofTypeLabel: "Roof type",
    flatRoofLabel: "Flat roof",
    flatRoofHint: "Tilted arrays on supports (~8°)",
    slopedRoofLabel: "Sloped roof",
    slopedRoofHint: "Follows roof pitch (~15°)",
    orientationLabel: "Dominant orientation",
    soilingLabel: "Dust / soiling",
    soilingHint: "Desert dust reduces output between cleanings.",
    netMeteringToggle: "Net metering — export surplus to the grid for credit",

    advancedSettingsTitle:
      "Advanced settings (industry & technical parameters)",
    costPerKwpLabel: "Installation cost",
    usableRoofFactorLabel: "Usable roof factor",
    capacityDensityLabel: "Capacity density",
    panelWattageLabel: "Panel wattage",
    exportCreditLabel: "Export credit (surplus)",
    gridEmissionFactorLabel: "Grid emission factor",
    tariffEscalationLabel: "Tariff escalation",
    analysisPeriodLabel: "Analysis period",

    liveSummaryTitle: "Live summary",
    liveSummaryArea: "Rooftop area",
    liveSummarySystemSize: "Estimated system size",
    liveSummaryRoofPotential: "roof potential",
    liveSummaryTariff: "Tariff",
    liveSummaryCurrentBill: "Current bill",
    goodToKnowTitle: "Good to know:",
    goodToKnowBody:
      "Oman receives 5.5–6.5 kWh/m²/day of solar radiation — among the best in the world. The heat, however, derates panels (~11–15% via the NOCT cell model), and desert dust accumulates at ~0.25%/day between cleanings. Both are already included in your estimate.",
    backToMapBtn: "← Back to map",
    calculateBtn: "Calculate my estimate →",
    calculatingText: "Calculating…",

    // Step 3: Results
    resultsTitle: "Your solar potential",
    residentialPropText: "residential",
    commercialPropText: "non-residential",
    flatRoofText: "flat roof",
    slopedRoofText: "sloped roof",
    editInputsBtn: "← Edit inputs",
    pdfReportBtn: "PDF report",
    newEstimateBtn: "New estimate",

    live3dModel: "3D Live Model",
    dragToOrbit: "drag to orbit · scroll to zoom",
    facing: "facing",
    rendering3d: "Rendering your 3D roof…",
    previewUnavailable:
      "3D preview unavailable on this device — all estimates above are unaffected.",

    statSystemSize: "System size",
    statPanels: "panels",
    statRoofPotential: "roof potential",
    statAnnualGen: "Annual generation",
    statPerDay: "kWh/day",
    statPerKwpYr: "kWh/kWp/yr",
    statAnnualSavings: "Annual savings",
    statBillFromTo: "Bill",
    statPaybackPeriod: "Payback period",
    statRoi: "ROI",
    statLcoe: "LCOE",

    selfSufficiencyLabel: "Energy self-sufficiency",
    billOffsetLabel: "Bill offset",

    chartMonthlyTitle: "Monthly generation vs consumption",
    chartSavingsTitle: "Cumulative savings over {years} years",
    chartSolarGen: "Solar (kWh)",
    chartConsumption: "Consumption (kWh)",
    chartMeanTemp: "Mean temp",
    chartHeatLoss: "heat loss",
    chartCumulativeSavings: "Cumulative savings",
    chartCapexRef: "Capex",

    financialBreakdownTitle: "Financial breakdown",
    capexItem: "Installation cost (capex)",
    omPerYearItem: "Annual operation & maintenance",
    cumulativeSavingsItem: "Cumulative savings ({years} yrs)",
    roiItem: "ROI over 25 analysis years",
    paybackItem: "Payback period",
    npvItem: "Net present value",
    lcoeItem: "Levelized cost of energy",
    financialsFootnote:
      "Savings assume {escalation}/yr tariff escalation, 0.55%/yr panel degradation, O&M at 1.5% of capex (inflated 2%/yr), valued at the 5.5% Omani discount rate, and {netMeteringNote}",
    netMeteringYes: "net metering with surplus export credit.",
    netMeteringNo: "no surplus export credit.",

    performanceRatioTitle: "Performance ratio",
    totalLossesSub: "Total losses {pct} — where the sun’s energy goes",
    lossTemp: "Heat derating (Oman climate)",
    lossSoiling: "Dust & soiling",
    lossInverter: "Inverter losses",
    lossWiring: "Wiring & mismatch",
    lossShading: "Shading",
    lossOther: "Other system losses",
    multiplicativeLossNote:
      "Note: System losses apply multiplicatively to plane-of-array solar energy.",

    environmentalTitle: "Environmental impact",
    co2PerYrItem: "CO₂ avoided / year",
    co2LifeItem: "CO₂ avoided over 25 analysis years",
    treesItem: "Trees equivalent",
    carsItem: "Cars off the road (equivalent)",
    gridFactorItem: "Grid emission factor",
    environmentalFootnote:
      "Trees assume 21.77 kg CO₂ absorbed/tree/year; cars assume 4.6 t CO₂/vehicle/year. Emission factor reflects Oman's mostly gas-fired grid.",

    sdgTrackerTitle: "Impact & alignment tracker",
    sdgTrackerSub:
      "How this installation advances Oman's national sustainability goals.",
    sdg7Ring: "SDG 7 · Affordable & Clean Energy",
    sdg11Ring: "SDG 11 · Sustainable Cities",
    netZeroRing: "Net Zero 2050 · Oman",
    selfSufficiencyBar:
      "Energy self-sufficiency (share of your demand from solar)",
    billOffsetBar: "Electricity bill offset",
    sdgFootnote:
      "SDG 7 score reflects the share of household/business demand met by clean rooftop power; SDG 11 blends bill relief with urban clean-energy adoption; Net Zero 2050 tracks the same renewable share as your contribution to the Sultanate's 2050 target.",

    assumptionsTitle: "Assumptions used",
    disclaimerFootnote:
      "Not investment advice. Figures are engineering estimates — request a professional survey and licensed installer quotes before purchase.",

    // Report Page
    reportMainTitle: "Rooftop Solar Potential Report",
    reportAlignedWith: "Aligned with",
    noEstimateFound: "No estimate found yet.",
    reportSec1Title: "1 · Site & system inputs",
    reportSec2Title: "2 · Energy & financial outlook",
    reportSec3Title: "3 · Environmental impact",
    reportYieldSummary:
      "Estimated yield of {yield} kWh per kWp per year at a performance ratio of {pr}, after Oman heat derating ({tempLoss}), dust soiling ({soilingLoss}) and system losses. Monthly bill moves from {billWithout} to {billWith} per year.",
    reportTableYear: "Year",
    reportTableGen: "Generation (kWh)",
    reportTableNetSavings: "Net savings (OMR)",
    reportTableCumulative: "Cumulative (OMR)",
    reportDisclaimerTitle: "Disclaimer:",
    reportDisclaimerBody:
      "This is an engineering-style estimate for planning only and does not constitute financial advice or a quotation. Actual output depends on installation quality, module selection, shading, inverter sizing, and meteorological variation. Solar resource data reflects the Oman Solar Atlas; tariffs reflect the APSR regulation effective 1 Jan 2025. Confirm current tariffs, net-metering rules and incentives with your electricity company and a licensed installer before purchase.",
    printPdfBtn: "Download / print PDF",

    // Option Labels & Descriptions
    govMuscat: "Muscat",
    govDhofar: "Dhofar",
    govBatinahNorth: "Al Batinah North",
    govBatinahSouth: "Al Batinah South",
    govDakhiliyah: "Al Dakhiliyah",
    govSharqiyahNorth: "Al Sharqiyah North",
    govSharqiyahSouth: "Al Sharqiyah South",
    govDhahirah: "Al Dhahirah",
    govBuraimi: "Al Buraimi",
    govMusandam: "Musandam",
    govWusta: "Al Wusta",

    orientSouth: "South",
    orientSoutheast: "Southeast",
    orientSouthwest: "Southwest",
    orientEast: "East",
    orientWest: "West",
    orientMixed: "Mixed",

    soilingLow: "Low dust",
    soilingLowHint: "Frequent cleaning (~30-day cycle)",
    soilingMedium: "Typical",
    soilingMediumHint: "Standard 60-day washing cycle",
    soilingHigh: "High dust",
    soilingHighHint: "Rarely cleaned / desert fringes (~120 days)",

    tariffPrimary: "Residential – primary account (14/18/32 baisa)",
    tariffAdditional: "Residential – additional account (22/26/32 baisa)",
    tariffNonRes: "Non-residential flat rate (25 baisa)",
  },

  ar: {
    // Header & Footer
    headerTitle: "الحاسبة الشمسية للمباني - عُمان",
    headerSubtitle: "تقدير طاقة الطاقة الشمسية · سلطنة عُمان",
    sdg7Tag: "الهدف 7",
    sdg11Tag: "الهدف 11",
    netZeroTag: "الحياد الصفري 2050",
    switchLang: "English",

    footerTitle: "حاسبة الطاقة الشمسية للأسطح في سلطنة عُمان",
    footerText:
      "تدعم الهدف 7 والهدف 11 من أهداف التنمية المستدامة للأمم المتحدة واستراتيجية سلطنة عُمان للحياد الصفري 2050.",
    footerDisclaimer:
      "النتائج المترتبة هي تقديرات هندسية أولية للاسترشاد فقط. مصادر البيانات: أطلس عُمان الشمسي (الإشعاع)، تعرفة تنظيم الخدمات العامة اعتبارا من 1 يناير 2025 (14/18/32 بيسة للسكني، 25 بيسة للغير سكني)، ومعامل انبعاثات الكربون للشبكة في عُمان (0.65 طن CO₂/م.و.س). صور الأقمار الصناعية © Esri / © Mapbox. البحث عن العناوين عبر Mapbox Geocoding / Photon / OpenStreetMap. يُنصح دائما بالحصول على مسح ميداني وعروض أسعار من مقاولين مرخصين قبل الشراء.",

    // Hero
    heroTagOman: "🇴🇲 سلطنة عُمان · Oman",
    heroTagSdg7: "الهدف 7 · طاقة نظيفة وبأسعار معقولة",
    heroTagSdg11: "الهدف 11 · مدن ومجتمعات مستدامة",
    heroTagNetZero: "الرؤية الوطنية للحياد الصفري 2050",
    heroTitlePart1: "كم من أشعة ",
    heroTitleSun: "الشمس",
    heroTitlePart2: " يمكن لسقفك تحويلها إلى ",
    heroTitleSavings: "وفر مالي",
    heroTitleEnd: "؟",
    heroSub:
      "ارسم مساحة سقفك على خريطة الأقمار الصناعية واحصل في ثوانٍ على تقييم شمسي مخصص لعُمان — قدرة المحطة، الإنتاج السنوي، الوفر في الفاتورة، فترة استرداد الاستثمار، وخفض الانبعاثات — بناءً على بيانات الإشعاع والطقس وتعاريف نماء للكهرباء.",
    heroCta: "ابدأ تقييم سقفك الآن",
    heroStat1Value: "5.5–6.5",
    heroStat1Unit: "ك.و.س/م²/يوم",
    heroStat1Label: "متوسط الإشعاع الشمسي اليومي (GHI)",
    heroStat2Value: "+300",
    heroStat2Unit: "يوماً",
    heroStat2Label: "مشمساً خلال السنة",
    heroStat3Value: "2050",
    heroStat3Unit: "المستهدف",
    heroStat3Label: "الرؤية الوطنية للحياد الصفري",

    // Landing sections
    heroMapLabel: "مسقط · دارسيت — منطقة العرض، صور أقمار صناعية مخزّنة",
    howEyebrow: "ثلاث خطوات",
    how1Title: "ارسم",
    how1Body: "ارسم حدود سقفك على صور الأقمار الصناعية عالية الدقة — أو انتقل مباشرة إلى سقف تجريبي.",
    how2Title: "خصص",
    how2Body: "الإشعاع الشمسي وحرارة عُمان والغبار وشرائح أسعار ناما 2025 مطبَّقة على سقفك بدقة.",
    how3Title: "قرر",
    how3Body: "حجم النظام، فترة الاسترداد، العائد، تكلفة الكيلوواط ساعة وانبعاثات CO₂ — مع أثرك في أهداف 7 و11 والحياد الصفري 2050.",
    statsEyebrow: "لماذا عُمان",
    estimatorEyebrow: "أداة التقييم",
    estimatorTitle: "قيّم سقفك",

    // Steps indicator
    step1Label: "حدد موقع سقفك",
    step2Label: "تفاصيل العقار والتعرفة",
    step3Label: "نتائج التقييم الشمسي",

    // Step 1: Location & Map
    step1Title: "الخطوة 1 · ارسم حدود سقفك",
    step1Inst1: "ابحث عن عنوانك في عُمان أو اختر إحدى المدن أدناه.",
    step1Inst2:
      "اضغط 'ارسم سقفك'، ثم انقر على زوايا السقف في صورة الأقمار الصناعية.",
    step1Inst3:
      "انقر مرتين (أو اضغط 'إنهاء الرسم') عند الانتهاء. النقر الأيمن للإلغاء.",
    step1Inst4: "موقع نموذج للتجربة؟ اضغط 'سقف توضيحي' للانتقال لموقع السقف.",
    drawnRooftop: "مساحة السقف المرسومة",
    usable75: "المساحة المستغلة (75%)",
    panelsCount: "عدد الألواح (550 واط لكل لوح)",
    capacityDensity: "كثافة القدرة المستغلة",
    whyTraceTitle: "لماذا نقوم برسم حدود السقف؟",
    whyTraceBody:
      "تحدد مساحة السقف كافة الحسابات التالية: سعة المحطة الشمسي (كيلوواط)، الإنتاج المالي، الوفر في الفاتورة، وخفض انبعاثات الكربون. احرص على دقة الرسم وتجنب أجهزة التكييف وخزانات المياه والمناطق المظللة.",

    mapSearchPlaceholder: "ابحث عن موقع أو عنوان في عُمان…",
    traceRoofBtn: "✦ ارسم سقفك",
    demoRoofBtn: "سقف توضيحي",
    clearBtn: "مسح",
    tracingInProgress: "جاري رسم الحدود",
    cornersPlaced: "نقاط محددة",
    undoBtn: "تراجع",
    finishPolygonBtn: "إنهاء الرسم",
    cancelBtn: "إلغاء",
    rooftopAreaLabel: "مساحة السقف",
    usableApprox: "المستغل ≈",
    panelsApprox: "لوح شمسي",
    loadingSatellite: "جاري تحميل صور الأقمار الصناعية…",
    loadingMap: "جاري تحميل الخريطة…",
    minAreaWarning: "يرجى رسم مساحة السقف للبدء (الحد الأدنى 20 م²).",
    continueToDetails: "الانتقال لتفاصيل العقار ←",

    // Step 2: Property
    step2Title: "نوع العقار والاستهلاك الشهري",
    step2Sub: "يحدد فئة تعرفة نماء المطبقة على حسابك الكهربائي.",
    propTypeLabel: "نوع العقار",
    residentialLabel: "منزل / فيلا",
    residentialHint: "تعرفة نماء السكنية (شرائح)",
    commercialLabel: "مبنى تجاري / مؤسسة",
    commercialHint: "تعرفة نماء غير السكنية (ثابتة)",
    avgConsumptionLabel: "متوسط الاستهلاك الشهري",
    billOmrTab: "الفاتورة الشهرية (ر.ع.)",
    usageKwhTab: "الاستهلاك الشهري (ك.و.س)",
    approxKwhMonth: "كيلوواط ساعة/شهرياً بنظام",
    approxOmrMonth: "ريال عُماني / شهرياً",
    govLabel: "المحافظة",
    govHint: "بيانات الإشعاع الشمسي:",
    tariffScheduleLabel: "فئة التعرفة الكهربائية",
    tariffScheduleHint:
      "حساب أساسي = المنزل الرئيسي · حساب إضافي = حساب إضافي في نفس العقار",
    commercialCallout:
      "تعرفة الأنشطة التجارية: تعرفة ثابتة بمقدار 25 بيسة/ك.و.س لجميع مستويات الاستهلاك.",

    roofEnvTitle: "مواصفات السقف والبيئة المحيطة",
    roofEnvSub: "كيف تؤثر زاوية السقف والمناخ العُماني على الإنتاجية.",
    roofTypeLabel: "نوع السقف",
    flatRoofLabel: "سقف مسطح (أفقي)",
    flatRoofHint: "ألواح مائلة على هياكل تثبيت (~8 درجات)",
    slopedRoofLabel: "سقف مائل (جمالوني)",
    slopedRoofHint: "موازٍ لميلان السقف الحالي (~15 درجة)",
    orientationLabel: "الاتجاه الرئيسي للسقف",
    soilingLabel: "تراكم الغبار والأتربة",
    soilingHint: "يقلل غبار الصحراء الإنتاجية بين دورات التنظيف.",
    netMeteringToggle:
      "نظام صافي القياس — تصدير الفائض من الطاقة للشبكة الكهربائية",

    advancedSettingsTitle: "الإعدادات المتقدمة (المعايير الفنية والمالية)",
    costPerKwpLabel: "تكلفة التركيب",
    usableRoofFactorLabel: "نسبة المساحة المتاحة للاستخدام",
    capacityDensityLabel: "كثافة القدرة للسطح",
    panelWattageLabel: "قدرة اللوح الشمسي",
    exportCreditLabel: "سعر تصدير الفائض",
    gridEmissionFactorLabel: "معامل انبعاثات الشبكة",
    tariffEscalationLabel: "نسبة زيادة التعرفة سنوياً",
    analysisPeriodLabel: "فترة التحليل المالي",

    liveSummaryTitle: "ملخص مباشر",
    liveSummaryArea: "مساحة السقف",
    liveSummarySystemSize: "السعة الموصى بها",
    liveSummaryRoofPotential: "أقصى سعة للسقف",
    liveSummaryTariff: "التعرفة",
    liveSummaryCurrentBill: "الفاتورة الحالية",
    goodToKnowTitle: "معلومة هامة:",
    goodToKnowBody:
      "تتمتع عُمان بـ 5.5–6.5 ك.و.س/م²/يوم من الإشعاع الشمسي — وهي من أعلى النسب عالمياً. يؤخذ في الحسبان التأثير الحراري الصيفي (~11–15% فقد حراري) وتراكم غبار الصحراء (~0.25%/يوم). كلاهما مدمجان تلقائياً في التقييم.",
    backToMapBtn: "← العودة للخريطة",
    calculateBtn: "حساب التقييم الشمسي ←",
    calculatingText: "جاري الحساب…",

    // Step 3: Results
    resultsTitle: "نتائج تقييم طاقتك الشمسية",
    residentialPropText: "سكني",
    commercialPropText: "تجاري / غير سكني",
    flatRoofText: "سقف مسطح",
    slopedRoofText: "سقف مائل",
    editInputsBtn: "← تعديل البيانات",
    pdfReportBtn: "تقرير PDF",
    newEstimateBtn: "تقييم جديد",

    live3dModel: "نموذج 3D تفاعلي",
    dragToOrbit: "اسحب للتدوير · استخدم العجلة للتكبير",
    facing: "باتجاه",
    rendering3d: "جاري بناء مجسم السقف ثلاثي الأبعاد…",
    previewUnavailable:
      "عرض المجسم 3D غير متاح على هذا الجهاز — جميع النتائج والحسابات أعلاه دقيقة ولا تتأثر.",

    statSystemSize: "سعة المحطة الموصى بها",
    statPanels: "لوح شمسي",
    statRoofPotential: "أقصى سعة للسقف",
    statAnnualGen: "الإنتاج السنوي المتوقع",
    statPerDay: "ك.و.س/يوم",
    statPerKwpYr: "ك.و.س/ك.و.ب/سنة",
    statAnnualSavings: "الوفر المالي السنوي",
    statBillFromTo: "الفاتورة",
    statPaybackPeriod: "فترة استرداد رأس المال",
    statRoi: "عائد الاستثمار",
    statLcoe: "تكلفة الطاقة المتكافئة",

    selfSufficiencyLabel: "نسبة الاكتفاء الذاتي من الطاقة الشمسية",
    billOffsetLabel: "نسبة خفض الفاتورة الكهربائية",

    chartMonthlyTitle: "مقارنة الإنتاج الشمسي بالاستهلاك الشهري",
    chartSavingsTitle: "التراكمي للوفر المالي على مدى {years} سنة",
    chartSolarGen: "الإنتاج الشمسي (ك.و.س)",
    chartConsumption: "الاستهلاك (ك.و.س)",
    chartMeanTemp: "متوسط الحرارة",
    chartHeatLoss: "الفقد الحراري",
    chartCumulativeSavings: "الوفر المتراكم",
    chartCapexRef: "تكلفة التأسيس",

    financialBreakdownTitle: "التحليل المالي التفصيلي",
    capexItem: "تكلفة التركيب المبدئية",
    omPerYearItem: "الصيانة التشغيلية السنوية",
    cumulativeSavingsItem: "إجمالي الوفر المتراكم ({years} سنة)",
    roiItem: "عائد الاستثمار الكلي",
    paybackItem: "فترة استرداد رأس المال",
    npvItem: "صافي القيمة الحالية (NPV)",
    lcoeItem: "التكلفة المتكافئة للكهرباء (LCOE)",
    financialsFootnote:
      "تتضمن الحسابات زيادة سنوية للتعرفة بنسبة {escalation}، وتراجع كفاءة الألواح بنسبة 0.55% سنوياً، وصيانة بنسبة 1.5% من التكلفة المبدئية، ومعدل خصم مالي 5.5%، و{netMeteringNote}",
    netMeteringYes: "تطبيق صافي القياس واحتساب رصيد تصدير الفائض.",
    netMeteringNo: "بدون احتساب رصيد لتصدير الفائض.",

    performanceRatioTitle: "معامل كفاءة النظام",
    totalLossesSub: "إجمالي المفاقيد {pct} — توزيع الضياعات الحرارية والتقنية",
    lossTemp: "الفقد الحراري (طقس عُمان)",
    lossSoiling: "تراكم الغبار والرمال",
    lossInverter: "مفاقيد العاكس الكهربائي",
    lossWiring: "مفاقيد التوصيلات والتفاوت",
    lossShading: "مفاقيد الظلال",
    lossOther: "مفاقيد فنية أخرى",
    multiplicativeLossNote:
      "ملاحظة: تُحسب المفاقيد بشكل تضاعفي على إجمالي الإشعاع الشمسي الساقط.",

    environmentalTitle: "الأثر البيئي والاستدامة",
    co2PerYrItem: "انبعاثات CO₂ المتفادية سنوياً",
    co2LifeItem: "إجمالي انبعاثات CO₂ المتفادية",
    treesItem: "ما يعادل زراعة أشجار",
    carsItem: "ما يعادل إزاحته من السيارات",
    gridFactorItem: "معامل انبعاثات شبكة الكهرباء",
    environmentalFootnote:
      "افترض الحساب امتصاص الشجرة لـ 21.77 كجم CO₂ سنوياً، وانبعاث 4.6 طن CO₂ سنوياً للمركبة. يعكس معامل انبعاثات الشبكة الاعتماد الرئيسي على الغاز الطبيعي في عُمان.",

    sdgTrackerTitle: "مؤشرات الأثر والاستدامة",
    sdgTrackerSub: "كيف يساهم هذا المشروع في تحقيق أهداف عُمان للاستدامة.",
    sdg7Ring: "الهدف 7 · طاقة نظيفة وبأسعار معقولة",
    sdg11Ring: "الهدف 11 · مدن ومجتمعات مستدامة",
    netZeroRing: "الحياد الصفري 2050 · سلطنة عُمان",
    selfSufficiencyBar:
      "نسبة الاكتفاء الذاتي من الطاقة (نسبة التغطية من السقف)",
    billOffsetBar: "نسبة الخفض المباشر للفاتورة",
    sdgFootnote:
      "يعكس المؤشر 7 نسبة التغطية الشمسية للاستهلاك؛ ويجمع المؤشر 11 بين الخفض المالي والاعتماد على الطاقة النظيفة؛ بينما يقيس مؤشر الحياد الصفري 2050 مساهمة مبنيتك في الهدف الوطني للحياد الصفري.",

    assumptionsTitle: "الافتراضات والمعايير المحسوبة",
    disclaimerFootnote:
      "هذه الحسابات لغرض التخطيط والاسترشاد فقط ولا تعتبر عرضاً مالياً أو تعاقدياً. احرص دائماً على طلب مسح فني ميداني وعروض من مقاولين مرخصين.",

    // Report Page
    reportMainTitle: "تقرير تقييم الطاقة الشمسية للأسطح",
    reportAlignedWith: "متوافق مع",
    noEstimateFound: "لم يتم العثور على تقييم سابق.",
    reportSec1Title: "1 · بيانات الموقع والنظام الشمسي",
    reportSec2Title: "2 · التوقعات المالية وإنتاج الطاقة",
    reportSec3Title: "3 · الأثر البيئي والاستدامة",
    reportYieldSummary:
      "إنتاج متوقع بمقدار {yield} كيلوواط ساعة لكل كيلوواط ذروة سنوياً بمعامل كفاءة {pr}، بعد احتساب الفقد الحراري الصيفي في عُمان ({tempLoss}) وتراكم الغبار ({soilingLoss}) والمفاقيد الفنية. تنخفض الفاتورة السنوية من {billWithout} إلى {billWith}.",
    reportTableYear: "السنة",
    reportTableGen: "الإنتاج (ك.و.س)",
    reportTableNetSavings: "صافي الوفر (ر.ع.)",
    reportTableCumulative: "إجمالي الوفر المتراكم (ر.ع.)",
    reportDisclaimerTitle: "تنويه هام:",
    reportDisclaimerBody:
      "هذا التقرير تقديري لأغراض التخطيط والدراسة الأولية فقط. يعتمد الإنتاج الفعلي على جودة التركيب وزوايا التوجيه والظلال ودقة اختيار المعدات. البيانات مستمدة من أطلس عُمان الشمسي وتعاريف نماء المعتمدة من هيئة تنظيم الخدمات العامة. تأكد من مراجعة الشركة الموزعة للكهرباء والحصول على استشارة هندسية قبل الشراء.",
    printPdfBtn: "تحميل / طباعة التقرير PDF",

    // Option Labels & Descriptions
    govMuscat: "مسقط",
    govDhofar: "ظفار",
    govBatinahNorth: "شمال الباطنة",
    govBatinahSouth: "جنوب الباطنة",
    govDakhiliyah: "الداخلية",
    govSharqiyahNorth: "شمال الشرقية",
    govSharqiyahSouth: "جنوب الشرقية",
    govDhahirah: "الظاهرة",
    govBuraimi: "البريمي",
    govMusandam: "مسندم",
    govWusta: "الوسطى",

    orientSouth: "جنوب",
    orientSoutheast: "جنوب شرقي",
    orientSouthwest: "جنوب غربي",
    orientEast: "شرق",
    orientWest: "غرب",
    orientMixed: "مختلط (شرق/غرب)",

    soilingLow: "غبار منخفض",
    soilingLowHint: "تنظيف دوري مستمر (كل 30 يوماً)",
    soilingMedium: "غبار عادي",
    soilingMediumHint: "دورة تنظيف قياسية (كل 60 يوماً)",
    soilingHigh: "غبار كثيف",
    soilingHighHint: "مناطق صحراوية / تنظيف متباعد (كل 120 يوماً)",

    tariffPrimary: "سكني – حساب أساسي (14 / 18 / 32 بيسة)",
    tariffAdditional: "سكني – حساب إضافي (22 / 26 / 32 بيسة)",
    tariffNonRes: "غير سكني – تعرفة ثابتة (25 بيسة)",
  },
} as const;

export type TranslationKeys = keyof (typeof DICT)["en"];
