import React, { useState, useCallback, Suspense } from 'react';
import HouseCanvas from './components/HouseCanvas';
import HouseForm from './components/HouseForm';
import Calculations from './components/Calculations';
import ExportOptions from './components/ExportOptions';

/**
 * Main App Component
 * 
 * This is the root component of the 3D Home Planner application.
 * It manages the state for all house configuration options and 
 * coordinates the form inputs with the 3D visualization.
 * 
 * @returns {JSX.Element} The main application component
 */
function App() {
  // House configuration state - contains all user inputs
  const [houseConfig, setHouseConfig] = useState({
    // Plot dimensions (in meters)
    plotLength: 12,
    plotWidth: 10,
    
    // Number of floors
    floors: 1,
    
    // Rooms count
    bedrooms: 2,
    bathrooms: 2,
    
    // Kitchen type: 'open' or 'closed'
    kitchenType: 'closed',
    
    // Room sizes (in sq meters - calculated from dimensions)
    livingRoomSize: 25,
    diningRoomSize: 15,
    
    // Bathroom dimensions (in meters)
    bathroomDepth: 2.5,
    bathroomWidth: 2,
    
    // Optional features
    hasBalcony: false,
    hasGarage: false,
    
    // Optional rooms
    hasStudy: false,
    hasUtility: false,
    hasStorage: false,
    
    // Structural options
    wallHeight: 3, // meters per floor
    roofType: 'flat', // 'flat', 'sloped', 'gabled'
    
    // Design options
    floorMaterial: 'tiles',
    wallColor: '#f5f5dc',
    wallMaterial: 'paint',
  });

  // Alert messages for unrealistic dimensions
  const [alerts, setAlerts] = useState([]);

  /**
   * Update a single configuration value
   * @param {string} field - The field name to update
   * @param {any} value - The new value
   */
  const updateConfig = useCallback((field, value) => {
    setHouseConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * Validate dimensions and update alerts
   * Called whenever configuration changes
   */
  React.useEffect(() => {
    const newAlerts = [];
    
    // Check plot size
    if (houseConfig.plotLength > 30 || houseConfig.plotWidth > 30) {
      newAlerts.push('Plot dimensions are unusually large. Maximum recommended is 30m x 30m.');
    }
    
    // Check room to plot ratio
    const totalRoomArea = 
      houseConfig.livingRoomSize + 
      houseConfig.diningRoomSize + 
      (houseConfig.bedrooms * 15) + 
      (houseConfig.bathrooms * 5);
    
    const plotArea = houseConfig.plotLength * houseConfig.plotWidth;
    const floorArea = plotArea * houseConfig.floors;
    
    if (totalRoomArea > floorArea * 0.7) {
      newAlerts.push('Total room area exceeds 70% of floor area. Consider adjusting room sizes.');
    }
    
    // Check wall height
    if (houseConfig.wallHeight > 4) {
      newAlerts.push('Wall height above 4m may require additional structural support.');
    }
    
    // Check bedroom count vs plot size
    if (houseConfig.bedrooms > Math.floor(plotArea / 10)) {
      newAlerts.push('Number of bedrooms may be too large for the plot size.');
    }
    
    setAlerts(newAlerts);
  }, [houseConfig]);

  /**
   * Calculate area metrics
   */
  const getCalculations = useCallback(() => {
    const plotArea = houseConfig.plotLength * houseConfig.plotWidth;
    const floorArea = plotArea * 0.85; // Assuming 15% for walls
    const carpetArea = floorArea * 0.8; // Assuming 20% for walls
    const totalArea = floorArea * houseConfig.floors;
    
    return {
      builtUpArea: totalArea,
      carpetArea: carpetArea * houseConfig.floors,
      perFloorArea: floorArea,
      plotArea: plotArea
    };
  }, [houseConfig]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🏠</span>
            3D Home Planner
          </h1>
          <p className="text-slate-500 mt-1">
            Design your dream house with real-time 3D visualization
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel - Form Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* House Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <HouseForm 
                config={houseConfig} 
                updateConfig={updateConfig} 
              />
            </div>

            {/* Calculations Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Calculations calculations={getCalculations()} />
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-800 mb-2">⚠️ Design Alerts</h3>
                <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                  {alerts.map((alert, index) => (
                    <li key={index}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Export Options */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ExportOptions config={houseConfig} />
            </div>
          </div>

          {/* Right Panel - 3D Visualization */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span>🎮</span> 3D Visualization
                </h2>
                <p className="text-slate-300 text-sm">
                  Drag to rotate • Scroll to zoom • Right-click to pan
                </p>
              </div>
              
              {/* 3D Canvas */}
              <div className="canvas-container h-[600px]">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-slate-500">Loading 3D Model...</p>
                    </div>
                  </div>
                }>
                  <HouseCanvas config={houseConfig} />
                </Suspense>
              </div>

              {/* View Controls */}
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('resetCamera'))}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <span>🔄</span> Reset View
                  </button>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('topView'))}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <span>⬆️</span> Top View
                  </button>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('frontView'))}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                  >
                    <span>📐</span> Front View
                  </button>
                </div>
              </div>
            </div>

            {/* Room Legend */}
            <div className="mt-4 bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-slate-700 mb-3">Room Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded room-living"></div>
                  <span className="text-sm text-slate-600">Living Room</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded room-bedroom"></div>
                  <span className="text-sm text-slate-600">Bedroom</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded room-bathroom"></div>
                  <span className="text-sm text-slate-600">Bathroom</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded room-kitchen"></div>
                  <span className="text-sm text-slate-600">Kitchen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded room-dining"></div>
                  <span className="text-sm text-slate-600">Dining</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded room-balcony"></div>
                  <span className="text-sm text-slate-600">Balcony</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded room-garage"></div>
                  <span className="text-sm text-slate-600">Garage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 3D Home Planner • Built with React, Three.js & TailwindCSS</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

