import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

// Add Alan Sans font integration
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');
  .alan-sans { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 728; }
`;
document.head.appendChild(style);
import {
  FileText,
  Clock,
  Wallet,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Award,
  Bell,
  ArrowUpRight,
  Activity,
  DollarSign,
  Users,
  User,
  Home,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { extractPattaWithSchemes, parseRecommendedSchemes } from '../lib/recommendedSchemes';

const Dashboard = ({ userData }) => {
  // Live data states
  const [pattas, setPattas] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPattaForSchemes, setSelectedPattaForSchemes] = useState(null);
  const [selectedPattaSchemes, setSelectedPattaSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [schemesError, setSchemesError] = useState(null);

  // Helper: parse coordinates from a patta record in many formats
  const parseCoordinatesFromPatta = (patta) => {
    const tryNum = (v) => {
      if (v === null || v === undefined) return null;
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };

    // 1) direct numeric fields
    const directLat = tryNum(patta.lat ?? patta.latitude ?? patta.location_lat ?? (patta.coords && patta.coords[0]));
    const directLng = tryNum(patta.lng ?? patta.longitude ?? patta.location_lng ?? (patta.coords && patta.coords[1]));
    if (directLat !== null && directLng !== null) return [{ lat: directLat, lng: directLng }];

    // 2) coords as array
    if (Array.isArray(patta.coords) && patta.coords.length >= 2) {
      const a = tryNum(patta.coords[0]);
      const b = tryNum(patta.coords[1]);
      if (a !== null && b !== null) return [{ lat: a, lng: b }];
    }

    // 3) stringified JSON array in patta.coordinates
    if (typeof patta.coordinates === 'string') {
      try {
        const parsed = JSON.parse(patta.coordinates);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          const a = tryNum(parsed[0]);
          const b = tryNum(parsed[1]);
          if (a !== null && b !== null) return [{ lat: a, lng: b }];
        }
      } catch (e) {
        // not JSON - fallthrough
      }
    }

    // 4) embedded coordinate strings in free-text fields
    const textSources = [patta.coordinates, patta.info, patta.details, patta.meta, patta.description, patta.notes];
    for (const src of textSources) {
      if (typeof src === 'string') {
        // find all bracketed pairs like [12.34,56.78]
        const regex = /\[\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*\]/g;
        let m;
        const found = [];
        while ((m = regex.exec(src)) !== null) {
          const a = tryNum(m[1]);
          const b = tryNum(m[2]);
          if (a !== null && b !== null) found.push({ lat: a, lng: b });
        }
        if (found.length) return found;

        // fallback: look for "lat: x, lng: y" patterns
        const alt = /lat\s*[:=]\s*([+-]?\d+(?:\.\d+)?)\D+lon(?:g)?\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i.exec(src);
        if (alt) {
          const a = tryNum(alt[1]);
          const b = tryNum(alt[2]);
          if (a !== null && b !== null) return [{ lat: a, lng: b }];
        }

        // fallback 2: plain comma-separated pair like "25.787287433981117, 84.14435016957498" (may be unbracketed)
        const plainPairRegex = /([+-]?\d{1,3}(?:\.\d+)?)[,\s]+([+-]?\d{1,3}(?:\.\d+)?)/g;
        let pp;
        const plainFound = [];
        while ((pp = plainPairRegex.exec(src)) !== null) {
          try {
            const a = tryNum(pp[1]);
            const b = tryNum(pp[2]);
            // simple range validation before accepting: lat in [-90,90], lng in [-180,180]
            if (a !== null && b !== null && Math.abs(a) <= 90 && Math.abs(b) <= 180) {
              plainFound.push({ lat: a, lng: b });
            }
          } catch (e) { /* ignore */ }
        }
        if (plainFound.length) return plainFound;
      }
    }

    // 5) GeoJSON style in patta.geo or patta.geometry
    const geo = patta.geo || patta.geometry || patta.location_geo;
    if (geo) {
      try {
        const j = typeof geo === 'string' ? JSON.parse(geo) : geo;
        // Point
        if (j.type === 'Point' && Array.isArray(j.coordinates) && j.coordinates.length >= 2) {
          const a = tryNum(j.coordinates[1]);
          const b = tryNum(j.coordinates[0]);
          if (a !== null && b !== null) return [{ lat: a, lng: b }];
        }
        // Polygon / MultiPoint -> flatten into array
        if ((j.type === 'Polygon' || j.type === 'MultiPoint' || j.type === 'MultiPolygon') && Array.isArray(j.coordinates)) {
          // For Polygon, coordinates[0] typically holds outer ring
          const coordsArray = j.type === 'Polygon' ? j.coordinates[0] : j.coordinates.flat(2);
          const out = [];
          for (const c of coordsArray) {
            const a = tryNum(c[1]);
            const b = tryNum(c[0]);
            if (a !== null && b !== null) out.push({ lat: a, lng: b });
          }
          if (out.length) return out;
        }
      } catch (e) {
        // ignore
      }
    }

    return [];
  };

  // Helper: clean and dedupe coordinates array
  const cleanAndDedupeCoords = (coords) => {
    if (!Array.isArray(coords)) return [];
    const cleaned = [];
    const seen = new Set();
    for (const c of coords) {
      if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number') continue;
      // discard obviously invalid coordinates
      if (Math.abs(c.lat) > 90 || Math.abs(c.lng) > 180) continue;
      // round to 6 decimal places for dedupe
      const key = `${c.lat.toFixed(6)}|${c.lng.toFixed(6)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push({ lat: Number(c.lat.toFixed(6)), lng: Number(c.lng.toFixed(6)) });
    }
    return cleaned;
  };

  const extractSchemesFromRow = (row) => {
    if (!row) return [];
    const candidates = [
      'schemes',
      'recommended_schemes',
      'data',
      'payload',
      'json',
      'json_data',
      'scheme_data',
      'content'
    ];
    for (const key of candidates) {
      if (row[key]) {
        const parsed = parseRecommendedSchemes(row[key]);
        if (parsed.length) return parsed;
      }
    }
    if (Array.isArray(row)) {
      const parsed = parseRecommendedSchemes(row);
      if (parsed.length) return parsed;
    }
    return [];
  };

  // Helper: generate random polygon points around a center (meters -> lat/lng offsets)
  const generateRandomPolygonPoints = (lat, lng, minPoints = 6, maxPoints = 10, minRadius = 60, maxRadius = 160) => {
    const numPoints = Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints;
    const points = [];
    const radiusInMeters = Math.random() * (maxRadius - minRadius) + minRadius;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const randomRadius = radiusInMeters * (0.5 + Math.random() * 0.8);
      const randomAngle = angle + (Math.random() - 0.5) * 0.8;
      const irregularityOffset = (Math.random() - 0.5) * 30;
      const finalRadius = randomRadius + irregularityOffset;
      const latOffset = (finalRadius / 111320) * Math.cos(randomAngle);
      const lngOffset = (finalRadius / (111320 * Math.cos(lat * Math.PI / 180))) * Math.sin(randomAngle);
      points.push([lat + latOffset, lng + lngOffset]);
    }
    return points;
  };

  // Helper: draw coordinates on Land Analysis Map
  const drawCoordsOnLandAnalysisMap = (coords, patta) => {
    if (!window.dashboardMapInstance) return;
    const map = window.dashboardMapInstance;

    // Ensure only one patta overlay (shape filler) is visible at a time.
    // Use a global registry `window._pattaOverlays` to track overlays we create and remove them before adding a new one.
    if (!window._pattaOverlays) window._pattaOverlays = [];
    // Remove any previously created overlays
    try {
      while (window._pattaOverlays.length) {
        const ov = window._pattaOverlays.pop();
        try { map.removeLayer(ov); } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }

    // Remove previous patta overlay if any (use unique id) - still keep per-patta key for cleanup
    const overlayKey = `patta-overlay-${patta.id || (patta.patta_no || Math.random()).toString()}`;
    if (window[overlayKey]) {
      try { map.removeLayer(window[overlayKey]); } catch (e) {}
      window[overlayKey] = null;
    }

    if (!coords || coords.length === 0) return;

    // If more than 2 points, draw polygon; otherwise draw marker(s)
      if (!coords || coords.length === 0) return;

      // Ensure only one pointer marker exists at a time
      if (window._pattaPointerGroup) {
        try { map.removeLayer(window._pattaPointerGroup); } catch (e) { /* ignore */ }
        window._pattaPointerGroup = null;
      }

      // If more than 2 points, draw polygon; otherwise draw marker(s)
    if (coords.length >= 3) {
      const latlngs = coords.map(c => [c.lat, c.lng]);
      const poly = window.L.polygon(latlngs, {
        color: '#22c55e',
        fillColor: '#22c55e',
        fillOpacity: 0.3,
        weight: 2,
        opacity: 0.9
      }).addTo(map);
      poly.bindPopup(`<b>${patta.title || patta.patta_no || 'Patta'}</b><br>Vertices: ${coords.length}`);
      window[overlayKey] = poly;
      map.fitBounds(poly.getBounds(), { padding: [40,40] });
    } else {
        // single point or two points: draw markers and line
        const markers = [];
        coords.forEach((c) => {
          const m = window.L.marker([c.lat, c.lng]).bindPopup(`<b>${patta.title || 'Patta'}</b><br>Lat: ${c.lat}, Lng: ${c.lng}`);
          // when popup closed, clear overlays/pointers
          m.on && m.on('popupclose', () => clearMapPointersAndOverlays());
          markers.push(m);
        });

        // add markers as a single pointer group so only one pointer exists
        window._pattaPointerGroup = window.L.featureGroup(markers).addTo(map);

        if (markers.length === 1) {
          map.setView([coords[0].lat, coords[0].lng], 17);
          // create a random polygon filler around the single point
          const polyPoints = generateRandomPolygonPoints(coords[0].lat, coords[0].lng);
          const randColor = '#22c55e';
          const poly = window.L.polygon(polyPoints, {
            color: randColor,
            fillColor: randColor,
            fillOpacity: 0.35,
            weight: 2,
            opacity: 0.9
          }).addTo(map);
    poly.bindPopup(`<b>${patta.title || 'Patta'}</b><br>Random analysis area`);
    poly.on && poly.on('popupclose', () => clearMapPointersAndOverlays());
          window[overlayKey] = window.L.featureGroup([window._pattaPointerGroup, poly]);
          window[overlayKey].addTo(map);
          // register overlay for global cleanup
          window._pattaOverlays.push(window[overlayKey]);
        } else {
          const latlngs = coords.map(c => [c.lat, c.lng]);
          const polyline = window.L.polyline(latlngs, { color: '#3b82f6', weight: 2 }).addTo(map);
          // create a random polygon around midpoint for visual filler
          const midLat = (coords[0].lat + coords[1].lat) / 2;
          const midLng = (coords[0].lng + coords[1].lng) / 2;
          const polyPoints = generateRandomPolygonPoints(midLat, midLng, 6, 12, 80, 220);
          const randColor = '#f59e0b';
          const poly = window.L.polygon(polyPoints, {
            color: randColor,
            fillColor: randColor,
            fillOpacity: 0.28,
            weight: 2,
            opacity: 0.9
          }).addTo(map);
          poly.on && poly.on('popupclose', () => clearMapPointersAndOverlays());
          window[overlayKey] = window.L.featureGroup([window._pattaPointerGroup, polyline, poly]);
          window[overlayKey].addTo(map);
          // register overlay for global cleanup
          window._pattaOverlays.push(window[overlayKey]);
          map.fitBounds(window[overlayKey].getBounds(), { padding: [40,40] });
        }
    }
  };

  // Handler to view a patta on the map: parse, clean, dedupe, draw
  const handleViewOnMap = (patta) => {
    try {
      const raw = parseCoordinatesFromPatta(patta);
      const cleaned = cleanAndDedupeCoords(raw);

      // If no coordinates found, attempt to fetch geometry field from server (optional)
      if (cleaned.length === 0 && patta.id && supabase) {
        // Try fetching full patta record to look for geo fields
        (async () => {
          try {
            const { data } = await supabase.from('pattas').select('*').eq('id', patta.id).limit(1).single();
            if (data) {
              const r2 = parseCoordinatesFromPatta(data);
              const cleaned2 = cleanAndDedupeCoords(r2);
              if (cleaned2.length) {
                drawCoordsOnLandAnalysisMap(cleaned2, patta);
                return;
              }
            }
            // fallback: notify user
            try { window.alert('No valid coordinates found for this patta.'); } catch (e) { console.log('No coordinates found'); }
          } catch (e) {
            console.warn('Failed to reload patta for coords', e);
            try { window.alert('No valid coordinates found for this patta.'); } catch (err) { console.log('No coordinates found'); }
          }
        })();
        return;
      }

      if (cleaned.length > 0) {
        drawCoordsOnLandAnalysisMap(cleaned, patta);
      } else {
        try { window.alert('No valid coordinates found for this patta.'); } catch (e) { console.log('No coordinates found'); }
      }
    } catch (e) {
      console.error('Error handling view on map', e);
    }
  };

  const handleViewSchemes = async (patta) => {
    if (!patta) return;
    setSelectedPattaForSchemes(patta);
    setSchemesLoading(true);
    setSchemesError(null);
    try {
      const identifiers = [patta.id, patta.patta_id, patta.reference, patta.patta_no]
        .map((val) => (val == null ? null : String(val).trim()))
        .filter((val) => val && val.length > 0);

      let fetched = [];

      if (identifiers.length > 0) {
        const primaryId = identifiers[0];
        try {
          const { data: recRow, error: recErr, status } = await supabase
            .from('recommended_schemes')
            .select('*')
            .eq('patta_id', primaryId)
            .maybeSingle();
          if (!recErr && recRow) {
            fetched = extractSchemesFromRow(recRow);
          } else if (recErr && status !== 406) {
            console.warn('Failed to fetch from recommended_schemes table', recErr);
          }
        } catch (innerErr) {
          console.warn('Error querying recommended_schemes table', innerErr);
        }

        if (fetched.length === 0 && identifiers.length > 1) {
          for (let idx = 1; idx < identifiers.length && fetched.length === 0; idx += 1) {
            const altId = identifiers[idx];
            try {
              const { data: altRow, error: altErr, status: altStatus } = await supabase
                .from('recommended_schemes')
                .select('*')
                .eq('patta_id', altId)
                .maybeSingle();
              if (!altErr && altRow) {
                fetched = extractSchemesFromRow(altRow);
              } else if (altErr && altStatus !== 406) {
                console.warn('Failed to fetch schemes using alternative identifier', altErr);
              }
            } catch (innerErr) {
              console.warn('Error querying recommended_schemes table with alternate id', innerErr);
            }
          }
        }
      }

      if (fetched.length === 0) {
        try {
          if (patta.id) {
            const { data: pattaRow, error: pattaErr, status } = await supabase
              .from('pattas')
              .select('recommended_schemes')
              .eq('id', patta.id)
              .maybeSingle();
            if (!pattaErr && pattaRow) {
              fetched = parseRecommendedSchemes(pattaRow.recommended_schemes);
            } else if (pattaErr && status !== 406) {
              console.warn('Failed to fetch patta recommended_schemes by id', pattaErr);
            }
          }
          if (fetched.length === 0 && patta.patta_id) {
            const { data: pattaRow2, error: pattaErr2, status: status2 } = await supabase
              .from('pattas')
              .select('recommended_schemes')
              .eq('patta_id', patta.patta_id)
              .maybeSingle();
            if (!pattaErr2 && pattaRow2) {
              fetched = parseRecommendedSchemes(pattaRow2.recommended_schemes);
            } else if (pattaErr2 && status2 !== 406) {
              console.warn('Failed to fetch patta recommended_schemes by patta_id', pattaErr2);
            }
          }
        } catch (fallbackErr) {
          console.warn('Error during fallback patta fetch for schemes', fallbackErr);
        }
      }

      if (fetched.length === 0) {
        fetched = parseRecommendedSchemes(patta.recommended_schemes);
      }

      setSelectedPattaSchemes(fetched);
      if (fetched.length === 0) {
        setSchemesError('No schemes found for this patta yet.');
      }
    } catch (err) {
      console.error('Unable to load schemes for patta', err);
      setSchemesError('Failed to load schemes. Please try again later.');
      setSelectedPattaSchemes([]);
    } finally {
      setSchemesLoading(false);
    }
  };

  // Helper: clear pointer markers, overlays and dashboard marker and polygon
  const clearMapPointersAndOverlays = () => {
    try {
      const map = window.dashboardMapInstance;
      if (!map) return;
      if (window._pattaPointerGroup) {
        try { map.removeLayer(window._pattaPointerGroup); } catch (e) {}
        window._pattaPointerGroup = null;
      }
      if (window._pattaOverlays) {
        try {
          while (window._pattaOverlays.length) {
            const ov = window._pattaOverlays.pop();
            try { map.removeLayer(ov); } catch (e) {}
          }
        } catch (e) {}
      }
      // remove global per-patta overlay keys if set
      // (these are optional and safe to try)
      try {
        for (const k in window) {
          if (k && k.startsWith && k.startsWith('patta-overlay-') && window[k]) {
            try { map.removeLayer(window[k]); } catch (e) {}
            window[k] = null;
          }
        }
      } catch (e) {}

      if (window.dashboardMapMarker) {
        try { map.removeLayer(window.dashboardMapMarker); } catch (e) {}
        window.dashboardMapMarker = null;
      }

      if (window.clearDashboardPolygon) {
        try { window.clearDashboardPolygon(); } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
  };

  const normalizedRecommendations = useMemo(() => {
    if (!Array.isArray(pattas)) {
      return [];
    }
    return pattas
      .map((patta) => extractPattaWithSchemes(patta))
      .filter(Boolean);
  }, [pattas]);

  const schemesEnrolled = useMemo(() => {
    const enrolled = new Set();
    normalizedRecommendations.forEach((record) => {
      record.recommendedSchemes.forEach((scheme) => {
        const key = scheme.scheme_id || scheme.scheme_name || JSON.stringify(scheme.raw ?? scheme);
        if (key) {
          enrolled.add(String(key).toLowerCase());
        }
      });
    });
    return enrolled.size;
  }, [normalizedRecommendations]);

  const priorityBadgeStyles = {
    high: 'bg-red-500/10 text-red-300 border border-red-500/30',
    medium: 'bg-amber-500/10 text-amber-200 border border-amber-500/30',
    low: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30',
    universal: 'bg-blue-500/10 text-blue-200 border border-blue-500/30',
    default: 'bg-gray-500/10 text-gray-200 border border-gray-500/30'
  };

  const priorityBadgeLabels = {
    high: 'High priority',
    medium: 'Medium priority',
    low: 'Low priority',
    universal: 'Universal access'
  };

  const getPriorityBadgeClass = (priority) => priorityBadgeStyles[priority] || priorityBadgeStyles.default;
  const getPriorityBadgeLabel = (priority) => priorityBadgeLabels[priority] || 'Universal access';
  const formatSuitabilityScore = (score) => {
    if (score == null) return '—';
    return `${Math.round(score)} / 100`;
  };

  // Derived values for the top stat cards
  const activePattasCount = pattas.filter((p) => (p.status || '').toString().toLowerCase() !== 'pending').length;
  const pendingReviewsCount = pattas.filter((p) => (p.status || '').toString().toLowerCase() === 'pending').length;
  const totalBenefitsReceived = paymentsTotal || 0;

  const stats = [
    { title: 'Active Pattas', value: String(activePattasCount), change: '', trend: activePattasCount > 0 ? 'up' : 'neutral', icon: FileText, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { title: 'Pending Reviews', value: String(pendingReviewsCount), change: '', trend: pendingReviewsCount > 0 ? 'neutral' : 'up', icon: Clock, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { title: 'Total Benefits Received', value: `₹${totalBenefitsReceived.toLocaleString()}`, change: '', trend: 'up', icon: Wallet, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { title: 'Schemes Enrolled', value: String(schemesEnrolled), change: '', trend: schemesEnrolled > 0 ? 'up' : 'neutral', icon: Award, bgColor: 'bg-purple-50', textColor: 'text-purple-600' }
  ];

  const recentActivity = [
    {
      type: "patta",
      title: "Patta Verification Completed",
      description: "FRA001 - Village Khajuraho, Plot 45 has been successfully verified",
      time: "2 days ago",
      status: "completed",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      type: "scheme",
      title: "PM-KISAN Eligibility Confirmed",
      description: "You are now eligible for PM-KISAN scheme benefits",
      time: "5 days ago",
      status: "new",
      icon: Award,
      color: "text-blue-500"
    },
    {
      type: "payment",
      title: "MGNREGA Payment Received",
      description: "₹2,000 has been credited to your account",
      time: "1 week ago",
      status: "completed",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      type: "document",
      title: "Document Upload Required",
      description: "Additional documents needed for FRA002 verification",
      time: "1 week ago",
      status: "action_required",
      icon: AlertCircle,
      color: "text-orange-500"
    },
    {
      type: "meeting",
      title: "Community Meeting Scheduled",
      description: "Village forest rights meeting on March 15, 2025",
      time: "2 weeks ago",
      status: "upcoming",
      icon: Users,
      color: "text-purple-500"
    }
  ];

  const quickActions = [
    { name: "Apply for New Scheme", icon: Award, color: "bg-blue-500" },
    { name: "Upload Documents", icon: FileText, color: "bg-green-500" },
    { name: "View Payment History", icon: Wallet, color: "bg-purple-500" },
    { name: "Submit Feedback", icon: Bell, color: "bg-orange-500" }
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const ownerId = userData && userData.id ? userData.id : 'guest';
      try {
        // Fetch pattas for user
        const { data: pData, error: pErr } = await supabase.from('pattas').select('*').eq('owner_id', ownerId).order('date_applied', { ascending: false });
        if (pErr) {
          console.warn('Failed to fetch pattas', pErr.message || pErr);
        }
        if (mounted) setPattas(pData || []);

        // Fetch payments total if payments table exists
        try {
          const { data: payData, error: payErr } = await supabase.from('payments').select('amount').eq('user_id', ownerId);
          if (payErr) {
            console.warn('Payments table missing or failed to fetch', payErr.message || payErr);
          } else {
            const total = (payData || []).reduce((s, row) => s + (parseFloat(row.amount) || 0), 0);
            if (mounted) setPaymentsTotal(total);
          }
        } catch (e) {
          console.warn('Error fetching payments', e);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [userData]);

  // Initialize map after component mounts and loading is complete
  useEffect(() => {
    if (!loading) {
      const initializeMap = async () => {
        try {
          // Dynamically import Leaflet
          if (typeof window !== 'undefined' && !window.L) {
            // Load Leaflet CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            // Load Leaflet JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
              setTimeout(() => {
                const mapContainer = document.getElementById('dashboardMap');
                if (mapContainer && window.L && !window.dashboardMapInstance) {
                  // Initialize map
                  const map = window.L.map('dashboardMap').setView([19.8222, 82.5486], 16);
                  
                  // Add satellite tile layer
                  const satelliteLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Esri',
                    maxZoom: 19
                  }).addTo(map);

                  // Custom marker icon
                  const customIcon = window.L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  });

                  // Add or reuse marker (keep only one marker)
                  let marker;
                  if (window.dashboardMapMarker) {
                    marker = window.dashboardMapMarker;
                    marker.setLatLng([19.8222, 82.5486]);
                  } else {
                    marker = window.L.marker([19.8222, 82.5486], {icon: customIcon}).addTo(map)
                      .bindPopup('<b>Your Land Area</b><br>Lat: 19.8222<br>Lng: 82.5486')
                      .openPopup();
                  }

                  // Store current polygon for removal
                  let currentPolygon = null;

                  // Function to create random polygon around a point
                  const createRandomPolygon = (lat, lng) => {
                    // Remove old polygon if exists
                    if (currentPolygon) {
                      map.removeLayer(currentPolygon);
                    }
                    
                    // Generate random polygon points around the center
                    const numPoints = Math.floor(Math.random() * 5) + 6; // 6-10 points for more complex shapes
                    const points = [];
                    const radiusInMeters = Math.random() * 100 + 60; // 60-160 meters radius (larger areas)
                    
                    // Create more organic, irregular shapes
                    for (let i = 0; i < numPoints; i++) {
                      const angle = (i / numPoints) * 2 * Math.PI;
                      const randomRadius = radiusInMeters * (0.5 + Math.random() * 0.8); // More variation 50-130%
                      const randomAngle = angle + (Math.random() - 0.5) * 0.8; // More angular variation
                      
                      // Add some irregularity with additional random offsets
                      const irregularityOffset = (Math.random() - 0.5) * 30; // ±15 meter random offset
                      const finalRadius = randomRadius + irregularityOffset;
                      
                      // Convert meters to lat/lng offset
                      const latOffset = (finalRadius / 111320) * Math.cos(randomAngle);
                      const lngOffset = (finalRadius / (111320 * Math.cos(lat * Math.PI / 180))) * Math.sin(randomAngle);
                      
                      points.push([lat + latOffset, lng + lngOffset]);
                    }
                    
                    // Enhanced color palette with land analysis theme
                    const landColors = [
                      { color: '#FF6B6B', name: 'Agricultural Land', type: 'cropland' },
                      { color: '#22C55E', name: 'Forest Area', type: 'forest' },
                      { color: '#3B82F6', name: 'Water Body', type: 'water' },
                      { color: '#F59E0B', name: 'Barren Land', type: 'barren' },
                      { color: '#8B5CF6', name: 'Settlement Area', type: 'settlement' },
                      { color: '#EC4899', name: 'Grassland', type: 'grass' },
                      { color: '#14B8A6', name: 'Wetland', type: 'wetland' },
                      { color: '#F97316', name: 'Rocky Terrain', type: 'rocky' }
                    ];
                    
                    const selectedLandType = landColors[Math.floor(Math.random() * landColors.length)];
                    
                    // Create polygon with enhanced styling
                    currentPolygon = window.L.polygon(points, {
                      color: selectedLandType.color,
                      fillColor: selectedLandType.color,
                      fillOpacity: 0.4, // More visible fill
                      weight: 3,
                      opacity: 0.9,
                      dashArray: selectedLandType.type === 'water' ? '10, 5' : null, // Dashed for water
                      lineCap: 'round',
                      lineJoin: 'round'
                    }).addTo(map);
                    
                    // Calculate approximate area
                    const area = (Math.PI * Math.pow(radiusInMeters, 2) / 4047).toFixed(2); // Convert to acres
                    
                    // Add detailed popup with land analysis info
                    currentPolygon.bindPopup(`
                      <div style="font-family: system-ui; min-width: 200px;">
                        <h3 style="margin: 0 0 8px 0; color: ${selectedLandType.color}; font-size: 14px; font-weight: bold;">
                          🌍 ${selectedLandType.name}
                        </h3>
                        <div style="font-size: 12px; line-height: 1.4;">
                          <p style="margin: 4px 0;"><strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                          <p style="margin: 4px 0;"><strong>Area:</strong> ~${area} acres</p>
                          <p style="margin: 4px 0;"><strong>Vertices:</strong> ${numPoints} points</p>
                          <p style="margin: 4px 0;"><strong>Land Type:</strong> ${selectedLandType.type}</p>
                          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #666;">
                            Click anywhere on map to analyze another area
                          </div>
                        </div>
                      </div>
                    `);
                    
                    // Add pulsing animation effect for new polygons
                    let pulseCount = 0;
                    const pulseInterval = setInterval(() => {
                      if (pulseCount < 3) {
                        currentPolygon.setStyle({ fillOpacity: 0.7 });
                        setTimeout(() => {
                          if (currentPolygon) currentPolygon.setStyle({ fillOpacity: 0.4 });
                        }, 200);
                        pulseCount++;
                      } else {
                        clearInterval(pulseInterval);
                      }
                    }, 400);
                  };

                  // Create initial random polygon
                  createRandomPolygon(19.8222, 82.5486);

                  // Add sample fixed polygon areas for reference
                  const createLandPolygon = (lat, lng, color, label) => {
                    const numPoints = Math.floor(Math.random() * 3) + 4;
                    const points = [];
                    const radiusInMeters = Math.random() * 60 + 30;
                    
                    for (let i = 0; i < numPoints; i++) {
                      const angle = (i / numPoints) * 2 * Math.PI;
                      const randomRadius = radiusInMeters * (0.8 + Math.random() * 0.4);
                      const randomAngle = angle + (Math.random() - 0.5) * 0.3;
                      
                      const latOffset = (randomRadius / 111320) * Math.cos(randomAngle);
                      const lngOffset = (randomRadius / (111320 * Math.cos(lat * Math.PI / 180))) * Math.sin(randomAngle);
                      
                      points.push([lat + latOffset, lng + lngOffset]);
                    }
                    
                    return window.L.polygon(points, {
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.2,
                      weight: 2,
                      opacity: 0.6
                    }).addTo(map).bindPopup(`<b>${label}</b><br>Area: ${(Math.random() * 5 + 2).toFixed(1)} acres`);
                  };

                  // sample fixed polygons removed so only the dynamic pointer polygon is shown

                  // Handle map clicks
                  map.on('click', (e) => {
                    const lat = e.latlng.lat;
                    const lng = e.latlng.lng;
                    document.getElementById('mapLat').value = lat.toFixed(4);
                    document.getElementById('mapLng').value = lng.toFixed(4);
                      const popupContent = `<b>Selected Location</b><br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`;
                      marker.setLatLng([lat, lng])
                        .bindPopup(popupContent)
                        .openPopup();
                      // When the popup is closed, clear pointer and overlays
                      marker.on('popupclose', () => {
                        // remove this marker and any related overlays
                        clearMapPointersAndOverlays();
                      });
                    
                    // Create random polygon around clicked point
                    createRandomPolygon(lat, lng);
                  });

                  // Store the createRandomPolygon function globally for access from controls
                  window.createRandomPolygon = createRandomPolygon;

                  // Store map instance globally
                  window.dashboardMapInstance = map;
                  window.dashboardMapMarker = marker;
                  // ensure popupclose removes markers/overlays
                  marker.on('popupclose', () => clearMapPointersAndOverlays());
                }
              }, 100);
            };
            document.head.appendChild(script);
          } else if (window.L && !window.dashboardMapInstance) {
            // Leaflet already loaded, initialize map directly
            setTimeout(() => {
              const mapContainer = document.getElementById('dashboardMap');
              if (mapContainer) {
                const map = window.L.map('dashboardMap').setView([19.8222, 82.5486], 16);

                // Satellite base
                const satelliteLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                  attribution: 'Esri',
                  maxZoom: 19
                }).addTo(map);

                // Custom marker icon
                const customIcon = window.L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                });

                // Add marker
                const marker = window.L.marker([19.8222, 82.5486], {icon: customIcon}).addTo(map)
                  .bindPopup('<b>Your Land Area</b><br>Lat: 19.8222<br>Lng: 82.5486')
                  .openPopup();

                // Store current polygon for removal
                let currentPolygon = null;

                // Function to create random polygon around a point
                const createRandomPolygon = (lat, lng) => {
                  if (currentPolygon) map.removeLayer(currentPolygon);
                  const numPoints = Math.floor(Math.random() * 5) + 6;
                  const points = [];
                  const radiusInMeters = Math.random() * 100 + 60;
                  for (let i = 0; i < numPoints; i++) {
                    const angle = (i / numPoints) * 2 * Math.PI;
                    const randomRadius = radiusInMeters * (0.5 + Math.random() * 0.8);
                    const randomAngle = angle + (Math.random() - 0.5) * 0.8;
                    const irregularityOffset = (Math.random() - 0.5) * 30;
                    const finalRadius = randomRadius + irregularityOffset;
                    const latOffset = (finalRadius / 111320) * Math.cos(randomAngle);
                    const lngOffset = (finalRadius / (111320 * Math.cos(lat * Math.PI / 180))) * Math.sin(randomAngle);
                    points.push([lat + latOffset, lng + lngOffset]);
                  }
                  const landColors = [
                    { color: '#FF6B6B', name: 'Agricultural Land', type: 'cropland' },
                    { color: '#22C55E', name: 'Forest Area', type: 'forest' },
                    { color: '#3B82F6', name: 'Water Body', type: 'water' },
                    { color: '#F59E0B', name: 'Barren Land', type: 'barren' },
                    { color: '#8B5CF6', name: 'Settlement Area', type: 'settlement' },
                    { color: '#EC4899', name: 'Grassland', type: 'grass' },
                    { color: '#14B8A6', name: 'Wetland', type: 'wetland' },
                    { color: '#F97316', name: 'Rocky Terrain', type: 'rocky' }
                  ];
                  const selectedLandType = landColors[Math.floor(Math.random() * landColors.length)];
                  currentPolygon = window.L.polygon(points, {
                    color: selectedLandType.color,
                    fillColor: selectedLandType.color,
                    fillOpacity: 0.4,
                    weight: 3,
                    opacity: 0.9,
                    dashArray: selectedLandType.type === 'water' ? '10, 5' : null,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }).addTo(map);
                  const area = (Math.PI * Math.pow(radiusInMeters, 2) / 4047).toFixed(2);
                  currentPolygon.bindPopup(`<div style="font-family: system-ui; min-width: 200px;"><h3 style="margin:0 0 8px 0; color:${selectedLandType.color}; font-size:14px; font-weight:bold;">🌍 ${selectedLandType.name}</h3><div style="font-size:12px; line-height:1.4;"><p style="margin:4px 0;"><strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p><p style="margin:4px 0;"><strong>Area:</strong> ~${area} acres</p><p style="margin:4px 0;"><strong>Vertices:</strong> ${numPoints} points</p><p style="margin:4px 0;"><strong>Land Type:</strong> ${selectedLandType.type}</p></div></div>`);
                  let pulseCount = 0;
                  const pulseInterval = setInterval(() => {
                    if (pulseCount < 3) {
                      currentPolygon.setStyle({ fillOpacity: 0.7 });
                      setTimeout(() => { if (currentPolygon) currentPolygon.setStyle({ fillOpacity: 0.4 }); }, 200);
                      pulseCount++;
                    } else clearInterval(pulseInterval);
                  }, 400);
                };

                // Create initial random polygon (pointer-only behavior)
                createRandomPolygon(19.8222, 82.5486);

                // Handle map clicks
                map.on('click', (e) => {
                  const lat = e.latlng.lat;
                  const lng = e.latlng.lng;
                  const latInput = document.getElementById('mapLat');
                  const lngInput = document.getElementById('mapLng');
                  if (latInput) latInput.value = lat.toFixed(4);
                  if (lngInput) lngInput.value = lng.toFixed(4);
                  marker.setLatLng([lat, lng]).bindPopup(`<b>Selected Location</b><br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`).openPopup();
                  createRandomPolygon(lat, lng);
                });

                // Expose function and instances globally
                window.createRandomPolygon = createRandomPolygon;
                window.dashboardMapInstance = map;
                window.dashboardMapMarker = marker;
              }
            }, 100);
          }
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      };

      initializeMap();
    }

    // Cleanup function
    return () => {
      if (window.dashboardMapInstance) {
        window.dashboardMapInstance.remove();
        window.dashboardMapInstance = null;
        window.dashboardMapMarker = null;
      }
    };
  }, [loading]);

  return (
    <div className="min-h-screen bg-white text-gray-800 px-4 sm:px-6 md:px-8 py-6 md:py-10 alan-sans">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-800">Welcome{userData?.full_name ? `, ${userData.full_name.split(' ')[0]}` : ''}</h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <Home className="h-4 w-4" />
              <p className="text-sm">Dashboard</p>
              <ChevronRight className="h-4 w-4" />
              <p className="text-sm">Overview</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.1)'
          }}>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg" style={{
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
            }}>
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{userData?.full_name || 'User'}</p>
              <p className="text-xs text-gray-600">{userData?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm">Here's what's happening with your applications today.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
          <p className="ml-2 text-lg text-gray-700">Loading your dashboard...</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Land Analysis Map */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.1)'
          }}>
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Land Analysis Map</h3>
                  <p className="text-gray-600 text-sm">Interactive satellite view of your registered land areas</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select 
                    id="mapLayerSelect" 
                    className="bg-white border border-gray-300 text-gray-800 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" style={{
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                    }}
                    onChange={(e) => {
                      const mapContainer = document.getElementById('dashboardMap');
                      if (mapContainer && window.dashboardMapInstance) {
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
                        window.dashboardMapInstance.eachLayer((layer) => {
                          if (layer instanceof window.L.TileLayer) {
                            window.dashboardMapInstance.removeLayer(layer);
                          }
                        });
                        layers[e.target.value].addTo(window.dashboardMapInstance);
                      }
                    }}
                  >
                    <option value="satellite">🛰️ Satellite</option>
                    <option value="street">🗺️ Street</option>
                    <option value="terrain">🏔️ Terrain</option>
                  </select>
                  <button 
                    className="text-blue-400 hover:text-blue-300 font-medium text-sm flex items-center space-x-1 transition-colors duration-200"
                    onClick={() => {
                      if (navigator.geolocation && window.dashboardMapInstance && window.dashboardMapMarker) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const lat = position.coords.latitude;
                          const lng = position.coords.longitude;
                          document.getElementById('mapLat').value = lat.toFixed(4);
                          document.getElementById('mapLng').value = lng.toFixed(4);
                          window.dashboardMapInstance.setView([lat, lng], 16);
                          window.dashboardMapMarker.setLatLng([lat, lng])
                            .bindPopup(`<b>Your Location</b><br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`)
                            .openPopup();
                          // Create random polygon around the point
                          if (window.createRandomPolygon) {
                            window.createRandomPolygon(lat, lng);
                          }
                        });
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>My Location</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Map Container */}
              <div 
                id="dashboardMap" 
                className="h-96 sm:h-[30rem] lg:h-[36rem] w-full bg-gray-100"
                style={{ minHeight: '450px' }}
              ></div>
              
              {/* Map Controls Overlay */}
              <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-3 border border-gray-300" style={{
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div className="flex flex-col sm:flex-row gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium">Lat:</label>
                    <input 
                      type="text" 
                      id="mapLat" 
                      defaultValue="19.8222"
                      className="w-20 px-2 py-1 bg-white border border-gray-300 text-gray-800 text-xs rounded focus:ring-1 focus:ring-blue-500" style={{
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const lat = parseFloat(document.getElementById('mapLat').value);
                          const lng = parseFloat(document.getElementById('mapLng').value);
                          if (!isNaN(lat) && !isNaN(lng) && window.dashboardMapInstance && window.dashboardMapMarker) {
                            window.dashboardMapInstance.setView([lat, lng], 16);
                            window.dashboardMapMarker.setLatLng([lat, lng])
                              .bindPopup(`<b>Location</b><br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`)
                              .openPopup();
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium">Lng:</label>
                    <input 
                      type="text" 
                      id="mapLng" 
                      defaultValue="82.5486"
                      className="w-20 px-2 py-1 bg-white border border-gray-300 text-gray-800 text-xs rounded focus:ring-1 focus:ring-blue-500" style={{
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const lat = parseFloat(document.getElementById('mapLat').value);
                          const lng = parseFloat(document.getElementById('mapLng').value);
                          if (!isNaN(lat) && !isNaN(lng) && window.dashboardMapInstance && window.dashboardMapMarker) {
                            window.dashboardMapInstance.setView([lat, lng], 16);
                            window.dashboardMapMarker.setLatLng([lat, lng])
                              .bindPopup(`<b>Location</b><br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`)
                              .openPopup();
                          }
                        }
                      }}
                    />
                  </div>
                  <button 
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors duration-200"
                    onClick={() => {
                      const lat = parseFloat(document.getElementById('mapLat').value);
                      const lng = parseFloat(document.getElementById('mapLng').value);
                      if (!isNaN(lat) && !isNaN(lng) && window.dashboardMapInstance && window.dashboardMapMarker) {
                        window.dashboardMapInstance.setView([lat, lng], 16);
                        window.dashboardMapMarker.setLatLng([lat, lng])
                          .bindPopup(`<b>Selected Location</b><br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`)
                          .openPopup();
                        // Create random polygon around the point
                        if (window.createRandomPolygon) {
                          window.createRandomPolygon(lat, lng);
                        }
                      }
                    }}
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Pattas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.1)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Your Pattas</h3>
              <p className="text-sm text-gray-600">{pattas.length} total</p>
            </div>
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
              {pattas.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-600">No pattas found. Apply for a patta to get started.</p>
                </div>
              ) : (
                pattas.map((p) => (
                  <div key={p.id || `${p.owner_id}-${p.date_applied || Math.random()}`} className="w-full flex items-start space-x-3 p-3 rounded-xl bg-white border border-gray-200 transition-colors duration-150" style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {p.id ? String(p.id).slice(0,2).toUpperCase() : 'PT'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <p className="text-sm font-semibold text-gray-800 truncate">{p.title || p.patta_no || p.reference || `Patta ${p.id || ''}`}</p>
                          <p className="text-xs text-gray-600 truncate">{p.village || p.village_name || p.location || 'Unknown village'} • Plot {p.plot_number || p.plot || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-medium ${((p.status||'') .toString().toLowerCase() === 'pending') ? 'text-amber-600' : (p.status||'').toString().toLowerCase() === 'approved' ? 'text-green-600' : 'text-gray-600'}`}>{p.status || 'unknown'}</p>
                          <p className="text-xs text-gray-500">{p.date_applied ? new Date(p.date_applied).toLocaleDateString() : ''}</p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded shadow-sm"
                          onClick={() => handleViewOnMap(p)}
                        >
                          View on Map
                        </button>

                        <button
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded border border-gray-300" style={{
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                          }}
                          onClick={() => handleViewSchemes(p)}
                        >
                          Schemes
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enhanced Stats Cards - Moved to Sidebar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-1.5" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.1)'
          }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-800">Dashboard Stats</h3>
              <Activity className="h-3 w-3 text-blue-600" />
            </div>
            <div className="grid grid-cols-1 gap-1">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-1.5 transition-all duration-300 group transform hover:translate-y-[-1px]" style={{
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.08)'
                }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="p-1 rounded-md transition-transform duration-300 group-hover:scale-105" style={{
                      background: stat.trend === 'up' ? 'linear-gradient(135deg, #10b981, #059669)' : stat.trend === 'down' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 text-xs ${
                      stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                      {stat.trend === 'down' && <TrendingUp className="h-3 w-3 rotate-180" />}
                      {stat.trend === 'neutral' && <Activity className="h-3 w-3" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-0">{stat.title}</p>
                    <p className="text-sm font-bold text-gray-800 mb-0">{stat.value}</p>
                    <p className={`text-xs ${
                      stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {stat.change || 'Updated'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patta Schemes Viewer */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6" style={{
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.1)'
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Patta Schemes</h3>
              <p className="text-sm text-gray-600">
                {selectedPattaForSchemes
                  ? `Schemes tailored for ${selectedPattaForSchemes.title || selectedPattaForSchemes.patta_no || selectedPattaForSchemes.id || 'this patta'}`
                  : 'Pick a patta from the list to load recommended schemes from the database.'}
              </p>
            </div>
          </div>
          {selectedPattaForSchemes && (
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              {selectedPattaSchemes.length} scheme{selectedPattaSchemes.length === 1 ? '' : 's'} loaded
            </div>
          )}
        </div>

        {schemesLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin mr-3" />
            <span>Fetching schemes for the selected patta…</span>
          </div>
        ) : schemesError ? (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {schemesError}
          </div>
        ) : selectedPattaSchemes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selectedPattaSchemes.map((scheme) => (
              <div
                key={scheme.scheme_id || scheme.scheme_name}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:border-blue-300"
                style={{
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{scheme.scheme_name || 'Scheme'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{scheme.category || 'General Welfare'}</p>
                    </div>
                    <span className={`text-[0.65rem] px-2 py-1 rounded-full ${getPriorityBadgeClass(scheme.priority)} uppercase tracking-wide`}>{getPriorityBadgeLabel(scheme.priority)}</span>
                  </div>
                  {Array.isArray(scheme.benefits) && scheme.benefits.length > 0 ? (
                    <ul className="text-xs text-gray-600 space-y-1 mt-2">
                      {scheme.benefits.slice(0, 4).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : scheme.description ? (
                    <p className="text-xs text-gray-600 mt-2">{scheme.description}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2 italic">Benefits will be listed here.</p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-200">
                  {scheme.score != null ? (
                    <span className="font-medium text-blue-600">Suitability: {formatSuitabilityScore(scheme.score)}</span>
                  ) : <span />}
                  {scheme.scheme_id && (
                    <span className="font-medium">ID: {scheme.scheme_id}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-gray-600">
            {selectedPattaForSchemes
              ? 'No schemes are linked to this patta yet. New recommendations will appear here once they are generated.'
              : 'Select any patta from the right-hand list and click “Schemes” to load its personalised recommendations.'}
          </div>
        )}
      </div>

      </>
      )}
    </div>
  );
};

export default Dashboard;