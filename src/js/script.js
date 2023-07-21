/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');
// 
  const select = {  // obiekt o nazwie select w ktorym jest kolejny obiekt(wlasciwosc select) ktory ma 2 wlasciwosci
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
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
    // CODE ADDED END
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

// Obiekt settings zawiera wlasciwosc 'amountWidget', ktora jest kolejnym obiektem posiadajacym trzy klucze o wartosciach odpowiednie 1, 1, 9  
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
    // CODE ADDED END
  };

  const templates = {
// Wlasciwosc o nazwie/key menuProduct i wartosci/value -> zawiera skompilowany szablon Handlebars
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML  // argument przekazuje tresc HTML znajdujacy sie w elemencie o selektorze select.templateOf.menuProduct).innerHTML
    ),                              //document.querySelector(select.templateOf.menuProduct).innerHTML -> pobiera zawartosc HTML szablonu, ktory jest juz obecny na stronie
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };

  class Product {
// Konstruktor klasy     
    constructor(id, data) {
      const thisProduct = this;  // odniesienie do bierzacej instancji klasy

//Przypisanie argumentów konstruktora do własciwosci obiektu this.Product
      thisProduct.id = id;
      thisProduct.data = data;

// Wywolanie roznych  metod inicjalizujacych funkcjonalnosc produktu
      thisProduct.renderInMenu();  // utworzenie thisProduct.element
      thisProduct.getElements();  // utworzenie akordeonu, dostep do: formularza, wskazanie wszystkich inputow i selectow,  do ceny produktu, do kontener do obrazow produktu, do widget ilosci produktu
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      // console.log('new Product:', thisProduct);
    }

// Metoda ktora renderuje produkt w menu aplikacji lub na stronie
    renderInMenu() {
      const thisProduct = this;

//Znajsuje wybrany kod HTML      
      const generatedHTML = templates.menuProduct(thisProduct.data);  // Uzycie wlasciwosci('menuProduct') obiektu 'templates' w ktorej argumentem jest 'thisProduct.data'-> Przy wywolaniu 'templates.menuProduct' przekazuje dane z obiektu 'thisProduct.data' jako ARGUMENT | 
      //kompilacja szablonu Handlebars 'menuProduct' podajac mu dane z obiektu 'thisProduct.data'w wyniku otrzymuje WYGENEROWANY KOD HTML dla danego produktu ktory jest PRZECHOWYWANY W ZMIENNEJ 'generatedHTML'
      
// Kod HTML z punktu wyzej konwerteruje na element DOM czyli obiekt JS      
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); // tworze wlasciwosc 'element' dla bierzacej instancji klasy za pomoca funkcji utilis w ktorej argumentem jest 'generatedHTML' | wygenerowany kod HTML jest zamieniany przez funkcje utilis... na element DOM czyli obiekt JS i jest przechowywany we wlasciwosci obiektu thisProduct - thisProduct.element

// szukam w document kontenera menu      
      const menuContainer = document.querySelector(select.containerOf.menu);  // uzywajac metody document... znajduje element na stronie HTML ktory jest okreslony przez selector: select.containerOf.menu.
      //selector ten odnosi sie do kontenera menu w ktorym chce wyswietlic produkty. selector zapisany w stalej select.

// dodaje na koniec kontenera menu (ktory znalazlem wyzej) (jako dziecko/child) z konwertowany kod HTML na element DOM (z punktu wyzej)      
      menuContainer.appendChild(thisProduct.element); //wywoluje metode appendChild na elemencie menuContainer, dodaje wygenerowany element produktu(thisProduct.element) na koncu do kontenera 'menuContainer'
      //kod znajduje odpowiedni kontener menu na stronie, a nastepnie dodaje do niego wygenerowany element produktu, ktory zostal wczesniej utworzony i przechowywany w thisProduct.element. Dzieki temu produkt jest wyswietlany w menu i jest gotowy do interakcji z uzytkownikiem.
    }

