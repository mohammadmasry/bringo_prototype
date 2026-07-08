import { describe, it, expect } from 'vitest'
import { detectPostcode, getAllowedDays, getZoneName } from './zones'

describe('detectPostcode', () => {
  it('extracts explicit 5-digit zip from address string', () => {
    expect(detectPostcode('Musterstraße 1, 84347 Pfarrkirchen')).toBe('84347')
  })
  it('detects Pfarrkirchen by city keyword', () => {
    expect(detectPostcode('Stadtplatz, Pfarrkirchen')).toBe('84347')
  })
  it('detects Bad Birnbach by keyword', () => {
    expect(detectPostcode('Kurstraße 5, Bad Birnbach')).toBe('84364')
  })
  it('detects Birnbach short form', () => {
    expect(detectPostcode('Birnbach')).toBe('84364')
  })
  it('detects Eggenfelden by keyword', () => {
    expect(detectPostcode('Eggenfelden')).toBe('84307')
  })
  it('detects Postmünster by keyword', () => {
    expect(detectPostcode('Postmünster')).toBe('84389')
  })
  it('prefers explicit zip over keyword match', () => {
    expect(detectPostcode('84364 Pfarrkirchen')).toBe('84364')
  })
  it('returns null for unknown address', () => {
    expect(detectPostcode('Berlin Mitte')).toBeNull()
  })
  it('is case-insensitive', () => {
    expect(detectPostcode('BAD BIRNBACH')).toBe('84364')
  })
})

describe('getAllowedDays', () => {
  it('Pfarrkirchen allows all 7 days', () => {
    expect(getAllowedDays('84347')).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
  it('Bad Birnbach allows Mon/Wed/Sat only', () => {
    expect(getAllowedDays('84364')).toEqual([1, 3, 6])
  })
  it('Eggenfelden allows Tue/Thu/Sun only', () => {
    expect(getAllowedDays('84307')).toEqual([2, 4, 0])
  })
  it('Postmünster same days as Eggenfelden', () => {
    expect(getAllowedDays('84389')).toEqual([2, 4, 0])
  })
  it('returns null for unknown zip', () => {
    expect(getAllowedDays('10115')).toBeNull()
  })
  it('returns null for null input', () => {
    expect(getAllowedDays(null)).toBeNull()
  })
})

describe('getZoneName', () => {
  it('returns Pfarrkirchen for 84347', () => {
    expect(getZoneName('84347')).toBe('Pfarrkirchen')
  })
  it('returns Bad Birnbach for 84364', () => {
    expect(getZoneName('84364')).toBe('Bad Birnbach')
  })
  it('returns null for unknown zip', () => {
    expect(getZoneName('99999')).toBeNull()
  })
  it('returns null for null input', () => {
    expect(getZoneName(null)).toBeNull()
  })
})
