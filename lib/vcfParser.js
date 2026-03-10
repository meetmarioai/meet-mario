// ── VCF PARSER — MEET MARIO ───────────────────────────────────────────────────
// MediBalans AB — Dr Mario Anthis PhD
//
// Parses genome.vcf.gz from Dante Genomics API
// Extracts clinically relevant SNPs and maps to wgsCorrections variant keys
//
// Usage:
//   const variantKeys = await parseVCF(vcfBuffer)
//   const corrections = buildWGSCorrections(variantKeys)
// ─────────────────────────────────────────────────────────────────────────────

// ── TARGET SNP MANIFEST ──────────────────────────────────────────────────────
// Only these positions are extracted from the VCF — everything else is ignored
// Format: rsid → { gene, variantKey_het, variantKey_hom, ref, alt, notes }

const TARGET_SNPS = {

  // ── ONE-CARBON METABOLISM ─────────────────────────────────────────────────
  'rs1801133': {
    gene: 'MTHFR', position: 'chr1:11796321',
    ref: 'G', alt: 'A',  // C677T in coding sequence
    het: 'MTHFR_C677T_het',
    hom: 'MTHFR_C677T_hom',
    notes: 'C677T — thermolabile variant, ~40% (het) or ~70% (hom) reduced activity',
  },
  'rs1801131': {
    gene: 'MTHFR', position: 'chr1:11794419',
    ref: 'T', alt: 'G',  // A1298C
    het: 'MTHFR_A1298C_het',
    hom: 'MTHFR_A1298C_hom',
    notes: 'A1298C — BH4 synthesis impairment',
  },
  'rs1805087': {
    gene: 'MTR', position: 'chr1:236894256',
    ref: 'A', alt: 'G',  // A2756G
    het: 'MTR_A2756G_het',
    hom: 'MTR_A2756G_hom',
    notes: 'Methionine synthase — reduced B12-dependent remethylation',
  },
  'rs1801394': {
    gene: 'MTRR', position: 'chr5:7870973',
    ref: 'A', alt: 'G',  // A66G
    het: 'MTRR_A66G_het',
    hom: 'MTRR_A66G_hom',
    notes: 'Methionine synthase reductase — impaired B12 recycling',
  },
  'rs3733890': {
    gene: 'BHMT', position: 'chr5:78456692',
    ref: 'G', alt: 'A',
    het: 'BHMT_het',
    hom: 'BHMT_hom',
    notes: 'Betaine-homocysteine methyltransferase',
  },
  'rs819147': {
    gene: 'AHCY', position: 'chr20:32633774',
    ref: 'G', alt: 'A',
    het: 'AHCY_het',
    hom: 'AHCY_hom',
    notes: 'S-adenosylhomocysteine hydrolase — SAH accumulation risk',
  },
  'rs1979277': {
    gene: 'SHMT1', position: 'chr17:18025906',
    ref: 'A', alt: 'G',
    het: 'SHMT1_het',
    hom: 'SHMT1_hom',
    notes: 'Serine hydroxymethyltransferase — P5P cofactor dependency',
  },

  // ── TRANSSULFURATION & ANTIOXIDANT ────────────────────────────────────────
  'rs234706': {
    gene: 'CBS', position: 'chr21:43053547',
    ref: 'G', alt: 'A',
    het: 'CBS_upregulation',
    hom: 'CBS_upregulation',
    notes: 'Cystathionine beta-synthase — sulfur flux upregulation',
  },
  'rs4880': {
    gene: 'SOD2', position: 'chr6:160113872',
    ref: 'T', alt: 'C',  // A16V — Val/Ala
    het: 'SOD2_het',
    hom: 'SOD2_hom',
    notes: 'Manganese superoxide dismutase — mitochondrial antioxidant',
  },
  'rs1050450': {
    gene: 'GPX1', position: 'chr3:49394735',
    ref: 'C', alt: 'T',  // Pro198Leu
    het: 'GPX1_het',
    hom: 'GPX1_hom',
    notes: 'Glutathione peroxidase — selenium-dependent',
  },

  // GST deletions are handled separately (copy number variants, not SNPs)
  // See parseCNVs() below

  // ── NEUROTRANSMITTER & HORMONE ────────────────────────────────────────────
  'rs4680': {
    gene: 'COMT', position: 'chr22:19963748',
    ref: 'G', alt: 'A',  // Val158Met
    // Val/Val = fast, Val/Met = het, Met/Met = slow
    het: 'COMT_slow_het',   // Val/Met
    hom: 'COMT_slow_hom',   // Met/Met (hom alt)
    hom_ref: 'COMT_fast_hom', // Val/Val (hom ref)
    notes: 'Catechol-O-methyltransferase — catecholamine clearance rate',
  },
  'rs6323': {
    gene: 'MAOA', position: 'chrX:43514867',
    ref: 'T', alt: 'G',
    het: 'MAOA_het',
    hom: 'MAOA_hom',
    notes: 'Monoamine oxidase A — serotonin/dopamine/norepinephrine degradation',
  },
  'rs1799836': {
    gene: 'MAOB', position: 'chrX:43590791',
    ref: 'G', alt: 'A',
    het: 'MAOB_het',
    hom: 'MAOB_hom',
    notes: 'Monoamine oxidase B — FAD-dependent',
  },
  'rs2228570': {
    gene: 'VDR', position: 'chr12:47844974',
    ref: 'C', alt: 'T',  // FokI
    het: 'VDR_het',
    hom: 'VDR_hom',
    notes: 'Vitamin D receptor — reduced sensitivity to D3',
  },
  'rs1800497': {
    gene: 'DRD2', position: 'chr11:113270828',
    ref: 'C', alt: 'T',  // Taq1A
    het: 'DRD2_het',
    hom: 'DRD2_hom',
    notes: 'Dopamine receptor D2 — reduced receptor density',
  },

  // ── DETOXIFICATION & DNA REPAIR ───────────────────────────────────────────
  'rs2228612': {
    gene: 'DNMT1', position: 'chr19:10244416',
    ref: 'G', alt: 'A',
    het: 'DNMT1_het',
    hom: 'DNMT1_hom',
    notes: 'DNA methyltransferase 1 — maintenance methylation',
  },
  'rs749131': {
    gene: 'DNMT3A', position: 'chr2:25313271',
    ref: 'G', alt: 'A',
    het: 'DNMT3A_het',
    hom: 'DNMT3A_hom',
    notes: 'DNA methyltransferase 3A — de novo methylation',
  },
  'rs45445694': {
    gene: 'TYMS', position: 'chr18:657471',
    ref: 'C', alt: 'T',
    het: 'TYMS_het',
    hom: 'TYMS_hom',
    notes: 'Thymidylate synthase — DNA synthesis, folate dependency',
  },
  'rs25487': {
    gene: 'XRCC1', position: 'chr19:44054823',
    ref: 'G', alt: 'A',  // Arg399Gln
    het: 'XRCC1_het',
    hom: 'XRCC1_hom',
    notes: 'X-ray repair cross-complementing — base excision repair',
  },
}

