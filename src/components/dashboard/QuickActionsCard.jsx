import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Truck, BookOpen, Calculator } from 'lucide-react';

export const QuickActionsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Ações Rápidas</CardTitle>
      <CardDescription>
        Acesse rapidamente as principais funcionalidades
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-20 flex-col" aria-label="Ver Preços" title="Ver Preços">
          <Link to="/prices">
            <DollarSign className="h-6 w-6 mb-2" aria-hidden="true" />
            Ver Preços
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col" aria-label="Tanques" title="Tanques">
          <Link to="/tanks">
            <Truck className="h-6 w-6 mb-2" aria-hidden="true" />
            Tanques
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col" aria-label="Caderninho" title="Caderninho">
          <Link to="/animals">
            <BookOpen className="h-6 w-6 mb-2" aria-hidden="true" />
            Caderninho
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col" aria-label="Rações" title="Rações">
          <Link to="/feed">
            <Calculator className="h-6 w-6 mb-2" aria-hidden="true" />
            Rações
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);
