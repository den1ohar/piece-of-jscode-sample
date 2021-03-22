import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import i18next from 'i18next'
import { compose, withHandlers, withState } from 'recompose'
import PageTemplate from 'app/components/templates/PageTemplate'
import Button from 'app/components/atoms/Button'
import Elevation from 'app/components/atoms/Elevation'
import AppBar from 'app/components/molecules/AppBar'
import Banner from 'app/components/molecules/Banner'
import Tabs from 'app/components/molecules/Tabs'
import OrderBook from 'app/components/organisms/OrderBook'
import ExchangeTradesList from 'app/components/organisms/ExchangeTradesList'
import {
  ternary,
  safeAreaInsetBottom,
  safeAreaInsetsVariables,
} from 'app/components/mixins'
import Orders from 'app/components/organisms/Orders'
import UnlockSheet from 'app/components/organisms/UnlockSheet'
import { PairShape } from 'app/components/propTypes'
import { white } from 'app/components/themes/default/colors'
import { TYPES } from 'app/components/organisms/ExchangeSelectionCard'
import {
  elevationOffset3,
  elevationOffset6,
} from 'app/components/themes/default/elevationOffsets'

const StyledBanner = styled(Banner).attrs({ depth: 1 })`
  z-index: ${elevationOffset3};
  flex: 0 0 auto;
`

const formatAppBarText = ({ base, quote }) => `${base.symbol} / ${quote.symbol}`

const getOrderListTabLabel = length =>
  i18next
    .t('exchange.orderbook.your_orders', {
      orders: length > 0 ? `(${length})` : '',
    })
    .trim()

const Page = styled(PageTemplate)`
  background-color: ${white};
  height: 100vh;
  overflow: hidden;
`

const Header = styled.div`
  z-index: ${elevationOffset3};
`

const Footer = styled(Elevation)`
  position: absolute;
  z-index: ${elevationOffset6};
  width: 100%;
  bottom: 0;
  ${safeAreaInsetsVariables};
  padding: 8px 0 calc(${safeAreaInsetBottom} + 8px) 0;
  background-color: white;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  align-items: center;
  ${ternary('hideBars')('transform: translate3d(0, 100%, 0)', '')};
  transition: 0.2s ease;
`

const StyledButton = styled(Button)`
  order: 0;
  flex: 1 1 auto;
  align-self: auto;
  margin-left: 8px;
  &:last-child {
    margin-right: 8px;
  }
`

const StyledOrders = styled(Orders)`
  flex: 1 0 0;
  overflow-y: scroll;
`

const StyledAppBar = styled(AppBar)`
  background-image: url(${({ type }) => TYPES[type].background});
  background-size: cover;
`

const enhance = compose(
  withState('hideBars', 'setHideBars', false),
  withState(
    'isPasswordSheetVisible',
    'setPasswordSheetVisible',
    ({ isPasswordSheetVisible }) => isPasswordSheetVisible || false
  ),
  withHandlers(() => {
    let showTimeout
    let isCenteringScroll = true
    return {
      handleScroll: ({ setHideBars }) => () => {
        if (isCenteringScroll) {
          isCenteringScroll = false
          return
        }
        setHideBars(true)
        if (showTimeout) {
          clearTimeout(showTimeout)
        }
        showTimeout = setTimeout(() => {
          setHideBars(false)
        }, 250)
      },
      resetCenteringScroll: () => () => {
        isCenteringScroll = true
      },
    }
  })
)

const ExchangePairPage = enhance(
  ({
     active,
     activeOrdersCount,
     handleScroll,
     hideBars,
     setHideBars,
     isPairOwner,
     isPasswordSheetVisible,
     offline,
     onBackClick,
     onBuyClick,
     onDisabledSellClick,
     onSellClick,
     onTabClick,
     onUnlock,
     pair,
     resetCenteringScroll,
     setPasswordSheetVisible,
     token,
     onInfo,
     ...props
   }) => {
    const leftIcons = [
      {
        icon: 'chevron_left',
        onClick: onBackClick,
      },
    ]

    const rightIcons = [
      {
        icon: 'info',
        onClick: onInfo,
      },
    ]

    const appBar = (
      <Header>
        <StyledAppBar
          type={pair.family}
          leftIcons={leftIcons}
          rightIcons={rightIcons}
          variant="transparentOnDark"
        >
          {formatAppBarText(pair)}
        </StyledAppBar>
        <Tabs
          tabs={[
            { text: i18next.t('exchange.orderbook.orderbook') },
            { text: i18next.t('exchange.trades.trades') },
            { text: getOrderListTabLabel(activeOrdersCount) },
          ]}
          fontSize="sizeBody2"
          backgroundColor="white"
          active={active}
          onTabClick={(tab, index) => {
            if (active !== index) {
              resetCenteringScroll()
            }
            onTabClick(tab, index)
          }}
        />
      </Header>
    )

    return (
      <Page appBar={appBar} withFlex {...props}>
        {offline && (
          <StyledBanner
            title={i18next.t('exchange.unreachable.title')}
            content={i18next.t('exchange.unreachable.body')}
            icon="priority_high"
          />
        )}
        {active === 0 && (
          <OrderBook
            handleScroll={handleScroll}
            hideBars={hideBars}
            pair={pair}
          />
        )}
        {active === 1 && <ExchangeTradesList pair={pair} />}
        {active === 2 && (
          <StyledOrders
            onCancellingOrder={cancelling => setHideBars(cancelling)}
            pair={pair}
          />
        )}
        <Footer depth={24} hideBars={hideBars}>
          <StyledButton onClick={onBuyClick} data-hook="exchange-buy-button">
            {i18next.t('exchange.shared.buy')}
          </StyledButton>
          <StyledButton
            data-hook="exchange-sell-button"
            onClick={() => {
              if (isPairOwner) {
                setPasswordSheetVisible(true)
              } else {
                onSellClick()
              }
            }}
            onDisabledClick={onDisabledSellClick}
            variant="danger"
            disabled={isPairOwner ? false : pair.isInPresale}
          >
            {i18next.t('exchange.shared.sell')}
          </StyledButton>
        </Footer>
        {isPasswordSheetVisible && (
          <UnlockSheet
            title="Insert your password"
            actionText=""
            buttonText="Proceed"
            show
            onClose={() => {
              setPasswordSheetVisible(false)
            }}
            onUnlock={onUnlock}
          />
        )}
      </Page>
    )
  }
)

ExchangePairPage.propTypes = {
  active: PropTypes.number,
  isPairOwner: PropTypes.bool,
  isPasswordSheetVisible: PropTypes.bool,
  onTabClick: PropTypes.func.isRequired,
  pair: PairShape.isRequired,
}

ExchangePairPage.defaultProps = {
  active: 0,
  isPairOwner: false,
  isPasswordSheetVisible: false,
}

export default ExchangePairPage
