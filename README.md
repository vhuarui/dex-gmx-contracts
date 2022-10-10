# GMX MW

## 项目准备

- 准备部署私钥
- 浏览器开源API KEY，在 [https://ftmscan.com/](https://ftmscan.com/) 注册账户，生成API KEY
- 安装依赖
    
    ```jsx
    yarn
    ```
    
- 复制 `.env.example` 文件为 `.env`
    - 填入部署私钥到`PRIVATE_KEY`字段
    - 填入浏览器API KEY 到`FANTOMSCAN_API_KEY` 字段（开源时使用）

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
            yarn hardhat test:token:deploy --network fantomtest--name "Bitcoin" --symbol BTC --supply 100000000 --decimals 18
            yarn hardhat test:token:deploy --network fantomtest --name "Chain Link" --symbol LINK --supply 100000000 --decimals 18
            yarn hardhat test:token:deploy --network fantomtest --name "USD Coin" --symbol USDC --supply 100000000 --decimals 6
            ```
            
    - 部署WFTM，示例
        
        ```jsx
        yarn hardhat test:wftm:deploy --network fantomtest
        ```
        
- **部署全部合约与初始化**
    - 修改确认 `config\tokens.json`  对应网络下Token地址与信息
    - 执行脚本
    
    ```jsx
    yarn hardhat deploy --network fantomtest
    ```
    
    > 部署时OrderKeeper，Liquidator，TimeLockAdmin等地址默认使用部署者地址
    > 

## 任务脚本

> 执行部署脚本后会在 `deployments` 目录下保留部署地址，执行任务会加载保留的地址合约进行交易，请确定地址正确
> 
- **开源合约**
    
    执行命令
    
    ```jsx
    yarn hardhat verify:all --network fantomtest
    ```