export const NAMESPACE = 'STORE/EXCHANGE'

export const GET_PAIRS = `${NAMESPACE}/GET_PAIRS`
export const GET_PAIRS_REQUEST = `${GET_PAIRS}/REQUEST`
export const GET_PAIRS_SUCCESS = `${GET_PAIRS}/SUCCESS`
export const GET_PAIRS_FAILURE = `${GET_PAIRS}/FAILURE`

export const getPairsRequest = () => ({
  type: GET_PAIRS_REQUEST,
  meta: {
    thunk: GET_PAIRS,
  },
})

export const getPairsSuccess = (pairs, thunk) => ({
  type: GET_PAIRS_SUCCESS,
  payload: { pairs },
  meta: { thunk },
})

export const getPairsFailure = (error, thunk) => ({
  type: GET_PAIRS_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const GET_PAIR_PRICE = `${NAMESPACE}/GET_PAIR_PRICE`
export const GET_PAIR_PRICE_REQUEST = `${GET_PAIR_PRICE}/REQUEST`
export const GET_PAIR_PRICE_SUCCESS = `${GET_PAIR_PRICE}/SUCCESS`
export const GET_PAIR_PRICE_FAILURE = `${GET_PAIR_PRICE}/FAILURE`

export const getPairPriceRequest = (base, quote) => ({
  type: GET_PAIR_PRICE_REQUEST,
  payload: { base, quote },
  meta: { thunk: GET_PAIR_PRICE },
})

export const getPairPriceSuccess = (
  base,
  quote,
  lastPrice,
  priceChanges,
  thunk
) => ({
  type: GET_PAIR_PRICE_SUCCESS,
  payload: { base, quote, lastPrice, priceChanges },
  meta: { thunk },
})

export const getPairPriceFailure = (error, thunk) => ({
  type: GET_PAIR_PRICE_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const GET_ORDERBOOK = `${NAMESPACE}/GET_ORDERBOOK`
export const GET_ORDERBOOK_REQUEST = `${GET_ORDERBOOK}/REQUEST`
export const GET_ORDERBOOK_SUCCESS = `${GET_ORDERBOOK}/SUCCESS`
export const GET_ORDERBOOK_FAILURE = `${GET_ORDERBOOK}/FAILURE`

export const getOrderbookRequest = (base, quote) => ({
  type: GET_ORDERBOOK_REQUEST,
  payload: { base, quote },
  meta: { thunk: GET_ORDERBOOK },
})

export const getOrderbookSuccess = (base, quote, orderbook, thunk) => ({
  type: GET_ORDERBOOK_SUCCESS,
  payload: { base, quote, orderbook },
  meta: { thunk },
})

export const getOrderbookFailure = (error, thunk) => ({
  type: GET_ORDERBOOK_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const START_PAIRS_UPDATER = 'START_PAIRS_UPDATER'
export const startPairsUpdater = () => ({
  type: START_PAIRS_UPDATER,
})

export const STOP_PAIRS_UPDATER = 'STOP_PAIRS_UPDATER'
export const stopPairsUpdater = () => ({ type: STOP_PAIRS_UPDATER })

export const START_ORDERBOOK_UPDATER = 'START_ORDERBOOK_UPDATER'
export const startOrderbookUpdater = (base, quote) => ({
  type: START_ORDERBOOK_UPDATER,
  payload: { base, quote },
})

export const STOP_ORDERBOOK_UPDATER = 'STOP_ORDERBOOK_UPDATER'
export const stopOrderbookUpdater = (base, quote) => ({
  type: STOP_ORDERBOOK_UPDATER,
  payload: { base, quote },
})

export const START_TRADES_UPDATER = 'START_TRADES_UPDATER'
export const startTradesUpdater = (base, quote) => ({
  type: START_TRADES_UPDATER,
  payload: { base, quote },
})

export const STOP_TRADES_UPDATER = 'STOP_TRADES_UPDATER'
export const stopTradesUpdater = (base, quote) => ({
  type: STOP_TRADES_UPDATER,
  payload: { base, quote },
})

export const GET_TRADES = `${NAMESPACE}/GET_TRADES`
export const GET_TRADES_REQUEST = `${GET_TRADES}/REQUEST`
export const GET_TRADES_SUCCESS = `${GET_TRADES}/SUCCESS`
export const GET_TRADES_FAILURE = `${GET_TRADES}/FAILURE`
export const CLEAR_TRADES = `CLEAR_TRADES`

export const getTradesRequest = (base, quote, page, initial) => ({
  type: GET_TRADES_REQUEST,
  payload: { base, quote, page, initial },
  meta: { thunk: GET_TRADES },
})

export const clearTrades = (base, quote) => ({
  type: CLEAR_TRADES,
  payload: { base, quote },
})

export const getTradesSuccess = (
  base,
  quote,
  trades,
  lastUpdated,
  thunk,
  paging,
  page,
  initial
) => ({
  type: GET_TRADES_SUCCESS,
  payload: { base, quote, trades, lastUpdated, paging, page, initial },
  meta: { thunk },
})

export const getTradesFailure = (error, thunk) => ({
  type: GET_TRADES_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const QUICK_EDO_PURCHASE = `${NAMESPACE}/QUICK_EDO_PURCHASE`
export const QUICK_EDO_PURCHASE_REQUEST = `${QUICK_EDO_PURCHASE}/REQUEST`
export const QUICK_EDO_PURCHASE_SUCCESS = `${QUICK_EDO_PURCHASE}/SUCCESS`
export const QUICK_EDO_PURCHASE_FAILURE = `${QUICK_EDO_PURCHASE}/FAILURE`

export const quickEdoPurchaseRequest = (ethAmount, edoAmount, password) => ({
  type: QUICK_EDO_PURCHASE_REQUEST,
  payload: { ethAmount, edoAmount, password },
  meta: { thunk: QUICK_EDO_PURCHASE },
})

export const quickEdoPurchaseSuccess = thunk => ({
  type: QUICK_EDO_PURCHASE_SUCCESS,
  meta: { thunk },
})

export const quickEdoPurchaseFailure = (error, thunk) => ({
  type: QUICK_EDO_PURCHASE_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const FETCH_BUNDLES = `${NAMESPACE}/FETCH_BUNDLES`
export const FETCH_BUNDLES_REQUEST = `${FETCH_BUNDLES}/REQUEST`
export const FETCH_BUNDLES_SUCCESS = `${FETCH_BUNDLES}/SUCCESS`
export const FETCH_BUNDLES_FAILURE = `${FETCH_BUNDLES}/FAILURE`

export const fetchBundlesRequest = () => ({
  type: FETCH_BUNDLES_REQUEST,
  meta: { thunk: FETCH_BUNDLES },
})

export const fetchBundlesSuccess = (bundles, address, thunk) => ({
  type: FETCH_BUNDLES_SUCCESS,
  payload: { bundles, address },
  meta: { thunk },
})

export const fetchBundlesFailure = (error, thunk) => ({
  type: FETCH_BUNDLES_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const IS_PAIR_OWNER = `${NAMESPACE}/IS_PAIR_OWNER`
export const IS_PAIR_OWNER_REQUEST = `${IS_PAIR_OWNER}/REQUEST`
export const IS_PAIR_OWNER_SUCCESS = `${IS_PAIR_OWNER}/SUCCESS`
export const IS_PAIR_OWNER_FAILURE = `${IS_PAIR_OWNER}/FAILURE`

export const isPairOwnerRequest = ({ password, pair, callback }) => ({
  type: IS_PAIR_OWNER_REQUEST,
  payload: { password, pair, callback },
  meta: { thunk: IS_PAIR_OWNER },
})

export const isPairOwnerSuccess = (pairs, thunk) => ({
  type: IS_PAIR_OWNER_SUCCESS,
  payload: { pairs },
  meta: { thunk },
})

export const isPairOwnerFailure = (error, thunk) => ({
  type: IS_PAIR_OWNER_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const GET_ORDER_LIST = `${NAMESPACE}/GET_ORDER_LIST`
export const GET_ORDER_LIST_REQUEST = `${GET_ORDER_LIST}/REQUEST`
export const GET_ORDER_LIST_SUCCESS = `${GET_ORDER_LIST}/SUCCESS`
export const GET_ORDER_LIST_FAILURE = `${GET_ORDER_LIST}/FAILURE`

export const getOrderListRequest = () => ({
  type: GET_ORDER_LIST_REQUEST,
  meta: { thunk: GET_ORDER_LIST },
})

export const getOrderListSuccess = (orders, thunk) => ({
  type: GET_ORDER_LIST_SUCCESS,
  payload: { orders },
  meta: { thunk },
})

export const getOrderListFailure = (error, thunk) => ({
  type: GET_ORDER_LIST_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const CREATE_ORDER = `${NAMESPACE}/CREATE_ORDER`
export const CREATE_ORDER_REQUEST = `${CREATE_ORDER}/REQUEST`
export const CREATE_ORDER_SUCCESS = `${CREATE_ORDER}/SUCCESS`
export const CREATE_ORDER_FAILURE = `${CREATE_ORDER}/FAILURE`

export const createOrderRequest = ({
                                     offerAddress,
                                     offerValue,
                                     wantAddress,
                                     wantValue,
                                     password,
                                   }) => ({
  type: CREATE_ORDER_REQUEST,
  payload: { offerAddress, offerValue, wantAddress, wantValue, password },
  meta: { thunk: CREATE_ORDER },
})

export const createOrderSuccess = (order, thunk) => ({
  type: CREATE_ORDER_SUCCESS,
  payload: { order },
  meta: { thunk },
})

export const createOrderFailure = (error, thunk) => ({
  type: CREATE_ORDER_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const CANCEL_ORDER = `${NAMESPACE}/CANCEL_ORDER`
export const CANCEL_ORDER_REQUEST = `${CANCEL_ORDER}/REQUEST`
export const CANCEL_ORDER_SUCCESS = `${CANCEL_ORDER}/SUCCESS`
export const CANCEL_ORDER_FAILURE = `${CANCEL_ORDER}/FAILURE`

export const cancelOrderRequest = (
  orderId,
  password,
  personalWalletAddress
) => ({
  type: CANCEL_ORDER_REQUEST,
  payload: { orderId, password, personalWalletAddress },
  meta: { thunk: CANCEL_ORDER },
})

export const cancelOrderSuccess = (orderId, thunk) => ({
  type: CANCEL_ORDER_SUCCESS,
  payload: { orderId },
  meta: { thunk },
})

export const cancelOrderFailure = (error, thunk) => ({
  type: CANCEL_ORDER_FAILURE,
  payload: error,
  error: true,
  meta: { thunk },
})

export const TOGGLE_PAIRS_ORDERING = `${NAMESPACE}/TOGGLE_PAIRS_ORDERING`

export const togglePairsOrdering = (field, type) => ({
  type: TOGGLE_PAIRS_ORDERING,
  payload: {
    field,
    type,
  },
})

export const TOGGLE_PAIR_FAVOURITE = `${NAMESPACE}/TOGGLE_PAIR_FAVOURITE`

export const togglePairFavourite = id => ({
  type: TOGGLE_PAIR_FAVOURITE,
  payload: { id },
})

export const UPDATE_PAIRS_SEARCH_TEXT = `${NAMESPACE}/UPDATE_PAIRS_SEARCH_TEXT`

export const updatePairsSearchText = (searchText, type) => ({
  type: UPDATE_PAIRS_SEARCH_TEXT,
  payload: {
    searchText,
    type,
  },
})

export const SET_PAIRS_FILTER = `${NAMESPACE}/SET_PAIRS_FILTER`

export const setPairsFilter = (filter, type) => ({
  type: SET_PAIRS_FILTER,
  payload: {
    filter,
    type,
  },
})
