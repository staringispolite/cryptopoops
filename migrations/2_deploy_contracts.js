const CryptoPoops = artifacts.require("CryptoPoops");
const CryptoPoopTraits = artifacts.require("CryptoPoopTraits");

// If you want to hardcode what deploys, comment out process.env.X and use
// true/false;

module.exports = async (deployer, network, addresses) => {
  await deployer.deploy(CryptoPoopTraits, {gas: 5000000});
  await deployer.deploy(CryptoPoops, "https://staringispolite.github.io/cp-api/json/", {gas: 5000000});
};
