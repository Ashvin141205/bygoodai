export interface Product {
  id: string;
  name: string;
  gujaratiName?: string;
  description: string;
  image: string;
  specifications: { [key: string]: string };
  packagingOptions: string[];
  bestFor: string;
  varietyCode: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
}

export interface Machine {
  id: string;
  name: string;
  purpose: string;
  workingProcess: string;
  benefits: string[];
  capacity: string;
  specs: { [key: string]: string };
  image: string;
}

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  details: string;
  icon: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: "seeds" | "processing" | "trading" | "general";
}

export interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "factory" | "machinery" | "cleaning" | "processing" | "seeds" | "warehouse" | "packaging" | "team";
  image: string;
  description: string;
}

export interface InfrastructureItem {
  id: string;
  name: string;
  description: string;
  features: string[];
  icon: string;
}

// ----------------- PRODUCTS DATA -----------------
export const products: Product[] = [
  {
    id: "seeds-gg20",
    name: "UV Seeds: GG-20 Premium Groundnut Seed",
    gujaratiName: "યુ.વી. સીડ્સ: જીજી-૨૦ પ્રીમિયમ મગફળી બીયારણ",
    description: "Saurashtra's most celebrated semi-spreading groundnut variety. Developed with high resistance to leaf spot and designed to deliver supreme yields. Meticulously graded to ensure bold, uniform seeds for automatic sowing drills.",
    image: "/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg",
    specifications: {
      "Germination Guarantee": "85% - 92% Vigor Checked",
      "Oil Concentration": "49.5% - 51%",
      "Cultivation Cycle": "115 - 120 Days",
      "Moisture Content": "7.0% Max (Oven Dried)",
      "Purity Rate": "99.9% Clean Seeds",
      "Pod Characteristics": "Medium to large size, high double-pod ratio"
    },
    packagingOptions: ["30 Kg Premium Labeled Gunny Bag", "50 Kg Moisture-Proof HDPE Bag"],
    bestFor: "Farmers in Gujarat seeking high-fleshed pod weight and strong vegetative crop vigor.",
    varietyCode: "GG-20"
  },
  {
    id: "seeds-gg2",
    name: "UV Seeds: GG-2 Early Maturity Groundnut Seed",
    gujaratiName: "યુ.વી. સીડ્સ: જીજી-૨ સુપર અર્લી બીયારણ",
    description: "An erect, bunch-type variety designed for short season cycles. Highly popular for quick monsoon cropping or dual cropping (Kharif and Summer). Features exceptionally thin shells which yield an excellent shelling percentage.",
    image: "/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg",
    specifications: {
      "Germination Guarantee": "88% - 93% Laboratory Certified",
      "Oil Concentration": "48% - 50%",
      "Cultivation Cycle": "100 - 105 Days (Fast harvest)",
      "Moisture Content": "6.8% Max",
      "Purity Rate": "99.9% Premium",
      "Soil Compatibility": "Light-sandy, medium loamy soils"
    },
    packagingOptions: ["30 Kg Premium Labeled Gunny Bag", "50 Kg Moisture-Proof HDPE Bag"],
    bestFor: "Farmers targeting summer irrigation cycles with low water availability.",
    varietyCode: "GG-2"
  },
  {
    id: "seeds-g22",
    name: "UV Seeds: G-22 Elite Cultivar Groundnut Seed",
    gujaratiName: "યુ.વી. સીડ્સ: જી-૨૨ ભીમકાય બીયારણ",
    description: "A robust variety renowned for its large pod profile and high resistance to crop collar rot. Specially polished and carefully selected through our vibrating screen graders for outstanding seed-to-pod ratio.",
    image: "/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg",
    specifications: {
      "Germination Guarantee": "86% - 90% Sprout Checked",
      "Oil Concentration": "50% - 52%",
      "Cultivation Cycle": "118 - 123 Days",
      "Moisture Content": "7.2% Max",
      "Purity Rate": "99.95% Triple Screened",
      "Kernel Grade": "Super Bold"
    },
    packagingOptions: ["30 Kg Premium Labeled Gunny Bag", "Custom Multi-wall Kraft Bags"],
    bestFor: "Traders and farmers looking to supply heavy-weight commercial bold peanuts.",
    varietyCode: "G-22"
  },
  {
    id: "bold-kernels",
    name: "Kirit Premium Bold Groundnut Kernels",
    gujaratiName: "કિરીટ પ્રીમિયમ બોલ્ડ સીંગદાણા",
    description: "Export-grade elongated large kernels. Cleaned of all dust, clods, and split skins using our latest optical sorters. Our bold peanut kernels conform to international food and phytosanitary quality benchmarks.",
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg",
    specifications: {
      "Size Counts": "38/42, 40/50, 50/60, 60/70 Counts per Ounce",
      "Moisture Index": "7.0% - 8.0% Max",
      "Foreign Admixture": "0.5% Max",
      "Aflatoxin Cap": "4 PPB Max (Strict EU Regulations)",
      "Damaged / Split Ratio": "0.2% Max"
    },
    packagingOptions: ["25 Kg Vacuum Pack Jute Bags", "50 Kg New Jute Bags", "1000 Kg Big Bulk Bags"],
    bestFor: "Global exporters, gourmet roasting brands, and large snacks processing plants.",
    varietyCode: "Bold Peanuts"
  },
  {
    id: "java-kernels",
    name: "Kirit Choice Java Groundnut Kernels",
    gujaratiName: "કિરીટ ચોઇસ જાવા સીંગદાણા",
    description: "Round, spherical-shaped kernels characterized by sweet natural oil concentration and beautiful pinkish skin. Extracted carefully using soft rubber sheller decorticators to avoid skin friction.",
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg",
    specifications: {
      "Size Counts": "50/60, 60/70, 70/80, 80/90, 140/160 Counts per Ounce",
      "Moisture Index": "7.5% Max",
      "Oil Concentration": "48% - 50.5%",
      "Aflatoxin Cap": "4 PPB Max",
      "Broken Kernels": "0.5% Max"
    },
    packagingOptions: ["25 Kg Vacuum Packed Jute Bags", "50 Kg Premium PP Laminated Bags"],
    bestFor: "Peanut butter manufacturing, confectionery mills, and oil expellers.",
    varietyCode: "Java Peanuts"
  },
  {
    id: "raw-mungfali",
    name: "In-Shell Raw Groundnut Pods",
    gujaratiName: "આખી મગફળી (ઇન-શેલ)",
    description: "Carefully sorted double-podded groundnuts sourced directly from Sondarda, Keshod and nearby Saurashtra APMC channels. Cleaned from soil clay, stems, and debris.",
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg",
    specifications: {
      "Pod Grade": "Double-kernel, thick shells",
      "Moisture Index": "8.0% Max",
      "Clay / Soil Clods": "0.1% Max",
      "Damaged Pods": "0.5% Max"
    },
    packagingOptions: ["35 Kg Open Jute Bags", "Bulk Container Loose Loading"],
    bestFor: "Local groundnut oil expellers, retail shellers, and direct snacking wholesalers.",
    varietyCode: "In-shell Pods"
  },
  {
    id: "peanut-splits",
    name: "Industrial Split Peanut Kernels",
    gujaratiName: "સીંગદાણા ફાડા (સ્પ્લીટ્સ)",
    description: "Clean split kernels obtained during our precise decortication process. Subjected to air classifiers and color sorting to ensure free from black-ended tips or mold.",
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg",
    specifications: {
      "Kernel Form": "50/50 Halves",
      "Purity Index": "99.8% Clean",
      "Moisture Index": "7.5% Max",
      "Damaged Seeds": "0.2% Max"
    },
    packagingOptions: ["25 Kg PP Bags", "50 Kg Jute Bags"],
    bestFor: "Chikki manufacturing, local snack makers, and bakeries.",
    varietyCode: "Splits"
  }
];

