import { api } from "./api.js";
import { Card } from "./card.js";
import { MAX_LIVE_STORAGE } from "./contants.js";
import { Popup } from "./popup.js";
import { serializeForm, setDataRefresh } from "./utils.js";


const cardsContainer = document.querySelector(".cards");
const btnOpenPopupForm = document.querySelector("#add");
const btnOpenPopupLogin = document.querySelector("#login");
const formCatAdd = document.querySelector("#popup-form-cat");
const formLogin = document.querySelector("#popup-form-login");

const popupAddCat = new Popup("popup-add-cats");
popupAddCat.setEventListener();



function createCat(dataCat) {
  const cardInstance = new Card(dataCat, "#card-template");
  const newCardElement = cardInstance.getElement();
  cardsContainer.append(newCardElement);
}

function handleFormAddCat(e) {
  e.preventDefault();
  const elementsFormCat = [...formCatAdd.elements];
  const dataFromForm = serializeForm(elementsFormCat);

  console.log(dataFromForm);
  //собрать данные из формы
  //создать карточку из данных
  //добавить карточку на страницу
  api.addNewCat(dataFromForm).then(() => {
    createCat(dataFromForm);
    updateLocalStorage(dataFromForm, {type: 'ADD_CAT'})
    popupAddCat.close();
  });
}

function handleFormLogin(e) {
  e.preventDefault();
  const elementsFormCat = [...formLogin.elements];
  const dataFromForm = serializeForm(elementsFormCat);
  console.log(dataFromForm);
  Cookies.set("email", `email=${dataFromForm.email}`);
  btnOpenPopupForm.classList.remove("visually-hidden");
  popupLogin.close();
}

function checkLocalStorage() {
  const localData = JSON.parse(localStorage.getItem("cats"));
  const getTimeExpires = localStorage.getItem("catsRefresh");

  if (localData && localData.length && new Date() < new Date(getTimeExpires)) {
    localData.forEach(function (catData) {
      createCat(catData);
    });
  } else {
    api.getAllCats().then(({ data }) => {
      data.forEach(function (catData) {
        createCat(catData);
      });

    updateLocalStorage(data, {type: 'ALL_CATS'})

    });
  }
}

function updateLocalStorage(data, action) { // {type: 'ADD_CAT'} {type: 'ALL_CATS'}
    const oldStorage = JSON.parse(localStorage.getItem('cats'));

    switch (action.type) {
        case 'ADD_CAT':
            oldStorage.push(data);
            localStorage.setItem('cats', JSON.stringify(oldStorage))
            return;
        case 'ALL_CATS': 
            localStorage.setItem('cats', JSON.stringify(data));
            setDataRefresh(MAX_LIVE_STORAGE, 'catsRefresh');
            return;
        case 'DELETE_CAT':
            const newStorage = oldStorage.filter(cat => cat.id !== data.id)
            localStorage.setItem('cats', JSON.stringify(newStorage))

            return;
        default:
            break;
    }
}

btnOpenPopupForm.addEventListener("click", () => popupAddCat.open());
btnOpenPopupLogin.addEventListener("click", () => popupLogin.open());
formCatAdd.addEventListener("submit", handleFormAddCat);
formLogin.addEventListener("submit", handleFormLogin);

const isAuth = Cookies.get("email");

if (!isAuth) {
  popupLogin.open();
  btnOpenPopupForm.classList.add("visually-hidden");
}

checkLocalStorage();

// document.cookie = 'email=maxim_91@inbox.ru;samesite=strict;max-age=360;';
// document.cookie = 'name=Вася;samesite=strict;max-age=360;';

// Cookies.set('password', '1234567', {expires: 7})
// Cookies.remove('password')

// console.log(Cookies.get('name'));

// localStorage.setItem('name', JSON.stringify({name: 'Вася'}))
// localStorage.setItem('lastname', JSON.stringify({name: 'Вася'}))

// console.log(JSON.parse(localStorage.getItem('name')));
// localStorage.setItem('name', JSON.stringify({name: 'Максим'}))
