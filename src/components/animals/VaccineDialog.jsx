import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Props esperadas:
// open: bool
// onClose: fn()
// onSubmit: fn(payload) -> cria/edita
// initialData?: { id, name, applied_at, next_due_at, notes }
// animal?: { id, name }
export function VaccineDialog({ open, onClose, onSubmit, initialData, animal }) {
  const isEdit = Boolean(initialData?.id);
  const [name, setName] = useState(initialData?.name ?? "");
  const [appliedAt, setAppliedAt] = useState(
    initialData?.applied_at ? initialData.applied_at.split("T")[0] : "",
  );
  const [nextDueAt, setNextDueAt] = useState(
    initialData?.next_due_at ? initialData.next_due_at.split("T")[0] : "",
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  useEffect(() => {
    setName(initialData?.name ?? "");
    setAppliedAt(initialData?.applied_at ? initialData.applied_at.split("T")[0] : "");
    setNextDueAt(initialData?.next_due_at ? initialData.next_due_at.split("T")[0] : "");
    setNotes(initialData?.notes ?? "");
  }, [initialData, open]);

  const [errors, setErrors] = useState({});
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  function validate() {
    const e = {};
    if (!name?.trim()) e.name = "Informe o nome da vacina.";
    if (!appliedAt) e.applied_at = "Informe a data aplicada.";
    if (appliedAt && appliedAt > todayStr) e.applied_at = "Data aplicada não pode ser no futuro.";
    if (nextDueAt && appliedAt && nextDueAt < appliedAt)
      e.next_due_at = "Próxima dose não pode ser anterior à aplicada.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev?.preventDefault?.();
    if (!validate()) return;
    await onSubmit?.({
      ...(initialData?.id ? { id: initialData.id } : {}),
      animal_id: animal?.id,
      name: name.trim(),
      applied_at: appliedAt,
      next_due_at: nextDueAt || null,
      notes: notes?.trim() || "",
    });
    onClose?.();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar vacina" : "Nova vacina"}
            {animal?.name ? ` – ${animal.name}` : ""}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulário para {isEdit ? "editar" : "cadastrar"} vacina, informando nome, data
            aplicada, próxima dose (opcional) e observações.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="vname">Vacina</Label>
            <Input
              id="vname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Ex.: Brucelose"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "err-vname" : undefined}
            />
            {errors.name && (
              <p id="err-vname" className="text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="applied">Aplicada em</Label>
            <Input
              id="applied"
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
              max={todayStr}
              aria-invalid={Boolean(errors.applied_at)}
              aria-describedby={errors.applied_at ? "err-applied" : undefined}
            />
            {errors.applied_at && (
              <p id="err-applied" className="text-sm text-red-600">
                {errors.applied_at}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="next">Próxima dose (opcional)</Label>
            <Input
              id="next"
              type="date"
              value={nextDueAt}
              onChange={(e) => setNextDueAt(e.target.value)}
              min={appliedAt || undefined}
              aria-invalid={Boolean(errors.next_due_at)}
              aria-describedby={errors.next_due_at ? "err-next" : undefined}
            />
            {errors.next_due_at && (
              <p id="err-next" className="text-sm text-red-600">
                {errors.next_due_at}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Lote, fabricante, reações..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose?.()}
              aria-label="Cancelar"
            >
              Cancelar
            </Button>
            <Button type="submit" aria-label={isEdit ? "Salvar alterações" : "Adicionar vacina"}>
              {isEdit ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
