import i18next from 'i18next'
import PropTypes from 'prop-types'
import React from 'react'
import ContentLoader from 'react-content-loader'
import styled from 'styled-components'
import Flex from 'app/components/atoms/Flex'
import TableRow from 'app/components/atoms/TableRow'
import TableCell from 'app/components/atoms/TableCell'
import TableHead from 'app/components/molecules/TableHead'
import EmptyState from 'app/components/molecules/EmptyState'
import ExchangeTradesTableRow from 'app/components/molecules/ExchangeTradesTableRow'
import { ink100, ink200 } from 'app/components/themes/default/colors'

const TableWrapper = styled(Flex)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: stretch;
  align-items: stretch;
  background-color: ${({ theme }) => theme.colors.ink100};
  overflow: scroll;
  padding-bottom: 56px;
  flex: 1;
`

const StyledTable = styled.table`
  width: 100%;
  & tr > td:first-child {
    padding-left: 16px;
  }
  & tr > td:last-child {
    padding-right: 16px;
  }
`
const StyledTableHead = styled(TableHead)`
  background-color: white;
`

const StyledEmptyState = styled(EmptyState)`
  flex: 1 1 auto;
  padding-bottom: 56px;
`

const StyledContentLoader = styled(ContentLoader)`
  height: 48px;
  width: 100%;
  opacity: 0.5;
  margin-bottom: 16px;
`

const StyledTableCell = styled(TableCell)`
  padding: 0;
`

const ExchangePairList = ({
                            trades,
                            isOutOfDate,
                            baseSymbol,
                            quoteSymbol,
                            handleScroll,
                            pending,
                            ...props
                          }) => {
  const isPending = pending()
  return trades.length > 0 ? (
    <TableWrapper {...props} onScroll={handleScroll}>
      <StyledTable>
        <StyledTableHead
          entries={[
            {
              text: i18next.t('exchange.trades.price', {
                symbol: quoteSymbol,
              }),
            },
            {
              text: i18next.t('exchange.trades.trade_size', {
                symbol: baseSymbol,
              }),
              align: 'right',
            },
            { text: i18next.t('exchange.trades.time'), align: 'right' },
          ]}
        />
        <tbody>
        {trades.map(({ id, price, size, timestamp, isUp }) => (
          <ExchangeTradesTableRow
            key={id}
            price={price}
            size={size}
            isUp={isUp}
            timestamp={timestamp}
          />
        ))}
        {isPending && (
          <TableRow>
            <StyledTableCell colSpan="3">
              <StyledContentLoader
                height={48}
                width={402}
                speed={2}
                primaryColor={ink200}
                secondaryColor={ink100}
              >
                <rect x="0" y="24" rx="2" ry="2" width="115" height="18" />
                <rect x="199" y="24" rx="2" ry="2" width="58" height="18" />
                <rect x="335" y="24" rx="2" ry="2" width="67" height="18" />
              </StyledContentLoader>
            </StyledTableCell>
          </TableRow>
        )}
        </tbody>
      </StyledTable>
    </TableWrapper>
  ) : (
    <StyledEmptyState title={i18next.t('exchange.trades.empty_list_message')} />
  )
}

ExchangePairList.propTypes = {
  trades: PropTypes.arrayOf(PropTypes.object).isRequired,
  isOutOfDate: PropTypes.bool,
  baseSymbol: PropTypes.string.isRequired,
  quoteSymbol: PropTypes.string.isRequired,
  handleScroll: PropTypes.func,
  pending: PropTypes.func,
}

ExchangePairList.defaultProps = {
  isOutOfDate: false,
  handleScroll: () => {},
  pending: () => {},
}

export default ExchangePairList
