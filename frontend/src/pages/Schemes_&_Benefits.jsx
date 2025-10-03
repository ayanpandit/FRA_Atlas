import React, { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Layers,
  Search,
  Filter,
  ChevronRight,
  Award,
  MapPin,
  Leaf,
  Target,
  Clock,
  Info
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { extractPattaWithSchemes } from '../lib/recommendedSchemes';

const priorityStyles = {
  high: 'bg-red-500/10 text-red-300 border border-red-500/40',
  medium: 'bg-amber-500/10 text-amber-200 border border-amber-500/30',
  low: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30',
  universal: 'bg-blue-500/10 text-blue-200 border border-blue-500/30',
  default: 'bg-gray-500/10 text-gray-200 border border-gray-500/30'
};

const priorityLabels = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
  universal: 'Universal Access'
};

const getPriorityClass = (priority) => priorityStyles[priority] || priorityStyles.default;
const getPriorityLabel = (priority) => priorityLabels[priority] || 'Universal Access';

const getCategoryClass = (category) => {
  const key = (category || '').toLowerCase();
  if (key.includes('water')) return 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/30';
  if (key.includes('forest')) return 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30';
  if (key.includes('agri') || key.includes('farm')) return 'bg-lime-500/10 text-lime-200 border border-lime-500/30';
  if (key.includes('employment')) return 'bg-purple-500/10 text-purple-200 border border-purple-500/30';
  if (key.includes('benefit') || key.includes('transfer')) return 'bg-amber-500/10 text-amber-200 border border-amber-500/30';
  return 'bg-slate-500/10 text-slate-200 border border-slate-500/30';
};

const formatArea = (area) => {
  if (typeof area === 'number' && Number.isFinite(area)) {
    return `${area.toFixed(2)} ha`;
  }
  return 'Not recorded';
};

const formatScore = (score) => {
  if (score == null) return '—';
  const rounded = Math.round(score);
  return `${rounded} / 100`;
};

const formatDateTime = (value) => {
  if (!value) return 'No recent updates';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No recent updates';
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch (error) {
    return 'No recent updates';
  }
};

const describeIndex = (value, type) => {
  if (typeof value !== 'number') {
    return {
      label: 'No data',
      color: 'text-gray-400'
    };
  }

  if (type === 'ndvi') {
    if (value >= 0.6) return { label: 'Dense Vegetation', color: 'text-emerald-300' };
    if (value >= 0.3) return { label: 'Healthy Growth', color: 'text-emerald-200' };
    if (value >= 0) return { label: 'Sparse Cover', color: 'text-amber-200' };
    return { label: 'Stressed Vegetation', color: 'text-red-300' };
  }

  if (type === 'ndwi') {
    if (value >= 0.5) return { label: 'Water Rich', color: 'text-cyan-200' };
    if (value >= 0.2) return { label: 'Adequate Moisture', color: 'text-cyan-100' };
    if (value >= 0) return { label: 'Drying Conditions', color: 'text-amber-200' };
    return { label: 'Water Stress', color: 'text-red-300' };
  }

  return {
    label: 'No data',
    color: 'text-gray-400'
  };
};

