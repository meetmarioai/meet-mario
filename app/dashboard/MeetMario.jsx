import { useState, useRef, useEffect, useCallback } from "react";

// ─── DATA (unchanged) ────────────────────────────────────────────────────────
const P = {
  name:"Christina Wohltahrt",dob:"07/21/1960",testDate:"April 8, 2024",labId:"539273",
  age:64,sex:"female",hormonalStatus:"post-menopausal",
  conditions:["Candida (mild)","Whey sensitivity (moderate)","ALCAT food protocol"],
  severe:["BEEF","BLACK TEA","BELL PEPPER","BRUSSELS SPROUT","CABBAGE","CANOLA OIL","CAPERS","CAULIFLOWER","CHICKPEA","CILANTRO","COFFEE","CUMIN","ENDIVE","GARLIC","GREEN TEA","HONEYDEW MELON","JALAPEÑO PEPPER","LOBSTER","MONK FRUIT","MULBERRY","ONION","PINTO BEAN","PISTACHIO","POPPY SEED","RICE (ALL)","SCALLION","SEA BASS","TOMATO","WAKAME SEAWEED","EGG WHITE"],
  moderate:["ACORN SQUASH","ALLSPICE","AMARANTH","ANCHOVY","APPLE","APRICOT","BANANA","BARLEY","BLACK BEANS","BLACK CURRANT","BLACKBERRY","BOSTON BIBB LETTUCE","BUCKWHEAT","CANNELLINI BEANS","CARDAMOM","CASHEW","CATFISH","CAYENNE PEPPER","CELERY","CHERRY","CHIA","CHICKEN","CHIVES","CLOVE","COCOA","CODFISH","CORN","CRAB","CRANBERRY","CUCUMBER","DATE","DILL","DRAGON FRUIT","DUCK","EGGPLANT","FAVA BEAN","FIG","FLAXSEED","GRAPEFRUIT","GREEN PEA","GROUPER","HADDOCK","HALIBUT","HORSERADISH","ICEBERG LETTUCE","KALE","KELP","KIDNEY BEAN","KIWI","LAMB","LEMON","LIMA BEAN","LICORICE","LIME","MACADAMIA","MACKEREL","MAHI MAHI","MALT","MANGO","MILLET","MUSSEL","MUSTARD GREENS","MUSTARD SEED","NAVY BEAN","NECTARINE","NORI","OAT (GLUTEN FREE)","OKRA","OLIVE","OREGANO","PAPRIKA","PARSNIP","PEACH","PECAN","PEAR","PEPPERMINT","PINE NUT","PINEAPPLE","PLUM","POLLOCK","POMEGRANATE","PORTOBELLO MUSHROOM","PUMPKIN","QUINOA","RASPBERRY","RED BEET","ROMAINE LETTUCE","ROSEMARY","RUTABAGA","RYE","SAGE","SALMON","SESAME","SHRIMP","SNAPPER","SOLE","SORGHUM","SOYBEAN","SPELT","SPINACH","STRAWBERRY","STRING BEAN","SUNFLOWER","SWEET POTATO","SWISS CHARD","TAPIOCA","TARRAGON","TARO ROOT","TEFF","THYME","TILAPIA","TUNA","TURNIP","VANILLA","VEAL","VENISON","WALNUT","WATER CHESTNUT","WATERCRESS","WATERMELON","WHEAT","YELLOW SQUASH","ZUCCHINI"],
  mild:["ALMOND","ARROWROOT","ASPARAGUS","AVOCADO","BAY LEAF","BLACK PEPPER","BLACK-EYED PEA","BLUEBERRY","BOK CHOY","BRAZIL NUT","BUTTON MUSHROOM","CANTALOUPE","CAROB","CARROT","CHAMOMILE","CHICORY","CINNAMON","CLAM","COCONUT","COLLARD GREENS","CORIANDER SEED","DANDELION LEAF","EGG YOLK","FENNEL SEED","FLOUNDER","GINGER","GRAPE","GUAVA","HAZELNUT","HEMP","LEAF LETTUCE","LEEK","LENTIL BEAN","MUNG BEAN","NUTMEG","ORANGE","OYSTER","PAPAYA","PARSLEY","PEANUT","PLANTAIN","PORK","RADISH","RHUBARB","SAFFLOWER","SAFFRON","SARDINE","SCALLOP","SHIITAKE MUSHROOM","STEVIA","SWORDFISH","TANGERINE","TROUT","TURKEY","TURMERIC","WHITE POTATO","WILD RICE"],
  alsoAvoid:{candida:["SUGAR","HONEY","MAPLE SYRUP","AGAVE","MOLASSES","BAKER'S YEAST","BREWER'S YEAST","NUTRITIONAL YEAST","WINE","BEER","VINEGAR"],whey:["COW'S MILK","GOAT'S MILK","SHEEP'S MILK","WHEY PROTEIN"]},
};
const ROT = {
  1:{grains:["Arrowroot","Oat (GF)","Spelt","Tapioca","White potato"],veg:["Artichoke","Black-eyed pea","Butternut squash","Carrot","Eggplant","Fava bean","Kale","Leaf lettuce","Mustard greens","Romaine","Rutabaga","Yellow squash"],fruit:["Banana","Black currant","Date","Fig","Guava","Kiwi","Lemon","Mango","Papaya","Star fruit","Strawberry"],protein:["Bison","Codfish","Crab","Lamb","Oyster","Sardine","Snapper","Swordfish"],misc:["Bay leaf","Caraway","Cashew","Chamomile","Chia","Chicory","Coconut","Coriander seed","Flaxseed","Parsley","Rosemary","Safflower","Turmeric"]},
  2:{grains:["Barley","Millet","Rye","Wheat","Wild rice"],veg:["Bok choy","Broccoli","Button mushroom","Chives","Lentil bean","Shiitake mushroom","Zucchini"],fruit:["Apple","Avocado","Blueberry","Cranberry","Dragon fruit","Pear","Pineapple","Tangerine"],protein:["Catfish","Chicken","Egg yolk","Mackerel","Mahi mahi","Tilapia","Tuna"],misc:["Almond","Basil","Cinnamon","Ginger","Hazelnut","Hemp","Mustard seed","Paprika","Peppermint","Saffron"]},
  3:{grains:["Corn","Quinoa","Sorghum","Sweet potato"],veg:["Arugula","Asparagus","Black beans","Collard greens","Green pea","Horseradish","Leek","Lima bean","Mung bean","Navy bean","Radish","String bean","Watercress"],fruit:["Apricot","Blackberry","Cherry","Grape","Nectarine","Peach","Plantain","Plum","Raspberry"],protein:["Duck","Grouper","Halibut","Pollock","Pork","Sole"],misc:["Brazil nut","Carob","Cocoa","Dill","Macadamia","Oregano","Peanut","Pine nut","Sunflower","Tarragon","Thyme","Vanilla"]},
  4:{grains:["Buckwheat","Teff"],veg:["Cannellini beans","Dandelion leaf","Okra","Portobello mushroom","Red beet","Rhubarb","Spaghetti squash","Spinach","Swiss chard","Turnip","Water chestnut"],fruit:["Cantaloupe","Grapefruit","Lychee","Orange","Persimmon","Pumpkin","Watermelon"],protein:["Clam","Haddock","Mussel","Salmon","Scallop","Shrimp","Trout","Turkey","Veal","Venison"],misc:["Black pepper","Nutmeg","Pecan","Sesame","Spearmint","Walnut"]},
};
const MEALS = {
  1:{breakfast:{base:"GF oat porridge — banana, coconut milk, cashews",isProtein:false},snack1:{base:"Kiwi + whole cashews",isProtein:false},lunch:{base:"Butternut squash & kale, tapioca",defaultP:"Bison",methods:{"Bison":"grilled patties","Codfish":"pan-seared","Crab":"flaked in tallow","Lamb":"grilled chops","Sardine":"baked whole","Snapper":"baked fillet","Swordfish":"grilled steak","Oyster":"seared"},sides:"lemon-flaxseed",isProtein:true},snack2:{base:"Guava + carrot sticks",isProtein:false},dinner:{base:"White potato mash, mustard greens",defaultP:"Sardine",methods:{"Bison":"braised","Codfish":"parchment bake","Crab":"steamed","Lamb":"roasted","Sardine":"baked whole","Snapper":"pan-seared","Swordfish":"grilled","Oyster":"seared"},sides:"rosemary & bay leaf",isProtein:true},snack3:{base:"Chamomile tea + chia crackers",isProtein:false}},
  2:{breakfast:{base:"Millet porridge — cinnamon, blueberries, almond butter",isProtein:false},snack1:{base:"Apple slices + hazelnut butter",isProtein:false},lunch:{base:"Bok choy & shiitake, rye crispbread",defaultP:"Chicken",methods:{"Catfish":"pan-fried","Chicken":"pan-roasted","Egg yolk":"soft-boiled","Mackerel":"grilled","Mahi mahi":"seared","Tilapia":"baked","Tuna":"seared"},sides:"ginger-lemon",isProtein:true},snack2:{base:"Tangerine + almonds",isProtein:false},dinner:{base:"Barley pilaf, broccoli",defaultP:"Mackerel",methods:{"Catfish":"parchment","Chicken":"roasted","Egg yolk":"poached","Mackerel":"grilled","Mahi mahi":"baked","Tilapia":"seared","Tuna":"seared rare"},sides:"wild rice crackers",isProtein:true},snack3:{base:"Pear + wild rice crackers",isProtein:false}},
  3:{breakfast:{base:"Quinoa porridge — cherry compote, cocoa nibs",isProtein:false},snack1:{base:"Blackberry + pine nuts",isProtein:false},lunch:{base:"Sweet potato purée, navy bean stew",defaultP:"Pork",methods:{"Duck":"confit leg","Grouper":"seared","Halibut":"baked","Pollock":"poached","Pork":"tenderloin","Sole":"pan-fried"},sides:"avocado oil drizzle",isProtein:true},snack2:{base:"Nectarine + peanut butter",isProtein:false},dinner:{base:"Green pea mash, arugula-asparagus salad",defaultP:"Halibut",methods:{"Duck":"roasted","Grouper":"baked","Halibut":"corn-crust","Pollock":"steamed","Pork":"grilled","Sole":"meunière"},sides:"raspberry-lime vinaigrette",isProtein:true},snack3:{base:"Raspberry + carob",isProtein:false}},
  4:{breakfast:{base:"Buckwheat pancakes — pumpkin compote, walnut crumble",isProtein:false},snack1:{base:"Cantaloupe + pecans",isProtein:false},lunch:{base:"Spaghetti squash, cannellini beans",defaultP:"Turkey",methods:{"Clam":"steamed","Haddock":"baked","Mussel":"steamed","Salmon":"baked","Scallop":"seared","Shrimp":"sautéed","Trout":"baked","Turkey":"pan-cooked","Veal":"escalope","Venison":"grilled"},sides:"walnut oil",isProtein:true},snack2:{base:"Persimmon + sesame seeds",isProtein:false},dinner:{base:"Teff, wilted spinach, red beet salad",defaultP:"Trout",methods:{"Clam":"steamed","Haddock":"seared","Mussel":"broth","Salmon":"baked","Scallop":"caramelised","Shrimp":"grilled","Trout":"baked","Turkey":"roasted","Veal":"braised","Venison":"seared"},sides:"grapefruit-walnut",isProtein:true},snack3:{base:"Watermelon + spearmint tea",isProtein:false}},
};
const SYMPTOM_CATS = {
  digestive:{label:"Digestive",items:["Bloating","Cramping","Nausea","Gas","Reflux","Loose stools","Stomach pain"]},
  skin:{label:"Skin",items:["Flushing","Itching","Rash","Hives","Puffiness","Swelling"]},
  neuro:{label:"Neurological",items:["Brain fog","Headache","Dizziness","Fatigue spike","Mood drop","Anxiety"]},
  joints:{label:"Joints/Muscles",items:["Joint stiffness","Muscle aches","Back pain","Neck tension","Swollen fingers"]},
  cardiac:{label:"Cardiac/Resp",items:["Heart racing","Shortness of breath","Chest tightness","Sinus congestion","Runny nose"]},
};
const CUISINES = [{id:"mediterranean",label:"Mediterranean",flag:"🫒",desc:"Olive oil, herbs, fish"},{id:"french",label:"French",flag:"🇫🇷",desc:"Bistro — duck, lentils"},{id:"swedish",label:"Swedish",flag:"🇸🇪",desc:"Nordic fish, root veg"},{id:"japanese",label:"Japanese",flag:"🇯🇵",desc:"Clean minimal, fish"},{id:"middle_eastern",label:"Middle Eastern",flag:"🌿",desc:"Spiced meats, herbs"},{id:"scandinavian",label:"Scandinavian",flag:"🐟",desc:"Cured fish, forest"}];
const EAT_PATS = [{id:"standard",label:"Standard",desc:"6 meals every 3h",fasting:false},{id:"if16_8",label:"IF 16:8",desc:"16h fast · 8h window",fasting:true,detail:"Window 12:00–20:00"},{id:"if18_6",label:"IF 18:6",desc:"18h fast · 6h window",fasting:true,detail:"Window 13:00–19:00"},{id:"if5_2",label:"5:2",desc:"5 normal · 2 low-cal",fasting:true,detail:"~500 kcal fasting days"}];
const MARIO_SYS = `You are Meet Mario, clinical AI for MediBalans AB, Stockholm. Patient: Christina Wohltahrt, 64, post-menopausal. ALCAT April 2024. Markers: Candida mild (no sugar/yeast/vinegar 3mo), Whey moderate (no milk 6mo). Severe reactors (9mo): beef, coffee, garlic, onion, tomato, all rice, black tea, cauliflower, bell pepper, chickpea, cilantro, lobster, pistachio, poppy seed, capers, cumin, jalapeño, egg white, sea bass, wakame. Rules: No seed oils. CPF every meal. Respond in clear prose, no bullet points.`;

function simulateMealResponse(hadReactive) {
  const pts=[];
  for(let m=0;m<=120;m+=3){
    const t=m/120,curve=t<0.3?t/0.3:t<0.6?1:Math.max(0,(1-t)/0.4),rx=hadReactive?2.2+Math.random()*0.6:1,n=()=>(Math.random()-0.5)*2;
    pts.push({min:m,hr:Math.round(68+14*rx*curve+n()),hrv:Math.round(55-(hadReactive?22:6)*curve+n()),temp:+((36.5+(hadReactive?0.6:0.08)*curve+n()*0.015)).toFixed(2),glucose:Math.round(82+(hadReactive?58:22)*curve+n()),spo2:+((98-(hadReactive?1.8:0.2)*curve+n()*0.05)).toFixed(1)});
  }
  return pts;
}
function detectSpikes(pts) {
  if(!pts||pts.length<4)return[];
  const b=pts[0],spikes=[];
  pts.forEach((p,i)=>{
    if(i<3)return;
    if(p.hr-b.hr>=22&&!spikes.find(s=>s.m==="hr"))spikes.push({min:p.min,m:"hr",label:"Heart Rate spike",val:`+${p.hr-b.hr} bpm`,level:p.hr-b.hr>=32?"severe":"moderate"});
    if(b.hrv-p.hrv>=18&&!spikes.find(s=>s.m==="hrv"))spikes.push({min:p.min,m:"hrv",label:"HRV drop",val:`-${b.hrv-p.hrv} ms`,level:b.hrv-p.hrv>=28?"severe":"moderate"});
    if(p.temp-b.temp>=0.45&&!spikes.find(s=>s.m==="temp"))spikes.push({min:p.min,m:"temp",label:"Temperature rise",val:`+${(p.temp-b.temp).toFixed(2)}°C`,level:p.temp-b.temp>=0.65?"severe":"moderate"});
    if(p.glucose-b.glucose>=38&&!spikes.find(s=>s.m==="glucose"))spikes.push({min:p.min,m:"glucose",label:"Glucose spike",val:`+${p.glucose-b.glucose} mg/dL`,level:p.glucose-b.glucose>=55?"severe":"moderate"});
  });
  return spikes;
}
async function callClaude(messages,system,extra={}) {
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system,messages,...extra})});
  const d=await res.json();
  return(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
}

