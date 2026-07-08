import { describe, it, expect } from 'vitest'
import { calculatePrice, getTimeSlots, getSlotById } from './pricing'

const PICKUP = 'CAMPUS Pfarrkirchen, Petersbogen 1'
const DROPOFF = 'Stadtplatz 1, 84347 Pfarrkirchen'

describe('calculatePrice — base prices', () => {
  it('size S base is €5.00', () => {
    expect(calculatePrice(PICKUP, DROPOFF, 'S', 'later', '', 1, '1-5', 0).base).toBe(5.00)
  })
  it('size M base is €6.00', () => {
    expect(calculatePrice(PICKUP, DROPOFF, 'M', 'later', '', 1, '1-5', 0).base).toBe(6.00)
  })
  it('size L base is €7.50', () => {
    expect(calculatePrice(PICKUP, DROPOFF, 'L', 'later', '', 1, '1-5', 0).base).toBe(7.50)
  })
})

describe('calculatePrice — express', () => {
  it('adds €10 express surcharge', () => {
    const r = calculatePrice(PICKUP, DROPOFF, 'S', 'express', '', 1, '1-5', null)
    expect(r.expressSurcharge).toBe(10)
    expect(r.isExpress).toBe(true)
  })
  it('no peak surcharge on express', () => {
    const r = calculatePrice(PICKUP, DROPOFF, 'S', 'express', '', 1, '1-5', null)
    expect(r.peakSurcharge).toBe(0)
  })
})

describe('calculatePrice — slot price modifiers', () => {
  it('off-peak slot (−10%) reduces price', () => {
    const r = calculatePrice(PICKUP, DROPOFF, 'S', 'later', '', 1, '1-5', -0.10)
    expect(r.peakSurcharge).toBeLessThan(0)
    expect(r.isPeak).toBe(false)
  })
  it('peak slot (+15%) increases price', () => {
    const r = calculatePrice(PICKUP, DROPOFF, 'S', 'later', '', 1, '1-5', 0.15)
    expect(r.peakSurcharge).toBeGreaterThan(0)
    expect(r.isPeak).toBe(true)
  })
  it('neutral slot (0) has zero surcharge', () => {
    const r = calculatePrice(PICKUP, DROPOFF, 'S', 'later', '', 1, '1-5', 0)
    expect(r.peakSurcharge).toBe(0)
  })
})

describe('calculatePrice — total integrity', () => {
  it('total equals sum of all components', () => {
    const r = calculatePrice(PICKUP, DROPOFF, 'M', 'later', '', 2, '6-15', -0.05)
    const expected = Math.round(
      (r.base + r.distanceSurcharge + r.storesSurcharge + r.itemsSurcharge + r.peakSurcharge + r.expressSurcharge) * 100
    ) / 100
    expect(r.total).toBe(expected)
  })
  it('total is always positive', () => {
    const r = calculatePrice(PICKUP, DROPOFF, 'S', 'later', '', 1, '1-5', -0.10)
    expect(r.total).toBeGreaterThan(0)
  })
})

describe('getTimeSlots', () => {
  it('returns 7 slots for a future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 2)
    const iso = future.toISOString().split('T')[0]
    expect(getTimeSlots(iso)).toHaveLength(7)
  })
  it('filters past slots for today', () => {
    const today = new Date().toISOString().split('T')[0]
    const slots = getTimeSlots(today)
    const nowHour = new Date().getHours()
    slots.forEach(s => expect(s.start).toBeGreaterThan(nowHour))
  })
})

describe('getSlotById', () => {
  it('returns 14–16 off-peak slot', () => {
    const s = getSlotById('s1416')
    expect(s?.start).toBe(14)
    expect(s?.priceMod).toBe(-0.10)
    expect(s?.tag).toBe('discount')
  })
  it('returns 20–22 peak slot', () => {
    const s = getSlotById('s2022')
    expect(s?.start).toBe(20)
    expect(s?.priceMod).toBe(0.15)
    expect(s?.tag).toBe('surcharge')
  })
  it('returns undefined for unknown id', () => {
    expect(getSlotById('nonexistent')).toBeUndefined()
  })
})
