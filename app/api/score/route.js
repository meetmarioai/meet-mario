// app/api/score/route.js
// BES scoring — formula and thresholds never reach the client

export async function POST(req) {
  try {
    const { symptoms, yearsInCurrentCountry, hormonalStatus, medications, conditions } = await req.json();

    let score = 20;
    if (symptoms?.length >= 5) score += 25;
    else if (symptoms?.length >= 3) score += 15;
    else if (symptoms?.length >= 1) score += 8;
    if (yearsInCurrentCountry && +yearsInCurrentCountry < 5) score += 12;
    if (hormonalStatus && hormonalStatus !== 'Not applicable') score += 8;
    if (medications?.trim()) score += 10;
    if (conditions?.trim()) score += 10;
    score = Math.min(score, 92);

    const band = score < 35 ? 'Low' : score < 60 ? 'Moderate' : 'Elevated';
    const interpretation = score < 35
      ? 'Your biological signals suggest a relatively low entropic burden. Your system has strong repair capacity and is likely to respond quickly to the protocol.'
      : score < 60
      ? 'Your biological signals suggest a moderate entropic burden accumulated over time. Your system has good repair capacity but will benefit from the full 90-day protocol.'
      : 'Your biological signals suggest an elevated entropic burden with deeper systemic involvement. Your system will respond — but in layers. The full multi-stage protocol is what your biology needs.';

    return Response.json({ score, band, interpretation });
  } catch (err) {
    console.error('[/api/score]', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
