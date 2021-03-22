import includes from 'lodash/includes'
import max from 'lodash/max'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { connect } from 'app/util/deepEqualConnect'
import fromExchange from 'app/store/exchange/exchange.selectors'
import * as actions from 'app/store/exchange/exchange.actions'
import { PairShape } from 'app/components/propTypes'
import { utcToTimestamp } from 'app/model/time.model'
import ethUtils from 'app/util/ethUtils'
import ExchangeTradesList from './ExchangeTradesList'

const ExchangeTradesListContainer = ({
                                       startUpdater,
                                       stopUpdater,
                                       clearTrades,
                                       pair: {
                                         base: { symbol: baseSymbol },
                                         quote: { symbol: quoteSymbol },
                                       },
                                       ...props
                                     }) => {
  const dispatch = useDispatch()
  const [isPending, setIsPending] = useState(false)
  const { paging, page, shouldClearTrades } = props

  const loadTrades = useCallback(async () => {
    try {
      if (shouldClearTrades) {
        await clearTrades(baseSymbol, quoteSymbol)
      }
      await dispatch(
        actions.getTradesRequest(baseSymbol, quoteSymbol, page, true)
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }, [dispatch])

  useEffect(() => {
    setIsPending(true)
    loadTrades().then(() => {
      setIsPending(false)
    })
  }, [dispatch, loadTrades, setIsPending])

  const pending = () => {
    return isPending
  }

  const trackScrolling = async event => {
    const { target } = event

    if (isPending) {
      return
    }

    if (target.scrollHeight - target.scrollTop === target.clientHeight) {
      setIsPending(true)
      if (paging !== undefined && paging.total > 0) {
        await dispatch(
          actions.getTradesRequest(baseSymbol, quoteSymbol, page, false)
        )
      }
      setIsPending(false)
    }
  }

  useEffect(() => {
    document.addEventListener('scroll', () => trackScrolling())
    return () => document.removeEventListener('scroll', () => trackScrolling())
  }, [trackScrolling])

  return (
    <ExchangeTradesList
      baseSymbol={baseSymbol}
      quoteSymbol={quoteSymbol}
      handleScroll={trackScrolling}
      pending={pending}
      {...props}
    />
  )
}

export const removeTrailingZeros = string =>
  includes(string, '.') ? string.replace(/\.?0+$/, '') : string
const numberOfDigits = string => string.replace(/\./, '').length
export const formatPrice = (price, length) =>
  [
    price,
    includes(price, '.') || numberOfDigits(price) >= length ? '' : '.',
    new Array(length - numberOfDigits(price)).fill('0').join(''),
  ].join('')

/**
 * format trades. isUp field is calculated comparing the actual trade price
 * with the previuos one. If the prices are equal, the isUp field of the previous
 * trade is maintained. The first trade is then removed as it can't be compared with
 * anything.Î
 */
export const formatTrades = trades => {
  let lastIsUp = true
  const maxPriceLength = max(
    trades.map(({ price }) => numberOfDigits(removeTrailingZeros(price)))
  )
  // this implementation, reverse -> map -> reverse could be inefficient but it's readable
  // if there are performances issues, use a reversed for cycle
  const reversedTrades = trades
    .slice()
    .sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt))
  const mappedTrades = reversedTrades.map(
    ({ lastUpdatedAt, price, ...trade }, i) => {
      const actualPrice = ethUtils.toBigNumber(price)
      const previousPrice = ethUtils.toBigNumber(
        i > 0 ? reversedTrades[i - 1].price : '0'
      )
      const mappedTrade = {
        ...trade,
        price: formatPrice(removeTrailingZeros(price), maxPriceLength),
        timestamp: utcToTimestamp(lastUpdatedAt),
        isUp: actualPrice.eq(previousPrice)
          ? lastIsUp
          : actualPrice.gt(previousPrice),
      }
      lastIsUp = mappedTrade.isUp
      return mappedTrade
    }
  )
  return mappedTrades
}

const makeMapStateToProps = (initialState, { pair: { base, quote } }) => {
  const { symbol: baseSymbol } = base
  const { symbol: quoteSymbol } = quote
  const getTrades = fromExchange.getTrades(baseSymbol, quoteSymbol)
  const getPaging = fromExchange.getTradesPaging(baseSymbol, quoteSymbol)
  const getPage = fromExchange.getTradesPage(baseSymbol, quoteSymbol)
  const shouldClearTrades = fromExchange.shouldClearTrades(
    baseSymbol,
    quoteSymbol
  )
  return state => ({
    trades: formatTrades(getTrades(state)),
    paging: getPaging(state),
    page: getPage(state),
    shouldClearTrades: shouldClearTrades(state),
    isOutOfDate: fromExchange.isTradeListOutOfDate(baseSymbol, quoteSymbol)(
      state
    ),
  })
}

const mapDispatchToProps = dispatch => ({
  startUpdater: (base, quote) =>
    dispatch(actions.startTradesUpdater(base, quote)),
  stopUpdater: (base, quote) =>
    dispatch(actions.stopTradesUpdater(base, quote)),
  clearTrades: (base, quote) => dispatch(actions.clearTrades(base, quote)),
})

ExchangeTradesListContainer.propTypes = {
  pair: PairShape.isRequired,
  startUpdater: PropTypes.func.isRequired,
  stopUpdater: PropTypes.func.isRequired,
  clearTrades: PropTypes.func.isRequired,
  paging: PropTypes.arrayOf(PropTypes.object),
  page: PropTypes.number,
  shouldClearTrades: PropTypes.bool,
}

ExchangeTradesListContainer.defaultProps = {
  paging: {},
  page: 1,
  shouldClearTrades: false,
}

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(ExchangeTradesListContainer)