// ----------------- SERVICES DATA -----------------
export const services: Service[] = [
  {
    id: "cleaning",
    title: "Groundnut Cleaning",
    description: "Multi-stage air aspiration, pre-cleaning shakes, and magnetic screeners to completely extract clay clods, dirt, twigs, and rocks.",
    icon: "Filter",
    details: [
      "99.9% dust and stone extraction rates.",
      "High volume handling designed for massive agricultural arrivals.",
      "Ensures zero foreign physical bodies pass into final trading consignments."
    ]
  },
  {
    id: "processing",
    title: "Groundnut Processing & Shelling",
    description: "Gentle decortication via specialized rubber-cushioned shelling cylinders that crack pods without scratching or breaking seed skins.",
    icon: "Cpu",
    details: [
      "Minimizes splits to less than 2% of raw material volume.",
      "Integrated shell separation with heavy air dust classifiers.",
      "Hygienic processing chain with stainless steel contact elevators."
    ]
  },
  {
    id: "grading",
    title: "Groundnut Grading & Sizing",
    description: "Multiple screen-deck vibratory separators that segment kernels into exact counts-per-ounce, ensuring uniform roasting and boiling.",
    icon: "CheckSquare",
    details: [
      "Rigid sorting from 38/42 counts up to 140/160 counts.",
      "Perfect uniformity, ensuring consistent heating in commercial processing.",
      "Segregated collection pipelines for bold, java, splits, and baby kernels."
    ]
  },
  {
    id: "color-sorting",
    title: "Sensor-Based Color Sorting",
    description: "Ultra-fast CCD camera optical sorters detect and blast away shriveled, moldy, discolored, or damage-tipped kernels using micro air jets.",
    icon: "Eye",
    details: [
      "Detects subtle color anomalies associated with high aflatoxin risks.",
      "Processes up to 10 metric tons of groundnut per hour.",
      "Provides export-quality compliance for strict international specifications."
    ]
  },
  {
    id: "seed-processing",
    title: "Premium Seed Processing",
    description: "Rigorous laboratory testing for high-vigor seedling certification. Seeds are graded strictly for uniform shape to support automated drill sowers.",
    icon: "Sprout",
    details: [
      "Anti-fungal, insect-resistant premium dry seed treatments.",
      "Guaranteed 85%-92% germination testing in temperature-controlled chambers.",
      "Specially branded as UV Seeds, Saurashtra's farmers' trusted choice."
    ]
  },
  {
    id: "bulk-packaging",
    title: "Bulk & Vacuum Packaging",
    description: "Controlled environment bagging in heavy-gauge moisture-proof PP, traditional jute, or premium nitrogen-flushed vacuum sealed packs.",
    icon: "ShieldCheck",
    details: [
      "Vacuum packaging completely prevents lipid oxidation and rancidity.",
      "Weighing managed by automated high-precision electronic scale hoppers.",
      "Batch-stamped with barcoded tags for complete farm-to-shipping tracing."
    ]
  },
  {
    id: "custom-processing",
    title: "Custom Processing (Job Work)",
    description: "We offer customized high-volume job work for local traders, major agricultural exporter corporations, and leading local groundnut oil mills.",
    icon: "FolderSync",
    details: [
      "Transparent weight logging and shell-crushing recovery ratios.",
      "Custom screening layouts based on specific count requests.",
      "Flexible schedule coordination to match seasonal port-loading requirements."
    ]
  },
  {
    id: "quality-testing",
    title: "Laboratory Quality Testing",
    description: "Our fully equipped on-site testing division checks for moisture, aflatoxins, uniform sizing, split percentages, and seed vigor.",
    icon: "FileCheck",
    details: [
      "On-site fast-checking moisture meters for immediate cargo delivery.",
      "Phytosanitary documentation ready for commercial exporting.",
      "Regular third-party inspection certifications from SGS, Geo-Chem."
    ]
  },
  {
    id: "storage-dispatch",
    title: "Storage & Safe Dispatch",
    description: "Safe, humidity-monitored warehouse facilities featuring high clearance steel platforms to prevent moisture migration from ground concrete.",
    icon: "Warehouse",
    details: [
      "Damp-proof warehouse bases with heavy rat-proofing structures.",
      "Well-ventilated stacks using advanced thermal fans.",
      "Expedited shipping through hydraulic loading bays to ports (Mundra, Pipavav)."
    ]
  }
];

