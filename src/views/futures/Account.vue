<template>
  <div class="app-container">
    <el-tabs v-model="tabName">
      <el-tab-pane :label="$t('trade.assets')" name="account">
        <el-table
          :data="account.assets"
          element-loading-text="$t('table.loading')"
          border
          fit
          size="mini"
          :row-key="rowKey"
          highlight-current-row
        >
          <el-table-column
            :label="$t('assets.asset')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.asset }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.walletBalance')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.walletBalance }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.unrealizedProfit')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.unrealizedProfit }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.marginBalance')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.marginBalance }}
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('assets.availableBalance')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.availableBalance }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.maxWithdrawAmount')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.maxWithdrawAmount }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('assets.updateTime')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ parseTime(scope.row.updateTime) }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('trade.position')" name="position">
        <div style="display: flex;justify-content: space-between;align-items: center; margin-bottom: 10px;">
          <div style="display: flex;flex-flow: row wrap;gap: 10px;justify-content: center;align-items: center;">
            <el-input
              v-model="search.symbol"
              :placeholder="$t('trade.coin')"
              style="width: 150px;"
              class="filter-item"
              size="small"
            />
            <el-button
              type="success"
              size="mini"
              @click="searchFuturesPositions"
            >
              {{ $t('table.search') }}
            </el-button>
            <div style="float:right; margin-right: 20px;">{{ $t('trade.nowProfit') }}: {{ allProfit }}</div>
            <div style="float:right; margin-right: 130px;">{{ $t('trade.positionCount') }}: {{ positions.length }}</div>
          </div>
          <div style="display: flex;flex-flow: row wrap;gap: 10px;align-items: center;">
            <el-select v-model="interval" size="small" style="width: 80px;" @change="changeRefreshInterval">
              <el-option v-for="n in 30" :key="n" :label="n + 's'" :value="n" />
            </el-select>
            <span>{{ $t('table.refreshInterval') }}</span>
          </div>
        </div>
        <el-table
          :data="positions"
          element-loading-text="$t('table.loading')"
          border
          fit
          size="mini"
          :row-key="rowKey"
          :expand-row-keys="expandKeys"
          highlight-current-row
          @sort-change="sortChange"
          @expand-change="expandChange"
        >
          <el-table-column
            :label="$t('position.symbol')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.symbol }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('position.positionAmt')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.positionAmt }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('position.entryPrice')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.entryPrice }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('position.markPrice')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.markPrice }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('position.liquidationPrice')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.liquidationPrice }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('position.unrealizedProfit')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span v-if="scope.row.nowProfit < 0" style="color: red;">{{ scope.row.unRealizedProfit }}</span>
              <span v-else style="color: green;">{{ scope.row.unRealizedProfit }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('position.nowProfit')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span v-if="scope.row.nowProfit < 0" style="color: red;">{{ scope.row.nowProfit }}</span>
              <span v-else style="color: green;">{{ scope.row.nowProfit }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('position.leverage')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.leverage }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('position.positionSide')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ $t('positionSide.' + scope.row.positionSide) }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('position.isolated')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.isolatedWallet != 0 ? $t('position.isolated') : $t('position.crossed') }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('trade.openOrder')" name="openOrder">
        <el-table
          :data="openOrders"
          element-loading-text="$t('table.loading')"
          border
          fit
          size="mini"
          :row-key="rowKey"
          highlight-current-row
        >
          <el-table-column
            :label="$t('order.symbol')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.symbol }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('order.price')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.price }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('order.origQty')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.origQty }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('order.executedQty')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.executedQty }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('order.side')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ $t('side.' + scope.row.side) }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('order.positionSide')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ $t('positionSide.' + scope.row.positionSide) }}
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('assets.updateTime')"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ parseTime(scope.row.updateTime) }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getFuturesAccount, getFuturesPositions, getFuturesOpenOrders } from '@/api/trade'
import { parseTime } from '@/utils'
import { round } from 'mathjs'