const SchemesBenefits = ({ userData }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    let mounted = true;
    const fetchRecommendedSchemes = async () => {
      setLoading(true);
      setError('');
      try {
        let query = supabase
          .from('pattas')
          .select(
            'id, patta_id, holder_name, owner_id, village, district, state, area_hectares, status, recommended_schemes, ndvi_index, ndwi_index, scheme_priority, updated_at, date_verified, created_at'
          )
          .order('updated_at', { ascending: false, nullsLast: false })
          .limit(500);

        if (userData && userData.id && userData.role !== 'admin') {
          query = query.eq('owner_id', userData.id);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) {
          throw fetchError;
        }

        const normalized = (data || [])
          .map((patta) => extractPattaWithSchemes(patta))
          .filter(Boolean);

        if (mounted) {
          setRecords(normalized);
        }
      } catch (err) {
        console.error('Failed to load recommended schemes', err);
        if (mounted) {
          setError('Unable to load recommended schemes right now. Please try again in a moment.');
          setRecords([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendedSchemes();
    return () => {
      mounted = false;
    };
  }, [userData]);

  const aggregatedSchemes = useMemo(
    () =>
      records.flatMap((record) =>
        record.recommendedSchemes.map((scheme) => ({
          ...scheme,
          pattaId: record.pattaId,
          holderName: record.holderName,
          village: record.location?.village,
          priority: scheme.priority || 'universal'
        }))
      ),
    [records]
  );

  const categoryOptions = useMemo(() => {
    const entries = new Map();
    aggregatedSchemes.forEach((scheme) => {
      const label = scheme.category || 'General Welfare';
      const value = label.toLowerCase();
      if (!entries.has(value)) {
        entries.set(value, label);
      }
    });
    return Array.from(entries.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [aggregatedSchemes]);

  const priorityOptions = useMemo(() => {
    const available = new Set();
    records.forEach((record) => {
      record.recommendedSchemes.forEach((scheme) => {
        available.add(scheme.priority || 'universal');
      });
    });
    const baseOrder = ['high', 'medium', 'low', 'universal'];
    const extras = Array.from(available).filter((item) => !baseOrder.includes(item));
    return [...baseOrder.filter((item) => available.has(item)), ...extras];
  }, [records]);

  const overviewStats = useMemo(() => {
    const totalPattas = records.length;
    const totalSchemes = aggregatedSchemes.length;
    const highPriorityCount = aggregatedSchemes.filter((scheme) => scheme.priority === 'high').length;
    const scoredSchemes = aggregatedSchemes.filter((scheme) => scheme.score != null);
    const scoreAverage = scoredSchemes.length
      ? scoredSchemes.reduce((sum, scheme) => sum + scheme.score, 0) / scoredSchemes.length
      : null;

    return {
      totalPattas,
      totalSchemes,
      highPriorityCount,
      scoreAverage
    };
  }, [records, aggregatedSchemes]);

  const categorySnapshot = useMemo(() => {
    const snapshot = new Map();
    aggregatedSchemes.forEach((scheme) => {
      const category = scheme.category || 'General Welfare';
      if (!snapshot.has(category)) {
        snapshot.set(category, {
          total: 0,
          highPriority: 0,
          scoreSum: 0,
          scoreCount: 0
        });
      }
      const entry = snapshot.get(category);
      entry.total += 1;
      if (scheme.priority === 'high') {
        entry.highPriority += 1;
      }
      if (scheme.score != null) {
        entry.scoreSum += scheme.score;
        entry.scoreCount += 1;
      }
    });

    return Array.from(snapshot.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        highPriority: data.highPriority,
        avgScore: data.scoreCount ? data.scoreSum / data.scoreCount : null
      }))
      .sort((a, b) => b.total - a.total);
  }, [aggregatedSchemes]);

  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return records
      .map((record) => {
        const baseSchemes = record.recommendedSchemes.filter((scheme) => {
          const priority = scheme.priority || 'universal';
          const category = (scheme.category || 'General Welfare').toLowerCase();
          const priorityMatches = priorityFilter === 'all' || priority === priorityFilter;
          const categoryMatches = categoryFilter === 'all' || category === categoryFilter;
          return priorityMatches && categoryMatches;
        });

        if (baseSchemes.length === 0) {
          return null;
        }

        if (!term) {
          const topScore = baseSchemes.reduce((max, scheme) => Math.max(max, scheme.score ?? 0), 0);
          return { ...record, schemes: baseSchemes, topScore };
        }

        const holderMatches = [
          record.holderName,
          record.pattaId,
          record.location?.village,
          record.location?.district,
          record.location?.state
        ].some((field) => field && field.toLowerCase().includes(term));

        const schemeMatches = baseSchemes.filter((scheme) => {
          const fields = [
            scheme.scheme_name,
            scheme.scheme_id,
            scheme.category,
            scheme.priority,
            ...(scheme.benefits || [])
          ];
          return fields.some((field) => field && field.toLowerCase().includes(term));
        });

        if (holderMatches) {
          const schemesToShow = schemeMatches.length > 0 ? schemeMatches : baseSchemes;
          const topScore = schemesToShow.reduce((max, scheme) => Math.max(max, scheme.score ?? 0), 0);
          return { ...record, schemes: schemesToShow, topScore };
        }

        if (schemeMatches.length === 0) {
          return null;
        }

        const topScore = schemeMatches.reduce((max, scheme) => Math.max(max, scheme.score ?? 0), 0);
        return { ...record, schemes: schemeMatches, topScore };
      })
      .filter(Boolean)
      .filter((entry) => (entry.schemes || []).length > 0)
      .sort((a, b) => {
        if (b.topScore !== a.topScore) {
          return b.topScore - a.topScore;
        }
        return (a.holderName || '').localeCompare(b.holderName || '');
      });
  }, [records, searchTerm, priorityFilter, categoryFilter]);

  const renderEmptyState = () => (
    <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center">
      <Award className="h-16 w-16 text-blue-600 mx-auto mb-6" />
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">No recommendations yet</h3>
      <p className="text-gray-600 max-w-2xl mx-auto">
        We could not find any scheme recommendations that match your current filters. Try broadening the filters or check back after new land assessments are synced.
      </p>
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-3xl p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded-xl w-1/3 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="h-20 bg-gray-200 rounded-2xl" />
            <div className="h-20 bg-gray-200 rounded-2xl" />
            <div className="h-20 bg-gray-200 rounded-2xl" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((__, innerIndex) => (
              <div key={innerIndex} className="h-20 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <header className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 uppercase tracking-[0.2em]">
                <Sparkles className="h-4 w-4" />
                Intelligent scheme intelligence
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">
                Schemes &amp; Benefits Aligned With Land Insights
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Explore dynamically generated scheme recommendations powered by your land&apos;s NDVI / NDWI analysis, NDVI health, and socio-economic indicators. Every recommendation is fetched live from Supabase and automatically ranked by suitability.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to load recommendations</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(59, 130, 246, 0.3)'}}>
                <Sparkles className="h-6 w-6 text-blue-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-600">Total Recommendations</p>
              <p className="text-3xl font-bold text-gray-900">{overviewStats.totalSchemes}</p>
              <p className="text-sm text-gray-500 mt-2">Across {overviewStats.totalPattas} pattas with live AI scoring</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(239, 68, 68, 0.3)'}}>
                <AlertTriangle className="h-6 w-6 text-red-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-600">High Priority Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{overviewStats.highPriorityCount}</p>
              <p className="text-sm text-gray-500 mt-2">Schemes needing immediate action</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(20, 184, 166, 0.3)'}}>
                <TrendingUp className="h-6 w-6 text-teal-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-600">Average Suitability Score</p>
              <p className="text-3xl font-bold text-gray-900">
                {overviewStats.scoreAverage != null ? overviewStats.scoreAverage.toFixed(1) : '—'}
              </p>
              <p className="text-sm text-gray-500 mt-2">Calculated from Supabase assessments</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(147, 51, 234, 0.3)'}}>
                <Layers className="h-6 w-6 text-purple-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-600">Unique Categories</p>
              <p className="text-3xl font-bold text-gray-900">{categoryOptions.length}</p>
              <p className="text-sm text-gray-500 mt-2">Diverse program clusters discovered</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-200/50 space-y-6 transform hover:scale-[1.005] transition-all duration-500" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by holder, patta, village, scheme or benefit keyword..."
                className="w-full bg-white border-2 border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 rounded-lg pl-12 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 transition-all" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'}}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white border-2 border-gray-200/50 rounded-lg px-4 py-2" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'}}>
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Priority</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPriorityFilter('all')}
                    className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                      priorityFilter === 'all'
                        ? 'bg-teal-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All
                  </button>
                  {priorityOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setPriorityFilter(option)}
                      className={`text-xs px-3 py-1.5 rounded-md capitalize transition-colors ${
                        priorityFilter === option
                          ? 'bg-teal-800 text-white'
                          : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="appearance-none bg-white border-2 border-gray-200/50 rounded-lg px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'}}
                >
                  <option value="all">All categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 rotate-90" />
              </div>
            </div>
          </div>
        </section>

        {loading && renderSkeleton()}
        {!loading && filteredRecords.length === 0 && renderEmptyState()}

        {!loading && filteredRecords.length > 0 && (
          <section className="space-y-6">
            {filteredRecords.map((record) => {
              const ndviMeta = describeIndex(record.ndvi, 'ndvi');
              const ndwiMeta = describeIndex(record.ndwi, 'ndwi');

              return (
                <article
                  key={record.id}
                  className="bg-white border-2 border-gray-200/50 rounded-3xl p-6 sm:p-8 hover:border-blue-500/40 transition-all transform hover:scale-[1.005] duration-500" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}
                >
                  <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold text-gray-900">{record.holderName}</h2>
                        <span className="text-xs uppercase tracking-[0.2em] text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                          Patta {record.pattaId}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full ${getPriorityClass(record.schemePriority)}`}>
                          {record.schemePriority ? record.schemePriority.replace(/_/g, ' ') : 'Balanced focus'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {[record.location?.village, record.location?.district, record.location?.state]
                            .filter(Boolean)
                            .join(', ') || 'Location not recorded'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          {formatDateTime(record.updatedAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-gray-500">
                          <Info className="h-4 w-4" />
                          {record.status?.toUpperCase() || 'STATUS UNKNOWN'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-2">
                      <span className="text-sm text-gray-600">Top suitability</span>
                      <span className="text-3xl font-semibold text-teal-700">{Math.round(record.topScore || 0)} / 100</span>
                    </div>
                  </header>

                  <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'}}>
                      <p className="text-xs uppercase tracking-wide text-gray-600 mb-2">Territorial extent</p>
                      <p className="text-xl font-semibold text-gray-900">{formatArea(record.area)}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'}}>
                      <p className="text-xs uppercase tracking-wide text-gray-600 mb-2">NDVI health</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-semibold text-gray-900">{record.ndvi?.toFixed(3) ?? '—'}</p>
                        <span className={`text-xs font-medium ${ndviMeta.color}`}>{ndviMeta.label}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'}}>
                      <p className="text-xs uppercase tracking-wide text-gray-600 mb-2">NDWI moisture</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-semibold text-gray-900">{record.ndwi?.toFixed(3) ?? '—'}</p>
                        <span className={`text-xs font-medium ${ndwiMeta.color}`}>{ndwiMeta.label}</span>
                      </div>
                    </div>
                  </section>

                  <section className="mt-8 space-y-4">
                    {record.schemes.map((scheme) => (
                      <div
                        key={`${record.id}-${scheme.scheme_id || scheme.scheme_name}`}
                        className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-blue-500/40 transition-all" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'}}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="bg-blue-100 text-blue-700 rounded-2xl p-2">
                                <Award className="h-5 w-5" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900">{scheme.scheme_name}</h3>
                              <span className={`text-xs px-3 py-1 rounded-full ${getCategoryClass(scheme.category)}`}>
                                {scheme.category || 'General Welfare'}
                              </span>
                              <span className={`text-xs px-3 py-1 rounded-full ${getPriorityClass(scheme.priority)}`}>
                                {getPriorityLabel(scheme.priority)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="inline-flex items-center gap-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                Suitability Score: <span className="text-gray-900 font-medium">{formatScore(scheme.score)}</span>
                              </span>
                              {scheme.amount && (
                                <span className="inline-flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-emerald-600" />
                                  Support: <span className="text-gray-900 font-medium">{scheme.amount}</span>
                                </span>
                              )}
                              {scheme.frequency && (
                                <span className="inline-flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-amber-600" />
                                  Frequency: <span className="text-gray-900 font-medium">{scheme.frequency}</span>
                                </span>
                              )}
                            </div>
                            {scheme.benefits?.length > 0 && (
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm text-gray-700">
                                {scheme.benefits.slice(0, 6).map((benefit, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {scheme.description && (
                              <p className="text-sm text-gray-600 mt-3">{scheme.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-3 min-w-[12rem]">
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                              <p className="text-xs uppercase tracking-wide text-blue-700 mb-2">Implementation fit</p>
                              <p className="text-2xl font-semibold text-blue-800">{Math.round(scheme.score ?? 0)}</p>
                              <p className="text-xs text-blue-600">Higher score indicates stronger suitability for this land parcel</p>
                            </div>
                            {scheme.coverage && (
                              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-700">
                                <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">Coverage</p>
                                <p>{scheme.coverage}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>
                </article>
              );
            })}
          </section>
        )}

        {!loading && categorySnapshot.length > 0 && (
          <section className="bg-white border-2 border-gray-200/50 rounded-3xl p-6 sm:p-8 space-y-6 transform hover:scale-[1.005] transition-all duration-500" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Category snapshot</h2>
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categorySnapshot.map((entry) => (
                <div
                  key={entry.category}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col gap-3" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'}}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{entry.category}</p>
                    <span className="text-xs text-gray-600">{entry.total} schemes</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-semibold text-teal-700">{entry.highPriority}</p>
                    <span className="text-sm text-gray-600">high priority</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Avg score: {entry.avgScore != null ? entry.avgScore.toFixed(1) : '—'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </>
  );
};

export default SchemesBenefits;