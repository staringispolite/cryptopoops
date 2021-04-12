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

module.exports = {
  shouldThrow,
  setUpCategories,
  setUpSale
};

