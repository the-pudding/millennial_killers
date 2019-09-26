/* global d3 */
import jump from 'jump.js';
import generateEmoji from './generateEmoji';
import navTour from './setupTour';
import clean from './cleanData';
// import setupSentimentNav from './sentimentNav';
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
let width;
let fixedSearchHeight;

let articleInterval;

let tour;
let showTour = true;
const verbScroll = false;

const offsetChange = 0;
let oldVerb;
let newVerb;

let mouseX;
let mouseY;

function simulate(element, eventName) {
  const options = extend(defaultOptions, arguments[2] || {});
  let oEvent;
  let eventType = null;

  for (const name in eventMatchers) {
    if (eventMatchers[name].test(eventName)) {
      eventType = name;
      break;
    }
  }

  if (!eventType)
    throw new SyntaxError(
      'Only HTMLEvents and MouseEvents interfaces are supported'
    );

  if (document.createEvent) {
    oEvent = document.createEvent(eventType);
    if (eventType == 'HTMLEvents') {
      oEvent.initEvent(eventName, options.bubbles, options.cancelable);
    } else {
      oEvent.initMouseEvent(
        eventName,
        options.bubbles,
        options.cancelable,
        document.defaultView,
        options.button,
        options.pointerX,
        options.pointerY,
        options.pointerX,
        options.pointerY,
        options.ctrlKey,
        options.altKey,
        options.shiftKey,
        options.metaKey,
        options.button,
        element
      );
    }
    element.dispatchEvent(oEvent);
  } else {
    options.clientX = options.pointerX;
    options.clientY = options.pointerY;
    const evt = document.createEventObject();
    oEvent = extend(evt, options);
    element.fireEvent(`on${eventName}`, oEvent);
  }
  return element;
}

function extend(destination, source) {
  for (const property in source) destination[property] = source[property];
  return destination;
}

var eventMatchers = {
  HTMLEvents: /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
  MouseEvents: /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/,
};
var defaultOptions = {
  pointerX: 0,
  pointerY: 0,
  button: 0,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  bubbles: true,
  cancelable: true,
};

function scrollTo(element, fixedSearchHeight) {
  console.log('fire');
  jump(element, {
    duration: 100,
    offset: -fixedSearchHeight * 2,
  });
}

function scrollToVerbChange(element, fixedSearchHeight, verbValue) {
  const el = d3.select(`#${verbValue}`).node();
  jump(el, {
    duration: 1000,
    offset: -fixedSearchHeight,
  });

  d3.selectAll('.verb-name').classed('verb-selected', false);
  d3.select(`#${verbValue}`).classed('verb-selected', true);
  d3.select('.choices__item--selectable').text(verbValue);
}

function setFixedSearchHeight() {
  fixedSearchHeight = d3.select('.fixed-search-bar').node().offsetHeight;
  d3.select('div.content').style('padding-top', `${fixedSearchHeight}px`);
  return fixedSearchHeight;
}

