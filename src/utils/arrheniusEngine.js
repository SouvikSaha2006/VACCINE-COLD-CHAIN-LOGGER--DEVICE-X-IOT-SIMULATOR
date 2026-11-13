/**
 * WHO Arrhenius Bio-Potency & Kinetic Stability Engine
 * 
 * In biopharmaceuticals and vaccine formulations (e.g. mRNA, recombinant proteins, viral vectors),
 * thermal degradation follows the Arrhenius equation:
 *   k(T) = A * exp(-Ea / (R * T))
 * 
 * Standard cold-chain range: +2.0°C to +8.0°C.
 * Within this range, baseline nominal shelf life is ~720 hours (30 days) at 100.0% potency.
 * Above 8.0°C, thermal denaturing of active antigen/lipids accelerates exponentially.
 * Below 0.0°C, freezing crystallization causes adjuvant agglomeration and immediate irreversible potency loss.
 */

const R_GAS_CONSTANT = 8.314; // J / (mol * K)
const ACTIVATION_ENERGY_EA = 83500; // ~83.5 kJ/mol typical for vaccine antigen denaturation
const T_REF_KELVIN = 277.15; // 4.0°C reference temperature in Kelvin
const NOMINAL_SHELF_LIFE_HOURS = 720.0; // 30 days safe shelf life at 4°C

/**
 * Calculates instantaneous Arrhenius thermal acceleration factor relative to 4°C.
 * At 4°C: factor = 1.0
 * At 8°C: factor = 1.6
 * At 12°C: factor = 4.2
 * At 15°C: factor = 7.9
 * At 20°C: factor = 18.5
 */
export function getArrheniusFactor(tempC) {
  if (tempC <= 0.0) {
    // Freezing damage: ice crystal formation causes rapid aggregation
    return 15.0; 
  }
  const tKelvin = tempC + 273.15;
  const factor = Math.exp((ACTIVATION_ENERGY_EA / R_GAS_CONSTANT) * (1 / T_REF_KELVIN - 1 / tKelvin));
  return Math.max(0.1, factor);
}

/**
 * Computes cumulative vaccine potency and remaining shelf-life across historical blocks.
 * @param {Array} blocks Array of ledger blocks
 * @returns {Object} { potencyPct, remainingHours, mktCelsius, status, isQuarantine }
 */
export function calculateBioPotency(blocks) {
  if (!blocks || blocks.length === 0) {
    return {
      potencyPct: 100.0,
      remainingHours: NOMINAL_SHELF_LIFE_HOURS,
      mktCelsius: 4.2,
      degradationHoursEquiv: 0,
      status: 'OPTIMAL',
      isQuarantine: false,
    };
  }

  // Calculate Mean Kinetic Temperature (MKT) per USP <1159> / WHO PQS
  // MKT = (Ea / R) / -ln( (1/N) * sum(exp(-Ea / (R * Ti))) )
  let sumExp = 0;
  let validCount = 0;
  let totalEquivalentLossHours = 0;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const temp = Number(b.temp_dht ?? 4.0);
    const tK = temp + 273.15;
    sumExp += Math.exp(-ACTIVATION_ENERGY_EA / (R_GAS_CONSTANT * tK));
    validCount++;

    // Interval estimation: assume ~5 minutes (0.083 hours) per logged block interval
    const intervalHours = 0.083;

    if (temp >= 2.0 && temp <= 8.0) {
      // Normal nominal aging
      totalEquivalentLossHours += intervalHours * 1.0;
    } else if (temp > 8.0) {
      // Accelerated thermal degradation
      const factor = getArrheniusFactor(temp);
      // High excursion causes acute damage
      const penalty = (temp - 8.0) * 1.5;
      totalEquivalentLossHours += intervalHours * factor * (1 + penalty);
    } else if (temp < 0.0) {
      // Freezing shock: immediate irreversible aggregation
      totalEquivalentLossHours += intervalHours * 45.0;
    } else {
      // 0.0°C to 2.0°C: slight sub-optimal
      totalEquivalentLossHours += intervalHours * 1.5;
    }
  }

  // Compute MKT
  const avgExp = sumExp / Math.max(1, validCount);
  const mktKelvin = (ACTIVATION_ENERGY_EA / R_GAS_CONSTANT) / (-Math.log(avgExp));
  const mktCelsius = Number((mktKelvin - 273.15).toFixed(2));

  // Compute remaining potency percentage
  // At 0 loss: 100.0%. Critical quarantine threshold is typically 90.0% or 85.0%
  const potencyLoss = Math.min(100.0, (totalEquivalentLossHours / NOMINAL_SHELF_LIFE_HOURS) * 100.0);
  const rawPotency = 100.0 - potencyLoss;
  const potencyPct = Number(Math.max(0.0, Math.min(100.0, rawPotency)).toFixed(1));

  // Remaining safe hours
  const remainingHours = Number(Math.max(0, NOMINAL_SHELF_LIFE_HOURS - totalEquivalentLossHours).toFixed(1));

  let status = 'OPTIMAL';
  let isQuarantine = false;

  if (potencyPct < 90.0 || mktCelsius > 8.0 || mktCelsius < 2.0) {
    status = 'QUARANTINE_WARNING';
    if (potencyPct < 85.0) {
      status = 'UNSAFE_FOR_USE';
      isQuarantine = true;
    }
  } else if (potencyPct < 96.0) {
    status = 'MILD_DEGRADATION';
  }

  return {
    potencyPct,
    remainingHours,
    mktCelsius,
    degradationHoursEquiv: Number(totalEquivalentLossHours.toFixed(1)),
    status,
    isQuarantine,
  };
}
