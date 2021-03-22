import * as actions from './exchange.actions'

describe('exchange actions', () => {
  describe('getPairs', () => {
    describe('getPairs request', () => {
      it('should return an action', () => {
        expect(actions.getPairsRequest()).toEqual({
          type: actions.GET_PAIRS_REQUEST,
          meta: { thunk: actions.GET_PAIRS },
        })
      })
    })

    describe('getPairsSuccess', () => {
      it('should return an action', () => {
        expect(
          actions.getPairsSuccess([{ base: 'EDO', quote: 'ETH' }], 'thunk')
        ).toEqual({
          type: actions.GET_PAIRS_SUCCESS,
          payload: { pairs: [{ base: 'EDO', quote: 'ETH' }] },
          meta: { thunk: 'thunk' },
        })
      })
    })

    describe('getPairsFailure', () => {
      it('should return an action', () => {
        const error = new Error('error')
        expect(actions.getPairsFailure(error, 'thunk')).toEqual({
          type: actions.GET_PAIRS_FAILURE,
          payload: error,
          error: true,
          meta: { thunk: 'thunk' },
        })
      })
    })
  })

  describe('getOrderbook', () => {
    describe('getOrderbookRequest', () => {
      it('should return an action', () => {
        expect(actions.getOrderbookRequest('ETH', 'EDO')).toEqual({
          type: actions.GET_ORDERBOOK_REQUEST,
          payload: { base: 'ETH', quote: 'EDO' },
          meta: { thunk: actions.GET_ORDERBOOK },
        })
      })
    })

    describe('getOrderbookSuccess', () => {
      it('should return an action', () => {
        expect(actions.getOrderbookSuccess('ETH', 'EDO', [], 'thunk')).toEqual({
          type: actions.GET_ORDERBOOK_SUCCESS,
          payload: { base: 'ETH', quote: 'EDO', orderbook: [] },
          meta: { thunk: 'thunk' },
        })
      })
    })

    describe('getOrderbookFailure', () => {
      it('should return an action', () => {
        const error = new Error('error')
        expect(actions.getOrderbookFailure(error, 'thunk')).toEqual({
          type: actions.GET_ORDERBOOK_FAILURE,
          payload: error,
          error: true,
          meta: { thunk: 'thunk' },
        })
      })
    })
  })

  describe('cancelOrder', () => {
    describe('cancelOrderRequest', () => {
      it('should return an action', () => {
        expect(actions.cancelOrderRequest(1, 'password', 'address')).toEqual({
          type: actions.CANCEL_ORDER_REQUEST,
          payload: {
            orderId: 1,
            password: 'password',
            personalWalletAddress: 'address',
          },
          meta: { thunk: actions.CANCEL_ORDER },
        })
      })
    })

    describe('cancelOrderSuccess', () => {
      it('should return an action', () => {
        expect(actions.cancelOrderSuccess('id', 'thunk')).toEqual({
          type: actions.CANCEL_ORDER_SUCCESS,
          payload: { orderId: 'id' },
          meta: { thunk: 'thunk' },
        })
      })
    })

    describe('cancelOrderFailure', () => {
      it('should return an action', () => {
        const error = new Error('error')
        expect(actions.cancelOrderFailure(error, 'thunk')).toEqual({
          type: actions.CANCEL_ORDER_FAILURE,
          payload: error,
          error: true,
          meta: { thunk: 'thunk' },
        })
      })
    })
  })

  describe('quickEdoPurchase', () => {
    describe('quickEdoPurchaseRequest', () => {
      it('should return an action', () => {
        expect(actions.quickEdoPurchaseRequest(100, 10000, 'password')).toEqual(
          {
            type: actions.QUICK_EDO_PURCHASE_REQUEST,
            payload: {
              ethAmount: 100,
              edoAmount: 10000,
              password: 'password',
            },
            meta: { thunk: actions.QUICK_EDO_PURCHASE },
          }
        )
      })
    })

    describe('quickEdoPurchaseSuccess', () => {
      it('should return an action', () => {
        expect(actions.quickEdoPurchaseSuccess('thunk')).toEqual({
          type: actions.QUICK_EDO_PURCHASE_SUCCESS,
          meta: { thunk: 'thunk' },
        })
      })
    })

    describe('quickEdoPurchaseFailure', () => {
      it('should return an action', () => {
        const error = new Error('error')
        expect(actions.quickEdoPurchaseFailure(error, 'thunk')).toEqual({
          type: actions.QUICK_EDO_PURCHASE_FAILURE,
          payload: error,
          error: true,
          meta: { thunk: 'thunk' },
        })
      })
    })
  })

  describe('fetchBundles', () => {
    describe('fetchBundlesRequest', () => {
      it('should return an action', () => {
        expect(actions.fetchBundlesRequest()).toEqual({
          type: 'STORE/EXCHANGE/FETCH_BUNDLES/REQUEST',
          meta: { thunk: 'STORE/EXCHANGE/FETCH_BUNDLES' },
        })
      })
    })
    describe('fetchBundlesSuccess', () => {
      it('should return an action', () => {
        expect(
          actions.fetchBundlesSuccess([{ value: 1 }], 'address', 'thunk')
        ).toEqual({
          type: 'STORE/EXCHANGE/FETCH_BUNDLES/SUCCESS',
          payload: { bundles: [{ value: 1 }], address: 'address' },
          meta: { thunk: 'thunk' },
        })
      })
    })
    describe('fetchBundlesFailure', () => {
      it('should return an action', () => {
        const error = new Error('error')
        expect(actions.fetchBundlesFailure(error, 'thunk')).toEqual({
          type: 'STORE/EXCHANGE/FETCH_BUNDLES/FAILURE',
          meta: { thunk: 'thunk' },
          error: true,
          payload: error,
        })
      })
    })
  })

  describe('createOrder', () => {
    describe('createOrderRequest', () => {
      it('should return an action', () => {
        expect(
          actions.createOrderRequest({
            offerAddress: 'offerAddress',
            offerValue: 'offerValue',
            wantAddress: 'wantAddress',
            wantValue: 'wantValue',
            password: 'password',
          })
        ).toEqual({
          type: 'STORE/EXCHANGE/CREATE_ORDER/REQUEST',
          payload: {
            offerAddress: 'offerAddress',
            offerValue: 'offerValue',
            wantAddress: 'wantAddress',
            wantValue: 'wantValue',
            password: 'password',
          },
          meta: { thunk: actions.CREATE_ORDER },
        })
      })
    })

    describe('createOrderSuccess', () => {
      it('should return an action', () => {
        expect(actions.createOrderSuccess('order', 'thunk')).toEqual({
          type: 'STORE/EXCHANGE/CREATE_ORDER/SUCCESS',
          payload: { order: 'order' },
          meta: { thunk: 'thunk' },
        })
      })
    })

    describe('createOrderFailure', () => {
      it('should return an action', () => {
        const error = new Error('error')
        expect(actions.createOrderFailure(error, 'thunk')).toEqual({
          type: 'STORE/EXCHANGE/CREATE_ORDER/FAILURE',
          payload: error,
          error: true,
          meta: { thunk: 'thunk' },
        })
      })
    })
  })

  describe('getOrderList', () => {
    describe('getOrderListRequest', () => {
      it('should return an action', () => {
        expect(actions.getOrderListRequest()).toEqual({
          type: 'STORE/EXCHANGE/GET_ORDER_LIST/REQUEST',
          meta: { thunk: 'STORE/EXCHANGE/GET_ORDER_LIST' },
        })
      })
    })

    describe('getOrderListSuccess', () => {
      it('should return an action', () => {
        expect(actions.getOrderListSuccess(['order'], 'thunk')).toEqual({
          type: 'STORE/EXCHANGE/GET_ORDER_LIST/SUCCESS',
          payload: { orders: ['order'] },
          meta: { thunk: 'thunk' },
        })
      })
    })

    describe('getOrderListFailure', () => {
      it('should return an action', () => {
        const error = new Error('error')
        expect(actions.getOrderListFailure(error, 'thunk')).toEqual({
          type: 'STORE/EXCHANGE/GET_ORDER_LIST/FAILURE',
          payload: error,
          error: true,
          meta: { thunk: 'thunk' },
        })
      })
    })
  })
})

describe('isPairOwner', () => {
  describe('isPairOwner request', () => {
    it('should return an action', () => {
      const payload = {
        password: 'pippo',
        pair: 'EDO/ETH',
        callback: '1',
      }

      expect(actions.isPairOwnerRequest(payload)).toEqual({
        type: actions.IS_PAIR_OWNER_REQUEST,
        payload,
        meta: { thunk: actions.IS_PAIR_OWNER },
      })
    })
  })

  describe('isPairOwnerSuccess', () => {
    it('should return an action', () => {
      expect(
        actions.isPairOwnerSuccess([{ base: 'EDO', quote: 'ETH' }], 'thunk')
      ).toEqual({
        type: actions.IS_PAIR_OWNER_SUCCESS,
        payload: { pairs: [{ base: 'EDO', quote: 'ETH' }] },
        meta: { thunk: 'thunk' },
      })
    })
  })

  describe('isPairOwnerFailure', () => {
    it('should return an action', () => {
      const error = new Error('error')
      expect(actions.isPairOwnerFailure(error, 'thunk')).toEqual({
        type: actions.IS_PAIR_OWNER_FAILURE,
        payload: error,
        error: true,
        meta: { thunk: 'thunk' },
      })
    })
  })
})
