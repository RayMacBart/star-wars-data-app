// (c) by Mag. Reinhard Höbart, June 2023

'use strict';

const FILM_BUTTON = document.querySelectorAll('button')[0];
const CHARACTER_BUTTON = document.querySelectorAll('button')[1];
const SPECIES_BUTTON = document.querySelectorAll('button')[2];
const PLANET_BUTTON = document.querySelectorAll('button')[3];
const STARSHIP_BUTTON = document.querySelectorAll('button')[4];
const VEHICLE_BUTTON = document.querySelectorAll('button')[5];
const LEGEND = document.querySelector('legend'); 
const SINGLE_DESCS_COLUMN_1 = document.querySelectorAll('section.desc')[0];
const SINGLE_DESCS_COLUMN_2 = document.querySelectorAll('section.desc')[1];
const SINGLE_DESCS_COLUMN_3 = document.querySelectorAll('section.desc')[2];
const SINGLE_VALUES_COLUMN_1 = document.querySelectorAll('section.values')[0];
const SINGLE_VALUES_COLUMN_2 = document.querySelectorAll('section.values')[1];
const SINGLE_VALUES_COLUMN_3 = document.querySelectorAll('section.values')[2];
const LIST_DESC_1 = document.querySelectorAll('section.desc')[3];
const LIST_DESC_2 = document.querySelectorAll('section.desc')[4];
const LIST_DESC_3 = document.querySelectorAll('section.desc')[5];
const LIST_DESC_4 = document.querySelectorAll('section.desc')[6];
const LIST_DESC_5 = document.querySelectorAll('section.desc')[7];
const LIST_VALUES_COLUMN_1 = document.querySelectorAll('section.values')[3];
const LIST_VALUES_COLUMN_2 = document.querySelectorAll('section.values')[4];
const LIST_VALUES_COLUMN_3 = document.querySelectorAll('section.values')[5];
const LIST_VALUES_COLUMN_4 = document.querySelectorAll('section.values')[6];
const LIST_VALUES_COLUMN_5 = document.querySelectorAll('section.values')[7];
const LINKSTART = 'https://swapi.dev/api/';

let lastSingleAmount = 0;
let tryCount;
let orderedKeyList;


const processFilmRequest = () => {
   processRequest('films');
}
const processCharacterRequest = () => {
   processRequest('people');
}
const processSpeciesRequest = () => {
   processRequest('species');
}
const processPlanetRequest = () => {
   processRequest('planets');
}
const processStarshipRequest = () => {
   processRequest('starships');
}
const processVehicleRequest = () => {
   processRequest('vehicles');
}

const processRequest = (type, reprocessing=false) => {
   reprocessing ? tryCount += 1 : tryCount = 1;
   const amount = getAmount(type);
   const randNumString = String(Math.ceil(Math.random()*amount));
   fetch(LINKSTART+type+'/'+randNumString+'/')
      .then(response => validateResponse(response))
      .then(data => {
            buildDataPresentation(data);
      })
      .catch (error => {
         console.log('error no. ', tryCount, ': ', error);
         if (tryCount < 8) {
            console.warn('Reprocessing due to 404 Error...');
            processRequest(type, true);
         }else {
            console.error('too many (over 7) 404 Errors for one request');
         }
      });
}

const getAmount = (type) => {
   let amount;
   if (type === 'films') {
      amount = 7;
   }else {
      amount = 100;
   }
   return amount;
}

const validateResponse = (response) => {
   if (response.ok) {
      return response.json()
   }else if (response.status === 404){
      throw 'ERROR 404 - data not found';
   }else {
      console.log('RESPONSE.STATUS: ', response.status);
      throw 'ERROR: '+response.status;
   }
}

const buildDataPresentation = (data) => {
   data = removeUnwantedProperties(data);
   const [singlesObject, listsObject] = splitSinglesAndLists(data);
   setUpSingleValueElements(singlesObject);
   setUpMultiValueElements(listsObject);
   writeDataOnElements(singlesObject, 'singles');
   writeDataOnElements(listsObject, 'lists');
}

