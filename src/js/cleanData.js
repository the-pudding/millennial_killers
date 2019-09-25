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

  formattedVerbs.forEach(verb => {
    const result = data[0].filter(function(item) {
      return item.verb === verb.verb;
    });
    verb.sentiment = result[0] !== undefined ? +result[0].sentiment_5 : null;
  });

  formattedVerbs = formattedVerbs.sort(
    (a, b) => parseFloat(b.sentiment) - parseFloat(a.sentiment)
  );

  return formattedVerbs;
}

export default {
  cleanData,
};
