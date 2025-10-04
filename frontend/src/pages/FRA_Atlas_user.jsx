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
  Droplet,
  X
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
      className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-teal-500/40 transform hover:scale-105"
      onClick={() => setSelectedFeature(land)}
      style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'}}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-5 h-5 rounded-full ring-2 ring-gray-300 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: land.color, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)' }}
        ></div>
        <div>
          <p className="font-semibold text-gray-900 text-sm group-hover:text-teal-700 transition-colors">{land.name}</p>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-600 group-hover:text-gray-700 transition-colors">{land.area}</span>
            <span className="text-gray-400">•</span>
            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
              land.status === 'Verified' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
              land.status === 'Approved' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
              {land.status}
            </span>
          </div>
        </div>
      </div>
      <MapPin className="h-4 w-4 text-gray-500 group-hover:text-teal-700 transition-colors" />
    </div>
  );

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@728&display=swap');
        .alan-sans {
          font-family: "Alan Sans", sans-serif;
          font-optical-sizing: auto;
          font-weight: 728;
          font-style: normal;
        }`}
      </style>
    <div className="min-h-screen bg-gray-50 text-gray-900 alan-sans">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">FRA Atlas</h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl leading-relaxed">Interactive map visualization of your forest rights and surrounding areas with real-time layer controls and satellite imagery</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button className="group flex items-center justify-center space-x-2 px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
            <Download className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm sm:text-base">Export Map</span>
          </button>
          <button className="group flex items-center justify-center space-x-2 px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm sm:text-base">Share Location</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-white rounded-3xl border-2 border-gray-200/50 overflow-hidden transform hover:scale-[1.005] transition-all duration-500" style={{ height: '70vh', minHeight: '500px', maxHeight: '800px', boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {/* Sidebar */}
        <div className={`absolute top-0 left-0 h-full bg-white/95 backdrop-blur-xl border-r border-gray-200 z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-56 sm:w-64' : 'w-16'
        }`} style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'}}>
          {/* Sidebar Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold text-gray-900 text-lg ${sidebarOpen ? 'block' : 'hidden'}`}>
                Map Controls
              </h3>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {sidebarOpen && (
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
              {/* Base Map Layer Selector */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">Base Map</h4>
                <select 
                  value={activeLayer}
                  onChange={(e) => {
                    setActiveLayer(e.target.value);
                    if (!leafletMap) return;
                    
                    const layers = {
                      satellite: window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Esri',
                        maxZoom: 19
                      }),
                      street: window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: 'OpenStreetMap',
                        maxZoom: 19
                      }),
                      terrain: window.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                        attribution: 'OpenTopoMap',
                        maxZoom: 17
                      })
                    };
                    
                    leafletMap.eachLayer((layer) => {
                      if (layer instanceof window.L.TileLayer) {
                        leafletMap.removeLayer(layer);
                      }
                    });
                    layers[e.target.value].addTo(leafletMap);
                  }}
                  className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium" 
                  style={{boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'}}
                >
                  <option value="satellite">🛰️ Satellite View</option>
                  <option value="street">🗺️ Street Map</option>
                  <option value="terrain">🏔️ Terrain Map</option>
                </select>
              </div>

              {/* Map Layers */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">Data Layers</h4>
                <div className="space-y-3">
                  {mapLayers.map((layer) => (
                    <LayerToggle key={layer.id} layer={layer} />
                  ))}
                </div>
              </div>

              {/* My Lands */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">My Lands</h4>
                <div className="space-y-3">
                  {myLands.map((land) => (
                    <LandPlot key={land.id} land={land} />
                  ))}
                </div>
              </div>

              {/* Nearby Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">Nearby Features</h4>
                <div className="space-y-3">
                  {nearbyFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-teal-500/40 transform hover:scale-105"
                      onClick={() => setSelectedFeature(feature)}
                      style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'}}
                    >
                      <div className="flex items-center space-x-3">
                        <feature.icon className="h-5 w-5 text-gray-600 group-hover:text-teal-700 transition-colors" />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-teal-700 transition-colors">{feature.name}</p>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-gray-600 group-hover:text-gray-700 transition-colors bg-gray-100 px-2 py-0.5 rounded-full">{feature.type}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 group-hover:text-gray-700 transition-colors">{feature.distance}</span>
                          </div>
                        </div>
                      </div>
                      <MapPin className="h-4 w-4 text-gray-500 group-hover:text-teal-700 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Area */}
  <div className={`h-full ${sidebarOpen ? 'ml-56 sm:ml-64' : 'ml-16'} transition-all duration-300 relative z-20`}>
          {/* Leaflet Map Container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full bg-gray-100"
            style={{ position: 'relative', minHeight: '500px' }}
          ></div>

          {/* Map Controls - Positioned to avoid overlap */}
          <div className="absolute top-4 right-4 z-50 space-y-3">
            <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 p-2" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'}}>
              <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 block w-full hover:scale-110">
                <Compass className="h-5 w-5" />
              </button>
              <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 block w-full hover:scale-110">
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="absolute bottom-4 left-4 z-40 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 p-4" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'}}>
            <div className="text-sm">
              <p className="text-gray-600 font-medium mb-1">Live Coordinates:</p>
              <p className="font-mono text-teal-700 font-bold">{currentCoords.lat}° N, {currentCoords.lng}° E</p>
            </div>
          </div>

          {/* Scale Indicator */}
          <div className="absolute bottom-4 right-4 z-40 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 p-4" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'}}>
            <div className="text-sm">
              <p className="text-gray-600 font-medium mb-2">Scale: 1:10,000</p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-teal-700"></div>
                <span className="text-xs text-gray-700 font-medium">100m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {measurements.map((measurement, index) => (
          <div key={index} className="group bg-white rounded-2xl border-2 border-gray-200/50 p-6 sm:p-8 hover:border-teal-500/40 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="text-center space-y-2">
              <p className="text-2xl sm:text-3xl font-bold text-teal-700 group-hover:text-teal-800 transition-all">{measurement.value}</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{measurement.label}</p>
              <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors">{measurement.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Tools */}
        <div className="bg-white rounded-2xl border-2 border-gray-200/50 p-6 hover:border-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(59, 130, 246, 0.3)'}}>
              <BarChart3 className="h-5 w-5 text-blue-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Analysis Tools</h3>
          </div>
          <div className="space-y-3">
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-blue-500/50 transform hover:scale-105">
              <Compass className="h-5 w-5 text-gray-600 group-hover:text-blue-700 transition-colors" />
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">Measure Distance</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Calculate distances between points</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-blue-500/50 transform hover:scale-105">
              <Target className="h-5 w-5 text-gray-600 group-hover:text-blue-700 transition-colors" />
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">Area Calculator</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Calculate area of selected regions</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-blue-500/50 transform hover:scale-105">
              <TreePine className="h-5 w-5 text-gray-600 group-hover:text-blue-700 transition-colors" />
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">Forest Density</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Analyze vegetation coverage</p>
              </div>
            </button>
          </div>
        </div>

        {/* GPS Tools */}
        <div className="bg-white rounded-2xl border-2 border-gray-200/50 p-6 hover:border-teal-500/40 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(20, 184, 166, 0.3)'}}>
              <Navigation className="h-5 w-5 text-teal-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">GPS Tools</h3>
          </div>
          <div className="space-y-3">
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-teal-500/50 transform hover:scale-105">
              <MapPin className="h-5 w-5 text-gray-600 group-hover:text-teal-700 transition-colors" />
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-teal-700 transition-colors">Add Waypoint</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Mark important locations</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-teal-500/50 transform hover:scale-105">
              <Globe className="h-5 w-5 text-gray-600 group-hover:text-teal-700 transition-colors" />
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-teal-700 transition-colors">Current Location</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Navigate to your position</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-teal-500/50 transform hover:scale-105">
              <Download className="h-5 w-5 text-gray-600 group-hover:text-teal-700 transition-colors" />
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-teal-700 transition-colors">Export GPX</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Download GPS data</p>
              </div>
            </button>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-2xl border-2 border-gray-200/50 p-6 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(168, 85, 247, 0.3)'}}>
              <Camera className="h-5 w-5 text-purple-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
          </div>
          <div className="space-y-3">
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-purple-500/50 transform hover:scale-105">
              <Camera className="h-5 w-5 text-gray-600 group-hover:text-purple-700 transition-colors" />
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">Geotagged Photos</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Capture location-based images</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-purple-500/50 transform hover:scale-105">
              <FileText className="h-5 w-5 text-gray-600 group-hover:text-purple-700 transition-colors" />
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">Survey Notes</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Add field observations</p>
              </div>
            </button>
            <button className="group w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-purple-500/50 transform hover:scale-105">
              <Share2 className="h-5 w-5 text-gray-600 group-hover:text-purple-700 transition-colors" />
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">Share Report</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Generate location report</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Land Details Panel */}
      {selectedFeature && (
        <div className="bg-white rounded-2xl border-2 border-gray-200/50 p-6 sm:p-8 transform hover:scale-[1.005] transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                {selectedFeature.name || selectedFeature.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {selectedFeature.area && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">Area: {selectedFeature.area}</span>}
                {selectedFeature.distance && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">Distance: {selectedFeature.distance}</span>}
                {selectedFeature.type && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">Type: {selectedFeature.type}</span>}
                {selectedFeature.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    selectedFeature.status === 'Verified' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    selectedFeature.status === 'Approved' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}>
                    {selectedFeature.status}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Details */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'}}>
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Details</h4>
              <div className="space-y-3 text-sm">
                {selectedFeature.coordinates && (
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">Coordinates:</span>
                    <span className="font-mono text-teal-700 font-bold">
                      {selectedFeature.coordinates.lat.toFixed(4)}°, {selectedFeature.coordinates.lng.toFixed(4)}°
                    </span>
                  </div>
                )}
                {selectedFeature.id && (
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">ID:</span>
                    <span className="text-teal-700 font-bold">{selectedFeature.id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'}}>
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Actions</h4>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-800 text-white rounded-xl hover:bg-teal-900 transition-all duration-200 text-sm font-semibold transform hover:scale-105">
                  <Navigation className="h-4 w-4" />
                  <span>Navigate Here</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-800 text-white rounded-xl hover:bg-teal-900 transition-all duration-200 text-sm font-semibold transform hover:scale-105">
                  <Share2 className="h-4 w-4" />
                  <span>Share Location</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 transition-all duration-200 text-sm font-semibold transform hover:scale-105">
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="bg-white rounded-2xl border-2 border-gray-200/50 p-6 sm:p-8 transform hover:scale-[1.005] transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Map Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <div className="w-5 h-5 bg-emerald-500 rounded-lg border-2 border-emerald-400 group-hover:scale-110 transition-transform" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(52, 211, 153, 0.3)'}}></div>
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">Verified Forest Rights</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <div className="w-5 h-5 bg-yellow-500 rounded-lg border-2 border-yellow-400 group-hover:scale-110 transition-transform" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(245, 158, 11, 0.3)'}}></div>
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">Pending Verification</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <div className="w-5 h-5 bg-blue-500 rounded-lg border-2 border-blue-400 group-hover:scale-110 transition-transform" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(59, 130, 246, 0.3)'}}></div>
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">Community Rights</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <div className="w-5 h-5 bg-gray-400 rounded-lg border-2 border-gray-300 group-hover:scale-110 transition-transform" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(156, 163, 175, 0.3)'}}></div>
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">Government Land</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <TreePine className="h-5 w-5 text-emerald-600 group-hover:text-emerald-700 group-hover:scale-110 transition-all" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">Dense Forest</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <Droplet className="h-5 w-5 text-cyan-600 group-hover:text-cyan-700 group-hover:scale-110 transition-all" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">Water Bodies</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <Home className="h-5 w-5 text-orange-600 group-hover:text-orange-700 group-hover:scale-110 transition-all" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">Settlements</span>
          </div>
          <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <Mountain className="h-5 w-5 text-gray-600 group-hover:text-gray-700 group-hover:scale-110 transition-all" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">Hills & Elevation</span>
          </div>
        </div>
      </div>
    </div>
    </div>
    </>
  );
};

export default FRAAtlas_user;