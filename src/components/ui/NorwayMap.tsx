import { useEffect, useState } from 'react';

interface City {
  name: string;
  value: number;
  coordinates: [number, number]; // [longitude, latitude]
}

interface NorwayMapProps {
  cityViolations: Record<string, number>;
  maxViolations?: number;
}

export function NorwayMap({ cityViolations, maxViolations }: NorwayMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [norwayGeoJSON, setNorwayGeoJSON] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Norwegian cities with their coordinates - using actual violation data
  const cityCoordinates: Record<string, [number, number]> = {
    'Oslo': [10.7522, 59.9139],
    'Bergen': [5.3221, 60.3913],
    'Trondheim': [10.3951, 63.4305],
    'Stavanger': [5.7331, 58.9700],
    'Tromsø': [18.9553, 69.6492],
    'Drammen': [10.2045, 59.7439],
    'Kristiansand': [8.0182, 58.1467],
    'Bodø': [14.4051, 67.2804],
    'Ålesund': [6.1549, 62.4722],
    'Molde': [7.1574, 62.7378],
    'Haugesund': [5.2681, 59.4138],
    'Sandnes': [5.7349, 58.8516],
    'Fredrikstad': [10.9298, 59.2181],
    'Narvik': [17.4272, 68.4384],
    'Harstad': [16.5411, 68.7989],
    'Tønsberg': [10.4078, 59.2674],
    'Moss': [10.6596, 59.4369],
    'Skien': [9.6090, 59.2086]
  };

  // Create cities array from actual violation data
  const cities: City[] = Object.entries(cityViolations)
    .filter(([cityName]) => cityCoordinates[cityName]) // Only include cities we have coordinates for
    .map(([cityName, violationCount]) => ({
      name: cityName,
      value: violationCount,
      coordinates: cityCoordinates[cityName]
    }));

  // Marker position offsets to prevent overlapping (for geographically close cities)
  const markerOffsets: Record<string, { mx: number; my: number }> = {
    'Oslo': { mx: 8, my: 8 },
    'Drammen': { mx: -8, my: -8 },
  };

  // Label positioning to avoid collisions
  const labelOffsets: Record<string, { dx: number; dy: number; anchor?: 'start' | 'middle' | 'end' }> = {
    'Oslo': { dx: 18, dy: 5, anchor: 'start' },
    'Bergen': { dx: -18, dy: 5, anchor: 'end' },
    'Trondheim': { dx: 18, dy: 5, anchor: 'start' },
    'Stavanger': { dx: -18, dy: 5, anchor: 'end' },
    'Tromsø': { dx: 18, dy: 5, anchor: 'start' },
    'Drammen': { dx: 18, dy: -18, anchor: 'start' },
    'Kristiansand': { dx: 0, dy: 22, anchor: 'middle' },
    'Bodø': { dx: 18, dy: 5, anchor: 'start' },
    'Ålesund': { dx: -18, dy: 5, anchor: 'end' },
    'Molde': { dx: 18, dy: 5, anchor: 'start' },
    'Haugesund': { dx: -18, dy: 5, anchor: 'end' },
    'Sandnes': { dx: -18, dy: -8, anchor: 'end' },
    'Fredrikstad': { dx: 18, dy: -8, anchor: 'start' },
    'Narvik': { dx: 18, dy: 5, anchor: 'start' },
    'Harstad': { dx: 18, dy: -8, anchor: 'start' },
    'Tønsberg': { dx: -18, dy: -8, anchor: 'end' },
    'Moss': { dx: 18, dy: -18, anchor: 'start' },
    'Skien': { dx: -18, dy: 5, anchor: 'end' }
  };

  useEffect(() => {
    const loadMapData = async () => {
      try {
        // Fetch accurate Norway GeoJSON from Natural Earth
        const response = await fetch(
          'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json'
        );
        const worldData = await response.json();
        
        // Import topojson-client dynamically
        const topojson = await import('topojson-client');
        
        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(worldData, worldData.objects.countries);
        
        // Filter for Norway (ISO code: 578)
        const norwayFeature = countries.features.find(
          (d: any) => d.id === '578' || d.properties?.name === 'Norway'
        );

        if (!norwayFeature) {
          console.error('Norway not found in the data');
          setIsLoading(false);
          return;
        }

        setNorwayGeoJSON(norwayFeature);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading map data:', error);
        setIsLoading(false);
      }
    };

    loadMapData();
  }, []);

  // Convert GeoJSON coordinates to SVG path
  const geoJSONToPath = (coordinates: any[], xScale: number, yScale: number, xOffset: number, yOffset: number): string => {
    if (!coordinates || coordinates.length === 0) return '';
    
    const coordsToPath = (coords: number[][]) => {
      return coords.map((coord, i) => {
        const x = (coord[0] - xOffset) * xScale;
        const y = (yOffset - coord[1]) * yScale;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ');
    };

    // Handle MultiPolygon and Polygon geometries
    if (coordinates[0][0][0] instanceof Array) {
      // MultiPolygon
      return coordinates.map(polygon => 
        coordsToPath(polygon[0]) + ' Z'
      ).join(' ');
    } else if (coordinates[0][0] instanceof Array) {
      // Polygon
      return coordinates.map(ring => 
        coordsToPath(ring) + ' Z'
      ).join(' ');
    }
    return '';
  };

  const renderMap = () => {
    if (!norwayGeoJSON) return null;

    // Norway bounds (approximate)
    const bounds = {
      minLon: 4.5,
      maxLon: 31.5,
      minLat: 57.8,
      maxLat: 71.3,
    };

    const width = 400;
    const height = 500;
    const padding = 20;

    const lonRange = bounds.maxLon - bounds.minLon;
    const latRange = bounds.maxLat - bounds.minLat;
    const xScale = (width - 2 * padding) / lonRange;
    const yScale = (height - 2 * padding) / latRange;

    const pathData = geoJSONToPath(
      norwayGeoJSON.geometry.coordinates,
      xScale,
      yScale,
      bounds.minLon,
      bounds.maxLat
    );

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full cursor-move"
        style={{ maxHeight: '500px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Map outline */}
          <path
            d={pathData}
            fill="rgba(0, 71, 178, 0.15)"
            stroke="rgba(0, 71, 178, 1)"
            strokeWidth="1.5"
          />
          
          {/* City markers */}
          {cities.map((city) => {
            const baseX = (city.coordinates[0] - bounds.minLon) * xScale;
            const baseY = (bounds.maxLat - city.coordinates[1]) * yScale;
            
            // Dynamic marker size based on violation count
            const maxViolationsForSizing = maxViolations || Math.max(...cities.map(c => c.value), 1);
            const sizeRatio = Math.max(0.3, city.value / maxViolationsForSizing);
            const markerSize = 15 + (sizeRatio * 25); // Size between 15 and 40
            
            // Color based on violation intensity
            const getMarkerColor = (count: number) => {
              const intensity = count / maxViolationsForSizing;
              if (intensity <= 0.25) return '#fbbf24'; // amber-400
              if (intensity <= 0.5) return '#fb923c'; // orange-400  
              if (intensity <= 0.75) return '#f87171'; // red-400
              return '#dc2626'; // red-600
            };
            
            // Apply marker offset to prevent overlapping
            const markerOffset = markerOffsets[city.name] || { mx: 0, my: 0 };
            const x = baseX + markerOffset.mx;
            const y = baseY + markerOffset.my;
            
            const labelOffset = labelOffsets[city.name] || { dx: 0, dy: 0, anchor: 'middle' };
            
            return (
              <g key={city.name}>
                {/* Marker circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={markerSize / 2}
                  fill={getMarkerColor(city.value)}
                  stroke="white"
                  strokeWidth="3"
                />
                {/* Value text inside marker */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {city.value}
                </text>
                
                {/* City name label with strong shadow for readability */}
                <text
                  x={x + labelOffset.dx}
                  y={y + labelOffset.dy}
                  textAnchor={labelOffset.anchor}
                  dominantBaseline="middle"
                  fill="#0c131d"
                  fontSize="12"
                  fontWeight="700"
                  pointerEvents="none"
                  style={{
                    textShadow: '0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 8px white',
                    paintOrder: 'stroke fill',
                    stroke: 'white',
                    strokeWidth: '3px',
                  }}
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
      <h2 className="text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 text-[#0c131d] dark:text-white">
        Norge – Tilsynskart
      </h2>
      
      {isLoading ? (
        <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Laster kart...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full flex justify-center bg-gray-100 dark:bg-gray-700/20 rounded-lg p-4 overflow-hidden relative">
            {/* Zoom controls overlay */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button
                onClick={() => setZoom(Math.min(zoom * 1.2, 5))}
                className="w-10 h-10 bg-white dark:bg-gray-800 text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center font-bold shadow-lg"
                title="Zoom inn"
              >
                +
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom / 1.2, 0.5))}
                className="w-10 h-10 bg-white dark:bg-gray-800 text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center font-bold shadow-lg"
                title="Zoom ut"
              >
                −
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="w-10 h-10 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-lg shadow-lg"
                title="Tilbakestill"
              >
                ⟲
              </button>
            </div>
            {renderMap()}
          </div>
          
          {/* Cities list */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-medium text-[#0c131d] dark:text-white pb-3">
              Antall brudd per by
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {cities.map((city) => (
                <div
                  key={city.name}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {city.name}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {city.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}