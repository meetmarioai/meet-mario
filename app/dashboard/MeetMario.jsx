import { useState, useRef, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
const FF="'SF Mono','Fira Mono',monospace",FX="flex",CP="pointer";
const P = {
 name: "", dob: "07/21/1960",
 testDate: "April 8, 2024", labId: "",
 age: 64, sex: "female", hormonalStatus: "post-menopausal",
 conditions: ["Candida (mild)", "Whey sensitivity (moderate)", "ALCAT food protocol"],
 severe: ["BEEF","BLACK TEA","BELL PEPPER","BRUSSELS SPROUT","CABBAGE","CANOLA OIL","CAPERS","CAULIFLOWER","CHICKPEA","CILANTRO","COFFEE","CUMIN","ENDIVE","GARLIC","GREEN TEA","HONEYDEW MELON","JALAPEÑO PEPPER","LOBSTER","MONK FRUIT","MULBERRY","ONION","PINTO BEAN","PISTACHIO","POPPY SEED","RICE (ALL)","SCALLION","SEA BASS","TOMATO","WAKAME SEAWEED","EGG WHITE"],
 moderate: ["ACORN SQUASH","ALLSPICE","AMARANTH","ANCHOVY","APPLE","APRICOT","BANANA","BARLEY","BLACK BEANS","BLACK CURRANT","BLACKBERRY","BOSTON BIBB LETTUCE","BUCKWHEAT","CANNELLINI BEANS","CARDAMOM","CASHEW","CATFISH","CAYENNE PEPPER","CELERY","CHERRY","CHIA","CHICKEN","CHIVES","CLOVE","COCOA","CODFISH","CORN","CRAB","CRANBERRY","CUCUMBER","DATE","DILL","DRAGON FRUIT","DUCK","EGGPLANT","FAVA BEAN","FIG","FLAXSEED","GRAPEFRUIT","GREEN PEA","GROUPER","HADDOCK","HALIBUT","HORSERADISH","ICEBERG LETTUCE","KALE","KELP","KIDNEY BEAN","KIWI","LAMB","LEMON","LIMA BEAN","LICORICE","LIME","MACADAMIA","MACKEREL","MAHI MAHI","MALT","MANGO","MILLET","MUSSEL","MUSTARD GREENS","MUSTARD SEED","NAVY BEAN","NECTARINE","NORI","OAT (GLUTEN FREE)","OKRA","OLIVE","OREGANO","PAPRIKA","PARSNIP","PEACH","PECAN","PEAR","PEPPERMINT","PINE NUT","PINEAPPLE","PLUM","POLLOCK","POMEGRANATE","PORTOBELLO MUSHROOM","PUMPKIN","QUINOA","RASPBERRY","RED BEET","ROMAINE LETTUCE","ROSEMARY","RUTABAGA","RYE","SAGE","SALMON","SESAME","SHRIMP","SNAPPER","SOLE","SORGHUM","SOYBEAN","SPELT","SPINACH","STRAWBERRY","STRING BEAN","SUNFLOWER","SWEET POTATO","SWISS CHARD","TAPIOCA","TARRAGON","TARO ROOT","TEFF","THYME","TILAPIA","TUNA","TURNIP","VANILLA","VEAL","VENISON","WALNUT","WATER CHESTNUT","WATERCRESS","WATERMELON","WHEAT","YELLOW SQUASH","ZUCCHINI"],
 mild: ["ALMOND","ARROWROOT","ASPARAGUS","AVOCADO","BAY LEAF","BLACK PEPPER","BLACK-EYED PEA","BLUEBERRY","BOK CHOY","BRAZIL NUT","BUTTON MUSHROOM","CANTALOUPE","CAROB","CARROT","CHAMOMILE","CHICORY","CINNAMON","CLAM","COCONUT","COLLARD GREENS","CORIANDER SEED","DANDELION LEAF","EGG YOLK","FENNEL SEED","FLOUNDER","GINGER","GRAPE","GUAVA","HAZELNUT","HEMP","LEAF LETTUCE","LEEK","LENTIL BEAN","MUNG BEAN","NUTMEG","ORANGE","OYSTER","PAPAYA","PARSLEY","PEANUT","PLANTAIN","PORK","RADISH","RHUBARB","SAFFLOWER","SAFFRON","SARDINE","SCALLOP","SHIITAKE MUSHROOM","STEVIA","SWORDFISH","TANGERINE","TROUT","TURKEY","TURMERIC","WHITE POTATO","WILD RICE"],
 alsoAvoid: {
  candida: ["SUGAR","HONEY","MAPLE SYRUP","AGAVE","MOLASSES","BAKER'S YEAST","BREWER'S YEAST","NUTRITIONAL YEAST","WINE","BEER","VINEGAR"],
  whey: ["COW'S MILK","GOAT'S MILK","SHEEP'S MILK","WHEY PROTEIN"],
 },
};
const ROT = {
 1: { grains:["Arrowroot","Oat (GF)","Spelt","Tapioca","White potato"], veg:["Artichoke","Black-eyed pea","Butternut squash","Carrot","Eggplant","Fava bean","Kale","Leaf lettuce","Mustard greens","Romaine","Rutabaga","Yellow squash"], fruit:["Banana","Black currant","Date","Fig","Guava","Kiwi","Lemon","Mango","Papaya","Star fruit","Strawberry"], protein:["Bison","Codfish","Crab","Lamb","Oyster","Sardine","Snapper","Swordfish"], misc:["Bay leaf","Caraway","Cashew","Chamomile","Chia","Chicory","Coconut","Coriander seed","Flaxseed","Parsley","Rosemary","Safflower","Turmeric"] },
 2: { grains:["Barley","Millet","Rye","Wheat","Wild rice"], veg:["Bok choy","Broccoli","Button mushroom","Chives","Lentil bean","Shiitake mushroom","Zucchini"], fruit:["Apple","Avocado","Blueberry","Cranberry","Dragon fruit","Pear","Pineapple","Tangerine"], protein:["Catfish","Chicken","Egg yolk","Mackerel","Mahi mahi","Tilapia","Tuna"], misc:["Almond","Basil","Cinnamon","Ginger","Hazelnut","Hemp","Mustard seed","Paprika","Peppermint","Saffron"] },
 3: { grains:["Corn","Quinoa","Sorghum","Sweet potato"], veg:["Arugula","Asparagus","Black beans","Collard greens","Green pea","Horseradish","Leek","Lima bean","Mung bean","Navy bean","Radish","String bean","Watercress"], fruit:["Apricot","Blackberry","Cherry","Grape","Nectarine","Peach","Plantain","Plum","Raspberry"], protein:["Duck","Grouper","Halibut","Pollock","Pork","Sole"], misc:["Brazil nut","Carob","Cocoa","Dill","Macadamia","Oregano","Peanut","Pine nut","Sunflower","Tarragon","Thyme","Vanilla"] },
 4: { grains:["Buckwheat","Teff"], veg:["Cannellini beans","Dandelion leaf","Okra","Portobello mushroom","Red beet","Rhubarb","Spaghetti squash","Spinach","Swiss chard","Turnip","Water chestnut"], fruit:["Cantaloupe","Grapefruit","Lychee","Orange","Persimmon","Pumpkin","Watermelon"], protein:["Clam","Haddock","Mussel","Salmon","Scallop","Shrimp","Trout","Turkey","Veal","Venison"], misc:["Black pepper","Nutmeg","Pecan","Sesame","Spearmint","Walnut"] },
};
const MEALS = {
 1: {
  breakfast:{base:"GF oat porridge — banana, coconut milk, cashews",isProtein:false},
  snack1:{base:"Kiwi + whole cashews",isProtein:false},
  lunch:{base:"Butternut squash & kale, tapioca",defaultP:"Bison",methods:{"Bison":"grilled patties","Codfish":"pan-seared","Crab":"flaked in tallow","Lamb":"grilled chops","Sardine":"baked whole","Snapper":"baked fillet","Swordfish":"grilled steak","Oyster":"seared"},sides:"lemon-flaxseed",isProtein:true},
  snack2:{base:"Guava + carrot sticks",isProtein:false},
  dinner:{base:"White potato mash, mustard greens",defaultP:"Sardine",methods:{"Bison":"braised","Codfish":"parchment bake","Crab":"steamed","Lamb":"roasted","Sardine":"baked whole","Snapper":"pan-seared","Swordfish":"grilled","Oyster":"seared"},sides:"rosemary & bay leaf",isProtein:true},
  snack3:{base:"Chamomile tea + chia crackers",isProtein:false},
 },
 2: {
  breakfast:{base:"Millet porridge — cinnamon, blueberries, almond butter",isProtein:false},
  snack1:{base:"Apple slices + hazelnut butter",isProtein:false},
  lunch:{base:"Bok choy & shiitake, rye crispbread",defaultP:"Chicken",methods:{"Catfish":"pan-fried","Chicken":"pan-roasted","Egg yolk":"soft-boiled","Mackerel":"grilled","Mahi mahi":"seared","Tilapia":"baked","Tuna":"seared"},sides:"ginger-lemon",isProtein:true},
  snack2:{base:"Tangerine + almonds",isProtein:false},
  dinner:{base:"Barley pilaf, broccoli",defaultP:"Mackerel",methods:{"Catfish":"parchment","Chicken":"roasted","Egg yolk":"poached","Mackerel":"grilled","Mahi mahi":"baked","Tilapia":"seared","Tuna":"seared rare"},sides:"wild rice crackers",isProtein:true},
  snack3:{base:"Pear + wild rice crackers",isProtein:false},
 },
 3: {
  breakfast:{base:"Quinoa porridge — cherry compote, cocoa nibs",isProtein:false},
  snack1:{base:"Blackberry + pine nuts",isProtein:false},
  lunch:{base:"Sweet potato purée, navy bean stew",defaultP:"Pork",methods:{"Duck":"confit leg","Grouper":"seared","Halibut":"baked","Pollock":"poached","Pork":"tenderloin","Sole":"pan-fried"},sides:"avocado oil drizzle",isProtein:true},
  snack2:{base:"Nectarine + peanut butter",isProtein:false},
  dinner:{base:"Green pea mash, arugula-asparagus salad",defaultP:"Halibut",methods:{"Duck":"roasted","Grouper":"baked","Halibut":"corn-crust","Pollock":"steamed","Pork":"grilled","Sole":"meunière"},sides:"raspberry-lime vinaigrette",isProtein:true},
  snack3:{base:"Raspberry + carob",isProtein:false},
 },
 4: {
  breakfast:{base:"Buckwheat pancakes — pumpkin compote, walnut crumble",isProtein:false},
  snack1:{base:"Cantaloupe + pecans",isProtein:false},
  lunch:{base:"Spaghetti squash, cannellini beans",defaultP:"Turkey",methods:{"Clam":"steamed","Haddock":"baked","Mussel":"steamed","Salmon":"baked","Scallop":"seared","Shrimp":"sautéed","Trout":"baked","Turkey":"pan-cooked","Veal":"escalope","Venison":"grilled"},sides:"walnut oil",isProtein:true},
  snack2:{base:"Persimmon + sesame seeds",isProtein:false},
  dinner:{base:"Teff, wilted spinach, red beet salad",defaultP:"Trout",methods:{"Clam":"steamed","Haddock":"seared","Mussel":"broth","Salmon":"baked","Scallop":"caramelised","Shrimp":"grilled","Trout":"baked","Turkey":"roasted","Veal":"braised","Venison":"seared"},sides:"grapefruit-walnut",isProtein:true},
  snack3:{base:"Watermelon + spearmint tea",isProtein:false},
 },
};
const SYMPTOM_CATS = {
 digestive: { label:"Digestive",      icon:"🫁", items:["Bloating","Cramping","Nausea","Gas","Reflux","Loose stools","Stomach pain"] },
 skin:      { label:"Skin",           icon:"🌡️", items:["Flushing","Itching","Rash","Hives","Puffiness","Swelling"] },
 neuro:     { label:"Neurological",   icon:"🧠", items:["Brain fog","Headache","Dizziness","Fatigue spike","Mood drop","Anxiety"] },
 joints:    { label:"Joints/Muscles", icon:"🦴", items:["Joint stiffness","Muscle aches","Back pain","Neck tension","Swollen fingers"] },
 cardiac:   { label:"Cardiac/Resp",   icon:"❤️", items:["Heart racing","Shortness of breath","Chest tightness","Sinus congestion","Runny nose"] },
};
function simulateMealResponse(hadReactive) {
 const pts = [];
 for (let m = 0; m <= 120; m += 3) {
  const t = m / 120;
  const curve = t < 0.3 ? t / 0.3 : t < 0.6 ? 1 : Math.max(0, (1 - t) / 0.4);
  const rx = hadReactive ? 2.2 + Math.random() * 0.6 : 1;
  const n = () => (Math.random() - 0.5);
  pts.push({
   min: m,
   hr:      Math.round(68  + 14 * rx * curve + n() * 2),
   hrv:     Math.round(55  - (hadReactive ? 22 : 6) * curve + n() * 2),
   temp:    +((36.5 + (hadReactive ? 0.6 : 0.08) * curve + n() * 0.03)).toFixed(2),
   glucose: Math.round(82  + (hadReactive ? 58 : 22) * curve + n() * 3),
   spo2:    +((98 - (hadReactive ? 1.8 : 0.2) * curve + n() * 0.1)).toFixed(1),
  });
 }
 return pts;
}

function detectSpikes(pts) {
 if (!pts || pts.length < 4) return [];
 const b = pts[0]; const spikes = [];
 pts.forEach((p, i) => {
  if (i < 3) return;
  if (p.hr - b.hr >= 22 && !spikes.find(s => s.m === "hr"))
   spikes.push({ min: p.min, m: "hr", label: "Heart Rate spike", val: `+${p.hr - b.hr} bpm`, level: p.hr - b.hr >= 32 ? "severe" : "moderate" });
  if (b.hrv - p.hrv >= 18 && !spikes.find(s => s.m === "hrv"))
   spikes.push({ min: p.min, m: "hrv", label: "HRV drop", val: `-${b.hrv - p.hrv} ms`, level: b.hrv - p.hrv >= 28 ? "severe" : "moderate" });
  if (p.temp - b.temp >= 0.45 && !spikes.find(s => s.m === "temp"))
   spikes.push({ min: p.min, m: "temp", label: "Temperature rise", val: `+${(p.temp - b.temp).toFixed(2)}°C`, level: p.temp - b.temp >= 0.65 ? "severe" : "moderate" });
  if (p.glucose - b.glucose >= 38 && !spikes.find(s => s.m === "glucose"))
   spikes.push({ min: p.min, m: "glucose", label: "Glucose spike", val: `+${p.glucose - b.glucose} mg/dL`, level: p.glucose - b.glucose >= 55 ? "severe" : "moderate" });
 });
 return spikes;
}
const S = {
  bg:"#FAF7F2", card:"#FFFFFF", border:"#D8D0C4", text:"#1C1510", muted:"#8A7E72",
  gold:"#B88040", goldDim:"#C8A060", green:"#5A8850",
  severe:"#B85040", moderate:"#C4887A", mild:"#B8A060", candida:"#7A70A0", whey:"#607890",
};
const CUISINES = [
 {id:"mediterranean",label:"Mediterranean",flag:"🫒",desc:"Olive oil, herbs, fish"},
 {id:"french",       label:"French",        flag:"🇫🇷",desc:"Bistro — duck, lentils"},
 {id:"swedish",      label:"Swedish",       flag:"🇸🇪",desc:"Nordic fish, root veg"},
 {id:"japanese",     label:"Japanese",      flag:"🇯🇵",desc:"Clean minimal, fish"},
 {id:"middle_eastern",label:"Middle Eastern",flag:"🌿",desc:"Spiced meats, herbs"},
 {id:"scandinavian", label:"Scandinavian",  flag:"🐟",desc:"Cured fish, forest"},
];
const EAT_PATS = [
 {id:"standard", label:"Standard",  emoji:"⏰", desc:"6 meals every 3h",        fasting:false, detail:null},
 {id:"if16_8",   label:"IF 16:8",   emoji:"🕐", desc:"16h fast · 8h window",   fasting:true,  detail:"Window 12:00–20:00"},
 {id:"if18_6",   label:"IF 18:6",   emoji:"🕑", desc:"18h fast · 6h window",   fasting:true,  detail:"Window 13:00–19:00"},
 {id:"if5_2",    label:"5:2",       emoji:"📆", desc:"5 normal · 2 low-cal",   fasting:true,  detail:"~500 kcal fasting days"},
];
const buildMarioSys = (name) => `You are Meet Mario, clinical AI for MediBalans AB, Stockholm. Patient: ${name||"this patient"}. Rules: No seed oils. CPF every meal. Respond in clear prose, no bullet points.`;

async function callClaude(messages, system, extra = {}) {
 const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages, ...extra }),
 });
 const d = await res.json();
 return (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
}
export default function MeetMario() {
  // ─── Auth / patient ──────────────────────────────────────────────────────
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [patientName, setPatientName] = useState("Loading…");
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Patient";
        setPatientName(name);
        P.name = name;
      }
    });
  }, []);

 const [tab,       setTab]       = useState("monitor");
 const [rotDay,    setRotDay]    = useState(1);
 const [proteins,  setProteins]  = useState({});
 const [picker,    setPicker]    = useState(null);
 const [genPhase,  setGenPhase]  = useState("detox");
 const [cuisine,   setCuisine]   = useState(null);
 const [mealScope, setMealScope] = useState("full_day");
 const [eatPat,    setEatPat]    = useState("standard");
 const [genResult, setGenResult] = useState(null);
 const [genLoad,   setGenLoad]   = useState(false);
 const [research,  setResearch]  = useState({});
 const [resLoad,   setResLoad]   = useState(null);
 const [foodQ,     setFoodQ]     = useState("");
 const [chatMsgs,  setChatMsgs]  = useState([{role:"assistant",content:"Good day. Your ALCAT results are loaded. Where would you like to start?"}]);
 const [chatIn,    setChatIn]    = useState("");
 const [chatLoad,  setChatLoad]  = useState(false);
 const [expandPh,  setExpandPh]  = useState(null);
 const [wearData,  setWearData]  = useState({ source:null, hrv:null, restingHR:null, sleepScore:null, sleepHours:null, readiness:null, steps:null, glucose:null, glucoseTrend:null, weight:null, bodyFat:null, bodyTemp:null, spo2:null });
 const [wearEdit,  setWearEdit]  = useState(false);
 const [wearForm,  setWearForm]  = useState({});
 const [gxProfile,    setGxProfile]    = useState(null);  // "type1"|"type2"|"prediabetic"|"gestational"|null
 const [gxDevice,     setGxDevice]     = useState(null);  // "dexcom"|"libre"|"nightscout"|"manual"
 const [gxMeds,       setGxMeds]       = useState([]);    // [{name,dose,timing,type}]
 const [gxReadings,   setGxReadings]   = useState([]);    // [{ts,value,label,mealTag,foods}]
 const [gxHba1c,      setGxHba1c]      = useState([]);    // [{date,value}]
 const [gxFoodCorr,   setGxFoodCorr]   = useState({});    // {foodName: [glucoseDeltas]}
 const [gxManualVal,  setGxManualVal]  = useState("");
 const [gxManualTag,  setGxManualTag]  = useState("fasting");
 const [gxManualFood, setGxManualFood] = useState("");
 const [gxDawnData,   setGxDawnData]   = useState([]);    // fasting readings 5-8am
 const [gxAlert,      setGxAlert]      = useState(null);  // active hypo/hyper alert
 const [gxFastGate,   setGxFastGate]   = useState("unknown"); // "safe"|"caution"|"blocked"|"unknown"
 const [gxAiAnalysis, setGxAiAnalysis] = useState("");
 const [gxAiLoading,  setGxAiLoading]  = useState(false);
 const [gxHba1cInput, setGxHba1cInput] = useState("");
 const [gxMedInput,   setGxMedInput]   = useState({name:"",dose:"",timing:"with_meal",type:"oral"});
 const [gxView,       setGxView]       = useState("dashboard"); // "dashboard"|"diary"|"correlation"|"hba1c"|"settings"
 const [gxSimActive,  setGxSimActive]  = useState(false);
 const [gxSimTick,    setGxSimTick]    = useState(0);
 const [gxSimLine,    setGxSimLine]    = useState([]);
 const gxThresh = {
  hypo:     { warn: 70,  urgent: 54  },
  target:   { low: 70,   high: 180 },
  spike:    { mild: 140, moderate: 180, severe: 250 },
  fasting:  { normal: 100, prediabetic: 126 },
  hba1c:    { normal: 5.7, prediabetic: 6.5 },
  dawnRise: 20, // mg/dL rise from 3am to 8am = dawn phenomenon
 };
 const simulateCGM = (profile, mealSize, hadReactive) => {
  const base = profile === "type1" ? 95 : profile === "type2" ? 108 : 90;
  const sensitivity = profile === "type1" ? 1.8 : profile === "type2" ? 1.4 : 1.1;
  const pts = [];
  for (let m = 0; m <= 180; m += 5) {
   const t = m / 180;
   const curve = t < 0.2 ? t / 0.2 : t < 0.5 ? 1 : Math.max(0, (1 - t) / 0.5);
   const mealMult = mealSize === "large" ? 1.4 : mealSize === "small" ? 0.7 : 1;
   const rxBoost = hadReactive ? 1.6 + Math.random() * 0.4 : 1;
   const rise = 55 * sensitivity * mealMult * rxBoost;
   const n = () => (Math.random() - 0.5) * 4;
   const decay = profile === "type1" ? 0.85 : 0.95;
   const val = base + rise * curve * (profile === "type1" ? 1.3 : 1) + n();
   pts.push({ min: m, glucose: Math.round(val), trend: m > 0 ? (val > pts[pts.length-1]?.glucose + 2 ? "rising" : val < pts[pts.length-1]?.glucose - 2 ? "falling" : "stable") : "stable" });
  }
  return pts;
 };
 const simulateDawn = (profile) => {
  const base = profile === "type2" ? 95 : 85;
  const pts = [];
  for (let h = 3; h <= 9; h += 0.25) {
   const dawnRise = (h > 5 && h < 8) ? 18 * Math.sin((h - 5) / 3 * Math.PI) : 0;
   pts.push({ hour: h, glucose: Math.round(base + dawnRise + (Math.random() - 0.5) * 3) });
  }
  return pts;
 };
 const addGxReading = () => {
  const val = parseFloat(gxManualVal);
  if (!val || val < 20 || val > 600) return;
  const reading = {
   id: Date.now(), ts: new Date().toISOString(),
   value: val, label: gxManualTag,
   foods: gxManualFood ? gxManualFood.split(",").map(s => s.trim()) : [],
   source: gxDevice || "manual",
  };
  setGxReadings(prev => [reading, ...prev]);
  if (gxManualTag === "2h_postmeal" && reading.foods.length) {
   const baseline = gxReadings.find(r => r.label === "pre_meal" || r.label === "fasting");
   if (baseline) {
    const delta = val - baseline.value;
    reading.foods.forEach(food => {
     setGxFoodCorr(prev => ({
      ...prev,
      [food]: [...(prev[food] || []), delta],
     }));
    });
   }
  }
  const hour = new Date().getHours();
  if (gxManualTag === "fasting" && hour >= 5 && hour <= 9) {
   setGxDawnData(prev => [...prev, { hour, glucose: val, ts: reading.ts }]);
  }
  if (val <= gxThresh.hypo.urgent) setGxAlert({ type: "urgent_hypo", value: val });
  else if (val <= gxThresh.hypo.warn) setGxAlert({ type: "hypo", value: val });
  else if (val >= gxThresh.spike.severe) setGxAlert({ type: "hyper_severe", value: val });
  else if (val >= gxThresh.spike.moderate) setGxAlert({ type: "hyper", value: val });
  if (gxManualTag === "fasting") {
   if (val < 100 && val > 70) setGxFastGate("safe");
   else if (val >= 100 && val < 130) setGxFastGate("caution");
   else setGxFastGate("blocked");
  }
  setGxManualVal(""); setGxManualFood("");
 };
 const analyseGxPattern = async () => {
  if (gxAiLoading || gxReadings.length < 2) return;
  setGxAiLoading(true);
  const recent = gxReadings.slice(0, 10).map(r =>
   `${new Date(r.ts).toLocaleString("en-SE")}: ${r.value} mg/dL (${r.label})${r.foods.length ? " — foods: " + r.foods.join(", ") : ""}`
  ).join("\n");
  const hba1cLine = gxHba1c.length ? `Latest HbA1c: ${gxHba1c[0].value}% (${gxHba1c[0].date})` : "HbA1c: not provided";
  const meds = gxMeds.length ? gxMeds.map(m => `${m.name} ${m.dose} (${m.timing})`).join(", ") : "No medications logged";
  const dawnNote = gxDawnData.length >= 3 ? `Dawn phenomenon data: ${gxDawnData.map(d => `${d.hour}:00 = ${d.glucose}`).join(", ")}` : "";
  const topSpiker = Object.entries(gxFoodCorr).sort((a,b) => (b[1].reduce((s,v)=>s+v,0)/b[1].length) - (a[1].reduce((s,v)=>s+v,0)/a[1].length)).slice(0,3).map(([f,vs]) => `${f} (+${Math.round(vs.reduce((s,v)=>s+v,0)/vs.length)} avg)`).join(", ");

  const prompt = `Analyse this patient's recent glucose data in the context of their ALCAT elimination protocol.

Patient: ${gxProfile || "unspecified"} diabetes/glycaemic profile, 64yo post-menopausal female, ALCAT food sensitivity protocol.
Medications: ${meds}
${hba1cLine}
${dawnNote}
Top glucose-spiking foods from diary: ${topSpiker || "insufficient data"}

Recent readings (newest first):
${recent}

Provide:
1. PATTERN: What does this data suggest about glycaemic control and stability?
2. ALCAT INTERSECTION: Which green-list foods appear to cause the highest glucose response? Any ALCAT-safe foods that may still need portion control for this patient?
3. FASTING SAFETY: Based on this pattern, is IF 16:8 or 18:6 appropriate? Any precautions given diabetes type?
4. MEDICATION TIMING: Any observations about meal timing relative to medications?
5. ACTION: One specific protocol adjustment for the next 48h.

Be specific. Keep each section to 2-3 sentences. Use clinical language.`;
  try {
   const r = await callClaude([{role:"user",content:prompt}], "You are a diabetologist and functional medicine physician at MediBalans.");
   setGxAiAnalysis(r);
  } catch { setGxAiAnalysis("Analysis unavailable. Please check connection."); }
  setGxAiLoading(false);
 };
 const startGxSim = () => {
  const profile = gxProfile || "prediabetic";
  const line = simulateCGM(profile, "medium", false);
  setGxSimLine(line); setGxSimTick(0); setGxSimActive(true);
 };

 useEffect(() => {
  if (!gxSimActive) return;
  const iv = setInterval(() => {
   setGxSimTick(t => {
    const next = t + 1;
    if (next >= gxSimLine.length) { setGxSimActive(false); clearInterval(iv); return t; }
    const val = gxSimLine[next]?.glucose;
    if (val <= gxThresh.hypo.warn && !gxAlert) setGxAlert({ type: "hypo", value: val });
    if (val >= gxThresh.spike.moderate && !gxAlert) setGxAlert({ type: "hyper", value: val });
    return next;
   });
  }, 200);
  return () => clearInterval(iv);
 }, [gxSimActive, gxSimLine]);

 const gxCurrent = gxSimLine[gxSimTick]?.glucose;
 const gxInRange = gxCurrent ? (gxCurrent >= 70 && gxCurrent <= 180) : null;
 const [recipeTarget,  setRecipeTarget]  = useState(null); // {day,meal,protein,base}
 const [recipeSteps,   setRecipeSteps]   = useState(null); // AI-generated steps string
 const [recipeLoading, setRecipeLoading] = useState(false);
 const [groceryWeek,   setGroceryWeek]   = useState([1,2,3,4]); // which rotation days in week
 const [groceryList,   setGroceryList]   = useState(null); // generated list
 const [groceryLoad,   setGroceryLoad]   = useState(false);
 const [groceryStore,  setGroceryStore]  = useState("matsmart"); // preferred store
 const [groceryExport, setGroceryExport] = useState(false);
 const [userRegion,    setUserRegion]    = useState(null);
 const [parsedItems,   setParsedItems]   = useState([]);
 const [outcomeBaseline,setOutcomeBaseline] = useState(null);
 const [outcomeCheckins,setOutcomeCheckins] = useState([]);
 const [outcomeView,   setOutcomeView]   = useState("checkin");
 const [outcomeInput,  setOutcomeInput]  = useState({energy:5,gut:5,sleep:5,mood:5,pain:5});
 const [outcomeNote,   setOutcomeNote]   = useState("");
 const [outcomeSaving, setOutcomeSaving] = useState(false);
 const [outcomeMarioInsight,setOutcomeMarioInsight] = useState(null);

 const fetchRecipeSteps = async (day, mealKey, protein, base, sides) => {
  setRecipeLoading(true); setRecipeSteps(null);
  const prompt = `Write a clear step-by-step cooking recipe for:
Dish: ${protein} — ${base}${sides ? " · " + sides : ""}
ALCAT protocol: Day ${day} rotation. No seed oils (use tallow, coconut oil, or avocado oil only). No garlic, no onion, no tomato.
Patient: 64yo post-menopausal female. Portion for 1 person.

Format exactly as:
PREP TIME: X min | COOK TIME: X min | SERVES: 1

INGREDIENTS:
- [each ingredient with exact amount on its own line]

STEPS:
1. [step]
2. [step]
(continue until done, max 8 steps)

CLINICAL NOTE: One sentence on why this preparation supports the ALCAT protocol.`;
  try {
   const r = await callClaude([{role:"user",content:prompt}], "You are a clinical chef at MediBalans AB. You write clear, exact cooking instructions. No seed oils ever.");
   setRecipeSteps(r);
  } catch { setRecipeSteps("Error loading recipe. Please try again."); }
  setRecipeLoading(false);
 };

 const buildGroceryList = async () => {
  if (groceryLoad) return;
  setGroceryLoad(true); setGroceryList(null);
  const days = groceryWeek;
  const allFoodsList = days.map(d => {
   const r = ROT[d];
   return `Day ${d}: Grains: ${r.grains.slice(0,3).join(", ")} | Veg: ${r.veg.slice(0,5).join(", ")} | Protein: ${r.protein.slice(0,3).join(", ")} | Fruit: ${r.fruit.slice(0,3).join(", ")} | Misc: ${r.misc.slice(0,3).join(", ")}`;
  }).join(String.fromCharCode(10));
  const prompt = `Generate a structured weekly grocery list for the ALCAT rotation protocol.

Rotation days included this week: ${days.join(", ")}
Foods per day:
${allFoodsList}

Rules: No seed oils. No garlic/onion/tomato (severe reactors). No sugar/yeast (Candida). No dairy (Whey). Organic where possible. Wild-caught fish only.

Format the grocery list in these sections:
**FISH & PROTEIN** (list items with approximate quantity for 7 meals)
**VEGETABLES** (list items with quantity)
**FRUITS** (list items with quantity)
**GRAINS & STARCHES** (list items with quantity)
**OILS & FATS** (tallow, coconut oil, avocado oil only)
**HERBS & SPICES** (list items)
**STORE NOTES** (2-3 sentences: what to buy fresh vs frozen, where to find wild-caught fish in Stockholm, what to prep in batch)

Be specific with quantities (e.g. "2 fillets sardine" not just "sardine").`;
  try {
   const r = await callClaude([{role:"user",content:prompt}], "You are a clinical nutritionist at MediBalans AB specialising in the ALCAT elimination protocol.");
   setGroceryList(r);
  } catch { setGroceryList("Error generating list. Please try again."); }
  setGroceryLoad(false);
 };
 const [monActive,    setMonActive]    = useState(false);
 const [monTimeline,  setMonTimeline]  = useState([]);
 const [monSpikes,    setMonSpikes]    = useState([]);
 const [monTick,      setMonTick]      = useState(0);
 const [monMealLabel, setMonMealLabel] = useState("Lunch");
 const [monFoods,     setMonFoods]     = useState([]);
 const [monFoodInput, setMonFoodInput] = useState("");
 const [diary,        setDiary]        = useState([]);
 const [popup,        setPopup]        = useState(null);  // null | spike object
 const [popupStep,    setPopupStep]    = useState(0);     // 0=reactive? 1=symptoms 2=severity 3=AI analysis
 const [popupReactive,setPopupReactive]= useState(null);  // true/false
 const [popupSymptoms,setPopupSymptoms]= useState([]);
 const [popupSeverity,setPopupSeverity]= useState(null);
 const [popupAnalysis,setPopupAnalysis]= useState("");
 const [popupLoading, setPopupLoading] = useState(false);
 const [clinView,     setClinView]     = useState(false);
 const monRef = useRef(null);
 const chatEnd = useRef(null);
 useEffect(() => { chatEnd.current?.scrollIntoView({behavior:"smooth"}); }, [chatMsgs]);
 const startMonitoring = useCallback(() => {
  const hasReactive = monFoods.some(f => {
   const fu = f.toUpperCase();
   return P.severe.some(s => fu.includes(s) || s.includes(fu)) ||
      P.moderate.some(s => fu.includes(s) || s.includes(fu));
  });
  const tl = simulateMealResponse(hasReactive);
  setMonTimeline(tl);
  setMonSpikes([]);
  setMonTick(0);
  setMonActive(true);
  setPopup(null);
 }, [monFoods]);

 useEffect(() => {
  if (!monActive) return;
  const iv = setInterval(() => {
   setMonTick(t => {
    const next = t + 1;
    if (next >= monTimeline.length) { setMonActive(false); clearInterval(iv); return t; }
    const visiblePts = monTimeline.slice(0, next + 1);
    const spks = detectSpikes(visiblePts);
    setMonSpikes(prev => {
     const newSpikes = spks.filter(s => !prev.find(p => p.m === s.m));
     if (newSpikes.length > 0 && !popup) {
      setPopup(newSpikes[0]);
      setPopupStep(0);
      setPopupReactive(null);
      setPopupSymptoms([]);
      setPopupSeverity(null);
      setPopupAnalysis("");
     }
     return spks;
    });
    return next;
   });
  }, 180); // ~180ms per tick = 3min/tick, full 120min in ~22sec
  return () => clearInterval(iv);
 }, [monActive, monTimeline]);

 const visiblePts  = monTimeline.slice(0, monTick + 1);
 const currentPt   = visiblePts[visiblePts.length - 1];
 const baselinePt  = monTimeline[0];

 const dismissPopup = () => setPopup(null);

 const logAndDismiss = async () => {
  setPopupLoading(true);
  const spikeDesc = popup ? `${popup.label} (${popup.val}) at ${popup.min} minutes post-meal` : "biometric spike";
  const foodList  = monFoods.length ? monFoods.join(", ") : "not logged";
  const symList   = popupSymptoms.length ? popupSymptoms.join(", ") : "none reported";
  const prompt = `The patient just had a post-meal biometric reaction. Analyse and advise.
Meal: ${monMealLabel} at ${new Date().toLocaleTimeString()}
Foods eaten: ${foodList}
Spike detected: ${spikeDesc}
Ate anything reactive: ${popupReactive ? "Yes — possibly "+foodList : "Patient says no"}
Symptoms reported: ${symList}
Severity: ${popupSeverity || "not rated"}
Patient profile: 64yo post-menopausal, Candida mild, Whey moderate, ALCAT protocol.

Give: (1) most likely cause of this reaction, (2) what to monitor in the next 2h, (3) one protocol adjustment for next meal, (4) whether to flag to clinician. Keep it to 4 short paragraphs.`;
  let analysis = "";
  try { analysis = await callClaude([{role:"user",content:prompt}], buildMarioSys(patientName)); }
  catch { analysis = "Analysis unavailable. Please log this event and contact your MediBalans clinician."; }
  setPopupAnalysis(analysis);
  setPopupLoading(false);
  const entry = {
   id: Date.now(),
   ts: new Date().toISOString(),
   meal: monMealLabel,
   foods: [...monFoods],
   spike: popup,
   reactive: popupReactive,
   symptoms: [...popupSymptoms],
   severity: popupSeverity,
   analysis,
   timeline: [...visiblePts],
   flagClinic: popupSeverity === "severe" || popup?.level === "severe",
  };
  setDiary(prev => [entry, ...prev]);
  setPopupStep(3);
 };

 const fetchResearch = async (fid) => {
  if (research[fid] || resLoad === fid) return;
  setResLoad(fid);
  const fl = {if16_8:"16:8 intermittent fasting",if18_6:"18:6 intermittent fasting",if5_2:"5:2 diet"}[fid];
  const prompt = `Search current (2020-2024) evidence on ${fl} for: 64yo post-menopausal female, Candida mild, Whey sensitivity, ALCAT protocol. Cover: hormones/HPA axis, muscle/bone in 60+, gut permeability, metabolic markers, risks. Tag each claim: [Strong RCT], [Meta-analysis], [Observational], [Mechanistic], or [Expert consensus]. End with RECOMMENDATION (3 sentences for this patient).`;
  try { const r = await callClaude([{role:"user",content:prompt}], "You are a clinical researcher.", {tools:[{type:"web_search_20250305",name:"web_search"}]}); setResearch(prev=>({...prev,[fid]:r})); }
  catch { setResearch(prev=>({...prev,[fid]:"Connection error."})); }
  setResLoad(null);
 };

 const sendChat = async () => {
  if (!chatIn.trim() || chatLoad) return;
  const um = {role:"user",content:chatIn};
  const msgs = [...chatMsgs, um];
  setChatMsgs(msgs); setChatIn(""); setChatLoad(true);
  try { const r = await callClaude(msgs, buildMarioSys(patientName)); setChatMsgs([...msgs,{role:"assistant",content:r}]); }
  catch { setChatMsgs([...msgs,{role:"assistant",content:"Connection error."}]); }
  setChatLoad(false);
 };

 const genMenu = async () => {
  if (!cuisine || genLoad) return;
  setGenLoad(true); setGenResult(null);
  const r = ROT[rotDay];
  const foods = `Grains: ${r.grains.join(", ")}\nVeg: ${r.veg.join(", ")}\nFruit: ${r.fruit.join(", ")}\nProtein: ${r.protein.join(", ")}\nMisc: ${r.misc.join(", ")}`;
  const cu = CUISINES.find(c=>c.id===cuisine)?.label;
  const ep = EAT_PATS.find(e=>e.id===eatPat);
  const pInstr = eatPat==="standard" ? "Standard 6 meals every 3h. Generate Breakfast (7:00), Snack (10:00), Lunch (13:00), Snack (16:00), Dinner (19:00), Snack (22:00)."
   : eatPat==="if16_8" ? "IF 16:8 window 12:00-20:00. Generate Lunch (12:00 break-fast), Snack (15:30), Dinner (19:30)."
   : eatPat==="if18_6" ? "IF 18:6 window 13:00-19:00. Generate Lunch (13:00 break-fast), Snack (15:30), Dinner (19:00)."
   : "5:2 fasting day ~500 kcal. 2 small high-protein high-fibre meals, include calorie count.";
  const fRule = genPhase==="detox" ? "Fruit only in snacks with protein/fat." : "Fruit only as small dessert after main meals.";
  const prompt = `Generate a ${mealScope==="full_day"?"full day":mealScope} menu in ${cu} style for Christina.\nHARD RULES: Day ${rotDay} foods only. No sugars/yeast (Candida). No milk (Whey). No seed oils. CPF every main meal.\n${fRule}\nDay ${rotDay}:\n${foods}\n${pInstr}\nIf a classic ${cu} dish needs a reactive ingredient, adapt creatively. Format: **Dish Name** then one sentence. End with Notes paragraph.`;
  try { const res = await callClaude([{role:"user",content:prompt}], "You are a clinical chef at MediBalans."); setGenResult(res); }
  catch { setGenResult("Error. Please try again."); }
  setGenLoad(false);
 };

 const getP = (d,k) => proteins[`${d}-${k}`] || MEALS[d][k]?.defaultP;
 const setP = (d,k,p) => { setProteins(prev=>({...prev,[`${d}-${k}`]:p})); setPicker(null); };
 const allFoods = [...P.severe.map(f=>({food:f,level:"severe"})),...P.moderate.map(f=>({food:f,level:"moderate"})),...P.mild.map(f=>({food:f,level:"mild"})),...P.alsoAvoid.candida.map(f=>({food:f,level:"candida"})),...P.alsoAvoid.whey.map(f=>({food:f,level:"whey"}))];
 const foodResults = foodQ.length > 1 ? allFoods.filter(({food})=>food.toLowerCase().includes(foodQ.toLowerCase())).slice(0,10) : [];

 const TABS = [{id:"monitor",label:"🔴 Monitor"},{id:"glucose",label:"📊 Glucose"},{id:"protocol",label:"Protocol"},{id:"rotation",label:"Rotation"},{id:"meals",label:"Meals"},{id:"generate",label:"Generate"},{id:"grocery",label:"🛒 Grocery"},{id:"lookup",label:"Food Check"},{id:"chat",label:"Ask Mario"},{id:"outcomes",label:"Outcomes"},{id:"medications",label:"Medications"}];
 const PHASES = [
  {id:1,label:"21-Day Detox",range:"Days 1–21",color:S.gold,rules:["Green list only","6 meals every 3h","No sugars/yeast (Candida)","No milk (Whey)"],note:"Any deviation restarts the inflammatory clock."},
  {id:2,label:"Green Phase",range:"Months 1–3",color:"#7A9E60",rules:["Strict 4-day rotation","One legume day/week","Candida continues","Whey continues"],note:"Rotation prevents new sensitivities forming."},
  {id:3,label:"Mild Reintroduction",range:"Month 3–4",color:S.mild,rules:["Up to 3 mild foods/day","Repeat only after 4 days","Watch for reactions"],note:"Track reactions carefully — react, delay 1 month."},
  {id:4,label:"Moderate Reintroduction",range:"Month 6",color:S.moderate,rules:["Same as mild method","Whey restriction ends"],note:"Most patients see largest improvements here."},
  {id:5,label:"Maintenance",range:"Month 9+",color:"#6A9E8E",rules:["Full rotation","One free day/week"],note:"52 free days per year without affecting outcomes."},
 ];
 const MiniChart = ({ pts, key_, color, label, unit, height=60 }) => {
  if (!pts || pts.length < 2) return null;
  const vals = pts.map(p => p[key_]);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const W = 220, H = height;
  const px = (i) => (i / (pts.length - 1)) * W;
  const py = (v) => H - ((v - min) / range) * (H - 8) - 4;
  const path = pts.map((p, i) => `${i===0?"M":"L"}${px(i).toFixed(1)},${py(p[key_]).toFixed(1)}`).join(" ");
  const current = vals[vals.length - 1];
  const delta = current - vals[0];
  return (
   <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"10px 12px"}}>
    <div style={{display:FX,justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
     <div style={{fontSize:9,letterSpacing:2,color:S.muted,fontFamily:FF}}>{label.toUpperCase()}</div>
     <div style={{textAlign:"right"}}>
      <span style={{fontSize:18,fontWeight:700,color}}>{current}</span>
      <span style={{fontSize:10,color:S.muted,fontFamily:FF}}> {unit}</span>
      {Math.abs(delta) > 0 && <div style={{fontSize:9,color:delta > 0 ? (key_==="hrv"||key_==="spo2" ? S.severe : S.moderate) : S.green,fontFamily:FF}}>{delta > 0 ? "+" : ""}{delta.toFixed(key_==="temp"?2:0)}</div>}
     </div>
    </div>
    <svg width={W} height={H} style={{display:"block",overflow:"visible"}}>
     <defs><linearGradient id={`g${key_}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
     <path d={`${path} L${px(pts.length-1)},${H} L0,${H} Z`} fill={`url(#g${key_})`}/>
     <path d={path} stroke={color} strokeWidth={1.5} fill="none"/>
     <circle cx={px(pts.length-1)} cy={py(vals[vals.length-1])} r={3} fill={color}/>
    </svg>
    <div style={{display:FX,justifyContent:"space-between",marginTop:2}}>
     <span style={{fontSize:9,color:"#3A3828",fontFamily:FF}}>0</span>
     <span style={{fontSize:9,color:"#3A3828",fontFamily:FF}}>+{pts[pts.length-1]?.min||0}min</span>
    </div>
   </div>
  );
 };
 const SpikePopup = () => {
  if (!popup) return null;
  const levelColor = popup.level === "severe" ? S.severe : S.moderate;
  return (
   <div style={{position:"fixed",inset:0,background:"#00000090",zIndex:1000,display:FX,alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{background:"#111008",border:`2px solid ${levelColor}`,borderRadius:12,maxWidth:480,width:"100%",boxShadow:"0 24px 60px #000000A0"}}>
     {/* Header */}
     <div style={{background:levelColor+"15",borderBottom:`1px solid ${levelColor}30`,padding:"16px 20px",borderRadius:"10px 10px 0 0"}}>
      <div style={{display:FX,alignItems:"center",gap:10}}>
       <div style={{width:10,height:10,borderRadius:"50%",background:levelColor,boxShadow:`0 0 10px ${levelColor}`,animation:"pulse 1s infinite"}}/>
       <span style={{fontSize:13,fontWeight:700,color:levelColor,fontFamily:FF,letterSpacing:1}}>{popup.level.toUpperCase()} REACTION DETECTED</span>
       <span style={{marginLeft:"auto",fontSize:11,color:S.muted,fontFamily:FF}}>{popup.min}min post-meal</span>
      </div>
      <div style={{fontSize:20,color:S.text,fontWeight:600,marginTop:6}}>{popup.label} {popup.val}</div>
     </div>

     <div style={{padding:"18px 20px"}}>
      {/* Step 0 — Did you eat something reactive? */}
      {popupStep === 0 && <>
       <div style={{fontSize:13,color:S.text,lineHeight:1.7,marginBottom:16}}>
        Your <strong style={{color:levelColor}}>{popup.label}</strong> spiked unusually. This pattern can indicate a food reaction.
        {monFoods.length > 0 && <div style={{marginTop:8,fontSize:12,color:S.muted,fontFamily:FF}}>Logged meal: {monFoods.join(", ")}</div>}
       </div>
       <div style={{fontSize:12,color:S.gold,fontFamily:FF,marginBottom:12,fontWeight:600}}>Did you eat anything outside your green list?</div>
       <div style={{display:FX,gap:8}}>
        <button onClick={()=>{setPopupReactive(true);setPopupStep(1);}} style={{flex:1,background:S.severe+"15",border:`1px solid ${S.severe}50`,borderRadius:7,padding:"10px",cursor:CP,color:S.severe,fontSize:13,fontFamily:FF,fontWeight:600}}>Yes — I may have</button>
        <button onClick={()=>{setPopupReactive(false);setPopupStep(1);}} style={{flex:1,background:S.card,border:`1px solid ${S.border}`,borderRadius:7,padding:"10px",cursor:CP,color:S.muted,fontSize:13,fontFamily:FF}}>No — stayed on protocol</button>
       </div>
      </>}

      {/* Step 1 — Symptoms */}
      {popupStep === 1 && <>
       <div style={{fontSize:12,color:S.gold,fontFamily:FF,fontWeight:600,marginBottom:12}}>Any symptoms right now? Select all that apply.</div>
       {Object.values(SYMPTOM_CATS).map(cat => (
        <div key={cat.label} style={{marginBottom:10}}>
         <div style={{fontSize:9,letterSpacing:2,color:S.muted,fontFamily:FF,marginBottom:5}}>{cat.icon} {cat.label.toUpperCase()}</div>
         <div style={{display:FX,flexWrap:"wrap",gap:4}}>
          {cat.items.map(s => {
           const sel = popupSymptoms.includes(s);
           return <button key={s} onClick={()=>setPopupSymptoms(prev=>sel?prev.filter(x=>x!==s):[...prev,s])} style={{background:sel?"#2A1818":S.bg,border:`1px solid ${sel?S.severe+"60":S.border}`,borderRadius:4,padding:"3px 8px",cursor:CP,fontSize:11,fontFamily:FF,color:sel?S.severe:S.muted}}>{s}</button>;
          })}
         </div>
        </div>
       ))}
       <div style={{fontSize:12,color:S.gold,fontFamily:FF,fontWeight:600,margin:"12px 0 8px"}}>Overall severity?</div>
       <div style={{display:FX,gap:6,marginBottom:16}}>
        {["mild","moderate","severe"].map(sev => (
         <button key={sev} onClick={()=>setPopupSeverity(sev)} style={{flex:1,background:popupSeverity===sev?S[sev]+"20":S.card,border:`1px solid ${popupSeverity===sev?S[sev]:S.border}`,borderRadius:6,padding:"8px",cursor:CP,color:popupSeverity===sev?S[sev]:S.muted,fontSize:12,fontFamily:FF,fontWeight:600,textTransform:"capitalize"}}>{sev}</button>
        ))}
       </div>
       <button onClick={logAndDismiss} disabled={popupLoading} style={{width:"100%",background:popupLoading?"#1A1810":S.gold,border:`1px solid ${S.gold}`,borderRadius:7,padding:"10px",cursor:popupLoading?"wait":"pointer",color:popupLoading?S.goldDim:"#0D0C0A",fontSize:13,fontFamily:FF,fontWeight:700,display:FX,alignItems:"center",justifyContent:"center",gap:8}}>
        {popupLoading ? <><span style={{display:FX,gap:3}}>{[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:S.goldDim,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,display:"inline-block"}}/>)}</span><span>Analysing with Mario…</span></> : "Log reaction & get Mario's analysis →"}
       </button>
      </>}

      {/* Step 2 — AI Analysis */}
      {popupStep === 3 && <>
       <div style={{fontSize:9,letterSpacing:3,color:"#5080A8",fontFamily:FF,marginBottom:8}}>MARIO'S ANALYSIS</div>
       <div style={{fontSize:12,color:"#A0B0B8",lineHeight:1.8,fontFamily:FF,maxHeight:220,overflowY:"auto",marginBottom:14}}>
        {popupAnalysis.split("\n").map((l,i)=>l.trim()?<div key={i} style={{marginBottom:6}}>{l}</div>:null)}
       </div>
       {diary[0]?.flagClinic && (
        <div style={{background:"#2A1010",border:`1px solid ${S.severe}40`,borderRadius:6,padding:"8px 12px",marginBottom:12,fontSize:11,color:S.severe,fontFamily:FF,display:FX,gap:6,alignItems:"center"}}>
         <span>⚠️</span> This reaction has been flagged for clinician review.
        </div>
       )}
       <button onClick={dismissPopup} style={{width:"100%",background:S.card,border:`1px solid ${S.border}`,borderRadius:7,padding:"10px",cursor:CP,color:S.muted,fontSize:13,fontFamily:FF}}>Close — logged to reaction diary ✓</button>
      </>}
     </div>
    </div>
   </div>
  );
 };
 return (
  <div style={{minHeight:"100vh",background:S.bg,color:S.text,fontFamily:"Georgia,Palatino,serif"}}>
   {popup && <SpikePopup />}

   {/* HEADER */}
   <div style={{borderBottom:`1px solid ${S.border}`,background:S.bg,position:"sticky",top:0,zIndex:100,padding:"14px 20px 0"}}>
    <div style={{display:FX,justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
     <div>
      <div style={{fontSize:8,letterSpacing:5,color:S.goldDim,fontFamily:FF,fontWeight:600}}>MEDIBALANS AB · STOCKHOLM</div>
      <div style={{fontSize:22,fontWeight:700,letterSpacing:-1,lineHeight:1.1,marginTop:1}}>◉ meet mario</div>
      <div style={{fontSize:10,color:S.muted,fontFamily:FF,marginTop:1}}> · </div>
<div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:400,letterSpacing:"-0.02em",lineHeight:1.1,marginTop:1,color:"#1C1510"}}>◉ meet mario</div>     <a href="/pregnancy" style={{fontFamily:FF,fontSize:8,color:"#8BAF8A",textDecoration:"none",letterSpacing:"0.12em",border:"1px solid #3A4030",borderRadius:5,padding:"3px 10px",display:"flex",alignItems:"center",gap:5}}><div style={{width:5,height:5,borderRadius:"50%",background:"#8BAF8A"}}/>BABY BALANS</a>
       <span style={{fontSize:8,letterSpacing:0.5,color:"#7A6030",fontFamily:FF,fontWeight:600,background:"#1A1608",border:"1px solid #3A2A08",borderRadius:3,padding:"1px 6px"}}>PATENT PENDING</span>
       <span style={{fontSize:8,color:"#4A3820",fontFamily:FF}}>SE 2615203-3</span>
      </div>
     </div>
     <div style={{display:FX,gap:6,alignItems:"center"}}>
      {monActive && <div style={{background:"#1A0A0A",border:`1px solid ${S.severe}50`,borderRadius:6,padding:"4px 10px",display:FX,gap:5,alignItems:"center"}}>
       <div style={{width:6,height:6,borderRadius:"50%",background:S.severe,animation:"pulse 0.8s infinite"}}/>
       <span style={{fontSize:10,color:S.severe,fontFamily:FF,fontWeight:600}}>MONITORING</span>
      </div>}
      {diary.length > 0 && <div style={{background:"#1A1010",border:`1px solid ${S.moderate}40`,borderRadius:6,padding:"4px 10px",fontSize:10,color:S.moderate,fontFamily:FF}}>{diary.length} reaction{diary.length>1?"s":""} logged</div>}
      {[["Candida","mild",S.candida],["Whey","moderate",S.moderate]].map(([n,l,c])=>(
       <div key={n} style={{background:"#181610",border:`1px solid ${c}40`,borderRadius:5,padding:"3px 8px",display:FX,gap:4,alignItems:"center"}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:c}}/>
        <span style={{fontSize:9,fontFamily:FF,color:S.muted}}>{n}</span>
        <span style={{fontSize:9,fontFamily:FF,color:c,fontWeight:600}}>{l}</span>
       </div>
      ))}
     </div>
    </div>
    <div style={{display:FX,gap:1,overflowX:"auto"}}>
     {TABS.map(t=>(
      <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:CP,padding:"6px 12px",fontSize:11,fontFamily:FF,color:tab===t.id?S.gold:S.muted,borderBottom:`2px solid ${tab===t.id?S.gold:"transparent"}`,whiteSpace:"nowrap",transition:"all 0.15s"}}>
       {t.label}
      </button>
     ))}
    </div>
   </div>

   <div style={{padding:"20px",maxWidth:980,margin:"0 auto"}} onClick={()=>picker&&setPicker(null)}>
    {tab==="monitor"&& <div>
     <div style={{display:FX,justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div>
       <div style={{fontSize:9,letterSpacing:4,color:"#8A3030",fontFamily:FF,marginBottom:4}}>REAL-TIME BIOMETRIC MONITORING</div>
       <div style={{fontSize:20,fontWeight:600}}>Post-Meal Response Tracker</div>
       <div style={{fontSize:12,color:S.muted,fontFamily:FF,marginTop:3}}>Detects unusual spikes and prompts symptom collection. Logs to reaction diary. Alerts clinician on severe events.</div>
      </div>
      <button onClick={()=>setClinView(v=>!v)} style={{background:clinView?"#1A1028":S.card,border:`1px solid ${clinView?"#6040A0":S.border}`,borderRadius:7,padding:"7px 14px",cursor:CP,fontSize:11,fontFamily:FF,color:clinView?"#A080D0":S.muted}}>
       {clinView?"👤 Patient view":"🏥 Clinician view"}
      </button>
     </div>

     {/* Setup + Active monitor */}
     {!monActive && monTimeline.length === 0 ? (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
       {/* Left: meal setup */}
       <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:10,padding:"18px"}}>
        <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:12}}>LOG MEAL TO MONITOR</div>
        <div style={{fontSize:9,letterSpacing:2,color:S.muted,fontFamily:FF,marginBottom:6}}>MEAL</div>
        <div style={{display:FX,gap:5,marginBottom:14,flexWrap:"wrap"}}>
         {["Breakfast","Snack","Lunch","Dinner","Post-exercise"].map(m=>(
          <button key={m} onClick={()=>setMonMealLabel(m)} style={{background:monMealLabel===m?"#1A1610":S.bg,border:`1px solid ${monMealLabel===m?S.gold:S.border}`,borderRadius:5,padding:"4px 10px",cursor:CP,fontSize:11,fontFamily:FF,color:monMealLabel===m?S.gold:S.muted}}>{m}</button>
         ))}
        </div>
        {/* ── ROTATION DAY + MEAL TEMPLATE ── */}
        <div style={{display:FX,justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
         <div style={{fontSize:9,letterSpacing:2,color:S.muted,fontFamily:FF}}>FOODS EATEN</div>
         <div style={{display:FX,gap:3}}>
          {[1,2,3,4].map(d=>(
           <button key={d} onClick={()=>{setRotDay(d);setMonFoods([]);}} style={{background:rotDay===d?S.gold:S.bg,border:`1px solid ${rotDay===d?S.gold:S.border}`,color:rotDay===d?"#0D0C0A":S.muted,borderRadius:4,padding:"2px 8px",cursor:CP,fontSize:10,fontFamily:FF,fontWeight:rotDay===d?700:400}}>Day {d}</button>
          ))}
         </div>
        </div>

        {/* Meal template shortcut — fires when Breakfast/Lunch/Dinner selected */}
        {(() => {
         const mealKey = monMealLabel === "Breakfast" ? "breakfast" : monMealLabel === "Lunch" ? "lunch" : monMealLabel === "Dinner" ? "dinner" : null;
         const template = mealKey && MEALS[rotDay][mealKey];
         if (!template) return null;
         const suggestedProtein = getP(rotDay, mealKey);
         const templateFoods = template.isProtein
          ? [suggestedProtein, ...template.base.split(/[,—·]/).map(s=>s.trim()).filter(s=>s.length>2&&s.length<20)]
          : template.base.split(/[,—·]/).map(s=>s.trim()).filter(s=>s.length>2&&s.length<20);
         const alreadyLoaded = templateFoods.every(f=>monFoods.includes(f));
         return (
          <div style={{background:"#141008",border:`1px solid ${S.gold}25`,borderRadius:6,padding:"8px 10px",marginBottom:8,display:FX,justifyContent:"space-between",alignItems:"center"}}>
           <div>
            <div style={{fontSize:9,color:S.goldDim,fontFamily:FF,marginBottom:2}}>TODAY'S {monMealLabel.toUpperCase()} TEMPLATE · DAY {rotDay}</div>
            <div style={{fontSize:11,color:"#A09070",fontFamily:FF,lineHeight:1.4}}>
             {template.isProtein && <span style={{color:S.gold,fontWeight:600}}>{suggestedProtein} · </span>}
             {template.base}
            </div>
           </div>
           <button onClick={()=>{ if(!alreadyLoaded) setMonFoods(templateFoods); else setMonFoods([]);}} style={{background:alreadyLoaded?S.gold+"20":"#1A1610",border:`1px solid ${alreadyLoaded?S.gold:S.goldDim+"40"}`,borderRadius:5,padding:"4px 10px",cursor:CP,fontSize:10,fontFamily:FF,color:alreadyLoaded?S.gold:S.goldDim,whiteSpace:"nowrap",marginLeft:8,flexShrink:0}}>
            {alreadyLoaded?"✓ Loaded":"Use template"}
           </button>
          </div>
         );
        })()}

        {/* Selected foods tray — always visible at top */}
        {monFoods.length > 0 && (
         <div style={{background:"#0E100C",border:`1px solid ${S.green}30`,borderRadius:6,padding:"7px 10px",marginBottom:8}}>
          <div style={{fontSize:8,letterSpacing:1,color:S.green,fontFamily:FF,marginBottom:5}}>✓ YOUR MEAL ({monFoods.length} foods)</div>
          <div style={{display:FX,flexWrap:"wrap",gap:4}}>
           {monFoods.map((f,i)=>{
            const fu = f.toUpperCase();
            const isSevere = P.severe.some(s=>fu.includes(s)||s.includes(fu.split(" ")[0]));
            const isMod    = P.moderate.some(s=>fu.includes(s)||s.includes(fu.split(" ")[0]));
            const col = isSevere ? S.severe : isMod ? S.moderate : S.green;
            return <span key={i} onClick={()=>setMonFoods(prev=>prev.filter((_,j)=>j!==i))} style={{background:col+"18",border:`1px solid ${col}50`,borderRadius:4,padding:"2px 8px",fontSize:11,fontFamily:FF,color:col,cursor:CP}}>{f} ×</span>;
           })}
          </div>
         </div>
        )}

        {/* Search/filter */}
        <input value={monFoodInput} onChange={e=>setMonFoodInput(e.target.value)}
         onKeyDown={e=>{if(e.key==="Enter"&&monFoodInput.trim()){setMonFoods(prev=>[...prev,monFoodInput.trim()]);setMonFoodInput("");}}}
         placeholder="Filter or type custom food + Enter" style={{width:"100%",background:S.bg,border:`1px solid ${S.border}`,borderRadius:5,padding:"6px 10px",fontSize:11,color:S.text,fontFamily:FF,outline:"none",marginBottom:7,boxSizing:"border-box"}}
        />

        {/* Food chips from rotation — grouped */}
        <div style={{maxHeight:220,overflowY:"auto",paddingRight:2}}>
         {[["protein","🐟"],["veg","🥬"],["grains","🌾"],["fruit","🍓"],["misc","🫙"]].map(([cat,em])=>{
          const items = ROT[rotDay][cat].filter(f=>!monFoodInput||f.toLowerCase().includes(monFoodInput.toLowerCase()));
          if(!items.length) return null;
          return (
           <div key={cat} style={{marginBottom:6}}>
            <div style={{fontSize:8,letterSpacing:1,color:S.muted,fontFamily:FF,marginBottom:3}}>{em} {cat.toUpperCase()}</div>
            <div style={{display:FX,flexWrap:"wrap",gap:3}}>
             {items.map(f=>{
              const fu = f.toUpperCase();
              const isSev = P.severe.some(s=>fu===s||s.startsWith(fu));
              const isMod = P.moderate.some(s=>fu===s||s.startsWith(fu));
              const added = monFoods.includes(f);
              const col = isSev ? S.severe : isMod ? S.moderate : S.green;
              return (
               <button key={f} onClick={()=>setMonFoods(prev=>added?prev.filter(x=>x!==f):[...prev,f])}
                style={{background:added?col+"22":S.bg,border:`1px solid ${added?col:isSev?S.severe+"40":isMod?S.moderate+"30":S.border}`,borderRadius:4,padding:"2px 7px",cursor:CP,fontSize:10,fontFamily:FF,color:added?col:isSev?S.severe+"90":isMod?S.moderate+"90":"#706050",transition:"all .1s",fontWeight:added?600:400}}>
                {added?"✓ ":""}{f}
               </button>
              );
             })}
            </div>
           </div>
          );
         })}
        </div>
        {monFoods.some(f=>P.severe.some(s=>f.toUpperCase().includes(s)||s.includes(f.toUpperCase().split(" ")[0]))||P.moderate.some(s=>f.toUpperCase().includes(s)||s.includes(f.toUpperCase().split(" ")[0]))) && (
         <div style={{background:"#2A1010",border:`1px solid ${S.severe}40`,borderRadius:6,padding:"8px 10px",marginBottom:12,fontSize:11,color:S.severe,fontFamily:FF}}>⚠️ Reactive food detected in this meal — elevated spike risk</div>
        )}
        <button onClick={startMonitoring} style={{width:"100%",background:S.gold,border:`1px solid ${S.gold}`,borderRadius:7,padding:"11px",cursor:CP,color:"#0D0C0A",fontSize:13,fontFamily:FF,fontWeight:700}}>Start 2h post-meal monitoring</button>
       </div>

       {/* Right: device status */}
       <div>
        <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:10,padding:"18px",marginBottom:12}}>
         <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:12}}>DATA SOURCES</div>
         {[
          {name:"Apple Watch",    icon:"⌚", streams:"HR · HRV",                     badge:"HRV",         badgeColor:"#707070"},
          {name:"Oura Ring",      icon:"💍", streams:"HRV · Temp · SpO2 · Readiness", badge:"HRV · TEMP",  badgeColor:"#707070"},
          {name:"Garmin",         icon:"🏔️", streams:"HR · HRV · Sleep · Stress · Body Battery", badge:"HRV · SLEEP", badgeColor:"#407050"},
          {name:"Samsung Galaxy", icon:"💎", streams:"HR · HRV (IBI) · Sleep · SpO2 · Skin temp", badge:"HRV · TEMP",  badgeColor:"#6040A0"},
          {name:"Dexcom G7/G6",   icon:"📡", streams:"Glucose · 5min intervals · trend arrows",   badge:"GLUCOSE",    badgeColor:"#50A060"},
          {name:"Libre 2 / 3",    icon:"💠", streams:"Glucose · 1min intervals · predictive low", badge:"GLUCOSE",    badgeColor:"#50A060"},
         ].map(d=>(
          <div key={d.name} style={{display:FX,alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${S.border}`}}>
           <span style={{fontSize:16,flexShrink:0}}>{d.icon}</span>
           <div style={{flex:1}}>
            <div style={{display:FX,alignItems:"center",gap:6,marginBottom:2}}>
             <span style={{fontSize:12,color:S.text}}>{d.name}</span>
             <span style={{fontSize:8,background:d.badgeColor+"18",border:`1px solid ${d.badgeColor}35`,color:d.badgeColor,borderRadius:3,padding:"1px 5px",fontFamily:FF,letterSpacing:0.5}}>{d.badge}</span>
            </div>
            <div style={{fontSize:10,color:S.muted,fontFamily:FF}}>{d.streams}</div>
           </div>
           <div style={{background:"#1A2018",border:"1px solid #2A3028",borderRadius:4,padding:"2px 8px",fontSize:9,color:"#4A6048",fontFamily:FF,flexShrink:0}}>Simulated</div>
          </div>
         ))}
        </div>

        {/* Reaction diary preview */}
        {diary.length > 0 && <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:10,padding:"14px 16px"}}>
         <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:10}}>RECENT REACTIONS</div>
         {diary.slice(0,3).map(e=>(
          <div key={e.id} style={{borderBottom:`1px solid ${S.border}`,paddingBottom:8,marginBottom:8}}>
           <div style={{display:FX,justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <span style={{fontSize:12,color:S.text}}>{e.meal}</span>
            <span style={{fontSize:10,color:S.muted,fontFamily:FF}}>{new Date(e.ts).toLocaleDateString("en-SE")}</span>
           </div>
           <div style={{display:FX,gap:4,flexWrap:"wrap"}}>
            {e.spike&&<span style={{fontSize:10,background:e.spike.level==="severe"?S.severe+"20":S.moderate+"20",color:e.spike.level==="severe"?S.severe:S.moderate,border:`1px solid ${e.spike.level==="severe"?S.severe:S.moderate}40`,borderRadius:3,padding:"1px 6px",fontFamily:FF}}>{e.spike.label}</span>}
            {e.symptoms.slice(0,2).map(s=><span key={s} style={{fontSize:10,color:S.muted,background:S.bg,border:`1px solid ${S.border}`,borderRadius:3,padding:"1px 6px",fontFamily:FF}}>{s}</span>)}
            {e.flagClinic&&<span style={{fontSize:10,color:S.severe,fontFamily:FF}}>⚠️ Flagged</span>}
           </div>
          </div>
         ))}
        </div>}
       </div>
      </div>
     ) : (
      /* ── ACTIVE MONITORING DISPLAY ── */
      <div>
       <div style={{display:FX,justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{display:FX,alignItems:"center",gap:10}}>
         {monActive
          ? <><div style={{width:10,height:10,borderRadius:"50%",background:S.severe,animation:"pulse 0.8s infinite"}}/><span style={{fontSize:13,color:S.severe,fontFamily:FF,fontWeight:600}}>LIVE — {monMealLabel} · {currentPt?.min||0}min post-meal</span></>
          : <><div style={{width:10,height:10,borderRadius:"50%",background:S.green}}/><span style={{fontSize:13,color:S.green,fontFamily:FF,fontWeight:600}}>COMPLETE — {monMealLabel} · 120min session</span></>}
        </div>
        <button onClick={()=>{setMonTimeline([]);setMonTick(0);setMonActive(false);setMonFoods([]);setMonSpikes([]);}} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:6,padding:"5px 12px",cursor:CP,fontSize:11,fontFamily:FF,color:S.muted}}>↺ New session</button>
       </div>

       {/* Spike alerts */}
       {monSpikes.length > 0 && <div style={{marginBottom:16}}>
        {monSpikes.map((sp,i)=>(
         <div key={i} style={{background:sp.level==="severe"?S.severe+"12":S.moderate+"12",border:`1px solid ${sp.level==="severe"?S.severe:S.moderate}40`,borderRadius:7,padding:"8px 14px",marginBottom:6,display:FX,gap:10,alignItems:"center"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:sp.level==="severe"?S.severe:S.moderate,flexShrink:0}}/>
          <span style={{fontSize:12,color:sp.level==="severe"?S.severe:S.moderate,fontFamily:FF,fontWeight:600}}>{sp.label} {sp.val}</span>
          <span style={{fontSize:10,color:S.muted,fontFamily:FF}}>at {sp.min}min</span>
          {!popup && <button onClick={()=>{setPopup(sp);setPopupStep(0);setPopupReactive(null);setPopupSymptoms([]);setPopupSeverity(null);setPopupAnalysis("");}} style={{marginLeft:"auto",background:"none",border:`1px solid ${sp.level==="severe"?S.severe:S.moderate}60`,borderRadius:4,padding:"3px 8px",cursor:CP,fontSize:10,fontFamily:FF,color:sp.level==="severe"?S.severe:S.moderate}}>Log reaction →</button>}
         </div>
        ))}
       </div>}

       {/* Live charts */}
       <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <MiniChart pts={visiblePts} key_="hr"      color="#D04060" label="Heart Rate"    unit="bpm" />
        <MiniChart pts={visiblePts} key_="hrv"     color="#A06080" label="HRV"           unit="ms" />
        <MiniChart pts={visiblePts} key_="glucose" color="#50A060" label="Glucose"       unit="mg/dL" />
        <MiniChart pts={visiblePts} key_="temp"    color="#C08040" label="Body Temp"     unit="°C" />
       </div>

       {/* Current values bar */}
       {currentPt && <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"10px 16px",display:FX,gap:20,flexWrap:"wrap"}}>
        {[["SpO2",currentPt.spo2,"%","#4090A0",v=>v>=96],["HR",currentPt.hr,"bpm","#D04060",v=>v<90],["HRV",currentPt.hrv,"ms","#A06080",v=>v>35],["Glucose",currentPt.glucose,"mg/dL","#50A060",v=>v<130],["Temp",currentPt.temp,"°C","#C08040",v=>v<37.1]].map(([label,val,unit,color,good])=>(
         <div key={label} style={{textAlign:"center"}}>
          <div style={{fontSize:9,color:S.muted,fontFamily:FF,marginBottom:2}}>{label}</div>
          <div style={{fontSize:16,fontWeight:700,color:good(val)?color:S.severe}}>{val}</div>
          <div style={{fontSize:9,color:S.muted,fontFamily:FF}}>{unit}</div>
         </div>
        ))}
        <div style={{marginLeft:"auto",display:FX,flexDirection:"column",justifyContent:"center",alignItems:"flex-end"}}>
         <div style={{fontSize:9,color:S.muted,fontFamily:FF}}>Time remaining</div>
         <div style={{fontSize:14,color:S.gold,fontWeight:600}}>{Math.max(0,120-( currentPt?.min||0))}min</div>
        </div>
       </div>}
      </div>
     )}

     {/* ── CLINICIAN VIEW ── */}
     {clinView && diary.length > 0 && <div style={{marginTop:24}}>
      <div style={{fontSize:9,letterSpacing:3,color:"#6040A0",fontFamily:FF,marginBottom:12}}>🏥 CLINICIAN DASHBOARD — {diary.length} LOGGED REACTION{diary.length>1?"S":""}</div>
      {diary.map(e=>(
       <div key={e.id} style={{background:"#100E18",border:`1px solid ${e.flagClinic?S.severe+"40":"#2A2040"}`,borderLeft:`3px solid ${e.flagClinic?S.severe:"#4A3080"}`,borderRadius:8,padding:"14px 16px",marginBottom:8}}>
        <div style={{display:FX,justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
         <div>
          <div style={{fontSize:13,color:S.text,fontWeight:600}}>{e.meal} <span style={{fontSize:11,color:S.muted,fontFamily:FF,fontWeight:400}}>· {new Date(e.ts).toLocaleString("en-SE")}</span></div>
          <div style={{fontSize:11,color:S.muted,fontFamily:FF,marginTop:2}}>Foods: {e.foods.join(", ")||"not logged"}</div>
         </div>
         {e.flagClinic&&<div style={{background:S.severe+"20",border:`1px solid ${S.severe}40`,borderRadius:5,padding:"3px 8px",fontSize:10,color:S.severe,fontFamily:FF,fontWeight:600}}>⚠️ REVIEW</div>}
        </div>
        <div style={{display:FX,gap:8,flexWrap:"wrap",marginBottom:8}}>
         {e.spike&&<span style={{background:S[e.spike.level]+"15",border:`1px solid ${S[e.spike.level]}40`,borderRadius:4,padding:"2px 8px",fontSize:11,fontFamily:FF,color:S[e.spike.level]}}>{e.spike.label} {e.spike.val}</span>}
         <span style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:4,padding:"2px 8px",fontSize:11,fontFamily:FF,color:S.muted}}>Reactive food: {e.reactive?"possible":"no"}</span>
         {e.severity&&<span style={{background:S[e.severity]+"15",border:`1px solid ${S[e.severity]}40`,borderRadius:4,padding:"2px 8px",fontSize:11,fontFamily:FF,color:S[e.severity],textTransform:"capitalize"}}>{e.severity}</span>}
         {e.symptoms.map(s=><span key={s} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:4,padding:"2px 8px",fontSize:11,fontFamily:FF,color:S.muted}}>{s}</span>)}
        </div>
        {e.analysis&&<div style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:6,padding:"10px 12px",fontSize:11,color:"#9AA8B0",lineHeight:1.7,fontFamily:FF}}><span style={{color:"#5080A8",fontWeight:600}}>Mario's analysis: </span>{e.analysis.slice(0,300)}{e.analysis.length>300?"…":""}</div>}
       </div>
      ))}
     </div>}

     {diary.length === 0 && clinView && <div style={{background:"#0E0C18",border:"1px solid #1A1828",borderRadius:8,padding:"20px",textAlign:"center",color:S.muted,fontFamily:FF,fontSize:12,marginTop:20}}>No reactions logged yet. Run a monitoring session to populate the clinician feed.</div>}
    </div>}
    {tab==="protocol"&&<div>
     <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
      {[{label:"SEVERE — 9 MONTHS",color:S.severe,text:"Beef, coffee, garlic, onion, tomato, all rice, black tea, cauliflower, Brussels sprout, chickpea, cilantro, bell pepper, scallion, canola oil, lobster, pistachio, poppy seed, capers, cumin, endive, honeydew, monk fruit, mulberry, wakame, jalapeño, egg white"},
       {label:"MODERATE — 6 MONTHS",color:S.moderate,text:"All common grains · Most fish · Most vegetables · Nearly all fruits · Most nuts & herbs"},
       {label:"CANDIDA — 3 MONTHS",color:S.candida,text:"No sugars (agave, honey, maple, molasses) · No yeast (baker's, brewer's, nutritional) · No alcohol, vinegar"},
       {label:"WHEY — 6 MONTHS",color:S.whey,text:"No cow's, goat's, or sheep's milk · No whey protein"},
      ].map(({label,color,text})=>(
       <div key={label} style={{background:"#111008",border:`1px solid ${color}25`,borderLeft:`3px solid ${color}`,borderRadius:8,padding:"12px 14px"}}>
        <div style={{fontSize:9,letterSpacing:3,color,fontFamily:FF,marginBottom:5}}>{label}</div>
        <div style={{fontSize:11,color:S.muted,fontFamily:FF,lineHeight:1.7}}>{text}</div>
       </div>
      ))}
     </div>
     {PHASES.map(ph=>(
      <div key={ph.id} style={{background:expandPh===ph.id?"#141210":S.card,border:`1px solid ${expandPh===ph.id?ph.color+"40":S.border}`,borderLeft:`3px solid ${ph.color}`,borderRadius:7,marginBottom:3,overflow:"hidden"}}>
       <button onClick={()=>setExpandPh(expandPh===ph.id?null:ph.id)} style={{width:"100%",background:"none",border:"none",cursor:CP,padding:"10px 14px",display:FX,justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:FX,gap:12,alignItems:"center"}}><span style={{fontSize:12,color:ph.color,fontWeight:600}}>{ph.label}</span><span style={{fontSize:10,color:S.muted,fontFamily:FF}}>{ph.range}</span></div>
        <span style={{color:S.muted,fontSize:14}}>{expandPh===ph.id?"−":"+"}</span>
       </button>
       {expandPh===ph.id&&<div style={{padding:"0 14px 12px"}}>
        <div style={{display:FX,flexWrap:"wrap",gap:5,marginBottom:6}}>{ph.rules.map((r,i)=><span key={i} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:4,padding:"3px 9px",fontSize:11,color:S.muted,fontFamily:FF}}>{r}</span>)}</div>
        <div style={{fontSize:11,color:S.goldDim,fontFamily:FF,fontStyle:"italic"}}>{ph.note}</div>
       </div>}
      </div>
     ))}
    </div>}
    {tab==="rotation"&&<div>
     <div style={{display:FX,gap:8,marginBottom:16}}>
      {[1,2,3,4].map(d=><button key={d} onClick={()=>setRotDay(d)} style={{background:rotDay===d?S.gold:S.card,border:`1px solid ${rotDay===d?S.gold:S.border}`,color:rotDay===d?"#0D0C0A":S.muted,borderRadius:7,padding:"6px 18px",cursor:CP,fontSize:12,fontFamily:FF,fontWeight:rotDay===d?700:400}}>Day {d}</button>)}
     </div>
     <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
      {[["grains","🌾","Grains"],["veg","🥬","Vegetables"],["fruit","🍓","Fruit"],["protein","🐟","Protein"],["misc","🫙","Nuts & Herbs"]].map(([k,em,label])=>(
       <div key={k} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"11px 12px",gridColumn:k==="misc"?"1/-1":undefined}}>
        <div style={{fontSize:9,letterSpacing:2,color:S.goldDim,fontFamily:FF,marginBottom:7}}>{em} {label.toUpperCase()}</div>
        <div style={{display:FX,flexWrap:"wrap",gap:3}}>{ROT[rotDay][k].map(f=><span key={f} style={{background:"#181610",border:`1px solid ${S.border}`,borderRadius:3,padding:"2px 7px",fontSize:11,fontFamily:FF,color:S.muted}}>{f}</span>)}</div>
       </div>
      ))}
     </div>
    </div>}
    {tab==="meals"&&<div onClick={e=>e.stopPropagation()}>
     <div style={{display:FX,gap:8,marginBottom:16}}>
      {[1,2,3,4].map(d=><button key={d} onClick={()=>{setRotDay(d);setPicker(null);}} style={{background:rotDay===d?S.gold:S.card,border:`1px solid ${rotDay===d?S.gold:S.border}`,color:rotDay===d?"#0D0C0A":S.muted,borderRadius:7,padding:"6px 18px",cursor:CP,fontSize:12,fontFamily:FF,fontWeight:rotDay===d?700:400}}>Day {d}</button>)}
     </div>
     <div style={{display:FX,flexDirection:"column",gap:7}}>
      {[["breakfast","🌅","Breakfast"],["snack1","🍓","Snack"],["lunch","🍽️","Lunch"],["snack2","🫙","Snack"],["dinner","🐟","Dinner"],["snack3","🌿","Evening"]].map(([k,em,label])=>{
       const meal=MEALS[rotDay][k];
       const selP=meal.isProtein?getP(rotDay,k):null;
       const pk=`${rotDay}-${k}`;
       const isOpen=picker===pk;
       const isRecipeOpen=recipeTarget===pk;
       return <div key={k} style={{background:S.card,border:`1px solid ${isOpen?S.gold+"50":S.border}`,borderRadius:8,padding:"11px 14px"}}>
        <div style={{display:FX,gap:10,alignItems:"flex-start"}}>
         <span style={{fontSize:18,flexShrink:0}}>{em}</span>
         <div style={{flex:1}}>
          <div style={{display:FX,alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
           <span style={{fontSize:11,color:S.gold,fontWeight:600}}>{label}</span>
           {meal.isProtein&&<div style={{position:"relative",marginLeft:"auto"}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setPicker(isOpen?null:pk)} style={{background:isOpen?S.gold+"20":"#181610",border:`1px solid ${isOpen?S.gold:S.border}`,borderRadius:20,padding:"2px 8px",cursor:CP,display:FX,alignItems:"center",gap:4}}>
             <span style={{fontSize:10}}>🔄</span><span style={{fontSize:10,color:isOpen?S.gold:"#C0A870",fontFamily:FF,fontWeight:600}}>{selP}</span><span style={{fontSize:8,color:S.muted}}>▾</span>
            </button>
            {isOpen&&<div style={{position:"absolute",top:"calc(100% + 3px)",right:0,background:"#1C1A14",border:`1px solid ${S.gold}40`,borderRadius:7,padding:"4px",zIndex:300,minWidth:180,boxShadow:"0 8px 24px #00000080"}}>
             {Object.entries(meal.methods).map(([p,m])=>(
              <button key={p} onClick={()=>setP(rotDay,k,p)} style={{display:FX,justifyContent:"space-between",width:"100%",background:p===selP?S.gold+"15":"none",border:`1px solid ${p===selP?S.gold+"40":"transparent"}`,borderRadius:4,padding:"4px 7px",cursor:CP,marginBottom:1}}>
               <span style={{fontSize:11,color:p===selP?S.gold:S.text,fontFamily:FF}}>{p}</span><span style={{fontSize:10,color:S.muted,fontFamily:FF}}>{m}</span>
              </button>
             ))}
            </div>}
           </div>}
          </div>
          <div style={{fontSize:12,color:"#C0B898",lineHeight:1.6}}>
           {meal.isProtein?<><span style={{color:S.gold,fontWeight:600}}>{selP}</span> <span style={{color:S.muted,fontSize:10}}>({meal.methods[selP]||"prepared"})</span> — {meal.base} · <span style={{color:S.muted}}>{meal.sides}</span></>:meal.base}
          </div>
          <div style={{marginTop:7}}>
           <button onClick={()=>{if(isRecipeOpen){setRecipeTarget(null);setRecipeSteps(null);}else{setRecipeTarget(pk);fetchRecipeSteps(rotDay,k,meal.isProtein?selP:"",meal.base,meal.sides);}}} style={{background:"none",border:`1px solid ${isRecipeOpen?S.gold:S.border}`,borderRadius:5,padding:"3px 10px",cursor:CP,fontSize:10,fontFamily:FF,color:isRecipeOpen?S.gold:S.muted,display:FX,alignItems:"center",gap:4}}>
            <span>{isRecipeOpen?"▾":"▸"}</span><span>{isRecipeOpen?"Hide recipe":"▸ Step-by-step recipe"}</span>
           </button>
           {isRecipeOpen&&<div style={{marginTop:8,background:S.bg,border:`1px solid ${S.gold}20`,borderRadius:7,padding:"12px 14px"}}>
            {recipeLoading?<div style={{display:FX,gap:5,alignItems:"center",padding:"8px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:S.goldDim,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}<span style={{fontSize:11,color:S.muted,fontFamily:FF,marginLeft:4}}>Mario is writing your recipe…</span></div>
            :recipeSteps?<div style={{fontSize:11,fontFamily:FF,lineHeight:1.8}}>{recipeSteps.split("\n").map((line,ri)=>{
             if(!line.trim())return<div key={ri} style={{height:4}}/>;
             if(line.startsWith("PREP TIME")||line.startsWith("COOK TIME"))return<div key={ri} style={{color:S.goldDim,fontSize:10,marginBottom:6}}>{line}</div>;
             if(line.startsWith("INGREDIENTS"))return<div key={ri} style={{color:S.gold,fontWeight:700,fontSize:10,letterSpacing:2,marginTop:8,marginBottom:4}}>INGREDIENTS</div>;
             if(line.startsWith("STEPS"))return<div key={ri} style={{color:S.gold,fontWeight:700,fontSize:10,letterSpacing:2,marginTop:8,marginBottom:4}}>STEPS</div>;
             if(line.startsWith("CLINICAL NOTE"))return<div key={ri} style={{marginTop:10,borderTop:`1px solid ${S.border}`,paddingTop:8,color:"#7A9060",fontSize:10,fontStyle:"italic"}}>🌿 {line.replace("CLINICAL NOTE:","").trim()}</div>;
             if(line.match(/^\d+\./))return<div key={ri} style={{display:FX,gap:8,marginBottom:4}}><span style={{color:S.gold,fontWeight:700,minWidth:16}}>{line.match(/^\d+/)[0]}.</span><span style={{color:"#C0B898",flex:1}}>{line.replace(/^\d+\.\s*/,"")}</span></div>;
             if(line.startsWith("-"))return<div key={ri} style={{color:S.muted,paddingLeft:12,marginBottom:2}}>· {line.slice(1).trim()}</div>;
             return<div key={ri} style={{color:S.muted}}>{line}</div>;
            })}</div>:null}
           </div>}
          </div>
         </div>
        </div>
       </div>;
      })}
     </div>
    </div>}
    {tab==="generate"&&<div>
     <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
      <div style={{display:FX,flexDirection:"column",gap:12}}>
       <div>
        <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:7}}>ROTATION DAY</div>
        <div style={{display:FX,gap:5}}>{[1,2,3,4].map(d=><button key={d} onClick={()=>{setRotDay(d);setGenResult(null);}} style={{background:rotDay===d?S.gold:S.card,border:`1px solid ${rotDay===d?S.gold:S.border}`,color:rotDay===d?"#0D0C0A":S.muted,borderRadius:6,padding:"5px 14px",cursor:CP,fontSize:11,fontFamily:FF,fontWeight:rotDay===d?700:400}}>Day {d}</button>)}</div>
       </div>
       <div>
        <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:7}}>PHASE</div>
        {[{id:"detox",label:"Detox / Months 1–3",emoji:"🔒"},{id:"post3months",label:"Post Month 3+",emoji:"🍓"}].map(ph=>(
         <button key={ph.id} onClick={()=>{setGenPhase(ph.id);setGenResult(null);if(ph.id==="detox")setEatPat("standard");}} style={{display:FX,alignItems:"center",gap:7,width:"100%",background:genPhase===ph.id?"#1A1610":S.card,border:`1px solid ${genPhase===ph.id?S.gold:S.border}`,borderRadius:6,padding:"7px 10px",cursor:CP,marginBottom:3,textAlign:"left"}}>
          <span>{ph.emoji}</span><span style={{fontSize:11,color:genPhase===ph.id?S.gold:S.text,fontWeight:600,fontFamily:FF}}>{ph.label}</span>
         </button>
        ))}
       </div>
       <div>
        <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:7}}>SCOPE</div>
        <div style={{display:FX,gap:5,flexWrap:"wrap"}}>{[["full_day","📅","Full Day"],["breakfast","🌅","Breakfast"],["lunch","🍽️","Lunch"],["dinner","🐟","Dinner"]].map(([id,em,label])=><button key={id} onClick={()=>{setMealScope(id);setGenResult(null);}} style={{background:mealScope===id?"#1A1610":S.card,border:`1px solid ${mealScope===id?S.gold:S.border}`,color:mealScope===id?S.gold:S.muted,borderRadius:5,padding:"5px 10px",cursor:CP,fontSize:11,fontFamily:FF,display:FX,alignItems:"center",gap:3}}><span>{em}</span>{label}</button>)}</div>
       </div>
      </div>
      <div style={{display:FX,flexDirection:"column",gap:12}}>
       <div>
        <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:7}}>CUISINE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
         {CUISINES.map(c=><button key={c.id} onClick={()=>{setCuisine(c.id);setGenResult(null);}} style={{background:cuisine===c.id?"#1A1610":S.card,border:`1px solid ${cuisine===c.id?S.gold:S.border}`,borderRadius:6,padding:"8px 9px",cursor:CP,textAlign:"left"}}>
          <div style={{fontSize:14,marginBottom:2}}>{c.flag}</div>
          <div style={{fontSize:11,color:cuisine===c.id?S.gold:S.text,fontWeight:600,fontFamily:FF}}>{c.label}</div>
          <div style={{fontSize:9,color:S.muted,fontFamily:FF,lineHeight:1.3}}>{c.desc}</div>
         </button>)}
        </div>
       </div>
       <div>
        <div style={{display:FX,justifyContent:"space-between",marginBottom:7}}>
         <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF}}>EATING PATTERN</div>
         {genPhase==="detox"&&<span style={{fontSize:9,color:S.candida,fontFamily:FF}}>🔒 Fasting at Month 3+</span>}
        </div>
        {EAT_PATS.map(ep=>{
         const locked=ep.fasting&&genPhase==="detox"; const sel=eatPat===ep.id;
         return <div key={ep.id}>
          <button onClick={()=>{if(!locked){setEatPat(ep.id);setGenResult(null);}}} style={{width:"100%",background:locked?"#0F0E0C":sel?"#1A1610":S.card,border:`1px solid ${locked?"#1E1C16":sel?S.gold:S.border}`,borderRadius:6,padding:"7px 9px",cursor:locked?"not-allowed":"pointer",textAlign:"left",marginBottom:3,opacity:locked?0.4:1}}>
           <div style={{display:FX,alignItems:"center",gap:6}}>
            <span style={{fontSize:12}}>{locked?"🔒":ep.emoji}</span>
            <div><div style={{fontSize:11,color:locked?S.muted:sel?S.gold:S.text,fontWeight:600,fontFamily:FF}}>{ep.label}</div><div style={{fontSize:9,color:locked?"#2A2820":S.muted,fontFamily:FF}}>{ep.desc}</div></div>
           </div>
          </button>
          {sel&&ep.fasting&&!locked&&<div style={{background:"#0C0E10",border:"1px solid #304060",borderTop:"none",borderRadius:"0 0 6px 6px",marginBottom:3}}>
           {!research[ep.id]?<button onClick={()=>fetchResearch(ep.id)} disabled={resLoad===ep.id} style={{width:"100%",background:"none",border:"none",borderTop:"1px solid #1A2030",padding:"7px 9px",cursor:resLoad===ep.id?"wait":"pointer",display:FX,gap:6,alignItems:"center"}}>
            {resLoad===ep.id?<><span style={{display:FX,gap:2}}>{[0,1,2].map(i=><span key={i} style={{width:4,height:4,borderRadius:"50%",background:"#5080A8",animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,display:"inline-block"}}/>)}</span><span style={{fontSize:10,color:"#5080A8",fontFamily:FF}}>Searching PubMed…</span></>:<><span>🔬</span><span style={{fontSize:10,color:"#5080A8",fontFamily:FF,fontWeight:600}}>Research for your profile</span></>}
           </button>:<div style={{padding:"10px 12px",maxHeight:220,overflowY:"auto"}}>
            <div style={{fontSize:10,lineHeight:1.7,color:"#98A8B8",fontFamily:FF}}>{research[ep.id].split("\n").slice(0,12).join("\n")}</div>
           </div>}
          </div>}
         </div>;
        })}
       </div>
      </div>
     </div>
     <button onClick={genMenu} disabled={!cuisine||genLoad} style={{width:"100%",background:!cuisine?S.card:genLoad?"#2A2010":S.gold,border:`1px solid ${!cuisine?S.border:S.gold}`,color:!cuisine?S.muted:genLoad?S.goldDim:"#0D0C0A",borderRadius:7,padding:"11px",cursor:!cuisine?"not-allowed":"pointer",fontSize:12,fontFamily:FF,fontWeight:700,marginBottom:16,display:FX,alignItems:"center",justifyContent:"center",gap:7}}>
      {genLoad?<><span>Generating</span><span style={{display:FX,gap:3}}>{[0,1,2].map(i=><span key={i} style={{width:4,height:4,borderRadius:"50%",background:S.goldDim,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,display:"inline-block"}}/>)}</span></>:<><span>✦</span>{!cuisine?"Select a cuisine to generate":`Generate · ${CUISINES.find(c=>c.id===cuisine)?.label} · Day ${rotDay}`}</>}
     </button>
     {genResult&&<div style={{background:S.card,border:`1px solid ${S.gold}30`,borderRadius:9,padding:"18px 20px",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:FX,justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:12,color:S.text}}>{CUISINES.find(c=>c.id===cuisine)?.flag} {CUISINES.find(c=>c.id===cuisine)?.label} · Day {rotDay}</span><button onClick={()=>setGenResult(null)} style={{background:"none",border:`1px solid ${S.border}`,borderRadius:5,color:S.muted,padding:"3px 9px",cursor:CP,fontSize:10,fontFamily:FF}}>↺</button></div>
      <div style={{fontSize:12,lineHeight:1.9,color:"#C8BEA8"}}>
       {genResult.split("\n").map((line,i)=>{
        if(!line.trim()) return <div key={i} style={{height:5}}/>;
        const bm=line.match(/^\*\*(.+)\*\*(.*)$/);
        if(bm) return <div key={i} style={{marginTop:i>0?12:0}}><span style={{color:S.gold,fontWeight:700,fontSize:13}}>{bm[1]}</span>{bm[2]&&<span>{bm[2]}</span>}</div>;
        if(line.match(/^Notes/i)) return <div key={i} style={{marginTop:14,borderTop:`1px solid ${S.border}`,paddingTop:10,fontSize:11,color:S.goldDim,fontFamily:FF,fontStyle:"italic"}}><strong>Notes · </strong>{line.replace(/^Notes[\s:]*/i,"")}</div>;
        return <div key={i} style={{color:"#A89878",fontSize:11,fontFamily:FF}}>{line}</div>;
       })}
      </div>
     </div>}
    </div>}
    {tab==="grocery"&&<div>
     <div style={{display:FX,justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div>
       <div style={{fontSize:9,letterSpacing:4,color:"#4A6830",fontFamily:FF,marginBottom:4}}>WEEKLY GROCERY ORDER</div>
       <div style={{fontSize:20,fontWeight:600}}>Smart Shopping List</div>
       <div style={{fontSize:12,color:S.muted,fontFamily:FF,marginTop:3}}>Built from your 4-day rotation. ALCAT-safe only. Wild-caught & organic prioritised.</div>
      </div>
      <div style={{fontSize:8,color:"#4A3820",fontFamily:FF,background:"#1A1408",border:"1px solid #3A2808",borderRadius:3,padding:"3px 8px",letterSpacing:0.5}}>PATENT PENDING · SE 2615203-3</div>
     </div>
     <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:10,padding:"16px",marginBottom:16}}>
      <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:10}}>ROTATION DAYS THIS WEEK</div>
      <div style={{display:FX,gap:6,marginBottom:14,flexWrap:"wrap"}}>
       {[1,2,3,4].map(d=>{
        const sel=groceryWeek.includes(d);
        return <button key={d} onClick={()=>setGroceryWeek(prev=>sel?prev.filter(x=>x!==d):[...prev,d].sort())} style={{background:sel?"#1A1610":S.bg,border:`1px solid ${sel?S.gold:S.border}`,borderRadius:7,padding:"6px 16px",cursor:CP,fontSize:12,fontFamily:FF,color:sel?S.gold:S.muted,fontWeight:sel?700:400}}>Day {d}</button>;
       })}
       <div style={{marginLeft:"auto",display:FX,gap:6,alignItems:"center"}}>
        <span style={{fontSize:10,color:S.muted,fontFamily:FF}}>Store:</span>
        {["ICA","Matsmart","Willys","Coop"].map(s=>(
         <button key={s} onClick={()=>setGroceryStore(s)} style={{background:groceryStore===s?"#1A1610":S.bg,border:`1px solid ${groceryStore===s?S.gold:S.border}`,borderRadius:5,padding:"4px 10px",cursor:CP,fontSize:10,fontFamily:FF,color:groceryStore===s?S.gold:S.muted}}>{s}</button>
        ))}
       </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
       {groceryWeek.map(d=>(
        <div key={d} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:7,padding:"10px 12px"}}>
         <div style={{fontSize:9,color:S.goldDim,fontFamily:FF,marginBottom:6,fontWeight:600}}>DAY {d}</div>
         <div style={{fontSize:10,color:S.muted,fontFamily:FF,lineHeight:1.7}}>
          <div>🐟 {ROT[d].protein.slice(0,2).join(", ")}</div>
          <div>🥬 {ROT[d].veg.slice(0,3).join(", ")}</div>
          <div>🌾 {ROT[d].grains.slice(0,2).join(", ")}</div>
          <div>🍓 {ROT[d].fruit.slice(0,2).join(", ")}</div>
         </div>
        </div>
       ))}
      </div>
      <button onClick={buildGroceryList} disabled={groceryLoad||groceryWeek.length===0} style={{width:"100%",background:groceryLoad?"#1A1810":groceryWeek.length===0?S.card:S.gold,border:`1px solid ${groceryLoad||groceryWeek.length===0?S.border:S.gold}`,color:groceryLoad?"#7A6030":groceryWeek.length===0?S.muted:"#0D0C0A",borderRadius:7,padding:"11px",cursor:groceryLoad||groceryWeek.length===0?"not-allowed":"pointer",fontSize:12,fontFamily:FF,fontWeight:700,display:FX,alignItems:"center",justifyContent:"center",gap:7}}>
       {groceryLoad?<><span style={{display:FX,gap:3}}>{[0,1,2].map(i=><span key={i} style={{width:4,height:4,borderRadius:"50%",background:S.goldDim,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,display:"inline-block"}}/>)}</span><span>Building your list…</span></> :<><span>🛒</span><span>Generate grocery list · Days {groceryWeek.join(", ")}</span></>}
      </button>
     </div>
     {groceryList&&<div style={{background:S.card,border:`1px solid ${S.gold}25`,borderRadius:10,padding:"18px 20px"}}>
      <div style={{display:FX,justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
       <div style={{fontSize:9,letterSpacing:3,color:S.goldDim,fontFamily:FF}}>🛒 YOUR WEEKLY ALCAT GROCERY LIST</div>
       <div style={{display:FX,gap:6}}>
        <button onClick={()=>{navigator.clipboard&&navigator.clipboard.writeText(groceryList.replace(/\*\*/g,""));setGroceryExport(true);setTimeout(()=>setGroceryExport(false),2000);}} style={{background:groceryExport?"#1A2810":S.bg,border:`1px solid ${groceryExport?"#4A8030":S.border}`,borderRadius:5,padding:"4px 10px",cursor:CP,fontSize:10,fontFamily:FF,color:groceryExport?"#4A8030":S.muted}}>{groceryExport?"✓ Copied":"Copy list"}</button>
        <button onClick={()=>setGroceryList(null)} style={{background:"none",border:`1px solid ${S.border}`,borderRadius:5,color:S.muted,padding:"4px 10px",cursor:CP,fontSize:10,fontFamily:FF}}>↺ New</button>
       </div>
      </div>
      <div style={{fontSize:12,lineHeight:2,color:"#C8BEA8"}}>
       {groceryList.split("\n").map((line,gi)=>{
        if(!line.trim())return<div key={gi} style={{height:6}}/>;
        const bm=line.match(/^\*\*(.+)\*\*/);
        if(bm)return<div key={gi} style={{marginTop:gi>0?14:0,marginBottom:6,display:FX,alignItems:"center",gap:8}}><div style={{height:1,flex:1,background:S.border}}/><span style={{fontSize:9,letterSpacing:2,color:S.gold,fontFamily:FF,fontWeight:700}}>{bm[1].toUpperCase()}</span><div style={{height:1,flex:1,background:S.border}}/></div>;
        if(line.startsWith("- ")||line.startsWith("• "))return<div key={gi} style={{display:FX,gap:8,alignItems:"flex-start",marginBottom:2}}><span style={{color:S.goldDim,flexShrink:0}}>·</span><span style={{color:S.muted,fontFamily:FF,fontSize:11}}>{line.slice(2)}</span></div>;
        if(line.match(/^STORE NOTES/i))return<div key={gi} style={{marginTop:14,borderTop:`1px solid ${S.border}`,paddingTop:10,fontSize:10,color:S.goldDim,fontFamily:FF,fontWeight:700,letterSpacing:1}}>STORE NOTES</div>;
        return<div key={gi} style={{fontSize:11,color:S.muted,fontFamily:FF}}>{line}</div>;
       })}
      </div>
      <div style={{marginTop:20,borderTop:`1px solid ${S.border}`,paddingTop:14}}>
       <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:10}}>ORDER ONLINE</div>
       <div style={{display:FX,gap:8,flexWrap:"wrap"}}>
        {[{name:"ICA Online",url:"https://www.ica.se",icon:"🔴",note:"Hemleverans"},
         {name:"Matsmart",url:"https://www.matsmart.se",icon:"🟢",note:"Organic discounts"},
         {name:"Nordic Superfood",url:"https://nordicsuperfood.se",icon:"🌿",note:"Wild-caught & organic"},
         {name:"Willys",url:"https://www.willys.se",icon:"🔵",note:"Budget-friendly"},
         {name:"Rohkost.de",url:"https://www.rohkost.de",icon:"🌱",note:"Rare protocol items"},
        ].map(s=>(
         <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:7,padding:"8px 12px",textDecoration:"none",display:FX,gap:6,alignItems:"center"}}>
          <span style={{fontSize:14}}>{s.icon}</span>
          <div>
           <div style={{fontSize:11,color:S.text,fontWeight:600}}>{s.name}</div>
           <div style={{fontSize:9,color:S.muted,fontFamily:FF}}>{s.note}</div>
          </div>
         </a>
        ))}
       </div>
      </div>
     </div>}
     {!groceryList&&<div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"14px 16px"}}>
      <div style={{fontSize:9,letterSpacing:3,color:S.muted,fontFamily:FF,marginBottom:10}}>SHOPPING RULES — ALWAYS APPLY</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
       {[{icon:"🐟",rule:"Fish: wild-caught only",detail:"Farm-raised fish contains inflammatory omega-6. Look for MSC certified."},
        {icon:"🥩",rule:"Meat: grass-fed where possible",detail:"Conventional meat has higher arachidonic acid. Bison and lamb are naturally lean."},
        {icon:"🫙",rule:"Oils: tallow, coconut, avocado only",detail:"No sunflower, canola, rapeseed, or vegetable oil — even if labelled healthy."},
        {icon:"🥬",rule:"Veg: organic for today's rotation",detail:"Buy organic for items on your plate today. Don't buy ahead — freshness matters."},
        {icon:"⚠️",rule:"Labels: no hidden yeast/sugars",detail:"Nutritional yeast, malt extract, dextrose — all Candida triggers."},
        {icon:"🌾",rule:"Grains: certified GF",detail:"GF oats must be certified — regular oats are contaminated with wheat in most mills."},
       ].map(({icon,rule,detail})=>(
        <div key={rule} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:6,padding:"10px 12px",display:FX,gap:8}}>
         <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
         <div>
          <div style={{fontSize:11,color:S.gold,fontWeight:600,marginBottom:3}}>{rule}</div>
          <div style={{fontSize:10,color:S.muted,fontFamily:FF,lineHeight:1.5}}>{detail}</div>
         </div>
        </div>
       ))}
      </div>
     </div>}
    </div>}
    {tab==="lookup"&&<div>
     <input value={foodQ} onChange={e=>setFoodQ(e.target.value)} placeholder="Search — e.g. salmon, quinoa, avocado…" style={{width:"100%",background:S.card,border:`1px solid ${S.border}`,borderRadius:7,padding:"11px 14px",fontSize:13,color:S.text,fontFamily:FF,outline:"none",boxSizing:"border-box",marginBottom:14}}/>
     {foodResults.map(({food,level})=>{
      const cols={severe:S.severe,moderate:S.moderate,mild:S.mild,candida:S.candida,whey:S.whey};
      const periods={severe:"9 months",moderate:"6 months",mild:"3 months",candida:"3mo (Candida)",whey:"6mo (Whey)"};
      const c=cols[level];
      return <div key={food} style={{background:S.card,border:`1px solid ${c}30`,borderLeft:`3px solid ${c}`,borderRadius:7,padding:"10px 14px",display:FX,justifyContent:"space-between",marginBottom:5}}>
       <div><div style={{fontSize:14,color:S.text}}>{food}</div><div style={{fontSize:11,color:S.muted,fontFamily:FF,textTransform:"capitalize"}}>{level} reactor</div></div>
       <div style={{textAlign:"right"}}><div style={{fontSize:11,color:c,fontWeight:600,fontFamily:FF}}>AVOID</div><div style={{fontSize:10,color:S.muted,fontFamily:FF}}>{periods[level]}</div></div>
      </div>;
     })}
     {foodQ.length>1&&foodResults.length===0&&<div style={{background:"#0D1810",border:`1px solid ${S.green}30`,borderLeft:`3px solid ${S.green}`,borderRadius:7,padding:"12px 16px"}}>
      <div style={{fontSize:14,color:S.text,marginBottom:3}}>✓ Not in reactive lists</div>
      <div style={{fontSize:11,color:"#70A070",fontFamily:FF}}>"{foodQ}" does not appear in your ALCAT reactive lists. If it is a whole food it is likely safe — confirm it is not a derivative of a reactive ingredient.</div>
     </div>}
    </div>}
    {tab==="chat"&&<div style={{display:FX,flexDirection:"column",height:"calc(100vh - 200px)"}}>
     <div style={{flex:1,overflowY:"auto",marginBottom:12,display:FX,flexDirection:"column",gap:12}}>
      {chatMsgs.map((m,i)=>(
       <div key={i} style={{display:FX,justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
        {m.role==="assistant"&&<div style={{width:26,height:26,borderRadius:"50%",background:"#1A1810",border:`1px solid ${S.gold}40`,display:FX,alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,marginRight:7,marginTop:2}}>M</div>}
        <div style={{maxWidth:"72%",background:m.role==="user"?"#181610":S.card,border:`1px solid ${m.role==="user"?S.border:S.gold+"20"}`,borderRadius:m.role==="user"?"12px 12px 4px 12px":"4px 12px 12px 12px",padding:"11px 14px",fontSize:12,lineHeight:1.8,color:S.text}}>{m.content}</div>
       </div>
      ))}
      {chatLoad&&<div style={{display:FX,gap:4,paddingLeft:34}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:S.goldDim,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>}
      <div ref={chatEnd}/>
     </div>
     <div style={{display:FX,gap:7}}>
      <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()} placeholder="Ask about your protocol, foods, symptoms, meal ideas…" style={{flex:1,background:S.card,border:`1px solid ${S.border}`,borderRadius:7,padding:"11px 14px",fontSize:12,color:S.text,fontFamily:"Georgia,serif",outline:"none"}}/>
      <button onClick={sendChat} disabled={chatLoad} style={{background:chatLoad?S.card:S.gold,border:`1px solid ${chatLoad?S.border:S.gold}`,color:chatLoad?S.muted:"#0D0C0A",borderRadius:7,padding:"11px 18px",cursor:chatLoad?"not-allowed":"pointer",fontSize:12,fontFamily:FF,fontWeight:600}}>Send</button>
     </div>
    </div>}

   </div>
   {tab==="outcomes"&&<div style={{padding:"4px 0"}}>
    <div style={{fontFamily:"EB Garamond,Georgia,serif",fontSize:22,color:"#C8A882",fontWeight:400,marginBottom:4}}>Outcomes</div>
    <p style={{fontSize:12,color:"#8A8070",fontFamily:FF,fontWeight:300,lineHeight:1.7,marginBottom:20}}>Five markers. Logged at baseline and every check-in. The delta is your evidence.</p>
    <div style={{display:"flex",gap:6,marginBottom:20}}>
     {[{id:"checkin",label:"Check-in"},{id:"chart",label:"Progress"},{id:"population",label:"Population"}].map(v=>(
      <button key={v.id} onClick={()=>setOutcomeView(v.id)}
       style={{background:outcomeView===v.id?"#1A1810":S.card,border:`1px solid ${outcomeView===v.id?S.gold:S.border}`,borderRadius:5,padding:"5px 14px",cursor:"pointer",fontSize:10,fontFamily:FF,color:outcomeView===v.id?S.gold:S.muted,letterSpacing:"0.1em"}}>
       {v.label}</button>))}
    </div>
    {outcomeView==="checkin"&&<div>
     {outcomeBaseline&&<div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"12px 16px",marginBottom:16,display:"flex",gap:20}}>
      <div><div style={{fontSize:8,color:S.gold,fontFamily:FF,letterSpacing:"0.16em",marginBottom:2}}>DAY</div>
       <div style={{fontSize:26,color:S.gold,fontFamily:"EB Garamond,serif"}}>{Math.floor((Date.now()-new Date(outcomeBaseline.date).getTime())/86400000)}</div></div>
      <div><div style={{fontSize:8,color:S.muted,fontFamily:FF,letterSpacing:"0.16em",marginBottom:2}}>CHECK-INS</div>
       <div style={{fontSize:26,color:S.text,fontFamily:"EB Garamond,serif"}}>{outcomeCheckins.length}</div></div>
     </div>}
     <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"16px"}}>
      <div style={{fontSize:9,color:S.gold,fontFamily:FF,letterSpacing:"0.14em",marginBottom:14}}>{outcomeBaseline?"CHECK-IN":"BASELINE — DAY 1"}</div>
      {[{key:"energy",label:"Energy",color:S.gold},{key:"gut",label:"Gut",color:"#70A070"},{key:"sleep",label:"Sleep",color:"#6A80A8"},{key:"mood",label:"Mood",color:"#9A70A0"},{key:"pain",label:"Pain-free",color:S.severe}].map(m=>(
       <div key={m.key} style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
         <span style={{fontSize:9,color:S.muted,fontFamily:FF,letterSpacing:"0.1em"}}>{m.label.toUpperCase()}</span>
         <span style={{fontSize:10,color:m.color,fontFamily:FF,fontWeight:600}}>{outcomeInput[m.key]}/10</span>
        </div>
        <div style={{position:"relative",height:5,background:S.border,borderRadius:3}}>
         <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${outcomeInput[m.key]*10}%`,background:m.color,borderRadius:3}}/>
        </div>
        <input type="range" min="1" max="10" value={outcomeInput[m.key]}
         onChange={e=>setOutcomeInput(p=>({...p,[m.key]:parseInt(e.target.value)}))}
         style={{width:"100%",marginTop:3,accentColor:m.color,cursor:"pointer"}}/>
       </div>
      ))}
      <button onClick={async()=>{
       if(outcomeSaving)return; setOutcomeSaving(true);
       const d=outcomeBaseline?Math.floor((Date.now()-new Date(outcomeBaseline.date).getTime())/86400000):0;
       const e={date:new Date().toISOString(),day:d,scores:{...outcomeInput},note:outcomeNote,isBaseline:!outcomeBaseline};
       if(!outcomeBaseline){setOutcomeBaseline(e);}else{setOutcomeCheckins(p=>[...p,e]);}
       setOutcomeNote(""); setOutcomeSaving(false);
      }} style={{background:S.gold,color:"#0A0A08",borderRadius:7,padding:"10px 24px",fontSize:11,fontFamily:FF,fontWeight:600,border:"none",cursor:"pointer",marginTop:8}}>
       {outcomeSaving?"SAVING…":outcomeBaseline?"SAVE CHECK-IN":"SET BASELINE"}
      </button>
     </div>
    </div>}
    {outcomeView==="chart"&&<div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"16px"}}>
     <div style={{fontSize:9,color:S.gold,fontFamily:FF,letterSpacing:"0.14em",marginBottom:14}}>TRAJECTORY</div>
     {(outcomeBaseline?[outcomeBaseline,...outcomeCheckins]:[]).length<2
      ?<p style={{fontSize:12,color:S.muted,fontFamily:FF}}>Set baseline and complete one check-in to see trajectory.</p>
      :[{key:"energy",color:S.gold},{key:"gut",color:"#70A070"},{key:"sleep",color:"#6A80A8"},{key:"mood",color:"#9A70A0"},{key:"pain",color:S.severe}].map(m=>{
       const entries=outcomeBaseline?[outcomeBaseline,...outcomeCheckins]:[];
       const vals=entries.map(e=>e.scores[m.key]);
       const w=460,h=60;
       const pts=vals.map((v,i)=>`${(i/Math.max(vals.length-1,1))*w},${h-(v/10)*h}`).join(" ");
       return(<div key={m.key} style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
         <span style={{fontSize:9,color:m.color,fontFamily:FF,letterSpacing:"0.1em"}}>{m.key.toUpperCase()}</span>
         <span style={{fontSize:9,color:S.muted,fontFamily:FF}}>{vals[0]}→{vals[vals.length-1]}</span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:h}}>
         <polyline points={pts} fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round"/>
         {vals.map((v,i)=><circle key={i} cx={(i/Math.max(vals.length-1,1))*w} cy={h-(v/10)*h} r="4" fill={m.color}/>)}
        </svg>
       </div>);
      })}
    </div>}
    {outcomeView==="population"&&<div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"16px"}}>
     <div style={{fontSize:9,color:S.gold,fontFamily:FF,letterSpacing:"0.14em",marginBottom:12}}>POPULATION — DAY 90 AVERAGES</div>
     {[{label:"Energy",key:"energy",pop:3.2,color:S.gold},{label:"Gut",key:"gut",pop:4.1,color:"#70A070"},{label:"Sleep",key:"sleep",pop:2.8,color:"#6A80A8"},{label:"Mood",key:"mood",pop:2.5,color:"#9A70A0"},{label:"Pain-free",key:"pain",pop:2.9,color:S.severe}].map(m=>{
      const base=outcomeBaseline?.scores[m.key];
      const latest=outcomeCheckins[outcomeCheckins.length-1]?.scores[m.key];
      const delta=(base&&latest)?latest-base:null;
      return(<div key={m.key} style={{marginBottom:12}}>
       <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:9,color:S.muted,fontFamily:FF,letterSpacing:"0.1em"}}>{m.label.toUpperCase()}</span>
        <span style={{fontSize:9,color:S.muted,fontFamily:FF}}>Pop +{m.pop}</span>
       </div>
       <div style={{position:"relative",height:6,background:S.border,borderRadius:3}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(m.pop/5)*100}%`,background:m.color+"40",borderRadius:3}}/>
        {delta!==null&&<div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.min(Math.max(delta,0)/5*100,100)}%`,background:m.color,borderRadius:3}}/>}
       </div>
      </div>);
     })}
    </div>}
   </div>}
   {/* FOOTER */}
   <div style={{borderTop:`1px solid ${S.border}`,padding:"12px 20px",display:FX,justifyContent:"space-between",alignItems:"center",marginTop:20}}>
    <div style={{fontSize:8,color:"#3A3020",fontFamily:FF}}>
     <span style={{color:"#5A4020",fontWeight:600}}>meet mario</span> · MediBalans AB · Karlavägen 89, Stockholm
    </div>
    <div style={{display:FX,gap:8,alignItems:"center"}}>
     <span style={{fontSize:8,color:"#6A5020",fontFamily:FF,fontWeight:600,background:"#1A1408",border:"1px solid #3A2808",borderRadius:3,padding:"2px 7px",letterSpacing:0.5}}>PATENT PENDING · SE 2615203-3</span>
     <span style={{fontSize:8,color:"#2A2418",fontFamily:FF}}>AI-driven clinical decision support · Global Constraint Rule framework</span>
    </div>
   </div>
   <style>{`
    @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
    @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    *{box-sizing:border-box} input::placeholder{color:#4A4438}
    ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#2A2820;border-radius:2px}
   `}</style>
  </div>
 );
}
