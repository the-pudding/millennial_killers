/* global d3 */

import generateEmoji from './generateEmoji';
import navTour from './setupTour';
import clean from './cleanData';
import setupSentimentNav from './sentimentNav';
import isMobile from './utils/is-mobile';

const enterView = require('enter-view');
const Choices = require('choices.js');

let $content;

let verbJoin;
let nounJoin;
let articlesJoin;

let $verb;
let $noun;
let $articles;
let $separators;

let $progressBar;
let backgroundBarWidthPx;
let barWidthPx;
let barUpdater;

let articleNumber;
let currentArticle = 0;

let $nounSearch;
let $verbSelect;

let formattedVerbs;
let height;
let fixedSearchHeight;

let articleInterval;

let tour;

function setFixedSearchHeight() {
  fixedSearchHeight = d3.select('.fixed-search-bar').node().offsetHeight;
  return fixedSearchHeight;
}

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
      getPreviousSentiment(el);
    },
    progress: (el, progress) => {},
    offset: 0.75,
    once: false,
  });
}

function getPreviousSentiment(lastSentiment) {
  const leavingSentiment = lastSentiment.classList[1].split('__')[1];
  if (leavingSentiment === 'positive-low') {
    d3.selectAll('.button').style('font-size', '18px');
    d3.select('.button-positive-high').style('font-size', '32px');
  } else if (leavingSentiment === 'neutral') {
    d3.selectAll('.button').style('font-size', '18px');
    d3.select('.button-positive-low').style('font-size', '32px');
  } else if (leavingSentiment === 'negative-low') {
    d3.selectAll('.button').style('font-size', '18px');
    d3.select('.button-neutral').style('font-size', '32px');
  } else if (leavingSentiment === 'negative-high') {
    d3.selectAll('.button').style('font-size', '18px');
    d3.select('.button-negative-low').style('font-size', '32px');
  }
}

function updateProgressBar(el, elapsed) {
  const $foregroundBar = d3
    .select(el.parentNode)
    .select('.tooltip')
    .select('.tooltip__progress-bar-foreground');

  $foregroundBar.style('width', d3.format('%')(elapsed / 5000));
}

function updateTooltip(d, el, $tooltip) {
  // show tooltip, load data
  $tooltip.classed('hidden', false);

  if (isMobile.any()) {
    // d3.selectAll('.tip')
    $tooltip.on('mouseenter', () => {
      window.alert(d.articles[0].url);
      window.open(d.articles[0].url);
      d3.event.stopPropagation();
    });
  }

  if (d.articles.length === 1) {
    $tooltip
      .select('.tooltip__progress-bar-background')
      .classed('hidden', true);
  } else {
    $tooltip
      .select('.tooltip__progress-bar-background')
      .classed('hidden', false);
  }

  $tooltip
    .select('p.tooltip__meta')
    .text(
      `${d.articles[currentArticle].url.split('//')[1].split('/')[0]} • ${
        d.articles[currentArticle].pub_date
      } • ${currentArticle + 1}/${articleNumber} articles`
    );

  $tooltip
    .select('p.tooltip__hed')
    .text(`${d.articles[currentArticle].headline}`);

  $tooltip.select('p.tooltip__other-verbs').html(() => {
    const additionalArticles =
      d.other_verbs.length > 1 ?
      `<span class='noun-selected'> ${
            d.noun
          }</span> is also found in these verbs: <span class='additional-verbs'>${d.other_verbs.join(
            ', '
          )}</span>` :
      ``;
    return additionalArticles;
  });

  const x = el.offsetLeft;
  const y = el.offsetTop;
  const toolTipHeight = $tooltip.node().offsetHeight;

  $tooltip.style('left', `${x}px`).style('top', `${y - toolTipHeight - 10}px`);
}

function updateArticle(d, el, $tooltip) {
  if (currentArticle >= articleNumber && articleInterval) {
    clearInterval(articleInterval);
    articleInterval = null;
  } else {
    const t = d3.timer(elapsed => {
      updateProgressBar(el, elapsed);
      if (elapsed > 5000) t.stop();
    }, 10);
    updateTooltip(d, el, $tooltip);
    // updateProgressBar(el);
    currentArticle += 1;
    articleInterval = setTimeout(() => {
      updateArticle(d, el, $tooltip);
    }, 5000);
  }
}

function handleMouseEnter(d) {
  currentArticle = 0;
  const el = this;
  const $sel = d3.select(el);
  const $selVerb = d3.select(el.parentNode);
  const $tooltip = $selVerb.select('.tooltip');

  if (isMobile.any()) {
    $tooltip.on('mousedown', function () {
      d3.event.stopPropagation();
    });
  }

  articleNumber = d.articles.length;

  updateArticle(d, el, $tooltip);
}

function handleMouseLeave() {
  currentArticle = 0;
  articleNumber = 0;

  clearInterval(barUpdater);
  clearInterval(articleInterval);

  d3.selectAll('.tooltip__progress-bar-foreground').style('width', '0px');

  d3.selectAll('.tooltip').classed('hidden', true);

  // $noun.classed('faded',false)
}

