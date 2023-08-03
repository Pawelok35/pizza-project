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
    }, // CODE CHANGED
    // CODE ADDED START
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
      const thisProduct = this; // odniesienie do bierzacej instancji klasy

      //Przypisanie argumentow konstruktora do wlasciwosci obiektu this.Product
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.name = data.name;
      thisProduct.amount = 1; // Ustawienie początkowej ilości produktu na 1
      thisProduct.priceSingle = data.price; // Przechowanie ceny jednostkowej produktu

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu() {
      const thisProduct = this;

      //a. Znajduje wybrany kod HTML
      const generatedHTML = templates.menuProduct(thisProduct.data); // Uzycie wlasciwosci('menuProduct') obiektu 'templates' w ktorej argumentem jest 'thisProduct.data'-> Przy wywolaniu 'templates.menuProduct' przekazuje dane z obiektu 'thisProduct.data' jako ARGUMENT |
      //kompilacja szablonu Handlebars 'menuProduct' podajac mu dane z obiektu 'thisProduct.data'w wyniku otrzymuje WYGENEROWANY KOD HTML dla danego produktu ktory jest PRZECHOWYWANY W ZMIENNEJ 'generatedHTML'

      //b.  Kod HTML z punktu wyzej konwerteruje na element DOM czyli obiekt JS
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); // tworze wlasciwosc 'element' dla bierzacej instancji klasy za pomoca funkcji utilis w ktorej argumentem jest 'generatedHTML' | wygenerowany kod HTML jest zamieniany przez funkcje utilis... na element DOM czyli obiekt JS i jest przechowywany we wlasciwosci obiektu thisProduct - thisProduct.element

      //c. szukam w document kontenera menu
      const menuContainer = document.querySelector(select.containerOf.menu); // uzywajac metody document... znajduje element na stronie HTML ktory jest okreslony przez selector: select.containerOf.menu.
      //selector ten odnosi sie do kontenera menu w ktorym chce wyswietlic produkty. selector zapisany w stalej select.

      //d. dodaje na koniec kontenera menu (ktory znalazlem wyzej) (jako dziecko/child) z konwertowany kod HTML na element DOM (z punktu wyzej)
      menuContainer.appendChild(thisProduct.element); //wywoluje metode appendChild na elemencie menuContainer, dodaje wygenerowany element produktu(thisProduct.element) na koncu do kontenera 'menuContainer'
      //kod znajduje odpowiedni kontener menu na stronie, a nastepnie dodaje do niego wygenerowany element produktu, ktory zostal wczesniej utworzony i przechowywany w thisProduct.element. Dzieki temu produkt jest wyswietlany w menu i jest gotowy do interakcji z uzytkownikiem.
    }

    getElements() {
      const thisProduct = this; // umozliwia to odwolanie sie do biezacej instancji uzywajac krotszej nazwy 'thisProduct'

      //a. tworzenie wlasciowsci INSTANCJI klasy Product - argumenty przekazywane do konstruktora podczas tworzenia instancji
      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        //accordionTrigger - wlasciwosc obiektu 'thisProduct' i = przypisana do niej wartosc ktora jest wyszukiwana za pomoca querySelector w obrebie thisProduct.element
        select.menuProduct.clickable // selektor ktory odnosi sie do odpowiedniego elementu (np. przycisk lub naglowek produktu), ktory pozwala na rozwijanie i zwijanie informacji na temat produktu.
      );

      //b. wewnatrz thisProduct.element wyszukuje za pomoca selektora...
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form // selektor wyszukujacy i wskazuje na element HTML np formularza produktu
      );

      //c. wskazanie wszystkich inputow i selectow w formularzu (thisProduct.form)
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );

      //d. wyszukanie w thisProduct.element selectora odpowiedzialnego za button
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton // wskazuje na przycisk koszyka
      );

      //e. tworze wlasciwosc w ktorej przechowuje element DOM znaleziony w obrebie thisProduct.element
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem // wyswietla cene produktuna stronie
      );

      //f. tworze wlasciwosc w ktorej przechowuje element DOM znaleziony w obrebie thisProduct.element
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper // reprezentuje kontener do obrazow produktu
      );

      //g. tworze wlasciwosc w ktorej przechowuje element DOM znaleziony w obrebie thisProduct.element
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget // reprezentuje widget ilosci produktu
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
        // Dodanie nasluchu na zdarzenie submit na elemencie this.Product (formularz)
        // Gdy uzytkownik nacisnie button submit funkcja obslugi zdarzenia zostaje wywolana
        event.preventDefault(); // funkcja zapobiega domyslnej akcji (przeslanie danych do serwera) bo chce aby dane z formularza byly przetwarzane wewnatrz aplikacji i odpowiednio aktualizowaly koszyk lub zamowienie.
        thisProduct.processOrder(); // wywolanie metody ktora jest odpowiedzialna za przetworzenie
      });

      for (let input of thisProduct.formInputs) {
        //petla iteruje po wszystkich elementach formularza danego productu .formInputs to inputy uzytkownika oraz checkbox i radio
        input.addEventListener('change', function () {
          // ustawienie nasluchu na zdarzenie change na elemencie input -> kiedy uzytkownik zmieni wartosc wybranego inputu zostanie wywolana funkcja ktora ...
          thisProduct.processOrder(); // wywoluje metode processOrder co powoduje ponowne przeliczenie zamowienia
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        // ustawienie nasluchu na zdarzenie click na elemencie thisProduct.cartButton i zapisanie zdarzenia w event
        event.preventDefault(); // domyslna akcja to wyslanie dancyh formularza lub przeniesienie do innej strony . Klikniecie obsluguje za pomoca JS a nie chce przekierowania na inna strone .
        thisProduct.processOrder(); // Po zatrzymaniu domnyslnej akcji nastepuje wywolanie metody processOrder()
        thisProduct.addToCart();
      });
    }

    //6.  WYWOLANIE METODY ktora przetwarza zamowienie produktu, czyli oblicza cene, wybrane opcje itp.
    processOrder() {
      const thisProduct = this;
      //console.log(thisProduct);

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          // check if there is param with a name of paramId in formData and if it includes optionId

          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            //obliczanie ceny jednostkowej i aktualizacje jej w thisProduct
            // check if the option is not default
            if (!option.default) {
              price += option.price;
              // add option price to price variable
            }
          } else {
            // check if the option is default
            if (option.default == true) {
              price -= option.price;
              // reduce price variable
            }
          }
          thisProduct.priceSingle = price;

          const optionImage = thisProduct.imageWrapper.querySelector(
            `.${paramId}-${optionId}` // searching image elements by class - class = paramId-optionId "toppings-olives"
          );
          if (optionImage) {
            //if optionImagine was found,
            if (optionSelected) {
              // check if option was chosen
              // if YES add class to optionImage
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              // if NO remove class from optionImage
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      // update calculated price in the HTML
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }

    //7.  Metoda ktora INICJALIZUJE widget do wybierania ilosci produktu. Widget ten moze umozliwiac uzytkownikowi wybieranie liczby sztuk produktu, jakie chce zamowic.
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem); // tworze NOWA INSTANCJE KLASY  AmountWidget i argumentem konstruktora (klasy) jest element thisProduct.amountWidgetElem (z metody getElements reprezentuje widget do wyboru ilosci dla tego konkretnego produktu.)

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        // Na obiekcie thisProduct o wlasciwosci amountWidgetElem ustawiam nasluch na zdarzenie update. Jezeli uzytkownik zmieni ilosc produktu to zadziala update i...
        thisProduct.processOrder(); // ... i wywola metode processOrder() ktora jest odpwiedzialna za przetwarzanie zamowienia np oblicza cene.
      });
    }

    //8.
    addToCart() {
      const thisProduct = this;
      const productSummary = thisProduct.prepareCartProduct();
      app.cart.add(productSummary); // Przekazujemy podsumowanie produktu do metody cart.add
    }

    //9.
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

    //10. podsumowanie wszystkich wybranych opcji
    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); // Pobieram dane z formularza produktu i przeksztalcam n a obiekt JS (za pomoca funkcji)
      const params = {}; // obiekt ktory zawiera podsumowanie wybranych opcji dla produktu.

      for (let paramId in thisProduct.data.params) {
        // Petla iterujaca przez wszystkie kategorie(parametry) produktu.
        const param = thisProduct.data.params[paramId];

        params[paramId] = {
          // Tworze kategorie parametru w obiekcie params
          label: param.label,
          options: {},
        };

        for (let optionId in param.options) {
          //dla kazdej opcji w tej kategorii
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            //opcja jest wybrana i dodaje ja do obiektuz podsumowaniem
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
      const thisWidget = this; // zmienna lokalna ktora odnosi sie do biezacej instacji klasy AmountWidget

      const newValue = parseInt(value); // do zmiennej newValue przypisuje konwersje przekazana wartosc value na liczbe całkowita za pomoca funkcji parseInt(). Wartosc ta będzie reprezentowac nowa wartosc liczby, ktora chce ustawic dla widgetu liczby.

      if (thisWidget.value !== newValue && !isNaN(newValue)) {
        // Warunek sprawdza, czy nowa wartosc newValue rozni się od biezacej wartosci widgetu thisWidget.value, oraz czy newValue jest liczba (czy nie jest NaN - "Not a Number").
        // NaN not a number

        if (
          newValue >= settings.amountWidget.defaultMin && // Sprawdzam czy newValue miesci sie w zakresie zdefiniowanym w settings.amountWidget.defaultMin
          newValue <= settings.amountWidget.defaultMax
        ) {
          thisWidget.value = newValue; // jesli tak to przypisuje newValue do wlasciwosci yhisWidget.value/ w ten sposob zapobiegam ustawieniu wartosci poza okreslonym zakresem.
        }
      }

      thisWidget.input.value = thisWidget.value; // Ustawiam wartosc pola input wewnatrz widgetu liczby na thisWidget.value. Dzieki temu, po zmianie wartosci, pole input zostanie zaktualizowane, aby odzwierciedlac biezaca wartosc widgetu.
      thisWidget.announce(); //  Wywołuje metode announce() klasy AmountWidget, ktora ma za zadanie poinformować innych, ze wartosc widgetu zostala zmieniona.
    }

    initAction() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        // Na wyszukanym elemencie thisWidget.input dodaje nasluch na zdarzenie 'change' Kiedy nastapi zdarzenie to wywolywana jest funkcja anonimowa ktora wywola metode setValue(this.value). Oznacza to, ze nowa wartosc wpisana przez uzytkownika zostanie ustawiona jako nowa wartosc widgetu liczby.
        thisWidget.setValue(this.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        // Wartosc widgetu liczby zostanie zmniejszony o -1
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        // Wartosc widgetu liczby zostanie zwiekszony o +1
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
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(
        select.cart.form
      );
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
    }
    for(let prod of thisCart.products) {
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
    .then(function(response){
      return response.json();
    }) .then(function(parsedResponse){
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
      // Zapisujemy referencję do obiektu this
      const thisCartProduct = this;
      this.amount = 1; // Domyślna ilość sztuk produktu
      this.price = this.priceSingle;
     

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;

      // Wywołujemy metodę getElements, przekazując jej argument element
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      // Wyświetlamy thisCartProduct w konsoli
      //console.log(thisCartProduct);
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
      ); // Tworzymy instancję klasy AmountWidget przekazując odpowiedni element HTML

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value; // Aktualizujemy właściwość amount na podstawie wartości widgetu liczby sztuk
        thisCartProduct.price =
          thisCartProduct.priceSingle * thisCartProduct.amount; // Aktualizujemy cenę na podstawie ceny pojedynczej sztuki i ilości sztuk
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price; // Aktualizujemy cenę na stronie, w odpowiednim elemencie HTML
        app.cart.update(); // Aktualizujemy cały koszyk, żeby uwzględnić zmiany w cenie tego produktu
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

      // Listener dla guzika 'remove'
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
      });

      // Listener dla guzika 'edit'
      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
        // Tu możesz dodać odpowiednią funkcjonalność dla guzika 'edit'
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
    // 20. Metoda odpowiedzialna za inicjacje menu aplikacji a konkretnie tworzenie produktow na podstawie danych znajdujacych sie w thisApp.data.products.
    initMenu: function () {
      const thisApp = this; // Tworze lokalna zmienna thisApp, ktora przechowuje referencje do obiektu app
      //console.log('thisApp.data:', thisApp.data);
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
          thisApp.data.products = parsedResponse; // zmiana na obiekt products z właściwością "id"
          console.log('parsedResponse', thisApp.data.products);
          thisApp.initMenu(); // Wywołujemy init
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
