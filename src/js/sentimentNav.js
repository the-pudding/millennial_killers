import jump from 'jump.js';

function scrollTo(element, fixedSearchHeight) {
  jump(element, {
    duration: 1000,
    offset: -fixedSearchHeight,
  });
}

function setSentimentScroll(tour, fixedSearchHeight) {
  console.log(fixedSearchHeight);
  const parentDiv = d3.select('div.content').node();

  const posHighFirstEl = d3.select('.verb-container-love').node();
  const sepPositiveHigh = document.createElement('div');
  sepPositiveHigh.className = 'separator separator__positive-high';
  sepPositiveHigh.innerHTML = '😁 highly positive sentiments';

  const posLowFirstEl = d3.select('.verb-container-favor').node();
  const sepPositiveLow = document.createElement('div');
  sepPositiveLow.className = 'separator separator__positive-low';
  sepPositiveLow.innerHTML = '🙂 positive sentiments';

  const neutralFirstEl = d3.select('.verb-container-say').node();
  const sepNeutral = document.createElement('div');
  sepNeutral.className = 'separator separator__neutral';
  sepNeutral.innerHTML = '😐 neutral sentiments';

  const negLowFirstEl = d3.select('.verb-container-leave').node();
  const sepNegativeLow = document.createElement('div');
  sepNegativeLow.className = 'separator separator__negative-low';
  sepNegativeLow.innerHTML = '🙁 negative sentiments';

  const negHighFirstEl = d3.select('.verb-container-hate').node();
  const sepNegativeHigh = document.createElement('div');
  sepNegativeHigh.className = 'separator separator__negative-high';
  sepNegativeHigh.innerHTML = '😱 highly negative sentiments';

  parentDiv.insertBefore(sepPositiveHigh, posHighFirstEl);
  parentDiv.insertBefore(sepPositiveLow, posLowFirstEl);
  parentDiv.insertBefore(sepNeutral, neutralFirstEl);
  parentDiv.insertBefore(sepNegativeLow, negLowFirstEl);
  parentDiv.insertBefore(sepNegativeHigh, negHighFirstEl);

  // const verbEl = d3.select(this);
  // const verbValue = verbEl.text();
  // const scrollTarget = d3.select(`.verb-container-${verbValue}`).node()

  d3.select('.button-positive-high').on('click', () => {
    tour.complete();
    scrollTo(d3.select('.separator__positive-high').node(), fixedSearchHeight);
  });

  d3.select('.button-positive-low').on('click', () => {
    tour.complete();
    scrollTo(d3.select('.separator__positive-low').node(), fixedSearchHeight);
  });

  d3.select('.button-negative-low').on('click', () => {
    tour.complete();
    scrollTo(d3.select('.separator__negative-low').node(), fixedSearchHeight);
  });

  d3.select('.button-negative-high').on('click', () => {
    tour.complete();
    scrollTo(d3.select('.separator__negative-high').node(), fixedSearchHeight);
  });

  d3.select('.button-neutral').on('click', () => {
    tour.complete();
    scrollTo(d3.select('.separator__neutral').node(), fixedSearchHeight);
  });
}

export default {
  setSentimentScroll,
  scrollTo,
};
