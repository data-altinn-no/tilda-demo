import { DetailedBox } from '../layout/DetailedBox';

interface CoordinationTabProps {
  koord: any[];
  selectedAuthority: string | null;
  onClearSelection: () => void;
}

/**
 * Coordination Tab Component - Displays supervision coordination
 */
export function CoordinationTab({ koord, selectedAuthority, onClearSelection }: CoordinationTabProps) {
  return (
    <DetailedBox 
      title="Tilsynskoordinering – per myndighet (detaljer)" 
      rows={koord} 
      selectedAuthority={selectedAuthority}
      onClearSelection={onClearSelection}
    />
  );
}
