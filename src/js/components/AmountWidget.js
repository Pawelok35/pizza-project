import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

/* rozszerzenie klasy BaseWidget */
class AmountWidget extends BaseWidget {
  constructor(element) {
    /* super -> przy dziedziczeniu klas  pierwsza zasada jest wywolanie constructor klasy nadrzednej */
    /* constructor super potrzebuje 2ch argumentow ze wzgledu ze BaseWidget ma je 2 */
    /* 1wszy wrapperElement - element */
    /* 2gi to poczatkowa wartosc widgetu - thisWidget.value =  settings.amountWidget.defaultValue */

    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.initActions();

    thisWidget.setValue(thisWidget.dom.input.value);
  }
  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    console.log(thisWidget.dom.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function (element) {
      element.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (element) {
      element.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;
