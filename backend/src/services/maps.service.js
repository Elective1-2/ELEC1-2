const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Get distance and duration between two locations
 * @param {string} origin - Starting location (address or lat,lng)
 * @param {string} destination - Destination location
 * @returns {Promise<{distance: string, duration: number, durationText: string}>}
 */
async function getDistanceMatrix(origin, destination) {
  try {
    const response = await client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: GOOGLE_MAPS_API_KEY,
        units: 'metric',
      },
    });

    const element = response.data.rows[0].elements[0];

    if (element.status !== 'OK') {
      throw new Error(`Distance matrix failed: ${element.status}`);
    }

    return {
      distance: element.distance.text,
      distanceMeters: element.distance.value,
      duration: Math.round(element.duration.value / 60), // minutes
      durationText: element.duration.text,
    };
  } catch (error) {
    console.error('Distance matrix error:', error.message);
    throw error;
  }
}

/**
 * Get ETA with traffic consideration
 * @param {string} origin - Starting location
 * @param {string} destination - Destination location
 * @param {string} departureTime - Optional departure time (default: now)
 * @returns {Promise<{etaMinutes: number, etaText: string, distance: string}>}
 */
async function getETAWithTraffic(origin, destination, departureTime = 'now') {
  try {
    const response = await client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: GOOGLE_MAPS_API_KEY,
        departure_time: departureTime === 'now' ? 'now' : new Date(departureTime),
        traffic_model: 'best_guess',
        units: 'metric',
      },
    });

    const element = response.data.rows[0].elements[0];

    if (element.status !== 'OK') {
      throw new Error(`ETA calculation failed: ${element.status}`);
    }

    // Use duration_in_traffic if available, otherwise use duration
    const durationInTraffic = element.duration_in_traffic || element.duration;
    
    return {
      etaMinutes: Math.round(durationInTraffic.value / 60),
      etaText: durationInTraffic.text,
      distance: element.distance.text,
      distanceMeters: element.distance.value,
      baseDuration: element.duration ? Math.round(element.duration.value / 60) : null,
    };
  } catch (error) {
    console.error('ETA with traffic error:', error.message);
    throw error;
  }
}

/**
 * Geocode an address to coordinates
 * @param {string} address - Street address
 * @returns {Promise<{lat: number, lng: number, formattedAddress: string}>}
 */
async function geocodeAddress(address) {
  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== 'OK' || response.data.results.length === 0) {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    const result = response.data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>}
 */
async function reverseGeocode(lat, lng) {
  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== 'OK' || response.data.results.length === 0) {
      throw new Error(`Reverse geocoding failed: ${response.data.status}`);
    }

    return response.data.results[0].formatted_address;
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    throw error;
  }
}

/**
 * Get directions with waypoints
 * @param {string} origin - Starting point
 * @param {string} destination - End point
 * @param {string[]} waypoints - Optional waypoints
 * @returns {Promise<{polyline: string, steps: Array, duration: number, distance: string}>}
 */
async function getDirections(origin, destination, waypoints = []) {
  try {
    const params = {
      origin: origin,
      destination: destination,
      key: GOOGLE_MAPS_API_KEY,
      mode: 'driving',
    };

    if (waypoints.length > 0) {
      params.waypoints = waypoints;
    }

    const response = await client.directions({ params });

    if (response.data.status !== 'OK') {
      throw new Error(`Directions failed: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      polyline: route.overview_polyline.points,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text,
        lat: step.start_location.lat,
        lng: step.start_location.lng,
      })),
      duration: Math.round(leg.duration.value / 60),
      durationText: leg.duration.text,
      distance: leg.distance.text,
      distanceMeters: leg.distance.value,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
    };
  } catch (error) {
    console.error('Directions error:', error.message);
    throw error;
  }
}

module.exports = {
  getDistanceMatrix,
  getETAWithTraffic,
  geocodeAddress,
  reverseGeocode,
  getDirections,
};