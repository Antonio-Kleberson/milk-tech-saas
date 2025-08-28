// src/components/animals/ReproDialog.jsx
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

export function ReproDialog({ open, onClose, onSubmit, initialData, animal }) {
  const isEdit = Boolean(initialData?.id);
  const [kind, setKind] = useState(initialData?.kind ?? "ia"); // ia | cobertura | diagnostico | parto
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState(initialData?.result ?? "");
  const [calfSex, setCalfSex] = useState(initialData?.calf_sex ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  useEffect(() => {
    setKind(initialData?.kind ?? "ia");
    setDate(initialData?.date ?? new Date().toISOString().slice(0, 10));
    setResult(initialData?.result ?? "");
    setCalfSex(initialData?.calf_sex ?? "");
    setNotes(initialData?.notes ?? "");
  }, [initialData, open]);

  const [errors, setErrors] = useState({});
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function validate() {
    const e = {};
    if (!date) e.date = "Informe a data.";
    if (date && date > todayStr) e.date = "Data não pode ser no futuro.";
    if (!["ia", "cobertura", "diagnostico", "parto"].includes(kind)) e.kind = "Tipo inválido.";

    if (kind === "diagnostico" && !["positivo", "negativo"].includes(result.toLowerCase())) {
      e.result = "Informe o resultado (positivo/negativo).";
    }
    if (kind === "parto" && !["M", "F"].includes(calfSex)) {
      e.calfSex = "Informe o sexo do bezerro (M/F).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev?.preventDefault?.();
    if (!validate()) return;
    await onSubmit?.({
      ...(initialData?.id ? { id: initialData.id } : {}),
      kind,
      date,
      result,
      calf_sex: calfSex,
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
              ? `Editar evento reprodutivo - ${animal?.name ?? ""}`
              : `Novo evento reprodutivo - ${animal?.name ?? ""}`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Registrar IA, cobertura, diagnóstico de prenhez ou parto.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ia">IA</SelectItem>
                <SelectItem value="cobertura">Cobertura</SelectItem>
                <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                <SelectItem value="parto">Parto</SelectItem>
              </SelectContent>
            </Select>
            {errors.kind && <p className="text-sm text-red-600">{errors.kind}</p>}
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

          {kind === "diagnostico" && (
            <div className="grid gap-2">
              <Label>Resultado</Label>
              <Select value={result || ""} onValueChange={setResult}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positivo">Positivo</SelectItem>
                  <SelectItem value="negativo">Negativo</SelectItem>
                </SelectContent>
              </Select>
              {errors.result && <p className="text-sm text-red-600">{errors.result}</p>}
            </div>
          )}

          {kind === "parto" && (
            <div className="grid gap-2">
              <Label>Sexo do bezerro</Label>
              <Select value={calfSex || ""} onValueChange={setCalfSex}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                </SelectContent>
              </Select>
              {errors.calfSex && <p className="text-sm text-red-600">{errors.calfSex}</p>}
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
