"use client";

/* RECORD FORM — drawer for creating/editing any system's records.
   Renders whatever FieldDefs the active pack declares, grouped by section. */

import { useEffect, useMemo, useState } from "react";
import type { CrmRecord, Customer, FieldDef, SystemDef, Tenant } from "../types";
import { createRecord, updateRecord } from "../lib/ops";
import { removeRow } from "../lib/store";
import { Button, Field, Input, Select, Textarea } from "./ui";
import { Drawer, ConfirmButton, useToast } from "./overlays";

function FieldInput({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: any;
  onChange: (v: any) => void;
}) {
  switch (def.type) {
    case "textarea":
      return <Textarea value={value ?? ""} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "select":
    case "status":
      return (
        <Select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {def.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      );
    case "number":
    case "money":
      return (
        <Input
          type="number"
          value={value ?? ""}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    case "date":
      return <Input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "time":
      return <Input type="time" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "boolean":
      return (
        <Select value={String(value ?? "")} onChange={(e) => onChange(e.target.value === "true")}>
          <option value="">Select…</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      );
    default:
      return <Input value={value ?? ""} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function RecordDrawer({
  open,
  onClose,
  tenant,
  system,
  customers,
  record,
}: {
  open: boolean;
  onClose: () => void;
  tenant: Tenant;
  system: SystemDef;
  customers: Customer[];
  record: CrmRecord | null; // null = create
}) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState(system.pipeline[0]?.id ?? "");
  const [customerId, setCustomerId] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [assignee, setAssignee] = useState("");
  const [due, setDue] = useState("");
  const [fields, setFields] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!open) return;
    setTitle(record?.title ?? "");
    setStatus(record?.status ?? system.pipeline[0]?.id ?? "");
    setCustomerId(record?.customerId ?? "");
    setValue(record?.value != null ? String(record.value) : "");
    setAssignee(record?.assignee ?? "");
    setDue(record?.due ?? "");
    setFields(record?.fields ?? {});
  }, [open, record, system]);

  const groups = useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    system.fields.forEach((f) => {
      const g = f.group ?? "Details";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(f);
    });
    return Array.from(map.entries());
  }, [system]);

  const save = () => {
    if (!title.trim()) {
      toast("Give it a title first", "danger");
      return;
    }
    const common = {
      title: title.trim(),
      status,
      customerId: customerId || undefined,
      value: value === "" ? undefined : Number(value),
      assignee: assignee || undefined,
      due: due || undefined,
      fields,
    };
    if (record) updateRecord(tenant, { ...record, ...common });
    else createRecord(tenant, system, common);
    toast(record ? "Saved" : `${system.recordNoun.singular} created`);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={record ? `${record.ref} — edit` : `New ${system.recordNoun.singular.toLowerCase()}`}
      footer={
        <div className="flex items-center justify-between gap-2">
          {record ? (
            <ConfirmButton
              label="Delete"
              onConfirm={() => {
                removeRow(tenant.id, "records", record.id);
                toast("Deleted", "neutral");
                onClose();
              }}
            />
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save}>{record ? "Save changes" : "Create"}</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`e.g. ${system.recordNoun.singular} for a customer`} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stage">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {system.pipeline.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Customer">
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">No customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Value ($)">
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Due date">
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
          <Field label="Assignee" className="col-span-2">
            <Input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Who's on it?" />
          </Field>
        </div>

        {groups.map(([group, defs]) => (
          <div key={group} className="space-y-3 rounded-2xl border border-line bg-surface-2 p-4">
            <p className="eyebrow">{group}</p>
            {defs.map((def) => (
              <Field key={def.key} label={def.label} required={def.required} help={def.help}>
                <FieldInput def={def} value={fields[def.key]} onChange={(v) => setFields((f) => ({ ...f, [def.key]: v }))} />
              </Field>
            ))}
          </div>
        ))}
      </div>
    </Drawer>
  );
}
