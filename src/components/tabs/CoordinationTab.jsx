import React from 'react';
import { DetailedBox } from '../layout';

/**
 * Coordination Tab Component - Displays supervision coordination
 */
export function CoordinationTab({ koord, selectedAuthority, onClearSelection }) {
  return (
    <DetailedBox 
      title="Tilsynskoordinering – per myndighet (detaljer)" 
      rows={koord} 
      selectedAuthority={selectedAuthority}
      onClearSelection={onClearSelection}
    />
  );
}