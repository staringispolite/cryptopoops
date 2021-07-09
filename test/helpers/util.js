const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require('@openzeppelin/test-helpers');

async function shouldThrow(promise) {
  try {
    await promise;
    assert(true);
  }
  catch (err) {
    return;
  }
  assert(false, "The contract did not throw.");
}

function setUpCategories(startId) {
  let commonOptions = [startId++, startId++, startId++];
  let uncommonOptions = [startId++, startId++, startId++];
  let rareOptions = [startId++, startId++, startId++];
  let epicOptions = [startId++, startId++, startId++];
  let legendaryOptions = [startId++, startId++, startId++];

  let lookupArray = [
    commonOptions, uncommonOptions, rareOptions, epicOptions, legendaryOptions
  ];

  return lookupArray;
}

async function setUpSale(instance, ownerAccount) {
  const numCategories = 5;
  for (let i = 0; i < numCategories; i++) {
    let lookupArray = setUpCategories(i*3);
    await instance.setCategoryOptions(
      lookupArray[0], lookupArray[1], lookupArray[2], lookupArray[3], lookupArray[4],
      i, {from: ownerAccount});
  }
}

// Encoding would make it |0|0|0|6|5|4|3|2| with each || being 8 bits
// Javascript can't handle 64bit integers, so we use BN
function encodeTraits(chosenOptions) {
  correctEncoding = new BN(0);
  for (let i = 0; i < chosenOptions.length; i++) {
    let multFactor = new BN(2 ** (8*i));
    let chosenTrait = new BN(chosenOptions[i]);
    let encodedTrait = new BN(chosenTrait.mul(multFactor));
    correctEncoding = correctEncoding.add(encodedTrait);
  }
  return correctEncoding;
}

advanceTimeAndBlock = async (duration) => {
  await time.increase(duration);
  await time.advanceBlock();
}

module.exports = {
	advanceTimeAndBlock,
  encodeTraits,
  shouldThrow,
  setUpCategories,
  setUpSale,
};