// Build rsid lookup index
const RSID_INDEX = Object.fromEntries(
  Object.entries(TARGET_SNPS).map(([rsid, data]) => [rsid, data])
)

// ── VCF LINE PARSER ───────────────────────────────────────────────────────────

/**
 * parseVCFLine
 * Parses a single VCF data line and returns variant call if it matches a target SNP
 */
function parseVCFLine(line) {
  if (line.startsWith('#')) return null

  const fields = line.split('\t')
  if (fields.length < 10) return null

  const [chrom, pos, id, ref, alt, qual, filter, info, format, ...samples] = fields

  // Match by rsid in ID field
  const rsids = id.split(';').filter(s => s.startsWith('rs'))

  for (const rsid of rsids) {
    const target = RSID_INDEX[rsid]
    if (!target) continue

    // Parse genotype from first sample
    const sampleData = samples[0]
    if (!sampleData) continue

    const formatFields = format.split(':')
    const sampleFields = sampleData.split(':')
    const gtIndex = formatFields.indexOf('GT')
    if (gtIndex === -1) continue

    const gt = sampleFields[gtIndex]
    if (!gt || gt === './.') continue

    // Normalise genotype separator
    const alleles = gt.replace('|', '/').split('/')
    const [a1, a2] = alleles.map(a => parseInt(a))

    // Determine zygosity
    let zygosity = null
    if (a1 === 0 && a2 === 0) {
      // Homozygous reference — wild type, use hom_ref if defined
      zygosity = 'ref'
    } else if ((a1 === 0 && a2 === 1) || (a1 === 1 && a2 === 0)) {
      zygosity = 'het'
    } else if (a1 === 1 && a2 === 1) {
      zygosity = 'hom'
    }

    return { rsid, gene: target.gene, zygosity, ref, alt, target }
  }

  return null
}

