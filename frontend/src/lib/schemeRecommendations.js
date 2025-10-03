// Scheme Recommendation Engine
// Based on NDVI/NDWI analysis and land characteristics

export const SCHEME_DEFINITIONS = {
  'PM_KISAN': {
    id: 'PM_KISAN',
    name: 'PM-Kisan Samman Nidhi',
    icon: '🌾',
    category: 'Direct Benefit Transfer',
    description: 'Income support to land holding farmers',
    eligibility: {
      minAreaHectares: 0.1,
      maxAreaHectares: 100,
      ndviRange: [0.0, 1.0], // All NDVI ranges
      ndwiRange: [-1.0, 1.0], // All NDWI ranges
      priority: 'universal'
    },
    benefits: 'Rs. 6000/year in 3 installments',
    documents: ['Patta/Land Records', 'Aadhaar Card', 'Bank Account']
  },
  
  'WATERSHED_DEVELOPMENT': {
    id: 'WATERSHED_DEVELOPMENT',
    name: 'Watershed Development Program',
    icon: '🏞️',
    category: 'Water Conservation',
    description: 'Soil and water conservation for sustainable agriculture',
    eligibility: {
      minAreaHectares: 0.5,
      maxAreaHectares: 50,
      ndviRange: [0.0, 0.6], // Low to moderate vegetation
      ndwiRange: [-1.0, 0.3], // Low to moderate water content
      priority: 'high'
    },
    benefits: 'Soil conservation, water harvesting structures',
    documents: ['Land Records', 'Community Consent', 'Survey Report']
  },

  'AFFORESTATION_PROGRAM': {
    id: 'AFFORESTATION_PROGRAM',
    name: 'National Afforestation Programme',
    icon: '🌳',
    category: 'Forest Development',
    description: 'Plantation and forest cover enhancement',
    eligibility: {
      minAreaHectares: 1.0,
      maxAreaHectares: 100,
      ndviRange: [0.0, 0.5], // Poor to moderate vegetation
      ndwiRange: [-1.0, 1.0], // All water ranges
      priority: 'high'
    },
    benefits: 'Plantation support, maintenance funds, carbon credits',
    documents: ['Forest Rights Certificate', 'Plantation Plan', 'GPS Survey']
  },

  'JAL_JEEVAN_MISSION': {
    id: 'JAL_JEEVAN_MISSION',
    name: 'Jal Jeevan Mission',
    icon: '💧',
    category: 'Water Supply',
    description: 'Piped water supply to rural households',
    eligibility: {
      minAreaHectares: 0.0,
      maxAreaHectares: 100,
      ndviRange: [0.0, 1.0], // All ranges
      ndwiRange: [-1.0, 0.2], // Low water availability areas
      priority: 'high'
    },
    benefits: 'Piped water connection, water quality assurance',
    documents: ['Household Survey', 'Community Participation', 'Technical Survey']
  },

  'MGNREGA': {
    id: 'MGNREGA',
    name: 'Mahatma Gandhi NREGA',
    icon: '🏗️',
    category: 'Employment Guarantee',
    description: '100 days guaranteed wage employment',
    eligibility: {
      minAreaHectares: 0.0,
      maxAreaHectares: 100,
      ndviRange: [0.0, 1.0], // All ranges
      ndwiRange: [-1.0, 1.0], // All ranges
      priority: 'universal'
    },
    benefits: 'Guaranteed employment, skill development, asset creation',
    documents: ['Job Card', 'Aadhaar Card', 'Bank Account']
  },

  'SOIL_HEALTH_CARD': {
    id: 'SOIL_HEALTH_CARD',
    name: 'Soil Health Card Scheme',
    icon: '🧪',
    category: 'Soil Management',
    description: 'Soil testing and nutrient management',
    eligibility: {
      minAreaHectares: 0.1,
      maxAreaHectares: 100,
      ndviRange: [0.0, 0.7], // Areas needing soil improvement
      ndwiRange: [-1.0, 1.0], // All water ranges
      priority: 'medium'
    },
    benefits: 'Free soil testing, fertilizer recommendations, nutrient management',
    documents: ['Land Records', 'Soil Samples', 'Farmer Registration']
  },

  'PRADHAN_MANTRI_FASAL_BIMA': {
    id: 'PRADHAN_MANTRI_FASAL_BIMA',
    name: 'PM Fasal Bima Yojana',
    icon: '🛡️',
    category: 'Crop Insurance',
    description: 'Comprehensive crop insurance coverage',
    eligibility: {
      minAreaHectares: 0.1,
      maxAreaHectares: 100,
      ndviRange: [0.2, 1.0], // Areas with cultivation
      ndwiRange: [-1.0, 1.0], // All water ranges
      priority: 'medium'
    },
    benefits: 'Crop loss compensation, premium subsidy, risk mitigation',
    documents: ['Land Records', 'Crop Details', 'Bank Account', 'Aadhaar Card']
  },

  'KISAN_CREDIT_CARD': {
    id: 'KISAN_CREDIT_CARD',
    name: 'Kisan Credit Card',
    icon: '💳',
    category: 'Credit Support',
    description: 'Easy access to institutional credit for farmers',
    eligibility: {
      minAreaHectares: 0.1,
      maxAreaHectares: 100,
      ndviRange: [0.2, 1.0], // Active agricultural areas
      ndwiRange: [-1.0, 1.0], // All water ranges
      priority: 'medium'
    },
    benefits: 'Low interest credit, flexible repayment, insurance coverage',
    documents: ['Land Records', 'Identity Proof', 'Address Proof', 'Income Certificate']
  },

  'SKILL_DEVELOPMENT': {
    id: 'SKILL_DEVELOPMENT',
    name: 'Skill Development Program',
    icon: '🎓',
    category: 'Capacity Building',
    description: 'Vocational training and skill enhancement',
    eligibility: {
      minAreaHectares: 0.0,
      maxAreaHectares: 100,
      ndviRange: [0.0, 1.0], // All ranges
      ndwiRange: [-1.0, 1.0], // All ranges
      priority: 'low'
    },
    benefits: 'Free training, certification, placement assistance',
    documents: ['Educational Certificates', 'Identity Proof', 'Training Application']
  }
};

