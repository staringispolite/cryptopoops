const CryptoPoops = artifacts.require("CryptoPoops");
const CryptoPoopTraits = artifacts.require("CryptoPoopTraits");

// If you want to hardcode what deploys, comment out process.env.X and use
// true/false;

module.exports = async (deployer, network, addresses) => {
  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = "";
  if (network === 'rinkeby') {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }

  await deployer.deploy(CryptoPoopTraits, {gas: 5000000});
  await deployer.deploy(CryptoPoops, "https://staringispolite.github.io/cp-api/json/", {gas: 5000000});
};
