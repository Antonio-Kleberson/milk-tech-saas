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
// initialData?: { id, name, earring, breed, birth_date }
// validateEarring?: fn(earring, ignoreId?) -> true/false (único por produtor)
export function AnimalDialog({ open, onClose, onSubmit, initialData, validateEarring }) {
  const isEdit = Boolean(initialData?.id);
  const [name, setName] = useState(initialData?.name ?? "");
  const [earring, setEarring] = useState(initialData?.earring ?? "");
  const [breed, setBreed] = useState(initialData?.breed ?? "");
  const [birthDate, setBirthDate] = useState(
    initialData?.birth_date ? initialData.birth_date.split("T")[0] : "",
  );

  useEffect(() => {
    setName(initialData?.name ?? "");
    setEarring(initialData?.earring ?? "");
    setBreed(initialData?.breed ?? "");
    setBirthDate(initialData?.birth_date ? initialData.birth_date.split("T")[0] : "");
  }, [initialData, open]);

  const [errors, setErrors] = useState({});
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  function validate() {
    const e = {};
    if (!name?.trim()) e.name = "Informe o nome do animal.";
    if (!earring?.trim()) e.earring = "Informe o brinco.";
    if (validateEarring && earring?.trim()) {
      const ok = validateEarring(earring, initialData?.id);
      if (!ok) e.earring = "Já existe um animal com esse brinco.";
    }
    if (birthDate && birthDate > todayStr)
      e.birth_date = "Data de nascimento não pode ser no futuro.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev?.preventDefault?.();
    if (!validate()) return;
    await onSubmit?.({
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: name.trim(),
      earring: earring.trim(),
      breed: breed?.trim() || "",
      birth_date: birthDate || null,
    });
    onClose?.();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar animal" : "Novo animal"}</DialogTitle>
          <DialogDescription className="sr-only">
            Formulário para {isEdit ? "editar" : "criar"} um animal com nome, brinco, raça e data de
            nascimento.
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
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Ex.: Estrela"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "err-name" : undefined}
            />
            {errors.name && (
              <p id="err-name" className="text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="earring">Brinco</Label>
            <Input
              id="earring"
              value={earring}
              onChange={(e) => setEarring(e.target.value)}
              placeholder="Ex.: 001"
              aria-invalid={Boolean(errors.earring)}
              aria-describedby={errors.earring ? "err-earring" : undefined}
            />
            {errors.earring && (
              <p id="err-earring" className="text-sm text-red-600">
                {errors.earring}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="breed">Raça (opcional)</Label>
            <Input
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Ex.: Girolando"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="birth">Nascimento</Label>
            <Input
              id="birth"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={todayStr}
              aria-invalid={Boolean(errors.birth_date)}
              aria-describedby={errors.birth_date ? "err-birth" : undefined}
            />
            {errors.birth_date && (
              <p id="err-birth" className="text-sm text-red-600">
                {errors.birth_date}
              </p>
            )}
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
            <Button type="submit" aria-label={isEdit ? "Salvar alterações" : "Criar animal"}>
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
