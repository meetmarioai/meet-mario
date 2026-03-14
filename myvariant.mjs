import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('./lib/clinicalSNPs.js', 'utf8');
const snpMatches = [...src.matchAll(/rsid:\s*'([^']+)'/g)].map(m => m[1]);
console.log(`Querying ${snpMatches.length} SNPs against MyVariant.info...`);

const FIELDS = 'dbsnp.rsid,clinvar.rcv.clinical_significance,clinvar.variant_id,dbnsfp.sift.pred,dbnsfp.sift.score,dbnsfp.polyphen2.hdiv.pred,dbnsfp.polyphen2.hdiv.score,cadd.phred';
const resp = await fetch('https://myvariant.info/v1/variant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `ids=${snpMatches.join(',')}&fields=${FIELDS}&assembly=hg19`,
});
if (!resp.ok) throw new Error(`MyVariant.info HTTP ${resp.status}: ${await resp.text()}`);
const results = await resp.json();
console.log(`Got ${results.length} results from MyVariant.info`);

const byRsid = {};
for (const r of results) {
  const rsid = r._id?.startsWith('rs') ? r._id : (Array.isArray(r.dbsnp) ? r.dbsnp[0]?.rsid : r.dbsnp?.rsid);
  if (rsid) byRsid[rsid] = r;
}
console.log(`Mapped ${Object.keys(byRsid).length} by rsID`);

function parseClinvar(r) {
  const cv = r.clinvar;
  if (!cv) return null;
  const varId = cv.variant_id ?? null;
  const rcv = cv.rcv;
  if (!rcv) return { significance: 'not_in_clinvar', variationId: null };
  const arr = Array.isArray(rcv) ? rcv : [rcv];
  const sigs = arr.map(x => (x.clinical_significance || '').toLowerCase().replace(/\s+/g, '_'));
  const order = ['pathogenic','likely_pathogenic','risk_factor','drug_response','uncertain_significance','conflicting_interpretations_of_pathogenicity','likely_benign','benign'];
  const sig = order.find(s => sigs.some(x => x.includes(s.split('_')[0]))) || sigs[0] || 'uncertain_significance';
  return { significance: sig, variationId: varId ? String(varId) : null };
}

function parseSift(r) {
  const d = r.dbnsfp?.sift;
  if (!d) return null;
  const preds = Array.isArray(d.pred) ? d.pred : [d.pred];
  const scores = (Array.isArray(d.score) ? d.score : [d.score]).filter(s => s != null);
  if (!preds.length || !scores.length) return null;
  const pred = preds.some(p => p === 'D') ? 'deleterious' : 'tolerated';
  const score = Math.min(...scores);
  return { prediction: pred, score: Math.round(score * 1000) / 1000 };
}

function parsePolyphen(r) {
  const d = r.dbnsfp?.polyphen2?.hdiv;
  if (!d) return null;
  const preds = Array.isArray(d.pred) ? d.pred : [d.pred];
  const scores = (Array.isArray(d.score) ? d.score : [d.score]).filter(s => s != null);
  if (!preds.length || !scores.length) return null;
  const pred = preds.some(p => p === 'D') ? 'probably_damaging' : preds.some(p => p === 'P') ? 'possibly_damaging' : 'benign';
  const score = Math.max(...scores);
  return { prediction: pred, score: Math.round(score * 1000) / 1000 };
}

function parseCadd(r) {
  const c = r.cadd?.phred;
  if (c == null) return null;
  const val = Array.isArray(c) ? Math.max(...c) : c;
  return { phred: Math.round(val * 10) / 10 };
}

const original65 = new Set([
  'rs1801133','rs1801131','rs1805087','rs1801394','rs234706','rs819147','rs1994044',
  'rs4680','rs6323','rs1800497','rs1042713','rs53576','rs4795541','rs3892097',
  'rs1695','rs1138272','rs762551','rs1799853','rs1057910','rs4244285','rs1800566',
  'rs1043618','rs2228570','rs1544410','rs7975232','rs11568820','rs602662','rs601338',
  'rs9939609','rs7501331','rs12934922','rs174537','rs174575','rs1801198','rs2274924',
  'rs4588','rs7041','rs10877012','rs4880','rs7069102','rs2802292','rs9536314',
  'rs429358','rs7412','rs7903146','rs1799945','rs1800562','rs328','rs708272',
  'rs1052700','rs2295080','rs1800795','rs1800629','rs2241880','rs1205','rs1801260',
  'rs4580704','rs5751876','rs1815739','rs8192678','rs6265','rs1799752','rs1805007',
  'rs1805008','rs12913832',
]);

const today = new Date().toISOString().split('T')[0];
const mismatches = [];
let updated = 0, notFound = 0;

let content = src;

