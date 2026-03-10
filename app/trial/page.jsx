'use client'
// app/trial/page.jsx
// Meet Mario — 21-Day Universal Detox Diet
// Proprietary MediBalans clinical data — methodology not disclosed
// AI-generated step-by-step weekly menu
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

const WEEKLY_TEMPLATE = [
  { day: 'Mon', label: 'Grain day',   meal: 'Quinoa + roasted vegetables',          icon: '🌾', legume: false },
  { day: 'Tue', label: 'Soup day',    meal: 'Vegetable or fish soup + crispbread',  icon: '🍲', legume: false },
  { day: 'Wed', label: 'Poultry',     meal: 'Turkey or chicken + steamed vegetables', icon: '🍗', legume: false },
  { day: 'Thu', label: 'Legumes',     meal: 'Lentils or mung beans + vegetables',   icon: '🫘', legume: true },
  { day: 'Fri', label: 'Vegetarian',  meal: 'Baked vegetables + salad + olive oil', icon: '🫒', legume: false },
  { day: 'Sat', label: 'Fish',        meal: 'Tuna or halibut + cauliflower',        icon: '🐟', legume: false },
  { day: 'Sun', label: 'Red meat',    meal: 'Grass-fed lamb + root vegetables',     icon: '🍖', legume: false },
]

