import React from 'react'
import { mount } from 'enzyme'
import { reducer as thunkReducer } from 'redux-saga-thunk'
import exchangeReducer from 'app/store/exchange/exchange.reducer'
import { combineReducers, createStore } from 'redux'
import { Provider } from 'react-redux'
import ExchangePairPage from './ExchangePairPage'

const state = {
  thunk: {},
  storeExchange: {
    orderbooks: {
      'EDO-ETH': {
        sell: {
          results: [
            {
              price: '0.044997',
              volume: '69.12',
              total: '2125.98',
              bar: '10%',
            },
            {
              price: '0.044997',
              volume: '69.12',
              total: '2125.98',
              bar: '20%',
            },
          ],
        },
        buy: {
          results: [
            {
              price: '0.044997',
              volume: '69.12',
              total: '2125.98',
              bar: '10%',
            },
            {
              price: '0.044997',
              volume: '69.12',
              total: '2125.98',
              bar: '20%',
            },
          ],
        },
      },
    },
  },
}

const orderbookPageProps = {
  pair: {
    base: {
      address: '',
      symbol: 'EDO',
    },
    quote: {
      address: '',
      symbol: 'ETH',
    },
    family: 'hybrid',
  },
}

class OrderBookTestPage {
  constructor(component, store) {
    this.wrapper = mount(<Provider store={store}>{component}</Provider>, store)
  }

  hasAppBar() {
    return this.wrapper.find('AppBar').length === 1
  }

  hasOrderBookContainer() {
    return this.wrapper.find('OrderBookContainer').length === 1
  }

  hasTabs() {
    return this.wrapper.find('Tabs').length === 1
  }

  hasThreeButtonsInTabs() {
    return (
      this.wrapper
        .find('Tabs')
        .first()
        .find('Button').length === 3
    )
  }

  hasPairNamesPrinted() {
    return this.wrapper.contains(
      `${orderbookPageProps.pair.base.symbol} / ${
        orderbookPageProps.pair.quote.symbol
      }`
    )
  }

  hasBuyAndSellButtons() {
    return (
      this.wrapper
        .find('button')
        .everyWhere(n => n.text().toLowerCase() === 'buy') &&
      this.wrapper
        .find('button')
        .everyWhere(n => n.text().toLowerCase() === 'sell')
    )
  }

  hasTwoSellOrders() {
    return this.wrapper.find('div[data-order-type="sell"]').length === 2
  }

  hasTwoBuyOrders() {
    return this.wrapper.find('div[data-order-type="buy"]').length === 2
  }

  hasLastPriceRow() {
    return this.wrapper.findWhere(n => n.key() === 'order-last').length === 1
  }
}

describe('ExchangePairPage', () => {
  let page
  let store
  beforeEach(() => {
    store = createStore(
      combineReducers({ thunk: thunkReducer, storeExchange: exchangeReducer }),
      state
    )

    page = new OrderBookTestPage(
      <ExchangePairPage {...orderbookPageProps} />,
      store
    )
  })
  it('should contain an AppBar', () => {
    expect(page.hasAppBar()).toBe(true)
  })
  it('should contain an OrderBookContainer', () => {
    expect(page.hasOrderBookContainer()).toBe(true)
  })
  it('should contain Tabs', () => {
    expect(page.hasTabs()).toBe(true)
  })
  it('should contain two Buttons into Tabs', () => {
    expect(page.hasThreeButtonsInTabs()).toBe(true)
  })
  it('should contain the pair name', () => {
    expect(page.hasPairNamesPrinted()).toBe(true)
  })
  it('should contain buy and sell buttons', () => {
    expect(page.hasBuyAndSellButtons()).toBe(true)
  })
  it('should contain 4 sell orders', () => {
    expect(page.hasTwoSellOrders()).toBe(true)
  })
  it('should contain 4 buy orders', () => {
    expect(page.hasTwoBuyOrders()).toBe(true)
  })
  it('should contain the last price row', () => {
    expect(page.hasLastPriceRow()).toBe(true)
  })
})