function resize() {
  height = window.innerHeight;

  if (isMobile.any()) {} else {
    d3.selectAll('section.intro').style('height', `${height}px`);
  }
}

function handleMouseOver(el, noun) {
  console.log(d3.mouse(el));

  // .attr('')

  // let coordinates= d3.mouse(el);

  // d3.select('.tooltip')
  // .classed('hidden',false)
  // .style("left", (d3.event.pageX) + "px")
  // .style("top", (d3.event.pageY - 28) + "px");
}

function handleInputChange() {
  const $input = d3.select(this);
  const val = this.value.toLowerCase();
  handleMouseLeave();

  if (val == '') {
    $noun.style('font-size', '14px');
    $verb.classed('hidden', false);
    $separators.classed('hidden', false);
    $noun.classed('faded', false);
    handleMouseLeave();
  } else {
    $noun
      .style('font-size', d => {
        if (d.noun.includes(val)) {
          return '48px';
        }
        return '14px';
      })
      .classed('faded', d => {
        if (d.noun.includes(val)) {
          return false;
        }
        return true;
      });

    $separators.classed('hidden', true);

    $verb.classed('hidden', d => {
      handleMouseLeave();
      const nounMatch = d.nounList.filter(item => item.includes(val));
      if (nounMatch.length >= 1) {
        return false;
      }
      return true;
    });
  }

  // const start = $input.attr('data-start');
}

function handleDropDown() {
  const verbEl = d3.select(this);
  const verbValue = verbEl.text();
  const scrollTarget = d3.select(`.verb-container-${verbValue}`).node();
  setupSentimentNav.scrollTo(scrollTarget, fixedSearchHeight);
}

function addArticles(data) {
  $nounSearch = d3.select('.search-noun__input');
  $nounSearch.on('keyup', handleInputChange);

  console.log(data.length);
  $content = d3.select('.content');

  // verbs (top-level)
  verbJoin = $content
    .selectAll('div.verb-container')
    .data(data)
    .enter();

  $verb = verbJoin
    .append('div')
    .attr('class', d => `verb-container verb-container-${d.verb}`);

  $verb
    .append('div')
    .attr('class', 'verb-name')
    .attr('id', d => d.verb)
    .text(d => d.verb);

  // tooltip:
  const $tooltip = $verb.append('div').attr('class', 'tooltip tip hidden');

  // tooltip: progress bar
  $progressBar = $tooltip
    .append('div')
    .attr('class', 'tip tooltip__progress-bar-background');

  $progressBar.append('div').attr('class', 'tooltip__progress-bar-foreground');

  // tooltip: text sections
  $tooltip.append('p').attr('class', 'tip tooltip__meta');

  $tooltip.append('p').attr('class', 'tip tooltip__hed');

  $tooltip.append('p').attr('class', 'tip tooltip__other-verbs');

  // nouns (bottom-level)
  nounJoin = $verb
    .selectAll('span.noun')
    .data(d => d.nouns)
    .enter();

  $noun = nounJoin
    .append('div')
    .attr('class', 'noun')
    .text(function (d) {
      return ` ${d.noun} · `;
    })
    .on('mouseenter', handleMouseEnter)
    .on('mouseleave', handleMouseLeave);

  if (isMobile.any()) {
    $noun.on('click', (d, i, n) => {
      //   const that = n[i];
      //   console.log(that);
      //   document.addEventListener('mousemove', logKey);
      //   function logKey(e) {
      //     console.log(e.clientX, e.clientY);
      //   }
      //   d3.event.stopPropagation();
    });
  } else {
    $noun.on('click', d => window.open(d.articles[0].url));
  }

  const verbDropDown = d3.select('.search-verb__input').node();

  const verbDropDownChoices = new Choices(verbDropDown, {
    choices: formattedVerbs.map(value => ({
      value,
      label: `${value.verb}`,
    })),
  });

  console.log(formattedVerbs);

  d3.select(verbDropDown).on('change', handleDropDown);

  tour = navTour.setupTour();
}

function setHeightsAndScroll(fixedSearchHeight) {
  setupSentimentNav.setSentimentScroll(tour, fixedSearchHeight);
  //   console.log({
  //     separatorHeight,
  //     fixedSearchHeight,
  //   });
}

function init() {
  resize();

  Promise.all([
      d3.csv('assets/data/verbs_to_include.csv'),
      d3.json('assets/data/articles_json_v2_small.json'),
    ])
    .then(data => {
      formattedVerbs = clean.cleanData(data);
      return formattedVerbs;
    })
    .then(cleanedData => addArticles(cleanedData))
    .then(() => setFixedSearchHeight())
    .then(fixedSearchHeight => setHeightsAndScroll(fixedSearchHeight))
    .then(() => enterViewSetup());
}

export default {
  init,
  resize,
};
