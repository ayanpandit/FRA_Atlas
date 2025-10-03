const splitBenefits = (benefits) => {
  if (!benefits) return [];
  if (Array.isArray(benefits)) {
    return benefits
      .map((item) => (item == null ? '' : String(item).trim()))
      .filter((item) => item.length > 0);
  }

  if (typeof benefits === 'string') {
    return benefits
      .split(/[•,;\n]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
};

const ensurePriority = (priority) => {
  if (!priority) return 'universal';
  const normalized = String(priority).toLowerCase();
  if (['high', 'medium', 'low', 'universal'].includes(normalized)) {
    return normalized;
  }
  return 'universal';
};

const randomId = () => `scheme_${Math.random().toString(36).slice(2, 8)}`;

const normalizeScheme = (rawScheme) => {
  if (!rawScheme) return null;

  if (typeof rawScheme === 'string') {
    return {
      scheme_id: rawScheme,
      scheme_name: rawScheme,
      category: 'General Welfare',
      priority: 'universal',
      score: null,
      benefits: [],
      description: '',
      amount: null,
      frequency: null,
      coverage: null,
      raw: rawScheme,
    };
  }

  if (typeof rawScheme !== 'object') {
    return null;
  }

  const schemeId = rawScheme.scheme_id || rawScheme.id || rawScheme.code || rawScheme.scheme_name || randomId();
  const schemeName = rawScheme.scheme_name || rawScheme.name || rawScheme.title || schemeId;
  const category = rawScheme.category || rawScheme.focus || 'General Welfare';
  const priority = ensurePriority(rawScheme.priority);
  const scoreValue = rawScheme.score ?? rawScheme.suitability_score ?? rawScheme.weight ?? null;

  let numericScore = null;
  if (typeof scoreValue === 'number') {
    numericScore = Number.isFinite(scoreValue) ? scoreValue : null;
  } else if (typeof scoreValue === 'string') {
    const parsed = Number.parseFloat(scoreValue);
    numericScore = Number.isFinite(parsed) ? parsed : null;
  }

  return {
    scheme_id: schemeId,
    scheme_name: schemeName,
    category,
    priority,
    score: numericScore,
    benefits: splitBenefits(rawScheme.benefits),
    description: rawScheme.description || rawScheme.summary || '',
    amount: rawScheme.amount ?? rawScheme.benefit_amount ?? rawScheme.support_amount ?? null,
    frequency: rawScheme.frequency || rawScheme.disbursement_frequency || null,
    coverage: rawScheme.coverage || rawScheme.covered_area || null,
    provider: rawScheme.provider || rawScheme.department || null,
    raw: rawScheme,
  };
};

export const parseRecommendedSchemes = (value) => {
  if (!value) return [];

  let payload = value;
  if (typeof value === 'string') {
    try {
      payload = JSON.parse(value);
    } catch (error) {
      console.warn('Unable to parse recommended_schemes JSON string', error);
      return [];
    }
  }

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry) => {
      try {
        return normalizeScheme(entry);
      } catch (error) {
        console.warn('Unable to normalize recommended scheme entry', error, entry);
        return null;
      }
    })
    .filter(Boolean);
};

export const extractPattaWithSchemes = (patta) => {
  if (!patta) {
    return null;
  }

  const schemes = parseRecommendedSchemes(patta.recommended_schemes);
  if (schemes.length === 0) {
    return null;
  }

  return {
    id: patta.id,
    pattaId: patta.patta_id,
    holderName: patta.holder_name || 'Unknown Holder',
    ownerId: patta.owner_id || null,
    location: {
      village: patta.village || '',
      district: patta.district || '',
      state: patta.state || '',
    },
    status: patta.status || 'pending',
    area: typeof patta.area_hectares === 'number' ? patta.area_hectares : null,
    ndvi: typeof patta.ndvi_index === 'number' ? patta.ndvi_index : null,
    ndwi: typeof patta.ndwi_index === 'number' ? patta.ndwi_index : null,
    schemePriority: patta.scheme_priority || 'balanced',
    updatedAt: patta.updated_at || patta.date_verified || patta.created_at || null,
    recommendedSchemes: schemes,
  };
};

export const flattenRecommendedSchemes = (pattas) => {
  if (!Array.isArray(pattas)) {
    return [];
  }

  const collection = [];
  pattas.forEach((patta) => {
    const normalized = extractPattaWithSchemes(patta);
    if (!normalized) return;

    normalized.recommendedSchemes.forEach((scheme) => {
      collection.push({
        ...scheme,
        pattaId: normalized.pattaId,
        holderName: normalized.holderName,
        ownerId: normalized.ownerId,
        status: normalized.status,
        area: normalized.area,
        ndvi: normalized.ndvi,
        ndwi: normalized.ndwi,
      });
    });
  });

  return collection;
};
