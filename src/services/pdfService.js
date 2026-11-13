/**
 * Service to request and download the official 1-page WHO Compliance PDF certificate from FastAPI backend.
 */
export async function downloadWhoCompliancePdf({
  blocks = [],
  isChainIntact = true,
  potencyPct = 100.0,
  remainingHours = 720.0,
  mktTemp = 4.25,
  battV = 3.01,
  projectedDays = 184,
  enclosureStatus = 'SEALED',
  nodeId = 'VAX-NODE-01',
  certId = null,
}) {
  const payload = {
    cert_id: certId,
    node_id: nodeId,
    blocks: blocks.map(b => ({
      block_index: b.block_index,
      timestamp: b.timestamp,
      temp_dht: b.temp_dht,
      temp_ntc: b.temp_ntc,
      prev_hash: b.prev_hash,
      signature_hash: b.signature_hash,
      is_broken: b.is_broken || false,
      tampered: b.tampered || false,
    })),
    is_chain_intact: isChainIntact,
    potency_pct: Number(potencyPct),
    remaining_hours: Number(remainingHours),
    mkt_temp: Number(mktTemp),
    batt_v: Number(battV),
    projected_days: Number(projectedDays),
    enclosure_status: enclosureStatus,
  };

  // Try relative proxy path first, fallback to explicit port 8000
  const endpoints = ['/api/generate-who-pdf', 'http://localhost:8000/api/generate-who-pdf'];

  let lastError = null;
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `WHO_ColdChain_Certificate_${nodeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      return { success: true };
    } catch (err) {
      lastError = err;
      console.warn(`Failed downloading PDF via ${url}, trying fallback if available...`, err);
    }
  }

  throw new Error(`Could not generate PDF from backend. Ensure FastAPI server is running on port 8000. Details: ${lastError?.message}`);
}
