import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initDb() {
  if (!getApps().length) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    let credentialConfig;
    try {
      // Try normal JSON parse first
      credentialConfig = cert(JSON.parse(serviceAccountStr || '{}'));
    } catch (e) {
      // Fallback: extract manually or use hardcoded IDs
      const str = serviceAccountStr || process.env.FIREBASE_PRIVATE_KEY || '';
      
      const hardcodedKey = "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmOhLNbr9tZtYS\\nl/J7A1kqAUh3LIXIj4A+LA34TpvbvIBR9nGzOCNEVmDfq9qeW96zg7sOQ5egtEJi\\nZcYnjl6v4RkF+tEsLkzYdVDIeE3RHtNchEN+MTgwcRT08aF+cJWHPL0L49XQSD08\\nyEtgVTOg+t35fNQxSz6fwao/yasoocYxVVMg77rvPj9IJutPSp+FSVNGNhMay7qI\\nhzZx68KJxkS00wiE3ly08lZiZyC2bPm0aMpFEh59tDfFLRMyCH1AbJSIGHzc8PX+\\nNaEIPW5tsN5e1hSpBkqFPkbquFeQ/rRwp5aIRangn8Ojx02VwH7uunHVyP91G7Fq\\nprk1r8oxAgMBAAECggEAF4uUTDsKrHFrkziopRoFUDjcTd0lmhIRhTzyQaDI3Ogn\\nePSiiFNEU5K0qBoMnm++7MiU/2E9ogrGeG+YENROvzTwOXOcm1h3lBWR+sNnql5m\\na+1kLgTEw7/Qyx1K1cEWvRAyavO7voPtAKYSXzPSW1QNiyBOYikZVsG03tIvB1Mg\\nVhwZ+tybAisGt1j9Znn15yEEXyY2o8CyHmxjBF8GR1MExn8TPUqmMCHQHrDKfUyc\\n+LgQ11mHqLBtXGcPNLKbRu9V77FEYOLHaX6Hv+4gh3YkHhEDKmaE6HZnXCuruD/M\\nledsVMMcnV/K3tJ91Wd4WGC2ftNoxpLuVxZ13d1RUQKBgQDbSwjDDIgcc+ycFQIh\\nnZBYgto3LWaPHZDLWnWNklDCGMdfxKB2y/D+IT4qMc1hL1D4kbAYksbQMjH+oQaV\\nprtmgamLyxoVOOoZAdeT5Tu3uc0FS6gCDyvEr08vwgW5Ypzg3rpsX5B5FyybgCI5\\n0p0WdHe/hREeyLOLAPyJVcLetQKBgQDCDRaXcaCf+iVZ/9SZnTpO6/Xy61/qhcGR\\n9yYOAY1OMyGxr3pOF72z4SsbRWV05rCALNBP+olTsa4f98RTd8gVkm2hfPQk5kNc\\nDe+K2VLVWje/6zB3KfsxgTxIwTMFUoyadzQrczWbjYNdkSv+qyM/41QS4EnM0XqS\\n9NpWlZJvDQKBgQDaGhWb0HHrQoyYa/iTsF8o+PPJnxj6zB//cHesF1LEyNo6cJhb\\nrtiAGFX4p1GqD+JLZrKqrgiYduPsaQDghFSsTddv1s+ZPeLufjuHt50eTOgRFT8C\\n1U3lr6plSGZjDCYVLNBjCuTo2lieS+E+ey+LbsjOrazqXhjb7l48xRQsZQKBgFfW\\nFtDMVTm0v+2CGNjDy53nvveLRWphyyHoLmiOmUi5aloEpSbuJidjF+ELQ4Zr2Z7b\\nKhvZuwmQVtIPk+V4RbBGDKvZZKXDOOBVSoWeI5mBcdTEf7ag4RwidIg2M4MIP663\\noHy+dJiJsNnMmY54JseHfgnhTmaQt5wHi0FACP2NAoGAJjh/B/UByWKnYEMpyFD9\\nrOrZac+09QfHUiyJ9Q8/OeG+6HCJd5J1lc0wbMNVUU0ELg0p5MwFUWwJxUsvZeBl\\nh0BegBrOAJFTCKUnVs2ZpuubXSo1G2kw+0TfyXaYGqmPXY/2AkxJRo0T9lvH+ZvO\\ntjgg1v7OYpTyDYvTYRpzk2s=\\n-----END PRIVATE KEY-----\\n".replace(/\\n/g, '\n');
      
      credentialConfig = cert({
        projectId: 'hotel-f469e',
        clientEmail: 'firebase-adminsdk-fbsvc@hotel-f469e.iam.gserviceaccount.com',
        privateKey: hardcodedKey,
      });
    }
    initializeApp({ credential: credentialConfig });
  }
  return getFirestore();
}

export const db = new Proxy({} as any, {
  get: (target, prop) => {
    const firestore = initDb();
    return (firestore as any)[prop];
  }
});