/**
 * Calculate scheme eligibility score based on NDVI/NDWI and land characteristics
 */
export function calculateSchemeScore(patta, scheme) {
  let score = 0;
  const { ndvi_index, ndwi_index, area_hectares } = patta;
  const { eligibility } = scheme;

  // Area eligibility (20% weight)
  if (area_hectares >= eligibility.minAreaHectares && area_hectares <= eligibility.maxAreaHectares) {
    score += 20;
  }

  // NDVI compatibility (40% weight)
  const ndvi = ndvi_index || 0;
  if (ndvi >= eligibility.ndviRange[0] && ndvi <= eligibility.ndviRange[1]) {
    score += 40;
    // Bonus for optimal NDVI range
    const ndviMid = (eligibility.ndviRange[0] + eligibility.ndviRange[1]) / 2;
    const ndviDistance = Math.abs(ndvi - ndviMid);
    const maxDistance = (eligibility.ndviRange[1] - eligibility.ndviRange[0]) / 2;
    const proximityBonus = 10 * (1 - (ndviDistance / maxDistance));
    score += proximityBonus;
  }

  // NDWI compatibility (30% weight)
  const ndwi = ndwi_index || 0;
  if (ndwi >= eligibility.ndwiRange[0] && ndwi <= eligibility.ndwiRange[1]) {
    score += 30;
    // Bonus for optimal NDWI range
    const ndwiMid = (eligibility.ndwiRange[0] + eligibility.ndwiRange[1]) / 2;
    const ndwiDistance = Math.abs(ndwi - ndwiMid);
    const maxDistance = (eligibility.ndwiRange[1] - eligibility.ndwiRange[0]) / 2;
    const proximityBonus = 5 * (1 - (ndwiDistance / maxDistance));
    score += proximityBonus;
  }

  // Priority multiplier (10% weight)
  const priorityMultiplier = {
    high: 1.2,
    medium: 1.0,
    low: 0.8,
    universal: 1.1
  };
  score *= priorityMultiplier[eligibility.priority] || 1.0;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate recommended schemes for a patta based on analysis
 */
export function generateRecommendedSchemes(patta, maxRecommendations = 5) {
  const schemes = Object.values(SCHEME_DEFINITIONS);
  
  const scoredSchemes = schemes.map(scheme => ({
    ...scheme,
    score: calculateSchemeScore(patta, scheme)
  }));

  // Sort by score (descending) and take top recommendations
  const topSchemes = scoredSchemes
    .filter(scheme => scheme.score > 30) // Minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations);

  return topSchemes.map(scheme => ({
    scheme_id: scheme.id,
    scheme_name: scheme.name,
    score: Math.round(scheme.score),
    category: scheme.category,
    priority: scheme.eligibility.priority,
    benefits: scheme.benefits
  }));
}

/**
 * Update patta with recommended schemes
 */
export async function updatePattaRecommendations(supabase, pattaId, recommendations) {
  try {
    const { data, error } = await supabase
      .from('pattas')
      .update({ 
        recommended_schemes: recommendations,
        updated_at: new Date().toISOString()
      })
      .eq('patta_id', pattaId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating patta recommendations:', error);
    return { success: false, error };
  }
}

/**
 * Batch process all pattas to generate recommendations
 */
export async function batchGenerateRecommendations(supabase) {
  try {
    // Fetch all pattas with NDVI/NDWI data
    const { data: pattas, error: fetchError } = await supabase
      .from('pattas')
      .select('*')
      .not('ndvi_index', 'is', null)
      .not('ndwi_index', 'is', null);

    if (fetchError) throw fetchError;

    const results = [];
    
    for (const patta of pattas) {
      const recommendations = generateRecommendedSchemes(patta);
      
      if (recommendations.length > 0) {
        const updateResult = await updatePattaRecommendations(
          supabase, 
          patta.patta_id, 
          recommendations
        );
        
        results.push({
          patta_id: patta.patta_id,
          recommendations: recommendations.length,
          success: updateResult.success
        });
      }
    }

    return {
      success: true,
      processed: results.length,
      results
    };
  } catch (error) {
    console.error('Error in batch recommendation generation:', error);
    return { success: false, error };
  }
}