const TestableCryptoPoopTraits = artifacts.require("TestableCryptoPoopTraits");

module.exports = async (deployer, network, addresses) => {
  await deployer.deploy(TestableCryptoPoopTraits, {gas: 5000000});
}
