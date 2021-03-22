import {
  call,
  cancel,
  delay,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects'
import get from 'lodash/get'
import ethereumUtil from 'ethereumjs-util'
import * as exchangeApi from 'app/api/exchange'
import * as orderApi from 'app/api/orders'
import { APP_READY } from 'app/core/core.actions'
import fromTradingWallets from 'app/store/tradingWallets/tradingWallets.selectors'
import { NEW_BLOCK } from 'app/store/wallets/wallets.actions'
import fromWallets from 'app/store/wallets/wallets.selectors'
import fromPersonalBalances from 'app/store/personalBalances/personalBalances.selectors'
import fromExchange from 'app/store/exchange/exchange.selectors'
import { WRONG_PASSWORD, INSUFFICIENT_FUNDS } from 'app/lib/errors'
import makeOrder from 'app/lib/order'
import vault from 'app/lib/vault'
import getWallet, { ETHEREUM } from 'app/lib/wallet'
import ethABI from 'app/util/lib/ethereumjs-abi'
import ethUtils from 'app/util/ethUtils'
import remoteConfigSelectors from 'app/store/remoteConfig/remoteConfig.selectors'
import quickEdoPurchaseTransactionFactory from 'app/core/exchange/model/quickEdoPurchaseTransactionFactory'
import * as actions from './exchange.actions'
import { ORDER_STATUS, ORDER_TYPES } from './exchange.constants'

const LOOP_DELAY = 5000

export function* generatePairsSignature(password) {
  const address = yield select(fromWallets.getAddress(ETHEREUM))

  const message = JSON.stringify({ path: exchangeApi.pairsPath })

  const ethAdapter = yield call(getWallet, ETHEREUM)

  const signature = yield call(
    ethAdapter.signMessage,
    ethereumUtil.toBuffer(message),
    password,
    address,
    { hashingFunction: 'keccak256' }
  )

  const rpcSignature = ethUtils.toRpcSig(signature.v, signature.r, signature.s)
  const base64Signature = Buffer.from(rpcSignature.replace('0x', '')).toString(
    'base64'
  )
  return base64Signature
}

const formatPairs = pairs =>
  pairs.reduce(
    (acc, { base, quote, fee, minQuoteAmountAllowed, ...pair }) => ({
      ...acc,
      [`${base.symbol}-${quote.symbol}`]: {
        ...pair,
        minOrder: minQuoteAmountAllowed,
        fee: Number.parseFloat(fee),
        base: {
          ...base,
          address: ethUtils.isZeroAddress(base.address)
            ? 'ether'
            : base.address,
        },
        quote: {
          ...quote,
          address: ethUtils.isZeroAddress(quote.address)
            ? 'ether'
            : quote.address,
        },
        minTier: pair.minTier || 0,
      },
    }),
    {}
  )

export function* getPairs({ meta: { thunk } }) {
  try {
    const userPersonalWalletAddress = yield select(
      fromWallets.getAddress(ETHEREUM)
    )
    const eoa = btoa(userPersonalWalletAddress)
    const response = yield call(exchangeApi.fetchPairs, eoa)
    const rawPairs = get(response, 'data.results', [])
    yield put(actions.getPairsSuccess(formatPairs(rawPairs), thunk))
  } catch (e) {
    yield put(actions.getPairsFailure(e, thunk))
  }
}

export function* checkPairOwner({ payload: { password }, meta: { thunk } }) {
  try {
    const signature = yield call(generatePairsSignature, password)
    const response = yield call(exchangeApi.fetchPairs, signature)
    const pairs = formatPairs(get(response, 'data.results', []))
    yield put(actions.isPairOwnerSuccess(pairs, thunk))
  } catch (e) {
    yield put(actions.isPairOwnerFailure(e, thunk))
  }
}

export function* getPairPrice({ payload: { base, quote }, meta: { thunk } }) {
  try {
    const response = yield call(exchangeApi.fetchPrice, base, quote)
    const priceChanges = get(response, 'data.change', {})
    const lastPrice = ethUtils.fromWei(get(response, 'data.last', 0), 'ether')
    yield put(
      actions.getPairPriceSuccess(base, quote, lastPrice, priceChanges, thunk)
    )
  } catch (e) {
    yield put(actions.getPairPriceFailure(e, thunk))
  }
}

const checkAssetAddress = address =>
  address === 'ether' ? ethUtils.ETH_ZERO_ADDRESS : address

export function* createOrder({
                               payload: { password, offerAddress, offerValue, wantAddress, wantValue },
                               meta: { thunk },
                             }) {
  const isPasswordValid = yield call(vault.isPasswordValid, password)
  if (!isPasswordValid) {
    yield put(actions.createOrderFailure(new Error(WRONG_PASSWORD), thunk))
    return
  }
  try {
    const exchangeAddress = yield select(
      remoteConfigSelectors.getExchangeAddress
    )
    const personalWalletAddress = yield select(fromWallets.getAddress(ETHEREUM))
    const order = makeOrder({
      exchangeAddress,
      personalWalletAddress,
      offerAddress: checkAssetAddress(offerAddress),
      offerValue,
      wantAddress: checkAssetAddress(wantAddress),
      wantValue,
    })

    const orderParts = [
      { value: order.exchangeAddress, type: 'address' },
      { value: order.maker, type: 'address' },
      { value: order.offerTokenAddress, type: 'address' },
      {
        value: ethUtils.bigNumberToBN(order.offerTokenAmount),
        type: 'uint256',
      },
      { value: order.wantTokenAddress, type: 'address' },
      { value: ethUtils.bigNumberToBN(order.wantTokenAmount), type: 'uint256' },
      { value: ethUtils.bigNumberToBN(order.expirationBlock), type: 'uint256' },
      { value: ethUtils.bigNumberToBN(order.salt), type: 'uint256' },
    ]

    const hashBuff = ethABI.soliditySHA3(
      orderParts.map(o => o.type),
      orderParts.map(o => o.value)
    )

    const orderHash = ethUtils.stripHexPrefix(
      ethereumUtil.bufferToHex(hashBuff)
    )

    const wallet = getWallet(ETHEREUM)

    const signedMessage = yield call(
      wallet.signMessage,
      Buffer.from(orderHash, 'hex'),
      password,
      personalWalletAddress
    )
    const data = {
      ...order,
      ecSignature: {
        ...signedMessage,
        r: ethUtils.add0x(signedMessage.r.toString('hex')),
        s: ethUtils.add0x(signedMessage.s.toString('hex')),
      },
    }

    const {
      result: { id },
    } = yield call(orderApi.createOrder, data)
    yield put(actions.createOrderSuccess({ ...order, id }, thunk))
    yield put(actions.getOrderListRequest())
  } catch (e) {
    yield put(actions.createOrderFailure(e, thunk))
  }
}

export function* cancelOrder({
                               payload: { orderId, password, personalWalletAddress },
                               meta: { thunk },
                             }) {
  const isPasswordValid = yield call(vault.isPasswordValid, password)
  if (!isPasswordValid) {
    yield put(actions.cancelOrderFailure(new Error(WRONG_PASSWORD), thunk))
    return
  }
  try {
    const wallet = getWallet(ETHEREUM)
    const message = {
      id: orderId,
      confirmation: 'cancel_request',
    }
    const messageParts = [
      { value: message.id, type: 'bytes32' },
      { value: message.confirmation, type: 'string' },
    ]
    const hashBuff = ethABI.soliditySHA3(
      messageParts.map(o => o.type),
      messageParts.map(o => o.value)
    )
    const orderHash = ethUtils.stripHexPrefix(
      ethereumUtil.bufferToHex(hashBuff)
    )
    const signedMessage = yield call(
      wallet.signMessage,
      Buffer.from(orderHash, 'hex'),
      password,
      personalWalletAddress
    )
    const data = {
      ...message,
      ecSignature: {
        ...signedMessage,
        r: ethUtils.add0x(signedMessage.r.toString('hex')),
        s: ethUtils.add0x(signedMessage.s.toString('hex')),
      },
    }
    yield call(orderApi.cancelOrder, data)
    yield put(actions.cancelOrderSuccess(orderId, thunk))
  } catch (e) {
    yield put(actions.cancelOrderFailure(e.message, thunk))
  }
}

function* fetchOrderList({ meta: { thunk } }) {
  try {
    const tradingWalletAddress = yield select(
      fromTradingWallets.tradingWalletAddress
    )
    const data = yield call(orderApi.orderList, tradingWalletAddress)
    const orders = data
      .filter(
        o =>
          o.status !== ORDER_STATUS.cancelled ||
          o.amountLocked !== '0' ||
          o.wantTokenAmountExpectedToBeFilled !== '0'
      )
      .map(o => ({
        id: o.id,
        added: o.added,
        orderType: o.type === 'buy' ? ORDER_TYPES.buy : ORDER_TYPES.sell,
        offerTokenAddress: o.offerTokenAddress,
        offerTokenAmount: o.offerTokenAmount,
        wantTokenAddress: o.wantTokenAddress,
        wantTokenAmount: o.wantTokenAmount,
        wantTokenAmountFilled: o.wantTokenAmountFilled,
        amountFilled: o.amountFilled,
        amountLocked: o.amountLocked,
        ethTokenRatio: o.ethTokenRatio,
        status: o.status,
        wantTokenAmountExpectedToBeFilled: o.wantTokenAmountExpectedToBeFilled,
      }))
    yield put(actions.getOrderListSuccess(orders, thunk))
  } catch (e) {
    yield put(actions.getOrderListFailure(e.message, thunk))
  }
}

export function* getOrderbook({ payload: { base, quote }, meta: { thunk } }) {
  try {
    const response = yield call(exchangeApi.fetchOrderbook, base, quote)
    yield put(actions.getOrderbookSuccess(base, quote, response.data, thunk))
  } catch (err) {
    yield put(actions.getOrderbookFailure(err, thunk))
  }
}

export function* getTrades({
                             payload: { base, quote, page, initial },
                             meta: { thunk },
                           }) {
  try {
    const from = new Date(
      yield select(fromExchange.getTradesLastUpdated(base, quote))
    )

    const to = new Date()
    const response = yield call(
      exchangeApi.fetchTrades,
      base,
      quote,
      from.toISOString(),
      to.toISOString(),
      page,
      initial
    )
    yield put(
      actions.getTradesSuccess(
        base,
        quote,
        response.data,
        to.getTime(),
        thunk,
        response.paging,
        page,
        initial
      )
    )
  } catch (err) {
    yield put(actions.getTradesFailure(err, thunk))
  }
}
export function* loop(action, delayMs) {
  while (true) {
    yield put(action)
    yield delay(delayMs)
  }
}

export function* orderbookUpdater() {
  while (true) {
    const {
      payload: { base, quote },
    } = yield take(actions.START_ORDERBOOK_UPDATER)
    const obTask = yield fork(
      loop,
      actions.getOrderbookRequest(base, quote),
      LOOP_DELAY
    )

    const priceTask = yield fork(
      loop,
      actions.getPairPriceRequest(base, quote),
      LOOP_DELAY
    )

    yield take(actions.STOP_ORDERBOOK_UPDATER)
    yield cancel(obTask)
    yield cancel(priceTask)
  }
}

export function* quickEdoPurchase({
                                    payload: { ethAmount, password },
                                    meta: { thunk },
                                  }) {
  try {
    const isPasswordValid = yield call(vault.isPasswordValid, password)
    if (!isPasswordValid) {
      yield put(
        actions.quickEdoPurchaseFailure(new Error(WRONG_PASSWORD), thunk)
      )
      return
    }
    const wallet = getWallet(ETHEREUM)
    const personalWalletAddress = yield select(fromWallets.getAddress(ETHEREUM))
    const quickEdoPurchaseAddress = yield select(
      fromExchange.getQuickEdoPurchaseAddress
    )
    const ethAmountBN = ethUtils.toBigNumber(ethAmount)
    // create transactions
    const quickEdoPurchaseTxData = quickEdoPurchaseTransactionFactory(
      quickEdoPurchaseAddress
    ).buyForTradingWallet(personalWalletAddress, ethAmountBN)
    const {
      txParams: quickEdoPurchaseTx,
      estimatedGas: quickEdoPurchaseEstimatedGas,
    } = yield call([wallet, 'prepareTransaction'], quickEdoPurchaseTxData)
    const { gasPrice } = quickEdoPurchaseTx
    // check if funds are enough
    const totalFees = gasPrice.times(quickEdoPurchaseEstimatedGas)
    const value = yield select(
      fromPersonalBalances.getBalanceValue(ETHEREUM, 'ether')
    )
    if (ethUtils.toBigNumber(value).lessThan(ethAmountBN.plus(totalFees))) {
      yield put(
        actions.quickEdoPurchaseFailure(new Error(INSUFFICIENT_FUNDS), thunk)
      )
      return
    }
    yield call([wallet, 'sendTransaction'], quickEdoPurchaseTx, password)
    yield put(actions.quickEdoPurchaseSuccess(thunk))
  } catch (e) {
    yield put(actions.quickEdoPurchaseFailure(e.message, thunk))
  }
}

export function* pairsUpdater() {
  while (true) {
    yield take(actions.START_PAIRS_UPDATER)
    const task = yield fork(loop, actions.getPairsRequest(), LOOP_DELAY)
    yield take(actions.STOP_PAIRS_UPDATER)
    yield cancel(task)
  }
}

export function* tradesUpdater() {
  while (true) {
    const {
      payload: { base, quote },
    } = yield take(actions.START_TRADES_UPDATER)
    const task = yield fork(
      loop,
      actions.getTradesRequest(base, quote),
      LOOP_DELAY
    )
    yield take(actions.STOP_TRADES_UPDATER)
    yield cancel(task)
  }
}

export function* watchForNewBlock() {
  while (true) {
    const {
      payload: { blockchain },
    } = yield take(NEW_BLOCK)
    if (blockchain === ETHEREUM) {
      const tradingWalletAddress = yield select(
        fromTradingWallets.tradingWalletAddress
      )
      if (tradingWalletAddress) {
        yield put(actions.getOrderListRequest())
      }
    }
  }
}

export function* fetchBundles({ meta: { thunk } }) {
  try {
    const bundlesResponse = yield call(exchangeApi.fetchBundles)
    const addressResponse = yield call(exchangeApi.fetchQuickEdoPurchaseAddress)
    yield put(
      actions.fetchBundlesSuccess(
        bundlesResponse.data.results,
        addressResponse.data.address,
        thunk
      )
    )
  } catch (e) {
    yield put(actions.fetchBundlesFailure(thunk))
  }
}

function* firstPairRequest() {
  yield put(actions.getPairsRequest())
}

export default function*() {
  yield fork(orderbookUpdater)
  yield fork(pairsUpdater)
  yield fork(tradesUpdater)
  yield fork(watchForNewBlock)
  yield takeLatest(APP_READY, firstPairRequest)
  yield takeLatest(actions.GET_PAIR_PRICE_REQUEST, getPairPrice)
  yield takeLatest(actions.GET_PAIRS_REQUEST, getPairs)
  yield takeLatest(actions.GET_ORDERBOOK_REQUEST, getOrderbook)
  yield takeLatest(actions.GET_TRADES_REQUEST, getTrades)
  yield takeLatest(actions.QUICK_EDO_PURCHASE_REQUEST, quickEdoPurchase)
  yield takeLatest(actions.FETCH_BUNDLES_REQUEST, fetchBundles)
  yield takeLatest(actions.IS_PAIR_OWNER_REQUEST, checkPairOwner)
  yield takeLatest(actions.GET_ORDER_LIST_REQUEST, fetchOrderList)
  yield takeEvery(actions.CREATE_ORDER_REQUEST, createOrder)
  yield takeEvery(actions.CANCEL_ORDER_REQUEST, cancelOrder)
}