// ----------------- DETAILED MACHINERY DATA -----------------
export const machineryList: Machine[] = [
  {
    id: "pre-cleaner",
    name: "High-Volume Pre-Cleaner",
    purpose: "Primary separation of large physical impurities from newly harvested farm pods.",
    workingProcess: "Fitted with high-frequency vibrating scalping screens and powerful air suction hoods that draw light dust, straw, and leaves immediately, while letting heavy groundnut pods slide through.",
    benefits: [
      "Protects downstream machinery from wear and tear.",
      "Removes up to 98% of crop trash, leaves, and twigs on contact.",
      "Adjustable deck inclination to accommodate wet or dry crop conditions."
    ],
    capacity: "12 - 15 Tons per Hour",
    specs: {
      "Screen Dimensions": "1500 mm × 2000 mm",
      "Power Rating": "5.5 HP (3-Phase)",
      "Vibration Amplitude": "3.5 mm adjustable",
      "Aspiration Suction": "2400 Cubic Meters/Hour"
    },
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg"
  },
  {
    id: "destoner",
    name: "Industrial Dry De-Stoner",
    purpose: "High-precision extraction of stones, sand, and heavy metal bits of matching pod sizes.",
    workingProcess: "Uses localized pressurized fluidization. Air is blown up through a slanted screen deck. The heavy stones remain in contact with the screen and move upward, while the lighter groundnuts float downward.",
    benefits: [
      "Guarantees 100% stone and soil clod extraction.",
      "Essential for protecting subsequent hulling blades and human consumption safety.",
      "Closed air recycle loop to prevent dust leakage into the plant floor."
    ],
    capacity: "8 - 10 Tons per Hour",
    specs: {
      "Air Fan Motor": "7.5 HP",
      "Vibrator Motor": "1.5 HP × 2 Units",
      "Separation Ratio": "99.98% stone-free",
      "Aspiration Capacity": "3200 CFM"
    },
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg"
  },
  {
    id: "gravity-separator",
    name: "Pneumatic Gravity Separator",
    purpose: "Separating shriveled, light, or immature groundnuts from heavy, fully-developed pods.",
    workingProcess: "The machine fluidizes the product over a vibrating deck. Heavy, dense pods rise to the upper zone, while lighter, empty, insect-damaged, or shriveled pods slide to the lower discharge.",
    benefits: [
      "Crucial for ensuring seed germination vigor by selecting only heavy-weight kernels.",
      "Improves overall oil extraction yield ratios for industrial buyers.",
      "Extremely sensitive grading based on micro-densities."
    ],
    capacity: "5 - 7 Tons per Hour",
    specs: {
      "Deck Area": "2.8 Square Meters",
      "Deck Screen Material": "Heavy-duty wire mesh / synthetic option",
      "Tilt Angle": "Adjustable in 2 Planes (0 - 15 Degrees)",
      "Main Fan Power": "15 HP"
    },
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg"
  },
  {
    id: "air-classifier",
    name: "Cyclonic Air Classifier",
    purpose: "Removing light skins, fine dust, and empty shell husks during the cracking stage.",
    workingProcess: "Employs counter-current cyclonic airflows. Product falls down vertically through a chamber while high-velocity air passes horizontally, pulling away light skins into a dust collection cyclone.",
    benefits: [
      "Ensures zero paper-thin shells or red skins contaminate graded kernels.",
      "Maintains a healthy, breathable, dust-free environment on the factory floor.",
      "High filtration efficiency exceeding 99%."
    ],
    capacity: "10 Tons per Hour",
    specs: {
      "Cyclone Diameter": "1200 mm",
      "Blower Power": "10 HP",
      "Dust Bag Filter Count": "24 Bags (Self-Cleaning)"
    },
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg"
  },
  {
    id: "vibro-grader",
    name: "Vibratory Kernel Sizer (Grader)",
    purpose: "Segmenting shelled kernels into commercial sizing counts (e.g., 40/50, 50/60).",
    workingProcess: "Utilizes multi-deck screens arranged sequentially with decreasing perforation sizes. Shaken in an eccentric circular motion, kernels drop through corresponding screens into custom bins.",
    benefits: [
      "Achieves strict count-per-ounce accuracy for high-premium export sales.",
      "Low skin-friction vibrations preserve beautiful kernel skins intact.",
      "Quick-change screen mechanism to switch sizing templates in 15 minutes."
    ],
    capacity: "6 - 8 Tons per Hour",
    specs: {
      "Decks count": "4 Sorting Decks",
      "Stroke Length": "18 mm",
      "Drive Power": "3 HP Eccentric Drive",
      "Sieving Accuracy": "98.5% uniform sizing"
    },
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg"
  },
  {
    id: "rotary-grader",
    name: "Rotary Cylinder Drum Grader",
    purpose: "Longitudinal sorting of groundnuts to isolate splits and baby peanuts from main stocks.",
    workingProcess: "Groundnuts pass inside a slowly rotating drum with perforated slot plates. The splits and broken halves drop through the narrow slots, while premium full-kernels exit at the front.",
    benefits: [
      "Continuous high-speed flow with zero clogging.",
      "Produces a premium-grade, split-free whole kernel pack.",
      "Super low noise and mechanical maintenance requirements."
    ],
    capacity: "5 Tons per Hour",
    specs: {
      "Drum Diameter": "1000 mm",
      "Drum Length": "4000 mm",
      "Rotation Speed": "12 - 18 RPM",
      "Drive Motor": "2.2 kW"
    },
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg"
  },
  {
    id: "color-sorter",
    name: "Advanced CCD Optical Color Sorter",
    purpose: "Removing defective, yellowed, moldy, or aflatoxin-suspect kernels via AI vision.",
    workingProcess: "Kernels freefall in thin sheets. High-frequency CCD sensors scan both sides of each kernel. If a color anomaly is detected, an ultra-fast pneumatic air valve ejects that specific grain.",
    benefits: [
      "Achieves maximum purity levels necessary for direct snack food packing.",
      "Saves thousands of hours compared to slow and inaccurate manual hand-picking.",
      "Real-time analytics monitor average defect ratios in incoming crops."
    ],
    capacity: "6 - 10 Tons per Hour",
    specs: {
      "Chutes": "6 Channels (Buhler-style high resolution)",
      "Camera Tech": "Full RGB + NIR (Near Infrared) Dual Vision",
      "Nozzle Count": "384 Precision Air Ejectors",
      "Air Pressure Requirement": "7.0 Bar"
    },
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg"
  },
  {
    id: "bucket-elevator",
    name: "Z-Type Low-Friction Elevators",
    purpose: "Transporting kernels vertically between processing decks without skin abrasion.",
    workingProcess: "Fitted with food-grade plastic buckets that receive peanuts smoothly. Peanuts travel in pockets rather than being pushed through continuous screws, preventing mechanical bruising.",
    benefits: [
      "Reduces peanut splitting rates to near zero during transit.",
      "Fully enclosed casing keeps dust trapped.",
      "Self-cleaning base design prevents cross-batch seed contamination."
    ],
    capacity: "15 Tons per Hour",
    specs: {
      "Bucket Material": "High-Density Polyethylene (Food Grade)",
      "Height Clearance": "8.5 Meters",
      "Motor Power": "2.2 kW Geared Motor"
    },
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg"
  },
  {
    id: "seed-grader",
    name: "UV Seeds Gravity Grading Rig",
    purpose: "Selecting the plumpest, high-vitality groundnut seeds for planting (Biyaran).",
    workingProcess: "A specialized multi-step setup combining aspiration screens, density separators, and shape graders. Filters out seeds with small embryos or minor cracks that hinder growth.",
    benefits: [
      "Ensures 100% uniformity for planting with seed-drilling tractors.",
      "Vastly superior germination yields (above 88%).",
      "Maintains premium quality and trust under the UV Seeds label."
    ],
    capacity: "3 - 4 Tons per Hour",
    specs: {
      "Sorting Tolerance": "± 0.25 mm diameter",
      "Separation Stages": "3 Stage Air + Gravity Deck",
      "Power Load": "8.5 HP"
    },
    image: "/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg"
  },
  {
    id: "seed-treatment",
    name: "Automated Seed Treatment Unit",
    purpose: "Coating seeds with anti-fungal protectants and germination triggers.",
    workingProcess: "Seeds enter a rotary atomizing chamber. Liquid treatment is sprayed in a fine mist while the seeds tumble gently, ensuring thin, complete, and uniform skin coating.",
    benefits: [
      "Protects seeds from soil insects and white-grub attacks after planting.",
      "Gentle mixing avoids cracking the delicate groundnut shell or embryo.",
      "Precise dosing prevents seed chemical burn."
    ],
    capacity: "2 - 3 Tons per Hour",
    specs: {
      "Spray Mechanism": "Centrifugal Atomizer Disc",
      "Batch Timer": "Fully Automatic PLC Programmed",
      "Chemical Tank Capacity": "100 Liters"
    },
    image: "/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg"
  },
  {
    id: "moisture-meter",
    name: "High-Frequency Moisture Analyzer",
    purpose: "Instantaneous and non-destructive checking of groundnut moisture content.",
    workingProcess: "Applies a digital high-frequency capacitance field across a packed product sample. Reads dielectric constants instantly, yielding moisture percentages within seconds.",
    benefits: [
      "Crucial in checking arrivals at the loading dock to reject high-moisture stocks.",
      "Prevents mold, fungus, and toxic aflatoxin buildup in stored sacks.",
      "Highly portable; allows field testing at the farming source."
    ],
    capacity: "Instantaneous readings (5 seconds)",
    specs: {
      "Moisture Range": "3.0% to 40.0%",
      "Precision Variance": "± 0.1%",
      "Calibration Presets": "In-shell pods, bold kernels, java, seeds"
    },
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg"
  },
  {
    id: "weighing-stitching",
    name: "Electronic Bagging Hopper & Stitcher",
    purpose: "Automated packing, precise weight-metering, and heavy bag stitching.",
    workingProcess: "Groundnuts drop into an electronically calibrated hopper. Once the set weight (e.g. 50.00 kg) is hit, a gate opens to fill the sack. The sack travels along a slat conveyor into an automatic stitcher.",
    benefits: [
      "Ensures zero cargo weight discrepancies for wholesale B2B trust.",
      "Double-thread chain stitching prevents sack bursting during global export transit.",
      "Handles up to 350 bags per hour."
    ],
    capacity: "300 - 400 Bags per Hour",
    specs: {
      "Weighing Range": "10 Kg to 50 Kg",
      "Stitching Speed": "10 Meters/Minute",
      "Weighing Tolerance": "± 10 grams per 50 Kg bag"
    },
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg"
  }
];