function enterViewSetup() {
  enterView({
    selector: '.verb-name',
    enter: el => {
      const bodyClassed = d3
        .select('body')
        .node()
        .classList.value.split(' ');

      const activeTour = bodyClassed.includes('shepherd-active');

      if (activeTour) {
        return;
      }
      if (verbScroll) {
        return;
      }

      const thisVerb = d3.select(el).attr('id');
      d3.selectAll('.verb-name').classed('verb-selected', false);
      d3.select(el).classed('verb-selected', true);
      d3.select('.choices__item--selectable').text(thisVerb);
      d3.select('.search-verb__input')
        .select('option')
        .text(thisVerb);
      //   fixedSearchHeight = d3.select('.fixed-search-bar').node().offsetHeight;
    },
    exit: el => {
      const bodyClassed = d3
        .select('body')
        .node()
        .classList.value.split(' ');

      const activeTour = bodyClassed.includes('shepherd-active');

      if (activeTour) {
        return;
      }
      if (verbScroll) {
        return;
      }
      const thisVerb = d3.select(el).attr('id');
      d3.selectAll('.verb-name').classed('verb-selected', false);
      d3.select(el).classed('verb-selected', true);
      d3.select('.choices__item--selectable').text(thisVerb);
      d3.select('.search-verb__input')
        .select('option')
        .text(thisVerb);
      //   fixedSearchHeight = d3.select('.fixed-search-bar').node().offsetHeight;
    },
    progress: (el, progress) => {},
    offset:
      (height - d3.select('.fixed-search-bar').node().offsetHeight) / height,
    once: false, // trigger just once
  });

  enterView({
    selector: '.main-page__content',
    enter: el => {
      d3.select('.main-page__sidebar').classed('hidden', false);
      d3.select('.fixed-search-bar').classed('invisible', false);

      if (showTour) {
        tour.start();
        showTour = false;
      }
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
    $tooltip.on('mouseenter', () => {});
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
      d.other_verbs.length > 1
        ? `<span class='noun-selected'> ${
            d.noun
          }</span> is also found in these verbs: <span class='additional-verbs'>${d.other_verbs.join(
            ', '
          )}</span>`
        : ``;
    return additionalArticles;
  });

  let x = el.offsetLeft;
  const y = el.offsetTop;
  const toolTipHeight = $tooltip.node().offsetHeight;
  const toolTipWidth = $tooltip.node().offsetWidth;

  if (isMobile.any()) {
    x = (width - toolTipWidth) / 2;

    $tooltip
      .style('left', `${x / 2}px`)
      .style('top', `${y - toolTipHeight - 10}px`);
  } else {
    if (mouseX > 0.7 * width) {
      x -= toolTipWidth;
    }
    $tooltip
      .style('left', `${x}px`)
      .style('top', `${y - toolTipHeight - 10}px`);
  }
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
    $tooltip.on('mousedown', function() {
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
}

function resize() {
  height = window.innerHeight;
  width = window.innerWidth;

  if (isMobile.any()) {
  } else {
    d3.select('section.intro').style('height', `${height}px`);
  }
}

function checkEnter(e) {
  e = e || event;
  const txtArea = /textarea/i.test((e.target || e.srcElement).tagName);
  return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
}

function handleInputChange() {
  const $input = d3.select(this);
  const val = this.value.toLowerCase();
  handleMouseLeave();

  if (val == '') {
    $noun.classed('highlight', false);
    $verb.classed('hidden', false);
    $separators.classed('hidden', false);
    $noun.classed('faded', false);
    handleMouseLeave();
  } else {
    $noun
      //   .style('font-size', d => {
      //     if (d.noun.includes(val)) {
      //       return '48px';
      //     }
      //     return '14px';
      //   })
      .classed('highlight', d => {
        if (d.noun.includes(val)) {
          return true;
        }
        return false;
      })
      .classed('faded', d => {
        if (d.noun.includes(val)) {
          return false;
        }
        return true;
      });

    // $separators.classed('hidden', true);

    $verb.classed('hidden', d => {
      handleMouseLeave();
      const nounMatch = d.nounList.filter(item => item.includes(val));
      if (nounMatch.length >= 1) {
        return false;
      }
      return true;
    });

    const visibleVerbs = d3.selectAll('div.verb-container:not(.hidden)').data();

    if (visibleVerbs.length >= 1) {
      const relevantVerb = visibleVerbs[1].verb;

      const scrollToVerb = d3.select(`.verb-container-${relevantVerb}`).node();
      scrollTo(scrollToVerb, fixedSearchHeight);
    } else {
      //   console.log('none');
    }

    // scrollTo(d3.select('.content').node(), fixedSearchHeight);
  }

  // const start = $input.attr('data-start');
}

function handleDropDown() {
  const verbEl = d3.select(this);
  const verbValue = verbEl.text();

  newVerb = verbValue;
  //   oldVerb = verbValue;

  let newIndex = verbJoin.data().findIndex(s => s.verb === newVerb.trim());
  const oldIndex = verbJoin.data().findIndex(s => s.verb === oldVerb.trim());

  console.log(`new verb ${newVerb}`);
  console.log(`old verb ${oldVerb}`);
  console.log(`new index: ${newIndex}`);
  console.log(`old index: ${oldIndex}`);

  if (newIndex > oldIndex) {
    newIndex += 1;
  } else {
  }
  const updatedVerb = verbJoin.data()[newIndex].verb;
  //   console.log(updatedVerb);

  const scrollTarget = d3.select(`.verb-container-${verbValue}`).node();

  const order = Promise.resolve();

  order
    .then(() => {
      scrollToVerbChange(scrollTarget, fixedSearchHeight, verbValue);
    })
    .then(() => {
      setTimeout(function() {
        simulate(scrollTarget, 'click');
      }, 1001);

      //   d3.select('.search-verb__input')
      //     .select('option')
      //     .text(verbValue);

      //   const e = document.createEvent('UIEvents');
      //   e.initUIEvent('click', true, true, window, 1);
      //   console.log(d3.select(`.verb-container-${verbValue}`));

      //   d3.select(`.verb-container-${verbValue}`)
      //     .node()
      //     .dispatchEvent(e);
    });
}

function addArticles(data) {
  $nounSearch = d3.select('.search-noun__input');

  $nounSearch.on('keyup', handleInputChange);

  $separators = d3.selectAll('.separator');

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
    .attr('class', d => `noun noun-${d.noun.replace(/ /g, '_')}`)
    .text((d, i) => {
      const space = '&nbsp;';
      const nounLabel = d.verbLength - 1 === i ? `${d.noun}` : ` ${d.noun} · `;
      return nounLabel;
    })
    .on('mouseenter', handleMouseEnter)
    .on('mouseleave', handleMouseLeave);

  if (isMobile.any()) {
    $noun.on('click', (d, i, n) => {});
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

  d3.select('.search-verb').on('click', el => {
    oldVerb = d3
      .select('.choices__list--single')
      .select('.choices__item--selectable')
      .text();
  });

  d3.select(verbDropDown).on('change', handleDropDown);

  document.addEventListener('mousemove', logKey);
  document.querySelector('.search-noun__input').onkeypress = checkEnter;

  function logKey(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  tour = navTour.setupTour();

  //   tour.start();

  d3.select('.enter-arrow__container').on('click', () => {
    // tour = navTour.setupTour();
    scrollTo(d3.select('.verb-container-abandon').node(), fixedSearchHeight);
    // tour.start();
  });

  d3.select('.info').on('click', () => {
    // scrollTo(d3.select('.verb-container-kill').node(), fixedSearchHeight);
    tour = navTour.setupTour();
    tour.start();
  });

  fixedSearchHeight = d3.select('.fixed-search-bar').node().offsetHeight;
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
    // .then(searchBarHeight => {
    //   $verb.style('margin-top', (d, i) => {
    //     if (i === 0) {
    //       return `${searchBarHeight}px`;
    //     }
    //   });
    // })
    .then(() => {})
    .then(() => enterViewSetup());
}

export default {
  init,
  resize,
};