// ─── DESIGN SYSTEM — Balans / Jony Ive / Ferrari ────────────────────────────
const T = {
  // Surfaces — warm titanium white
  w:    "#F7F4F0",
  w1:   "#F1EDE7",
  w2:   "#E8E2DA",
  w3:   "#D8D0C4",  // borders / rules
  w4:   "#B8ACA0",  // ghost text
  w5:   "#8A7E72",  // secondary text
  w6:   "#4A4038",  // primary text
  w7:   "#1C1510",  // near black
  // Rose gold — used sparingly
  rg:   "#C4887A",
  rg2:  "#9A6255",
  rg3:  "#DEB0A4",
  rgBg: "#F8F0EE",
  // Semantic (small use only)
  err:  "#B85040",
  ok:   "#6A9060",
  warn: "#B88040",
  // The one dark surface — dashboard dial
  dark: "#18120E",
  dark2:"#221A14",
};

const fonts = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans:  "-apple-system, 'Helvetica Neue', 'Arial', sans-serif",
  mono:  "'SF Mono', 'Fira Mono', 'Courier New', monospace",
};

// ─── SHARED PRIMITIVES ───────────────────────────────────────────────────────

// Nav — the 1px border is all it needs
const Nav = ({ showProgress, step }) => (
  <div style={{
    position:"sticky",top:0,zIndex:200,
    height:58,display:"flex",alignItems:"center",justifyContent:"space-between",
    padding:"0 44px",
    background:"rgba(247,244,240,0.90)",
    backdropFilter:"blur(24px) saturate(180%)",
    WebkitBackdropFilter:"blur(24px) saturate(180%)",
    borderBottom:`1px solid ${T.w3}`,
  }}>
    {/* Wordmark */}
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      {/* The rose gold dot — one of three in the alphabet */}
      <div style={{
        width:9,height:9,borderRadius:"50%",
        background:`linear-gradient(140deg, ${T.rg3}, ${T.rg}, ${T.rg2})`,
        boxShadow:`0 2px 8px rgba(160,100,85,0.40)`,
        flexShrink:0,
      }}/>
      <span style={{fontFamily:fonts.serif,fontSize:18,fontWeight:400,color:T.w7,letterSpacing:"0.01em",textTransform:"none",fontVariant:"normal"}}>
        meet mario
      </span>
    </div>
    {/* Right */}
    <div style={{display:"flex",alignItems:"center",gap:18}}>
      {showProgress && (
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:88,height:1,background:T.w3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(step/7)*100}%`,background:T.rg,transition:"width .4s ease"}}/>
          </div>
          <span style={{fontFamily:fonts.mono,fontSize:9,color:T.w4,letterSpacing:"0.08em"}}>{step} / 7</span>
        </div>
      )}
      <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,border:`1px solid ${T.w3}`,borderRadius:3,padding:"3px 8px",letterSpacing:"0.14em"}}>
        PATENT PENDING · SE 2615203-3
      </span>
    </div>
  </div>
);

// Sidebar
const Sidebar = ({ items, footer }) => (
  <div style={{
    width:196,flexShrink:0,
    position:"sticky",top:58,height:"calc(100vh - 58px)",
    background:T.w1,borderRight:`1px solid ${T.w3}`,
    padding:"32px 0",display:"flex",flexDirection:"column",
  }}>
    <div style={{flex:1}}>
      {items.map((item,i) => (
        <div key={i}>
          {item.divider && <div style={{width:32,height:1,background:T.w3,margin:"12px 24px"}}/>}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"9px 24px"}}>
            <div style={{
              width:5,height:5,borderRadius:"50%",flexShrink:0,
              background: item.state==="done" ? T.w4 : item.state==="now" ? T.rg : T.w3,
              boxShadow: item.state==="now" ? `0 0 0 3px rgba(196,136,122,0.14)` : "none",
              transition:"all .22s",
            }}/>
            <span style={{
              fontSize:12,letterSpacing:"-0.01em",fontFamily:fonts.sans,
              color: item.state==="done" ? T.w4 : item.state==="now" ? T.rg2 : T.w3,
              fontWeight: item.state==="now" ? 500 : 400,
            }}>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
    <div style={{margin:"0 16px",padding:"10px 12px",border:`1px solid ${T.w3}`,borderRadius:8}}>
      <div style={{fontFamily:fonts.mono,fontSize:7,color:T.w4,letterSpacing:"0.16em",lineHeight:1.9,textTransform:"uppercase"}}>
        Patent Pending<br/>SE 2615203-3
      </div>
    </div>
  </div>
);

// Chip
const Chip = ({ label, on, onClick }) => (
  <button onClick={onClick} style={{
    padding:"8px 18px",borderRadius:50,
    fontSize:13,fontFamily:fonts.sans,fontWeight: on ? 500 : 400,
    border:`1px solid ${on ? T.rg : T.w3}`,
    background: on ? T.rgBg : T.w,
    color: on ? T.rg2 : T.w5,
    cursor:"pointer",userSelect:"none",letterSpacing:"-0.01em",
    transition:"all .18s cubic-bezier(.34,1.56,.64,1)",
    boxShadow: on
      ? `0 2px 12px rgba(160,104,88,0.14), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(160,104,88,0.08)`
      : `0 1px 3px rgba(100,80,60,0.06), inset 0 1px 0 rgba(255,255,255,0.90)`,
  }}>{label}</button>
);

// Panel (machined recess)
const Panel = ({ children, style }) => (
  <div style={{
    background:T.w1,border:`1px solid ${T.w3}`,borderRadius:12,
    padding:"24px 26px",marginBottom:28,
    boxShadow:`inset 0 1px 3px rgba(100,80,60,0.06), 0 1px 0 rgba(255,255,255,0.88)`,
    ...style,
  }}>{children}</div>
);

// The one CTA button — machined rose gold
const BtnPrimary = ({ children, onClick, disabled, loading }) => (
  <button onClick={onClick} disabled={disabled||loading} style={{
    display:"inline-flex",alignItems:"center",gap:10,
    padding:"15px 44px",borderRadius:12,border:"none",cursor:disabled?"not-allowed":"pointer",
    fontFamily:fonts.sans,fontSize:13,fontWeight:500,letterSpacing:"0.08em",textTransform:"uppercase",
    position:"relative",overflow:"hidden",
    background: disabled
      ? T.w2
      : `linear-gradient(140deg, ${T.rg3} 0%, ${T.rg} 22%, ${T.rg2} 52%, #B88070 72%, ${T.rg3} 92%, ${T.rg} 100%)`,
    backgroundSize:"200% auto",
    color: disabled ? T.w4 : "rgba(255,255,255,0.97)",
    boxShadow: disabled ? "none" : `0 4px 20px rgba(154,98,85,0.28), inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -1px 0 rgba(0,0,0,0.10)`,
    transition:"all .2s",
    opacity: loading ? 0.7 : 1,
  }}>
    {/* chamfer highlight — Ive signature */}
    <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.28) 30%,rgba(255,255,255,0.38) 50%,rgba(255,255,255,0.28) 70%,transparent)"}}/>
    <span style={{position:"relative",zIndex:1}}>{loading ? "…" : children}</span>
  </button>
);

// Field label
const FieldLabel = ({ children }) => (
  <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.w4,letterSpacing:"0.22em",textTransform:"uppercase",marginBottom:13}}>
    {children}
  </div>
);

// Section eyebrow
const Eyebrow = ({ children }) => (
  <div style={{fontFamily:fonts.mono,fontSize:9,color:`rgba(196,136,122,0.55)`,letterSpacing:"0.24em",textTransform:"uppercase",marginBottom:12}}>
    {children}
  </div>
);

// Section title — Balans Serif
const SectionTitle = ({ children }) => (
  <h2 style={{fontFamily:fonts.serif,fontSize:34,fontWeight:400,color:T.w7,letterSpacing:"-0.01em",lineHeight:1.14,marginBottom:40}}>
    {children}
  </h2>
);

// Ruled text input
const RuledInput = ({ placeholder, value, onChange, style }) => (
  <input
    value={value} onChange={onChange} placeholder={placeholder}
    autoComplete="off"
    style={{
      display:"block",width:"100%",background:"transparent",
      border:"none",borderBottom:`1.5px solid ${T.w3}`,
      padding:"11px 0",fontFamily:fonts.sans,fontSize:13.5,fontWeight:300,
      color:T.w7,outline:"none",letterSpacing:"-0.01em",
      transition:"border-color .18s",fontStyle:"normal",
      ...style,
    }}
    onFocus={e=>e.target.style.borderBottomColor=T.rg}
    onBlur={e=>e.target.style.borderBottomColor=T.w3}
  />
);

// Mini sparkline chart (monitor tab)
const MiniChart = ({pts,key_,color,label,unit,height=62}) => {
  if(!pts||pts.length<2)return null;
  const vals=pts.map(p=>p[key_]),mn=Math.min(...vals),mx=Math.max(...vals),range=mx-mn||1;
  const W=220,H=height;
  const px=i=>(i/(pts.length-1))*W,py=v=>H-((v-mn)/range)*(H-8)-4;
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${px(i).toFixed(1)},${py(p[key_]).toFixed(1)}`).join(" ");
  const current=vals[vals.length-1],delta=current-vals[0];
  return (
    <div style={{background:T.w,border:`1px solid ${T.w3}`,borderRadius:10,padding:"12px 14px",boxShadow:`0 1px 3px rgba(100,80,60,0.05),inset 0 1px 0 rgba(255,255,255,0.88)`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
        <div style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color:T.w4,textTransform:"uppercase"}}>{label}</div>
        <div style={{textAlign:"right"}}>
          <span style={{fontSize:18,fontWeight:400,fontFamily:fonts.serif,color}}>{current}</span>
          <span style={{fontSize:9,color:T.w4,fontFamily:fonts.mono}}> {unit}</span>
          {Math.abs(delta)>0&&<div style={{fontSize:8.5,color:delta>0?(key_==="hrv"||key_==="spo2"?T.err:T.warn):T.ok,fontFamily:fonts.mono}}>{delta>0?"+":""}{delta.toFixed(key_==="temp"?2:0)}</div>}
        </div>
      </div>
      <svg width={W} height={H} style={{display:"block",overflow:"visible"}}>
        <defs><linearGradient id={`g${key_}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.18}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
        <path d={`${path} L${px(pts.length-1)},${H} L0,${H} Z`} fill={`url(#g${key_})`}/>
        <path d={path} stroke={color} strokeWidth={1.4} fill="none"/>
        <circle cx={px(pts.length-1)} cy={py(vals[vals.length-1])} r={2.5} fill={color}/>
      </svg>
    </div>
  );
};

// ─── ONBOARDING WRAP (outside Onboarding to prevent input remount) ───────────
function ObWrap({ children, step, step_labels }) {
  return (
    <div style={{
      minHeight:"100vh", background:T.w, display:"flex", flexDirection:"column",
    }}>
      <div style={{
        position:"sticky",top:0,zIndex:200,height:58,display:"flex",
        alignItems:"center",justifyContent:"space-between",padding:"0 44px",
        background:"rgba(247,244,240,0.90)",backdropFilter:"blur(24px)",
        borderBottom:`1px solid ${T.w3}`,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:9,height:9,borderRadius:"50%",background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,boxShadow:`0 2px 8px rgba(160,100,85,.40)`}}/>
          <span style={{fontFamily:fonts.serif,fontSize:18,fontWeight:400,color:T.w7}}>meet mario</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {step_labels.map((l,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{
                  width:i===step?22:6,height:6,borderRadius:3,
                  background:i<=step?T.rg:T.w3,
                  transition:"all .3s ease",
                }}/>
              </div>
            ))}
          </div>
          <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,border:`1px solid ${T.w3}`,borderRadius:3,padding:"3px 8px",letterSpacing:"0.14em"}}>PATENT PENDING · SE 2615203-3</span>
        </div>
      </div>
      <div style={{flex:1,display:"flex",justifyContent:"center",padding:"64px 24px 80px"}}>
        <div style={{width:"100%",maxWidth:560}}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING FLOW ─────────────────────────────────────────────────────────
const OB_STEPS = [
  { id:"welcome",   label:"Welcome"   },
  { id:"about",     label:"About you" },
  { id:"symptoms",  label:"Symptoms"  },
  { id:"clinical",  label:"Clinical"  },
  { id:"results",   label:"Results"   },
];

const HEIQ_DOMAINS = [
  { id:"gut", label:"Gut & Immune", weight:0.30, color:"#C4887A",
    questions:[
      { q:"Do you experience bloating, gas, or abdominal discomfort after meals?", type:"freq" },
      { q:"Do you have recurring skin issues — eczema, rashes, acne, or hives?", type:"freq" },
      { q:"Do you have digestive irregularities — IBS, constipation, or loose stools?", type:"freq" },
      { q:"Do you have frequent infections, seasonal allergies, or autoimmune flares?", type:"freq" },
    ]
  },
  { id:"energy", label:"Energy & Mitochondria", weight:0.25, color:"#B88040",
    questions:[
      { q:"Do you experience persistent fatigue not resolved by sleep?", type:"freq" },
      { q:"Do you have brain fog, poor concentration, or mental slowness?", type:"freq" },
      { q:"Do you have poor exercise tolerance or slow physical recovery?", type:"freq" },
      { q:"Do you have non-restorative sleep or difficulty staying asleep?", type:"freq" },
    ]
  },
  { id:"neuro", label:"Neuro & Methylation", weight:0.20, color:"#7A6A9A",
    questions:[
      { q:"Do you experience anxiety, low mood, or emotional instability?", type:"freq" },
      { q:"Do you have frequent headaches or migraines?", type:"freq" },
      { q:"Do you have memory issues, word-finding difficulty, or poor focus?", type:"freq" },
      { q:"Do you react to fragrances, alcohol, or medications with unusual sensitivity?", type:"yn" },
    ]
  },
  { id:"inflammation", label:"Inflammation", weight:0.15, color:"#B85040",
    questions:[
      { q:"Do you have joint pain, stiffness, or muscle aches without injury?", type:"freq" },
      { q:"Do you have diagnosed elevated inflammatory markers (CRP, ESR) or autoimmune condition?", type:"yn" },
      { q:"Do you have cardiovascular risk factors or relevant family history?", type:"yn" },
      { q:"Do you experience slow wound healing or recurring infections?", type:"freq" },
    ]
  },
  { id:"aging", label:"Biological Aging", weight:0.10, color:"#6A9060",
    questions:[
      { q:"Is your recovery from illness or exercise noticeably slower than it used to be?", type:"yn" },
      { q:"Do you have unexplained weight gain, hormonal shifts, or libido changes?", type:"yn" },
      { q:"Do you experience hair thinning, brittle nails, or accelerated skin aging?", type:"yn" },
      { q:"Do you feel your biological age exceeds your chronological age?", type:"yn" },
    ]
  },
];