export default {
  data() {
    return {
      tabName: 'position', // account, position, openOrder
      account: {
        assets: [],
        positions: [],
      },
      positions: [],
      openOrders: [],

      search: {
        symbol: '',
      },
      sort: '+',
      rowKey(row) {
        if (row.positionSide) {
          return row.symbol + row.positionSide
        }
        return row.symbol
      },
      expandKeys: [],
      timeId: null,
      interval: 30,
    }
  },
  computed: {
    allProfit() {
      const profit = this.positions.reduce((carry, row) => carry + Number(row.unRealizedProfit), 0)
      return round(profit, 2)
    },
  },
  watch: {
    tabName(val) {
      this.fetchData(val)
    },
  },
  async created() {
    this.interval = localStorage.getItem('accountRefreshInterval') || 30
    await this.fetchData()
  },
  beforeDestroy() {
    clearInterval(this.timeId)
  },
  methods: {
    parseTime,
    changeRefreshInterval(val) {
      localStorage.setItem('accountRefreshInterval', val)
      this.fetchData()
    },
    round(data, num = 2) {
      return round(data, num)
    },
    expandChange(row, expandedRows) {
      this.expandKeys = expandedRows.map(item => item.symbol)
    },
    sortChange(data) {
      const { order } = data
      this.sort = order === 'ascending' ? '+' : '-'
      this.fetchData()
    },
    async fetchData(type = null) {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      if (!type) {
        type = this.tabName
      }
      if (type === 'account') {
        this.getFuturesAccount()
      } else if (type === 'position') {
        this.getFuturesPositions()
      } else if (type === 'openOrder') {
        this.getFuturesOpenOrders()
      }
      this.timeId = setInterval(() => {
        if (type === 'account') {
          this.getFuturesAccount()
        } else if (type === 'position') {
          this.getFuturesPositions()
        } else if (type === 'openOrder') {
          this.getFuturesOpenOrders()
        }
      }, this.interval * 1000)
    },
    async getFuturesAccount() {
      const { data: { assets = [], positions = [] }} = await getFuturesAccount()
      this.account = {
        assets,
        positions,
      }
      // this.account = {
      //   'assets': [
      //     {
      //       'asset': 'USDT', // 资产
      //       'walletBalance': '23.72469206', // 余额
      //       'unrealizedProfit': '0.00000000', // 未实现盈亏
      //       'marginBalance': '23.72469206', // 保证金余额
      //       'maintMargin': '0.00000000', // 维持保证金
      //       'initialMargin': '0.00000000', // 当前所需起始保证金
      //       'positionInitialMargin': '0.00000000', // 持仓所需起始保证金(基于最新标记价格)
      //       'openOrderInitialMargin': '0.00000000', // 当前挂单所需起始保证金(基于最新标记价格)
      //       'crossWalletBalance': '23.72469206', // 全仓账户余额
      //       'crossUnPnl': '0.00000000', // 全仓持仓未实现盈亏
      //       'availableBalance': '23.72469206', // 可用余额
      //       'maxWithdrawAmount': '23.72469206', // 最大可转出余额
      //       'updateTime': 1625474304765 // 更新时间
      //     },
      //     {
      //       'asset': 'USDC',
      //       'walletBalance': '103.12345678',
      //       'unrealizedProfit': '0.00000000',
      //       'marginBalance': '103.12345678',
      //       'maintMargin': '0.00000000',
      //       'initialMargin': '0.00000000',
      //       'positionInitialMargin': '0.00000000',
      //       'openOrderInitialMargin': '0.00000000',
      //       'crossWalletBalance': '103.12345678',
      //       'crossUnPnl': '0.00000000',
      //       'availableBalance': '126.72469206',
      //       'maxWithdrawAmount': '103.12345678',
      //       'updateTime': 1625474304765
      //     }
      //   ],
      //   'positions': [ // 仅有仓位或挂单的交易对会被返回
      //     // 根据用户持仓模式展示持仓方向，即单向模式下只返回BOTH持仓情况，双向模式下只返回 LONG 和 SHORT 持仓情况
      //     {
      //       'symbol': 'BTCUSDT', // 交易对
      //       'entryPrice': '100',
      //       'markPrice': '100',
      //       'positionSide': 'BOTH', // 持仓方向
      //       'positionAmt': '1.000', // 持仓数量
      //       'unrealizedProfit': '0.00000000', // 持仓未实现盈亏
      //       'isolatedMargin': '0.00000000',
      //       'notional': '0',
      //       'isolatedWallet': '0',
      //       'initialMargin': '0', // 持仓所需起始保证金(基于最新标记价格)
      //       'maintMargin': '0', // 当前杠杆下用户可用的最大名义价值
      //       'updateTime': 0 // 更新时间
      //     },
      //     {
      //       'symbol': 'ETHUSDT', // 交易对
      //       'entryPrice': '100',
      //       'markPrice': '100',
      //       'positionSide': 'BOTH', // 持仓方向
      //       'positionAmt': '1.000', // 持仓数量
      //       'unrealizedProfit': '0.00000000', // 持仓未实现盈亏
      //       'isolatedMargin': '0.00000000',
      //       'notional': '0',
      //       'isolatedWallet': '0',
      //       'initialMargin': '0', // 持仓所需起始保证金(基于最新标记价格)
      //       'maintMargin': '0', // 当前杠杆下用户可用的最大名义价值
      //       'updateTime': 0 // 更新时间
      //     }
      //   ]
      // }
    },
    async searchFuturesPositions() {
      const positions = this.positions.filter(item => {
        let flag = true
        if (this.search.symbol) {
          console.log(item.symbol, this.search.symbol)
          flag = flag && !item.symbol.includes(this.search.symbol)
        }
        return flag
      })
      this.positions = positions
    },
    async getFuturesPositions() {
      const { data: { positions = [] }} = await getFuturesPositions()
      this.positions = positions.map(position => {
        const positionAmtFloatAbs = Math.abs(position.positionAmt) // 空单为负数,纠正为绝对值
        const unRealizedProfit = Number(position.unRealizedProfit)
        const leverage = Number(position.leverage)
        const markPrice = Number(position.markPrice)
        const nowProfit = (unRealizedProfit / (positionAmtFloatAbs * markPrice)) * leverage * 100 // 当前收益率(正为盈利，负为亏损)

        return {
          ...position,
          unRealizedProfit: this.round(unRealizedProfit, 2),
          nowProfit: this.round(nowProfit, 6),
        }
      })
      this.search = {
        symbol: '',
      }
      // this.positions = [
      //   {
      //     symbol: 'BTCUSDT', // 交易对
      //     initialMargin: '0', // 当前所需起始保证金(基于最新标记价格)
      //     maintMargin: '0', // 维持保证金
      //     unrealizedProfit: '0.00000000', // 持仓未实现盈亏
      //     positionInitialMargin: '0', // 持仓所需起始保证金(基于最新标记价格)
      //     openOrderInitialMargin: '0', // 当前挂单所需起始保证金(基于最新标记价格)
      //     leverage: '100', // 杠杆倍率
      //     isolated: true, // 是否是逐仓模式
      //     entryPrice: '0.00000', // 持仓成本价
      //     maxNotional: '250000', // 当前杠杆下用户可用的最大名义价值
      //     positionSide: 'BOTH', // 持仓方向
      //     positionAmt: '0', // 持仓数量
      //     updateTime: 0 // 更新时间(订单交易成功时的时间，毫秒时间戳)
      //   },
      //   {
      //     symbol: 'XTZUSDT',
      //     positionAmt: '23.5', // 持仓数量
      //     entryPrice: '5.09', // 买入价格
      //     markPrice: '5.07920469',
      //     unRealizedProfit: '-0.25368978', // 当前收益
      //     liquidationPrice: '0.45161396',
      //     leverage: '10',
      //     maxNotionalValue: '1000000',
      //     marginType: 'cross',
      //     isolatedMargin: '0.00000000',
      //     isAutoAddMargin: 'false',
      //     positionSide: 'LONG',
      //     notional: '119.36131021', // 当前持仓usdt，原始等于 notional - unRealizedProfit
      //     isolatedWallet: '0',
      //     updateTime: 1638199621922
      //   },
      //   {
      //     symbol: 'XTZUSDT',
      //     positionAmt: '0.0',
      //     entryPrice: '0.0',
      //     markPrice: '5.07920469',
      //     unRealizedProfit: '0.00000000',
      //     liquidationPrice: '0',
      //     leverage: '10',
      //     maxNotionalValue: '1000000',
      //     marginType: 'cross',
      //     isolatedMargin: '0.00000000',
      //     isAutoAddMargin: 'false',
      //     positionSide: 'SHORT',
      //     notional: '0',
      //     isolatedWallet: '0',
      //     updateTime: 0
      //   }
      // ]
    },
    async getFuturesOpenOrders() {
      const { data: { openOrders }} = await getFuturesOpenOrders()
      this.openOrders = openOrders || []

      // this.openOrders = [
      //   {
      //     'avgPrice': '0.00000', // 平均成交价
      //     'clientOrderId': 'abc', // 用户自定义的订单号
      //     'cumQuote': '0', // 成交金额
      //     'executedQty': '0', // 成交量
      //     'orderId': 1917641, // 系统订单号
      //     'origQty': '0.40', // 原始委托数量
      //     'origType': 'TRAILING_STOP_MARKET', // 触发前订单类型
      //     'price': '0', // 委托价格
      //     'reduceOnly': false, // 是否仅减仓
      //     'side': 'BUY', // 买卖方向
      //     'positionSide': 'SHORT', // 持仓方向
      //     'status': 'NEW', // 订单状态
      //     'stopPrice': '9300', // 触发价，对`TRAILING_STOP_MARKET`无效
      //     'closePosition': false, // 是否条件全平仓
      //     'symbol': 'BTCUSDT', // 交易对
      //     'time': 1579276756075, // 订单时间
      //     'timeInForce': 'GTC', // 有效方法
      //     'type': 'TRAILING_STOP_MARKET', // 订单类型
      //     'activatePrice': '9020', // 跟踪止损激活价格, 仅`TRAILING_STOP_MARKET` 订单返回此字段
      //     'priceRate': '0.3', // 跟踪止损回调比例, 仅`TRAILING_STOP_MARKET` 订单返回此字段
      //     'updateTime': 1579276756075, // 更新时间
      //     'workingType': 'CONTRACT_PRICE', // 条件价格触发类型
      //     'priceProtect': false, // 是否开启条件单触发保护
      //     'priceMatch': 'NONE', // 盘口价格下单模式
      //     'selfTradePreventionMode': 'NONE', // 订单自成交保护模式
      //     'goodTillDate': 0 // 订单TIF为GTD时的自动取消时间
      //   }
      // ]
    },
  },
}
</script>
