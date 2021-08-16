/**
 * borrow from 
 * https://github.com/uber-common/viewport-mercator-project/blob/master/src/web-mercator-utils.js
 */

const PI = Math.PI;
const PI_4 = PI / 4;
const DEGREES_TO_RADIANS = PI / 180;
// const RADIANS_TO_DEGREES = 180 / PI;
export const TILE_SIZE = 512;
// Average circumference (40075 km equatorial, 40007 km meridional)
const EARTH_CIRCUMFERENCE = 40.03e6;

// Mapbox default altitude
// const DEFAULT_ALTITUDE = 1.5;

export function zoomToScale(zoom) {
  return Math.pow(2, zoom);
}


// @ts-ignore
export function lngLatToWorld([lng, lat], scale) {
  scale *= TILE_SIZE;
  const lambda2 = lng * DEGREES_TO_RADIANS;
  const phi2 = lat * DEGREES_TO_RADIANS;
  const x = scale * (lambda2 + PI) / (2 * PI);
  const y = scale * (PI - Math.log(Math.tan(PI_4 + phi2 * 0.5))) / (2 * PI);
  return [x, y];
}

/**
 * Calculate distance scales in meters around current lat/lon, both for
 * degrees and pixels.
 * In mercator projection mode, the distance scales vary significantly
 * with latitude.
 */
export function getDistanceScales(options){
  let {
    latitude = 0, zoom = 1, scale, highPrecision = false
  } = options

  // Calculate scale from zoom if not provided
  scale = scale !== undefined ? scale : zoomToScale(zoom);

  const result = {};
  const worldSize = TILE_SIZE * scale;
  const latCosine = Math.cos(latitude * DEGREES_TO_RADIANS);

  /**
   * Number of pixels occupied by one degree longitude around current lat/lon:
     pixelsPerDegreeX = d(lngLatToWorld([lng, lat])[0])/d(lng)
        = scale * TILE_SIZE * DEGREES_TO_RADIANS / (2 * PI)
      pixelsPerDegreeY = d(lngLatToWorld([lng, lat])[1])/d(lat)
        = -scale * TILE_SIZE * DEGREES_TO_RADIANS / cos(lat * DEGREES_TO_RADIANS)  / (2 * PI)
    */
  const pixelsPerDegreeX = worldSize / 360;
  const pixelsPerDegreeY = pixelsPerDegreeX / latCosine;

  /**
   * Number of pixels occupied by one meter around current lat/lon:
   */
  const altPixelsPerMeter = worldSize / EARTH_CIRCUMFERENCE / latCosine;

  /**
   * LngLat: longitude -> east and latitude -> north (bottom left)
   * UTM meter offset: x -> east and y -> north (bottom left)
   * World space: x -> east and y -> south (top left)
   *
   * Y needs to be flipped when converting delta degree/meter to delta pixels
   */
  result.pixelsPerMeter = [altPixelsPerMeter, -altPixelsPerMeter, altPixelsPerMeter];
  result.metersPerPixel = [1 / altPixelsPerMeter, -1 / altPixelsPerMeter, 1 / altPixelsPerMeter];

  result.pixelsPerDegree = [pixelsPerDegreeX, -pixelsPerDegreeY, altPixelsPerMeter];
  result.degreesPerPixel = [1 / pixelsPerDegreeX, -1 / pixelsPerDegreeY, 1 / altPixelsPerMeter];

  /**
   * Taylor series 2nd order for 1/latCosine
     f'(a) * (x - a)
        = d(1/cos(lat * DEGREES_TO_RADIANS))/d(lat) * dLat
        = DEGREES_TO_RADIANS * tan(lat * DEGREES_TO_RADIANS) / cos(lat * DEGREES_TO_RADIANS) * dLat
    */
  if (highPrecision) {
    const latCosine2 = DEGREES_TO_RADIANS * Math.tan(latitude * DEGREES_TO_RADIANS) / latCosine;
    const pixelsPerDegreeY2 = pixelsPerDegreeX * latCosine2 / 2;

    const altPixelsPerDegree2 = worldSize / EARTH_CIRCUMFERENCE * latCosine2;
    const altPixelsPerMeter2 = altPixelsPerDegree2 / pixelsPerDegreeY * altPixelsPerMeter;

    result.pixelsPerDegree2 = [0, -pixelsPerDegreeY2, altPixelsPerDegree2];
    result.pixelsPerMeter2 = [altPixelsPerMeter2, 0, altPixelsPerMeter2];
  }

  // Main results, used for converting meters to latlng deltas and scaling offsets
  return result;
}