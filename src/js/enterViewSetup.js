const enterView = require('enter-view');

function enterViewSetup() {
  enterView({
    selector: '.verb-container',
    enter: el => {
      // el.classList.add('entered');

      const thisVerb = d3
        .select(el)
        .select('div.verb-name')
        .attr('id');

      d3.selectAll('.verb-name').classed('verb-selected', false);

      d3.select(el)
        .select('.verb-name')
        .classed('verb-selected', true);

      d3.select('.choices__item--selectable').text(thisVerb);

      fixedSearchHeight = d3.select('.fixed-search-bar').node().offsetHeight;
    },
    exit: el => {
      const thisVerb = d3
        .select(el)
        .select('div.verb-name')
        .attr('id');

      d3.selectAll('.verb-name').classed('verb-selected', false);

      d3.select(el)
        .select('.verb-name')
        .classed('verb-selected', true);

      d3.select('.choices__item--selectable').text(thisVerb);

      fixedSearchHeight = d3.select('.fixed-search-bar').node().offsetHeight;
    },
    progress: (el, progress) => {
      // el.style.opacity = progress;
    },
    offset: 0.75, // enter at middle of viewport
    once: false, // trigger just once
  });

  enterView({
    selector: '.main-page__content',
    enter: el => {
      d3.select('.main-page__sidebar').classed('hidden', false);
      d3.select('.fixed-search-bar').classed('invisible', false);

      tour.start();
    },
    exit: el => {
      //   el.classList.remove('entered');
      d3.select('.main-page__sidebar').classed('hidden', true);
      d3.select('.fixed-search-bar').classed('invisible', true);
      tour.complete();
    },
    progress: (el, progress) => {
      // el.style.opacity = progress;
    },
    offset: 0.999, // enter at middle of viewport
    once: false, // trigger just once
  });

  enterView({
    selector: '.separator',
    enter: el => {
      const currentSentiment = el.classList[1].split('__')[1];
      d3.selectAll('.button').style('font-size', '18px');
      d3.select(`.button-${currentSentiment}`).style('font-size', '32px');
    },
    exit: el => {
      // const currentSentiment = el.classList[1].split('__')[1];
      // d3.selectAll('.button').style('font-size', '18px');
      // d3.select(`.button-${currentSentiment}`).style('font-size', '32px');

      getPreviousSentiment(el);
    },
    progress: (el, progress) => {},
    offset: 0.75,
    once: false,
  });
}

export default {
  enterViewSetup,
};
