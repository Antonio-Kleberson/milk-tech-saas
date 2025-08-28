import React from 'react';
import { Percent, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const IngredientList = ({ items = [], onEdit, onDelete }) => (
  <div className="space-y-2">
    {items.map((item) => {
      const value = Number(item?.proportion_value);
      const pct = Number.isFinite(value) ? value.toFixed(1) : '0.0';

      return (
        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Percent className="h-4 w-4 mr-2 text-gray-500" aria-hidden="true" />
            <div>
              <p className="font-medium">{item?.ingredient_name}</p>
              <p className="text-sm text-gray-600">
                {pct}%
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(item)}
              aria-label="Editar ingrediente"
              title="Editar ingrediente"
            >
              <Edit className="h-3 w-3" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(item.id)}
              aria-label="Excluir ingrediente"
              title="Excluir ingrediente"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
        </div>
      );
    })}
    {items.length === 0 && (
      <div className="p-3 text-sm text-gray-500 text-center bg-gray-50 rounded-lg">
        Nenhum ingrediente adicionado
      </div>
    )}
  </div>
);
