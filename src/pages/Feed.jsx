import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';
import { Plus, Calculator } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { RecipeCard } from '@/components/feed/RecipeCard';
import { RecipeDialog } from '@/components/feed/RecipeDialog';
import { IngredientDialog } from '@/components/feed/IngredientDialog';
import { CalculatorDialog } from '@/components/feed/CalculatorDialog';

const Feed = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [recipeItems, setRecipeItems] = useState([]);
  const [modalState, setModalState] = useState({
    recipe: false,
    ingredient: false,
    calculator: false,
    editingRecipe: null,
    editingIngredient: null,
    currentRecipeForIngredient: null,
  });

  const loadData = useCallback(() => {
    setRecipes(storage.getFeedRecipes().filter(r => r.owner_id === user.id));
    setRecipeItems(storage.getFeedRecipeItems());
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openModal = (type, data = {}) => setModalState(prev => ({ ...prev, [type]: true, ...data }));
  const closeModal = (type) => setModalState(prev => ({ ...prev, [type]: false, editingRecipe: null, editingIngredient: null, currentRecipeForIngredient: null }));

  const handleRecipeSubmit = (formData) => {
    const allRecipes = storage.getFeedRecipes();
    if (modalState.editingRecipe) {
      storage.setFeedRecipes(allRecipes.map(r => r.id === modalState.editingRecipe.id ? { ...r, ...formData } : r));
      toast({ title: 'Sucesso!', description: 'Receita atualizada.' });
    } else {
      storage.setFeedRecipes([...allRecipes, { id: Date.now().toString(), owner_id: user.id, ...formData, created_at: new Date().toISOString() }]);
      toast({ title: 'Sucesso!', description: 'Receita criada.' });
    }
    closeModal('recipe');
    loadData();
  };

  const handleIngredientSubmit = (formData) => {
    const value = parseFloat(formData.proportion_value);
    if (isNaN(value) || value <= 0 || value > 100) {
      toast({ title: 'Erro', description: 'A proporção deve ser um número entre 0 e 100.', variant: 'destructive' });
      return;
    }

    const allItems = storage.getFeedRecipeItems();
    const newFormData = { ...formData, proportion_value: value };

    if (modalState.editingIngredient) {
      storage.setFeedRecipeItems(allItems.map(i => i.id === modalState.editingIngredient.id ? { ...i, ...newFormData } : i));
      toast({ title: 'Sucesso!', description: 'Ingrediente atualizado.' });
    } else {
      storage.setFeedRecipeItems([...allItems, { id: Date.now().toString(), recipe_id: modalState.currentRecipeForIngredient.id, ...newFormData }]);
      toast({ title: 'Sucesso!', description: 'Ingrediente adicionado.' });
    }
    closeModal('ingredient');
    loadData();
  };

  const deleteRecipe = (recipeId) => {
    storage.setFeedRecipes(storage.getFeedRecipes().filter(r => r.id !== recipeId));
    storage.setFeedRecipeItems(storage.getFeedRecipeItems().filter(i => i.recipe_id !== recipeId));
    toast({ title: 'Sucesso!', description: 'Receita removida.' });
    loadData();
  };
  
  const deleteIngredient = (itemId) => {
    storage.setFeedRecipeItems(storage.getFeedRecipeItems().filter(i => i.id !== itemId));
    toast({ title: 'Sucesso!', description: 'Ingrediente removido.' });
    loadData();
  };

  return (
    <>
      <Helmet>
        <title>Receitas de Ração - MilkTech</title>
        <meta name="description" content="Crie e gerencie receitas de ração personalizadas e calcule as quantidades necessárias para sua produção." />
        <meta property="og:title" content="Receitas de Ração - MilkTech" />
        <meta property="og:description" content="Crie e gerencie receitas de ração personalizadas e calcule as quantidades necessárias para sua produção." />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Receitas de Ração</h1>
            <p className="text-gray-600">Gerencie suas receitas e calcule proporções.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => openModal('calculator')}>
              <Calculator className="h-4 w-4 mr-2" /> Calcular
            </Button>
            <Button onClick={() => openModal('recipe')}>
              <Plus className="h-4 w-4 mr-2" /> Nova Receita
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {recipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              items={recipeItems.filter(i => i.recipe_id === recipe.id)}
              onEditRecipe={() => openModal('recipe', { editingRecipe: recipe })}
              onDeleteRecipe={deleteRecipe}
              onAddIngredient={() => openModal('ingredient', { currentRecipeForIngredient: recipe })}
              onEditIngredient={(ingredient) => openModal('ingredient', { editingIngredient: ingredient, currentRecipeForIngredient: recipe })}
              onDeleteIngredient={deleteIngredient}
              index={index}
            />
          ))}

          {recipes.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Nenhuma receita cadastrada.</p>
                <p className="text-sm text-gray-400 mt-2">Clique em "Nova Receita" para começar.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <RecipeDialog
        isOpen={modalState.recipe}
        onOpenChange={() => closeModal('recipe')}
        onSubmit={handleRecipeSubmit}
        recipe={modalState.editingRecipe}
      />
      
      <IngredientDialog
        isOpen={modalState.ingredient}
        onOpenChange={() => closeModal('ingredient')}
        onSubmit={handleIngredientSubmit}
        ingredient={modalState.editingIngredient}
        recipeName={modalState.currentRecipeForIngredient?.name}
      />

      <CalculatorDialog
        isOpen={modalState.calculator}
        onOpenChange={() => closeModal('calculator')}
        recipes={recipes}
      />
    </>
  );
};

export default Feed;