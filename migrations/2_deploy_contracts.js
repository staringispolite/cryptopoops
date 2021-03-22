const CryptoPoops = artifacts.require("./CryptoPoops.sol");

// If you want to hardcode what deploys, comment out process.env.X and use
// true/false;

module.exports = async (deployer, network, addresses) => {
  await deployer.deploy(CryptoPoops, "https://staringispolite.github.io/cp-api/json/", {gas: 5000000});
};