const TRIAL_FOODS = {
  protein: {
    label: 'Protein', icon: '🐟', color: '#E8F4F8', border: '#B8D9E8',
    items: [
      { name: 'Turkey',        note: 'Best poultry choice' },
      { name: 'Tuna (wild)',   note: 'Wild caught only' },
      { name: 'Pumpkin seed',  note: 'Plant protein + fat' },
      { name: 'Grouper',       note: 'Wild-caught white fish' },
      { name: 'Halibut',       note: 'Wild-caught' },
      { name: 'Sole',          note: 'Wild-caught flatfish' },
      { name: 'Lamb',          note: 'Grass-fed preferred' },
      { name: 'Chicken',       note: 'Pasture-raised preferred' },
    ]
  },
  legumes: {
    label: 'Legumes — Thursday only', icon: '🫘', color: '#F5F0FF', border: '#C8B8E8',
    warning: 'Legumes only after the 21-day detox window closes. Soak all dried legumes 12–24h, discard soaking water, cook thoroughly. Tinned: water + legume only.',
    items: [
      { name: 'Lentils',       note: 'Soak 8h, discard water, cook thoroughly' },
      { name: 'Mung beans',    note: 'Lowest reactivity legume — soak overnight' },
      { name: 'Pinto beans',   note: 'Soak 12h, pressure cook recommended' },
      { name: 'Navy beans',    note: 'Soak 12h, boil well' },
      { name: 'String beans',  note: 'Lowest reactivity — no soaking needed' },
    ]
  },
  vegetables: {
    label: 'Vegetables', icon: '🥦', color: '#F0F8F0', border: '#B8D9B8',
    items: [
      { name: 'Mushroom',      note: 'Any variety' },
      { name: 'Pumpkin',       note: 'Butternut, hokkaido' },
      { name: 'Shallots',      note: 'Milder than onion' },
      { name: 'Green beans',   note: 'Cooked only' },
      { name: 'Onion',         note: 'All varieties' },
      { name: 'Beetroot',      note: 'Roasted or steamed' },
      { name: 'Radish',        note: 'Raw or cooked' },
      { name: 'Green peas',    note: 'Fresh or frozen' },
      { name: 'Parsley',       note: 'Also as herb' },
      { name: 'Tomato',        note: 'Fresh only — no sauce' },
      { name: 'Turmeric',      note: 'Add to all cooking' },
      { name: 'Cucumber',      note: 'Raw or cooked' },
      { name: 'Spinach',       note: 'Cooked — reduces oxalates' },
      { name: 'Kale',          note: 'Lightly steamed' },
      { name: 'Cauliflower',   note: 'Roasted or steamed' },
    ]
  },
  fruit: {
    label: 'Fruit — Cycle 1 morning only', icon: '🍑', color: '#FEF6EC', border: '#F0D4A8',
    items: [
      { name: 'Peach',         note: 'Best morning choice' },
      { name: 'Lychee',        note: 'When in season' },
      { name: 'Pear',          note: 'Ripe, whole — no juice' },
      { name: 'Kiwi',          note: 'Rich in Vitamin C' },
      { name: 'Orange',        note: 'Whole only — no juice' },
      { name: 'Pomegranate',   note: 'Seeds whole, not pressed' },
      { name: 'Mango',         note: 'Ripe only' },
      { name: 'Papaya',        note: 'Contains digestive enzymes' },
      { name: 'Lemon',         note: 'On salads and in water' },
      { name: 'Mulberry',      note: 'Close to wild when fresh' },
    ]
  },
  grains: {
    label: 'Grains & Starches', icon: '🌾', color: '#F8F5F0', border: '#D9CCBC',
    items: [
      { name: 'Quinoa',        note: 'Rinse well before cooking' },
      { name: 'Millet',        note: 'Gluten-free' },
      { name: 'Buckwheat',     note: 'Gluten-free — crispbread form' },
      { name: 'Amaranth',      note: 'Gluten-free ancient grain' },
    ]
  },
  fats: {
    label: 'Fats & Oils', icon: '🫒', color: '#F5F5EC', border: '#D8D8B0',
    items: [
      { name: 'Tallow (beef)', note: 'COOKING ONLY — thermally stable' },
      { name: 'Duck fat',      note: 'COOKING ONLY — thermally stable' },
      { name: 'Olive oil',     note: 'COLD USE ONLY — never heated' },
      { name: 'Tahini (light)',note: 'Breakfast — pale sesame paste' },
    ]
  },
  avoid: {
    label: 'Avoid for 21 days', icon: '⛔', color: '#FEF2F2', border: '#FDBDBD',
    items: [
      { name: 'All dairy',          note: 'Milk, cheese, yoghurt, butter, ghee, whey' },
      { name: 'All gluten grains',  note: 'Wheat, rye, barley, spelt, kamut' },
      { name: 'Oats',               note: 'Cross-reactive with gluten — always excluded' },
      { name: 'All seed oils',      note: 'Canola, sunflower, vegetable, corn, soy, safflower' },
      { name: 'Sugar & sweeteners', note: 'All forms including agave, maple, coconut sugar' },
      { name: 'Yeast / fermented',  note: 'Bread, wine, beer, vinegar, soy sauce, miso' },
      { name: 'Alcohol',            note: 'All types' },
      { name: 'Legumes',            note: 'First 21 days — reintroduce Thursday from week 4' },
      { name: 'Coffee',             note: 'First 21 days — herbal tea only' },
      { name: 'Eggs',               note: 'Reintroduce after personal test' },
    ]
  }
}

const MENU_SYSTEM = `You are a clinical nutritionist at MediBalans AB, Stockholm.
Generate a precise 7-day detox meal plan. Follow these rules exactly:

FORBIDDEN: dairy, gluten, oats, seed oils, sugar, yeast, alcohol, eggs, legumes (except Thursday week 4+)
COOKING FATS: tallow or duck fat ONLY for cooking. Olive oil and tahini: cold use only, never heated.
CYCLE 1 morning: whole fruit only — peach, lychee, pear, kiwi, orange, pomegranate, mango, papaya, lemon, mulberry
CYCLE 2 midday+: CPF balanced — protein + vegetable + grain/starch at every main meal
SAFE PROTEINS: turkey, chicken, tuna (wild), halibut, sole, grouper, lamb (grass-fed)
SAFE VEGETABLES: mushroom, pumpkin, shallots, green beans, onion, beetroot, radish, green peas, parsley, tomato, turmeric, cucumber, spinach, kale, cauliflower
SAFE GRAINS: quinoa, millet, buckwheat, amaranth
THURSDAY: lentils or mung beans as primary protein (after 21-day detox window). Include full soaking + cooking steps.
DINNER: always mirrors lunch protein — same protein, different cooking method or vegetable combination.

Respond ONLY in valid JSON, no markdown, no explanation:
{
  "week": [
    {
      "day": "Monday",
      "icon": "🌾",
      "theme": "Grain day",
      "breakfast": { "name": "...", "ingredients": ["..."], "steps": ["..."] },
      "snack1": "whole fruit description",
      "lunch": { "name": "...", "ingredients": ["..."], "steps": ["..."] },
      "snack2": "raw vegetable description",
      "dinner": { "name": "...", "ingredients": ["..."], "steps": ["..."] },
      "evening": "vegetable description"
    }
  ]
}`

