var chai = require('chai');
var expect = chai.expect;

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

  it("should allow re-rolls at max supply", async () => {
    const instance = await testableCryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1,
      {from: bob, value: web3.utils.toWei("0.08", "ether")});
    const firstEncodedTraits = await instance.traitsOf(0);

    // Use up supply to unlock re-rolls
    for (let i = 0; i < 13; i++) {
      await instance._test_mint500({from: alice});
    }

    const reRollResult = await instance._test_reRollTraits(0, 0, {
      from: bob,
      value: web3.utils.toWei("0.08", "ether"),
      gas: web3.utils.toWei("0.08", "ether")});
    const secondEncodedTraits = await instance.traitsOf(0);

    expectEvent(reRollResult, "TraitAssigned", {
      tokenOwner: bob, tokenId: new BN(0), encodedTraits: encodedTraits });
    expect(firstEncodedTraits.toString()).not.to.equal(secondEncodedTraits.toString);
  });
});
