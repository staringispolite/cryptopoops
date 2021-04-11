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

function setUpCategories() {
  let commonOptions = [0, 10, 20];
  let uncommonOptions = [1, 11, 21];
  let rareOptions = [2, 12, 22];
  let epicOptions = [3, 13, 23];
  let legendaryOptions = [4, 14, 24];

  let lookupArray = [
    commonOptions, uncommonOptions, rareOptions, epicOptions, legendaryOptions
  ];

  return lookupArray;
}

module.exports = {
  shouldThrow,
  setUpCategories
};