async function generateMenu(prefs) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: MENU_SYSTEM,
      messages: [{
        role: 'user',
        content: `Generate a full 7-day detox menu.
Cuisine style: ${prefs.cuisine}.
Cooking skill level: ${prefs.skill}.
Servings: ${prefs.servings} people.
Thursday: include detailed lentil or mung bean dish with soaking and cooking steps.
Make each day distinct — vary proteins, vegetables, and cooking methods.`
      }],
    }),
  })
  const data = await res.json()
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TrialDietPage() {
  const [expanded,       setExpanded]       = useState('protein')
  const [menu,           setMenu]           = useState(null)
  const [activeDay,      setActiveDay]      = useState(0)
  const [expandedMeal,   setExpandedMeal]   = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)
  const [prefs,          setPrefs]          = useState({ cuisine: 'Mediterranean', skill: 'intermediate', servings: 2 })

  async function handleGenerate() {
    setLoading(true); setError(null); setMenu(null); setExpandedMeal(null)
    try {
      const result = await generateMenu(prefs)
      setMenu(result.week || result)
      setActiveDay(0)
    } catch {
      setError('Menu generation failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Lato', sans-serif", padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '740px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#1a1a1a', marginBottom: '10px' }}>
            Your 21-Day Detox Diet
          </div>
          <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', maxWidth: '520px', margin: '0 auto' }}>
            Derived from MediBalans proprietary clinical data.
            No individual test needed — this is your biological reset.
          </p>
        </div>

        {/* Daily rhythm */}
        <Card title="Daily rhythm">
          {[
            { time: '06:00–07:30', label: 'Breakfast',    detail: 'Whole fruit + 1 tsp tahini + buckwheat crispbread', c: 1 },
            { time: '09:00–09:30', label: 'Mid-morning',  detail: 'Whole fruit only. Never juice. Never blended.', c: 1 },
            { time: '12:00–13:00', label: 'Lunch',        detail: 'Protein + vegetables + grain + cold olive oil', c: 2 },
            { time: '15:00–15:30', label: 'Snack',        detail: 'Raw vegetables — cucumber, radish, green beans', c: 2 },
            { time: '18:00–19:00', label: 'Dinner',       detail: 'Mirror of lunch — same protein, different preparation', c: 2 },
            { time: '21:00–21:30', label: 'Evening',      detail: 'Safe raw vegetables only. Closes the nutrition window.', c: 2 },
          ].map((s, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: '14px', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F0EA' : 'none' }}>
              <div style={{ minWidth: '90px', fontSize: '12px', color: '#aaa', paddingTop: '3px' }}>{s.time}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>{s.label}</span>
                <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '50px', background: s.c === 1 ? '#FEF6EC' : '#EFF5FF', color: s.c === 1 ? '#B5700F' : '#4A6FA5' }}>
                  Cycle {s.c}
                </span>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '3px' }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Weekly template */}
        <Card title="Weekly rotation">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {WEEKLY_TEMPLATE.map((d, i) => (
              <div key={i} style={{
                background: d.legume ? '#F5F0FF' : '#FAF7F2',
                border: `1.5px solid ${d.legume ? '#C8B8E8' : '#E5DDD3'}`,
                borderRadius: '10px', padding: '12px 14px',
                flex: '1 1 150px', minWidth: '130px',
              }}>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{d.icon}</div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: d.legume ? '#7B5EA7' : '#C9956C' }}>{d.day}</div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a1a', marginBottom: '4px' }}>{d.label}</div>
                <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.5' }}>{d.meal}</div>
                {d.legume && <div style={{ fontSize: '11px', color: '#7B5EA7', marginTop: '6px', fontStyle: 'italic' }}>After week 3 · soak overnight</div>}
              </div>
            ))}
          </div>
        </Card>

        {/* ── AI Menu Generator ─────────────────────────────────────────────── */}
        <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#fff', marginBottom: '6px' }}>
            Generate this week's menu
          </div>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
            Full 7-day plan with ingredients and step-by-step recipes — all within protocol rules.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {[
              { key: 'cuisine', label: 'Style', opts: ['Mediterranean', 'Nordic', 'Middle Eastern', 'Asian', 'French'] },
              { key: 'skill',   label: 'Level', opts: ['beginner', 'intermediate', 'advanced'] },
              { key: 'servings',label: 'Serves', opts: [1, 2, 4] },
            ].map(({ key, opts }) => (
              <select key={key}
                value={prefs[key]}
                onChange={e => setPrefs(p => ({ ...p, [key]: key === 'servings' ? Number(e.target.value) : e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #444', background: '#2a2a2a', color: '#fff', fontSize: '14px', cursor: 'pointer' }}
              >
                {opts.map(o => <option key={o} value={o}>{String(o)}{key === 'servings' ? ` ${Number(o) === 1 ? 'person' : 'people'}` : ''}</option>)}
              </select>
            ))}
          </div>
          <button onClick={handleGenerate} disabled={loading} style={{
            width: '100%', padding: '15px', borderRadius: '10px',
            background: loading ? '#444' : '#C9956C', color: '#fff',
            border: 'none', fontSize: '16px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Lato', sans-serif",
          }}>
            {loading ? '✦  Generating your menu…' : '✦  Generate 7-day menu with recipes'}
          </button>
          {error && <div style={{ color: '#ff8888', fontSize: '13px', marginTop: '10px' }}>{error}</div>}
        </div>

        {/* ── Generated Menu ────────────────────────────────────────────────── */}
        {menu && (
          <div style={{ marginBottom: '24px' }}>
            {/* Day pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {menu.map((day, i) => (
                <button key={i} onClick={() => { setActiveDay(i); setExpandedMeal(null) }} style={{
                  padding: '8px 16px', borderRadius: '50px', border: '1.5px solid',
                  borderColor: activeDay === i ? '#C9956C' : '#E5DDD3',
                  background: activeDay === i ? '#C9956C' : '#fff',
                  color: activeDay === i ? '#fff' : '#666',
                  fontSize: '13px', fontWeight: activeDay === i ? '700' : '400', cursor: 'pointer',
                }}>
                  {day.icon} {(day.day || `Day ${i+1}`).slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Day detail */}
            {(() => {
              const day = menu[activeDay]; if (!day) return null
              const meals = [
                { key: 'breakfast', label: '🌅 Breakfast', simple: false },
                { key: 'snack1',    label: '🍑 Mid-morning', simple: true },
                { key: 'lunch',     label: '☀️ Lunch',       simple: false },
                { key: 'snack2',    label: '🥒 Snack',       simple: true },
                { key: 'dinner',    label: '🌙 Dinner',      simple: false },
                { key: 'evening',   label: '🌿 Evening',     simple: true },
              ]
              return (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #E5DDD3', overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #F5F0EA' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#1a1a1a' }}>
                      {day.icon} {day.day} — {day.theme}
                    </div>
                  </div>
                  {meals.map(({ key, label, simple }) => {
                    const meal = day[key]; if (!meal) return null
                    const isOpen = expandedMeal === key
                    const isString = typeof meal === 'string'
                    if (simple || isString) return (
                      <div key={key} style={{ display: 'flex', gap: '12px', padding: '12px 24px', borderBottom: '1px solid #F5F0EA', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#999', minWidth: '120px' }}>{label}</span>
                        <span style={{ fontSize: '14px', color: '#555' }}>{isString ? meal : meal.name}</span>
                      </div>
                    )
                    return (
                      <div key={key} style={{ borderBottom: '1px solid #F5F0EA' }}>
                        <button onClick={() => setExpandedMeal(isOpen ? null : key)} style={{
                          width: '100%', padding: '14px 24px', background: 'none', border: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '12px', color: '#aaa' }}>{label}</div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '2px' }}>{meal.name}</div>
                          </div>
                          <span style={{
                            background: isOpen ? '#C9956C' : 'transparent', color: isOpen ? '#fff' : '#C9956C',
                            border: '1.5px solid #C9956C', borderRadius: '50px', padding: '5px 14px', fontSize: '12px', fontWeight: '600',
                          }}>
                            {isOpen ? '▲ Hide' : '▼ Recipe'}
                          </span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: '0 24px 20px' }}>
                            {/* Ingredients */}
                            {meal.ingredients?.length > 0 && <>
                              <div style={{ fontSize: '11px', fontWeight: '700', color: '#C9956C', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Ingredients</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                {meal.ingredients.map((ing, ii) => (
                                  <span key={ii} style={{ background: '#FAF7F2', border: '1px solid #E5DDD3', borderRadius: '50px', padding: '5px 12px', fontSize: '13px', color: '#555' }}>
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </>}
                            {/* Steps */}
                            {meal.steps?.length > 0 && <>
                              <div style={{ fontSize: '11px', fontWeight: '700', color: '#C9956C', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Method</div>
                              {meal.steps.map((step, si) => (
                                <div key={si} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#C9956C', color: '#fff', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {si + 1}
                                  </div>
                                  <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.65', paddingTop: '3px' }}>{step}</div>
                                </div>
                              ))}
                            </>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}

        {/* Food categories */}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', margin: '8px 0 6px', color: '#1a1a1a' }}>Protocol food list</div>
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '14px' }}>Selected from MediBalans proprietary clinical database.</div>

        {Object.entries(TRIAL_FOODS).map(([key, cat]) => (
          <div key={key} style={{ marginBottom: '8px' }}>
            <button onClick={() => setExpanded(expanded === key ? null : key)} style={{
              width: '100%', background: cat.color, border: `1.5px solid ${cat.border}`,
              borderRadius: expanded === key ? '12px 12px 0 0' : '12px',
              padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', fontFamily: "'Lato', sans-serif",
            }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>{cat.icon} {cat.label}</span>
              <span style={{ color: '#aaa', fontSize: '13px' }}>{cat.items.length} {expanded === key ? '▲' : '▼'}</span>
            </button>
            {expanded === key && (
              <div style={{ background: '#fff', border: `1.5px solid ${cat.border}`, borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
                {cat.warning && (
                  <div style={{ padding: '12px 18px', background: '#F5F0FF', borderBottom: '1px solid #C8B8E8', fontSize: '13px', color: '#7B5EA7', lineHeight: '1.6' }}>
                    ⚠️ {cat.warning}
                  </div>
                )}
                {cat.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '11px 18px', borderBottom: i < cat.items.length - 1 ? '1px solid #F5F0EA' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#1a1a1a' }}>{item.name}</span>
                      <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>{item.note}</span>
                    </div>
                    {key === 'avoid' && <span style={{ fontSize: '14px' }}>⛔</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* CTA */}
        <div style={{ marginTop: '40px', background: '#1a1a1a', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#fff', marginBottom: '10px' }}>Get your personal food list</div>
          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            This protocol removes the most common immune triggers identified in MediBalans clinical practice.
            Your personal test identifies what's specific to you — and unlocks your fully personalised protocol.
          </p>
          <button onClick={() => window.open('https://medibalans.com', '_blank')} style={{
            background: '#C9956C', color: '#fff', border: 'none', borderRadius: '10px',
            padding: '14px 32px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Lato', sans-serif",
          }}>
            Book your test at MediBalans →
          </button>
          <div style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>Or order a home test kit — results in 2 weeks</div>
        </div>

      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid #E5DDD3' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', marginBottom: '16px', color: '#1a1a1a' }}>{title}</div>
      {children}
    </div>
  )
}
