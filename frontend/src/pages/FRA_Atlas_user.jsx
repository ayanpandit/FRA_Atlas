import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, 
  MapPin, 
  Layers, 
  Satellite, 
  Navigation, 
  ZoomIn, 
  ZoomOut,
  Maximize,
  Download,
  Share2,
  Filter,
  Search,
  TreePine,
  Mountain,
  Home,
  Users,
  Target,
  Info,
  Settings,
  Globe,
  Compass,
  Camera,
  FileText,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Square,
  Droplet
} from 'lucide-react';

const FRAAtlas_user = ({ userData }) => {
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [mapMode, setMapMode] = useState('3d'); // '2d' or '3d'
  const [cesiumViewer, setCesiumViewer] = useState(null);
  const [layers, setLayers] = useState({
    forest: null,
    water: null,
    population: null,
    boundaries: null
  });
  const [currentCoords, setCurrentCoords] = useState({ lat: 24.8356, lng: 79.9207 });
  const mapContainerRef = useRef(null);

  // Update coordinates when camera moves
  useEffect(() => {
    if (!cesiumViewer) return;

    const updateCoords = () => {
      const camera = cesiumViewer.camera;
      const cartographic = window.Cesium.Cartographic.fromCartesian(camera.position);
      const lat = window.Cesium.Math.toDegrees(cartographic.latitude);
      const lng = window.Cesium.Math.toDegrees(cartographic.longitude);
      setCurrentCoords({ lat: lat.toFixed(4), lng: lng.toFixed(4) });
    };

    cesiumViewer.camera.changed.addEventListener(updateCoords);
    updateCoords(); // Initial update

    return () => {
      if (cesiumViewer.camera) {
        cesiumViewer.camera.changed.removeEventListener(updateCoords);
      }
    };
  }, [cesiumViewer]);

  useEffect(() => {
    let viewerInstance = null;

    // Load Cesium scripts and styles
    const loadCesium = async () => {
      if (window.Cesium) return;

      // Load Cesium CSS
      const cesiumCss = document.createElement('link');
      cesiumCss.href = 'https://cesium.com/downloads/cesiumjs/releases/1.95/Build/Cesium/Widgets/widgets.css';
      cesiumCss.rel = 'stylesheet';
      document.head.appendChild(cesiumCss);

      // Load Cesium JS
      const cesiumScript = document.createElement('script');
      cesiumScript.src = 'https://cesium.com/downloads/cesiumjs/releases/1.95/Build/Cesium/Cesium.js';
      cesiumScript.async = true;

      return new Promise((resolve) => {
        cesiumScript.onload = resolve;
        document.head.appendChild(cesiumScript);
      });
    };

    const initializeViewer = () => {
      if (!window.Cesium || !mapContainerRef.current) return;

      window.Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1M2MwOWIwYi1lYzBhLTQwNDQtOGIyZC1jYTlkYjgyNmZlZmYiLCJpZCI6MzQ2MjAxLCJpYXQiOjE3NTkyOTE5Mjh9.bNfYxkNX-GHZ70ithbCBed672tbHg_JgYsTQdSa47fw';

      const viewer = new window.Cesium.Viewer(mapContainerRef.current, {
        terrainProvider: window.Cesium.createWorldTerrain(),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: true,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: true
      });

      // Show full globe by default in 3D and start gentle auto-rotation
      viewer.scene.morphTo3D(0);
      viewer.camera.setView({
        destination: window.Cesium.Cartesian3.fromDegrees(0, 0, 20000000)
      });

      viewer.clock.shouldAnimate = true;
      viewer.clock.multiplier = 1;

      const spinRate = window.Cesium.Math.toRadians(0.08);
      let spinActive = true;
      const onTick = () => {
        if (!spinActive) return;
        if (viewer.scene.mode !== window.Cesium.SceneMode.SCENE3D) return;
        const deltaSeconds = viewer.clock.deltaSeconds || 0.016;
        viewer.scene.camera.rotate(window.Cesium.Cartesian3.UNIT_Z, spinRate * deltaSeconds);
      };

      viewer.clock.onTick.addEventListener(onTick);

      const stopSpin = () => {
        if (!spinActive) return;
        spinActive = false;
        viewer.clock.onTick.removeEventListener(onTick);
        viewer.clock.shouldAnimate = false;
      };

      const interactionHandler = new window.Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      const interactionTypes = [
        window.Cesium.ScreenSpaceEventType.LEFT_DOWN,
        window.Cesium.ScreenSpaceEventType.RIGHT_DOWN,
        window.Cesium.ScreenSpaceEventType.MIDDLE_DOWN,
        window.Cesium.ScreenSpaceEventType.WHEEL,
        window.Cesium.ScreenSpaceEventType.PINCH_START,
        window.Cesium.ScreenSpaceEventType.MOUSE_MOVE
      ];

      const stopAndDestroy = () => {
        stopSpin();
        if (!interactionHandler.isDestroyed()) {
          interactionHandler.destroy();
        }
      };

      interactionTypes.forEach(type => {
        interactionHandler.setInputAction(stopAndDestroy, type);
      });

      viewer._autoRotateCleanup = () => {
        stopSpin();
        if (!interactionHandler.isDestroyed()) {
          interactionHandler.destroy();
        }
      };

      setCesiumViewer(viewer);
      viewerInstance = viewer;

      // Add user's land plots
      myLands.forEach(land => {
        viewer.entities.add({
          position: window.Cesium.Cartesian3.fromDegrees(land.coordinates.lng, land.coordinates.lat),
          point: {
            pixelSize: 12,
            color: window.Cesium.Color.fromCssColorString(land.color).withAlpha(0.8),
            outlineColor: window.Cesium.Color.WHITE,
            outlineWidth: 2
          },
          label: {
            text: land.name,
            font: '12px sans-serif',
            fillColor: window.Cesium.Color.WHITE,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new window.Cesium.Cartesian2(0, -20)
          }
        });
      });

      // Add nearby features
      nearbyFeatures.forEach(feature => {
        viewer.entities.add({
          position: window.Cesium.Cartesian3.fromDegrees(feature.coordinates.lng, feature.coordinates.lat),
          point: {
            pixelSize: 10,
            color: window.Cesium.Color.YELLOW.withAlpha(0.8),
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2
          },
          label: {
            text: feature.name,
            font: '11px sans-serif',
            fillColor: window.Cesium.Color.WHITE,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new window.Cesium.Cartesian2(0, -18)
          }
        });
      });
    };

    loadCesium().then(initializeViewer);

    return () => {
      if (viewerInstance) {
        if (viewerInstance._autoRotateCleanup) {
          viewerInstance._autoRotateCleanup();
        }
        viewerInstance.destroy();
      }
    };
  }, []);

  // Handle view mode changes with improved performance
  useEffect(() => {
    if (!cesiumViewer) return;

    const switchMode = async () => {
      try {
        if (mapMode === '3d') {
          cesiumViewer.scene.mode = window.Cesium.SceneMode.SCENE3D;
          // Ensure smooth transition to 3D
          cesiumViewer.scene.morphTo3D(0.0);
        } else {
          cesiumViewer.scene.mode = window.Cesium.SceneMode.SCENE2D;
          // Ensure smooth transition to 2D
          cesiumViewer.scene.morphTo2D(0.0);
          if (cesiumViewer._autoRotateCleanup) {
            cesiumViewer._autoRotateCleanup();
          }
        }
        // Force a render to ensure immediate visual feedback
        cesiumViewer.scene.requestRender();
      } catch (error) {
        console.warn('Error switching map mode:', error);
      }
    };

    switchMode();
  }, [mapMode, cesiumViewer]);

  const toggleForest = () => {
    if (!cesiumViewer) return;

    if (layers.forest) {
      cesiumViewer.imageryLayers.remove(layers.forest);
      setLayers(prev => ({ ...prev, forest: null }));
    } else {
      const forestLayer = cesiumViewer.imageryLayers.addImageryProvider(
        new window.Cesium.WebMapServiceImageryProvider({
          url: 'https://gis-treecover.wri.org/arcgis/services/TreeCover2000/ImageServer/WMSServer',
          layers: '0',
          parameters: {
            transparent: true,
            format: 'image/png'
          }
        })
      );
      forestLayer.alpha = 0.7;
      setLayers(prev => ({ ...prev, forest: forestLayer }));
    }
  };

  const toggleWater = () => {
    if (!cesiumViewer) return;

    if (layers.water) {
      // Remove water entities
      const entities = cesiumViewer.entities.values;
      entities.forEach(entity => {
        if (entity._waterEntity) {
          cesiumViewer.entities.remove(entity);
        }
      });
      setLayers(prev => ({ ...prev, water: null }));
    } else {
      // Add water bodies
      const waterBodies = [
        { name: 'Community Well', coords: [79.9195, 24.8315] },
        { name: 'Local River', coords: [79.9250, 24.8350] }
      ];

      waterBodies.forEach(water => {
        const entity = cesiumViewer.entities.add({
          position: window.Cesium.Cartesian3.fromDegrees(water.coords[0], water.coords[1]),
          point: {
            pixelSize: 12,
            color: window.Cesium.Color.CYAN.withAlpha(0.8),
            outlineColor: window.Cesium.Color.BLUE,
            outlineWidth: 2
          },
          label: {
            text: water.name,
            font: '12px sans-serif',
            fillColor: window.Cesium.Color.WHITE,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new window.Cesium.Cartesian2(0, -20)
          }
        });
        entity._waterEntity = true;
      });

      setLayers(prev => ({ ...prev, water: {} })); // Use empty object instead of true
    }
  };

  const togglePopulation = () => {
    if (!cesiumViewer) return;

    if (layers.population) {
      // Remove population entities
      const entities = cesiumViewer.entities.values;
      entities.forEach(entity => {
        if (entity._populationEntity) {
          cesiumViewer.entities.remove(entity);
        }
      });
      setLayers(prev => ({ ...prev, population: null }));
    } else {
      // Add population centers
      const populationCenters = [
        { name: 'Village Center', coords: [79.9207, 24.8356], size: 15 },
        { name: 'Nearby Settlement', coords: [79.9150, 24.8400], size: 10 }
      ];

      populationCenters.forEach(center => {
        const entity = cesiumViewer.entities.add({
          position: window.Cesium.Cartesian3.fromDegrees(center.coords[0], center.coords[1]),
          point: {
            pixelSize: center.size,
            color: window.Cesium.Color.ORANGE.withAlpha(0.8),
            outlineColor: window.Cesium.Color.DARKORANGE,
            outlineWidth: 2
          },
          label: {
            text: center.name,
            font: '11px sans-serif',
            fillColor: window.Cesium.Color.WHITE,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new window.Cesium.Cartesian2(0, -18)
          }
        });
        entity._populationEntity = true;
      });

      setLayers(prev => ({ ...prev, population: {} })); // Use empty object instead of true
    }
  };

  const toggleBoundaries = () => {
    if (!cesiumViewer) return;

    if (layers.boundaries) {
      // Remove boundary entities
      const entities = cesiumViewer.entities.values;
      entities.forEach(entity => {
        if (entity._boundaryEntity) {
          cesiumViewer.entities.remove(entity);
        }
      });
      setLayers(prev => ({ ...prev, boundaries: null }));
    } else {
      // Add administrative boundaries (simplified)
      const boundaries = [
        {
          name: 'District Boundary',
          coords: [
            [79.9000, 24.8200], [79.9400, 24.8200], [79.9400, 24.8500], [79.9000, 24.8500], [79.9000, 24.8200]
          ]
        }
      ];

      boundaries.forEach(boundary => {
        const positions = [];
        boundary.coords.forEach(coord => {
          positions.push(coord[0], coord[1]);
        });

        const entity = cesiumViewer.entities.add({
          name: boundary.name,
          polyline: {
            positions: window.Cesium.Cartesian3.fromDegreesArray(positions),
            width: 3,
            material: window.Cesium.Color.MAGENTA.withAlpha(0.8)
          }
        });
        entity._boundaryEntity = true;
      });

      setLayers(prev => ({ ...prev, boundaries: {} })); // Use empty object instead of true
    }
  };

  const mapLayers = [
    {
      id: 'satellite',
      name: 'Satellite View',
      description: 'High-resolution satellite imagery',
      icon: Satellite,
      enabled: true
    },
    {
      id: 'terrain',
      name: 'Terrain',
      description: 'Topographical features and elevation',
      icon: Mountain,
      enabled: false
    },
    {
      id: 'forest_cover',
      name: 'Forest Cover',
      description: 'Forest density and vegetation type',
      icon: TreePine,
      enabled: false
    },
    {
      id: 'water_bodies',
      name: 'Water Bodies',
      description: 'Rivers, lakes, and water sources',
      icon: Droplet,
      enabled: false
    },
    {
      id: 'settlements',
      name: 'Settlements',
      description: 'Villages and residential areas',
      icon: Home,
      enabled: false
    },
    {
      id: 'boundaries',
      name: 'Administrative Boundaries',
      description: 'District, block, and village boundaries',
      icon: Target,
      enabled: false
    }
  ];

  const myLands = [
    {
      id: 'FRA001',
      name: 'Main Residential Plot',
      area: '2.5 hectares',
      status: 'Verified',
      coordinates: { lat: 24.8318, lng: 79.9199 },
      color: '#10B981' // green
    },
    {
      id: 'FRA002',
      name: 'Agricultural Land North',
      area: '1.8 hectares',
      status: 'Pending',
      coordinates: { lat: 24.8405, lng: 79.9245 },
      color: '#F59E0B' // yellow
    },
    {
      id: 'FRA003',
      name: 'Community Forest Rights',
      area: '3.2 hectares',
      status: 'Approved',
      coordinates: { lat: 24.8392, lng: 79.9178 },
      color: '#3B82F6' // blue
    }
  ];

  const nearbyFeatures = [
    {
      id: 1,
      name: 'Village Primary School',
      type: 'Education',
      distance: '0.5 km',
      icon: Users,
      coordinates: { lat: 24.8325, lng: 79.9205 }
    },
    {
      id: 2,
      name: 'Community Well',
      type: 'Water Source',
      distance: '0.3 km',
      icon: Droplet,
      coordinates: { lat: 24.8315, lng: 79.9195 }
    },
    {
      id: 3,
      name: 'Forest Check Post',
      type: 'Administrative',
      distance: '1.2 km',
      icon: TreePine,
      coordinates: { lat: 24.8380, lng: 79.9230 }
    },
    {
      id: 4,
      name: 'Village Temple',
      type: 'Religious',
      distance: '0.7 km',
      icon: Mountain,
      coordinates: { lat: 24.8335, lng: 79.9210 }
    }
  ];

  const measurements = [
    {
      label: 'Total Land Area',
      value: '7.5 hectares',
      subtext: 'Across 3 plots'
    },
    {
      label: 'Forest Coverage',
      value: '68%',
      subtext: 'Mixed deciduous forest'
    },
    {
      label: 'Nearest Water Source',
      value: '0.3 km',
      subtext: 'Community well'
    },
    {
      label: 'Village Distance',
      value: '0.8 km',
      subtext: 'To village center'
    }
  ];

  const LayerToggle = ({ layer }) => {
    const isEnabled = layers[layer.id] !== null;
    
    const handleToggle = () => {
      switch (layer.id) {
        case 'forest_cover':
          toggleForest();
          break;
        case 'water_bodies':
          toggleWater();
          break;
        case 'settlements':
          togglePopulation();
          break;
        case 'boundaries':
          toggleBoundaries();
          break;
        default:
          break;
      }
    };

    return (
      <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-800/30 transition-all duration-200 border border-gray-800/50 hover:border-gray-700/50 group">
        <div className="flex items-center space-x-3">
          <layer.icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
          <div>
            <p className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">{layer.name}</p>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{layer.description}</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 shadow-lg ${
            isEnabled ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/30' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-md ${
              isEnabled ? 'translate-x-6 scale-110' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    );
  };

  const LandPlot = ({ land }) => (
    <div 
      className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-800/40 transition-all duration-200 cursor-pointer border border-gray-800/50 hover:border-gray-700/50 hover:shadow-lg"
      onClick={() => setSelectedFeature(land)}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-5 h-5 rounded-full shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: land.color }}
        ></div>
        <div>
          <p className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">{land.name}</p>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{land.area}</span>
            <span className="text-gray-600">•</span>
            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
              land.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' :
              land.status === 'Approved' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {land.status}
            </span>
          </div>
        </div>
      </div>
      <MapPin className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight">FRA Atlas</h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed">Interactive 3D/2D map visualization of your forest rights and surrounding areas with real-time layer controls</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            <Download className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm sm:text-base">Export Map</span>
          </button>
          <button className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm sm:text-base">Share Location</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800/50 overflow-hidden" style={{ height: '70vh', minHeight: '500px', maxHeight: '800px' }}>
        {/* Sidebar */}
        <div className={`absolute top-0 left-0 h-full bg-black/80 backdrop-blur-xl border-r border-gray-700/50 z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-56 sm:w-64' : 'w-16'
        }`}>
          {/* Sidebar Header */}
          <div className="p-4 sm:p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-white text-lg ${sidebarOpen ? 'block' : 'hidden'}`}>
                Map Controls
              </h3>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {sidebarOpen && (
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
              {/* View Controls */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-base sm:text-lg">View Mode</h4>
                <div className="flex bg-gray-800/50 rounded-xl p-1.5 backdrop-blur-sm">
                  <button
                    onClick={() => setMapMode('2d')}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      mapMode === '2d' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    2D
                  </button>
                  <button
                    onClick={() => setMapMode('3d')}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      mapMode === '3d' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    3D
                  </button>
                </div>
              </div>

              {/* Map Layers */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-base sm:text-lg">Map Layers</h4>
                <div className="space-y-3">
                  {mapLayers.map((layer) => (
                    <LayerToggle key={layer.id} layer={layer} />
                  ))}
                </div>
              </div>

              {/* My Lands */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-base sm:text-lg">My Lands</h4>
                <div className="space-y-3">
                  {myLands.map((land) => (
                    <LandPlot key={land.id} land={land} />
                  ))}
                </div>
              </div>

              {/* Nearby Features */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-base sm:text-lg">Nearby Features</h4>
                <div className="space-y-3">
                  {nearbyFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-800/40 transition-all duration-200 cursor-pointer border border-gray-800/50 hover:border-gray-700/50 hover:shadow-lg"
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <div className="flex items-center space-x-3">
                        <feature.icon className="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                        <div>
                          <p className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors">{feature.name}</p>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors bg-gray-800/50 px-2 py-0.5 rounded-full">{feature.type}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.distance}</span>
                          </div>
                        </div>
                      </div>
                      <MapPin className="h-4 w-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Area */}
  <div className={`h-full ${sidebarOpen ? 'ml-56 sm:ml-64' : 'ml-16'} transition-all duration-300 relative z-20`}>
          {/* Cesium Map Container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full"
            style={{ position: 'relative' }}
          ></div>

          {/* Map Controls - Positioned to avoid overlap */}
          <div className="absolute top-4 right-4 z-50 space-y-3">
            <div className="bg-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 p-2">
              <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 block w-full hover:scale-110">
                <Compass className="h-5 w-5" />
              </button>
              <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 block w-full hover:scale-110">
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="absolute bottom-4 left-4 z-40 bg-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 p-4">
            <div className="text-sm">
              <p className="text-gray-400 font-medium mb-1">Live Coordinates:</p>
              <p className="font-mono text-emerald-400 font-bold">{currentCoords.lat}° N, {currentCoords.lng}° E</p>
            </div>
          </div>

          {/* Scale Indicator */}
          <div className="absolute bottom-4 right-4 z-40 bg-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 p-4">
            <div className="text-sm">
              <p className="text-gray-400 font-medium mb-2">Scale: 1:10,000</p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
                <span className="text-xs text-gray-300 font-medium">100m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {measurements.map((measurement, index) => (
          <div key={index} className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-6 sm:p-8 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/20">
            <div className="text-center space-y-2">
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all">{measurement.value}</p>
              <p className="text-sm sm:text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">{measurement.label}</p>
              <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{measurement.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Tools */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Analysis Tools</h3>
          </div>
          <div className="space-y-3">
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-800/50 hover:border-blue-500/50 hover:scale-105">
              <Compass className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">Measure Distance</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Calculate distances between points</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-800/50 hover:border-blue-500/50 hover:scale-105">
              <Target className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">Area Calculator</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Calculate area of selected regions</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-800/50 hover:border-blue-500/50 hover:scale-105">
              <TreePine className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">Forest Density</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Analyze vegetation coverage</p>
              </div>
            </button>
          </div>
        </div>

        {/* GPS Tools */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-6 hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <Navigation className="h-6 w-6 text-emerald-400" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">GPS Tools</h3>
          </div>
          <div className="space-y-3">
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-800/50 hover:border-emerald-500/50 hover:scale-105">
              <MapPin className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">Add Waypoint</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Mark important locations</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-800/50 hover:border-emerald-500/50 hover:scale-105">
              <Globe className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">Current Location</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Navigate to your position</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-800/50 hover:border-emerald-500/50 hover:scale-105">
              <Download className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">Export GPX</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Download GPS data</p>
              </div>
            </button>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <Camera className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Documentation</h3>
          </div>
          <div className="space-y-3">
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-800/50 hover:border-purple-500/50 hover:scale-105">
              <Camera className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-purple-400 transition-colors">Geotagged Photos</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Capture location-based images</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-800/50 hover:border-purple-500/50 hover:scale-105">
              <FileText className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-purple-400 transition-colors">Survey Notes</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Add field observations</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-800/50 hover:border-purple-500/50 hover:scale-105">
              <Share2 className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-purple-400 transition-colors">Share Report</p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Generate location report</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Land Details Panel */}
      {selectedFeature && (
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                {selectedFeature.name || selectedFeature.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {selectedFeature.area && <span className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full">Area: {selectedFeature.area}</span>}
                {selectedFeature.distance && <span className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full">Distance: {selectedFeature.distance}</span>}
                {selectedFeature.type && <span className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full">Type: {selectedFeature.type}</span>}
                {selectedFeature.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    selectedFeature.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    selectedFeature.status === 'Approved' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {selectedFeature.status}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Details */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">
              <h4 className="font-semibold text-white mb-4 text-lg">Details</h4>
              <div className="space-y-3 text-sm">
                {selectedFeature.coordinates && (
                  <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400 font-medium">Coordinates:</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {selectedFeature.coordinates.lat.toFixed(4)}°, {selectedFeature.coordinates.lng.toFixed(4)}°
                    </span>
                  </div>
                )}
                {selectedFeature.id && (
                  <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400 font-medium">ID:</span>
                    <span className="text-emerald-400 font-bold">{selectedFeature.id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">
              <h4 className="font-semibold text-white mb-4 text-lg">Actions</h4>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-semibold hover:scale-105 shadow-lg hover:shadow-blue-500/30">
                  <Navigation className="h-4 w-4" />
                  <span>Navigate Here</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 text-sm font-semibold hover:scale-105 shadow-lg hover:shadow-emerald-500/30">
                  <Share2 className="h-4 w-4" />
                  <span>Share Location</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:text-white hover:border-gray-500/50 transition-all duration-200 text-sm font-semibold hover:scale-105">
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-6 sm:p-8">
        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-6">Map Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-200">
            <div className="w-5 h-5 bg-emerald-500 rounded-lg border-2 border-emerald-400 shadow-lg group-hover:scale-110 transition-transform"></div>
            <span className="text-sm text-gray-300 group-hover:text-white font-medium">Verified Forest Rights</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-200">
            <div className="w-5 h-5 bg-yellow-500 rounded-lg border-2 border-yellow-400 shadow-lg group-hover:scale-110 transition-transform"></div>
            <span className="text-sm text-gray-300 group-hover:text-white font-medium">Pending Verification</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-200">
            <div className="w-5 h-5 bg-blue-500 rounded-lg border-2 border-blue-400 shadow-lg group-hover:scale-110 transition-transform"></div>
            <span className="text-sm text-gray-300 group-hover:text-white font-medium">Community Rights</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-200">
            <div className="w-5 h-5 bg-gray-400 rounded-lg border-2 border-gray-300 shadow-lg group-hover:scale-110 transition-transform"></div>
            <span className="text-sm text-gray-300 group-hover:text-white font-medium">Government Land</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-200">
            <TreePine className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-all" />
            <span className="text-sm text-gray-300 group-hover:text-white font-medium">Dense Forest</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-200">
            <Droplet className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all" />
            <span className="text-sm text-gray-300 group-hover:text-white font-medium">Water Bodies</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-200">
            <Home className="h-5 w-5 text-orange-400 group-hover:text-orange-300 group-hover:scale-110 transition-all" />
            <span className="text-sm text-gray-300 group-hover:text-white font-medium">Settlements</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all duration-200">
            <Mountain className="h-5 w-5 text-gray-400 group-hover:text-gray-300 group-hover:scale-110 transition-all" />
            <span className="text-sm text-gray-300 group-hover:text-white font-medium">Hills & Elevation</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default FRAAtlas_user;