export class PanchangaError extends Error {
  // code: LOCATION_INVALID | TIMEZONE_INVALID | DATE_INVALID | PROFILE_NOT_FOUND | RULE_NOT_SUPPORTED | CALCULATION_FAILED
  constructor(code, message) {
    super(message);
    this.name = 'PanchangaError';
    this.code = code;
  }
}
