# NFT-canonical: The starting ethereum codebase

## Installation
```
> git clone [etc]
> cd ethereum
> yarn install
> cp env.sample .env
```
Fill in .env variables as applicable

## Testing
Install Truffle and Ganache-CLI
Run Ganache and run tests (settings in truffle.js), eg...
``` 
> ganache-cli -a 10 -p 7545
> truffle test
```

## Staging deploy
```
truffle deploy --network rinkeby
truffle run verify EntryPointContractName --network rinkeby
<post-constructor configuration as needed>
<mint giveaway NFTs>
<start sale>
```
Note: This took 0.1495081 ETH at 20 GWei for CryptoPoops.
If mainnet is at 120 Gwei, that would be 0.8971 ETH.

## Production deploy
Same procedure as staging but with network set to `mainnet`
