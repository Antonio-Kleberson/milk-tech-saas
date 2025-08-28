import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const IngredientDialog = ({ isOpen, onOpenChange, onSubmit, ingredient, recipeName }) => {
  const [formData, setFormData] = useState({
    ingredient_name: '',
    proportion_type: 'percent',
    proportion_value: ''
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        ingredient_name: ingredient.ingredient_name || '',
        proportion_type: ingredient.proportion_type || 'percent',
        proportion_value: ingredient.proportion_value?.toString() || ''
      });
    } else {
      setFormData({ ingredient_name: '', proportion_type: 'percent', proportion_value: '' });
    }
  }, [ingredient, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let value = Number(formData.proportion_value);
    if (!Number.isFinite(value)) value = 0;
    // se for porcentagem, limita 0..100
    if (formData.proportion_type === 'percent') {
      value = clamp(value, 0, 100);
    }

    onSubmit({
      ingredient_name: formData.ingredient_name.trim(),
      proportion_type: formData.proportion_type,
      proportion_value: value
    });
  };

  const isEditing = !!ingredient;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edite os dados do ingrediente.' : `Adicionar ingrediente à receita "${recipeName}".`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="ingredient-name">Nome do Ingrediente</Label>
              <Input
                id="ingredient-name"
                value={formData.ingredient_name}
                onChange={(e) => setFormData({ ...formData, ingredient_name: e.target.value })}
                placeholder="Ex: Milho"
                required
              />
            </div>
            <div>
              <Label htmlFor="proportion-type">Tipo de Proporção</Label>
              <Select
                value={formData.proportion_type}
                onValueChange={(value) => setFormData({ ...formData, proportion_type: value })}
              >
                {/* IMPORTANT: id no trigger e aria-labelledby para o label funcionar */}
                <SelectTrigger id="proportion-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Porcentagem (%)</SelectItem>
                  <SelectItem value="kg_base" disabled>Kg por base (em breve)</SelectItem>
                </SelectContent>
              </Select>

            </div>
            <div>
              <Label htmlFor="proportion-value">
                {formData.proportion_type === 'percent' ? 'Valor da Proporção (%)' : 'Valor (kg)'}
              </Label>
              <Input
                id="proportion-value"
                type="number"
                step="0.1"
                inputMode="decimal"
                min={formData.proportion_type === 'percent' ? 0 : undefined}
                max={formData.proportion_type === 'percent' ? 100 : undefined}
                value={formData.proportion_value}
                onChange={(e) => setFormData({ ...formData, proportion_value: e.target.value })}
                placeholder={formData.proportion_type === 'percent' ? 'Ex: 75' : 'Ex: 10'}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">{isEditing ? 'Atualizar' : 'Adicionar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
