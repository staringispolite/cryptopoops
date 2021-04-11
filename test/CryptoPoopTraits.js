var chai = require('chai');
var expect = chai.expect;

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const cryptoPoopTraits = artifacts.require('CryptoPoopTraits');
const utils = require('./helpers/util');

contract("CryptoPoopTraits", async (accounts) => {
  let [owner, alice, bob] = accounts;

  it("should initialize correctly", async () => {
    const instance = await cryptoPoopTraits.new();
    expect(instance).to.not.be.null;
  });

  it("should allow owner to set level probabilities", async () => {
    const instance = await cryptoPoopTraits.new();
    const result = await instance.setLevelProbabilities(
      [50, 75, 90, 98, 100], {from: owner});
    expect(result.receipt.status).to.equal(true);
  });

  it("should not allow regular users to set level probabilities", async () => {
    const instance = await cryptoPoopTraits.new();
    utils.shouldThrow(instance.setLevelProbabilities(
      [40, 60, 80, 95, 100], {from: alice}));
  });

  it("should allow owner to set category options", async () => {
    const instance = await cryptoPoopTraits.new();

    let backgrounds = 0;
    let lookupArray = utils.setUpCategories();
    const result = await instance.setCategoryOptions(
      lookupArray[0], lookupArray[1], lookupArray[2], lookupArray[3], lookupArray[4],
      backgrounds, {from: owner});
    expect(result.receipt.status).to.equal(true);

    // Check that the data were persisted
    const newCommonOptions = await instance.getCategoryOptions(0, 0, {from: alice});
    let expectedArray = ["0", "10", "20"];
    assert.deepEqual(newCommonOptions.map(x => x.toString()), expectedArray);

    const newUncommonOptions = await instance.getCategoryOptions(0, 1, {from: alice});
    expectedArray = ["1", "11", "21"];
    assert.deepEqual(newUncommonOptions.map(x => x.toString()), expectedArray);

    const newRareOptions = await instance.getCategoryOptions(0, 2, {from: alice});
    expectedArray = ["2", "12", "22"];
    assert.deepEqual(newRareOptions.map(x => x.toString()), expectedArray);

    const newEpicOptions = await instance.getCategoryOptions(0, 3, {from: alice});
    expectedArray = ["3", "13", "23"];
    assert.deepEqual(newEpicOptions.map(x => x.toString()), expectedArray);

    const newLegendaryOptions = await instance.getCategoryOptions(0, 4, {from: alice});
    expectedArray = ["4", "14", "24"];
    assert.deepEqual(newLegendaryOptions.map(x => x.toString()), expectedArray);
  });

  it("should not allow regular users to set category options", async () => {
    const instance = await cryptoPoopTraits.new();

    utils.shouldThrow(instance.setCategoryOptions(
      [0], [0], [0], [0], [0], 0, {from: alice}));
  });

});
