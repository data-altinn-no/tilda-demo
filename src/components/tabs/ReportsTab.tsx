import { DetailedBox } from '../layout/DetailedBox';

interface ReportsTabProps {
  rap: any[];
  selectedAuthority: string | null;
  onClearSelection: () => void;
}

/**
 * Reports Tab Component - Displays supervision reports
 */
export function ReportsTab({ rap, selectedAuthority, onClearSelection }: ReportsTabProps) {
  return (
    <DetailedBox 
      title="Tilsynsrapport – per myndighet (detaljer)" 
      rows={rap} 
      selectedAuthority={selectedAuthority}
      onClearSelection={onClearSelection}
    />
  );
}