const FREQ_OPTS = [
  { label:"Never",     val:0 },
  { label:"Rarely",    val:1 },
  { label:"Sometimes", val:2 },
  { label:"Often",     val:3 },
  { label:"Always",    val:4 },
];

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [sex, setSex] = useState("");
  const [hormonalStatus, setHormonalStatus] = useState("");
  const [answers, setAnswers] = useState({});
  const [domainIdx, setDomainIdx] = useState(0);
  const [hasAlcat, setHasAlcat] = useState(null);
  const [hasCma, setHasCma] = useState(null);
  const [score, setScore] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const nameRef = useRef(null);
  const dobRef = useRef(null);
  const medsRef = useRef(null);

  const setAns = (dId, qIdx, val) => setAnswers(a=>({...a,[`${dId}-${qIdx}`]:val}));
  const getAns = (dId, qIdx) => answers[`${dId}-${qIdx}`];
  const domainComplete = (d) => d.questions.every((_,i) => getAns(d.id,i) !== undefined);
  const curDomain = HEIQ_DOMAINS[domainIdx];
  const step_labels = ["Welcome","About you","Symptoms","Clinical","Results"];

  const goTo = (n) => setStep(n);

  const calcScore = () => {
    const brkd = HEIQ_DOMAINS.map(d => {
      const raw = d.questions.reduce((sum,q,i) => {
        const v = getAns(d.id,i) ?? 0;
        const norm = q.type==="yn" ? (v===1 ? 4 : 0) : v;
        return sum + norm;
      }, 0);
      const max = d.questions.length * 4;
      return { id:d.id, label:d.label, color:d.color, pct: Math.round((raw/max)*100), weight:d.weight };
    });
    const total = Math.round(brkd.reduce((s,d) => s + d.pct * d.weight, 0));
    setBreakdown(brkd);
    setScore(total);
    setStep(4);
  };

  const scoreLabel = score===null ? "" : score < 25 ? "Low" : score < 50 ? "Moderate" : score < 72 ? "Elevated" : "High";
  const scoreColor = score===null ? T.w4 : score < 25 ? T.ok : score < 50 ? T.warn : score < 72 ? "#C87030" : T.err;
  const topDomain = breakdown ? [...breakdown].sort((a,b)=>b.pct-a.pct)[0] : null;

  return (
    <div style={{minHeight:"100vh", background:T.w, display:"flex", flexDirection:"column"}}>
      {/* Nav */}
      <div style={{position:"sticky",top:0,zIndex:200,height:58,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 44px",background:"rgba(247,244,240,0.90)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${T.w3}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:9,height:9,borderRadius:"50%",background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,boxShadow:`0 2px 8px rgba(160,100,85,.40)`}}/>
          <span style={{fontFamily:fonts.serif,fontSize:18,fontWeight:400,color:T.w7}}>meet mario</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {step_labels.map((l,i)=>(
              <div key={i} style={{width:i===step?22:6,height:6,borderRadius:3,background:i<=step?T.rg:T.w3,transition:"all .3s ease"}}/>
            ))}
          </div>
          <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,border:`1px solid ${T.w3}`,borderRadius:3,padding:"3px 8px",letterSpacing:"0.14em"}}>PATENT PENDING · SE 2615203-3</span>
        </div>
      </div>

      <div style={{flex:1,display:"flex",justifyContent:"center",padding:"64px 24px 80px"}}>
        <div style={{width:"100%",maxWidth:560}}>

          {/* ── STEP 0: Welcome ── */}
          {step===0 && (
            <div>
              <div style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.24em",textTransform:"uppercase",marginBottom:32,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:24,height:1,background:T.rg}}/>Clinical intake · ~10 minutes
              </div>
              <h1 style={{fontFamily:fonts.serif,fontSize:52,fontWeight:400,lineHeight:1.05,letterSpacing:"-0.02em",color:T.w7,marginBottom:20}}>
                Before we begin,<br/><em style={{fontStyle:"italic",color:T.rg2}}>a few questions.</em>
              </h1>
              <p style={{fontSize:15,fontWeight:300,color:T.w5,lineHeight:1.8,marginBottom:16}}>
                This intake takes about 10 minutes. Your answers build a personalised biological profile — used to calibrate your protocol and predict your highest-risk food reactivities.
              </p>
              <p style={{fontSize:13,fontWeight:300,color:T.w4,lineHeight:1.7,marginBottom:52,fontFamily:fonts.mono,letterSpacing:"0.04em"}}>
                GDPR compliant · Data stored securely · Never shared
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:52}}>
                {[["Health Entropy Score","Your biological disorder index across 5 domains"],["Food Reactivity Preview","Predicted sensitivities from 25,000+ patient records"],["Test Roadmap","Which tests address your specific symptom clusters"],["Protocol Access","Your personalised 21-day detox plan"]].map(([title,desc])=>(
                  <div key={title} style={{background:T.w1,border:`1px solid ${T.w3}`,borderRadius:10,padding:"16px 18px"}}>
                    <div style={{fontFamily:fonts.sans,fontSize:12,fontWeight:500,color:T.rg2,marginBottom:5}}>{title}</div>
                    <div style={{fontFamily:fonts.sans,fontSize:11,fontWeight:300,color:T.w5,lineHeight:1.6}}>{desc}</div>
                  </div>
                ))}
              </div>
              <BtnPrimary onClick={()=>goTo(1)}>Start Assessment →</BtnPrimary>
              <div style={{textAlign:"center",marginTop:16}}>
                <button onClick={()=>onComplete(null)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:"0.14em",textTransform:"uppercase",textDecoration:"underline"}}>Skip — go to dashboard</button>
              </div>
            </div>
          )}

          {/* ── STEP 1: About you ── */}
          {step===1 && (
            <div>
              <div style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.24em",textTransform:"uppercase",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:24,height:1,background:T.rg}}/>Step 1 of 4 · About you
              </div>
              <h2 style={{fontFamily:fonts.serif,fontSize:38,fontWeight:400,color:T.w7,letterSpacing:"-0.01em",lineHeight:1.1,marginBottom:40}}>
                Tell us about<br/><em style={{fontStyle:"italic",color:T.rg2}}>yourself.</em>
              </h2>
              <div style={{marginBottom:28}}>
                <FieldLabel>Full name</FieldLabel>
                <input ref={nameRef} defaultValue="" placeholder="First and last name" autoComplete="off" style={{display:"block",width:"100%",background:"transparent",border:"none",borderBottom:`1.5px solid ${T.w3}`,padding:"11px 0",fontFamily:fonts.sans,fontSize:13.5,fontWeight:300,color:T.w7,outline:"none",letterSpacing:"-0.01em"}} onFocus={e=>e.target.style.borderBottomColor=T.rg} onBlur={e=>e.target.style.borderBottomColor=T.w3}/>
              </div>
              <div style={{marginBottom:28}}>
                <FieldLabel>Date of birth</FieldLabel>
                <input ref={dobRef} defaultValue="" placeholder="DD/MM/YYYY" autoComplete="off" style={{display:"block",width:"100%",background:"transparent",border:"none",borderBottom:`1.5px solid ${T.w3}`,padding:"11px 0",fontFamily:fonts.sans,fontSize:13.5,fontWeight:300,color:T.w7,outline:"none",letterSpacing:"-0.01em"}} onFocus={e=>e.target.style.borderBottomColor=T.rg} onBlur={e=>e.target.style.borderBottomColor=T.w3}/>
              </div>
              <div style={{marginBottom:28}}>
                <FieldLabel>Sex</FieldLabel>
                <div style={{display:"flex",gap:8,marginTop:4}}>
                  {["Female","Male","Other"].map(s=>(
                    <button key={s} onClick={()=>setSex(s)} style={{flex:1,padding:"11px 0",borderRadius:9,cursor:"pointer",border:`1px solid ${sex===s?T.rg:T.w3}`,background:sex===s?T.rgBg:T.w,color:sex===s?T.rg2:T.w5,fontFamily:fonts.sans,fontSize:13,fontWeight:sex===s?500:400,transition:"all .15s"}}>{s}</button>
                  ))}
                </div>
              </div>
              {sex==="Female" && (
                <div style={{marginBottom:28}}>
                  <FieldLabel>Hormonal status</FieldLabel>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
                    {["Pre-menopausal","Peri-menopausal","Post-menopausal","On HRT","Prefer not to say"].map(s=>(
                      <button key={s} onClick={()=>setHormonalStatus(s)} style={{padding:"8px 16px",borderRadius:50,cursor:"pointer",border:`1px solid ${hormonalStatus===s?T.rg:T.w3}`,background:hormonalStatus===s?T.rgBg:T.w,color:hormonalStatus===s?T.rg2:T.w5,fontFamily:fonts.sans,fontSize:12,transition:"all .15s"}}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{marginTop:40}}>
                <BtnPrimary onClick={()=>goTo(2)} disabled={!sex}>Continue →</BtnPrimary>
              </div>
            </div>
          )}

          {/* ── STEP 2: Symptoms ── */}
          {step===2 && (
            <div>
              <div style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.24em",textTransform:"uppercase",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:24,height:1,background:T.rg}}/>Step 2 of 4 · Symptoms — {domainIdx+1} / {HEIQ_DOMAINS.length}
              </div>
              <div style={{display:"flex",gap:4,marginBottom:36}}>
                {HEIQ_DOMAINS.map((d,i)=>(
                  <div key={d.id} style={{flex:1,height:3,borderRadius:2,background:i<=domainIdx?d.color:T.w3,transition:"background .3s"}}/>
                ))}
              </div>
              <h2 style={{fontFamily:fonts.serif,fontSize:32,fontWeight:400,color:T.w7,letterSpacing:"-0.01em",lineHeight:1.15,marginBottom:8}}>{curDomain.label}</h2>
              <p style={{fontSize:12,fontFamily:fonts.mono,color:T.w4,letterSpacing:"0.06em",marginBottom:36}}>{Math.round(curDomain.weight*100)}% weight in your Health Entropy Score</p>
              <div style={{display:"flex",flexDirection:"column",gap:28}}>
                {curDomain.questions.map((q,i)=>{
                  const ans = getAns(curDomain.id, i);
                  return (
                    <div key={i} style={{borderBottom:`1px solid ${T.w3}`,paddingBottom:24}}>
                      <p style={{fontSize:14,fontWeight:300,color:T.w6,lineHeight:1.7,marginBottom:14,fontFamily:fonts.sans}}>{q.q}</p>
                      {q.type==="freq" ? (
                        <div style={{display:"flex",gap:6}}>
                          {FREQ_OPTS.map(opt=>(
                            <button key={opt.val} onClick={()=>setAns(curDomain.id,i,opt.val)} style={{flex:1,padding:"9px 4px",borderRadius:8,cursor:"pointer",border:`1px solid ${ans===opt.val?curDomain.color:T.w3}`,background:ans===opt.val?`${curDomain.color}12`:T.w,color:ans===opt.val?curDomain.color:T.w4,fontFamily:fonts.mono,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",transition:"all .15s"}}>{opt.label}</button>
                          ))}
                        </div>
                      ) : (
                        <div style={{display:"flex",gap:8}}>
                          {[{label:"Yes",val:1},{label:"No",val:0}].map(opt=>(
                            <button key={opt.val} onClick={()=>setAns(curDomain.id,i,opt.val)} style={{flex:1,padding:"12px 0",borderRadius:9,cursor:"pointer",border:`1px solid ${ans===opt.val?curDomain.color:T.w3}`,background:ans===opt.val?`${curDomain.color}12`:T.w,color:ans===opt.val?curDomain.color:T.w5,fontFamily:fonts.sans,fontSize:13,fontWeight:ans===opt.val?500:400,transition:"all .15s"}}>{opt.label}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:12,marginTop:40}}>
                <button onClick={()=>{ if(domainIdx>0) setDomainIdx(d=>d-1); else goTo(1); }} style={{padding:"14px 28px",borderRadius:10,border:`1px solid ${T.w3}`,background:T.w,color:T.w5,fontFamily:fonts.sans,fontSize:13,cursor:"pointer"}}>← Back</button>
                <div style={{flex:1}}>
                  <BtnPrimary disabled={!domainComplete(curDomain)} onClick={()=>{ if(domainIdx<HEIQ_DOMAINS.length-1) setDomainIdx(d=>d+1); else goTo(3); }}>
                    {domainIdx<HEIQ_DOMAINS.length-1 ? `Next: ${HEIQ_DOMAINS[domainIdx+1].label} →` : "Continue →"}
                  </BtnPrimary>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Clinical ── */}
          {step===3 && (
            <div>
              <div style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.24em",textTransform:"uppercase",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:24,height:1,background:T.rg}}/>Step 3 of 4 · Clinical context
              </div>
              <h2 style={{fontFamily:fonts.serif,fontSize:38,fontWeight:400,color:T.w7,letterSpacing:"-0.01em",lineHeight:1.1,marginBottom:12}}>
                Prior testing &<br/><em style={{fontStyle:"italic",color:T.rg2}}>medications.</em>
              </h2>
              <p style={{fontSize:14,fontWeight:300,color:T.w5,lineHeight:1.7,marginBottom:40}}>This helps calibrate your predictions and protocol.</p>
              <div style={{marginBottom:28,borderBottom:`1px solid ${T.w3}`,paddingBottom:28}}>
                <FieldLabel>Have you done an ALCAT food sensitivity test?</FieldLabel>
                <div style={{display:"flex",gap:8}}>
                  {[{l:"Yes — I have results",v:true},{l:"No — not yet",v:false}].map(o=>(
                    <button key={String(o.v)} onClick={()=>setHasAlcat(o.v)} style={{flex:1,padding:"12px 0",borderRadius:9,cursor:"pointer",border:`1px solid ${hasAlcat===o.v?T.rg:T.w3}`,background:hasAlcat===o.v?T.rgBg:T.w,color:hasAlcat===o.v?T.rg2:T.w5,fontFamily:fonts.sans,fontSize:12,fontWeight:hasAlcat===o.v?500:400,transition:"all .15s"}}>{o.l}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:28,borderBottom:`1px solid ${T.w3}`,paddingBottom:28}}>
                <FieldLabel>Have you done a Cellular Micronutrient Assay (CMA)?</FieldLabel>
                <div style={{display:"flex",gap:8}}>
                  {[{l:"Yes",v:true},{l:"No",v:false}].map(o=>(
                    <button key={String(o.v)} onClick={()=>setHasCma(o.v)} style={{flex:1,padding:"12px 0",borderRadius:9,cursor:"pointer",border:`1px solid ${hasCma===o.v?T.rg:T.w3}`,background:hasCma===o.v?T.rgBg:T.w,color:hasCma===o.v?T.rg2:T.w5,fontFamily:fonts.sans,fontSize:12,fontWeight:hasCma===o.v?500:400,transition:"all .15s"}}>{o.l}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:28,borderBottom:`1px solid ${T.w3}`,paddingBottom:28}}>
                <FieldLabel>Upload lab results (optional)</FieldLabel>
                <p style={{fontSize:12,fontWeight:300,color:T.w4,lineHeight:1.6,marginBottom:14,fontFamily:fonts.sans}}>ALCAT · CMA · GI-MAP · Genova · Werlabs · Unilabs · DUTCH · or any functional medicine report (PDF)</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                  {uploadedFiles.map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:T.w1,border:`1px solid ${T.w3}`,borderRadius:6,padding:"5px 10px"}}>
                      <span style={{fontFamily:fonts.mono,fontSize:10,color:T.rg2}}>{f.name}</span>
                      <button onClick={()=>setUploadedFiles(uploadedFiles.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:T.w4,fontSize:12,padding:0,lineHeight:1}}>x</button>
                    </div>
                  ))}
                </div>
                <label style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:9,border:`1px solid ${T.w3}`,background:T.w,cursor:"pointer",fontFamily:fonts.sans,fontSize:12,color:T.w5}}>
                  <span style={{fontFamily:fonts.mono,fontSize:10,letterSpacing:"0.1em"}}>+ ADD FILE</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style={{display:"none"}}
                    onChange={e=>{
                      const files = Array.from(e.target.files);
                      setUploadedFiles([...uploadedFiles,...files]);
                      e.target.value="";
                    }}
                  />
                </label>
              </div>
              <div style={{marginBottom:40}}>
                <FieldLabel>Current medications or supplements (optional)</FieldLabel>
                <input ref={medsRef} defaultValue="" placeholder="e.g. Levothyroxine, Vitamin D, Metformin…" autoComplete="off" style={{display:"block",width:"100%",background:"transparent",border:"none",borderBottom:`1.5px solid ${T.w3}`,padding:"11px 0",fontFamily:fonts.sans,fontSize:13.5,fontWeight:300,color:T.w7,outline:"none",letterSpacing:"-0.01em"}} onFocus={e=>e.target.style.borderBottomColor=T.rg} onBlur={e=>e.target.style.borderBottomColor=T.w3}/>
              </div>
              <div style={{display:"flex",gap:12}}>
                <button onClick={()=>goTo(2)} style={{padding:"14px 28px",borderRadius:10,border:`1px solid ${T.w3}`,background:T.w,color:T.w5,fontFamily:fonts.sans,fontSize:13,cursor:"pointer"}}>← Back</button>
                <div style={{flex:1}}>
                  <BtnPrimary disabled={hasAlcat===null||hasCma===null} onClick={calcScore}>Calculate my score →</BtnPrimary>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Results ── */}
          {step===4 && score!==null && (
            <div>
              <div style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.24em",textTransform:"uppercase",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:24,height:1,background:T.rg}}/>Your results · Health Entropy Index
              </div>
              <h2 style={{fontFamily:fonts.serif,fontSize:38,fontWeight:400,color:T.w7,letterSpacing:"-0.01em",lineHeight:1.1,marginBottom:32}}>
                Your biological<br/><em style={{fontStyle:"italic",color:T.rg2}}>entropy profile.</em>
              </h2>
              <div style={{background:T.w1,border:`1px solid ${T.w3}`,borderRadius:16,padding:"32px",marginBottom:24,display:"flex",alignItems:"center",gap:32,boxShadow:`inset 0 1px 3px rgba(100,80,60,0.06)`}}>
                <div style={{textAlign:"center",flexShrink:0}}>
                  <div style={{width:100,height:100,borderRadius:"50%",border:`3px solid ${scoreColor}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:`0 0 28px ${scoreColor}30`}}>
                    <div style={{fontFamily:fonts.serif,fontSize:36,fontWeight:400,color:scoreColor,lineHeight:1}}>{score}</div>
                    <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,letterSpacing:"0.1em",textTransform:"uppercase"}}>/ 100</div>
                  </div>
                  <div style={{fontFamily:fonts.mono,fontSize:9,color:scoreColor,letterSpacing:"0.14em",textTransform:"uppercase",marginTop:10}}>{scoreLabel}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:fonts.sans,fontSize:14,color:T.w6,lineHeight:1.7,marginBottom:12}}>
                    Your Health Entropy Index is <strong style={{color:scoreColor}}>{score}/100</strong> — indicating {scoreLabel.toLowerCase()} biological disorder.
                    {topDomain && <span> Your highest-load domain is <strong style={{color:topDomain.color}}>{topDomain.label}</strong>.</span>}
                  </div>
                  <div style={{fontFamily:fonts.mono,fontSize:9,color:T.w4,letterSpacing:"0.08em"}}>
                    {hasAlcat ? "ALCAT results on file · " : "ALCAT not yet done · "}{hasCma ? "CMA on file" : "CMA not yet done"}
                  </div>
                </div>
              </div>
              <div style={{marginBottom:24}}>
                {(breakdown||[]).map(d=>(
                  <div key={d.id} style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
                    <div style={{fontFamily:fonts.mono,fontSize:9,color:T.w4,letterSpacing:"0.1em",width:140,flexShrink:0,textTransform:"uppercase"}}>{d.label}</div>
                    <div style={{flex:1,height:5,background:T.w2,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${d.pct}%`,background:d.color,borderRadius:3}}/>
                    </div>
                    <div style={{fontFamily:fonts.mono,fontSize:10,color:d.color,width:32,textAlign:"right"}}>{d.pct}%</div>
                  </div>
                ))}
              </div>
              {!hasAlcat && (
                <div style={{background:T.rgBg,border:`1px solid ${T.rg}30`,borderRadius:12,padding:"18px 22px",marginBottom:24}}>
                  <div style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:6}}>Recommended next step</div>
                  <div style={{fontSize:13,fontWeight:300,color:T.w6,lineHeight:1.7}}>Based on your score, an ALCAT 250 test would confirm your predicted reactivities and unlock a full personalised protocol. Book at MediBalans Stockholm.</div>
                </div>
              )}
              <BtnPrimary onClick={()=>onComplete({ name: nameRef.current?.value, dob: dobRef.current?.value, sex, hormonalStatus, meds: medsRef.current?.value, hasAlcat, hasCma, score, breakdown })}>
                {hasAlcat ? "Enter my dashboard →" : "Continue to dashboard →"}
              </BtnPrimary>
              <p style={{marginTop:14,fontFamily:fonts.mono,fontSize:9,color:T.w4,letterSpacing:"0.1em"}}>Your score is saved · Protocol access enabled</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function MeetMario() {
  const [showLanding,setShowLanding]   = useState(true);
  const [showOnboarding,setShowOnboarding] = useState(false);
  const [patientProfile,setPatientProfile] = useState(null);
  const [tab,setTab]                   = useState("monitor");
  const [rotDay,setRotDay]             = useState(1);
  const [proteins,setProteins]         = useState({});
  const [picker,setPicker]             = useState(null);
  const [genPhase,setGenPhase]         = useState("detox");
  const [cuisine,setCuisine]           = useState(null);
  const [mealScope,setMealScope]       = useState("full_day");
  const [eatPat,setEatPat]             = useState("standard");
  const [genResult,setGenResult]       = useState(null);
  const [genLoad,setGenLoad]           = useState(false);
  const [research,setResearch]         = useState({});
  const [resLoad,setResLoad]           = useState(null);
  const [foodQ,setFoodQ]               = useState("");
  const [chatMsgs,setChatMsgs]         = useState([{role:"assistant",content:"Good day, Christina. Your ALCAT results from April 2024 are loaded — Candida mild and Whey moderate are your two active markers. Where would you like to start?"}]);
  const [chatIn,setChatIn]             = useState("");
  const [chatLoad,setChatLoad]         = useState(false);
  const [expandPh,setExpandPh]         = useState(null);
  const [recipeTarget,setRecipeTarget] = useState(null);
  const [recipeSteps,setRecipeSteps]   = useState(null);
  const [recipeLoading,setRecipeLoading] = useState(false);
  const [groceryWeek,setGroceryWeek]   = useState([1,2,3,4]);
  const [groceryList,setGroceryList]   = useState(null);
  const [groceryLoad,setGroceryLoad]   = useState(false);
  const [groceryStore,setGroceryStore] = useState("matsmart");
  const [groceryExport,setGroceryExport] = useState(false);
  const [monActive,setMonActive]       = useState(false);
  const [monTimeline,setMonTimeline]   = useState([]);
  const [monSpikes,setMonSpikes]       = useState([]);
  const [monTick,setMonTick]           = useState(0);
  const [monMealLabel,setMonMealLabel] = useState("Lunch");
  const [monFoods,setMonFoods]         = useState([]);
  const [monFoodInput,setMonFoodInput] = useState("");
  const [diary,setDiary]               = useState([]);
  const [popup,setPopup]               = useState(null);
  const [popupStep,setPopupStep]       = useState(0);
  const [popupReactive,setPopupReactive] = useState(null);
  const [popupSymptoms,setPopupSymptoms] = useState([]);
  const [popupSeverity,setPopupSeverity] = useState(null);
  const [popupAnalysis,setPopupAnalysis] = useState("");
  const [popupLoading,setPopupLoading] = useState(false);
  const [clinView,setClinView]         = useState(false);
  const chatEnd = useRef(null);
  useEffect(()=>{ chatEnd.current?.scrollIntoView({behavior:"smooth"}); },[chatMsgs]);

  const startMonitoring = useCallback(()=>{
    const hasR=monFoods.some(f=>{const fu=f.toUpperCase();return P.severe.some(s=>fu.includes(s)||s.includes(fu))||P.moderate.some(s=>fu.includes(s)||s.includes(fu));});
    setMonTimeline(simulateMealResponse(hasR));setMonSpikes([]);setMonTick(0);setMonActive(true);setPopup(null);
  },[monFoods]);

  useEffect(()=>{
    if(!monActive)return;
    const iv=setInterval(()=>{
      setMonTick(t=>{
        const next=t+1;
        if(next>=monTimeline.length){setMonActive(false);clearInterval(iv);return t;}
        const vis=monTimeline.slice(0,next+1),spks=detectSpikes(vis);
        setMonSpikes(prev=>{
          const newS=spks.filter(s=>!prev.find(p=>p.m===s.m));
          if(newS.length>0&&!popup){setPopup(newS[0]);setPopupStep(0);setPopupReactive(null);setPopupSymptoms([]);setPopupSeverity(null);setPopupAnalysis("");}
          return spks;
        });
        return next;
      });
    },180);
    return()=>clearInterval(iv);
  },[monActive,monTimeline]);

  const visiblePts=monTimeline.slice(0,monTick+1);
  const currentPt=visiblePts[visiblePts.length-1];

  const logAndDismiss=async()=>{
    setPopupLoading(true);
    const prompt=`Christina just had a post-meal biometric reaction. Analyse and advise.\nMeal: ${monMealLabel}\nFoods: ${monFoods.join(", ")||"not logged"}\nSpike: ${popup?.label} (${popup?.val}) at ${popup?.min}min\nAte reactive: ${popupReactive?"Possibly":"No"}\nSymptoms: ${popupSymptoms.join(", ")||"none"}\nSeverity: ${popupSeverity||"unrated"}\nGive 4 short paragraphs: likely cause, what to monitor 2h, next meal adjustment, flag clinician?`;
    let analysis="";
    try{analysis=await callClaude([{role:"user",content:prompt}],MARIO_SYS);}catch{analysis="Analysis unavailable.";}
    setPopupAnalysis(analysis);setPopupLoading(false);
    setDiary(prev=>[{id:Date.now(),ts:new Date().toISOString(),meal:monMealLabel,foods:[...monFoods],spike:popup,reactive:popupReactive,symptoms:[...popupSymptoms],severity:popupSeverity,analysis,timeline:[...visiblePts],flagClinic:popupSeverity==="severe"||popup?.level==="severe"},...prev]);
    setPopupStep(3);
  };

  const fetchResearch=async(fid)=>{
    if(research[fid]||resLoad===fid)return;setResLoad(fid);
    const fl={if16_8:"16:8 intermittent fasting",if18_6:"18:6 intermittent fasting",if5_2:"5:2 diet"}[fid];
    const prompt=`Search 2020-2024 evidence on ${fl} for 64yo post-menopausal female, Candida mild, Whey sensitivity. Cover: hormones/HPA, muscle/bone 60+, gut permeability, metabolic markers. Tag each claim [Strong RCT] [Meta-analysis] [Observational] [Mechanistic] or [Expert consensus]. End with RECOMMENDATION (3 sentences).`;
    try{const r=await callClaude([{role:"user",content:prompt}],"You are a clinical researcher.",{tools:[{type:"web_search_20250305",name:"web_search"}]});setResearch(p=>({...p,[fid]:r}));}catch{setResearch(p=>({...p,[fid]:"Connection error."}));}
    setResLoad(null);
  };

  const sendChat=async()=>{
    if(!chatIn.trim()||chatLoad)return;
    const um={role:"user",content:chatIn},msgs=[...chatMsgs,um];
    setChatMsgs(msgs);setChatIn("");setChatLoad(true);
    try{const r=await callClaude(msgs,MARIO_SYS);setChatMsgs([...msgs,{role:"assistant",content:r}]);}catch{setChatMsgs(m=>[...m,{role:"assistant",content:"Connection error."}]);}
    setChatLoad(false);
  };

  const genMenu=async()=>{
    if(!cuisine||genLoad)return;setGenLoad(true);setGenResult(null);
    const r=ROT[rotDay],cu=CUISINES.find(c=>c.id===cuisine)?.label,ep=EAT_PATS.find(e=>e.id===eatPat);
    const foods=`Grains: ${r.grains.join(", ")}\nVeg: ${r.veg.join(", ")}\nFruit: ${r.fruit.join(", ")}\nProtein: ${r.protein.join(", ")}\nMisc: ${r.misc.join(", ")}`;
    const pInstr=eatPat==="standard"?"Standard 6 meals every 3h.":eatPat==="if16_8"?"IF 16:8 window 12:00-20:00.":eatPat==="if18_6"?"IF 18:6 window 13:00-19:00.":"5:2 fasting day ~500 kcal.";
    const prompt=`Generate a ${mealScope==="full_day"?"full day":mealScope} menu in ${cu} style.\nHARD RULES: Day ${rotDay} foods only. No sugars/yeast (Candida). No milk (Whey). No seed oils. CPF every main meal.\nFruit only in snacks with protein/fat.\nDay ${rotDay}:\n${foods}\n${pInstr}\nFormat: **Dish Name** then one sentence. End with Notes paragraph.`;
    try{const res=await callClaude([{role:"user",content:prompt}],"You are a clinical chef at MediBalans.");setGenResult(res);}catch{setGenResult("Error. Please try again.");}
    setGenLoad(false);
  };

  const fetchRecipeSteps=async(day,mealKey,protein,base,sides)=>{
    setRecipeLoading(true);setRecipeSteps(null);
    const prompt=`Write a step-by-step recipe for:\nDish: ${protein} — ${base}${sides?" · "+sides:""}\nALCAT Day ${day} rotation. No seed oils. No garlic/onion/tomato. 1 person.\n\nFormat exactly:\nPREP TIME: X min | COOK TIME: X min | SERVES: 1\n\nINGREDIENTS:\n- [ingredient with amount]\n\nSTEPS:\n1. [step]\n(max 8 steps)\n\nCLINICAL NOTE: One sentence on ALCAT relevance.`;
    try{const r=await callClaude([{role:"user",content:prompt}],"You are a clinical chef at MediBalans AB. No seed oils ever.");setRecipeSteps(r);}catch{setRecipeSteps("Error loading recipe.");}
    setRecipeLoading(false);
  };

  const buildGroceryList=async()=>{
    if(groceryLoad)return;setGroceryLoad(true);setGroceryList(null);
    const days=groceryWeek,allFoodsList=days.map(d=>{const r=ROT[d];return`Day ${d}: Grains: ${r.grains.slice(0,3).join(", ")} | Veg: ${r.veg.slice(0,5).join(", ")} | Protein: ${r.protein.slice(0,3).join(", ")} | Fruit: ${r.fruit.slice(0,3).join(", ")} | Misc: ${r.misc.slice(0,3).join(", ")}`;}).join("\n");
    const prompt=`Generate a structured weekly grocery list for the ALCAT rotation protocol.\nRotation days: ${days.join(", ")}\n${allFoodsList}\nRules: No seed oils. No garlic/onion/tomato. No sugar/yeast (Candida). No dairy (Whey). Organic where possible. Wild-caught fish only.\n\nFormat:\n**FISH & PROTEIN**\n**VEGETABLES**\n**FRUITS**\n**GRAINS & STARCHES**\n**OILS & FATS**\n**HERBS & SPICES**\n**STORE NOTES** (2-3 sentences)`;
    try{const r=await callClaude([{role:"user",content:prompt}],"You are a clinical nutritionist at MediBalans AB.");setGroceryList(r);}catch{setGroceryList("Error generating list.");}
    setGroceryLoad(false);
  };

  const getP=(d,k)=>proteins[`${d}-${k}`]||MEALS[d][k]?.defaultP;
  const setP=(d,k,p)=>{setProteins(prev=>({...prev,[`${d}-${k}`]:p}));setPicker(null);};
  const allFoods=[...P.severe.map(f=>({food:f,level:"severe"})),...P.moderate.map(f=>({food:f,level:"moderate"})),...P.mild.map(f=>({food:f,level:"mild"})),...P.alsoAvoid.candida.map(f=>({food:f,level:"candida"})),...P.alsoAvoid.whey.map(f=>({food:f,level:"whey"}))];
  const foodResults=foodQ.length>1?allFoods.filter(({food})=>food.toLowerCase().includes(foodQ.toLowerCase())).slice(0,10):[];

  const TABS = [
    {id:"monitor",label:"Monitor"},
    {id:"protocol",label:"Protocol"},
    {id:"rotation",label:"Rotation"},
    {id:"meals",label:"Meals"},
    {id:"generate",label:"Generate"},
    {id:"grocery",label:"Grocery"},
    {id:"lookup",label:"Food Check"},
    {id:"chat",label:"Ask Mario"},
  ];

  const PHASES=[
    {id:1,label:"21-Day Detox",range:"Days 1–21",color:T.rg,rules:["Green list only","6 meals every 3h","No sugars/yeast (Candida)","No milk (Whey)"],note:"Any deviation restarts the inflammatory clock."},
    {id:2,label:"Green Phase",range:"Months 1–3",color:T.ok,rules:["Strict 4-day rotation","One legume day/week","Candida continues","Whey continues"],note:"Rotation prevents new sensitivities forming."},
    {id:3,label:"Mild Reintroduction",range:"Month 3–4",color:T.warn,rules:["Up to 3 mild foods/day","Repeat only after 4 days","Watch for reactions"],note:"React → delay 1 month."},
    {id:4,label:"Moderate Reintroduction",range:"Month 6",color:"#C87030",rules:["Same as mild method","Whey restriction ends"],note:"Most patients see largest improvements here."},
    {id:5,label:"Maintenance",range:"Month 9+",color:"#6A9E8E",rules:["Full rotation","One free day/week"],note:"52 free days per year without affecting outcomes."},
  ];

  // Reaction popup
  const SpikePopup = () => {
    if(!popup)return null;
    const lc=popup.level==="severe"?T.err:T.warn;
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(28,20,16,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}}>
        <div style={{background:T.w,border:`1px solid ${lc}40`,borderRadius:16,maxWidth:480,width:"100%",boxShadow:`0 24px 64px rgba(28,20,16,0.22), 0 0 0 1px rgba(255,255,255,0.6) inset`}}>
          {/* Header */}
          <div style={{borderBottom:`1px solid ${T.w3}`,padding:"18px 24px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:lc,boxShadow:`0 0 10px ${lc}`}}/>
              <span style={{fontFamily:fonts.mono,fontSize:9,letterSpacing:"0.18em",color:lc,textTransform:"uppercase"}}>{popup.level} reaction detected · {popup.min}min post-meal</span>
            </div>
            <div style={{fontFamily:fonts.serif,fontSize:22,color:T.w7,fontWeight:400}}>{popup.label} {popup.val}</div>
          </div>
          <div style={{padding:"20px 24px"}}>
            {popupStep===0&&<>
              <p style={{fontSize:13,color:T.w6,lineHeight:1.7,marginBottom:16,fontFamily:fonts.sans,fontWeight:300}}>
                Your <strong style={{color:lc,fontWeight:500}}>{popup.label}</strong> spiked unusually.
                {monFoods.length>0&&<span style={{display:"block",marginTop:6,fontSize:11,color:T.w4,fontFamily:fonts.mono}}>Logged meal: {monFoods.join(", ")}</span>}
              </p>
              <div style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:12}}>Did you eat anything outside your green list?</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setPopupReactive(true);setPopupStep(1);}} style={{flex:1,background:T.rgBg,border:`1px solid ${T.rg}`,borderRadius:9,padding:"11px",cursor:"pointer",color:T.rg2,fontSize:12,fontFamily:fonts.sans,fontWeight:500}}>Yes — possibly</button>
                <button onClick={()=>{setPopupReactive(false);setPopupStep(1);}} style={{flex:1,background:T.w1,border:`1px solid ${T.w3}`,borderRadius:9,padding:"11px",cursor:"pointer",color:T.w5,fontSize:12,fontFamily:fonts.sans}}>No — on protocol</button>
              </div>
            </>}
            {popupStep===1&&<>
              <div style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:14}}>Symptoms right now</div>
              {Object.values(SYMPTOM_CATS).map(cat=>(
                <div key={cat.label} style={{marginBottom:12}}>
                  <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:6}}>{cat.icon} {cat.label}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {cat.items.map(s=>{const sel=popupSymptoms.includes(s);return(
                      <button key={s} onClick={()=>setPopupSymptoms(p=>sel?p.filter(x=>x!==s):[...p,s])} style={{background:sel?T.rgBg:T.w,border:`1px solid ${sel?T.rg:T.w3}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:fonts.sans,color:sel?T.rg2:T.w5}}>{s}</button>
                    );})}
                  </div>
                </div>
              ))}
              <div style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.16em",textTransform:"uppercase",margin:"14px 0 10px"}}>Overall severity</div>
              <div style={{display:"flex",gap:7,marginBottom:18}}>
                {["mild","moderate","severe"].map(sev=>{const c=sev==="severe"?T.err:sev==="moderate"?T.warn:T.ok;return(
                  <button key={sev} onClick={()=>setPopupSeverity(sev)} style={{flex:1,background:popupSeverity===sev?c+"18":T.w1,border:`1px solid ${popupSeverity===sev?c:T.w3}`,borderRadius:8,padding:"9px",cursor:"pointer",color:popupSeverity===sev?c:T.w5,fontSize:12,fontFamily:fonts.sans,fontWeight:500,textTransform:"capitalize"}}>{sev}</button>
                );})}
              </div>
              <BtnPrimary onClick={logAndDismiss} loading={popupLoading}>
                {popupLoading?"Analysing…":"Log reaction & get Mario's analysis →"}
              </BtnPrimary>
            </>}
            {popupStep===3&&<>
              <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.rg2,letterSpacing:"0.20em",textTransform:"uppercase",marginBottom:10}}>Mario's Analysis</div>
              <div style={{fontSize:12,color:T.w6,lineHeight:1.8,fontFamily:fonts.sans,fontWeight:300,maxHeight:220,overflowY:"auto",marginBottom:16}}>
                {popupAnalysis.split("\n").map((l,i)=>l.trim()?<div key={i} style={{marginBottom:6}}>{l}</div>:null)}
              </div>
              {diary[0]?.flagClinic&&<div style={{background:`${T.err}10`,border:`1px solid ${T.err}35`,borderRadius:7,padding:"8px 12px",marginBottom:14,fontSize:11,color:T.err,fontFamily:fonts.mono,display:"flex",gap:6,alignItems:"center"}}>⚠ Flagged for clinician review</div>}
              <button onClick={()=>setPopup(null)} style={{width:"100%",background:T.w1,border:`1px solid ${T.w3}`,borderRadius:9,padding:"11px",cursor:"pointer",color:T.w5,fontSize:12,fontFamily:fonts.sans}}>Close — logged to diary ✓</button>
            </>}
          </div>
        </div>
      </div>
    );
  };

  // ─── TABS ─────────────────────────────────────────────────────────────────

  const tabContent = () => {
    // ── MONITOR ──
    if(tab==="monitor") return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <Eyebrow>Real-time biometric monitoring</Eyebrow>
            <SectionTitle>Post-Meal Response<br/><em style={{fontStyle:"italic",color:T.rg2}}>Tracker</em></SectionTitle>
          </div>
          <button onClick={()=>setClinView(v=>!v)} style={{background:clinView?T.rgBg:T.w1,border:`1px solid ${clinView?T.rg:T.w3}`,borderRadius:9,padding:"8px 16px",cursor:"pointer",fontSize:11,fontFamily:fonts.sans,color:clinView?T.rg2:T.w5}}>
            {clinView?"Patient view":"Clinician view"}
          </button>
        </div>

        {!monActive&&monTimeline.length===0?(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {/* Setup card */}
            <Panel>
              <FieldLabel>Meal</FieldLabel>
              <div style={{display:"flex",gap:5,marginBottom:18,flexWrap:"wrap"}}>
                {["Breakfast","Snack","Lunch","Dinner","Post-exercise"].map(m=>(
                  <button key={m} onClick={()=>setMonMealLabel(m)} style={{background:monMealLabel===m?T.rgBg:T.w,border:`1px solid ${monMealLabel===m?T.rg:T.w3}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:fonts.sans,color:monMealLabel===m?T.rg2:T.w5}}>{m}</button>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <FieldLabel>Foods eaten</FieldLabel>
                <div style={{display:"flex",gap:4}}>
                  {[1,2,3,4].map(d=>(
                    <button key={d} onClick={()=>{setRotDay(d);setMonFoods([]);}} style={{background:rotDay===d?T.rg:T.w,border:`1px solid ${rotDay===d?T.rg:T.w3}`,color:rotDay===d?"#fff":T.w5,borderRadius:4,padding:"2px 9px",cursor:"pointer",fontSize:10,fontFamily:fonts.mono}}>D{d}</button>
                  ))}
                </div>
              </div>
              {monFoods.length>0&&(
                <div style={{background:`${T.ok}0F`,border:`1px solid ${T.ok}30`,borderRadius:7,padding:"8px 10px",marginBottom:8}}>
                  <div style={{fontFamily:fonts.mono,fontSize:8,color:T.ok,letterSpacing:"0.14em",marginBottom:5}}>YOUR MEAL ({monFoods.length})</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {monFoods.map((f,i)=>{const fu=f.toUpperCase(),isS=P.severe.some(s=>fu.includes(s)||s.includes(fu.split(" ")[0])),isM=P.moderate.some(s=>fu.includes(s)||s.includes(fu.split(" ")[0])),col=isS?T.err:isM?T.warn:T.ok;return(
                      <span key={i} onClick={()=>setMonFoods(p=>p.filter((_,j)=>j!==i))} style={{background:col+"18",border:`1px solid ${col}50`,borderRadius:4,padding:"2px 8px",fontSize:11,fontFamily:fonts.sans,color:col,cursor:"pointer"}}>{f} ×</span>
                    );})}
                  </div>
                </div>
              )}
              <RuledInput value={monFoodInput} onChange={e=>setMonFoodInput(e.target.value)} placeholder="Type food + Enter"
                style={{marginBottom:10}}/>
              <div style={{maxHeight:200,overflowY:"auto",marginTop:8}}>
                {[["protein","🐟"],["veg","🥬"],["grains","🌾"],["fruit","🍓"],["misc","🫙"]].map(([cat,em])=>{
                  const items=ROT[rotDay][cat].filter(f=>!monFoodInput||f.toLowerCase().includes(monFoodInput.toLowerCase()));
                  if(!items.length)return null;
                  return <div key={cat} style={{marginBottom:8}}>
                    <div style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>{em} {cat}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                      {items.map(f=>{const fu=f.toUpperCase(),isSev=P.severe.some(s=>fu===s),isMod=P.moderate.some(s=>fu===s),added=monFoods.includes(f),col=isSev?T.err:isMod?T.warn:T.ok;return(
                        <button key={f} onClick={()=>setMonFoods(p=>added?p.filter(x=>x!==f):[...p,f])} style={{background:added?col+"18":T.w,border:`1px solid ${added?col:isSev?T.err+"40":isMod?T.warn+"30":T.w3}`,borderRadius:4,padding:"2px 7px",cursor:"pointer",fontSize:10,fontFamily:fonts.sans,color:added?col:isSev?T.err+"90":isMod?T.warn+"90":T.w5,fontWeight:added?500:400}}>
                          {added?"✓ ":""}{f}
                        </button>
                      );})}
                    </div>
                  </div>;
                })}
              </div>
              {monFoods.some(f=>P.severe.some(s=>f.toUpperCase().includes(s))||P.moderate.some(s=>f.toUpperCase().includes(s)))&&(
                <div style={{background:`${T.err}0C`,border:`1px solid ${T.err}30`,borderRadius:7,padding:"8px 10px",margin:"12px 0",fontSize:11,color:T.err,fontFamily:fonts.sans}}>⚠ Reactive food in this meal — elevated spike risk</div>
              )}
              <div style={{marginTop:16}}>
                <BtnPrimary onClick={startMonitoring}>Start 2h monitoring</BtnPrimary>
              </div>
            </Panel>
            {/* Device status */}
            <div>
              <Panel>
                <FieldLabel>Data Sources</FieldLabel>
                {[{name:"Apple Watch",streams:"HR · HRV",badge:"HRV"},
                  {name:"Oura Ring",streams:"HRV · Temp · SpO2 · Readiness",badge:"HRV·TEMP"},
                  {name:"Garmin",streams:"HR · HRV · Sleep · Stress",badge:"HRV·SLEEP"},
                  {name:"Samsung Galaxy Watch",streams:"HR · HRV (IBI) · SpO2 · Skin temp",badge:"HRV·TEMP"},
                  {name:"Dexcom G7/G6",streams:"Glucose · 5min intervals · trends",badge:"GLUCOSE"},
                  {name:"Libre 2 / 3",streams:"Glucose · 1min intervals",badge:"GLUCOSE"},
                ].map(d=>(
                  <div key={d.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.w2}`}}>
                    <span style={{fontSize:16,flexShrink:0}}>{d.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                        <span style={{fontSize:12,color:T.w7,fontFamily:fonts.sans}}>{d.name}</span>
                        <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,border:`1px solid ${T.w3}`,borderRadius:3,padding:"1px 5px",letterSpacing:"0.1em"}}>{d.badge}</span>
                      </div>
                      <div style={{fontSize:10,color:T.w4,fontFamily:fonts.mono}}>{d.streams}</div>
                    </div>
                    <span style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,border:`1px solid ${T.w3}`,borderRadius:4,padding:"2px 7px"}}>Simulated</span>
                  </div>
                ))}
              </Panel>
              {diary.length>0&&<Panel>
                <FieldLabel>Recent Reactions</FieldLabel>
                {diary.slice(0,3).map(e=>(
                  <div key={e.id} style={{borderBottom:`1px solid ${T.w2}`,paddingBottom:8,marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,color:T.w7,fontFamily:fonts.sans}}>{e.meal}</span>
                      <span style={{fontSize:10,color:T.w4,fontFamily:fonts.mono}}>{new Date(e.ts).toLocaleDateString("en-SE")}</span>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {e.spike&&<span style={{fontSize:10,background:e.spike.level==="severe"?`${T.err}18`:`${T.warn}18`,color:e.spike.level==="severe"?T.err:T.warn,border:`1px solid ${e.spike.level==="severe"?T.err:T.warn}40`,borderRadius:4,padding:"1px 7px",fontFamily:fonts.mono}}>{e.spike.label}</span>}
                      {e.flagClinic&&<span style={{fontSize:10,color:T.err,fontFamily:fonts.mono}}>⚠ Flagged</span>}
                    </div>
                  </div>
                ))}
              </Panel>}
            </div>
          </div>
        ):(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {monActive
                  ?<><div style={{width:8,height:8,borderRadius:"50%",background:T.err,boxShadow:`0 0 8px ${T.err}`}}/><span style={{fontSize:12,color:T.err,fontFamily:fonts.mono,letterSpacing:"0.12em"}}>LIVE · {monMealLabel} · {currentPt?.min||0}min</span></>
                  :<><div style={{width:8,height:8,borderRadius:"50%",background:T.ok}}/><span style={{fontSize:12,color:T.ok,fontFamily:fonts.mono,letterSpacing:"0.12em"}}>COMPLETE · 120min</span></>}
              </div>
              <button onClick={()=>{setMonTimeline([]);setMonTick(0);setMonActive(false);setMonFoods([]);setMonSpikes([]);}} style={{background:T.w1,border:`1px solid ${T.w3}`,borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:11,fontFamily:fonts.sans,color:T.w5}}>↺ New session</button>
            </div>
            {monSpikes.length>0&&<div style={{marginBottom:14}}>
              {monSpikes.map((sp,i)=>(
                <div key={i} style={{background:sp.level==="severe"?`${T.err}0C`:`${T.warn}0C`,border:`1px solid ${sp.level==="severe"?T.err:T.warn}35`,borderRadius:8,padding:"8px 14px",marginBottom:6,display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:sp.level==="severe"?T.err:T.warn}}/>
                  <span style={{fontSize:12,color:sp.level==="severe"?T.err:T.warn,fontFamily:fonts.sans,fontWeight:500}}>{sp.label} {sp.val}</span>
                  <span style={{fontSize:10,color:T.w4,fontFamily:fonts.mono}}>{sp.min}min</span>
                </div>
              ))}
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <MiniChart pts={visiblePts} key_="hr" color={T.err} label="Heart Rate" unit="bpm"/>
              <MiniChart pts={visiblePts} key_="hrv" color={T.rg} label="HRV" unit="ms"/>
              <MiniChart pts={visiblePts} key_="glucose" color={T.warn} label="Glucose" unit="mg/dL"/>
              <MiniChart pts={visiblePts} key_="temp" color="#8A7050" label="Body Temp" unit="°C"/>
            </div>
            {currentPt&&<Panel>
              <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                {[["SpO2",currentPt.spo2,"%",T.rg,v=>v>=96],["HR",currentPt.hr,"bpm",T.err,v=>v<90],["HRV",currentPt.hrv,"ms",T.rg,v=>v>35],["Glucose",currentPt.glucose,"mg/dL",T.warn,v=>v<130],["Temp",currentPt.temp,"°C","#8A7050",v=>v<37.1]].map(([label,val,unit,color,good])=>(
                  <div key={label} style={{textAlign:"center"}}>
                    <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:4}}>{label}</div>
                    <div style={{fontFamily:fonts.serif,fontSize:22,fontWeight:400,color:good(val)?color:T.err}}>{val}</div>
                    <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.w4}}>{unit}</div>
                  </div>
                ))}
                <div style={{marginLeft:"auto",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-end"}}>
                  <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,letterSpacing:"0.14em",textTransform:"uppercase"}}>Remaining</div>
                  <div style={{fontFamily:fonts.serif,fontSize:20,color:T.rg,fontWeight:400}}>{Math.max(0,120-(currentPt?.min||0))}′</div>
                </div>
              </div>
            </Panel>}
          </div>
        )}

        {clinView&&diary.length>0&&<div style={{marginTop:28}}>
          <Eyebrow>Clinician Dashboard — {diary.length} Reaction{diary.length>1?"s":""}</Eyebrow>
          {diary.map(e=>(
            <Panel key={e.id} style={{borderLeft:`3px solid ${e.flagClinic?T.err:T.rg}`,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <span style={{fontSize:13,color:T.w7,fontFamily:fonts.sans,fontWeight:500}}>{e.meal}</span>
                  <span style={{fontSize:10,color:T.w4,fontFamily:fonts.mono,marginLeft:8}}>{new Date(e.ts).toLocaleString("en-SE")}</span>
                </div>
                {e.flagClinic&&<span style={{fontFamily:fonts.mono,fontSize:8.5,color:T.err,border:`1px solid ${T.err}40`,borderRadius:4,padding:"3px 9px",letterSpacing:"0.12em"}}>⚠ REVIEW</span>}
              </div>
              {e.analysis&&<div style={{fontSize:11,color:T.w6,lineHeight:1.7,fontFamily:fonts.sans,fontWeight:300}}>{e.analysis.slice(0,280)}{e.analysis.length>280?"…":""}</div>}
            </Panel>
          ))}
        </div>}
      </div>
    );

    // ── PROTOCOL ──
    if(tab==="protocol") return (
      <div>
        <Eyebrow>Clinical protocol</Eyebrow>
        <SectionTitle>Avoidance timeline &<br/><em style={{fontStyle:"italic",color:T.rg2}}>reintroduction phases</em></SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
          {[{label:"SEVERE — 9 MONTHS",color:T.err,text:"Beef, coffee, garlic, onion, tomato, all rice, black tea, cauliflower, Brussels sprout, chickpea, cilantro, bell pepper, scallion, canola oil, lobster, pistachio, poppy seed, capers, cumin, endive, honeydew, monk fruit, mulberry, wakame, jalapeño, egg white"},
            {label:"MODERATE — 6 MONTHS",color:T.warn,text:"All common grains · Most fish · Most vegetables · Nearly all fruits · Most nuts & herbs"},
            {label:"CANDIDA — 3 MONTHS",color:"#906080",text:"No sugars (agave, honey, maple, molasses) · No yeast (baker's, brewer's, nutritional) · No alcohol, vinegar"},
            {label:"WHEY — 6 MONTHS",color:"#5080A8",text:"No cow's, goat's, or sheep's milk · No whey protein"},
          ].map(({label,color,text})=>(
            <div key={label} style={{background:T.w,border:`1px solid ${T.w3}`,borderLeft:`3px solid ${color}`,borderRadius:9,padding:"14px 16px",boxShadow:`0 1px 3px rgba(100,80,60,0.05)`}}>
              <div style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color,marginBottom:6,textTransform:"uppercase"}}>{label}</div>
              <div style={{fontSize:11,color:T.w6,fontFamily:fonts.sans,lineHeight:1.7,fontWeight:300}}>{text}</div>
            </div>
          ))}
        </div>
        {PHASES.map(ph=>(
          <div key={ph.id} style={{background:expandPh===ph.id?T.w:T.w1,border:`1px solid ${expandPh===ph.id?ph.color+"40":T.w3}`,borderLeft:`3px solid ${ph.color}`,borderRadius:8,marginBottom:3,overflow:"hidden"}}>
            <button onClick={()=>setExpandPh(expandPh===ph.id?null:ph.id)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"11px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <span style={{fontSize:12,color:ph.color,fontWeight:500,fontFamily:fonts.sans}}>{ph.label}</span>
                <span style={{fontSize:10,color:T.w4,fontFamily:fonts.mono,letterSpacing:"0.1em"}}>{ph.range}</span>
              </div>
              <span style={{color:T.w4,fontSize:14}}>{expandPh===ph.id?"−":"+"}</span>
            </button>
            {expandPh===ph.id&&<div style={{padding:"0 16px 14px"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                {ph.rules.map((r,i)=><span key={i} style={{background:T.w2,border:`1px solid ${T.w3}`,borderRadius:4,padding:"3px 10px",fontSize:11,color:T.w6,fontFamily:fonts.sans}}>{r}</span>)}
              </div>
              <div style={{fontSize:11,color:T.rg2,fontFamily:fonts.sans,fontStyle:"italic",fontWeight:300}}>{ph.note}</div>
            </div>}
          </div>
        ))}
      </div>
    );

    // ── ROTATION ──
    if(tab==="rotation") return (
      <div>
        <Eyebrow>4-day rotation cycle</Eyebrow>
        <SectionTitle>Day {rotDay} — <em style={{fontStyle:"italic",color:T.rg2}}>green list</em></SectionTitle>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {[1,2,3,4].map(d=>(
            <button key={d} onClick={()=>setRotDay(d)} style={{background:rotDay===d?T.rg:T.w,border:`1px solid ${rotDay===d?T.rg:T.w3}`,color:rotDay===d?"#fff":T.w5,borderRadius:8,padding:"8px 22px",cursor:"pointer",fontSize:12,fontFamily:fonts.sans,fontWeight:rotDay===d?500:400,transition:"all .16s"}}>Day {d}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[["grains","🌾","Grains"],["veg","🥬","Vegetables"],["fruit","🍓","Fruit"],["protein","🐟","Protein"],["misc","🫙","Nuts & Herbs"]].map(([k,em,label])=>(
            <div key={k} style={{background:T.w,border:`1px solid ${T.w3}`,borderRadius:10,padding:"14px 16px",gridColumn:k==="misc"?"1/-1":undefined,boxShadow:`0 1px 3px rgba(100,80,60,0.05)`}}>
              <div style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color:T.rg2,textTransform:"uppercase",marginBottom:10}}>{em} {label}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {ROT[rotDay][k].map(f=><span key={f} style={{background:T.w1,border:`1px solid ${T.w3}`,borderRadius:4,padding:"3px 9px",fontSize:11,fontFamily:fonts.sans,color:T.w6}}>{f}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    // ── MEALS ──
    if(tab==="meals") return (
      <div onClick={e=>e.stopPropagation()}>
        <Eyebrow>Daily meal plan</Eyebrow>
        <SectionTitle>Day {rotDay} — <em style={{fontStyle:"italic",color:T.rg2}}>rotation meals</em></SectionTitle>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {[1,2,3,4].map(d=>(
            <button key={d} onClick={()=>{setRotDay(d);setPicker(null);}} style={{background:rotDay===d?T.rg:T.w,border:`1px solid ${rotDay===d?T.rg:T.w3}`,color:rotDay===d?"#fff":T.w5,borderRadius:8,padding:"8px 22px",cursor:"pointer",fontSize:12,fontFamily:fonts.sans,fontWeight:rotDay===d?500:400}}>Day {d}</button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[["breakfast","🌅","Breakfast"],["snack1","🍓","Snack"],["lunch","🍽️","Lunch"],["snack2","🫙","Snack"],["dinner","🐟","Dinner"],["snack3","🌿","Evening"]].map(([k,em,label])=>{
            const meal=MEALS[rotDay][k],selP=meal.isProtein?getP(rotDay,k):null,pk=`${rotDay}-${k}`,isOpen=picker===pk,isRecipeOpen=recipeTarget===pk;
            return <div key={k} style={{background:T.w,border:`1px solid ${isOpen?T.rg+"50":T.w3}`,borderRadius:10,padding:"14px 18px",boxShadow:`0 1px 3px rgba(100,80,60,0.05)`}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>{em}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:T.rg2,fontWeight:500,fontFamily:fonts.mono,letterSpacing:"0.12em",textTransform:"uppercase"}}>{label}</span>
                    {meal.isProtein&&<div style={{position:"relative",marginLeft:"auto"}} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>setPicker(isOpen?null:pk)} style={{background:isOpen?T.rgBg:T.w1,border:`1px solid ${isOpen?T.rg:T.w3}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9}}>↻</span>
                        <span style={{fontSize:11,color:isOpen?T.rg2:T.w6,fontFamily:fonts.sans}}>{selP}</span>
                        <span style={{fontSize:8,color:T.w4}}>▾</span>
                      </button>
                      {isOpen&&<div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:T.w,border:`1px solid ${T.rg}40`,borderRadius:9,padding:5,zIndex:300,minWidth:200,boxShadow:`0 8px 32px rgba(100,80,60,0.12)`}}>
                        {Object.entries(meal.methods).map(([p,m])=>(
                          <button key={p} onClick={()=>setP(rotDay,k,p)} style={{display:"flex",justifyContent:"space-between",width:"100%",background:p===selP?T.rgBg:"none",border:`1px solid ${p===selP?T.rg+"40":"transparent"}`,borderRadius:5,padding:"5px 9px",cursor:"pointer",marginBottom:1}}>
                            <span style={{fontSize:11,color:p===selP?T.rg2:T.w7,fontFamily:fonts.sans}}>{p}</span>
                            <span style={{fontSize:10,color:T.w4,fontFamily:fonts.mono}}>{m}</span>
                          </button>
                        ))}
                      </div>}
                    </div>}
                  </div>
                  <div style={{fontSize:12,color:T.w6,lineHeight:1.6,fontFamily:fonts.sans,fontWeight:300}}>
                    {meal.isProtein?<><span style={{color:T.rg2,fontWeight:500}}>{selP}</span> <span style={{color:T.w4,fontSize:10}}>({meal.methods[selP]||"prepared"})</span> — {meal.base} · <span style={{color:T.w4}}>{meal.sides}</span></>:meal.base}
                  </div>
                  <div style={{marginTop:8}}>
                    <button onClick={()=>{if(isRecipeOpen){setRecipeTarget(null);setRecipeSteps(null);}else{setRecipeTarget(pk);fetchRecipeSteps(rotDay,k,meal.isProtein?selP:"",meal.base,meal.sides);}}} style={{background:"none",border:`1px solid ${isRecipeOpen?T.rg:T.w3}`,borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:fonts.mono,color:isRecipeOpen?T.rg2:T.w4,display:"flex",alignItems:"center",gap:4,letterSpacing:"0.1em"}}>
                      <span>{isRecipeOpen?"▾":"▸"}</span><span>{isRecipeOpen?"HIDE RECIPE":"STEP-BY-STEP RECIPE"}</span>
                    </button>
                    {isRecipeOpen&&<div style={{marginTop:10,background:T.w1,border:`1px solid ${T.rg}20`,borderRadius:8,padding:"14px 16px"}}>
                      {recipeLoading?<div style={{fontSize:11,color:T.w4,fontFamily:fonts.mono,letterSpacing:"0.1em"}}>Writing recipe…</div>
                      :recipeSteps?<div style={{fontSize:11,fontFamily:fonts.sans,lineHeight:1.8,fontWeight:300}}>
                        {recipeSteps.split("\n").map((line,ri)=>{
                          if(!line.trim())return<div key={ri} style={{height:4}}/>;
                          if(line.startsWith("PREP TIME")||line.startsWith("COOK TIME"))return<div key={ri} style={{color:T.w4,fontFamily:fonts.mono,fontSize:9,letterSpacing:"0.12em",marginBottom:6}}>{line}</div>;
                          if(line.startsWith("INGREDIENTS"))return<div key={ri} style={{color:T.rg2,fontWeight:600,fontSize:9,fontFamily:fonts.mono,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:10,marginBottom:5}}>INGREDIENTS</div>;
                          if(line.startsWith("STEPS"))return<div key={ri} style={{color:T.rg2,fontWeight:600,fontSize:9,fontFamily:fonts.mono,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:10,marginBottom:5}}>STEPS</div>;
                          if(line.startsWith("CLINICAL NOTE"))return<div key={ri} style={{marginTop:10,borderTop:`1px solid ${T.w3}`,paddingTop:8,color:T.ok,fontSize:10,fontFamily:fonts.sans,fontStyle:"italic",fontWeight:300}}>🌿 {line.replace("CLINICAL NOTE:","").trim()}</div>;
                          if(line.match(/^\d+\./))return<div key={ri} style={{display:"flex",gap:8,marginBottom:4}}><span style={{color:T.rg2,fontWeight:600,fontFamily:fonts.mono,minWidth:16,fontSize:10}}>{line.match(/^\d+/)[0]}.</span><span style={{color:T.w6,flex:1}}>{line.replace(/^\d+\.\s*/,"")}</span></div>;
                          if(line.startsWith("-"))return<div key={ri} style={{color:T.w6,paddingLeft:12,marginBottom:2}}>· {line.slice(1).trim()}</div>;
                          return<div key={ri} style={{color:T.w5}}>{line}</div>;
                        })}
                      </div>:null}
                    </div>}
                  </div>
                </div>
              </div>
            </div>;
          })}
        </div>
      </div>
    );

    // ── GENERATE ──
    if(tab==="generate") return (
      <div>
        <Eyebrow>AI menu generation</Eyebrow>
        <SectionTitle>Custom menu —<br/><em style={{fontStyle:"italic",color:T.rg2}}>your cuisine, your day</em></SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div>
              <FieldLabel>Rotation Day</FieldLabel>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4].map(d=><button key={d} onClick={()=>{setRotDay(d);setGenResult(null);}} style={{background:rotDay===d?T.rg:T.w,border:`1px solid ${rotDay===d?T.rg:T.w3}`,color:rotDay===d?"#fff":T.w5,borderRadius:7,padding:"7px 18px",cursor:"pointer",fontSize:11,fontFamily:fonts.sans,fontWeight:rotDay===d?500:400}}>Day {d}</button>)}
              </div>
            </div>
            <div>
              <FieldLabel>Phase</FieldLabel>
              {[{id:"detox",label:"Detox / Months 1–3"},{id:"post3months",label:"Post Month 3+"}].map(ph=>(
                <button key={ph.id} onClick={()=>{setGenPhase(ph.id);setGenResult(null);if(ph.id==="detox")setEatPat("standard");}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:genPhase===ph.id?T.rgBg:T.w,border:`1px solid ${genPhase===ph.id?T.rg:T.w3}`,borderRadius:8,padding:"9px 12px",cursor:"pointer",marginBottom:4,textAlign:"left"}}>
                  <span style={{fontSize:12,color:genPhase===ph.id?T.rg2:T.w7,fontFamily:fonts.sans,fontWeight:genPhase===ph.id?500:400}}>{ph.label}</span>
                </button>
              ))}
            </div>
            <div>
              <FieldLabel>Scope</FieldLabel>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[["full_day","📅","Full Day"],["breakfast","🌅","Breakfast"],["lunch","🍽️","Lunch"],["dinner","🐟","Dinner"]].map(([id,em,label])=>(
                  <button key={id} onClick={()=>{setMealScope(id);setGenResult(null);}} style={{background:mealScope===id?T.rgBg:T.w,border:`1px solid ${mealScope===id?T.rg:T.w3}`,color:mealScope===id?T.rg2:T.w5,borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:fonts.sans,display:"flex",alignItems:"center",gap:4}}><span>{em}</span>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Eating Pattern</FieldLabel>
              {EAT_PATS.map(ep=>{
                const locked=ep.fasting&&genPhase==="detox",sel=eatPat===ep.id;
                return <div key={ep.id}>
                  <button onClick={()=>{if(!locked){setEatPat(ep.id);setGenResult(null);}}} style={{width:"100%",background:locked?T.w2:sel?T.rgBg:T.w,border:`1px solid ${locked?T.w3:sel?T.rg:T.w3}`,borderRadius:7,padding:"8px 12px",cursor:locked?"not-allowed":"pointer",textAlign:"left",marginBottom:4,opacity:locked?0.45:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      
                      <div><div style={{fontSize:12,color:locked?T.w4:sel?T.rg2:T.w7,fontFamily:fonts.sans,fontWeight:sel?500:400}}>{ep.label}</div><div style={{fontSize:9,color:T.w4,fontFamily:fonts.mono}}>{ep.desc}</div></div>
                    </div>
                  </button>
                  {sel&&ep.fasting&&!locked&&<div style={{background:T.w1,border:`1px solid ${T.w3}`,borderTop:"none",borderRadius:"0 0 7px 7px",marginBottom:4}}>
                    {!research[ep.id]?<button onClick={()=>fetchResearch(ep.id)} disabled={resLoad===ep.id} style={{width:"100%",background:"none",border:"none",borderTop:`1px solid ${T.w3}`,padding:"8px 12px",cursor:"pointer",display:"flex",gap:7,alignItems:"center"}}>
                      <span style={{fontSize:10,color:T.rg2,fontFamily:fonts.mono,letterSpacing:"0.1em"}}>{resLoad===ep.id?"Searching PubMed…":"Research for your profile"}</span>
                    </button>:<div style={{padding:"10px 12px",maxHeight:200,overflowY:"auto"}}>
                      <div style={{fontSize:10,lineHeight:1.7,color:T.w6,fontFamily:fonts.sans,fontWeight:300}}>{research[ep.id].split("\n").slice(0,10).join("\n")}</div>
                    </div>}
                  </div>}
                </div>;
              })}
            </div>
          </div>
          <div>
            <FieldLabel>Cuisine</FieldLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {CUISINES.map(c=>(
                <button key={c.id} onClick={()=>{setCuisine(c.id);setGenResult(null);}} style={{background:cuisine===c.id?T.rgBg:T.w,border:`1px solid ${cuisine===c.id?T.rg:T.w3}`,borderRadius:9,padding:"12px 14px",cursor:"pointer",textAlign:"left",boxShadow:`0 1px 3px rgba(100,80,60,0.05)`}}>
                  <div style={{fontSize:18,marginBottom:4}}>{c.flag}</div>
                  <div style={{fontSize:12,color:cuisine===c.id?T.rg2:T.w7,fontWeight:cuisine===c.id?500:400,fontFamily:fonts.sans,marginBottom:2}}>{c.label}</div>
                  <div style={{fontSize:9.5,color:T.w4,fontFamily:fonts.mono}}>{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <BtnPrimary onClick={genMenu} disabled={!cuisine} loading={genLoad}>
          {!cuisine?"Select a cuisine to generate":`Generate · ${CUISINES.find(c=>c.id===cuisine)?.label} · Day ${rotDay}`}
        </BtnPrimary>
        {genResult&&<Panel style={{marginTop:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
            <span style={{fontSize:12,color:T.w7,fontFamily:fonts.sans}}>{CUISINES.find(c=>c.id===cuisine)?.flag} {CUISINES.find(c=>c.id===cuisine)?.label} · Day {rotDay}</span>
            <button onClick={()=>setGenResult(null)} style={{background:"none",border:`1px solid ${T.w3}`,borderRadius:5,color:T.w4,padding:"3px 9px",cursor:"pointer",fontSize:10,fontFamily:fonts.mono}}>↺</button>
          </div>
          <div style={{fontSize:12,lineHeight:1.9,color:T.w6,fontFamily:fonts.sans,fontWeight:300}}>
            {genResult.split("\n").map((line,i)=>{
              if(!line.trim())return<div key={i} style={{height:5}}/>;
              const bm=line.match(/^\*\*(.+)\*\*(.*)$/);
              if(bm)return<div key={i} style={{marginTop:i>0?12:0}}><span style={{color:T.rg2,fontWeight:600,fontFamily:fonts.serif,fontSize:15}}>{bm[1]}</span>{bm[2]&&<span style={{color:T.w6}}>{bm[2]}</span>}</div>;
              if(line.match(/^Notes/i))return<div key={i} style={{marginTop:14,borderTop:`1px solid ${T.w3}`,paddingTop:10,fontSize:11,color:T.w4,fontFamily:fonts.sans,fontStyle:"italic"}}>{line.replace(/^Notes[\s:]*/i,"")}</div>;
              return<div key={i} style={{color:T.w5,fontSize:11,fontFamily:fonts.sans}}>{line}</div>;
            })}
          </div>
        </Panel>}
      </div>
    );

    // ── GROCERY ──
    if(tab==="grocery") return (
      <div>
        <Eyebrow>Weekly shopping</Eyebrow>
        <SectionTitle>Smart grocery list —<br/><em style={{fontStyle:"italic",color:T.rg2}}>ALCAT-safe, wild-caught</em></SectionTitle>
        <Panel>
          <FieldLabel>Rotation days this week</FieldLabel>
          <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>
            {[1,2,3,4].map(d=>{const sel=groceryWeek.includes(d);return(
              <button key={d} onClick={()=>setGroceryWeek(p=>sel?p.filter(x=>x!==d):[...p,d].sort())} style={{background:sel?T.rgBg:T.w,border:`1px solid ${sel?T.rg:T.w3}`,borderRadius:8,padding:"7px 20px",cursor:"pointer",fontSize:12,fontFamily:fonts.sans,color:sel?T.rg2:T.w5,fontWeight:sel?500:400}}>Day {d}</button>
            );})}
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontFamily:fonts.mono,fontSize:9,color:T.w4,letterSpacing:"0.1em"}}>STORE</span>
              {["ICA","Matsmart","Willys","Coop"].map(s=>(
                <button key={s} onClick={()=>setGroceryStore(s)} style={{background:groceryStore===s?T.rgBg:T.w1,border:`1px solid ${groceryStore===s?T.rg:T.w3}`,borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:fonts.sans,color:groceryStore===s?T.rg2:T.w5}}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:18}}>
            {groceryWeek.map(d=>(
              <div key={d} style={{background:T.w,border:`1px solid ${T.w3}`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.rg2,letterSpacing:"0.14em",marginBottom:7,textTransform:"uppercase"}}>Day {d}</div>
                <div style={{fontSize:10,color:T.w5,fontFamily:fonts.sans,lineHeight:1.8,fontWeight:300}}>
                  <div>🐟 {ROT[d].protein.slice(0,2).join(", ")}</div>
                  <div>🥬 {ROT[d].veg.slice(0,3).join(", ")}</div>
                  <div>🌾 {ROT[d].grains.slice(0,2).join(", ")}</div>
                  <div>🍓 {ROT[d].fruit.slice(0,2).join(", ")}</div>
                </div>
              </div>
            ))}
          </div>
          <BtnPrimary onClick={buildGroceryList} disabled={groceryLoad||groceryWeek.length===0} loading={groceryLoad}>
            {groceryLoad?"Building your list…":`Generate list · Days ${groceryWeek.join(", ")}`}
          </BtnPrimary>
        </Panel>
        {groceryList&&<Panel>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.rg2,letterSpacing:"0.18em",textTransform:"uppercase"}}>Weekly ALCAT Grocery List</div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>{navigator.clipboard?.writeText(groceryList.replace(/\*\*/g,""));setGroceryExport(true);setTimeout(()=>setGroceryExport(false),2000);}} style={{background:groceryExport?T.ok+"18":T.w1,border:`1px solid ${groceryExport?T.ok:T.w3}`,borderRadius:5,padding:"4px 11px",cursor:"pointer",fontSize:10,fontFamily:fonts.mono,color:groceryExport?T.ok:T.w5,letterSpacing:"0.1em"}}>{groceryExport?"✓ COPIED":"COPY"}</button>
              <button onClick={()=>setGroceryList(null)} style={{background:"none",border:`1px solid ${T.w3}`,borderRadius:5,color:T.w4,padding:"4px 11px",cursor:"pointer",fontSize:10,fontFamily:fonts.mono,letterSpacing:"0.1em"}}>↺ NEW</button>
            </div>
          </div>
          <div style={{fontSize:12,lineHeight:2,color:T.w6,fontFamily:fonts.sans,fontWeight:300}}>
            {groceryList.split("\n").map((line,gi)=>{
              if(!line.trim())return<div key={gi} style={{height:5}}/>;
              const bm=line.match(/^\*\*(.+)\*\*/);
              if(bm)return<div key={gi} style={{marginTop:gi>0?14:0,marginBottom:6,display:"flex",alignItems:"center",gap:10}}><div style={{height:1,flex:1,background:T.w3}}/><span style={{fontFamily:fonts.mono,fontSize:8.5,letterSpacing:"0.18em",color:T.rg2,textTransform:"uppercase",fontWeight:600}}>{bm[1]}</span><div style={{height:1,flex:1,background:T.w3}}/></div>;
              if(line.startsWith("- ")||line.startsWith("• "))return<div key={gi} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:2}}><span style={{color:T.rg,flexShrink:0}}>·</span><span style={{color:T.w6,fontFamily:fonts.sans,fontSize:11,fontWeight:300}}>{line.slice(2)}</span></div>;
              return<div key={gi} style={{fontSize:11,color:T.w4,fontFamily:fonts.sans}}>{line}</div>;
            })}
          </div>
          <div style={{marginTop:20,borderTop:`1px solid ${T.w3}`,paddingTop:16}}>
            <FieldLabel>Order online</FieldLabel>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[{name:"ICA Online",url:"https://www.ica.se",note:"Hemleverans"},
                {name:"Matsmart",url:"https://www.matsmart.se",note:"Organic discounts"},
                {name:"Nordic Superfood",url:"https://nordicsuperfood.se",note:"Wild-caught & organic"},
                {name:"Willys",url:"https://www.willys.se",note:"Budget-friendly"},
                {name:"Rohkost.de",url:"https://www.rohkost.de",note:"Rare protocol items"},
              ].map(s=>(
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{background:T.w,border:`1px solid ${T.w3}`,borderRadius:8,padding:"9px 14px",textDecoration:"none",display:"flex",gap:8,alignItems:"center",boxShadow:`0 1px 3px rgba(100,80,60,0.05)`}}>
                  <span style={{fontSize:14}}>{s.icon}</span>
                  <div><div style={{fontSize:11,color:T.w7,fontWeight:500,fontFamily:fonts.sans}}>{s.name}</div><div style={{fontSize:9,color:T.w4,fontFamily:fonts.mono}}>{s.note}</div></div>
                </a>
              ))}
            </div>
          </div>
        </Panel>}
        {!groceryList&&<Panel>
          <FieldLabel>Shopping rules — always apply</FieldLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{icon:"🐟",rule:"Wild-caught fish only",detail:"Farm-raised contains inflammatory omega-6. Look for MSC certified."},
              {icon:"🫙",rule:"Oils: tallow, coconut, avocado only",detail:"No sunflower, canola, rapeseed, or vegetable oil."},
              {icon:"🥬",rule:"Organic for today's rotation",detail:"Buy organic for items on your plate today."},
              {icon:"⚠",rule:"Labels: no hidden yeast/sugars",detail:"Nutritional yeast, malt extract, dextrose — all Candida triggers."},
            ].map(({icon,rule,detail})=>(
              <div key={rule} style={{background:T.w,border:`1px solid ${T.w3}`,borderRadius:8,padding:"11px 13px",display:"flex",gap:9}}>
                <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
                <div><div style={{fontSize:11,color:T.rg2,fontWeight:500,fontFamily:fonts.sans,marginBottom:3}}>{rule}</div><div style={{fontSize:10,color:T.w4,fontFamily:fonts.sans,lineHeight:1.5,fontWeight:300}}>{detail}</div></div>
              </div>
            ))}
          </div>
        </Panel>}
      </div>
    );

    // ── FOOD CHECK ──
    if(tab==="lookup") return (
      <div>
        <Eyebrow>Food lookup</Eyebrow>
        <SectionTitle>Is it safe<br/><em style={{fontStyle:"italic",color:T.rg2}}>to eat?</em></SectionTitle>
        <RuledInput value={foodQ} onChange={e=>setFoodQ(e.target.value)} placeholder="Search — e.g. salmon, quinoa, avocado…" style={{marginBottom:20,fontSize:15}}/>
        {foodResults.map(({food,level})=>{
          const cols={severe:T.err,moderate:T.warn,mild:T.ok,candida:"#906080",whey:"#5080A8"},periods={severe:"9 months",moderate:"6 months",mild:"3 months",candida:"3mo (Candida)",whey:"6mo (Whey)"},c=cols[level];
          return <div key={food} style={{background:T.w,border:`1px solid ${c}30`,borderLeft:`3px solid ${c}`,borderRadius:8,padding:"11px 16px",display:"flex",justifyContent:"space-between",marginBottom:6,boxShadow:`0 1px 3px rgba(100,80,60,0.05)`}}>
            <div><div style={{fontSize:14,color:T.w7,fontFamily:fonts.sans}}>{food}</div><div style={{fontSize:10,color:T.w4,fontFamily:fonts.mono,textTransform:"capitalize",letterSpacing:"0.1em"}}>{level} reactor</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:11,color:c,fontWeight:500,fontFamily:fonts.mono,letterSpacing:"0.1em"}}>AVOID</div><div style={{fontSize:10,color:T.w4,fontFamily:fonts.mono}}>{periods[level]}</div></div>
          </div>;
        })}
        {foodQ.length>1&&foodResults.length===0&&<div style={{background:`${T.ok}0A`,border:`1px solid ${T.ok}30`,borderLeft:`3px solid ${T.ok}`,borderRadius:8,padding:"14px 18px"}}>
          <div style={{fontSize:14,color:T.w7,fontFamily:fonts.sans,marginBottom:4}}>✓ Not in reactive lists</div>
          <div style={{fontSize:11,color:T.ok,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.6}}>"{foodQ}" does not appear in your ALCAT reactive lists. If it is a whole food on your rotation day, it is safe to eat.</div>
        </div>}
      </div>
    );

    // ── CHAT ──
    if(tab==="chat") return (
      <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 200px)"}}>
        <Eyebrow>Clinical AI</Eyebrow>
        <div style={{fontFamily:fonts.serif,fontSize:28,fontWeight:400,color:T.w7,letterSpacing:"-0.01em",marginBottom:24}}>Ask <em style={{fontStyle:"italic",color:T.rg2}}>Mario</em></div>
        <div style={{flex:1,overflowY:"auto",marginBottom:14,display:"flex",flexDirection:"column",gap:10}}>
          {chatMsgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:10}}>
              {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:T.w1,border:`1px solid ${T.rg}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,marginTop:2,fontFamily:fonts.serif,color:T.rg2}}>M</div>}
              <div style={{maxWidth:"72%",background:m.role==="user"?T.rgBg:T.w,border:`1px solid ${m.role==="user"?T.rg+"40":T.w3}`,borderRadius:m.role==="user"?"12px 12px 4px 12px":"4px 12px 12px 12px",padding:"12px 16px",fontSize:12.5,lineHeight:1.8,color:T.w7,fontFamily:fonts.sans,fontWeight:300,boxShadow:`0 1px 3px rgba(100,80,60,0.05)`}}>{m.content}</div>
            </div>
          ))}
          {chatLoad&&<div style={{display:"flex",gap:5,paddingLeft:38}}>
            {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.rg,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
          </div>}
          <div ref={chatEnd}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <RuledInput value={chatIn} onChange={e=>setChatIn(e.target.value)} placeholder="Ask about your protocol, foods, symptoms, meal ideas…"
            style={{flex:1,borderBottom:`1.5px solid ${T.w3}`}}/>
          <button onClick={sendChat} disabled={chatLoad} style={{background:chatLoad?T.w1:T.rg,border:`1px solid ${chatLoad?T.w3:T.rg}`,color:chatLoad?T.w4:"#fff",borderRadius:9,padding:"0 22px",cursor:chatLoad?"not-allowed":"pointer",fontSize:12,fontFamily:fonts.sans,fontWeight:500,flexShrink:0}}>Send</button>
        </div>
      </div>
    );

    return null;
  };

  const sbItems = {
    monitor:[{label:"Monitor",state:"now"}],
    protocol:[{label:"Protocol",state:"now"}],
    rotation:[{label:"Rotation",state:"now"}],
    meals:[{label:"Meals",state:"now"}],
    generate:[{label:"Generate",state:"now"}],
    grocery:[{label:"Grocery",state:"now"}],
    lookup:[{label:"Food Check",state:"now"}],
    chat:[{label:"Ask Mario",state:"now"}],
  };

  const allSidebarItems = TABS.map(t=>({
    label:t.label,
    state: t.id===tab ? "now" : "later",
    divider: t.id==="grocery",
  }));

  if (showLanding) return (
    <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",fontFamily:fonts.sans,background:`linear-gradient(155deg,#FDF8F3 0%,#F8EFE8 25%,#F4EAF0 55%,#EEF0F8 85%,#F1EEF8 100%)`}}>
      {/* Liquid orbs */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",top:-220,left:-180,background:`radial-gradient(circle at 37% 31%, rgba(252,238,232,1) 0%, rgba(230,168,148,0.75) 15%, rgba(195,112,96,0.50) 29%, rgba(145,72,76,0.22) 46%, transparent 66%)`,mixBlendMode:"multiply",animation:"ob1 24s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:180,height:90,borderRadius:"50%",top:-80,left:10,background:"radial-gradient(ellipse, rgba(255,255,255,0.75) 0%, transparent 70%)",filter:"blur(16px)",mixBlendMode:"overlay",animation:"ob1 24s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:540,height:540,borderRadius:"50%",bottom:-150,right:-110,background:`radial-gradient(circle at 56% 58%, rgba(220,214,248,0.80) 0%, rgba(168,142,226,0.55) 18%, rgba(108,78,185,0.28) 36%, transparent 58%)`,mixBlendMode:"multiply",animation:"ob2 30s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",top:"32%",left:"46%",background:`radial-gradient(circle at 43% 40%, rgba(252,222,204,0.75) 0%, rgba(218,148,118,0.46) 22%, rgba(158,86,72,0.18) 44%, transparent 64%)`,mixBlendMode:"multiply",animation:"ob3 18s ease-in-out 4s infinite"}}/>
        <div style={{position:"absolute",width:400,height:2.5,borderRadius:1,top:"36%",left:"4%",transform:"rotate(-6deg)",background:"linear-gradient(90deg,transparent,rgba(205,165,148,0.50),rgba(255,248,244,0.42),rgba(205,165,148,0.50),transparent)",filter:"blur(1.5px)",mixBlendMode:"overlay",animation:"ca1 16s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:250,height:1.5,borderRadius:1,top:"68%",right:"6%",transform:"rotate(9deg)",background:"linear-gradient(90deg,transparent,rgba(168,150,220,0.45),rgba(255,255,255,0.35),transparent)",filter:"blur(1px)",mixBlendMode:"overlay",animation:"ca2 22s ease-in-out 6s infinite"}}/>
      </div>
      {/* Nav */}
      <div style={{position:"relative",zIndex:10,height:58,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 60px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:9,height:9,borderRadius:"50%",background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,boxShadow:`0 2px 8px rgba(160,100,85,0.40)`}}/>
          <span style={{fontFamily:fonts.serif,fontSize:18,fontWeight:400,color:T.w7}}>meet mario</span>
        </div>
        <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,border:`1px solid ${T.w3}`,borderRadius:3,padding:"3px 8px",letterSpacing:"0.14em"}}>PATENT PENDING · SE 2615203-3</span>
      </div>
      {/* Hero */}
      <div style={{position:"relative",zIndex:2,padding:"80px 72px 100px",maxWidth:820}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:12,marginBottom:44}}>
          <div style={{width:28,height:1,background:T.rg}}/>
          <span style={{fontFamily:fonts.mono,fontSize:9,color:T.rg2,letterSpacing:"0.24em",textTransform:"uppercase"}}>precision medicine · stockholm</span>
        </div>
        <h1 style={{fontFamily:fonts.serif,fontSize:72,fontWeight:400,lineHeight:0.95,letterSpacing:"-0.02em",color:T.w7,marginBottom:28}}>
          Your body has<br/>been speaking.<br/>
          <em style={{fontStyle:"italic",background:`linear-gradient(118deg,${T.rg2} 0%,${T.rg} 22%,#ECC8B8 36%,${T.rg} 50%,${T.rg2} 72%,${T.rg3} 88%,${T.rg} 100%)`,backgroundSize:"220% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 5.5s linear infinite"}}>We translate it.</em>
        </h1>
        <p style={{fontSize:16,fontWeight:300,color:T.w5,lineHeight:1.8,maxWidth:480,marginBottom:56,fontFamily:fonts.sans}}>
          A clinical intake built on proprietary immune reactivity data. Ten minutes. A 21-day anti-inflammatory protocol designed for your precise biology.
        </p>
        <div style={{display:"flex",gap:0,borderTop:`1px solid ${T.w3}`,borderBottom:`1px solid ${T.w3}`,marginBottom:52,width:"fit-content"}}>
          {[["21","Day Protocol"],["10′","Intake Time"],["7","Patent Claims"],["4","Diagnostic Pillars"]].map(([n,l],i,arr)=>(
            <div key={l} style={{padding:"18px 36px 16px 0",marginRight:36,borderRight:i<arr.length-1?`1px solid ${T.w3}`:"none"}}>
              <div style={{fontFamily:fonts.serif,fontSize:34,fontWeight:400,color:T.w7,letterSpacing:"-0.03em",lineHeight:1,marginBottom:5}}>{n}</div>
              <div style={{fontFamily:fonts.mono,fontSize:8.5,color:T.w4,letterSpacing:"0.18em",textTransform:"uppercase"}}>{l}</div>
            </div>
          ))}
        </div>
        <BtnPrimary onClick={()=>{ setShowLanding(false); setShowOnboarding(true); }}>Begin Assessment →</BtnPrimary>
        <p style={{marginTop:14,fontFamily:fonts.mono,fontSize:9,color:T.w4,letterSpacing:"0.14em"}}>~10 minutes · GDPR compliant · No credit card required</p>
      </div>
      <style>{`
        @keyframes ob1{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}25%{transform:translate(36px,-30px) scale(1.04) rotate(4deg)}50%{transform:translate(14px,38px) scale(.97) rotate(-3deg)}75%{transform:translate(-24px,12px) scale(1.02) rotate(6deg)}}
        @keyframes ob2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-28px,22px) scale(.95)}70%{transform:translate(20px,-16px) scale(1.03)}}
        @keyframes ob3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-18px,-24px) scale(1.07)}}
        @keyframes ca1{0%,100%{opacity:.38;transform:rotate(-6deg) scaleX(1)}50%{opacity:.08;transform:rotate(-3deg) scaleX(1.45)}}
        @keyframes ca2{0%,100%{opacity:.32;transform:rotate(9deg) scaleX(1)}50%{opacity:.06;transform:rotate(6deg) scaleX(.62)}}
        @keyframes shimmer{0%{background-position:0% center}100%{background-position:220% center}}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );

  if (showOnboarding) return (
    <Onboarding onComplete={(profile) => {
      setPatientProfile(profile);
      setShowOnboarding(false);
    }}/>
  );

  return (
    <div style={{minHeight:"100vh",background:T.w,color:T.w7,fontFamily:fonts.sans}}>
      {popup&&<SpikePopup/>}

      <Nav showProgress={false}/>

      {/* Tab nav — below main nav, hairline rule */}
      <div style={{
        background:T.w,borderBottom:`1px solid ${T.w3}`,
        padding:"0 44px",display:"flex",gap:0,
        position:"sticky",top:58,zIndex:99,
      }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:"none",border:"none",cursor:"pointer",
            padding:"14px 16px",fontSize:11.5,fontFamily:fonts.sans,
            color: tab===t.id ? T.rg2 : T.w4,
            borderBottom:`2px solid ${tab===t.id ? T.rg : "transparent"}`,
            fontWeight: tab===t.id ? 500 : 400,
            whiteSpace:"nowrap",transition:"all .15s",letterSpacing:"-0.01em",
          }}>
            {t.id==="monitor"&&monActive&&<span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:T.err,marginRight:6,verticalAlign:"middle",boxShadow:`0 0 6px ${T.err}`}}/>}
            {t.label}
            {t.id==="monitor"&&diary.length>0&&<span style={{marginLeft:6,fontFamily:fonts.mono,fontSize:8.5,color:T.w4}}>{diary.length}</span>}
          </button>
        ))}
        {/* Status badges — far right */}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {[["Candida","mild","#906080"],["Whey","moderate","#5080A8"]].map(([n,l,c])=>(
            <div key={n} style={{background:T.w1,border:`1px solid ${c}30`,borderRadius:4,padding:"3px 9px",display:"flex",gap:5,alignItems:"center"}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:c}}/>
              <span style={{fontSize:9,fontFamily:fonts.mono,color:T.w4,letterSpacing:"0.1em"}}>{n}</span>
              <span style={{fontSize:9,fontFamily:fonts.mono,color:c,fontWeight:600,letterSpacing:"0.1em"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{display:"flex"}}>
        <Sidebar items={allSidebarItems}/>
        <div style={{flex:1,padding:"44px 56px 80px",maxWidth:840}} onClick={()=>picker&&setPicker(null)}>
          {tabContent()}
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${T.w3}`,padding:"14px 44px",display:"flex",justifyContent:"space-between",alignItems:"center",background:T.w1}}>
        <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,letterSpacing:"0.12em"}}>
          <span style={{color:T.w6,fontWeight:500}}>meet mario</span> · MediBalans · Karlavägen 89, Stockholm
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.rg2,border:`1px solid ${T.rg}25`,borderRadius:3,padding:"2px 8px",letterSpacing:"0.12em",background:T.rgBg}}>PATENT PENDING · SE 2615203-3</span>
          <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,letterSpacing:"0.1em"}}>AI-driven clinical decision support · Global Constraint Rule framework</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
        *{box-sizing:border-box}
        input::placeholder{color:${T.w4};font-style:italic;font-weight:300}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.w3};border-radius:2px}
        button:hover{opacity:0.88}
        a{color:inherit}
      `}</style>
    </div>
  );
}