const removeUnwantedProperties = (data) => {
   try {delete data.created;}catch (error) {}
   try {delete data.edited;}catch (error) {}
   try {delete data.url;}catch (error) {}
   return data;
}

const splitSinglesAndLists = (data) => {
   let singlesObject = {};
   let listsObject = {};
   let key;
   for (let i = 0; i < Object.keys(data).length; i++) {
      key = Object.keys(data)[i];
      if (!Array.isArray(data[key])) {
         singlesObject[key] = data[key];
         continue;
      }
      if (data[key].length > 1) {
         listsObject[key] = data[key];
      }else if (data[key].length === 1){
         singlesObject[key] = data[key][0];
      }else {
         singlesObject[key] = 'none';
      }
   }
   return [singlesObject, listsObject];
}

const setUpSingleValueElements = (singlesObject) => {
   singlesObject.title ? LEGEND.innerText = singlesObject.title : LEGEND.innerText = singlesObject.name;
   singlesObject.title ? delete singlesObject.title : delete singlesObject.name;
   const currentSingleAmount = Object.keys(singlesObject).length;
   const singleAmountDiff = currentSingleAmount - lastSingleAmount;
   if (singleAmountDiff > 0){
      addNecessarySingleElements(singleAmountDiff)
   }else if (singleAmountDiff < 0) {
      handleSuperfluousSingleElements(singleAmountDiff);
   }
   removeCrawlClasses();
   lastSingleAmount = currentSingleAmount;
}

const addNecessarySingleElements = (singleAmountDiff) => {
   for (let elems = lastSingleAmount; elems < lastSingleAmount+singleAmountDiff; elems++) {
      let descElement = document.createElement('h3');
      let valueElement = document.createElement('ins');
      if ((elems) % 3 === 1) {
         SINGLE_DESCS_COLUMN_1.appendChild(descElement);
         SINGLE_VALUES_COLUMN_1.appendChild(valueElement);
      }else if ((elems) % 3 === 2) {
         SINGLE_DESCS_COLUMN_2.appendChild(descElement);
         SINGLE_VALUES_COLUMN_2.appendChild(valueElement);
      }else {
         SINGLE_DESCS_COLUMN_3.appendChild(descElement);
         SINGLE_VALUES_COLUMN_3.appendChild(valueElement);
      }
   }
}

const handleSuperfluousSingleElements = (singleAmountDiff) => {
   let length1 = SINGLE_DESCS_COLUMN_1.children.length;
   let length2 = SINGLE_DESCS_COLUMN_2.children.length;
   let length3 = SINGLE_DESCS_COLUMN_3.children.length;
   if (length1 + length2 + length3 <= 1) {
      return;
   }
   for (let diffCount = singleAmountDiff; diffCount < 0; diffCount++) {
      length1 = SINGLE_DESCS_COLUMN_1.children.length;
      length2 = SINGLE_DESCS_COLUMN_2.children.length;
      length3 = SINGLE_DESCS_COLUMN_3.children.length;
      if (length1 !== length2 || length2 !== length3) {
         shortenTallestColumn();
         continue;
         }
      removeSingleElements(diffCount);
   }
}

const shortenTallestColumn = () => {
   const descs = [SINGLE_DESCS_COLUMN_1, SINGLE_DESCS_COLUMN_2, SINGLE_DESCS_COLUMN_3];
   const vals = [SINGLE_VALUES_COLUMN_1, SINGLE_VALUES_COLUMN_2, SINGLE_VALUES_COLUMN_3];
   const most = Math.max(descs[0].children.length, descs[1].children.length, descs[2].children.length);
   let alreadyRemoved = false;
   descs.forEach((col, index) => {
      if (col.children.length !== most || alreadyRemoved) {
         return;
      }
      descs[index].removeChild(descs[index].lastChild);
      vals[index].removeChild(vals[index].lastChild);
      alreadyRemoved = true;
   });
}