// ----------------- INFRASTRUCTURE SECTIONS -----------------
export const infrastructure: InfrastructureItem[] = [
  {
    id: "factory-building",
    name: "Corporate Headquarters & Main Processing Shed",
    description: "A state-of-the-art pre-engineered structural steel building spanning over 45,000 sq. feet. Features anti-static, dust-extraction ducts, high ceilings for natural cooling, and food-grade epoxy floors.",
    features: ["45,000 Sq. Ft. Floor Area", "Epoxy dust-proof flooring", "Fully enclosed, pest-proof entry gates"],
    icon: "Building"
  },
  {
    id: "processing-plant",
    name: "Semi-Automated Decorticating & Sorting Area",
    description: "Hosts our primary shelling plant, eccentric grading decks, gravity separators, and high-speed Buhler-style CCD sorting chambers. All contact chutes are crafted from polished SS-304 stainless steel.",
    features: ["150 Metric Tons Daily Shelling Capacity", "Dual automated grading lines", "Complete SS-304 product contact channels"],
    icon: "Cpu"
  },
  {
    id: "warehouse",
    name: "Moisture-Controlled Storage Warehouses",
    description: "Massive storage barns designed with elevated wooden and steel pellet racking systems. High-capacity industrial air circulation fans maintain warehouse humidity strictly below 60% to protect seeds.",
    features: ["6,500 Metric Tons Storage Capacity", "Palletized damp-proofing arrangements", "Monitored humidity sensors"],
    icon: "Warehouse"
  },
  {
    id: "packing-area",
    name: "Hygienic Vacuum Sealing & Packing Bay",
    description: "A dust-free, sanitized zone where export bold and java peanuts undergo pneumatic vacuum sealing. Fitted with high-frequency nitrogen flushing tools to maintain peanut freshness for over 12 months.",
    features: ["Pneumatic high-vacuum sealers", "Automated batch code printers", "Nitrogen flushing technology"],
    icon: "ShieldCheck"
  },
  {
    id: "loading-dock",
    name: "Hydraulic Loading & Shipping Docks",
    description: "Configured with 4 hydraulic dock levelers. Allows heavy trailers and ocean shipping containers to park directly, facilitating quick, dust-free, and forklift-friendly cargo loading.",
    features: ["4 Hydraulic Dock levelers", "Forklift-friendly ramps", "Direct container backing access"],
    icon: "MapPin"
  },
  {
    id: "seed-unit",
    name: "Dedicated UV Seeds Processing Lab & Chamber",
    description: "An isolated division of Kirit Corporation focused solely on seed selection (Biyaran). Equipped with shape classifiers, seedling vigor germination tanks, and automated centrifugal seed coating mist dispensers.",
    features: ["Strict cross-contamination isolation", "Fungicide micro-coating plant", "Germination climate-control chambers"],
    icon: "Sprout"
  },
  {
    id: "qc-lab",
    name: "Laboratory & Phytosanitary Inspection Station",
    description: "Our in-house analytical division. Fully staffed with agricultural scientists who monitor seed embryo viability, check kernel moisture using capacitance meters, and run rapid ELISA test kits for aflatoxin.",
    features: ["Rapid Aflatoxin ELISA kit setups", "High-precision capacitance moisture meters", "Germination success auditing sheets"],
    icon: "FileCheck"
  },
  {
    id: "admin-office",
    name: "Corporate Administrative Block",
    description: "A multi-story office featuring modern conference rooms, real-time APMC trade monitors, visitor waiting lounges, and billing desks to facilitate smooth business deals for traders and farmers.",
    features: ["Real-time APMC crop price tickers", "B2B client meeting conference room", "Dedicated farmer relationship desks"],
    icon: "User"
  }
];

