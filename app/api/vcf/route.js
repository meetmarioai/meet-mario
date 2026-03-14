// app/api/vcf/route.js
// Server-side VCF position matching — clinicalSNPs never reaches the client

import { POS_INDEX, CLINICAL_RSID_SET, RSID_INDEX } from '../lib/clinicalSNPs';

export const maxDuration = 60;

function extractGT(cols, ref, alt) {
  if (cols.length < 10) return { genotype: '?/?', status: 'carrier' };
  const fmt = (cols[8] || '').split(':');
  const smp = (cols[9] || '').split(':');
  const gtIdx = fmt.indexOf('GT');
  const gtRaw = (gtIdx >= 0 ? smp[gtIdx] : smp[0]) || './.';
  const alleles = gtRaw.split(/[/|]/).map(a => a.trim());
  const isRef = a => a === '0';
  const isAlt = a => a !== '0' && a !== '.';
  const allRef = alleles.every(isRef);
  const allAlt = alleles.length > 0 && alleles.every(isAlt);
  const status = allRef ? 'normal' : allAlt ? 'risk' : 'carrier';
  const genotype = alleles.map(a => isRef(a) ? ref : isAlt(a) ? alt : '?').join('');
  return { genotype, status };
}

export async function POST(req) {
  try {
    const { lines } = await req.json();
    if (!Array.isArray(lines)) return Response.json({ error: 'lines array required' }, { status: 400 });

    const posMatchedSnps = [];
    const rsidLines = [];
    let lastHeaderLine = '';
    let totalDataLines = 0;

    for (const line of lines) {
      if (!line) continue;
      if (line.startsWith('#')) { lastHeaderLine = line; continue; }
      totalDataLines++;
      const cols = line.split('\t');
      const chrom = (cols[0] || '').replace(/^chr/i, '');
      const pos   = cols[1] || '';
      const id    = cols[2] || '.';
      const ref   = cols[3] || '';
      const alt   = (cols[4] || '').split(',')[0];
      const posKey = `${chrom}:${pos}:${ref}:${alt}`;
      const annotation = POS_INDEX[posKey];
      if (annotation) {
        const { genotype, status } = extractGT(cols, ref, alt);
        if (status !== 'normal') {
          const impact = status === 'risk'
            ? (annotation.hom_interpretation || annotation.functional_impact || '')
            : (annotation.het_interpretation || annotation.functional_impact || '');
          posMatchedSnps.push({
            gene: annotation.gene,
            rsid: annotation.rsid,
            genotype,
            status,
            domain: annotation.domain,
            pathway: annotation.pathway,
            impact,
          });
        }
        continue;
      }
      const rsMatch = [
        ...(id.match(/rs\d+/gi) || []),
        ...(line.match(/(?:^|[;\t])RS=(\d+)/g) || []).map(m => 'rs' + m.replace(/.*RS=/i, '')),
      ];
      if (rsMatch.some(rs => CLINICAL_RSID_SET.has(rs.toLowerCase()))) rsidLines.push(line);
    }

    const totalChecked = Object.keys(POS_INDEX).length;
    const deduped = [...new Map(posMatchedSnps.map(s => [s.rsid, s])).values()];

    if (deduped.length > 0) {
      console.log(`[/api/vcf] ${totalDataLines} lines → ${deduped.length} pos-matched SNPs`);
      return Response.json({ genomicSnps: deduped, totalChecked });
    }

    if (rsidLines.length === 0) {
      console.log(`[/api/vcf] ${totalDataLines} lines → 0 matches`);
      return Response.json({ genomicSnps: [], totalChecked, noMatch: true });
    }

    // rsID fallback — annotate via Claude, server-side only
    const filteredContent = [lastHeaderLine, ...rsidLines].filter(Boolean).join('\n');
    console.log(`[/api/vcf] rsID fallback — ${rsidLines.length} candidate lines → Claude`);

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: 'You are a clinical genomics analyst. Return only valid JSON.',
        messages: [{ role: 'user', content: `${rsidLines.length} VCF lines matched clinical rsIDs. Annotate each.\n\nReturn: {"snps":[{"rsid":"rs...","gene":"GENE","genotype":"CT","status":"risk|carrier","impact":"...","domain":"..."}]}\n\nVCF data:\n${filteredContent.slice(0, 80000)}` }],
      }),
    });

    if (!claudeRes.ok) {
      console.error('[/api/vcf] Claude error:', claudeRes.status);
      return Response.json({ genomicSnps: [], totalChecked });
    }

    const claudeData = await claudeRes.json();
    const claudeText = (claudeData.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    let vcfJson = { snps: [] };
    try { vcfJson = JSON.parse(claudeText.replace(/```json|```/g, '').trim()); } catch {}

    // Enrich Claude-returned SNPs with RSID_INDEX metadata
    const enriched = (vcfJson.snps || []).map(s => {
      const a = RSID_INDEX[s.rsid];
      if (!a) return s;
      return {
        gene: a.gene || s.gene,
        rsid: s.rsid,
        genotype: s.genotype || '?/?',
        status: s.status,
        domain: a.domain || s.domain,
        pathway: a.pathway,
        impact: s.impact,
      };
    });

    console.log(`[/api/vcf] rsID fallback → ${enriched.length} SNPs from Claude`);
    return Response.json({ genomicSnps: enriched, totalChecked });
  } catch (err) {
    console.error('[/api/vcf]', err.message);
    return Response.json({ error: err.message, genomicSnps: [], totalChecked: 0 }, { status: 500 });
  }
}