const removeSingleElements = (diffCount) => {
   if (lastSingleAmount - diffCount % 3 === 1) {
      SINGLE_DESCS_COLUMN_1.removeChild(SINGLE_DESCS_COLUMN_1.lastChild);
      SINGLE_VALUES_COLUMN_1.removeChild(SINGLE_VALUES_COLUMN_1.lastChild);
   }else if (lastSingleAmount - diffCount % 3 === 2){
      SINGLE_DESCS_COLUMN_2.removeChild(SINGLE_DESCS_COLUMN_2.lastChild);
      SINGLE_VALUES_COLUMN_2.removeChild(SINGLE_VALUES_COLUMN_2.lastChild);
   }else {
      SINGLE_DESCS_COLUMN_3.removeChild(SINGLE_DESCS_COLUMN_3.lastChild);
      SINGLE_VALUES_COLUMN_3.removeChild(SINGLE_VALUES_COLUMN_3.lastChild);
   }
}


const removeCrawlClasses = () => {
   const singleValueColumns = [SINGLE_VALUES_COLUMN_1, SINGLE_VALUES_COLUMN_2, SINGLE_VALUES_COLUMN_3];
   singleValueColumns.forEach(col => {
      Array.from(col.children).forEach(elem => {
         if (elem.classList.contains('crawl')) {
            elem.classList.remove('crawl');
         }
      });
   });
}


const setUpMultiValueElements = (listsObject) => {
   deleteAllUnderElements();
   orderedKeyList = getOrderedKeyList(listsObject);
   const listAmount = Object.keys(listsObject).length;
   const descElems = [LIST_DESC_3, LIST_DESC_2, LIST_DESC_4, LIST_DESC_1, LIST_DESC_5];
   const valueElems = [LIST_VALUES_COLUMN_3, LIST_VALUES_COLUMN_2, LIST_VALUES_COLUMN_4];
   valueElems.push(LIST_VALUES_COLUMN_1, LIST_VALUES_COLUMN_5);
   let currentElement;
   for (let index = 0; index < listAmount; index++) {
      currentElement = document.createElement('h3');
      descElems[index].appendChild(currentElement);
      listsObject[orderedKeyList[index]].forEach(v => {
         currentElement = document.createElement('ins');
         valueElems[index].appendChild(currentElement);
      });
   }
}

const deleteAllUnderElements = () => {
   let AllUnderElems = [LIST_DESC_1, LIST_DESC_2, LIST_DESC_3, LIST_DESC_4, LIST_DESC_5];
   AllUnderElems.push(LIST_VALUES_COLUMN_1, LIST_VALUES_COLUMN_2, LIST_VALUES_COLUMN_3);
   AllUnderElems.push(LIST_VALUES_COLUMN_4, LIST_VALUES_COLUMN_5);
   AllUnderElems.forEach(elem => {
      while (elem.children.length) {
         elem.removeChild(elem.lastChild);
      }
   });
}

const getOrderedKeyList = (object) => {
   let newOrderedKeyList = [];
   let workKeyList = [];
   let lengthsList = [];
   Object.keys(object).forEach(key => {
      lengthsList.push(object[key].length);
      workKeyList.push(key);
   });
   lengthsList.sort(function(a,b){return b-a});  // = sorting in descending order
   lengthsList.forEach(len => {
      workKeyList.forEach((key, index) => {
         if (object[key].length === len){
            newOrderedKeyList.push(key);
            workKeyList.splice(index, 1);
         }
      });
   });
   newOrderedKeyList = orderEqualLengthersAlphabetical(object, newOrderedKeyList);
   return newOrderedKeyList;
}

const orderEqualLengthersAlphabetical = (object, keyList) => {
   for (let rep = 0; rep < 3; rep++) {
      keyList.forEach(key1 => {
         keyList.forEach(key2 => {
            if (object[key1].length === object[key2].length && 
               keyList.indexOf(key1) < keyList.indexOf(key2) && key1 > key2) {
               keyList.splice(keyList.indexOf(key1), 1);
               keyList.splice(keyList.indexOf(key2)+1, 0, key1);
            }
         });
      });
   }
   return keyList;
}


