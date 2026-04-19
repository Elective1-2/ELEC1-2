const { Client } = require('@googlemaps/google-maps-services-js');

class GoogleMapsService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Snap GPS coordinates to actual road (reduces jitter, improves accuracy)
   */
  async snapToRoad(lat, lng) {
    if (!this.apiKey || process.env.SNAP_TO_ROAD !== 'true') {
      return { lat, lng };
    }

    try {
      const response = await this.client.roadsSnapToRoads({
        params: {
          path: `${lat},${lng}`,
          key: this.apiKey,
          interpolate: true
        }
      });
      
      if (response.data.snappedPoints && response.data.snappedPoints.length > 0) {
        const snapped = response.data.snappedPoints[0].location;
        return { lat: snapped.latitude, lng: snapped.longitude };
      }
      return { lat, lng };
    } catch (error) {
      console.error('[GoogleMaps] Road snapping failed:', error.response?.data?.error_message || error.message);
      return { lat, lng };
    }
  }

  /**
   * Get real-time traffic ETA between two points
   */
  async getTrafficETA(originLat, originLng, destLat, destLng, departureTime = 'now') {
    try {
      const response = await this.client.distancematrix({
        params: {
          origins: [`${originLat},${originLng}`],
          destinations: [`${destLat},${destLng}`],
          key: this.apiKey,
          departure_time: departureTime === 'now' ? 'now' : undefined,
          traffic_model: 'best_guess',
          units: 'metric'
        }
      });

      const element = response.data.rows[0]?.elements[0];
      
      if (!element || element.status !== 'OK') {
        throw new Error(`Distance Matrix API error: ${element?.status || 'No response'}`);
      }

      const durationNormal = element.duration.value; // seconds
      const durationTraffic = element.duration_in_traffic?.value || durationNormal;
      const distance = element.distance.value; // meters

      return {
        distanceKm: distance / 1000,
        durationTrafficMinutes: Math.round(durationTraffic / 60),
        durationNormalMinutes: Math.round(durationNormal / 60),
        delayMinutes: Math.round((durationTraffic - durationNormal) / 60),
        congestionLevel: this.getCongestionLevel(durationNormal / durationTraffic)
      };
    } catch (error) {
      console.error('[GoogleMaps] Traffic ETA error:', error.message);
      throw error;
    }
  }

  /**
   * Get full route with traffic segments (for congestion visualization)
   */
  async getRouteTraffic(originLat, originLng, destLat, destLng) {
    try {
      const response = await this.client.directions({
        params: {
          origin: `${originLat},${originLng}`,
          destination: `${destLat},${destLng}`,
          key: this.apiKey,
          departure_time: 'now',
          traffic_model: 'best_guess',
          alternatives: false
        }
      });

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      // Extract traffic segments from steps
      const segments = leg.steps.map(step => ({
        instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || '',
        distanceKm: step.distance.value / 1000,
        durationMinutes: step.duration.value / 60,
        durationTrafficMinutes: step.duration_in_traffic?.value / 60 || step.duration.value / 60,
        startLat: step.start_location.lat,
        startLng: step.start_location.lng,
        endLat: step.end_location.lat,
        endLng: step.end_location.lng,
        polyline: step.polyline.points
      }));

      const totalDurationNormal = leg.duration.value;
      const totalDurationTraffic = leg.duration_in_traffic?.value || totalDurationNormal;

      return {
        totalDistanceKm: leg.distance.value / 1000,
        totalDurationMinutes: Math.round(totalDurationNormal / 60),
        totalDurationTrafficMinutes: Math.round(totalDurationTraffic / 60),
        delayMinutes: Math.round((totalDurationTraffic - totalDurationNormal) / 60),
        congestionLevel: this.getCongestionLevel(totalDurationNormal / totalDurationTraffic),
        segments,
        polyline: route.overview_polyline.points
      };
    } catch (error) {
      console.error('[GoogleMaps] Route traffic error:', error.message);
      throw error;
    }
  }

  /**
   * Determine congestion level based on speed ratio
   */
  getCongestionLevel(ratio) {
    // ratio = normal_duration / traffic_duration (higher ratio = more congestion)
    if (ratio < 0.7) return 'high';      // >30% slower
    if (ratio < 0.85) return 'medium';    // 15-30% slower
    if (ratio < 0.95) return 'low';       // 5-15% slower
    return 'none';                         // normal speed
  }

  /**
   * Geocode address to coordinates (with caching suggestion)
   */
  async geocodeAddress(address) {
    if (!address) return null;

    try {
      const response = await this.client.geocode({
        params: {
          address: address,
          key: this.apiKey
        }
      });
      
      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return { 
          lat: location.lat, 
          lng: location.lng,
          formattedAddress: response.data.results[0].formatted_address
        };
      }
      return null;
    } catch (error) {
      console.error('[GoogleMaps] Geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Reverse geocode (coordinates to address)
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      });
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error('[GoogleMaps] Reverse geocoding error:', error.message);
      return null;
    }
  }
}

module.exports = new GoogleMapsService();