// Update header
content = content.replace(
  /\/\/ ── MEET MARIO — CLINICAL SNP DATABASE[^\n]*\n\/\/ ~[^\n]*\n\/\/ Seed:[^\n]*\n\/\/ Sources:[^\n]*\n\/\/\n\/\/ CHROM:[^\n]*\n\/\/ POS:[^\n]*\n\/\/ REF\/ALT:[^\n]*\n\/\/ ─+/,
  `// clinicalSNPs.js — MediBalans Clinical SNP Database\n// Methodology: Mikael Huss / Codon Consulting annotation standard\n// Position-based GRCh37 matching (CHROM+POS+REF+ALT) for Danteomics VCFs\n// Sources: ClinVar (ACMG) + SIFT + PolyPhen-2 + CADD + SNPedia\n// Verified against MyVariant.info: ${today}\n// Total variants: 111\n// ─────────────────────────────────────────────────────────────────────────────`
);

for (const rsid of snpMatches) {
  const r = byRsid[rsid];
  if (!r) {
    notFound++;
    console.log(`  NOT FOUND in MyVariant: ${rsid}`);
    const re = new RegExp(`(rsid:\\s*'${rsid}'[\\s\\S]{0,2000}?source:\\s*)'[^']*'`);
    content = content.replace(re, "$1'SNPedia (unverified)'");
    continue;
  }

  const cv   = parseClinvar(r) || { significance: 'not_in_clinvar', variationId: null };
  const sift = parseSift(r);
  const pp   = parsePolyphen(r);
  const cadd = parseCadd(r);

  // Mismatch check
  const existingCvMatch = content.match(new RegExp(`rsid:\\s*'${rsid}'[\\s\\S]{0,2000}?clinvar:\\s*\\{\\s*significance:\\s*'([^']*)'`));
  if (existingCvMatch && cv.significance !== 'not_in_clinvar' && existingCvMatch[1] !== cv.significance) {
    mismatches.push(`${rsid}: was '${existingCvMatch[1]}', live='${cv.significance}'`);
  }

  const sourceParts = ['SNPedia'];
  if (cv.significance !== 'not_in_clinvar') sourceParts.push('ClinVar');
  if (sift) sourceParts.push('SIFT');
  if (pp) sourceParts.push('PolyPhen-2');
  if (cadd) sourceParts.push('CADD');

  const cvStr   = `{ significance: '${cv.significance}', variationId: ${cv.variationId ? `'${cv.variationId}'` : 'null'} }`;
  const siftStr = sift ? `{ prediction: '${sift.prediction}', score: ${sift.score} }` : 'null';
  const ppStr   = pp   ? `{ prediction: '${pp.prediction}', score: ${pp.score} }` : 'null';
  const caddStr = cadd ? `{ phred: ${cadd.phred} }` : 'null';
  const sourceStr = sourceParts.join(' + ');

  const snpStart = content.indexOf(`rsid: '${rsid}'`);
  if (snpStart === -1) { console.log(`WARN: cannot find ${rsid}`); continue; }
  let blockStart = snpStart;
  while (blockStart > 0 && content[blockStart] !== '{') blockStart--;
  let depth = 0, blockEnd = blockStart;
  for (let i = blockStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') { depth--; if (depth === 0) { blockEnd = i; break; } }
  }

  let block = content.slice(blockStart, blockEnd + 1);
  // Remove any previously injected annotation fields
  block = block.replace(/\n\s*clinvar_verified:\s*\{[^}]*\},?/g, '');
  block = block.replace(/\n\s*sift_verified:\s*(?:\{[^}]*\}|null),?/g, '');
  block = block.replace(/\n\s*polyphen_verified:\s*(?:\{[^}]*\}|null),?/g, '');
  block = block.replace(/\n\s*clinvar:\s*\{[^}]*\},?/g, '');
  block = block.replace(/\n\s*sift:\s*(?:\{[^}]*\}|null),?/g, '');
  block = block.replace(/\n\s*polyphen:\s*(?:\{[^}]*\}|null),?/g, '');
  block = block.replace(/\n\s*cadd:\s*(?:\{[^}]*\}|null),?/g, '');
  block = block.replace(/\n\s*verified_date:\s*(?:'[^']*'|null),?/g, '');
  block = block.replace(/source:\s*'[^']*'/, `source: '${sourceStr}'`);

  const inject = `\n    clinvar_verified: ${cvStr},\n    sift_verified: ${siftStr},\n    polyphen_verified: ${ppStr},\n    cadd: ${caddStr},\n    verified_date: '${today}',`;
  const lastBrace = block.lastIndexOf('}');
  block = block.slice(0, lastBrace) + inject + '\n  }';

  content = content.slice(0, blockStart) + block + content.slice(blockEnd + 1);
  updated++;
}

writeFileSync('./lib/clinicalSNPs.js', content, 'utf8');
console.log(`\nResult: updated=${updated}, not_found=${notFound}`);
if (mismatches.length) {
  console.log(`\nMISMATCHES (${mismatches.length}):`);
  mismatches.forEach(m => console.log('  ' + m));
} else {
  console.log('No ClinVar mismatches.');
}
