"use client";

import { useRef, useState, useTransition } from "react";
import QRCode from "qrcode";
import { getQrisPayloadAction } from "@/lib/actions/iuran";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, QrCode, X } from "lucide-react";

export function BayarOnlineButton({
  tagihanId,
  jumlah,
}: {
  tagihanId: number;
  jumlah: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    qris: string;
    vaNumber: string | null;
    jumlah: string;
    simulasi: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const openModal = () => {
    setOpen(true);
    setError("");
    setLoading(true);
    startTransition(async () => {
      try {
        const res = await getQrisPayloadAction(tagihanId);
        setData(res);
        const url = await QRCode.toDataURL(res.qris, {
          width: 256,
          margin: 2,
          errorCorrectionLevel: "M",
        });
        setQrDataUrl(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat pembayaran");
      } finally {
        setLoading(false);
      }
    });
  };

  const copyVa = async () => {
    if (!data?.vaNumber) return;
    try {
      await navigator.clipboard.writeText(data.vaNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!open) {
    return (
      <Button variant="secondary" onClick={openModal}>
        <QrCode className="size-4" /> Bayar Online
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <Card className="w-full max-w-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">
            Bayar {formatRupiah(jumlah)}
          </p>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3 p-4">
          {loading || isPending ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Menyiapkan pembayaran...
            </p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-600">{error}</p>
          ) : data ? (
            <>
              {data.simulasi && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Mode simulasi: payment gateway (Xendit) belum dikonfigurasi.
                  Ini kode percobaan, bukan pembayaran sungguhan.
                </p>
              )}

              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  style={{ display: "none" }}
                />
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="QRIS" className="size-56 rounded-lg border border-slate-200" />
                )}
              </div>
              <p className="text-center text-xs text-slate-500">
                Scan QRIS dengan aplikasi bank/e-wallet mana pun.
              </p>

              {data.vaNumber && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Virtual Account</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="font-mono text-base font-bold text-slate-900">
                      {data.vaNumber}
                    </p>
                    <Button type="button" variant="secondary" onClick={copyVa}>
                      <Copy className="size-3.5" /> {copied ? "Tersalin" : "Salin"}
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400">
                Setelah transfer, status tagihan diperbarui otomatis. Simpan bukti
                pembayaran jika perlu konfirmasi ke bendahara.
              </p>
            </>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
