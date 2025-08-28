import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const StatCard = ({ icon: Icon, title, value, delay, color = 'green' }) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            {Icon ? (
              <Icon className={cn('h-8 w-8', colorClasses[color])} aria-hidden="true" />
            ) : null}
            <div className="ml-4">
             <p className="text-sm font-medium text-gray-600 break-words">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
