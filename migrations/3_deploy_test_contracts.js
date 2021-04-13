const TestableCryptoPoopTraits = artifacts.require("TestableCryptoPoopTraits");
const TestableCryptoPoops = artifacts.require("TestableCryptoPoops");

module.exports = async (deployer, network, addresses) => {
  await deployer.deploy(TestableCryptoPoopTraits, {gas: 5000000});
  await deployer.deploy(TestableCryptoPoops, {gas: 5000000});
}
