import { select, classNames, templates, settings, } from './settings.js';
import utils from './utils.js';
import CartProduct from './CartProduct.js';


class Cart {
    constructor(element) {
      const thisCart = this;
      this.deliveryFee = settings.cart.defaultDeliveryFee;
      this.totalNumber = 0;
      this.subtotalPrice = 0;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();

      this.update();
      thisCart.update();
    }
    update() {
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (const product of thisCart.products) {
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      if (thisCart.totalNumber > 0) {
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      } else {
        thisCart.totalPrice = 0;
      }

      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

      console.log(thisCart.totalNumber);
      console.log(thisCart.subtotalPrice);
      console.log(thisCart.totalPrice);
      console.log(thisCart.deliveryFee);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
        select.cart.productList
      );
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
        select.cart.toggleTrigger
      );
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
        select.cart.deliveryFee
      );
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
        select.cart.subtotalPrice
      );
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(
        select.cart.totalPrice
      );
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
        select.cart.totalNumber
      );
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function (event) {
        const cartProduct = event.detail.cartProduct;
        thisCart.remove(cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      });

      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault(); // Blokujemy domyślne zachowanie formularza (przeładowanie strony)

        thisCart.sendOrder();
      });
    }

    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      const payload = {
        address: thisCart.dom.form.querySelector(select.cart.address).value,
        phone: thisCart.dom.form.querySelector(select.cart.phone).value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };
      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      for (const cartProduct of thisCart.products) {
        const productData = cartProduct.getData(); // Pobierz dane produktu z koszyka
        payload.products.push(productData); // Dodaj dane produktu do listy produktów w zamówieniu
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Wyślij dane zamówienia jako JSON
      };
      console.log('Payload:', payload);

      // Wysłanie zamówienia na serwer za pomocą zapytania POST
      fetch(url, options)
        .then(function (response) {
          return response.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });
    }

    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }
    remove(CartProduct) {
      const thisCart = this;

      // 1. Usunięcie reprezentacji produktu z HTML-a
      CartProduct.dom.wrapper.remove();

      // 2. Usunięcie informacji o danym produkcie z tablicy thisCart.products
      const productIndex = thisCart.products.indexOf(CartProduct);
      if (productIndex !== -1) {
        thisCart.products.splice(productIndex, 1);
      }

      // 3. Wywołanie metody update w celu przeliczenia sum po usunięciu produktu
      thisCart.update();
    }
  }

  export default Cart;