// ── MAIN PARSER ───────────────────────────────────────────────────────────────

/**
 * parseVCFText
 * Parses decompressed VCF text content
 * Returns array of variant keys for buildWGSCorrections()
 *
 * @param {string} vcfText - Full VCF file content as string
 * @returns {object} { variantKeys, rawVariants, missing }
 */
export function parseVCFText(vcfText) {
  const lines = vcfText.split('\n')
  const rawVariants = []
  const variantKeys = []
  const foundRsids = new Set()

  for (const line of lines) {
    const result = parseVCFLine(line)
    if (!result) continue

    const { rsid, gene, zygosity, target } = result
    foundRsids.add(rsid)

    let variantKey = null

    // Special case: COMT has ref homozygous meaning (fast COMT)
    if (rsid === 'rs4680') {
      if (zygosity === 'ref') variantKey = target.hom_ref  // Val/Val = fast
      else if (zygosity === 'het') variantKey = target.het  // Val/Met = slow het
      else if (zygosity === 'hom') variantKey = target.hom  // Met/Met = slow hom
    } else {
      if (zygosity === 'het') variantKey = target.het
      else if (zygosity === 'hom') variantKey = target.hom
      // ref = wild type = no correction needed
    }

    if (variantKey) {
      variantKeys.push(variantKey)
      rawVariants.push({ rsid, gene, zygosity, variantKey })
    }
  }

  // Check for compound MTHFR
  const hasMTHFR_C677T = foundRsids.has('rs1801133')
  const hasMTHFR_A1298C = foundRsids.has('rs1801131')
  if (hasMTHFR_C677T && hasMTHFR_A1298C) {
    const c677t = rawVariants.find(v => v.rsid === 'rs1801133')
    const a1298c = rawVariants.find(v => v.rsid === 'rs1801131')
    if (c677t?.zygosity === 'het' && a1298c?.zygosity === 'het') {
      // Compound heterozygous — replace individual het keys with compound key
      const removeKeys = ['MTHFR_C677T_het', 'MTHFR_A1298C_het']
      removeKeys.forEach(k => {
        const idx = variantKeys.indexOf(k)
        if (idx > -1) variantKeys.splice(idx, 1)
      })
      variantKeys.push('MTHFR_compound_het')
    }
  }

  // Report missing targets (SNPs not found in VCF — may indicate low coverage)
  const missing = Object.keys(TARGET_SNPS).filter(rsid => !foundRsids.has(rsid))

  return {
    variantKeys: [...new Set(variantKeys)], // deduplicate
    rawVariants,
    missing,
    coverage: {
      targeted: Object.keys(TARGET_SNPS).length,
      found: foundRsids.size,
      percent: Math.round((foundRsids.size / Object.keys(TARGET_SNPS).length) * 100),
    },
  }
}

// ── GST DELETION HANDLER ─────────────────────────────────────────────────────
// GST M1 and T1 are copy number variants (deletions), not standard SNPs
// These appear differently in VCF — handle separately

/**
 * parseGSTDeletions
 * Scans VCF for GST M1/T1 null (deletion) calls
 * These appear as copy number variant records or can be inferred from coverage
 *
 * @param {string} vcfText
 * @returns {string[]} additional variant keys
 */
export function parseGSTDeletions(vcfText) {
  const keys = []
  const lines = vcfText.split('\n')

  for (const line of lines) {
    if (line.startsWith('#')) continue
    const lower = line.toLowerCase()

    // GST M1 deletion signatures
    if (
      lower.includes('gstm1') ||
      lower.includes('gstt1') ||
      (lower.includes('gst') && (lower.includes('del') || lower.includes('cnv') || lower.includes('<del>')))
    ) {
      const fields = line.split('\t')
      const info = fields[7] || ''
      const gt = fields[9] || ''

      if (lower.includes('gstm1') || info.toLowerCase().includes('gstm1')) {
        if (gt.includes('1/1') || info.includes('CN=0')) {
          keys.push('GST_M1_null')
        }
      }
      if (lower.includes('gstt1') || info.toLowerCase().includes('gstt1')) {
        if (gt.includes('1/1') || info.includes('CN=0')) {
          keys.push('GST_T1_null')
        }
      }
    }

    // GST P1 rs1695 — standard SNP
    if (line.includes('rs1695')) {
      const fields = line.split('\t')
      const gt = (fields[9] || '').split(':')[0].replace('|', '/')
      if (gt === '0/1' || gt === '1/0') keys.push('GST_P1_het')
      if (gt === '1/1') keys.push('GST_P1_hom')
    }
  }

  return [...new Set(keys)]
}

