import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'app/util/deepEqualConnect'
import i18next from 'i18next'
import {
  popPage,
  pushPage,
  replacePage,
  pushAssetInfoPage,
} from 'app/store/navigator/navigator.actions'
import {
  EXCHANGE_PAIR,
  EXCHANGE_NEW_ORDER,
  EXCHANGE_TRADING_WALLET_REQUIRED,
} from 'app/components/pages/'
import fromAssets from 'app/store/assets/assets.selectors'
import { ORDER_TYPES } from 'app/store/exchange/exchange.constants'
import fromExchange from 'app/store/exchange/exchange.selectors'
import fromTradingWallets from 'app/store/tradingWallets/tradingWallets.selectors'
import fromUserSpecificTiers, {
  getPairSymbolFromPair,
} from 'app/store/userSpecificTiers/userSpecificTiers.selectors'
import {
  getRequiredMinTier,
  isUserAllowed,
  isUserBlocked,
} from 'app/store/userSpecificTiers/userSpecificTiers.utils'
import {
  isPairOwnerRequest,
  GET_ORDERBOOK,
  GET_ORDER_LIST,
  GET_TRADES,
} from 'app/store/exchange/exchange.actions'
import {
  addSnackbar,
  showDialog,
  startLoader,
  stopLoader,
} from 'app/store/notifications/notifications.actions'
import { openKyc } from 'app/store/KYC/kyc.actions'
import { isKycActionable, getTier } from 'app/store/KYC/kyc.selectors'
import { ETHEREUM } from 'app/lib/wallet'
import fromWallets from 'app/store/wallets/wallets.selectors'
import fromRemoteConfig from 'app/store/remoteConfig/remoteConfig.selectors'
import makeShowExchangeUpdate from 'app/components/pages/ExchangePage/exchangeUpdateFactory'
import * as errors from 'app/lib/errors'
import {
  reduxSagaStateSelector,
  useReduxSagaThunkError,
} from 'app/components/hooks/useReduxSagaThunkError'
import ExchangePairPage from './ExchangePairPage'

const makeUserBlockedDialog = pair => ({
  variant: 'info',
  title: i18next.t('exchange.user_blocked.title'),
  text: i18next.t(`exchange.user_blocked.text`, {
    symbol: getPairSymbolFromPair(pair),
  }),
  safeButton: { text: 'close' },
})

const ExchangePairPageContainer = ({
                                     getOrderbookStatus,
                                     getTradesStatus,
                                     getOrdersStatus,
                                     ...props
                                   }) => {
  const orderbookOffline = useReduxSagaThunkError(getOrderbookStatus)
  const tradesOffline = useReduxSagaThunkError(getTradesStatus)
  const ordersOffline = useReduxSagaThunkError(getOrdersStatus)
  return (
    <ExchangePairPage
      offline={orderbookOffline || tradesOffline || ordersOffline}
      {...props}
    />
  )
}

const makeMapStateToProps = (initialState, { baseId, quoteId }) => {
  const base = fromAssets.getAssetById(baseId)(initialState)
  const quote = fromAssets.getAssetById(quoteId)(initialState)
  const pair = {
    ...fromExchange.getPair(base.symbol, quote.symbol)(initialState),
    base: {
      ...base,
      id: baseId,
    },
    quote: {
      ...quote,
      id: quoteId,
    },
  }
  const getActiveOrders = fromExchange.getActiveOrdersByPair(
    base.address,
    quote.address
  )
  const baseAsset = fromAssets.getAsset(ETHEREUM, base.address)(initialState)

  const hasTradingWallet =
    fromTradingWallets.activationStatus(initialState) === 'confirmed'

  const personalWalletAddress = fromWallets.getAddress(ETHEREUM)(initialState)
  const tradingWalletAddress = fromTradingWallets.tradingWalletAddress(
    initialState
  )

  return state => ({
    activeOrdersCount: getActiveOrders(state).length,
    hasTradingWallet,
    isKycActionable: isKycActionable(state),
    kycTier: getTier(state),
    personalWalletAddress,
    tradingWalletAddress,
    exchangeAddress: fromRemoteConfig.getExchangeAddress(state),
    exchangeMustBeUpdated: fromTradingWallets.tradingWalletMustBeUpdated(
      'exchange'
    )(state),
    exchangeUpdatePending: fromTradingWallets.tradingWalletUpdatePending(
      'exchange'
    )(state),
    isPairOwner: fromRemoteConfig.isPairOwner(state)({
      pair: { base, quote },
      personalWalletAddress,
    }),
    pair,
    baseAsset,
    getOrderbookStatus: reduxSagaStateSelector(state, GET_ORDERBOOK),
    getOrdersStatus: reduxSagaStateSelector(state, GET_ORDER_LIST),
    getTradesStatus: reduxSagaStateSelector(state, GET_TRADES),
    userSpecificTier: fromUserSpecificTiers.getRequiredUserTierForExchangePair(
      getPairSymbolFromPair(pair)
    )(state),
  })
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const notifyGenericError = () =>
    dispatch(
      showDialog({
        variant: 'danger',
        title: i18next.t('error_pages.something_went_wrong'),
        text: i18next.t('error_pages.generic_error.sorry_try_again'),
        primaryButton: { text: i18next.t('shared.ok'), action: () => {} },
      })
    )

  const notifyUnauthorized = () =>
    dispatch(
      showDialog({
        variant: 'danger',
        title: i18next.t('error_pages.unauthorized.title'),
        text: i18next.t('error_pages.unauthorized.text'),
        primaryButton: { text: i18next.t('shared.ok'), action: () => {} },
      })
    )

  const handleError = e => {
    dispatch(stopLoader())
    if (e.message === errors.UNAUTHORIZED) {
      notifyUnauthorized()
    } else {
      notifyGenericError()
    }
  }

  return {
    onBackClick: () => {
      dispatch(popPage())
    },
    onTabClick: (tab, index) =>
      dispatch(
        replacePage({
          name: EXCHANGE_PAIR,
          props: { ...ownProps, active: index },
        })
      ),
    goToNewOrder: props =>
      dispatch(
        pushPage({
          name: EXCHANGE_NEW_ORDER,
          props,
        })
      ),
    goToTradingWalletRequired: () =>
      dispatch(
        pushPage({
          name: EXCHANGE_TRADING_WALLET_REQUIRED,
        })
      ),
    showDialog: dialog => dispatch(showDialog(dialog)),
    addSnackbar: message => dispatch(addSnackbar(message)),
    goToKyc: () => dispatch(openKyc()),
    showExchangeUpdate: makeShowExchangeUpdate(dispatch),
    checkPairOwnership: password => {
      dispatch(startLoader())
      return dispatch(isPairOwnerRequest({ password }))
    },
    stopLoader: () => dispatch(stopLoader()),
    handleError,
    onInfo: asset => dispatch(pushAssetInfoPage(asset, dispatch)),
  }
}

