import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { storage } from '@/lib/storage';

const toNumber = (v) => {
  const n = typeof v === 'string' ? v.replace(',', '.') : v;
  const num = parseFloat(n);
  return Number.isFinite(num) ? num : 0;
};

const round2 = (n) => Math.round(n * 100) / 100;

const CalculatorResult = ({ result }) => (
  <div className="mt-6 p-4 bg-green-50 rounded-lg">
    <h4 className="font-medium text-green-900 mb-3">
      Resultado para {result.recipe}
    </h4>
    <div className="space-y-2">
      <p className="text-sm text-green-800">
        <strong>Quantidade total:</strong> {result.targetKg} kg
      </p>
      {Number.isFinite(result.estimatedDays) && result.estimatedDays > 0 && (
        <p className="text-sm text-green-800">
          <strong>Estimativa de duração:</strong> {round2(result.estimatedDays)} dias
        </p>
      )}
      <div className="mt-3">
        <p className="text-sm font-medium text-green-900 mb-2">Ingredientes necessários:</p>
        {result.ingredients.map((ingredient, index) => (
          <div key={index} className="flex justify-between text-sm text-green-800">
            <span>{ingredient.name}:</span>
            <span>{round2(ingredient.kg)} kg</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const CalculatorDialog = ({ isOpen, onOpenChange, recipes, onRegisterBatch }) => {
  const [form, setForm] = useState({ recipe_id: '', target_kg: '', daily_consumption: '' });
  const [result, setResult] = useState(null);

  const calculateFeed = () => {
    const recipe = (recipes || []).find(r => r.id === form.recipe_id);
    if (!recipe) {
      toast({ title: 'Selecione uma receita', variant: 'destructive' });
      return;
    }

    const items = (storage.getFeedRecipeItems?.() || []).filter(i => i.recipe_id === recipe.id);
    const targetKg = toNumber(form.target_kg);

    if (!targetKg || targetKg <= 0) {
      toast({ title: 'Erro', description: 'Digite uma quantidade válida para produzir', variant: 'destructive' });
      return;
    }

    const ingredients = items.map(item => {
      const prop = toNumber(item.proportion_value);
      return {
        name: item.ingredient_name,
        kg: (targetKg * prop) / 100,
      };
    });

    const dailyConsumption = toNumber(form.daily_consumption);
    const estimatedDays = dailyConsumption > 0 ? targetKg / dailyConsumption : null;

    setResult({
      recipe: recipe.name,
      recipeId: recipe.id,
      targetKg: round2(targetKg),
      dailyConsumption: dailyConsumption > 0 ? round2(dailyConsumption) : null,
      estimatedDays: estimatedDays ?? null,
      createdAt: new Date().toISOString(),
      ingredients,
    });
  };

  const handleRegister = () => {
    // Gancho opcional: se o pai passar onRegisterBatch, chamamos.
    if (onRegisterBatch && result) {
      onRegisterBatch(result);
    } else {
      // Se não tiver serviço ainda, apenas avisa. Não muda visual.
      toast({
        title: 'Armazém',
        description: 'Você pode ativar o registro no armazém depois. (Passe a prop onRegisterBatch)',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Calculadora de Ração</DialogTitle>
          <DialogDescription>
            Calcule as quantidades necessárias de cada ingrediente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="calc-recipe">Receita</Label>
            <Select value={form.recipe_id} onValueChange={(value) => setForm({ ...form, recipe_id: value })}>
              <SelectTrigger><SelectValue placeholder="Selecione uma receita" /></SelectTrigger>
              <SelectContent>
                {(recipes || []).map(recipe => (
                  <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="target-kg">Quantidade a produzir (kg)</Label>
            <Input
              id="target-kg"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={form.target_kg}
              onChange={(e) => setForm({ ...form, target_kg: e.target.value })}
              placeholder="Ex: 100"
            />
          </div>

          <div>
            <Label htmlFor="daily-consumption">Consumo diário total (kg/dia) - Opcional</Label>
            <Input
              id="daily-consumption"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={form.daily_consumption}
              onChange={(e) => setForm({ ...form, daily_consumption: e.target.value })}
              placeholder="Ex: 5"
            />
          </div>

          <Button onClick={calculateFeed} className="w-full">Calcular Ingredientes</Button>

          {result && (
            <>
              <CalculatorResult result={result} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setResult(null)}>
                  Refazer cálculo
                </Button>
                <Button onClick={handleRegister}>
                  Registrar no Armazém
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
