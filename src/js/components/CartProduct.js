import { select, } from './settings.js';
import AmountWidget from './AmountWidget.js';
class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    this.amount = 1;
    this.price = this.priceSingle;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }
  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = element.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(
      select.cartProduct.remove
    );
  }
  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );

    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price =
        thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      //app.cart.update();
      const event = new CustomEvent('init-Amount-Widget', {
        bubbles: true,
        detail: {
          product: thisCartProduct,
        },
      });
      thisCartProduct.element.dispatchEvent(event);
    });
  }



  updatePrice() {
    const thisCartProduct = this;

    thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
  }
  remove() {
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
  }

  getData() {
    const data = {
      id: this.id,
      amount: this.amount,
      price: this.price,
      priceSingle: this.priceSingle,
      name: this.name,
    };

    return data;
  }
}

export default CartProduct;
