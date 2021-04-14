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
  xit("should allow re-rolls at max supply", async () => {
    const instance = await testableCryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);
    await utils.advanceTimeAndBlock(300);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(20,  // ***THESE 20 mint fine
      {from: bob, value: web3.utils.toWei("0.4", "ether")});
    const firstEncodedTraits = await instance.traitsOf(0);
    console.log('dropped 20 poops');
    await utils.advanceTimeAndBlock(300);

    // Use up supply to unlock re-rolls
    for (let i = 0; i < 60; i++) {
      await instance._test_mint100({
        from: alice, gas: "12000000" });
      await utils.advanceTimeAndBlock(300);
      console.log('minted 100 more');
    }

    const reRollResult = await instance._test_reRollTraits(0, 0, {
      from: bob, value: "80000000000000000"});
    const secondEncodedTraits = await instance.traitsOf(0);

    await expectEvent(reRollResult, "TraitAssigned", {
      tokenOwner: bob, tokenId: new BN(0), encodedTraits: secondEncodedTraits });
    expect(firstEncodedTraits.toString()).not.to.equal(secondEncodedTraits.toString);
  }).timeout(700000);
});
