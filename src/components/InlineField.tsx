"use client";

import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

const labelClass = "text-xs uppercase tracking-wide text-slate-400";
const controlClass =
  "mt-0.5 rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-sm font-medium disabled:opacity-50";

export function InlineSelect({
  label,
  value,
  options,
  onSave,
}: {
  label: string;
  value: string;
  options: Option[];
  onSave: (value: string) => Promise<void>;
}) {
  const [current, setCurrent] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const previous = current;
    setCurrent(next);
    setSaving(true);
    try {
      await onSave(next);
    } catch {
      setCurrent(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className={labelClass}>{label}</div>
      <select value={current} onChange={handleChange} disabled={saving} className={controlClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function InlineText({
  label,
  value,
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [current, setCurrent] = useState(value);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(current);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className={labelClass}>{label}</div>
      <div className="mt-0.5 flex items-center gap-1">
        <input
          value={current}
          onChange={(e) => {
            setCurrent(e.target.value);
            setDirty(true);
          }}
          placeholder={placeholder}
          className={`${controlClass} mt-0 w-full min-w-0`}
        />
        {dirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 rounded-md bg-slate-900 px-1.5 py-0.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? "..." : "OK"}
          </button>
        )}
      </div>
    </div>
  );
}
