import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_LEN = 80;

export const RecipeDialog = ({ isOpen, onOpenChange, onSubmit, recipe, onValidateName }) => {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (recipe) {
      setName(recipe.name || "");
    } else {
      setName("");
    }
    setErr("");
  }, [recipe, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = (name || "").trim();
    if (!trimmed) {
      setErr("Informe um nome válido.");
      return;
    }
    if (trimmed.length > MAX_LEN) {
      setErr(`Máximo de ${MAX_LEN} caracteres.`);
      return;
    }

    // verificação opcional de duplicidade (pai decide a regra)
    if (typeof onValidateName === "function") {
      const msg = onValidateName(trimmed);
      if (msg) {
        setErr(msg);
        return;
      }
    }

    setErr("");
    onSubmit({ name: trimmed });
  };

  const isEditing = !!recipe;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Receita" : "Nova Receita"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite o nome da receita." : "Crie uma nova receita de ração."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="recipe-name">Nome da Receita</Label>
              <Input
                id="recipe-name"
                value={name}
                onChange={(e) => {
                  const v = e.target.value;
                  setName(v.length <= MAX_LEN ? v : v.slice(0, MAX_LEN));
                  if (err) setErr("");
                }}
                placeholder="Ex: Ração Básica Gado Leiteiro"
                required
                aria-invalid={!!err}
                aria-describedby={err ? "recipe-name-error" : undefined}
              />
              {err && (
                <p id="recipe-name-error" className="mt-1 text-xs text-red-600">
                  {err}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">{isEditing ? "Atualizar" : "Criar Receita"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
