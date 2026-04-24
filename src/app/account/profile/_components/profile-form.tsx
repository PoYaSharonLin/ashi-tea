"use client";

import * as React from "react";

import { updateProfile } from "~/app/actions/user";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";

interface ProfileFormProps {
  email: string;
  initialName: string;
  initialPhone: string;
}

export function ProfileForm({ email, initialName, initialPhone }: ProfileFormProps) {
  const [name, setName] = React.useState(initialName);
  const [phone, setPhone] = React.useState(initialPhone);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await updateProfile({ name, phone });

    if (result.ok) {
      setMessage({ type: "success", text: "個人資料已更新" });
    } else {
      setMessage({ type: "error", text: "更新失敗，請稍後再試" });
    }
    setSaving(false);
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="mb-5 text-xl font-semibold">個人資料</h2>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div className="space-y-1.5">
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="王小明"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            disabled
            className="bg-muted text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground">Email 無法修改</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">手機號碼</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912345678"
          />
        </div>

        {message && (
          <p
            className={
              message.type === "success"
                ? "text-sm text-green-600"
                : "text-sm text-destructive"
            }
          >
            {message.text}
          </p>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? "儲存中..." : "儲存變更"}
        </Button>
      </form>
    </div>
  );
}
