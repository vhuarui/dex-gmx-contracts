## 项目准备

- 环境
    - node.js ⇒ v14.17.5
    - yarn ⇒ v1.22.17
    - git ⇒ v2.33.
- 准备部署私钥
- 浏览器开源API KEY，在 [https://ftmscan.com/](https://ftmscan.com/) 注册账户，生成API KEY
- 安装依赖
    
    ```jsx
    yarn
    ```
    
- 复制 `.env.example` 文件为 `.env`
    - 填入部署私钥到`PRIVATE_KEY`字段
    - 填入浏览器API KEY 到`FANTOMSCAN_API_KEY` 字段（开源时使用）

## 部署初始配置

**Vault**

- fundingInterval → 60 * 60(1小时) // 借款手续费周期
- fundingRateFactor  → 100(0.01%)  // 非稳定币借款费率因数（实际费率为 fundingRateFactor * reservedAmounts / poolAmount）
- stableFundingRateFactor → 100(0.01%)  // 稳定币借款费率因数（实际费率为 stableFundingRateFactor * reservedAmounts / poolAmount）
- mintBurnFeeBasisPoints -> 25(0.25%) // Buy/Sell Usdg 费率基点
- swapFeeBasisPoints -> 30(0.3%) // 非稳定币swap 费率基点
- stableSwapFeeBasisPoints -> 1(0.01%) // 稳定币swap 费率基点
- taxBasisPoints -> 50(0.5%) // 非稳定币swap或 Buy/Sell Usdg 费率浮动基点
- stableTaxBasisPoints -> 5(0.05%)  // 稳定币swap或 Buy/Sell Usdg 费率浮动基点
- marginFeeBasisPoints -> 10(0.1%) // 开平仓费率基点
- liquidationFeeUsd -> toUsd(5) // 清算费用
- minProfitTime -> 3 * 60 * 60 // minProfitTime时间内平仓收益低于最低收益基数无收益
    
    ```
    // if the minProfitTime has passed then there will be no min profit threshold
    // the min profit threshold helps to prevent front-running issues
    ```
    
- hasDynamicFees -> true // 是否开启swap或 Buy/Sell Usdg 费率浮动基点

**OrderBook**

- minExecutionFee → 0.0003FTM // 开仓执行费用
- minPurchaseTokenAmountUsd  → 10USD // 最小开仓USD金额

**FastPriceFeed**

- priceDataInterval → 5 * 60 // 价格累计变动窗口时间间隔
- spreadBasisPointsIfInactive → 50 (0.5%)
- spreadBasisPointsIfChainError → 500(5%)
- priceDuration ->  5 * 60, // 超过5分钟没有喂价，使用_refPrice(Chainlink价格) 加/减spreadBasisPointsIfInactive 部分
- maxPriceUpdateDelay ->  60 * 60, // 超过1小时没有喂价，使用_refPrice(Chainlink价格) 加/减spreadBasisPointsIfChainError 部分
- maxDeviationBasisPoints ->  750(7.5%), // FastPrice与ChainLink价格相差超过7.5%，取二者之一
- minBlockInterval ->  0, // 更新价格的最小区块间隔
- maxTimeDeviation → 60 * 60 (1小时) // 喂价提交时间戳与链上时间戳最大偏差
- maxCumulativeDeltaDiffs

> // under regular operation, the fastPrice (prices[token]) is returned and there is no spread returned from this function,
// though VaultPriceFeed might apply its own spread
//
// if the fastPrice has not been updated within priceDuration then it is ignored and only _refPrice with a spread is used (spread: spreadBasisPointsIfInactive)
// in case the fastPrice has not been updated for maxPriceUpdateDelay then the _refPrice with a larger spread is used (spread: spreadBasisPointsIfChainError)
//
// there will be a spread from the _refPrice to the fastPrice in the following cases:
// - in case isSpreadEnabled is set to true
// - in case the maxDeviationBasisPoints between _refPrice and fastPrice is exceeded
// - in case watchers flag an issue
// - in case the cumulativeFastDelta exceeds the cumulativeRefDelta by the maxCumulativeDeltaDiff
> 
- minAuthorizations → 1 // 处理需达到的最少人数
- signer → 允许 disableFastPrice 和 enableFastPrice，disableFastPriceVoteCount 达到minAuthorizations价格从FastPrice与ChainLink取，否则使用FastPrice
- updater、keeper → 允许喂价以及喂价并执行开/平仓请求

**PositionManager**

- depositFee = 30 // 0.3%，添加保证金收费比例
- orderKeeper // 限价订单执行者
- liquidator  // 清算执行者

**PositionRouter**

- depositFee → 30 (0.3%) // 开多杠杆降低时收取费用
- minExecutionFee → 0.0001 FTM // 最小开仓执行费用
- minBlockDelayKeeper → 1 // Keeper执行需要等待的最小区块间隔
- minTimeDelayPublic → 180 // 公开执行需要等待的最小时间间隔
- maxTimeDelay → 30 * 60(30分钟)  // 开仓请求过期时间间隔

************************GLP Manager************************

- cooldownDuration → 15 * 60 // 流动性冷冻期，到达之后才可移除流动性

**TokenManager**

- minAuthorizations: 1 // 执行需要达到的最小通过人数

**vaultTimeLock**

- buffer: 24 * 60 * 60 // 发起与执行时间间隔
- maxTokenSupply: 0 // mint方法可mint代币至最大totoalSupply
- maxMarginFeeBasisPoints  // 最大开平仓费用基点

**priceFeedTimelock**

- buffer: 24 * 60 * 60 // 发起执行时间间隔

**TokenConfig**

示例

```json
"btc": {
    "name": "btc",
    "address": "0x830d3f083e51d4475353Eea3e725CfA993C030b8",  // 代币地址
    "decimals": 18, // 代币精度
    "priceFeed": "0x65E8d79f3e8e36fE48eC31A2ae935e92F5bBF529",  //Chainlink预言机地址
    "priceDecimals": 8, // Chainlink价格精度
    "fastPricePrecision": 1000, // 价格乘数，1000表示可支持最大3位小数价格
    "maxCumulativeDeltaDiff": 1000000, // 价格最大累计变动
    "isStrictStable": false, // 是否严格稳定
    "tokenWeight": 20000, // 再平衡比例
    "minProfitBps": 0, // 最低利润基点 
    "maxUsdgAmount": 65000000, // 最大流动性
    "bufferAmount": 1500, // 保留数量，暂无效
    "isStable": false, // 是否稳定币
    "isShortable": true, // 是否可做空代币
    "maxGlobalLongSize": 35000000, // 最大可全局做多头寸规模
    "maxGlobalShortSize": 35000000 // 最大可全局做空头寸规模 
},
"eth": {
  "name": "eth",
  "address": "0x448a3C8745D0350D0D4991b70C65D68859a3D87f",
  "decimals": 18,
  "priceFeed": "0xB8C458C957a6e6ca7Cc53eD95bEA548c52AFaA24",
  "priceDecimals": 8,
  "fastPricePrecision": 1000,
  "maxCumulativeDeltaDiff": 1000000,
  "isStrictStable": false,
  "tokenWeight": 33000,
  "minProfitBps": 0,
  "maxUsdgAmount": 120000000,
  "bufferAmount": 42000,
  "isStable": false,
  "isShortable": true,
  "maxGlobalLongSize": 55000000,
  "maxGlobalShortSize": 50000000
},
"link": {
  "name": "link",
  "address": "0x06D234b3F1847648EF706E38f6314dBdcC0B00f7",
  "decimals": 18,
  "priceFeed": "0x6d5689Ad4C1806D1BA0c70Ab95ebe0Da6B204fC5",
  "priceDecimals": 8,
  "fastPricePrecision": 1000,
  "maxCumulativeDeltaDiff": 1000000,
  "isStrictStable": false,
  "tokenWeight": 1000,
  "minProfitBps": 0,
  "maxUsdgAmount": 6000000,
  "bufferAmount": 100000,
  "isStable": false,
  "isShortable": true,
  "spreadBasisPoints": 20, // 0.2%, maxPrice + 0.2%, minPrice - 0.2%
  "maxGlobalShortSize": 500000,
  "maxGlobalLongSize": 500000
},
"ftm": {
  "name": "ftm",
  "address": "0x671F048f142604592BdB5f5AcFeA9fb2EE6BF16D",
  "decimals": 18,
  "priceFeed": "0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D",
  "priceDecimals": 8,
  "fastPricePrecision": 10000,
  "maxCumulativeDeltaDiff": 1000000,
  "isStrictStable": false,
  "tokenWeight": 1000,
  "minProfitBps": 0,
  "maxUsdgAmount": 120000000,
  "bufferAmount": 0,
  "isStable": false,
  "isShortable": true,
  "maxGlobalLongSize": 500000,
  "maxGlobalShortSize": 500000
},
"usdc": {
  "name": "usdc",
  "address": "0xE2601442aA067015b0b385F038D1835707fDcFFb",
  "decimals": 6,
  "priceFeed": "0x9BB8A6dcD83E36726Cc230a97F1AF8a84ae5F128",
  "priceDecimals": 8,
  "isStrictStable": true,
  "tokenWeight": 45000,
  "minProfitBps": 0,
  "maxUsdgAmount": 180000000,
  "bufferAmount": 120000000,
  "isStable": true,
  "isShortable": false
},
"nativeToken": { // 原生封装代币
    "name": "wftm",
    "address": "0x671F048f142604592BdB5f5AcFeA9fb2EE6BF16D", // 代币地址
    "decimals": 18, // 代币精度
    "priceFeed": "0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D", //Chainlink预言机地址
    "priceDecimals": 8, // Chainlink价格精度
    "isStrictStable": false // 是否严格稳定
}
```

## 部署(以fantomtest为例)

- **编译合约**
    
    ```jsx
    yarn build
    ```
    
- **部署测试代币（主网无需部署）**
    - 部署ERC20代币 `yarn hardhat test:token:deploy --network {网络} --name {代币名称} --symbol {代币简称} --supply {代币初始供应} --decimals {代币精度}`
        - 示例
            
            ```jsx
            yarn hardhat test:token:deploy --network fantomtest --name "Ethereum" --symbol ETH --supply 100000000 --decimals 18
            yarn hardhat test:token:deploy --network fantomtest --name "Bitcoin" --symbol BTC --supply 100000000 --decimals 18
            yarn hardhat test:token:deploy --network fantomtest --name "Chain Link" --symbol LINK --supply 100000000 --decimals 18
            yarn hardhat test:token:deploy --network fantomtest --name "USD Coin" --symbol USDC --supply 100000000 --decimals 6
            ```
            
    - 部署WFTM，示例
        
        ```jsx
        yarn hardhat test:wftm:deploy --network fantomtest
        ```
        
- **部署全部合约与初始化**
    - 修改确认 `config\tokens.json` 对应网络下Token地址与信息
    - 修改确认 `config\contractConfigs.ts` 对应合约配置信息
    - 执行脚本
    
    ```jsx
    yarn hardhat deploy --network fantomtest
    ```
    
    > 部署时OrderKeeper，Liquidator，TimeLockAdmin等地址默认使用部署者地址
    > 
- **初始GMX Swap池（测试）**
    
    > 主网使用交易所的前端创建流动性池即可
    > 
    - 测试初始ETH/ GMX 为 1200
    - 初始化执行
        
        ```jsx
        yarn hardhat init:pair --network fantomtest
        ```
        
    - 获取Swap池Pair
        
        ```jsx
        yarn hardhat get:pair --network fantomtest
        ```
        

## 任务脚本

> 执行部署脚本后会在 `deployments` 目录下保留部署地址，执行任务会加载保留的地址合约进行交易，请确定地址正确
> 
- **提取手续费**
    
    执行命令
    
    ```jsx
    yarn hardhat withdraw:fees --network fantomtest
    ```
    
- **开源合约**
    
    执行命令
    
    ```jsx
    yarn hardhat etherscan-verify --network fantomtest
    ```