// ----------------- VISUAL WORKFLOW STEPS -----------------
export const workflowSteps: WorkflowStep[] = [
  {
    stepNumber: 1,
    title: "Raw Groundnut Inward",
    description: "Farm-fresh pods arrive from Keshod and Saurashtra fields, logged into our weight bridge and checked for initial crop quality.",
    details: "Moisture levels are instantly verified; pods above 10% are sent to natural sun-drying yards to protect quality.",
    icon: "Truck"
  },
  {
    stepNumber: 2,
    title: "Aspiration Cleaning",
    description: "Raw pods enter dry high-volume pre-cleaners. Heavy blowers pull away lightweight dirt, dry leaves, and straw.",
    details: "Extracts up to 98% of dust and loose straw particles before they enter structural machinery.",
    icon: "Wind"
  },
  {
    stepNumber: 3,
    title: "Soil & Stone Removal",
    description: "Pressurized fluidization de-stoners bounce groundnuts over high-tilt decks, separating heavy rocks, soil lumps, and stones.",
    details: "Ensures 100% stones are extracted, protecting human teeth and downstream rollers.",
    icon: "Grid"
  },
  {
    stepNumber: 4,
    title: "Calibrated Shelling",
    description: "Pods slide through soft shelling rollers. Shells are gently cracked, separating kernel nuts without scratching seed coats.",
    details: "Maintains raw whole-kernel yield above 98% while minimizing cracks and skin damage.",
    icon: "Cpu"
  },
  {
    stepNumber: 5,
    title: "Multi-Deck Size Grading",
    description: "Kernels are fed into eccentric shaker decks with graded sieves, sorting peanuts by counts-per-ounce (38/42 to 70/80).",
    details: "Provides uniform sizing, vital for commercial boiling, roasting, and consistent baking.",
    icon: "CheckSquare"
  },
  {
    stepNumber: 6,
    title: "AI Optical Color Sorting",
    description: "Full RGB + NIR cameras scan peanuts in free-fall. Defective, dark, or moldy kernels are blasted away via micro air jets.",
    details: "Senses color anomalies linked to aflatoxin risk, providing food-safe, premium export purity.",
    icon: "Eye"
  },
  {
    stepNumber: 7,
    title: "Phytosanitary Inspection",
    description: "Batches undergo manual audit and testing for moisture, oil content, and sizing variance.",
    details: "Certified fit by laboratory agronomists before being allocated to orders.",
    icon: "FileCheck"
  },
  {
    stepNumber: 8,
    title: "UV Seeds Elite Selection",
    description: "Seeds designated for farm sowing (Biyaran) undergo rigorous vitality testing and uniform shape check.",
    details: "Coated with crop protectants to secure high-vigor germination (85%+ guaranteed).",
    icon: "Sprout"
  },
  {
    stepNumber: 9,
    title: "Automated Packaging",
    description: "Kernels are packed in nitrogen-flushed vacuum bags, laminated PP bags, or traditional jute sacks.",
    details: "High-precision hoppers fill bags to exact gram specifications before double-stitch locking.",
    icon: "ShieldCheck"
  },
  {
    stepNumber: 10,
    title: "Logistical Dispatch",
    description: "Sacks are loaded via hydraulic docks directly onto shipping vehicles heading to Mundra or Pipavav ports.",
    details: "Every shipment includes a unique batch number, linking cargo back to its farming roots.",
    icon: "ExternalLink"
  }
];

