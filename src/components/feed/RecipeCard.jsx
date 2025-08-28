import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { IngredientList } from "@/components/feed/IngredientList";

export const RecipeCard = ({
  recipe,
  items = [],
  onEditRecipe,
  onDeleteRecipe,
  onAddIngredient,
  onEditIngredient,
  onDeleteIngredient,
  index = 0,
}) => {
  const totalPercentage = items.reduce((total, item) => {
    const v = Number(item?.proportion_value);
    return total + (Number.isFinite(v) ? v : 0);
  }, 0);

  const isValidRecipe = totalPercentage >= 99 && totalPercentage <= 101;

  return (
    <motion.div
      key={recipe.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start">
            <div className="mb-4 sm:mb-0">
              <CardTitle className="flex items-center flex-wrap gap-2">
                {recipe?.name}
                <Badge variant={isValidRecipe ? "default" : "destructive"}>
                  Total: {Number.isFinite(totalPercentage) ? totalPercentage.toFixed(1) : "0.0"}%
                </Badge>
              </CardTitle>
              <CardDescription>
                {items.length} ingrediente{items.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex space-x-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => onAddIngredient?.(recipe)}>
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                Ingrediente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditRecipe?.(recipe)}
                aria-label="Editar receita"
                title="Editar receita"
              >
                <Edit className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteRecipe?.(recipe.id)}
                aria-label="Excluir receita"
                title="Excluir receita"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {items.length > 0 && (
          <CardContent>
            <IngredientList items={items} onEdit={onEditIngredient} onDelete={onDeleteIngredient} />
            {!isValidRecipe && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ A soma das proporções deve estar entre 99% e 101% para ser uma receita válida.
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};
