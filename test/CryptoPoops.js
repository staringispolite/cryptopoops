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

  // Only for use when grabbing selectors or interface IDs before deploy
  xit("should print its selector hashes", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    console.log('see CryptoPoops.sol::calculateSelector for which this is:');
    console.log(await instance.calculateSelector());
  });

  it("should report that it supports the ERC721 interfaces", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    const _INTERFACE_ID_ERC721 = "0x80ac58cd";
    const _INTERFACE_ID_ERC721_METADATA = "0x5b5e139f";
    const _INTERFACE_ID_ERC721_ENUMERABLE = "0x780e9d63";

    let supportResponse = await instance.supportsInterface(_INTERFACE_ID_ERC721);
    expect(supportResponse).to.equal(true);
    supportResponse = await instance.supportsInterface(_INTERFACE_ID_ERC721_METADATA);
    expect(supportResponse).to.equal(true);
    supportResponse = await instance.supportsInterface(_INTERFACE_ID_ERC721_ENUMERABLE);
    expect(supportResponse).to.equal(true);
  });

  it("should report that it supports the AccessControl interface", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    const ACCESS_CONTROL_INTERFACE_ID = "0x7965db0b";
    const supportResponse = await instance.supportsInterface(ACCESS_CONTROL_INTERFACE_ID);
    expect(supportResponse).to.equal(true);
  });


  it("should report that it supports our encoded traits interface", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    const ENCODED_TRAITS_INTERFACE_ID = "0x65e6617c";
    const supportResponse = await instance.supportsInterface(ENCODED_TRAITS_INTERFACE_ID);
    expect(supportResponse).to.equal(true);
  });

  it("should not allow users to buy before sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await expectRevert(instance.dropPoops(1, 0, {from: bob}), 
      "Sale hasn't started -- Reason given: Sale hasn't started.");
  });

  it("should not allow owner to buy before sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await expectRevert(instance.dropPoops(1, 0, {from: owner}),
      "Sale hasn't started -- Reason given: Sale hasn't started.");
  });

  it("should allow owner to reserve giveaway NFTs before sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    let txn = await instance.reserveGiveaway(20, {from: owner});
    expect(txn.receipt.status).to.equal(true);
    await utils.advanceTimeAndBlock(300);
    txn = await instance.reserveGiveaway(20, {from: owner});
    expect(txn.receipt.status).to.equal(true);
    await utils.advanceTimeAndBlock(300);
    txn = await instance.reserveGiveaway(20, {from: owner});
    expect(txn.receipt.status).to.equal(true);
    await utils.advanceTimeAndBlock(300);
    txn = await instance.reserveGiveaway(10, {from: owner});
    expect(txn.receipt.status).to.equal(true);

    const NFTs = await instance.tokensOfOwner(owner);
    expect(NFTs.length).to.equal(70);
  });

  it("should not allow owner to reserve more than 70 giveaway NFTs before sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    let txn = await instance.reserveGiveaway(20, {from: owner});
    expect(txn.receipt.status).to.equal(true);
    await utils.advanceTimeAndBlock(300);
    txn = await instance.reserveGiveaway(20, {from: owner});
    expect(txn.receipt.status).to.equal(true);
    await utils.advanceTimeAndBlock(300);
    txn = await instance.reserveGiveaway(20, {from: owner});
    expect(txn.receipt.status).to.equal(true);
    await utils.advanceTimeAndBlock(300);
    txn = await instance.reserveGiveaway(10, {from: owner});
    expect(txn.receipt.status).to.equal(true);
    
    await expectRevert(instance.reserveGiveaway(1, {from: owner}),
      "Exceeded giveaway supply");
  });

  it("should not allow users to reserve giveaway NFTs before sale", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    await expectRevert(instance.reserveGiveaway(1, {from: bob}),
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

    // Set up sale
    const startSaleResult = await instance.startSale({from: owner});
    expect(startSaleResult.receipt.status).to.equal(true);

    // Buy
    const buyResult = await instance.dropPoops(1, 0,
      {from: bob, value: web3.utils.toWei("0.042", "ether")});
    expect(buyResult.receipt.status).to.equal(true);

    // Confirm buy
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
    await expectRevert(instance.dropPoops(21, 0,
      {from: bob, value: web3.utils.toWei("0.42", "ether")}),
      "You can drop minimum 1, maximum 20 CryptoPoops -- Reason given: You can drop minimum 1, maximum 20 CryptoPoops."
    );
  });

  it("should not allow re-rolls of tokens that don't exist", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1, 0,
      {from: bob, value: web3.utils.toWei("0.042", "ether")});
    expect(buyResult.receipt.status).to.equal(true);
    await expectRevert(instance.reRollTraits(20, 0,
      {from: alice, value: web3.utils.toWei("0.84", "ether")}),
      "Token doesn't exist");
  });

  it("should not allow anyone but the token owner to re-roll", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1, 0,
      {from: bob, value: web3.utils.toWei("0.042", "ether")});
    expect(buyResult.receipt.status).to.equal(true);
    await expectRevert(instance.reRollTraits(0, 0,
      {from: alice, value: web3.utils.toWei("0.08", "ether")}),
      "Only token owner can re-roll");
  });

  it("should allow re-rolls regardless of max supply, as low as $0, if whitelisted", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1, 0,
      {from: bob, value: web3.utils.toWei("0.042", "ether")});
    const firstEncodedTraits = await instance.traitsOf(0);
    expect(buyResult.receipt.status).to.equal(true);

    // Grant role
    const reRollerRole = await instance.REROLLER_ROLE();
    const grantResult = await instance.grantRole(reRollerRole, bob, {from: owner});

    const reRollResult = await instance.reRollTraits(0, 0, {from: bob});
    const secondEncodedTraits = await instance.traitsOf(0);
    expect(firstEncodedTraits.toString()).not.to.equal(secondEncodedTraits.toString());
  });

  it("should not allow burning normally", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1, 0,
      {from: bob, value: web3.utils.toWei("0.042", "ether")});
    const firstEncodedTraits = await instance.traitsOf(0);
    expect(buyResult.receipt.status).to.equal(true);

    await expectRevert(instance.burnToken(0, {from: bob}),
      "Not approved for burning");
  });

  it("should allow burning if whitelisted", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1, 0,
      {from: bob, value: web3.utils.toWei("0.042", "ether")});
    const firstEncodedTraits = await instance.traitsOf(0);
    expect(buyResult.receipt.status).to.equal(true);

    // Grant role
    const burnerRole = await instance.BURNER_ROLE();
    const grantResult = await instance.grantRole(burnerRole, bob, {from: owner});

    const burnResult = await instance.burnToken(0, {from: bob});
    expect(buyResult.receipt.status).to.equal(true);

    await expectRevert(instance.traitsOf(0),
      "Traits query for nonexistent token");
  });

  it("should lower supply but not nextTokenId on a burn event", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1, 0,
      {from: bob, value: web3.utils.toWei("0.042", "ether")});
    const firstEncodedTraits = await instance.traitsOf(0);
    expect(buyResult.receipt.status).to.equal(true);

    // Grant role
    const burnerRole = await instance.BURNER_ROLE();
    const grantResult = await instance.grantRole(burnerRole, bob, {from: owner});

    // Burn and buy another
    const burnResult = await instance.burnToken(0, {from: bob});
    expect(buyResult.receipt.status).to.equal(true);

    const buyResult2 = await instance.dropPoops(1, 0,
      {from: bob, value: web3.utils.toWei("0.08", "ether")});
    expect(buyResult2.receipt.status).to.equal(true);

    // Verify it issues tokenId 1, not re-issues 0
    // (this will revert if not)
    const secondEncodedTraits = await instance.traitsOf(1);

    // Verify totalSupply is still 1
    const totalSupply = await instance.totalSupply();
    expect(totalSupply.toString()).to.equal("1");
  });

  it("should not allow burning NFTs you don't own", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    const startSaleResult = await instance.startSale({from: owner});
    const buyResult = await instance.dropPoops(1, 0,
      {from: bob, value: web3.utils.toWei("0.042", "ether")});
    const firstEncodedTraits = await instance.traitsOf(0);
    expect(buyResult.receipt.status).to.equal(true);

    // Grant role
    const burnerRole = await instance.BURNER_ROLE();
    const grantResult = await instance.grantRole(burnerRole, alice, {from: owner});

    await expectRevert(instance.burnToken(0, {from: alice}),
      "Only token owner can burn");
  });

  it("should require the correct price if not whitelisted", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    // Set up the sale
    const startSaleResult = await instance.startSale({from: owner});
    expect(startSaleResult.receipt.status).to.equal(true);

    // Buy with no ETH
    await expectRevert(instance.dropPoops(1, 0, {from: alice}),
      "Ether value sent is below the price");
  });

  it("should allow minting for free if whitelisted", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    // Set up the sale
    const startSaleResult = await instance.startSale({from: owner});
    expect(startSaleResult.receipt.status).to.equal(true);

    // Grant role
    const minterRole = await instance.MINTER_ROLE();
    const grantResult = await instance.grantRole(minterRole, alice, {from: owner});

    // Buy with no ETH
    const buyResult = await instance.dropPoops(1, 0, {from: alice});
    expect(buyResult.receipt.status).to.equal(true);

    // Confirm minting
    const numPoops = await instance.totalSupply({from: alice});
    expect(numPoops.toNumber()).to.equal(1);
    const encodedTraits = await instance.traitsOf(0);
    expectEvent(buyResult, "TraitAssigned", {
      tokenOwner: alice, tokenId: new BN(0), encodedTraits: encodedTraits });
  });

  it("should error on non-whitelisted use of minting boost", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    // Set up the sale
    const startSaleResult = await instance.startSale({from: owner});
    expect(startSaleResult.receipt.status).to.equal(true);

    // Buy with boost
    await expectRevert(instance.dropPoops(1, 1, {from: alice, value: web3.utils.toWei("0.042", "ether")}),
      "If you'd like a contract to be whitelisted for minting or boost, say hi in the Discord");
  });
  
  it("should allow boosted minting if whitelisted", async () => {
    const instance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");
    await utils.setUpSale(instance, owner);

    // Set up the sale
    const startSaleResult = await instance.startSale({from: owner});
    expect(startSaleResult.receipt.status).to.equal(true);

    // Grant role
    const minterRole = await instance.MINTER_ROLE();
    const grantResult = await instance.grantRole(minterRole, alice, {from: owner});

    // Buy with no ETH
    const buyResult = await instance.dropPoops(1, 1, {from: alice});
    expect(buyResult.receipt.status).to.equal(true);

    // Confirm minting
    const numPoops = await instance.totalSupply({from: alice});
    expect(numPoops.toNumber()).to.equal(1);
    const encodedTraits = await instance.traitsOf(0);
    expectEvent(buyResult, "TraitAssigned", {
      tokenOwner: alice, tokenId: new BN(0), encodedTraits: encodedTraits });
  });

  it("should incorporate a boost, if one is present", async () => {
    const cpInstance = await cryptoPoops.new("https://nftapi.com/cryptopoops/");

    // Set up sale such that we have access to all the trait IDs after
    const numCategories = 5;
    const numLevels = 5;
    let lookupArray = [[], [], [], [], []];
    for (let i = 0; i < numCategories; i++) {
      lookupArray[i] = utils.setUpCategories(i*3);
      await cpInstance.setCategoryOptions(
        lookupArray[i][0], lookupArray[i][1], lookupArray[i][2],
        lookupArray[i][3], lookupArray[i][4], i, {from: owner}
      );
    }

    // Start sale
    const startSaleResult = await cpInstance.startSale({from: owner});
    expect(startSaleResult.receipt.status).to.equal(true);

    // Grant role
    const minterRole = await cpInstance.MINTER_ROLE();
    const grantResult = await cpInstance.grantRole(minterRole, bob, {from: owner});

    // Buy
    const buyResult = await cpInstance.dropPoops(1, 4,
      {from: bob, value: web3.utils.toWei("0.02", "ether")});
    expect(buyResult.receipt.status).to.equal(true);

    // Confirm buy
    const numPoops = await cpInstance.totalSupply({from: bob});
    expect(numPoops.toNumber()).to.equal(1);
    const encodedTraits = await cpInstance.traitsOf(0);
    expectEvent(buyResult, "TraitAssigned", {
      tokenOwner: bob, tokenId: new BN(0), encodedTraits: encodedTraits });

    // Spot check the background trait encoded
    const spotCheckTrait = encodedTraits.mod(new BN("256", 10)).toString();
    expect(lookupArray[0][numLevels-1]).to.deep.include(parseInt(spotCheckTrait));
  });

  // TODO: Let a whitelisted mutater role change DNA?

});