// ----------------- FAQS DATA -----------------
export const faqs: FAQItem[] = [
  {
    question: "Where is Kirit Corporation located, and how can we arrange a plant visit?",
    answer: "Our modern corporate office and processing plant are located at Veraval Road, Opp. Shrinathji Weighbridge, Sondarda, Gujarat 362227, India. We are easily accessible from the Keshod-Junagadh highway. B2B buyers, wholesalers, and farming communities are welcome to visit for quality audits. Please schedule via our Contact form or call us directly.",
    category: "general"
  },
  {
    question: "What makes UV Seeds different from standard local groundnut seeds (Biyaran)?",
    answer: "UV Seeds is the specialized seed division of Kirit Corporation. Unlike raw groundnuts, UV Seeds are specifically grown and harvested in mature conditions, triple-graded for uniform weight, and climate-stored at 7% moisture to protect embryo health. We guarantee an outstanding germination rate of 85% - 92%, treated with protectants to secure early seedling vigor.",
    category: "seeds"
  },
  {
    question: "Do you supply groundnuts in vacuum packaging for international exports?",
    answer: "Yes. For premium bold and java peanut kernel exports, we highly recommend our advanced 25 Kg Jute-over-Vacuum bags or nitrogen-flushed packages. This completely stops moisture ingestion, eliminates rancidity risks, and preserves raw flavor during long sea freight voyages.",
    category: "trading"
  },
  {
    question: "Can local traders and oil mills book custom processing or job work at your plant?",
    answer: "Absolutely. Kirit Corporation offers premier groundnut cleaning, shelling, grading, and color sorting job work. We maintain clean weigh-bridge logs, track exact shell-to-kernel conversion ratios, and accommodate custom sizing screens based on your order sheets.",
    category: "processing"
  },
  {
    question: "What varieties of groundnut seed are offered by UV Seeds, and what are their seasonal sowing metrics?",
    answer: "We offer GG-20 (Gujarat Groundnut-20) which is semi-spreading and heavy-yielding; GG-2 (Erect short crop) ideal for dual Kharif & Summer cycles; and G-22 which produces super bold pods. Sowing metrics suggest 44-48 Kg of graded seed per acre, spaced roughly 18 inches by 4 inches.",
    category: "seeds"
  },
  {
    question: "How does your plant check for and handle aflatoxin contamination?",
    answer: "Aflatoxin is prevented first by rapid moisture screening at our receiving docks (rejecting cargo exceeding 10% moisture). Second, our advanced CCD optical color sorter scans every single grain in free-fall, ejecting the shriveled, dark, or moldy kernels which are prime carriers of aflatoxin. We also verify with laboratory ELISA testing.",
    category: "processing"
  },
  {
    question: "What are your bulk delivery timelines and payment conditions for national wholesalers?",
    answer: "For domestic shipments within India (Gujarat, Maharashtra, Rajasthan, South India), we load cargo within 3-5 working days from order confirmation. Payment terms are highly transparent and discussed based on volume, requiring standard bank guarantees or telegraphic transfers.",
    category: "trading"
  }
];

