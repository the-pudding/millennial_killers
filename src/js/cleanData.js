function cleanData(data) {
  const verbsToKeep = data[0];
  const verbsToKeepList = verbsToKeep.map(item => item.verb);
  const allVerbs = data[1];
  const filteredVerbs = allVerbs.filter(verb =>
    verbsToKeepList.includes(verb.verb)
  );

  let formattedVerbs = filteredVerbs.map(verb => ({
    ...verb,
    nounList: verb.nouns.map(item => item.noun),
    nouns: verb.nouns.map(noun => ({
      ...noun,
      nounLevelVerb: verb.verb,
      verbLength: verb.nouns.length,
    })),
  }));

  formattedVerbs = formattedVerbs.sort(
    (a, b) => parseFloat(b.verb) - parseFloat(a.verb)
  );

  return formattedVerbs;
}

export default {
  cleanData,
};
