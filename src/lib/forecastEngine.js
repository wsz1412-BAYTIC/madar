// Occupancy Forecast Engine - calculates 30-day forecasts using multiple factors

export const calculateForecast = (property, historicalData, marketData, events, leadTimeData) => {
  const today = new Date();
  const forecastDays = 30;
  const forecastEndDate = new Date(today.getTime() + forecastDays * 24 * 60 * 60 * 1000);

  // Factor 1: Historical property performance (25%)
  const historicalOccupancy = historicalData?.avgOccupancy || 0.5;
  const historicalTrend = historicalData?.trend || 0; // -1 to 1

  // Factor 2: Local market occupancy (20%)
  const marketOccupancy = marketData?.avgOccupancy || 0.55;
  const marketSeasonal = getSeasonalMultiplier(today);

  // Factor 3: Competitor performance (15%)
  const competitorOccupancy = marketData?.competitorAvg || 0.52;
  const priceCompetitiveness = calculatePriceCompetitiveness(
    property.currentPrice,
    marketData?.avgPrice || 250
  );

  // Factor 4: Lead time data (15%)
  const leadTimeBookingRate = leadTimeData?.bookingRate || 0.4;
  const daysBooked = leadTimeData?.daysBooked || 8;

  // Factor 5: Seasonal & event impact (15%)
  const eventBoost = calculateEventBoost(events, today);
  const holidayMultiplier = getHolidayMultiplier(today);

  // Factor 6: Current property price vs market (10%)
  const pricePositioning = calculatePricePositioning(
    property.currentPrice,
    marketData?.avgPrice || 250,
    marketData?.priceRange?.min || 200,
    marketData?.priceRange?.max || 350
  );

  // Weighted calculation
  const baseForecast =
    (historicalOccupancy * 0.25) +
    (marketOccupancy * marketSeasonal * 0.2) +
    (competitorOccupancy * 0.15) +
    ((leadTimeBookingRate + daysBooked / 30) / 2 * 0.15) +
    ((marketOccupancy + eventBoost) / 2 * 0.15) +
    (pricePositioning * 0.1);

  // Apply trend
  const trendedForecast = baseForecast + (historicalTrend * 0.05);

  // Calculate confidence score based on data availability
  const dataQuality = [
    historicalData?.confidence || 0,
    marketData?.confidence || 0,
    leadTimeData?.confidence || 0,
    events?.length > 0 ? 0.8 : 0.2,
  ];
  const confidenceScore = dataQuality.reduce((a, b) => a + b) / dataQuality.length;

  return {
    forecastedOccupancy: Math.min(1, Math.max(0, trendedForecast)),
    forecastPeriod: `${today.toLocaleDateString()} - ${forecastEndDate.toLocaleDateString()}`,
    forecastDays,
    confidence: getConfidenceLevel(confidenceScore),
    confidenceScore,
    factors: {
      historical: { value: historicalOccupancy, weight: 0.25, trend: historicalTrend },
      market: { value: marketOccupancy * marketSeasonal, weight: 0.2, seasonal: marketSeasonal },
      competitor: { value: competitorOccupancy, weight: 0.15, priceCompetitiveness },
      leadTime: { value: (leadTimeBookingRate + daysBooked / 30) / 2, weight: 0.15, daysBooked },
      events: { value: eventBoost, weight: 0.15, eventCount: events?.length || 0 },
      pricing: { value: pricePositioning, weight: 0.1, priceComparison: property.currentPrice / (marketData?.avgPrice || 250) },
    },
  };
};

const getSeasonalMultiplier = (date) => {
  const month = date.getMonth();
  // Higher demand in summer months (5-7) and holidays
  const seasonalProfile = [0.8, 0.8, 0.9, 0.95, 1.0, 1.2, 1.3, 1.25, 0.95, 0.9, 1.1, 1.15];
  return seasonalProfile[month];
};

const getHolidayMultiplier = (date) => {
  // Saudi holidays: Eid Al-Fitr, Eid Al-Adha, Saudi National Day
  const month = date.getMonth();
  const day = date.getDate();

  // Approximate holiday periods
  if ((month === 3 && day > 20) || (month === 4 && day < 10)) return 1.3; // Eid Al-Fitr
  if ((month === 5 && day > 15) || (month === 6 && day < 20)) return 1.35; // Eid Al-Adha
  if (month === 8 && day === 23) return 1.25; // Saudi National Day

  return 1.0;
};

const calculateEventBoost = (events, date) => {
  if (!events || events.length === 0) return 0;

  let boost = 0;
  events.forEach(event => {
    const eventDate = new Date(event.date);
    const daysUntilEvent = (eventDate - date) / (1000 * 60 * 60 * 24);

    if (daysUntilEvent >= 0 && daysUntilEvent <= 30) {
      // Closer events have higher impact, weighted by importance
      const proximity = 1 - daysUntilEvent / 30;
      const importance = event.importance || 0.5; // 0-1
      boost += proximity * importance * 0.2;
    }
  });

  return Math.min(0.3, boost); // Cap at 30% boost
};

