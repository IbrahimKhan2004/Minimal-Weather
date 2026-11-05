import test from 'node:test';
import assert from 'node:assert/strict';
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatTemperature,
  formatWindSpeed,
  formatPressure,
  getUVLevel,
  getAQILevel,
  calculateDailyRangePercentages,
  calculateCurrentTempDotPosition,
  getCompassDirection,
  getAtmosphericTheme,
} from './weatherMath';

test('celsiusToFahrenheit converts temperatures correctly', () => {
  assert.equal(celsiusToFahrenheit(0), 32);
  assert.equal(celsiusToFahrenheit(100), 212);
  assert.equal(celsiusToFahrenheit(20), 68);
  assert.equal(celsiusToFahrenheit(-10), 14);
});

test('fahrenheitToCelsius converts temperatures correctly', () => {
  assert.equal(fahrenheitToCelsius(32), 0);
  assert.equal(fahrenheitToCelsius(212), 100);
  assert.equal(fahrenheitToCelsius(68), 20);
});

test('formatTemperature respects temperature units', () => {
  assert.equal(formatTemperature(22, 'celsius'), '22°');
  assert.equal(formatTemperature(22, 'fahrenheit'), '72°');
});

test('formatWindSpeed outputs correct units', () => {
  assert.equal(formatWindSpeed(10, 'mph'), '10 mph');
  assert.equal(formatWindSpeed(10, 'kmh'), '16 km/h');
});

test('formatPressure formats hPa and inHg', () => {
  assert.equal(formatPressure(1013, 'hPa'), '1013 hPa');
  assert.equal(formatPressure(1013, 'inHg'), '29.91 inHg');
});

test('getUVLevel categorizes indices appropriately', () => {
  assert.equal(getUVLevel(1).level, 'Low');
  assert.equal(getUVLevel(4).level, 'Moderate');
  assert.equal(getUVLevel(7).level, 'High');
  assert.equal(getUVLevel(9).level, 'Very High');
  assert.equal(getUVLevel(12).level, 'Extreme');
});

test('getAQILevel categorizes EPA air quality correctly', () => {
  assert.equal(getAQILevel(35).category, 'Good');
  assert.equal(getAQILevel(75).category, 'Moderate');
  assert.equal(getAQILevel(125).category, 'Unhealthy for Sensitive');
  assert.equal(getAQILevel(175).category, 'Unhealthy');
  assert.equal(getAQILevel(250).category, 'Very Unhealthy');
  assert.equal(getAQILevel(350).category, 'Hazardous');
});

test('calculateDailyRangePercentages clamps and spans correctly', () => {
  // Global range: 10 to 30. Day range: 15 to 25.
  // Left = (15 - 10) / 20 = 25%. Right = (25 - 10) / 20 = 75%. Width = 50%.
  const { leftPercent, widthPercent } = calculateDailyRangePercentages(15, 25, 10, 30);
  assert.equal(leftPercent, 25);
  assert.equal(widthPercent, 50);
});

test('calculateCurrentTempDotPosition maps within bounds', () => {
  const pos = calculateCurrentTempDotPosition(20, 10, 30);
  assert.equal(pos, 50);
});

test('getCompassDirection correctly derives 16 cardinal points', () => {
  assert.equal(getCompassDirection(0), 'N');
  assert.equal(getCompassDirection(90), 'E');
  assert.equal(getCompassDirection(180), 'S');
  assert.equal(getCompassDirection(270), 'W');
  assert.equal(getCompassDirection(315), 'NW');
});

test('getAtmosphericTheme provides tailored theme parameters', () => {
  const rainTheme = getAtmosphericTheme('rainy');
  assert.equal(rainTheme.particleType, 'rain');

  const snowTheme = getAtmosphericTheme('snow');
  assert.equal(snowTheme.particleType, 'snow');

  const nightTheme = getAtmosphericTheme('clear-night');
  assert.equal(nightTheme.particleType, 'stars');
});
