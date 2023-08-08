import {settings, select} from './settings'; // bardzo wazne ./ musi to byc , exportuje 4 obiekty i rzaden z nich nie jest domyslnie exportowany, dlatego uzywam {aby wydobyc te dwa obiekty}
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;
    fetch(url) 
      .then(function (rawResponse) {
        return rawResponse.json(); 
      })
      .then(function (parsedResponse) {
        thisApp.data.products = parsedResponse; 
        console.log('parsedResponse', thisApp.data.products);
        thisApp.initMenu(); 
        console.log('parsedResponse', parsedResponse);
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });

    thisApp.productList = document.querySelector(select.templateOf.cartProduct);
    
    thisApp.productList.addEventListener('init-Amount-Widget', function (event) {
      app.cart.add(event.detail.product);
    });
  }
}
app.init();