import { computeBlockHash } from './crypto';

/**
 * Creates a valid chain of initial blocks with realistic vaccine cold-chain telemetry.
 * Incorporates DS1307 RTC timestamps, DHT22 core temperature, NTC probe, humidity,
 * and Microchip ATECC608A cryptographic signature hashes.
 */
export function generateInitialLedger() {
  const baseTime = Date.now() - 1000 * 60 * 18; // 18 minutes ago
  
  const rawData = [
    {
      block_index: 100,
      offsetSec: 0,
      temp_dht: 4.15,
      temp_ntc: 4.10,
      humidity: 48.2,
      batt_v: 3.02,
      power_mode: 'ULP_DEEP_SLEEP',
      enclosure: 'SEALED',
      device_id: 'VAX-NODE-01',
    },
    {
      block_index: 101,
      offsetSec: 150,
      temp_dht: 4.28,
      temp_ntc: 4.23,
      humidity: 48.5,
      batt_v: 3.01,
      power_mode: 'ULP_DEEP_SLEEP',
      enclosure: 'SEALED',
      device_id: 'VAX-NODE-01',
    },
    {
      block_index: 102,
      offsetSec: 300,
      temp_dht: 4.45,
      temp_ntc: 4.40,
      humidity: 49.1,
      batt_v: 3.01,
      power_mode: 'ACTIVE_BURST',
      enclosure: 'SEALED',
      device_id: 'VAX-NODE-01',
    },
    {
      block_index: 103,
      offsetSec: 450,
      temp_dht: 4.82,
      temp_ntc: 4.78,
      humidity: 49.8,
      batt_v: 3.00,
      power_mode: 'ULP_DEEP_SLEEP',
      enclosure: 'SEALED',
      device_id: 'VAX-NODE-01',
    },
    {
      block_index: 104,
      offsetSec: 600,
      temp_dht: 12.00, // Refrigeration excursion incident (e.g. lid opened during transfer)
      temp_ntc: 11.85,
      humidity: 62.4,
      batt_v: 2.99,
      power_mode: 'EMERGENCY_MQTT_BURST',
      enclosure: 'LID BREACHED',
      device_id: 'VAX-NODE-01',
    },
    {
      block_index: 105,
      offsetSec: 750,
      temp_dht: 9.15,
      temp_ntc: 9.08,
      humidity: 58.0,
      batt_v: 2.99,
      power_mode: 'ACTIVE_BURST',
      enclosure: 'SEALED',
      device_id: 'VAX-NODE-01',
    },
    {
      block_index: 106,
      offsetSec: 900,
      temp_dht: 5.30,
      temp_ntc: 5.25,
      humidity: 51.2,
      batt_v: 2.98,
      power_mode: 'ULP_DEEP_SLEEP',
      enclosure: 'SEALED',
      device_id: 'VAX-NODE-01',
    },
    {
      block_index: 107,
      offsetSec: 1050,
      temp_dht: 4.22,
      temp_ntc: 4.18,
      humidity: 48.0,
      batt_v: 2.98,
      power_mode: 'ULP_DEEP_SLEEP',
      enclosure: 'SEALED',
      device_id: 'VAX-NODE-01',
    }
  ];

  let prevHash = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'; // Genesis previous seed
  const blocks = [];

  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];
    const timestamp = new Date(baseTime + item.offsetSec * 1000).toISOString();
    
    const candidateBlock = {
      block_index: item.block_index,
      timestamp,
      temp_dht: item.temp_dht,
      temp_ntc: item.temp_ntc,
      humidity: item.humidity,
      batt_v: item.batt_v,
      power_mode: item.power_mode,
      enclosure: item.enclosure,
      device_id: item.device_id,
      prev_hash: prevHash,
    };

    const signature = computeBlockHash(candidateBlock);
    candidateBlock.signature_hash = signature;
    candidateBlock.tampered = false;
    candidateBlock.original_temp_dht = item.temp_dht;
    candidateBlock.original_temp_ntc = item.temp_ntc;

    blocks.push(candidateBlock);
    prevHash = signature;
  }

  return blocks;
}
