'use strict';



class UI {
   static filmButton = document.querySelectorAll('button')[0];
   static characterButton = document.querySelectorAll('button')[1];
   static speciesButton = document.querySelectorAll('button')[2];
   static planetButton = document.querySelectorAll('button')[3];
   static starshipButton = document.querySelectorAll('button')[4];
   static vehicleButton = document.querySelectorAll('button')[5];
   static legend = document.querySelector('legend'); 
}

class Request {
   constructor() {
      this.tryCount = 1;
   }

   handleError(error) {
      console.log('error no. ', this.tryCount, ': ', error);
      if (this.tryCount < 8) {
         console.warn('Reprocessing due to 404 Error...');
         this.process(true);
      }else {
         console.error('too many (over 7) 404 Errors for one request');
      }
   }

   validateResponse(response) {
      if (response.ok) {
         return response.json()
      }else if (response.status === 404){
         throw 'ERROR 404 - data not found';
      }else {
         console.log('RESPONSE.STATUS: ', response.status);
         throw 'ERROR: '+response.status;
      }
   }
}


class RandomRequest extends Request {
   constructor(type='') {
      super();
      this.type = type;
      this.wholeData = {};
      this.process();
   }

   process(reprocessing=false) {
      reprocessing ? this.tryCount += 1 : this.tryCount = 1;
      const amount = this.getDataAmount();
      const randNumString = String(Math.ceil(Math.random()*amount));
      fetch(linkStart+this.type+'/'+randNumString+'/')
         .then(response => this.validateResponse(response))
         .then(data => this.saveData(data))
         .catch (error => this.handleError(error));
   }

   getDataAmount() {
      let amount;
      if (this.type === 'films') {
         amount = 7;
      }else {
         amount = 100;
      }
      return amount;
   }

   saveData(wholeData) {
      this.wholeData = wholeData;
   }
}


class DataManager {
   constructor() {
      this.wholeData = {};
      this.singles = {};
      this.multis = {};
   }

   process(wholeData) {
      this.wholeData = wholeData;
      this.removeUnwantedProperties();
      this.splitSinglesAndLists();
   }

   removeUnwantedProperties() {
      try {delete this.wholeData.created;}catch (error) {}
      try {delete this.wholeData.edited;}catch (error) {}
      try {delete this.wholeData.url;}catch (error) {}
   }

   splitSinglesAndLists() {
      this.singles = {};
      this.multis = {};
      let key;
      for (let i = 0; i < Object.keys(this.wholeData).length; i++) {
         key = Object.keys(this.wholeData)[i];
         if (!Array.isArray(this.wholeData[key])) {
            this.singles[key] = this.wholeData[key];
            continue;
         }
         if (this.wholeData[key].length > 1) {
            this.multis[key] = this.wholeData[key];
         }else if (this.wholeData[key].length === 1){
            this.singles[key] = this.wholeData[key][0];
         }else {
            this.singles[key] = 'none';
         }
      }
   }
}

class SingleValueArea {
   constructor() {
      this.descsCols = [document.querySelectorAll('section.desc')[0],
                        document.querySelectorAll('section.desc')[1],
                        document.querySelectorAll('section.desc')[2]];
      this.valuesCols = [document.querySelectorAll('section.values')[0],
                        document.querySelectorAll('section.values')[1],
                        document.querySelectorAll('section.values')[2]];
   }
   buildElements(singles) {
      setUpSingleValueElements(singles);
   }
}

class MultiValueArea {
   constructor() {
      this.descCols = [document.querySelectorAll('section.desc')[3],
                        document.querySelectorAll('section.desc')[4],
                        document.querySelectorAll('section.desc')[5],
                        document.querySelectorAll('section.desc')[6],
                        document.querySelectorAll('section.desc')[7]];
      this.valuesCols = [document.querySelectorAll('section.values')[3],
                        document.querySelectorAll('section.values')[4],
                        document.querySelectorAll('section.values')[5],
                        document.querySelectorAll('section.values')[6],
                        document.querySelectorAll('section.values')[7]];
   }
   buildElements(multis) {
      setUpMultiValueElements(multis);
   }
}

class App {
   constructor() {
      this.request = new Request();
      this.data = new DataManager();
      this.singleArea = new SingleValueArea();
      this.multiArea = new MultiValueArea();
   }

   reactButtonClick(type) {
      this.request = new RandomRequest(type);
      this.execDataPresentation();
   }

   async setLink(link, node) {
      node.innerText = null;
      const newLinkElement = document.createElement('a');
      node.appendChild(newLinkElement);
      this.data.wholeData = await this.getLinkData(link);
      (link.search('films') < 0) ? newLinkElement.innerText = this.data.wholeData.name : 
                                   newLinkElement.innerText = this.data.wholeData.title;
      newLinkElement.addEventListener('mouseup', this.execDataPresentation);
         
   }