const calculatePriceCompetitiveness = (propertyPrice, marketAvg) => {
  const ratio = propertyPrice / marketAvg;

  if (ratio < 0.85) return 1.2; // Significantly underpriced - high demand
  if (ratio < 0.95) return 1.1; // Slightly underpriced
  if (ratio < 1.05) return 1.0; // Competitive
  if (ratio < 1.15) return 0.9; // Slightly overpriced
  return 0.7; // Significantly overpriced
};

const calculatePricePositioning = (propertyPrice, marketAvg, minPrice, maxPrice) => {
  const range = maxPrice - minPrice;
  const position = (propertyPrice - minPrice) / range;
  const normalized = Math.min(1, Math.max(0, position));

  // Optimal position is slightly below average
  const optimalRatio = 0.45;
  return 1 - Math.abs(normalized - optimalRatio) * 0.5;
};

const getConfidenceLevel = (score) => {
  if (score >= 0.75) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
};

export const generateAlertRecommendations = (forecast, property, marketData) => {
  const occupancy = forecast.forecastedOccupancy;
  const recommendations = [];

  // Price adjustment recommendations
  if (occupancy < 0.4 && property.currentPrice > marketData?.avgPrice) {
    recommendations.push({
      id: 'price_reduction',
      action: 'Adjusting the nightly rate',
      description: 'Lower your rate by 10-15% to boost competitiveness',
      impact: 'Could increase occupancy by 15-20%',
      priority: 'high',
    });
  }

  // Early booking discount
  if (occupancy < 0.5 && forecast.factors.leadTime.daysBooked < 10) {
    recommendations.push({
      id: 'early_booking',
      action: 'Adding an early-booking discount',
      description: 'Offer 10-15% discount for bookings 2+ weeks in advance',
      impact: 'Encourages early commitments, improves forecasting',
      priority: 'medium',
    });
  }

  // Longer-stay promotion
  if (occupancy < 0.45) {
    recommendations.push({
      id: 'longer_stay',
      action: 'Offering a longer-stay promotion',
      description: 'Provide 20% discount for 7+ day stays',
      impact: 'Increases average booking length and occupancy',
      priority: 'medium',
    });
  }

  // Minimum stay adjustment
  if (occupancy < 0.35 && property.minimumStay > 2) {
    recommendations.push({
      id: 'min_stay',
      action: 'Changing minimum-stay rules',
      description: 'Reduce minimum stay requirement to 1-2 nights',
      impact: 'Attracts short-term travelers, increases flexibility',
      priority: 'high',
    });
  }

  // Content improvement
  if (occupancy < 0.3) {
    recommendations.push({
      id: 'content',
      action: 'Improving listing content or images',
      description: 'Add more high-quality photos and detailed descriptions',
      impact: 'Improves conversion rate from views to bookings',
      priority: 'medium',
    });
  }

  // Open blocked dates
  if (occupancy < 0.4 && property.blockedDates > 2) {
    recommendations.push({
      id: 'blocked_dates',
      action: 'Opening blocked dates',
      description: 'Review and unblock selective dates to increase availability',
      impact: 'Increases booking opportunities',
      priority: 'low',
    });
  }

  // Competitor analysis
  recommendations.push({
    id: 'competitor_review',
    action: 'Reviewing competitor pricing',
    description: `Market average is ${marketData?.avgPrice || 250} SAR. You're at ${property.currentPrice} SAR`,
    impact: 'Stay informed about market positioning',
    priority: 'low',
  });

  return recommendations;
};

export const calculateAlertSeverity = (forecastedOccupancy, targetOccupancy, confidence) => {
  const gap = targetOccupancy - forecastedOccupancy;

  // Adjust severity based on confidence
  const confidenceWeight = confidence === 'high' ? 1 : confidence === 'medium' ? 0.7 : 0.4;

  if (gap > 0.25) return 'high'; // 25%+ below target
  if (gap > 0.15) return 'medium'; // 15-25% below target
  if (gap > 0.05) return 'low'; // 5-15% below target

  return null; // No alert needed
};

export const estimateRevenueAtRisk = (property, forecast, targetOccupancy) => {
  const forecastedOccupancy = forecast.forecastedOccupancy;
  const daysInForecast = forecast.forecastDays;

  const currentExpectedDays = daysInForecast * forecastedOccupancy;
  const targetExpectedDays = daysInForecast * targetOccupancy;
  const lostDays = Math.max(0, targetExpectedDays - currentExpectedDays);

  const avgPrice = property.currentPrice || 250;
  const revenueAtRisk = lostDays * avgPrice;

  return {
    lostBookingDays: Math.round(lostDays),
    estimatedRevenueLoss: Math.round(revenueAtRisk),
    daysInForecast,
  };
};