// ----------------- BLOG INSIGHTS -----------------
export const blogs: BlogItem[] = [
  {
    id: "blog-1",
    title: "Maximizing Groundnut Germination Vigor: UV Seeds Agronomist Guide",
    excerpt: "Discover the critical sowing depth, moisture benchmarks, and protective spacing layouts optimized for Saurashtra's rich black soil.",
    content: "Groundnut planting (Mugfali Biyaran) requires strict adherence to soil environment rules. For our popular GG-20 and G-22 seed lines, we advise planting at a depth of exactly 5 to 7 centimeters. Shallow sowing exposes seeds to bird forage, while sowing too deep (beyond 8 cm) depletes seed cotyledon energy before it breaks the soil crust. Sowing should ideally occur when the soil has received 50-70 mm of steady rainfall, ensuring moisture has penetrated 15 cm deep. Spacing should be kept at 45 cm between rows and 10 cm between plants, using calibrated pneumatic seed drills for absolute stand uniformity.",
    date: "June 28, 2026",
    readTime: "5 min read",
    category: "Farming Practices",
    author: "Ramanbhai Patel (Lead Agronomist)",
    image: "/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg"
  },
  {
    id: "blog-2",
    title: "Understanding Optical Color Sorting in Modern Groundnut Trading",
    excerpt: "How computer vision cameras and pneumatic air ejectors isolate defects instantly, securing premium export grade compliance.",
    content: "International B2B trading demands flawless peanut grading. Traditional hand-sorting is slow, expensive, and subject to human fatigue. Kirit Corporation's state-of-the-art optical color sorter uses high-resolution digital cameras combined with NIR (Near-Infrared) sensors. This system inspects thousands of grains per second in mid-air. When a kernel exhibits mold, fungal spots, splits, or shriveling, a pneumatic nozzle fires a localized pulse of compressed air, blasting the defect into a reject chute. This process reduces our defective kernel ratio to under 0.2%, ensuring complete compliance with European Union and Middle Eastern phytosanitary standards.",
    date: "May 15, 2026",
    readTime: "6 min read",
    category: "Industrial Technology",
    author: "Kiritbhai Patel (Managing Director)",
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg"
  },
  {
    id: "blog-3",
    title: "Safe Agricultural Warehousing: Shielding Pods from Dampness",
    excerpt: "Why keeping relative warehouse humidity below 60% and utilizing steel pallet grids is the key to preserving seed germination health.",
    content: "A groundnut seed is a living organism in a dormant state. If warehouse temperatures or relative humidity rise, the seed begins to breathe heavily, burning its internal oil reserves and generating metabolic heat. This results in standard mold development and a fatal drop in seed germination percentage. At Kirit Corporation, we enforce three strict warehousing policies: First, all bags must sit on plastic or wood-surfaced steel pallets, elevated 15 cm above concrete floors to block dampness. Second, we maintain 1.5-meter separation corridors between stacks to allow natural ventilation. Third, we run continuous computerized digital moisture logs on every stored stack.",
    date: "April 08, 2026",
    readTime: "4 min read",
    category: "Quality Control",
    author: "Hiteshbhai Patel (Warehouse Operations)",
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg"
  }
];

