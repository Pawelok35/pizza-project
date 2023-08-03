/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: '.cart__total-number',
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },

    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    // Wlasciwosc o nazwie/key menuProduct i wartosci/value -> zawiera skompilowany szablon Handlebars
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML // argument przekazuje tresc HTML znajdujacy sie w elemencie o selektorze select.templateOf.menuProduct).innerHTML
    ), //document.querySelector(select.templateOf.menuProduct).innerHTML -> pobiera zawartosc HTML szablonu, ktory jest juz obecny na stronie
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.name = data.name;
      thisProduct.amount = 1;
      thisProduct.priceSingle = data.price;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu() {
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );

      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );

      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );

      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );

      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );

      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );

      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
    }

    initAccordion() {
      const thisProduct = this;

      const clickableTrigger = thisProduct.element.querySelector(
        // Wyszukuje element, (ktory bedzie reagowal na klikniecie) na podstawie selectora . . clickable, w obrębie elementu "element"
        select.menuProduct.clickable
      );

      clickableTrigger.addEventListener('click', function (event) {
        // na wyszukanym  elemencie "clickableTrigger" dodaje nasluch  jako CLICK i zapisuje w parametrze funckji 'event'
        event.preventDefault(); // zapobiega domyslnej akcji (scroll to top) dla zdarzenia co jest stotne aby uniknac przewijania strony do gory, gdy klikne na 'clickable', chce reagowac tylko na klikniecie bez przenoszenia na gore strony.

        const activeProduct = document.querySelector('.product.active'); // Znajduje element product.active na stronie HTML, ktory jest juz aktywny (czyli ktory ma klase "active"). Ta zmienna przechowuje referencje do tego produktu.

        if (activeProduct && activeProduct !== thisProduct.element) {
          // Sprawdza, czy istnieje aktywny produkt i czy aktywny produkt nie jest aktualnym produktem (!= rozny od -> thisProduct.element).
          activeProduct.classList.remove('active'); // Jesli tak, usuwa klase "active" z aktywnego produktu, aby go schowac i zachowac funkcjonalnosc akordeonu.
        }

        thisProduct.element.classList.toggle('active'); // sprowadza czy element 'this.Product.element' (czyli biezacy produkt) ma klase 'active'
      }); // Jesli element ma juz klase 'active' (czyli element-produkt jest juz rozwiniety) to 'classList.toggle()' usunie te klase z elementu co spowoduje ze szczeguly produktu zostana zwiniete.
    }
    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);

      let price = thisProduct.data.price;

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        for (let optionId in param.options) {
          const option = param.options[optionId];

          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            if (!option.default) {
              price += option.price;
            }
          } else {
            if (option.default == true) {
              price -= option.price;
            }
          }
          thisProduct.priceSingle = price;

          const optionImage = thisProduct.imageWrapper.querySelector(
            `.${paramId}-${optionId}`
          );
          if (optionImage) {
            if (optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;
      const productSummary = thisProduct.prepareCartProduct();
      app.cart.add(productSummary);
    }

    prepareCartProduct() {
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.defaultValue;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }
    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        params[paramId] = {
          label: param.label,
          options: {},
        };

        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }

      return params;
    }
  }

  class AmountWidget {
    constructor(element) {
      // konstruktor otrzymuje jeden element, ktory reprezentuje element DOM (z initAmountWidget)
      const thisWidget = this;

      //console.log('AmountWidget: ', thisWidget); // Wyswietla informacje o biezacej instancji klasy AmountWidget w konsoli przegladarki.
      //console.log('constructor arguments: ', element); // Wyswietla argumenty przekazane do konstruktora w konsoli przegladarki.

      thisWidget.getElements(element); // Wywoluje metode getElements(element) na biezacej instancji klasy AmountWidget, ktora ma na celu znalezienie i zapisanie referencji do roznych elementow widgetu.
      thisWidget.setValue(settings.amountWidget.defaultValue); // Wywoluje metode setValue na biezacej instancji klasy AmountWidget, ktora ma ustawic poczatkowa wartosc widgetu na wartosc domyslna z obiektu settings
      thisWidget.initAction(thisWidget.input.element); // Wywoluje metode initAction na biezacej instancji klasy AmountWidget, ktora unicjuje akcje widgetu
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      if (thisWidget.value !== newValue && !isNaN(newValue)) {
        if (
          newValue >= settings.amountWidget.defaultMin &&
          newValue <= settings.amountWidget.defaultMax
        ) {
          thisWidget.value = newValue;
        }
      }

      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initAction() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(this.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', { bubble: true });
      thisWidget.element.dispatchEvent(event);
    }
  }

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
      thisCartProduct.dom.price = element.querySelector(
        select.cartProduct.price
      );
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
        app.cart.update();
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
  const app = {
    initMenu: function () {
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        // w pętli iteruje przez wszystkie produkty znajdujace sie w thisApp.data.products. Dla kazdego produktu wykonuje sie następujące czynności:
        new Product(
          thisApp.data.products[productData].id,
          thisApp.data.products[productData]
        ); // Tworzy nowa instancje klasy Product za pomocą new Product(). Przy tworzeniu instancji przekazuje sie dwa argumenty: productData (klucz) oraz thisApp.data.products[productData] (wartosc). productData to identyfikator produktu, a thisApp.data.products[productData] to obiekt z danymi tego produktu. Klasa Product sluzy do reprezentacji i interakcji z pojedynczym produktem na stronie.
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
    },
  };

  app.init();
}
