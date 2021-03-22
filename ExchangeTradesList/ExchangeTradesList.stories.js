import React from 'react'
import { storiesOf } from '@storybook/react'
import ExchangeTradesList from './ExchangeTradesList'

const trades = [
  {
    timestamp: 1555666849,
    price: '0.005432',
    size: '72.27',
    isUp: true,
  },
  {
    timestamp: 1555666849,
    price: '0.005432',
    size: '72.27',
    isUp: true,
  },
  {
    timestamp: 1555666849,
    price: '0.005432',
    size: '72.27',
    isUp: false,
  },
]
storiesOf('Organisms/ExchangeTradesList', module)
  .add('full', () => (
    <ExchangeTradesList baseSymbol="EDO" quoteSymbo="ETH" trades={trades} />
  ))
  .add('empty', () => <ExchangeTradesList trades={[]} />)
