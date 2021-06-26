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

async function setUpSaleStaging(instance, ownerAccount) {
  let lookupArray = [
    [[1,2,3,4,5,6,10,11,13,14,15,16,17],  [8,9,18],  [7,19],  [12],  [20]],
    [[3],  [2,4],  [1,7],  [5],  [6]],
    [[17,19,20,26,27,32,33,34,35,36,37,38,39,40,41,42,43,51,52],  [1,2,3,4,5,7,8,9,10,12,14,15,16,21,22,23,24,25,28,29,30,46,47,48,53,55,56,57],  [11,13,18,31,49,50,54],  [6],  [44,45]],
    [[6,8],  [1,4,7,9],  [2,10,11],  [3],  [5]],
    [[7,10,12,13,15,17],  [1,4,8,11,14,18,19],  [2,3,5,6],  [16],  [9]],
  ];
  for (let i = 0; i < 5; i++) {
    await instance.setCategoryOptions(
      lookupArray[0][0], lookupArray[0][1], lookupArray[0][2], lookupArray[0][3], lookupArray[0][4],
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
  setUpSaleStaging,
};

