// src/components/animals/MovementDialog.jsx
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function MovementDialog({ open, onClose, onSubmit, initialData, animal }) {
  const isEdit = Boolean(initialData?.id);
  const [type, setType] = useState(initialData?.type ?? "compra");
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(
    initialData?.amount != null ? String(initialData.amount) : "",
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  useEffect(() => {
    setType(initialData?.type ?? "compra");
    setDate(initialData?.date ?? new Date().toISOString().slice(0, 10));
    setAmount(initialData?.amount != null ? String(initialData.amount) : "");
    setNotes(initialData?.notes ?? "");
  }, [initialData, open]);

  const [errors, setErrors] = useState({});
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function validate() {
    const e = {};
    if (!date) e.date = "Informe a data.";
    if (date && date > todayStr) e.date = "Data não pode ser no futuro.";
    if (!["compra", "venda", "obito", "transferencia"].includes(type)) e.type = "Tipo inválido.";
    if ((type === "compra" || type === "venda") && (amount === "" || Number(amount) < 0)) {
      e.amount = "Informe um valor válido (R$).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev?.preventDefault?.();
    if (!validate()) return;
    await onSubmit?.({
      ...(initialData?.id ? { id: initialData.id } : {}),
      type,
      date,
      amount: amount === "" ? null : Number(amount),
      notes,
    });
    onClose?.();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? `Editar movimentação - ${animal?.name ?? ""}`
              : `Nova movimentação - ${animal?.name ?? ""}`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Registrar compra, venda, óbito ou transferência do animal.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compra">Compra</SelectItem>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="obito">Óbito</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={todayStr}
            />
            {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
          </div>

          {(type === "compra" || type === "venda") && (
            <div className="grid gap-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex.: 3500.00"
              />
              {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
            </div>
          )}

          <div className="grid gap-2">
            <Label>Observações</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onClose?.()}>
              Cancelar
            </Button>
            <Button type="submit">{isEdit ? "Salvar" : "Registrar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
