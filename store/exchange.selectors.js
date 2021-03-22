import filter from 'lodash/fp/filter'
import fill from 'lodash/fill'
import flatMap from 'lodash/fp/flatMap'
import flow from 'lodash/fp/flow'
import get from 'lodash/fp/get'
import getOr from 'lodash/fp/getOr'
import i18next from 'i18next'
import uniqBy from 'lodash/fp/uniqBy'
import map from 'lodash/fp/map'
import orderBy from 'lodash/fp/orderBy'
import includes from 'lodash/includes'
import max from 'lodash/max'
import min from 'lodash/min'
import props from 'lodash/fp/props'
import { createSelector } from 'reselect'
import { getAssetId } from 'app/lib/asset'
import { ETHEREUM } from 'app/lib/wallet/index'
import fromAssets from 'app/store/assets/assets.selectors'
import { SIGNIFICANT_DIGITS as DEFAULT_PRECISION } from 'app/lib/amount/amount'
import ethUtils from 'app/util/ethUtils'
import { STATE_KEY } from './exchange.reducer'
import {
  ORDER_STATUS,
  PAIRS_ORDERING_TYPES,
  PAIRS_ORDERING_FIELDS,
  PAIRS_FILTERS,
} from './exchange.constants'

const UPDATE_THRESHOLD = 60 * 10 * 1000

const getState = getOr({}, STATE_KEY)

const getPairs = createSelector(
  getState,
  get('pairs')
)

const getPairsByType = type =>
  createSelector(
    getPairs,
    filter(pair => pair.family === type)
  )

const getPairsWithAssets = type =>
  createSelector(
    [getPairsByType(type), fromAssets.getAssets],
    (pairs, assets) =>
      Object.values(pairs).reduce((acc, pair) => {
        const base = {
          ...pair.base,
          ...assets[getAssetId(ETHEREUM, pair.base.address)],
        }
        const quote = {
          ...pair.quote,
          ...assets[getAssetId(ETHEREUM, pair.quote.address)],
        }
        return base && quote ? [...acc, { ...pair, base, quote }] : acc
      }, [])
  )

const getPairsOrdering = type =>
  createSelector(
    getState,
    get(`pairsOrdering.${type}`)
  )

const getPairsSearchText = type =>
  createSelector(
    getState,
    get(`pairsFiltering.${type}.searchText`)
  )

const getPairsFilter = type =>
  createSelector(
    getState,
    state => getOr(PAIRS_FILTERS().ALL, `pairsFiltering.${type}.filter`, state)
  )

const getAllListedAssetImages = (type, assetTypes) =>
  createSelector(
    getPairsWithAssets(type),
    flow(
      flatMap(props(['base', 'quote'])),
      uniqBy('address'),
      filter(({ type: assetType }) => includes(assetTypes, assetType)),
      map('img')
    )
  )

const getOrderedPairsWithAssets = type =>
  createSelector(
    getPairsWithAssets(type),
    getPairsOrdering(type),
    (pairs, ordering) =>
      ordering.type === PAIRS_ORDERING_TYPES.none
        ? orderBy(['favourite', 'defaultOrder'], ['desc', 'asc'], pairs)
        : orderBy(
        PAIRS_ORDERING_FIELDS[ordering.field].orderBy,
        fill(
          new Array(PAIRS_ORDERING_FIELDS[ordering.field].orderBy.length),
          ordering.type
        ),
        pairs
        )
  )

const getPairsFilters = type =>
  createSelector(
    getPairsWithAssets(type),
    pairs => [
      PAIRS_FILTERS().FAVOURITES,
      ...uniqBy('quote.symbol', pairs).map(({ quote: { symbol, img } }) => ({
        label: symbol,
        filter: ['quote.symbol', symbol],
        item: {
          title: `${i18next.t('exchange.pairs_list.any')}/${symbol}`,
          leadingImg: img,
        },
      })),
      PAIRS_FILTERS().ALL,
    ]
  )

const getFilteredOrderedPairsWithAsset = type =>
  createSelector(
    getOrderedPairsWithAssets(type),
    getPairsSearchText(type),
    getPairsFilter(type),
    (pairs, searchText, pairsFilter) => {
      const searchStep = searchText
        ? pairs.filter(
          pair =>
            includes(
              pair.base.symbol.toUpperCase(),
              searchText.toUpperCase()
            ) ||
            includes(
              pair.quote.symbol.toUpperCase(),
              searchText.toUpperCase()
            )
        )
        : pairs
      const filterStep = filter(pairsFilter.filter, searchStep)
      return filterStep
    }
  )

const getAddresses = createSelector(
  getPairs,
  pairs =>
    Array.from(
      Object.values(pairs).reduce((acc, pair) => {
        acc.add(pair.base.address)
        acc.add(pair.quote.address)
        return acc
      }, new Set())
    )
)

const getPair = (base, quote) =>
  createSelector(
    getPairs,
    getOr({}, `${base}-${quote}`)
  )

const getPairLastPrice = (base, quote) =>
  createSelector(
    getPair(base, quote),
    flow(
      getOr('', 'lastPrice'),
      price => price || ''
    )
  )

