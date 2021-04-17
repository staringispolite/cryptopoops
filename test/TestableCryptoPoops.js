var chai = require('chai');
var expect = chai.expect;
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const testableCryptoPoops = artifacts.require('TestableCryptoPoops');
const utils = require('./helpers/util');

contract("TestableCryptoPoops", async (accounts) => {
  let [owner, alice, bob] = accounts;

  // Paused by default, since the test takes 10mins to sell out supply
  xit("should allow buying all the way to max supply", async () => {
    const instance = await testableCryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);
    await utils.advanceTimeAndBlock(300);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(20,  // ***THESE 20 mint fine
      {from: bob, value: web3.utils.toWei("0.4", "ether")});
    const firstEncodedTraits = await instance.traitsOf(0);
    await utils.advanceTimeAndBlock(300);

    // Use up supply to unlock re-rolls
    for (let i = 0; i < 60; i++) {
      const bulkMintResult = await instance._test_mint100({
        from: alice, gas: "12000000" });
      expect(bulkMintResult.receipt.status).to.equal(true);
      await utils.advanceTimeAndBlock(300);
    }

  }).timeout(700000);

  it("should allow re-rolls before max supply if whitelisted", async () => {
    const instance = await testableCryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(20, 0,
      {from: bob, value: web3.utils.toWei("0.4", "ether")});
    const firstEncodedTraits = await instance.traitsOf(0);
    await utils.advanceTimeAndBlock(300);
  });

});