const writeDataOnElements = (object, type) => {
   writeDescriptions(object, type);
   writeValues(object, type);
}

const writeDescriptions = (object, type) => {
   if (type === 'lists') {
      var indexOrder = getIndexOrder(object);
      var currentIndex;
      var listPropertyIndex = 0;
   }
   const descs = document.querySelectorAll('h3');
   descs.forEach((descNode, index) => {
      if (descNode.parentElement.classList.contains('under')) {
         if (type === 'lists') {
            currentIndex = indexOrder[listPropertyIndex];
            descNode.innerText = orderedKeyList[currentIndex];
            listPropertyIndex++;
         }
         return;
      }
      if (type === 'singles') {
         descNode.innerText = Object.keys(object)[index];
      }
   });
}

const getIndexOrder = (listsObject) => {
   const amountLists = Object.keys(listsObject).length;
   let indexOrder;
   if (amountLists === 5) {
      indexOrder = [3, 1, 0, 2, 4];
   }else if (amountLists === 4) {
      indexOrder = [3, 1, 0, 2];
   }else if (amountLists === 3) {
      indexOrder = [1, 0, 2];
   }else if (amountLists === 2) {
      indexOrder = [1, 0];
   }else {
      indexOrder = [0];
   }
   return indexOrder;
}


const writeValues = (object, type) => {
   const values = document.querySelectorAll('ins');
   if (type === 'lists') {
      var indexOrder = getIndexOrder(object);
      var currentValue;
      var listPropertyIndex = 0;
      var valueIndex = 0;
   }
   values.forEach((valueNode, index) => {
      currentValue = Object.values(object)[index];
      if (valueNode.parentElement.classList.contains('under')) {
         if (type === 'lists') {
            currentValue = object[orderedKeyList[indexOrder[listPropertyIndex]]];
            if (currentValue) {
               setValuesAndHandleLinks(currentValue[valueIndex], valueNode);
               valueIndex++;
            }else {
               valueIndex = 0;
               listPropertyIndex++;
               return;
            }
            if (valueIndex === currentValue.length) {
               valueIndex = 0;
               listPropertyIndex++;
            }
         }
         return;
      }
      if (type === 'singles') {
         setValuesAndHandleLinks(currentValue, valueNode);
      }
   });
}

const setValuesAndHandleLinks = (value, node) => {
   if (String(value).slice(0, 22) !== LINKSTART) {
      node.innerText = value;
      try {
         if (value.length > 70) {
            node.classList.add('crawl');
         }
      }catch(error) {
         console.log('Error when setting crawl: ', error);
      }
   }else {
      setLinkRepresentation(value, node);
   }
}

const setLinkRepresentation = (link, node, reprocessing=false) => {
   reprocessing ? tryCount += 1 : tryCount = 1;
   fetch(link)
      .then(response => validateResponse(response))
      .then(data => {
         node.innerText = null;
         const newLinkElement = document.createElement('a');
         node.appendChild(newLinkElement);
         (link.search('films') < 0) ? newLinkElement.innerText = data.name : newLinkElement.innerText = data.title;
         newLinkElement.addEventListener('mouseup', function() {buildDataPresentation(data);});
      })
      .catch(error => {
         console.log('error no. ', tryCount, ': ', error);
         if (tryCount < 8) {
            console.warn('Reprocessing due to 404 Error...');
            setLinkRepresentation(link, node, true);
         }else {
            console.error('too many (over 7) 404 Errors for one request');
         }
      });
}

FILM_BUTTON.addEventListener('mouseup', processFilmRequest);
CHARACTER_BUTTON.addEventListener('mouseup', processCharacterRequest);
SPECIES_BUTTON.addEventListener('mouseup', processSpeciesRequest);
PLANET_BUTTON.addEventListener('mouseup', processPlanetRequest);
STARSHIP_BUTTON.addEventListener('mouseup', processStarshipRequest);
VEHICLE_BUTTON.addEventListener('mouseup', processVehicleRequest);