const getPairPriceChange = (base, quote) =>
  createSelector(
    getPair(base, quote),
    flow(
      getOr('', 'priceChanges.1d.perc'),
      change => change || 0
    )
  )

const getOrderbooks = createSelector(
  getState,
  getOr({}, 'orderbooks')
)

const getOrderbook = (base, quote) =>
  createSelector(
    getOrderbooks,
    getOr({}, `${base}-${quote}`)
  )

const getTradesPair = (base, quote) =>
  createSelector(
    getState,
    getOr({}, `trades.${base}-${quote}`)
  )

const getTrades = (base, quote) =>
  createSelector(
    getTradesPair(base, quote),
    getOr([], 'trades')
  )

const getTradesPaging = (base, quote) =>
  createSelector(
    getTradesPair(base, quote),
    getOr([], 'paging')
  )

const getTradesPage = (base, quote) =>
  createSelector(
    getTradesPair(base, quote),
    getOr(1, 'page')
  )

const shouldClearTrades = (base, quote) =>
  createSelector(
    getTradesPair(base, quote),
    getOr(false, 'shouldClearTrades')
  )

const getTradesLastUpdated = (base, quote) =>
  createSelector(
    getTradesPair(base, quote),
    getOr(0, 'lastUpdated')
  )

const isTradeListOutOfDate = (base, quote) =>
  createSelector(
    getTradesLastUpdated(base, quote),
    lastUpdated => new Date().getTime() - lastUpdated >= UPDATE_THRESHOLD
  )
const getOrderbookOrdersByType = (base, quote, type) =>
  createSelector(
    getOrderbook(base, quote),
    getOr([], `${type.toLowerCase()}.results`)
  )

const getOrderbookPrecision = (base, quote) =>
  createSelector(
    getOrderbook(base, quote),
    getOr(DEFAULT_PRECISION, `buy.meta.precision`)
  )

const getLowestAsk = (base, quote) =>
  createSelector(
    getOrderbook(base, quote),
    flow(
      getOr([], 'sell.results'),
      map(getOr('0', 'price')),
      map(parseFloat),
      min
    )
  )

const getHighestBig = (base, quote) =>
  createSelector(
    getOrderbook(base, quote),
    flow(
      getOr([], 'buy.results'),
      map(getOr('0', 'price')),
      map(parseFloat),
      max
    )
  )

const getBundles = createSelector(
  getState,
  getOr([], 'bundles')
)

const getQuickEdoPurchaseAddress = createSelector(
  getState,
  getOr(undefined, 'quickEdoPurchaseAddress')
)

const getOrders = createSelector(
  getState,
  getOr([], 'orders')
)

const getOrdersOrderedByDate = createSelector(
  getOrders,
  orderBy('added', 'desc')
)

const getAddress = address =>
  address === 'ether' ? ethUtils.ETH_ZERO_ADDRESS : address

const getOrdersByPair = (baseAddress, quoteAddress) => {
  const base = getAddress(baseAddress)
  const quote = getAddress(quoteAddress)
  return createSelector(
    getOrdersOrderedByDate,
    orders =>
      orders.filter(
        ({ wantTokenAddress, offerTokenAddress }) =>
          (wantTokenAddress === base && offerTokenAddress === quote) ||
          (wantTokenAddress === quote && offerTokenAddress === base)
      )
  )
}

const isActiveOrder = ({ status }) =>
  status === ORDER_STATUS.active || status === ORDER_STATUS.pending

const getActiveOrdersByPair = (baseAddress, quoteAddress) =>
  createSelector(
    getOrdersByPair(baseAddress, quoteAddress),
    orders => orders.filter(isActiveOrder)
  )

const isCompletedOrder = ({
                            status,
                            amountLocked,
                            wantTokenAmountExpectedToBeFilled,
                          }) =>
  (status === ORDER_STATUS.filled ||
    status === ORDER_STATUS.unfillable ||
    status === ORDER_STATUS.cancelled) &&
  (amountLocked !== '0' || wantTokenAmountExpectedToBeFilled !== '0')

const getFilledOrdersByPair = (baseAddress, quoteAddress) =>
  createSelector(
    getOrdersByPair(baseAddress, quoteAddress),
    orderList => orderList.filter(isCompletedOrder)
  )

const getOrder = id =>
  createSelector(
    getOrders,
    orders => orders.find(order => order.id === id)
  )

export default {
  getAddresses,
  getAllListedAssetImages,
  getBundles,
  getHighestBig,
  getLowestAsk,
  getOrderedPairsWithAssets,
  getOrderbook,
  getOrderbookOrdersByType,
  getOrderbookPrecision,
  getOrderbooks,
  getPair,
  getPairLastPrice,
  getPairPriceChange,
  getPairs,
  getPairsByType,
  getPairsWithAssets,
  getPairsOrdering,
  getQuickEdoPurchaseAddress,
  getOrdersByPair,
  getActiveOrdersByPair,
  getFilledOrdersByPair,
  getOrder,
  getFilteredOrderedPairsWithAsset,
  getPairsSearchText,
  getPairsFilter,
  getPairsFilters,
  getTrades,
  getTradesPaging,
  getTradesPage,
  getTradesLastUpdated,
  isTradeListOutOfDate,
  shouldClearTrades,
}
