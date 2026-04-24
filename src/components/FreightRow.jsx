import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";

export default function FreightRow({ row, onUpdate, onRemove, canRemove }) {
  const fields = [
    { key: "qty",    label: "Qty",          min: 0 },
    { key: "length", label: "Length (in)",  min: 1 },
    { key: "width",  label: "Width (in)",   min: 1 },
    { key: "height", label: "Height (in)",  min: 1 },
    { key: "weight", label: "Weight (lbs)", min: 0, placeholder: "optional" },
  ];
  return (
    <div className="freight-row">
      {fields.map(({ key, label, min, placeholder }) => (
        <div key={key} className="space-y-2">
          <Label>{label}</Label>
          <Input
            type="number" min={min} placeholder={placeholder}
            value={row[key]}
            onChange={e => onUpdate(row.id, key, e.target.value)}
          />
        </div>
      ))}
      <div className="space-y-2">
        <Label>Stackable</Label>
        <div className="flex h-10 items-center rounded-xl border px-3">
          <Switch
            checked={row.stackable}
            onCheckedChange={checked => onUpdate(row.id, "stackable", checked)}
          />
          <span className="ml-3 text-sm text-slate-700">{row.stackable ? "Yes" : "No"}</span>
        </div>
      </div>
      <div className="flex items-end">
        <Button variant="outline" size="icon" className="w-full rounded-xl"
          onClick={() => onRemove(row.id)} disabled={!canRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