// Metoda ktora pobiera i zapisuje referencje do roznych elementow HTML reprezentujacych produkt (np przyciski, pola fromularza)
// Metoda ma na celu zlokalzowanie i przypisanie do wlasciwego obiektu 'thisProduct' roznych elementow DOM ktore sa zwiazane z konkretnym produktem na stronie.   
    getElements() {
      const thisProduct = this;  // umozliwia to odwolanie sie do biezacej instancji uzywajac krotszej nazwy 'thisProduct'

    
    // tworzenie wlasciowsci INSTANCJI klasy Product - argumenty przekazywane do konstruktora podczas tworzenia instancji
      thisProduct.accordionTrigger = thisProduct.element.querySelector( //accordionTrigger - wlasciwosc obiektu 'thisProduct' i = przypisana do niej wartosc ktora jest wyszukiwana za pomoca querySelector w obrebie thisProduct.element
        select.menuProduct.clickable   // selektor ktory odnosi sie do odpowiedniego elementu (np. przycisk lub naglowek produktu), ktory pozwala na rozwijanie i zwijanie informacji na temat produktu.  
      );
      thisProduct.form = thisProduct.element.querySelector(  //wewnatrz thisProduct.element wyszukuje za pomoca selektora...
        select.menuProduct.form // selektor wyszukujacy i wskazuje na element HTML np formularza produktu
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(  //wskazanie wszystkich inputow i selectow w formularzu (thisProduct.form)
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(  // wyszukanie w thisProduct.element selectora odpowiedzialnego za button
        select.menuProduct.cartButton  // wskazuje na przycisk koszyka
      );

      thisProduct.priceElem = thisProduct.element.querySelector(  // tworze wlasciwosc w ktorej przechowuje element DOM znaleziony w obrebie thisProduct.element
        select.menuProduct.priceElem  // wyswietla cene produktuna stronie
      );

      thisProduct.imageWrapper = thisProduct.element.querySelector(  // tworze wlasciwosc w ktorej przechowuje element DOM znaleziony w obrebie thisProduct.element
        select.menuProduct.imageWrapper  // reprezentuje kontener do obrazow produktu
      );
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(  // tworze wlasciwosc w ktorej przechowuje element DOM znaleziony w obrebie thisProduct.element
        select.menuProduct.amountWidget  // reprezentuje widget ilosci produktu
      );
    }

// Metoda ktora inicjalizuje akordeon dla elementów produktów, jesli taki istnieje. Akordeon jest rodzajem interaktywnego komponentu, ktory pozwala na rozwijanie i zwijanie sekcji na stronie.    
    initAccordion() {
      const thisProduct = this;

      const clickableTrigger = thisProduct.element.querySelector(  // Wyszukuje element, (ktory bedzie reagowal na klikniecie) na podstawie selectora . . clickable, w obrębie elementu "element"
        select.menuProduct.clickable
      );

      clickableTrigger.addEventListener('click', function (event) {  // na wyszukanym  elemencie "clickableTrigger" dodaje nasluch  jako CLICK i zapisuje w parametrze funckji 'event'
        event.preventDefault();                                     // zapobiega domyslnej akcji (scroll to top) dla zdarzenia co jest stotne aby uniknac przewijania strony do gory, gdy klikne na 'clickable', chce reagowac tylko na klikniecie bez przenoszenia na gore strony.

        const activeProduct = document.querySelector('.product.active'); // Znajduje element product.active na stronie HTML, ktory jest juz aktywny (czyli ktory ma klase "active"). Ta zmienna przechowuje referencje do tego produktu.

        if (activeProduct && activeProduct !== thisProduct.element) { // Sprawdza, czy istnieje aktywny produkt i czy aktywny produkt nie jest aktualnym produktem (!= rozny od -> thisProduct.element). 
          activeProduct.classList.remove('active');                  // Jesli tak, usuwa klase "active" z aktywnego produktu, aby go schowac i zachowac funkcjonalnosc akordeonu.
        }

        thisProduct.element.classList.toggle('active');   // sprowadza czy element 'this.Product.element' (czyli biezacy produkt) ma klase 'active' 
      });                                                // Jesli element ma juz klase 'active' (czyli element-produkt jest juz rozwiniety) to 'classList.toggle()' usunie te klase z elementu co spowoduje ze szczeguly produktu zostana zwiniete.
    }                                                   // Jesli element nie ma klasy "active", to 'classList.toggle()' doda te klase do elementu, co spowoduje, ze szczegoly produktu zostana rozwiniete. Produkt, ktory wczesniej nie byl rozwiniety, teraz bedzie rozwiniety.
   
// Metoda ktora inicjalizuje formularz zamowienia dla produktu.   
    initOrderForm() {
      const thisProduct = this;
    
      thisProduct.form.addEventListener('submit', function (event) {  // Dodanie nasluchu na zdarzenie submit na elemencie this.Product (formularz) 
                                                                     // Gdy uzytkownik nacisnie button submit funkcja obslugi zdarzenia zostaje wywolana
        event.preventDefault();                 // funkcja zapobiega domyslnej akcji (przeslanie danych do serwera) bo chce aby dane z formularza byly przetwarzane wewnatrz aplikacji i odpowiednio aktualizowaly koszyk lub zamowienie.                                  
        thisProduct.processOrder();            // wywolanie metody ktora jest odpowiedzialna za przetworzenie
      });

      for (let input of thisProduct.formInputs) {  //petla iteruje po wszystkich elementach formularza danego productu .formInputs to inputy uzytkownika oraz checkbox i radio 
        input.addEventListener('change', function () {  // ustawienie nasluchu na zdarzenie change na elemencie input -> kiedy uzytkownik zmieni wartosc wybranego inputu zostanie wywolana funkcja ktora ...
          thisProduct.processOrder();                 // wywoluje metode processOrder co powoduje ponowne przeliczenie zamowienia 
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {    // ustawienie nasluchu na zdarzenie click na elemencie thisProduct.cartButton i zapisanie zdarzenia w event
        event.preventDefault();                                             // domyslna akcja to wyslanie dancyh formularza lub przeniesienie do innej strony . Klikniecie obsluguje za pomoca JS a nie chce przekierowania na inna strone .
        thisProduct.processOrder();                                       // Po zatrzymaniu domnyslnej akcji nastepuje wywolanie metody processOrder()
      });
    }
    
//  WYWOLANIE METODY ktora przetwarza zamowienie produktu, czyli oblicza cene, wybrane opcje itp. 
    processOrder() {
      const thisProduct = this;
      //console.log(thisProduct);

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);

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
          console.log(optionId, option);

          // check if there is param with a name of paramId in formData and if it includes optionId

          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
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

// Metoda ktora INICJALIZUJE widget do wybierania ilosci produktu. Widget ten moze umozliwiac uzytkownikowi wybieranie liczby sztuk produktu, jakie chce zamowic.    
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);    // tworze NOWA INSTANCJE KLASY  AmountWidget i argumentem konstruktora (klasy) jest element thisProduct.amountWidgetElem (z metody getElements reprezentuje widget do wyboru ilosci dla tego konkretnego produktu.)

      thisProduct.amountWidgetElem.addEventListener('updated', function () {  // Na obiekcie thisProduct o wlasciwosci amountWidgetElem ustawiam nasluch na zdarzenie update. Jezeli uzytkownik zmieni ilosc produktu to zadziala update i...
        thisProduct.processOrder();                                          // ... i wywola metode processOrder() ktora jest odpwiedzialna za przetwarzanie zamowienia np oblicza cene.
      });
    }
  }

  class AmountWidget {
    constructor(element) {    // konstruktor otrzymuje jeden element, ktory reprezentuje element DOM (z initAmountWidget)
      const thisWidget = this;

      console.log('AmountWidget: ', thisWidget);        // Wyswietla informacje o biezacej instancji klasy AmountWidget w konsoli przegladarki.
      console.log('constructor arguments: ', element);  //  Wyswietla argumenty przekazane do konstruktora w konsoli przegladarki.

      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initAction(thisWidget.input.element);
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

      const newValue = parseInt(value); // zmienna ktora przechowuje wartosc przekazana do metody setValue, przekonwertowana na liczbe calkowita ze wzgledu ze kazdy input to string

      if (thisWidget.value !== newValue && !isNaN(newValue)) {
        // NaN not a number
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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;
  
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
  
      console.log('new Cart', thisCart);
    }
  
    getElements(element) {
      const thisCart = this;
  
      thisCart.dom = {};
  
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
        select.cart.toggleTrigger
      );
    }
  
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
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


