var chai = require('chai');
var expect = chai.expect;

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const testCryptoPoopTraits = artifacts.require('TestableCryptoPoopTraits');
const utils = require('./helpers/util');

contract("TestableCryptoPoopTraits", async (accounts) => {
  let [owner, alice, bob] = accounts;

  it("should initialize correctly", async () => {
    const instance = await testCryptoPoopTraits.new();
    expect(instance).to.not.be.null;
  });

  it("should generate random levels", async () => {
    const instance = await testCryptoPoopTraits.new();

    let results = [0, 0, 0, 0, 0];
    for (let i = 0; i < 100; i++) {
      let txn = await instance._test_randomLevel({from: bob});
      let level = await instance._test_randomLevel.call({from: bob});
      expect(level.toNumber()).to.be.gte(0, "random level generated too low");
      expect(level.toNumber()).to.be.lte(5, "random level generated too high");
      results[level.toNumber()]++;
    }
    console.log("Random level results after 100 rolls");
    console.log(results);
  });

  it("should generate random traits, given a level", async () => {
    const instance = await testCryptoPoopTraits.new();

    // Set up traits for backgrounds
    let backgrounds = 0;
    let lookupArray = utils.setUpCategories(0);
    const result = await instance.setCategoryOptions(
      lookupArray[0], lookupArray[1], lookupArray[2], lookupArray[3], lookupArray[4],
      backgrounds, {from: owner});
    expect(result.receipt.status).to.equal(true);

    // Grab 100 backgrounds randomly
    let results = {};
    for (let i = 0; i < 100; i++) {
      let level = parseInt(Math.random() % 5);
      let txn = await instance._test_randomTrait(level, backgrounds, {from: bob});
      let chosenOption = (await instance._test_randomTrait.call(level, backgrounds, {from: bob})).toNumber();
      expect(lookupArray[level]).to.include(chosenOption, "random trait option invalid");
      if (results[chosenOption]) {
        results[chosenOption]++;
      } else {
        results[chosenOption] = 1;
      }
    }
    console.log("Random trait results after 100 rolls");
    console.log(results);
  });

  it("should encode each category properly", async () => {
    const instance = await testCryptoPoopTraits.new();

    // Set up traits for all categories
    let chosenOptions = [2, 3, 4, 5, 6];
    const encodedTraits = await instance._test_encodeTraits(chosenOptions);

    // Encoding would make it |0|0|0|6|5|4|3|2| with each || being 8 bits
    // Javascript only does up to 64bit integers, so may have to do string comparison
    correctEncoding = new BN(0);
    for (let i = 0; i < chosenOptions.length; i++) {
      let multFactor = new BN(2 ** (8*i));
      let chosenTrait = new BN(chosenOptions[i]);
      let encodedTrait = new BN(chosenTrait.mul(multFactor));
      correctEncoding = correctEncoding.add(encodedTrait);
    }
    expect(encodedTraits.toString()).to.equal(correctEncoding.toString());
  });

});