// ── DANTE API INTEGRATION ─────────────────────────────────────────────────────

/**
 * fetchAndParseVCF
 * Fetches genome.vcf.gz from Dante API for a given sample,
 * decompresses it, and returns parsed variant keys
 *
 * @param {string} sampleId   - Dante sample ID (e.g. 'LB2BBI4870')
 * @param {string} projectId  - Dante project ID (from env)
 * @param {string} authToken  - Dante versa-auth token (from env)
 * @returns {object} parseVCFText() result + GST deletions merged
 */
export async function fetchAndParseVCF(sampleId, projectId, authToken) {
  const BASE_URL = 'https://versa.danteomics.com'
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `versa-auth=${authToken}`,
  }

  // Step 1: List datasets for this sample
  const datasetsRes = await fetch(`${BASE_URL}/versa.DatasetService/ListDatasetsForSample`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sampleId, projectId }),
  })
  const datasets = await datasetsRes.json()

  // Step 2: Find variant_calling dataset
  const vcDataset = datasets?.datasets?.find(d =>
    d.analysisType === 'variant_calling' || d.name?.toLowerCase().includes('variant')
  )
  if (!vcDataset) throw new Error(`No variant_calling dataset found for sample ${sampleId}`)

  // Step 3: List files in dataset
  const filesRes = await fetch(`${BASE_URL}/versa.DatasetService/ListDatasetFiles`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ datasetId: vcDataset.id, projectId }),
  })
  const filesData = await filesRes.json()
  const vcfFile = filesData?.files?.find(f => f.name === 'genome.vcf.gz')
  if (!vcfFile) throw new Error(`genome.vcf.gz not found for sample ${sampleId}`)

  // Step 4: Get presigned download URL
  const urlRes = await fetch(`${BASE_URL}/versa.DatasetService/GetDatasetFilePresignedUrl`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileId: vcfFile.id, datasetId: vcDataset.id, projectId }),
  })
  const { url } = await urlRes.json()
  if (!url) throw new Error('Failed to get presigned URL')

  // Step 5: Download VCF
  const vcfRes = await fetch(url)
  const vcfBuffer = await vcfRes.arrayBuffer()

  // Step 6: Decompress gzip
  const { DecompressionStream } = globalThis
  let vcfText

  if (DecompressionStream) {
    // Browser / Edge runtime
    const ds = new DecompressionStream('gzip')
    const stream = new Response(vcfBuffer).body.pipeThrough(ds)
    const reader = stream.getReader()
    const chunks = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    vcfText = new TextDecoder().decode(Buffer.concat(chunks))
  } else {
    // Node.js
    const zlib = await import('zlib')
    const { promisify } = await import('util')
    const gunzip = promisify(zlib.gunzip)
    vcfText = (await gunzip(Buffer.from(vcfBuffer))).toString('utf8')
  }

  // Step 7: Parse
  const parsed = parseVCFText(vcfText)
  const gstKeys = parseGSTDeletions(vcfText)

  return {
    sampleId,
    variantKeys: [...new Set([...parsed.variantKeys, ...gstKeys])],
    rawVariants: parsed.rawVariants,
    missing: parsed.missing,
    coverage: parsed.coverage,
  }
}

// ── EXAMPLE USAGE ─────────────────────────────────────────────────────────────
/*

// In a Next.js API route: /api/wgs/[sampleId].js
import { fetchAndParseVCF } from '@/lib/vcfParser'
import { buildWGSCorrections } from '@/lib/wgsCorrections'

export async function GET(req, { params }) {
  const { sampleId } = params

  const parsed = await fetchAndParseVCF(
    sampleId,
    process.env.DANTE_PROJECT_ID,
    process.env.DANTE_API_TOKEN,
  )

  const corrections = buildWGSCorrections(parsed.variantKeys)

  return Response.json({
    sampleId,
    variantKeys: parsed.variantKeys,
    coverage: parsed.coverage,
    corrections,
  })
}

*/
