/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    // obiekt o nazwie select w ktorym jest kolejny obiekt(wlasciwosc select) ktory ma 2 wlasciwosci
    // selektor CSS identyfikujacy element na stronie HTML
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
        linkIncrease: 'a[href="#more"]', // elementu a atrybut href o wartosci "#remove"
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
      remove: '[href="#remove"]', // atrybut href o wartosci "#remove"
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
      document.querySelector(select.templateOf.menuProduct).innerHTML // argument przekazuje tresc HTML znajdujacy sie w elemencie o selektorze select.templateOf.menuProduct).innerHTML
    ), //document.querySelector(select.templateOf.menuProduct).innerHTML -> pobiera zawartosc HTML szablonu, ktory jest juz obecny na stronie
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };

  /* PLAN DZIALANIA ALGORYTMU
1. wywolanie metod w klasie product

2. renderowanie
a. znajduje wybrany kod HTML 
b. konwerteruje na element DOM czyli obiekt JS
c. szukam w document kontenera menu
d. dodaje na koniec kontenera menu jako obiekt JS

3. zlokalzowanie i przypisanie do wlasciwego obiektu elementow DOM - konkretny produkt na stronie.
a. accordionTrigger
b. selektor wyszukujacy i wskazuje na element HTML np formularza produktu
c. formularz
d. button
e. cena produktu na stronie
f. kontener do obrazow produktu
g. widget ilosci produktu

4. Metoda ktora inicjalizuje akordeon dla elementow produktow
5. Metoda ktora inicjalizuje formularz zamowienia dla produktu.
6. WYWOLANIE METODY ktora przetwarza zamowienie produktu, czyli oblicza cene, wybrane opcje itp.
7. Metoda ktora INICJALIZUJE widget do wybierania ilosci produktu
8. 
9.
10.

11. Klasa AmountWidget
12. Metoda odpowiedzialna za przypisanie odpowiednich elementow DOM do wlasciwosci obiektu klasy 'AmountWidget
13. Metoda odpowiada za ustawienie nowej wartosci dla widgetu liczby
14. Metoda ktora inicjuje dzialanie widgetu liczby
15. Metoda sluzy do powiadamiania innych komponentow ze wartosc widgetu liczby zostala z aktualizowana

16. Klasa reprezentuje koszyk zakupowy
17. Metoda ktora znajduje i przechowuje elementy DOM, ktore sa zwiazane z koszykiem zakupowym.
18. Metoda sluzy do inicjowania akcji nasluchiwania zdarzen aktywacje lub dezaktywacje koszyka zakupowego
19. 
20. Metoda odpowiedzialna za inicjacje menu aplikacji
21. Metoda inicjujaca dane w aplikacji
22. Metoda ta jest glownym punktem inicjalizacji calej aplikacji
23. Metoda sluzy do inicjalizacji koszyka zakupow.

24. Odpalenie all
*/

  class Product {
    // Konstruktor klasy
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

    // 2. Metoda ktora renderuje produkt w menu aplikacji lub na stronie
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

    //3. Metoda ktora pobiera i zapisuje referencje do roznych elementow HTML reprezentujacych produkt (np przyciski, pola fromularza)
    // Metoda ma na celu zlokalzowanie i przypisanie do wlasciwego obiektu 'thisProduct' roznych elementow DOM ktore sa zwiazane z konkretnym produktem na stronie.
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

    //4. Metoda ktora inicjalizuje akordeon dla elementow produktow. Akordeon jest rodzajem interaktywnego komponentu, ktory pozwala na rozwijanie i zwijanie sekcji na stronie.
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
    } // Jesli element nie ma klasy "active", to 'classList.toggle()' doda te klase do elementu, co spowoduje, ze szczegoly produktu zostana rozwiniete. Produkt, ktory wczesniej nie byl rozwiniety, teraz bedzie rozwiniety.

    //5.  Metoda ktora inicjalizuje formularz zamowienia dla  produktu.
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

      thisProduct.params = thisProduct.prepareCartProductParams(); // wykorzysatnie wyniku metody ...ProductParams jako wartosc dla wlasciwosci params

      const productSummary = {
        id: thisProduct.id, // identyfikator produktuu (id) do obiektu productSummary.
        name: thisProduct.name, //  nazwa produktu (name) do obiektu productSummary.
        amount: thisProduct.amount, //  ilosc produktu (amount) do obiektu productSummary.
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amount, // pojedyncza cena pomnozona przez ilosc produktow
        params: thisProduct.params,
      };
      return productSummary; // zwraca caly obiekt podsumowania
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

  //11.
  class AmountWidget {
    constructor(element) {
      // konstruktor otrzymuje jeden element, ktory reprezentuje element DOM (z initAmountWidget)
      const thisWidget = this;

      console.log('AmountWidget: ', thisWidget); // Wyswietla informacje o biezacej instancji klasy AmountWidget w konsoli przegladarki.
      console.log('constructor arguments: ', element); // Wyswietla argumenty przekazane do konstruktora w konsoli przegladarki.

      thisWidget.getElements(element); // Wywoluje metode getElements(element) na biezacej instancji klasy AmountWidget, ktora ma na celu znalezienie i zapisanie referencji do roznych elementow widgetu.
      thisWidget.setValue(settings.amountWidget.defaultValue); // Wywoluje metode setValue na biezacej instancji klasy AmountWidget, ktora ma ustawic poczatkowa wartosc widgetu na wartosc domyslna z obiektu settings
      thisWidget.initAction(thisWidget.input.element); // Wywoluje metode initAction na biezacej instancji klasy AmountWidget, ktora unicjuje akcje widgetu
    }

    //12. Metoda odpowiedzialna za przypisanie odpowiednich elementow DOM do wlasciwosci obiektu klasy 'AmountWidget' dzieki czemu moge pozniej uzywac elementow do innych akcji funkcji zwiazanych z dzialaniem widgetu liczby
    getElements(element) {
      // element jest elementem DOM z initAmountWidget
      const thisWidget = this;

      thisWidget.element = element; //Przypisuje argument 'element' do wlasciwosci 'element' obiektu klasy AmountWidget. Dzieki temu, thisWidget.element przechowuje referencje do elementu DOM, ktory reprezentuje widget liczby.
      thisWidget.input = thisWidget.element.querySelector(
        // Szukam elemenmtow inputu wewnatrz widgetu
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        // to wlasciwosci obiektu klasy AmountWidget, ktora przechowuje referencje do odpowiednich elementów wewnątrz widgetu liczby.
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        // to wlasciwosci obiektu klasy AmountWidget, ktora przechowuje referencje do odpowiednich elementów wewnątrz widgetu liczby.
        select.widgets.amount.linkIncrease
      );
    }

    //13. Metoda odpowiada za ustawienie nowej wartosci dla widgetu liczby, sprawdzajac przy tym czy wartosc miesci sie w okreslonym zakresie i aktualizuje pola input na stronie aby odzwierciedlac nowa wartosc i wywoluje metode announce ().
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

    //14. Metoda ktora inicjuje dzialanie widgetu liczby, dodajac nasluchiwanie na rozne zdarzenia, ktore pozwalaja uzytkownikowi zmieniac wartosc w polu input oraz klikajac przyciski zmiany ilosci. Kiedy uzytkownik wprowadzi zmiane w polu input lub kliknie na przyciski zmiany ilosci, zostana wywolane odpowiednie funkcje anonimowe, ktore wywolaja metode thisWidget.setValue() w celu aktualizacji wartosci widgetu liczby.
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

    // 15. Metoda sluzy do powiadamiania innych komponentow lub modulow, ze wartosc widgetu liczby zostala z aktualizowana.
    announce() {
      const thisWidget = this;

      const event = new Event('updated'); // do stalej event przypisuje tworzony nowy obiekt o zdarzeniu 'update'
      thisWidget.element.dispatchEvent(event); // Wywoluje zdarzenie "updated" na elemencie thisWidget.element, czyli na elemencie DOM, ktory reprezentuje widget liczby. Metoda dispatchEvent() jest metoda wbudowana, ktora słuzy do wywolywania zdarzen na elemencie. W tym przypadku, wywolanie dispatchEvent(event) powoduje uruchomienie zdarzenia "updated" na elemencie widgetu liczby.
    } // Za pomoca tego mechanizmu, inne czesci aplikacji lub komponenty moga nasluchiwac na zdarzenie "updated" na elemencie widgetu liczby i reagowac na zmiany wartosci tego widgetu. To pozwala na rozdzielenie odpowiedzialnosci miedzy roznymi czesciami aplikacji, dzieki czemu mozna w latwy sposob reagowac na zmiany wartosci w innych czesciach kodu. Na przyklad, moze to byc wykorzystane do aktualizacji koszyka zakupow w momencie zmiany ilosci produktu lub do odswieżania ceny zamowienia po zmianie ilosci produktow w koszyku.
  }

  // 16. Klasa reprezentuje koszyk zakupowy
  class Cart {
    // Konmstruktor inicjuje nowy koszyk zakupowy, przypisuje mu wlasciwosci oraz metody potrzebne do jego funkcjonowania i wyswietla informacje o nowo utworzonym koszyku w konsoli.
    constructor(element) {
      const thisCart = this;

      thisCart.products = []; // Utworzenie pustej tablicy w ktorej beda przechowywane produkty dodane do koszyka. Jest to wlasciwosc koszyka.
      thisCart.getElements(element); //  Wywoluje metode getElements na obiekcie koszyka, aby znalezc i zapisac referencje do elementow DOM reprezentujących koszyk. Metoda getElements odpowiedzialna jest za znalezienie i zapisanie referencji do roznych elementow, takich jak przyciski, pola formularza itp., ktore beda wykorzystywane do interakcji z koszykiem.
      thisCart.initActions(); // Wywolanie metody initAction na obiekcie koszyka aby zainicjowac nasluchiwanie na rozne zdarzenia (klikniecie przycisku dodaj do koszyka) i odpowiednio na nie reagowac.

      console.log('new Cart', thisCart);
    }

    //17. Metoda ktora znajduje i przechowuje elementy DOM, ktore sa zwiazane z koszykiem zakupowym.
    getElements(element) {
      const thisCart = this;

      thisCart.dom = {}; // Inicjuje wlasciwosc dom na obiekcie thisCart. dom jest obiektem, ktory bedzie przechowywal referencje do roznych elementów DOM zwiazanych z koszykiem.

      thisCart.dom.wrapper = element; // Wyszukuje element DOM, ktory reprezentuje caly kontener koszyka zakupowego (np. <div class="cart">) i przypisuje go do wlasciwosci dom.wrapper.
      this.dom.productList = this.dom.wrapper.querySelector(
        '.cart__order-summary'
      );
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
        //Wyszukuje element DOM, ktory jest odpowiedzialny za akcje przelaczania widocznosci koszyka (np. przycisk otwierajacy/ zamykajacy koszyk) za pomoca selektora select.cart.toggleTrigger. Znaleziony element zostaje przypisany do wlasciwosci dom.toggleTrigger.
        select.cart.toggleTrigger
      );
    }

    //18. Metoda sluzy do inicjowania akcji nasluchiwania zdarzen na elemencie reprezentujacym aktywacje lub dezaktywacje koszyka zakupowego. Dzieki tej metodzie uzytkownik bedzie mogl otworzyc i zamknac koszyk poprzez klikniecie odpowiedniego przycisku.
    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        //Dodaje nasluchiwanie na zdarzenie 'click' dla elementu dom.toggleTrigger, ktory zostal wczesniej zidentyfikowany w metodzie getElements(). Klikniecie tego elementu bedzie aktywowane przez uzytkownika, aby otworzyc lub zamknac koszyk.
        event.preventDefault(); // Zabklokowanie domyslnej funkcji scroll up
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); // Wywoluje sie metoda classList.toggle() na wlasciwosci dom.wrapper, ktora przechowuje element reprezentujacy caly kontener koszyka zakupowego (np. <div class="cart">). Metoda toggle() dodaje klase classNames.cart.wrapperActive, jesli jej nie ma, lub usuwa ja, jesli juz istnieje. classNames.cart.wrapperActive jest wczesniej zdefiniowana klasa CSS, ktora odpowiada za aktywnosc koszyka, np. wyswietlanie go lub ukrywanie.
      });
    }

    //19.
    add(menuProduct) {
      const thisCart = this;

      // Generate HTML based on template and product data
      const generatedHTML = templates.cartProduct(menuProduct);

      // Create DOM element from the HTML code
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      // Add the DOM element to the cart
      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(menuProduct); // Dodaj produkt do listy produktów w koszyku
    }
  }

  // Do obiektu..
  const app = {
    // 20. Metoda odpowiedzialna za inicjacje menu aplikacji a konkretnie tworzenie produktow na podstawie danych znajdujacych sie w thisApp.data.products.
    initMenu: function () {
      const thisApp = this; // Tworze lokalna zmienna thisApp, ktora przechowuje referencje do obiektu app
      console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) {
        // w pętli iteruje przez wszystkie produkty znajdujace sie w thisApp.data.products. Dla kazdego produktu wykonuje sie następujące czynności:
        new Product(productData, thisApp.data.products[productData]); // Tworzy nowa instancje klasy Product za pomocą new Product(). Przy tworzeniu instancji przekazuje sie dwa argumenty: productData (klucz) oraz thisApp.data.products[productData] (wartosc). productData to identyfikator produktu, a thisApp.data.products[productData] to obiekt z danymi tego produktu. Klasa Product sluzy do reprezentacji i interakcji z pojedynczym produktem na stronie.
      }
    },

    //21 Metoda inicjujaca dane w aplikacji
    initData: function () {
      const thisApp = this; // Tworze lokalna zmienna thisApp, ktora przechowuje referencje do obiektu app. Jest to pomocne, poniewaz wewnatrz metody zmienna this może wskazywac na inny obiekt, dlatego warto utworzyc zmienna thisApp dla zachowania spojnosci.

      thisApp.data = dataSource; // Przypisuje do wlasciwosci thisApp.data caly obiekt dataSource. Obiekt dataSource zawiera wszystkie dane potrzebne do funkcjonowania aplikacji, takie jak produkty, kategorie, ceny, itp.
    },

    //22. Metoda ta jest glownym punktem inicjalizacji calej aplikacji
    init: function () {
      const thisApp = this; // Referencja do obiektu app
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData(); // Inicjalizacja danych
      thisApp.initMenu(); // Inicjalizacja Menu
      thisApp.initCart(); // Inicjalizacja koszyka
    },

    //23. Metoda sluzy do inicjalizacji koszyka zakupow. Dzieki temu, koszyk jest gotowy do uzycia i bedzie dzialal poprawnie w calej aplikacji.
    initCart: function () {
      const thisApp = this; // Referencja do obiektu app

      const cartElem = document.querySelector(select.containerOf.cart); // Znajduje element na stronie HTML, ktory bedzie kontenerem dla koszyka zakupow. Wykorzystuje do tego selektor select.containerOf.cart, ktory wskazuje na odpowiedni element na stronie.
      thisApp.cart = new Cart(cartElem); // Tworzy nowy obiekt Cart, ktory reprezentuje KOSZYK ZAKUPOW. Jako argument przekazuje znaleziony element cartElem, ktory bedzie kontenerem dla koszyka.
    }, // Przypisuje utworzony obiekt Cart do wlasciwosci cart obiektu app (thisApp.cart). Dzieki temu, obiekt Cart bedzie dostepny w innych czesciach aplikacji i bedzie mozna korzystac z jego funkcjonalnosci.
  };

  //24.
  app.init();
}
/*Tworzy lokalna zmienna thisApp, ktora przechowuje referencję do obiektu app. To pozwala na odwolywanie sie do obiektu app wewnatrz metody za pomoca krotszej nazwy thisApp.

Wyswietla w konsoli komunikat "App starting" oraz rozne informacje o aplikacji, takie jak thisApp.data (dane aplikacji), classNames (klasy CSS), settings (ustawienia aplikacji) i templates (szablony Handlebars). Te informacje sa pomocne podczas debugowania i pozwalaja sprawdzic, czy dane sa wczytane poprawnie.

Wywoluje thisApp.initData() - inicjalizuje dane aplikacji, ktore sa przechowywane w obiekcie dataSource. Wczesniej dane zostaly zaladowane do thisApp.data.

Wywoluje thisApp.initMenu() - inicjalizuje menu aplikacji. Ta metoda tworzy produkty na podstawie danych z thisApp.data.products i renderuje je na stronie.

Wywoluje thisApp.initCart() - inicjalizuje koszyk zakupow. Ta metoda tworzy obiekt Cart i przypisuje go do wlasciwosci cart obiektu app.

Po wywolaniu app.init(), aplikacja jest w pelni zainicjalizowana i gotowa do dzialania. Produkty sa wyswietlane w menu, a koszyk zakupow jest gotowy do przechowywania produktow. Aplikacja jest gotowa do obslugi interakcji uzytkownika i wykonywania roznych akcji na produktach i w koszyku zakupow.
*/
