# cryptopoops

## Installation
```
> git clone [etc]
> cd cryptopoops
> yarn install
```

## Testing
Install Truffle and Ganache
Run Ganache (settings in truffle.js)
``` 
> truffle test
```

## Staging deploy
```
truffle deploy --network rinkeby
truffle run verify CryptoPoops --network rinkeby
<configure levels and traits>
<get giveaways>
<start sale>
```
Note: This took 0.1495081 ETH at 20 GWei.
Mainnet will likely be 120 Gwei, or 0.8971 ETH.


