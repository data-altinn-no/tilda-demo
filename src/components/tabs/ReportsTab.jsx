import React from 'react';
import { DetailedBox } from '../layout';

/**
 * Reports Tab Component - Displays supervision reports
 */
export function ReportsTab({ rap, selectedAuthority, onClearSelection }) {
  return (
    <DetailedBox 
      title="Tilsynsrapport – per myndighet (detaljer)" 
      rows={rap} 
      selectedAuthority={selectedAuthority}
      onClearSelection={onClearSelection}
    />
  );
}