   async getLinkData(link, reprocessing=false) {
      reprocessing ? this.request.tryCount += 1 : this.request.tryCount = 1;
      return fetch(link)
         .then(response => this.request.validateResponse(response))
         .then(data => {return data})
         .catch (error => this.request.handleError(error));
   }

   execDataPresentation() {
      this.data.process(this.data.wholeData);
      this.singleArea.buildElements(this.singles);
      this.multiArea.buildElements(this.multis);
   };
}

new App();



const linkStart = 'https://swapi.dev/api/';

let lastSingleAmount = 0;
let orderedKeyList;


const buildDataPresentation = (data) => {
   setUpSingleValueElements(singlesObject);
   setUpMultiValueElements(listsObject);
   writeDataOnElements(singlesObject, 'singles');
   writeDataOnElements(listsObject, 'lists');
}

const setUpSingleValueElements = (singlesObject) => {
   singlesObject.title ? UI.legend.innerText = singlesObject.title : UI.legend.innerText = singlesObject.name;
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
         UI.singleDescsColumn1.appendChild(descElement);
         UI.singleValuesColumn1.appendChild(valueElement);
      }else if ((elems) % 3 === 2) {
         UI.singleDescsColumn2.appendChild(descElement);
         UI.singleValuesColumn2.appendChild(valueElement);
      }else {
         UI.singleDescsColumn3.appendChild(descElement);
         UI.singleValuesColumn3.appendChild(valueElement);
      }
   }
}

const handleSuperfluousSingleElements = (singleAmountDiff) => {
   let length1 = UI.singleDescsColumn1.children.length;
   let length2 = UI.singleDescsColumn2.children.length;
   let length3 = UI.singleDescsColumn3.children.length;
   if (length1 + length2 + length3 <= 1) {
      return;
   }
   for (let diffCount = singleAmountDiff; diffCount < 0; diffCount++) {
      length1 = UI.singleDescsColumn1.children.length;
      length2 = UI.singleDescsColumn2.children.length;
      length3 = UI.singleDescsColumn3.children.length;
      if (length1 !== length2 || length2 !== length3) {
         shortenTallestColumn();
         continue;
         }
      removeSingleElements(diffCount);
   }
}

const shortenTallestColumn = () => {
   const descs = [UI.singleDescsColumn1, UI.singleDescsColumn2, UI.singleDescsColumn3];
   const vals = [UI.singleValuesColumn1, UI.singleValuesColumn2, UI.singleValuesColumn3];
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
      UI.singleDescsColumn1.removeChild(UI.singleDescsColumn1.lastChild);
      UI.singleValuesColumn1.removeChild(UI.singleValuesColumn1.lastChild);
   }else if (lastSingleAmount - diffCount % 3 === 2){
      UI.singleDescsColumn2.removeChild(UI.singleDescsColumn2.lastChild);
      UI.singleValuesColumn2.removeChild(UI.singleValuesColumn2.lastChild);
   }else {
      UI.singleDescsColumn3.removeChild(UI.singleDescsColumn3.lastChild);
      UI.singleValuesColumn3.removeChild(UI.singleValuesColumn3.lastChild);
   }
}


const removeCrawlClasses = () => {
   const singleValueColumns = [UI.singleValuesColumn1, UI.singleValuesColumn2, UI.singleValuesColumn3];
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
   const descElems = [UI.listDesc3, UI.listDesc2, UI.listDesc4, UI.listDesc1, UI.listDesc5];
   const valueElems = [UI.listValuesColumn3, UI.listValuesColumn2, UI.listValuesColumn4];
   valueElems.push(UI.listValuesColumn1, UI.listValuesColumn5);
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
   let AllUnderElems = [UI.listDesc1, UI.listDesc2, UI.listDesc3, UI.listDesc4, UI.listDesc5];
   AllUnderElems.push(UI.listValuesColumn1, UI.listValuesColumn2, UI.listValuesColumn3);
   AllUnderElems.push(UI.listValuesColumn4, UI.listValuesColumn5);
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
   if (String(value).slice(0, 22) !== linkStart) {
      node.innerText = value;
      try {
         if (value.length > 70) {
            node.classList.add('crawl');
         }
      }catch(error) {
         console.log('Error when setting crawl: ', error);
      }
   }else {
      new LinkRequest(value, node);
   }
}


UI.filmButton.addEventListener('mouseup', function() {new RandomRequest('films')});
UI.characterButton.addEventListener('mouseup', function() {new RandomRequest('people')});
UI.speciesButton.addEventListener('mouseup', function() {new RandomRequest('species')});
UI.planetButton.addEventListener('mouseup', function() {new RandomRequest('planets')});
UI.starshipButton.addEventListener('mouseup', function() {new RandomRequest('starships')});
UI.vehicleButton.addEventListener('mouseup', function() {new RandomRequest('vehicles')});