// ----------------- GALLERY ITEMS -----------------
export const galleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Kirit Corporation Processing Shed",
    category: "factory",
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg",
    description: "External view of our bulk industrial groundnut decorticating facility in Sondarda."
  },
  {
    id: "gal-2",
    title: "Advanced CCD Color Sorters",
    category: "machinery",
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg",
    description: "High-resolution optical sorting chutes that remove defects using pressurized air blasts."
  },
  {
    id: "gal-3",
    title: "Vibro Screening Sizers",
    category: "cleaning",
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg",
    description: "Vibrating deck screeners segregating commercial peanut sizes."
  },
  {
    id: "gal-4",
    title: "Shelled Bold Kernels",
    category: "processing",
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg",
    description: "Clean, export-grade Bold peanut kernels (50/60 count) ready for delivery."
  },
  {
    id: "gal-5",
    title: "UV Seeds GG-20 Biyaran",
    category: "seeds",
    image: "/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg",
    description: "Highly selected, treated groundnut seeds certified for farmer crop planting."
  },
  {
    id: "gal-6",
    title: "Humidity-Controlled Warehouse",
    category: "warehouse",
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg",
    description: "Palletized cargo stacking to protect seeds from ground moisture."
  },
  {
    id: "gal-7",
    title: "Nitrogen-Flushed Packing Bay",
    category: "packaging",
    image: "/src/assets/images/hero_processing_plant_1783339503473.jpg",
    description: "Automated hoppers packaging groundnut seeds in moisture-proof HDPE sacks."
  },
  {
    id: "gal-8",
    title: "UV Seeds Germination Check",
    category: "seeds",
    image: "/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg",
    description: "Agronomists verifying seedling vigor and growth rate in testing pots."
  },
  {
    id: "gal-9",
    title: "Our Plant Operations Team",
    category: "team",
    image: "/src/assets/images/peanut_kernels_graded_1783339532338.jpg",
    description: "Skilled machinery operators and quality control engineers at Sondarda facility."
  }
];
