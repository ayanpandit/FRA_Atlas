import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Default export a React component for Vite + React + Tailwind projects
// Component: VillageDirectory
// Features:
// - State -> District -> Subdistrict -> Village cascading selectors
// - Fetches administrative lists from LGD webservices (official) with graceful fallback
// - Displays village table with basic info and client-side search
// - Interactive Leaflet map showing district/village boundaries (GeoJSON) and village markers
// - Popups show village details; export CSV option; loading & error states
// - Works out-of-the-box but may need a light backend/proxy if LGD endpoints block CORS

// NOTE for integrators (short):
// - Install dependencies: react-leaflet, leaflet
//   npm i react-leaflet leaflet
// - Ensure Tailwind is configured in your Vite + React project
// - Add Leaflet CSS import in your main CSS or index.html (already imported above)
// - If LGD API responds with CORS issue, use a small backend proxy or host a cached JSON.

// Helper: simple CSV export
function downloadCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]);
  const csv = [header.join(',')].concat(
    rows.map(r => header.map(h => JSON.stringify(r[h] ?? '')).join(','))
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Small map helper to fit bounds when geojson changes
function FitBounds({ geoJson }) {
  const map = useMap();
  useEffect(() => {
    if (!geoJson) return;
    try {
      const layer = L.geoJSON(geoJson);
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
    } catch (e) {
      // ignore
    }
  }, [geoJson, map]);
  return null;
}

export default function VillageDirectory({
  // Optional props
  lgdBaseUrl = 'https://lgdirectory.gov.in/webservices',
  // Optional preloaded geojson base (datameet github raw is used as default fallback)
  geojsonBase = 'https://raw.githubusercontent.com/datameet/india-geojson/master/dist',
  // Optional FRA dataset (array) to mark which villages have FRA info: [{stateCode, districtCode, villageCode, fraSummary: {...}}]
  fraData = [],
}) {
  // UI states
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState(null);

  const [mapGeoJSON, setMapGeoJSON] = useState(null); // current displayed boundary GeoJSON
  const [villageMarkers, setVillageMarkers] = useState([]);

  const [loading, setLoading] = useState({ states: false, districts: false, villages: false, geojson: false });
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVillages, setFilteredVillages] = useState([]);

  // =============================================================================
  // Fetch States (LGD)
  // =============================================================================
  useEffect(() => {
    let mounted = true;
    async function fetchStates() {
      setLoading(l => ({ ...l, states: true }));
      setError(null);
      try {
        // LGD state list endpoint
        const url = `${lgdBaseUrl}/stateList?format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('LGD states fetch failed');
        const data = await res.json();
        // Data format: array of {stateCode, stateName}
        if (mounted) setStates(data);
      } catch (e) {
        // fallback: small curated list or static fetch from GitHub
        console.warn('State fetch failed, using fallback data', e);
        const fallback = [
          { stateCode: '01', stateName: 'Jammu & Kashmir' },
          { stateCode: '02', stateName: 'Himachal Pradesh' },
          { stateCode: '09', stateName: 'Madhya Pradesh' },
          { stateCode: '21', stateName: 'Odisha' },
          { stateCode: '36', stateName: 'Telangana' },
          // note: use full LGD list in production
        ];
        if (mounted) setStates(fallback);
        setError('Unable to fetch remote states; using fallback subset. Consider using a proxy if CORS blocks requests.');
      } finally {
        if (mounted) setLoading(l => ({ ...l, states: false }));
      }
    }
    fetchStates();
    return () => { mounted = false; };
  }, [lgdBaseUrl]);

  // =============================================================================
  // Fetch Districts when state changes
  // =============================================================================
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSubdistricts([]);
      setVillages([]);
      setMapGeoJSON(null);
      return;
    }
    let mounted = true;
    async function fetchDistricts() {
      setLoading(l => ({ ...l, districts: true }));
      setError(null);
      try {
        const url = `${lgdBaseUrl}/districtList?stateCode=${selectedState}&format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('LGD districts fetch failed');
        const data = await res.json();
        if (mounted) setDistricts(data);
      } catch (e) {
        console.warn('District fetch failed, using fallback', e);
        setError('Unable to fetch districts from LGD. Using empty list.');
        if (mounted) setDistricts([]);
      } finally {
        if (mounted) setLoading(l => ({ ...l, districts: false }));
      }
    }
    fetchDistricts();
    return () => { mounted = false; };
  }, [selectedState, lgdBaseUrl]);

  // =============================================================================
  // Fetch Subdistricts when district changes
  // =============================================================================
  useEffect(() => {
    if (!selectedDistrict) {
      setSubdistricts([]);
      setVillages([]);
      setMapGeoJSON(null);
      return;
    }
    let mounted = true;
    async function fetchSubdistricts() {
      setLoading(l => ({ ...l, villages: true }));
      setError(null);
      try {
        const url = `${lgdBaseUrl}/subDistrictList?districtCode=${selectedDistrict}&format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('LGD subdistrict fetch failed');
        const data = await res.json();
        if (mounted) setSubdistricts(data);
      } catch (e) {
        console.warn('Subdistrict fetch failed', e);
        setError('Unable to fetch sub-districts from LGD.');
        if (mounted) setSubdistricts([]);
      } finally {
        if (mounted) setLoading(l => ({ ...l, villages: false }));
      }
    }
    fetchSubdistricts();
    return () => { mounted = false; };
  }, [selectedDistrict, lgdBaseUrl]);

  // =============================================================================
  // Fetch Villages when subdistrict changes
  // =============================================================================
  useEffect(() => {
    if (!selectedSubdistrict) {
      setVillages([]);
      setVillageMarkers([]);
      setMapGeoJSON(null);
      return;
    }
    let mounted = true;
    async function fetchVillages() {
      setLoading(l => ({ ...l, villages: true }));
      setError(null);
      try {
        const url = `${lgdBaseUrl}/villageList?subdistrictCode=${selectedSubdistrict}&format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('LGD village fetch failed');
        const data = await res.json();
        // standardize village object: {villageCode, villageName, ...}
        if (mounted) setVillages(data);

        // prepare markers: if LGD doesn't give coordinates, attempt to fetch centroid from datameet geojson
        // We'll attempt to load district GeoJSON and extract village centroids if available
        // For now, set simple marker list based on optional fields
        const markers = (data || []).map(v => ({
          id: v.villageCode || v.village_code || v.id || Math.random(),
          name: v.villageName || v.village_name || v.name,
          lat: v.latitude || v.lat || null,
          lon: v.longitude || v.lon || null,
          raw: v,
        }));
        if (mounted) setVillageMarkers(markers);

        // Try to load GeoJSON boundary for district (fallback to datameet)
        try {
          setLoading(l => ({ ...l, geojson: true }));
          // district geoms are organized by state codes in datameet repo: /dist/districts/<statecode>.geojson
          const geoUrl = `${geojsonBase}/districts/${selectedState}.geojson`;
          const gres = await fetch(geoUrl);
          if (gres.ok) {
            const gj = await gres.json();
            // find district feature by matching name or code
            const districtFeature = gj.features.find(f => {
              const props = f.properties || {};
              return (props && (String(props.DISTRICT_CODE || props.district_id || props.districtcd) === String(selectedDistrict)))
                || (props && (props.DISTRICT || props.NAME || props.district_name || '').toLowerCase().includes((districts.find(d=>d.districtCode===selectedDistrict)?.districtName||'').toLowerCase()));
            });
            if (districtFeature) {
              if (mounted) setMapGeoJSON(districtFeature);
            } else {
              // fallback: set the whole district file
              if (mounted) setMapGeoJSON(gj);
            }
          }
        } catch (errGeo) {
          console.warn('Failed to load geojson', errGeo);
        } finally {
          setLoading(l => ({ ...l, geojson: false }));
        }

      } catch (e) {
        console.warn('Village fetch failed', e);
        setError('Unable to fetch villages from LGD.');
        if (mounted) setVillages([]);
      } finally {
        if (mounted) setLoading(l => ({ ...l, villages: false }));
      }
    }
    fetchVillages();
    return () => { mounted = false; };
  }, [selectedSubdistrict, lgdBaseUrl, geojsonBase, selectedState, districts]);

  // =============================================================================
  // Filter villages based on search
  // =============================================================================
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredVillages(villages);
      return;
    }
    const filtered = villages.filter(v => (v.villageName || v.name || '').toLowerCase().includes(term) || (v.villageCode || '').toString().includes(term));
    setFilteredVillages(filtered);
  }, [searchTerm, villages]);

  // =============================================================================
  // Map markers enriched with FRA info if present
  // =============================================================================
  const enrichedMarkers = useMemo(() => {
    const mapFra = new Map();
    fraData.forEach(f => {
      const key = `${f.stateCode || ''}_${f.districtCode || ''}_${f.villageCode || ''}`;
      mapFra.set(key, f);
    });
    return villageMarkers.map(m => {
      const v = m.raw || {};
      const key = `${selectedState || v.stateCode || ''}_${selectedDistrict || v.districtCode || ''}_${v.villageCode || v.id || ''}`;
      return { ...m, fra: mapFra.get(key) || null };
    });
  }, [villageMarkers, fraData, selectedState, selectedDistrict]);

  // =============================================================================
  // UI Render
  // =============================================================================
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Village Directory</h1>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">State</label>
          <select className="mt-1 block w-full rounded" value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedSubdistrict(''); setVillages([]); }}>
            <option value="">-- Select State --</option>
            {states.map(s => (
              <option key={s.stateCode || s.code || s.id} value={s.stateCode || s.code || s.id}>{s.stateName || s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">District</label>
          <select className="mt-1 block w-full rounded" value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedSubdistrict(''); setVillages([]); }}>
            <option value="">-- Select District --</option>
            {districts.map(d => (
              <option key={d.districtCode || d.code || d.id} value={d.districtCode || d.code || d.id}>{d.districtName || d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Sub-district / Tehsil</label>
          <select className="mt-1 block w-full rounded" value={selectedSubdistrict} onChange={e => { setSelectedSubdistrict(e.target.value); setVillages([]); }}>
            <option value="">-- Select Subdistrict --</option>
            {subdistricts.map(sd => (
              <option key={sd.subDistrictCode || sd.code || sd.id} value={sd.subDistrictCode || sd.code || sd.id}>{sd.subDistrictName || sd.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <div className="flex gap-2 items-center mb-2">
            <input type="text" className="flex-1 border p-2 rounded" placeholder="Search villages by name or code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => downloadCSV('villages.csv', (filteredVillages || []).map(v => ({
              villageCode: v.villageCode || v.id || '',
              villageName: v.villageName || v.name || '',
              subdistrict: selectedSubdistrict || '',
              district: selectedDistrict || '',
              state: selectedState || '',
            })))}>
              Export CSV
            </button>
          </div>

          <div className="overflow-auto max-h-[55vh] border rounded p-2">
            {loading.villages ? (
              <div>Loading villages...</div>
            ) : (!filteredVillages || filteredVillages.length === 0) ? (
              <div>No villages found for this selection.</div>
            ) : (
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Village Name</th>
                    <th className="p-2">FRA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVillages.map(v => {
                    const fra = fraData.find(f => String(f.villageCode) === String(v.villageCode || v.id));
                    return (
                      <tr key={v.villageCode || v.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedVillage(v)}>
                        <td className="p-2 align-top">{v.villageCode || v.id || '-'}</td>
                        <td className="p-2 align-top">{v.villageName || v.name}</td>
                        <td className="p-2 text-center">{fra ? 'Yes' : 'No'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="h-[55vh] border rounded overflow-hidden">
            <MapContainer center={[22.5, 78.9]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapGeoJSON && (
                <GeoJSON data={mapGeoJSON} style={() => ({ color: '#2b6cb0', weight: 1, fillOpacity: 0.03 })} />
              )}

              {enrichedMarkers.map(marker => (marker.lat && marker.lon) ? (
                <Marker key={marker.id} position={[marker.lat, marker.lon]}>
                  <Popup>
                    <div className="text-sm">
                      <strong>{marker.name}</strong><br />
                      <div>Code: {marker.id}</div>
                      {marker.fra && (
                        <div className="mt-1 text-xs bg-green-100 p-1 rounded">FRA: {marker.fra.fraSummary?.status || 'Available'}</div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ) : null)}

            </MapContainer>
          </div>

          <div className="mt-2 text-xs text-gray-600">Tip: Click a village row to view details; if markers are not visible, try zooming in or add coordinates to LGD dataset.</div>
        </div>
      </div>

      {/* Detail drawer */}
      {selectedVillage && (
        <div className="fixed right-4 bottom-4 w-80 bg-white border rounded shadow-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{selectedVillage.villageName || selectedVillage.name}</h3>
              <div className="text-xs text-gray-600">Code: {selectedVillage.villageCode || selectedVillage.id}</div>
            </div>
            <button className="text-gray-500" onClick={() => setSelectedVillage(null)}>Close</button>
          </div>

          <div className="mt-3 text-sm">
            <div><strong>Subdistrict:</strong> {selectedSubdistrict || '-'}</div>
            <div><strong>District:</strong> {selectedDistrict || '-'}</div>
            <div><strong>State:</strong> {selectedState || '-'}</div>
            <div className="mt-2"><strong>Raw Data</strong></div>
            <pre className="text-xs max-h-40 overflow-auto bg-gray-50 p-2 rounded mt-1">{JSON.stringify(selectedVillage, null, 2)}</pre>
          </div>

        </div>
      )}

    </div>
  );
}
