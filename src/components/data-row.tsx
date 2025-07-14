import React, { JSX } from 'react';

export function DataRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-1">
      <span className="font-medium text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-right">{value || '—'}</span>
    </div>
  );
}