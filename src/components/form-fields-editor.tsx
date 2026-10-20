import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { newId, type FormField } from "@/lib/authoring";

export function FormFieldsEditor({ fields, onChange }: { fields: FormField[]; onChange: (fields: FormField[]) => void }) {
  function move(index: number, delta: number) {
    const next = [...fields];
    const current = next[index];
    const other = next[index + delta];
    if (!current || !other) return;
    next[index] = other;
    next[index + delta] = current;
    onChange(next);
  }
  return <section className="space-y-4" aria-label="Form fields">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Form fields</h3><Button variant="outline" onClick={() => onChange([...fields, { id: newId(), label: "", type: "text" }])}><Plus className="size-4" />Add field</Button></div>
    {fields.length === 0 && <p className="text-sm text-muted-foreground">No fields yet</p>}
    {fields.map((field, index) => <div key={field.id} className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-muted-foreground">Field {index + 1}</span><div className="flex">
        <Button variant="ghost" size="icon" className="size-11" title="Move up" aria-label={`Move field ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="size-4" /></Button>
        <Button variant="ghost" size="icon" className="size-11" title="Move down" aria-label={`Move field ${index + 1} down`} disabled={index === fields.length - 1} onClick={() => move(index, 1)}><ArrowDown className="size-4" /></Button>
        <Button variant="ghost" size="icon" className="size-11 text-destructive" title="Delete field" aria-label={`Delete field ${index + 1}`} onClick={() => onChange(fields.filter(item => item.id !== field.id))}><Trash2 className="size-4" /></Button>
      </div></div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]"><div className="space-y-2"><Label htmlFor={`label-${field.id}`}>Field label</Label><Input id={`label-${field.id}`} value={field.label} onChange={e => onChange(fields.map(item => item.id === field.id ? { ...item, label: e.target.value } : item))} /></div>
        <div className="space-y-2"><Label htmlFor={`type-${field.id}`}>Answer type</Label><Select value={field.type} onValueChange={value => { if (value === "text" || value === "number" || value === "textarea") onChange(fields.map(item => item.id === field.id ? { ...item, type: value } : item)); }}><SelectTrigger id={`type-${field.id}`} className="min-h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="text">Short text</SelectItem><SelectItem value="number">Number</SelectItem><SelectItem value="textarea">Long text</SelectItem></SelectContent></Select></div>
      </div>
    </div>)}
  </section>;
}