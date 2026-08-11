"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { CameraActionState } from "@/lib/actions/camera";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Tambah Kamera"}
    </Button>
  );
}

export function CameraForm({
  action,
}: {
  action: (prev: CameraActionState, form: FormData) => Promise<CameraActionState>;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nama">Nama Kamera *</Label>
          <Input id="nama" name="nama" placeholder="Pos Satpam Depan" required />
        </div>
        <div>
          <Label htmlFor="lokasi">Lokasi</Label>
          <Input id="lokasi" name="lokasi" placeholder="Gerbang utama" />
        </div>
      </div>
      <div>
        <Label htmlFor="rtspUrl">URL RTSP *</Label>
        <Input
          id="rtspUrl"
          name="rtspUrl"
          placeholder="rtsp://user:pass@192.168.1.10:554/stream1"
          className="font-mono text-xs"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="onvifHost">Host ONVIF (untuk PTZ)</Label>
          <Input id="onvifHost" name="onvifHost" placeholder="192.168.1.10" />
        </div>
        <div>
          <Label htmlFor="onvifPort">Port ONVIF</Label>
          <Input
            id="onvifPort"
            name="onvifPort"
            inputMode="numeric"
            defaultValue="8000"
          />
        </div>
        <div className="sm:col-span-1">
          <Label htmlFor="onvifUsername">User ONVIF</Label>
          <Input id="onvifUsername" name="onvifUsername" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="onvifPassword">Password ONVIF</Label>
          <Input id="onvifPassword" name="onvifPassword" type="password" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Submit />
    </form>
  );
}
