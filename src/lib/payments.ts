// Helper pembuatan payload QRIS (EMVCo) & nomor VA per rumah.
// Mode asli butuh akun merchant Xendit; tanpa key memakai mode simulasi.

export function crc16Ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function field(tag: string, value: string): string {
  const len = String(value.length).padStart(2, "0");
  return `${tag}${len}${value}`;
}

// Payload QRIS dinamis berisi nominal + nomor tagihan sebagai referensi.
export function buildQrisPayload(opts: {
  merchantName: string;
  city: string;
  amount: string; // rupiah tanpa koma
  reference: string; // mis. nomor tagihan
}): string {
  const merchantAccount =
    field("00", "ID.CO.QRIS.WWW") +
    field("01", "93600000103") +
    field("02", String(1000000000000000 + Math.floor(Number(opts.reference) || 1)).slice(-16));

  let payload = field("00", "01");
  payload += field("01", "12"); // dynamic (dengan nominal)
  payload += field("26", merchantAccount);
  payload += field("52", "4111");
  payload += field("53", "360");
  payload += field("54", opts.amount);
  payload += field("58", "ID");
  payload += field("59", opts.merchantName.slice(0, 25) || "GAPURA RT");
  payload += field("60", opts.city.slice(0, 15) || "RT");
  payload += field("62", field("01", opts.reference));

  const crc = crc16Ccitt(payload + field("63", ""));
  return payload + field("63", crc);
}

const XENDIT_BASE = "https://api.xendit.co";
const xenditKey = process.env.XENDIT_SECRET_KEY ?? "";

export function isXenditConfigured() {
  return Boolean(xenditKey);
}

function xenditFetch(path: string, body: Record<string, unknown>) {
  return fetch(`${XENDIT_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${xenditKey}:`).toString("base64")}`,
    },
    body: JSON.stringify(body),
  });
}

// Nomor VA unik per rumah. Dengan Xendit dibuatkan fixed VA,
// tanpa Xendit memakai format simulasi deterministik.
export async function generateVaForRumah(opts: {
  rumahId: number;
  rumahNomor: string;
  namaKepalaKeluarga: string;
}): Promise<string> {
  if (isXenditConfigured()) {
    try {
      const bankCode = process.env.XENDIT_VA_BANK ?? "MANDIRI";
      const res = await xenditFetch("/callback_virtual_accounts", {
        external_id: `gapura-rumah-${opts.rumahId}`,
        bank_code: bankCode,
        name: `IPL ${opts.rumahNomor} - ${opts.namaKepalaKeluarga}`.slice(0, 30),
        is_closed: false,
        is_single_use: false,
      });
      const data = (await res.json()) as { account_number?: string; error_code?: string };
      if (res.ok && data.account_number) return data.account_number;
    } catch {
      // fallback ke simulasi
    }
  }
  return `9880${String(opts.rumahId).padStart(10, "0")}`;
}
