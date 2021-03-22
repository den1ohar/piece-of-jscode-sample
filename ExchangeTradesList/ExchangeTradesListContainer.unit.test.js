import map from 'lodash/map'
import {
  removeTrailingZeros,
  formatPrice,
  formatTrades,
} from './ExchangeTradesListContainer'

describe('removeTrailingZeros', () => {
  it('should remove trailing zeros', () => {
    expect(removeTrailingZeros('0.5000000000')).toBe('0.5')
    expect(removeTrailingZeros('0.005000000000')).toBe('0.005')
    expect(removeTrailingZeros('1.000')).toBe('1')
    expect(removeTrailingZeros('10')).toBe('10')
  })
})

describe('formatPrice', () => {
  it('should correctly format price', () => {
    expect(formatPrice('0.5', 4)).toBe('0.500')
    expect(formatPrice('0.5', 2)).toBe('0.5')
    expect(formatPrice('1', 1)).toBe('1')
    expect(formatPrice('1', 2)).toBe('1.0')
    expect(formatPrice('10', 2)).toBe('10')
    expect(formatPrice('10', 3)).toBe('10.0')
  })
})

describe('formatTrades', () => {
  it('should correctly format trades', () => {
    const trades = [
      {
        price: '0.12300',
        lastUpdatedAt: '2019-04-26T08:59:20+00:00',
      },
      {
        price: '9.987',
        lastUpdatedAt: '2019-04-26T08:58:20+00:00',
      },
      {
        price: '10',
        lastUpdatedAt: '2019-04-26T08:58:20+00:00',
      },
      {
        price: '20',
        lastUpdatedAt: '2019-04-26T08:57:20+00:00',
      },
      {
        price: '0.01',
        lastUpdatedAt: '2019-04-26T08:57:20+00:00',
      },
    ]
    const formattedTrades = formatTrades(trades)
    expect(map(formattedTrades, 'price')).toEqual([
      '0.123',
      '9.987',
      '10.00',
      '20.00',
      '0.010',
    ])
    expect(map(formattedTrades, 'isUp')).toEqual([
      false,
      false,
      false,
      true,
      true,
    ])
  })
})
