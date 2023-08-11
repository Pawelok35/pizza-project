import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();
    /* create element using utils.createElementFromHTML */
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);

    const bookingContainer = document.querySelector(select.containerOf.booking);
    /* add element to menu */
    bookingContainer.appendChild(thisBooking.element).innerHTML;
    
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.peopleAmount = element.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = element.querySelector(
      select.booking.hoursAmount
    );
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountElem = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmountElem = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
        thisBooking.updateDOM();
      });
  
      thisBooking.dom.sendButton.addEventListener('submit', function () {
     
     
      });
  
      thisBooking.element.addEventListener('click', function () {});
  }
}
export default Booking;
