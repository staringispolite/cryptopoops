var chai = require('chai');
var expect = chai.expect;
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const cryptoPoops = artifacts.require('CryptoPoops');
const utils = require('./helpers/util');

contract("CryptoPoops", async (accounts) => {
  let [owner, alice, bob] = accounts;

  it("should not allow users to buy before sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await expectRevert(instance.dropPoops(1, {from: bob}), 
      "Sale hasn't started -- Reason given: Sale hasn't started.");
  });

  it("should not allow owner to buy before sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await expectRevert(instance.dropPoops(1, {from: owner}),
      "Sale hasn't started -- Reason given: Sale hasn't started.");
  });

  it("should allow owner to reserve giveaway NFTs before sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    const numToGiveaway = 30;
    const txn = await instance.reserveGiveaway(numToGiveaway, {from: owner});
    
    const NFTs = await instance.tokensOfOwner(owner);
    expect(NFTs.length).to.equal(numToGiveaway);
  });

  it("should not allow users to reserve giveaway NFTs before sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    const numToGiveaway = 69;
    await expectRevert(instance.reserveGiveaway(numToGiveaway, {from: bob}),
      "Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.");
  });

  it("should allow owner to start sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    const result = await instance.startSale({from: owner});
    expect(result.receipt.status).to.equal(true);
  });

  it("should not allow users to start sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    await expectRevert(instance.startSale({from: bob}),
      "Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.");
  });

  it("should allow users to buy after sale starts", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    expect(startSaleResult.receipt.status).to.equal(true);
    const buyResult = await instance.dropPoops(1,
      {from: bob, value: web3.utils.toWei("0.02", "ether")});
    expect(buyResult.receipt.status).to.equal(true);
    const numPoops = await instance.totalSupply({from: bob});
    expect(numPoops.toNumber()).to.equal(1);
    const encodedTraits = await instance.traitsOf(0);
    expectEvent(buyResult, "TraitAssigned", {
      tokenOwner: bob, tokenId: new BN(0), encodedTraits: encodedTraits });
  });

  it("should not allow users to buy more than 20", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    expect(startSaleResult.receipt.status).to.equal(true);
    await expectRevert(instance.dropPoops(21,
      {from: bob, value: web3.utils.toWei("0.42", "ether")}),
      "You can drop minimum 1, maximum 20 CryptoPoops -- Reason given: You can drop minimum 1, maximum 20 CryptoPoops."
    );
  });

  it("should require the proper amount for a reroll", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1,
      {from: bob, value: web3.utils.toWei("0.02", "ether")});
    expect(buyResult.receipt.status).to.equal(true);
    await expectRevert(instance.reRollTraits(1, 0,
      {from: bob, value: web3.utils.toWei("0.02", "ether")}),
      "Not enough ETH sent. Check re-roll price");
  });

  it("should not allow re-rolls of tokens that don't exist", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1,
      {from: bob, value: web3.utils.toWei("0.02", "ether")});
    expect(buyResult.receipt.status).to.equal(true);
    await expectRevert(instance.reRollTraits(20, 0,
      {from: alice, value: web3.utils.toWei("0.08", "ether")}),
      "Token doesn't exist");
  });

  it("should not allow anyone but the token owner to re-roll", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1,
      {from: bob, value: web3.utils.toWei("0.02", "ether")});
    expect(buyResult.receipt.status).to.equal(true);
    await expectRevert(instance.reRollTraits(0, 0,
      {from: alice, value: web3.utils.toWei("0.08", "ether")}),
      "Only token owner can re-roll");
  });

  it("should not allow re-rolls before max supply", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1,
      {from: bob, value: web3.utils.toWei("0.08", "ether")});
    expect(buyResult.receipt.status).to.equal(true);
    await expectRevert(instance.reRollTraits(0, 0,
      {from: bob, value: web3.utils.toWei("0.08", "ether")}),
      "Re-rolls will unlock at max supply!");
  });

});
