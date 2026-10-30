export type Language = 'ar' | 'en';

export interface Translations {
  brandTitle: string;
  brandBadge: string;
  brandSubtitle: string;
  statusIK: string;
  statusEMG: string;
  tooltipAudio: string;
  tooltipTheme: string;
  tooltipLang: string;
  btnExportDossier: string;
  telemetryTag: string;
  labelGripAngle: string;
  labelTotalTorque: string;
  labelActuators: string;
  camFront: string;
  camTop: string;
  camSide: string;
  camIso: string;
  toolRotate: string;
  toolWireframe: string;
  toolExplode: string;
  toolReset: string;
  materialChassis: string;
  matCarbon: string;
  matTitanium: string;
  matAnodized: string;
  matObsidian: string;
  emgTitle: string;
  emgSim: string;
  emgBurst: string;
  ch1Name: string;
  ch2Name: string;
  ch3Name: string;
  emgAmp: string;
  emgMedFreq: string;
  emgSNR: string;
  tactileTitle: string;
  fingerThumb: string;
  fingerIndex: string;
  fingerMiddle: string;
  fingerRing: string;
  fingerPinky: string;
  tabKinematics: string;
  tabNeural: string;
  tabPower: string;
  presetTitle: string;
  presetFist: string;
  descFist: string;
  presetPinch: string;
  descPinch: string;
  presetPoint: string;
  descPoint: string;
  presetHook: string;
  descHook: string;
  presetPeace: string;
  descPeace: string;
  presetNeutral: string;
  descNeutral: string;
  jointSlidersTitle: string;
  btnFlexAll: string;
  wristPitch: string;
  wristYaw: string;
  neuralDecoderTitle: string;
  neuralDesc: string;
  neuralThreshold: string;
  neuralFilter: string;
  patternTitle: string;
  patternDetectedLabel: string;
  powerTitle: string;
  battVoltage: string;
  battCurrent: string;
  battTemp: string;
  battRuntime: string;
  pmodeBalanced: string;
  pmodeBalancedDesc: string;
  pmodePerf: string;
  pmodePerfDesc: string;
  pmodeEco: string;
  pmodeEcoDesc: string;
  architectRole: string;
  architectName: string;
  architectProject: string;
  dossierBadge: string;
  dossierTitle: string;
  lblPatientName: string;
  lblPatientId: string;
  lblAmputation: string;
  lblProstheticModel: string;
  colMetric: string;
  colValue: string;
  colStatus: string;
  metLatency: string;
  metGripPower: string;
  metChassis: string;
  metChannels: string;
  metSensory: string;
  tagCertified: string;
  qrDocId: string;
  sigTitle: string;
  sigRole: string;
  btnPrint: string;
  btnCelebrate: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    brandTitle: "هَـيْـكَل",
    brandBadge: "HAYKAL-MK.IX",
    brandSubtitle: "معمل الأطراف السيبرانية الحركية والهياكل الحيوية ثلاثية الأبعاد",
    statusIK: "الكينماتيكا: نشطة",
    statusEMG: "رابط EMG: 1.2 كيلوهرتز",
    tooltipAudio: "الصوت السيبراني",
    tooltipTheme: "المظهر",
    tooltipLang: "Switch to English",
    btnExportDossier: "ملف المعايرة السريرية",
    telemetryTag: "القياس الحركي المباشر",
    labelGripAngle: "زاوية القبضة",
    labelTotalTorque: "العزم الإجمالي",
    labelActuators: "المحركات",
    camFront: "أمام",
    camTop: "أعلى",
    camSide: "جانب",
    camIso: "3D مجسم",
    toolRotate: "دوران",
    toolWireframe: "أشعة سينية",
    toolExplode: "تفكيك الهيكل",
    toolReset: "إعادة ضبط",
    materialChassis: "مادة الهيكل الخارجي",
    matCarbon: "كربون مقوى",
    matTitanium: "تيتانيوم طيران",
    matAnodized: "مؤكسد سيبراني",
    matObsidian: "سبج غير لامع",
    emgTitle: "الإشارات العضلية الحيوية (Surface EMG)",
    emgSim: "مُحاكاة حية متزامنة",
    emgBurst: "نبضة جهد عالي",
    ch1Name: "CH1: العاطفة السطحية",
    ch2Name: "CH2: الباسطة المشتركة",
    ch3Name: "CH3: مُبعدة الإبهام",
    emgAmp: "السعة:",
    emgMedFreq: "التردد الوسيط:",
    emgSNR: "نسبة الإشارة/الضجيج:",
    tactileTitle: "مصفوفة الضغط اللمسي للأطراف",
    fingerThumb: "إبهام",
    fingerIndex: "سبابة",
    fingerMiddle: "وسطى",
    fingerRing: "بنصر",
    fingerPinky: "خنصر",
    tabKinematics: "التحكم الحركي",
    tabNeural: "المعايرة العصبية",
    tabPower: "الطاقة والبطارية",
    presetTitle: "أنماط القبضة الحركية المسبقة",
    presetFist: "قبضة القوة الكاملة",
    descFist: "عزم إمساك قوي للأحمال الثقيلة",
    presetPinch: "الالتقاط الدقيق (Pinch)",
    descPinch: "ملاقاة الإبهام والسبابة للأجسام الدقيقة",
    presetPoint: "الإشارة والشاشة اللمسية",
    descPoint: "تمديد السبابة للضغط على الشاشات",
    presetHook: "قبضة الخطاف والحقائب",
    descHook: "انحناء السلاميات لحمل المقابض",
    presetPeace: "إشارة النصر / حيادية",
    descPeace: "انفراج السبابة والوسطى بحركة متزنة",
    presetNeutral: "البسط والاسترخاء التام",
    descNeutral: "فتح كامل للسلاميات 0% انثناء",
    jointSlidersTitle: "التحكم الدقيق في انثناء الأصابع الفردية",
    btnFlexAll: "قبض الكل (100%)",
    wristPitch: "إمالة المعصم (Pitch)",
    wristYaw: "دوران المعصم (Yaw)",
    neuralDecoderTitle: "مفكك الشفرات العصبية العضلية",
    neuralDesc: "معايرة عتبات التحفيز الكهربائي للأقطاب السطحية (Surface Electrodes) لربط إشارات العضلات بالحركة الميكانيكية التلقائية.",
    neuralThreshold: "عتبة التشغيل العصبية:",
    neuralFilter: "معدل تنقية الضجيج (Kalman):",
    patternTitle: "التعرف على نمط الانقباض:",
    patternDetectedLabel: "النمط المكتشف:",
    powerTitle: "إدارة خلايا الطاقة والجهد",
    battVoltage: "الجهد الاسمي:",
    battCurrent: "السحب الحالي:",
    battTemp: "درجة الحرارة:",
    battRuntime: "العمر التشغيلي المتبقي:",
    pmodeBalanced: "متزن",
    pmodeBalancedDesc: "أداء سلس واستهلاك طبيعي",
    pmodePerf: "عزم فائق",
    pmodePerfDesc: "سرعة حركة واستجابة قصوى",
    pmodeEco: "توفير الطاقة",
    pmodeEcoDesc: "إطالة عمر الشحن حتى 24 ساعة",
    architectRole: "المطور والمصمم المعماري للأنظمة",
    architectName: "أ. طارق ابوعشي",
    architectProject: "معمل الأطراف والذكاء الميكانيكي الحيوي",
    dossierBadge: "وثيقة طبية حيوية رسمية",
    dossierTitle: "تقرير المعايرة الكينماتيكية للمريض",
    lblPatientName: "اسم المريض / المستفيد:",
    lblPatientId: "الرقم الطبي (Medical ID):",
    lblAmputation: "مستوى البتر / الحالة:",
    lblProstheticModel: "طراز الطرف المبرمج:",
    colMetric: "المعيار الحركي",
    colValue: "القيمة المعايرة",
    colStatus: "الحالة",
    metLatency: "زمن استجابة المحركات (Actuator Latency)",
    metGripPower: "عزم القبضة القصوى (Peak Torque)",
    metChassis: "مادة الهيكل الخارجي (Chassis Material)",
    metChannels: "قنوات الاستشعار العضلي (EMG Array)",
    metSensory: "التغذية الراجعة اللمسية (Haptic Feedback)",
    tagCertified: "معتمد طبياً",
    qrDocId: "وثيقة مشفرة رقمياً",
    sigTitle: "رئيس الفريق والمعماري المسؤول:",
    sigRole: "أخصائي الأطراف والأنظمة السيبرانية الحركية",
    btnPrint: "طباعة وحفظ التقرير (PDF)",
    btnCelebrate: "اعتماد المعايرة واختبار الاستجابة"
  },
  en: {
    brandTitle: "HAYKAL",
    brandBadge: "HAYKAL-MK.IX",
    brandSubtitle: "Cybernetic Bionic Prosthetics & Exoskeleton 3D Atelier",
    statusIK: "Kinematics: ACTIVE",
    statusEMG: "EMG Link: 1.2 kHz",
    tooltipAudio: "Cyber Acoustic Engine",
    tooltipTheme: "Theme Mode",
    tooltipLang: "التحويل للعربية",
    btnExportDossier: "Clinical Calibration Dossier",
    telemetryTag: "REAL-TIME TELEMETRY",
    labelGripAngle: "Grip Angle",
    labelTotalTorque: "Total Torque",
    labelActuators: "Actuators",
    camFront: "Front",
    camTop: "Top",
    camSide: "Side",
    camIso: "Isometric",
    toolRotate: "Rotate",
    toolWireframe: "X-Ray",
    toolExplode: "Inspect Chassis",
    toolReset: "Reset Pose",
    materialChassis: "Chassis Material Finish",
    matCarbon: "Forged Carbon",
    matTitanium: "Titanium Gr.5",
    matAnodized: "Cyber Anodized",
    matObsidian: "Stealth Obsidian",
    emgTitle: "Surface Electromyography (sEMG)",
    emgSim: "Synchronized Live Stream",
    emgBurst: "Induce Spike Burst",
    ch1Name: "CH1: Flexor Digitorum",
    ch2Name: "CH2: Extensor Digitorum",
    ch3Name: "CH3: Abductor Pollicis",
    emgAmp: "Amplitude:",
    emgMedFreq: "Median Freq:",
    emgSNR: "Signal-to-Noise:",
    tactileTitle: "Fingertip Tactile Pressure Matrix",
    fingerThumb: "Thumb",
    fingerIndex: "Index",
    fingerMiddle: "Middle",
    fingerRing: "Ring",
    fingerPinky: "Pinky",
    tabKinematics: "Kinematics",
    tabNeural: "Neural Decoding",
    tabPower: "Power & Cells",
    presetTitle: "Kinematic Grip Presets",
    presetFist: "Power Fist Grip",
    descFist: "Full torque for heavy payloads",
    presetPinch: "Precision Pinch",
    descPinch: "Opposed thumb-index for fine objects",
    presetPoint: "Interface / Pointing",
    descPoint: "Extended index for touchscreens",
    presetHook: "Hook / Tool Grip",
    descHook: "Curled phalanges for handle carrying",
    presetPeace: "Victory / Neutral V",
    descPeace: "Balanced cyber extension pose",
    presetNeutral: "Full Extension",
    descNeutral: "0% flexion across all joints",
    jointSlidersTitle: "Individual Joint Flexion Tuning",
    btnFlexAll: "Flex All (100%)",
    wristPitch: "Wrist Pitch",
    wristYaw: "Wrist Yaw",
    neuralDecoderTitle: "Neuromuscular Decoder Engine",
    neuralDesc: "Calibrate sEMG electrode firing thresholds to decode motor intent into low-latency robotic actuation.",
    neuralThreshold: "Neural Firing Threshold:",
    neuralFilter: "Kalman Filter Efficiency:",
    patternTitle: "Contraction Pattern Recognition:",
    patternDetectedLabel: "Identified Pattern:",
    powerTitle: "Bionic Battery & Power Management",
    battVoltage: "Nominal Voltage:",
    battCurrent: "Current Draw:",
    battTemp: "Core Temp:",
    battRuntime: "Remaining Runtime:",
    pmodeBalanced: "Balanced",
    pmodeBalancedDesc: "Smooth response, standard consumption",
    pmodePerf: "High Torque",
    pmodePerfDesc: "Max speed & instant actuation",
    pmodeEco: "Eco Power",
    pmodeEcoDesc: "Extends runtime up to 24 hours",
    architectRole: "Lead Systems Architect & Creator",
    architectName: "Tareq Abuashi",
    architectProject: "Bionic Cybernetics & Exoskeleton Atelier",
    dossierBadge: "OFFICIAL CLINICAL DOSSIER",
    dossierTitle: "Patient Biomechanical Calibration Dossier",
    lblPatientName: "Patient / Subject Name:",
    lblPatientId: "Medical ID:",
    lblAmputation: "Amputation Level / Indication:",
    lblProstheticModel: "Prosthetic Model:",
    colMetric: "Biomechanical Metric",
    colValue: "Calibrated Value",
    colStatus: "Status",
    metLatency: "Actuator Latency",
    metGripPower: "Peak Grip Torque",
    metChassis: "Chassis Material",
    metChannels: "EMG Sensory Array",
    metSensory: "Fingertip Tactile Array",
    tagCertified: "Certified",
    qrDocId: "Digitally Encrypted Dossier",
    sigTitle: "Chief Biomechanical Engineer:",
    sigRole: "Prosthetics & Cybernetics Specialist",
    btnPrint: "Print & Export PDF",
    btnCelebrate: "Certify & Test Actuation"
  }
};