function createDialog(type, pair, userSpecificTier, isActionable, goToKyc) {
  return {
    variant: 'info',
    title: i18next.t('exchange.kyc_required.title'),
    text: i18next.t(
      `exchange.kyc_required.${
        type === ORDER_TYPES.sell ? 'sell' : 'buy'
      }_text`,
      {
        symbol: pair.base.symbol,
        tier: userSpecificTier || pair.minTier,
      }
    ),
    primaryButton: {
      text: isActionable
        ? i18next.t('exchange.kyc_required.cta_start')
        : i18next.t('exchange.kyc_required.cta_pending'),
      action: isActionable ? goToKyc : undefined,
      disabled: !isActionable,
    },
    safeButton: isActionable ? undefined : { text: 'close' },
  }
}

const onActionClick = (
  type,
  pair,
  hasTradingWallet,
  orderCb,
  missingCb,
  showDialogCb,
  goToKyc,
  isActionable,
  kycTier,
  exchangeMustBeUpdated,
  showExchangeUpdate,
  isPairOwner,
  userSpecificTier
) => {
  if (!hasTradingWallet) {
    return missingCb()
  }
  if (exchangeMustBeUpdated) {
    return showExchangeUpdate()
  }

  if (isUserBlocked(userSpecificTier)) {
    return showDialogCb(makeUserBlockedDialog(pair))
  }

  const requiredMinTier = getRequiredMinTier(pair.minTier, userSpecificTier)

  if (!isPairOwner && !isUserAllowed(kycTier, requiredMinTier)) {
    return showDialogCb(
      createDialog(type, pair, requiredMinTier, isActionable, goToKyc)
    )
  }

  const props = {
    baseId: pair.base.id,
    quoteId: pair.quote.id,
    orderType: type,
  }

  return orderCb(props)
}

const mergeProps = (
  {
    hasTradingWallet,
    personalWalletAddress,
    tradingWalletAddress,
    exchangeAddress,
    exchangeMustBeUpdated,
    exchangeUpdatePending,
    baseAsset,
    ...stateProps
  },
  {
    goToNewOrder,
    goToTradingWalletRequired,
    startOrderbookUpdater,
    stopOrderbookUpdater,
    showExchangeUpdate,
    onInfo,
    ...dispatchProps
  },
  ownProps
) => {
  const actionArgs = [
    stateProps.pair,
    hasTradingWallet,
    goToNewOrder,
    goToTradingWalletRequired,
    dispatchProps.showDialog,
    dispatchProps.goToKyc,
    stateProps.isKycActionable,
    stateProps.kycTier,
    exchangeMustBeUpdated,
    showExchangeUpdate(
      personalWalletAddress,
      tradingWalletAddress,
      exchangeAddress,
      exchangeUpdatePending
    ),
    stateProps.isPairOwner,
    stateProps.userSpecificTier,
  ]

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onDisabledSellClick: () => {
      dispatchProps.addSnackbar(i18next.t('exchange.orderbook.presale_text'))
    },
    onSellClick: () => onActionClick(ORDER_TYPES.sell, ...actionArgs),
    onBuyClick: () => onActionClick(ORDER_TYPES.buy, ...actionArgs),
    onUnlock: password => {
      dispatchProps
        .checkPairOwnership(password, stateProps.pair)
        .then(({ pairs }) => {
          dispatchProps.stopLoader()
          const { pair } = stateProps
          if (pairs[getPairSymbolFromPair(pair)].sellEnabled) {
            onActionClick(ORDER_TYPES.sell, ...actionArgs)
          } else {
            dispatchProps.handleError(new Error(errors.UNAUTHORIZED))
          }
        })
        .catch(e => {
          dispatchProps.handleError(e)
        })
    },
    onInfo: () => onInfo(baseAsset),
  }
}

ExchangePairPageContainer.propTypes = {
  getOrderbookStatus: PropTypes.shape({}).isRequired,
  getTradesStatus: PropTypes.shape({}).isRequired,
  getOrdersStatus: PropTypes.shape({}).isRequired,
}
export default connect(
  makeMapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ExchangePairPageContainer)
