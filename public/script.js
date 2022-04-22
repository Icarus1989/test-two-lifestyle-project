let mainContainer = document.querySelector('#mainContainer');
let inputField = document.querySelector('#insertInput');
let inputContainer = inputField.parentElement;

let UrbanAreasCompleteList = [];

let arr = [];

// testing
document.documentElement.style.width = "100vh";
document.body.style.width = "100vh";
// testing

getCompleteListUrbanAreas(UrbanAreasCompleteList);
let menu = new Menu(inputField, mainContainer, '<i class="fa-solid fa-bars"></i>');
menu.createButton();
menu.createMenu();

inputContainer.style.top = mainContainer.clientHeight / 2 - inputContainer.clientHeight / 1.5 + 'px';

inputField.addEventListener('change', async (event) => {

  mainContainer.scrollTo(0, 0);
  inputContainer.animate([{
    transform: `translateY(-${mainContainer.clientHeight / 2 - inputContainer.clientHeight}px)`
  }], {
    duration: 1000,
    easing: 'ease',
    direction: 'normal',
    iteration: 1,
    fill: 'forwards'
  });
  searchCity(event.target);

});

async function retrievePixabay(name) {
  const url = `bkgImage/${name}`;
  const pixData = new RetrieveData(url);
  return pixResponse = await pixData.retrieve();
}

async function retrieveTeleportImage(name) {
  const telUrl = `bkgImage/${name}`;
  const telData = new RetrieveData(telUrl);
  const telResponse = await telData.retrieve();
  return telResponse["data"];
}

async function getCompleteListUrbanAreas(arr) {
  const url = `https://api.teleport.org/api/urban_areas`;
  const listData = new RetrieveData(url);
  const completeDataset = await listData.retrieve();
  const completeUAListTotal = completeDataset["data"]["_links"]["ua:item"];
  completeUAListTotal.map(async (elem) => {
    const data = new RetrieveData(elem["href"]);
    const retrieves = await data.retrieve();
    const uaName = await retrieves["data"]["_links"]["ua:identifying-city"]["name"]
    const ua_iso_alpha2 = await (retrieves["data"]["_links"]["ua:countries"][0]["href"]).slice(-3, -1)

    let uaObj = {
      name: uaName,
      iso_alpha2: ua_iso_alpha2
    }
    arr.push(uaObj);
  });
  return arr;
}

async function retrieveAlternativeCities(info, input) {
  inputField.value = '';
  inputField.placeholder = 'Enter a new city...';
  inputField.blur();
  let resultsCont = document.querySelector('#resultsContainer');
  let indication = new Indication(resultsCont.children[0], input);
  resultsCont.scrollTo(0, 0);
  if (document.querySelector('.saveBtn')) {
    document.querySelector('.saveBtn').remove();
  }
  if (document.querySelector('h2')) {
    disappearElement(document.querySelector('h2'), 0);
  }
  if (document.querySelector('.rank')) {
    disappearElement(document.querySelector('.rank'), 0);
  }
  disappearElement(document.querySelector('.menuBtn'), 0);

  let spinner = new Spinner(resultsCont);

  try {
    // inizio spinner

    indication.firstIndication();

    spinner.drawSpinner();

    let alternatesContainer = document.createElement('fieldset');
    let legend = document.createElement('legend');
    legend.textContent = 'Cities available for this Country:';
    alternatesContainer.append(legend);
    alternatesContainer.classList.add('alternatesContainer');

    let alternatives = new AlternativeCities(UrbanAreasCompleteList, info, input, alternatesContainer, resultsCont);
    let alternativesCities = await alternatives.createAlternatives();
    let alternativesButtons = await alternatives.createButtons();

    spinner.removeSpinner();
    indication.secondIndication();
    resultsCont.children[0].append(alternatesContainer);

    if (alternativesButtons > 10) {
      alternatives.bigContainer();
    }

    inputField.addEventListener('change', () => {
      disappearElement(alternatesContainer, 0).then(() => {
        if (document.querySelector('.descriptionBox')) {
          let appearGrid = new AppearElems('grid', 500, document.querySelector('.descriptionBox'), document.querySelector('.menuBtn'));
          appearGrid.show();
          let appearBlock = new AppearElems('block', 500, document.querySelectorAll('table')[0], document.querySelectorAll('table')[1]);
          appearBlock.show();
          let appearInline = new AppearElems('inline', 500, document.querySelector('h2'), document.querySelector('.rank'));
          appearInline.show();
        }
        indication.nullIndication();
      });
    });

    alternatesContainer.addEventListener('click', (event) => {
      if (event.target.tagName == 'BUTTON' && event.target !== document.querySelector('.downDirection')) {
        inputField.value = event.target.textContent;
        disappearElement(alternatesContainer, 0).then(() => {
          searchCity(inputField).then(async () => {
            let appearGrid = new AppearElems('grid', 500, document.querySelector('.descriptionBox'), document.querySelector('.menuBtn'));
            appearGrid.show();
            let appearBlock = new AppearElems('block', 500, document.querySelectorAll('table')[0], document.querySelectorAll('table')[1]);
            appearBlock.show();
            let appearInline = new AppearElems('inline', 500, document.querySelector('h2'), document.querySelector('.rank'));
            appearInline.show();
          });
        });
        indication.nullIndication();
      } else {
        return;
      }
    });

  } catch (error) {
    console.log(error);
    inputField.value = '';
    inputField.placeholder = 'Enter a new city...';
    inputField.blur();
    // INDICATION
    indication.thirdIndication();
    spinner.removeSpinner();
    inputField.addEventListener('change', () => {
      indication.nullIndication().then(() => {
        if (document.querySelector('.descriptionBox')) {
          let appearGrid = new AppearElems('grid', 500, document.querySelector('.descriptionBox'), document.querySelector('.menuBtn'));
          appearGrid.show();
          let appearBlock = new AppearElems('block', 500, document.querySelectorAll('table')[0], document.querySelectorAll('table')[1]);
          appearBlock.show();
          let appearInline = new AppearElems('inline', 500, document.querySelector('h2'), document.querySelector('.rank'));
          appearInline.show();
        }
      });
    });
  }
}

async function createDescription(state, globalContinent, rank, textbox, text, container) {
  let description = new Description(state, globalContinent, rank, textbox, text, container);
  let title = await description.createTitle();
  let textBox = await description.createText();
  let rankBox = await description.createRank();
}

function createDataTable(table, jsonData, container) {
  if (table) {
    for (let i = 0; i < jsonData.length; i++) {
      table.querySelectorAll('th')[i].textContent = jsonData[jsonData.indexOf(jsonData[i])]["name"];
      table.querySelectorAll('td')[i].textContent = `${(jsonData[jsonData.indexOf(jsonData[i])]["score_out_of_10"]).toFixed(1)} / 10`;
    }
  } else {
    let table = document.createElement('table');
    let tbody = document.createElement('tbody');
    for (let i = 0; i < jsonData.length; i++) {
      let tr = document.createElement('tr');
      tbody.append(tr);
      let th = document.createElement('th');
      th.textContent = jsonData[jsonData.indexOf(jsonData[i])]["name"];
      tr.append(th);
      let td = document.createElement('td');
      td.textContent = `${(jsonData[jsonData.indexOf(jsonData[i])]["score_out_of_10"]).toFixed(1)} / 10`;
      tr.append(td);
    }

    table.append(tbody);
    container.append(table);
    table.firstElementChild.children[0].firstElementChild.style.borderRadius = '18px 0px 0px 0px';
    table.firstElementChild.children[0].lastElementChild.style.borderRadius = '0px 18px 0px 0px';
    table.firstElementChild.children[table.firstElementChild.children.length - 1].firstElementChild.style.borderRadius = '0px 0px 0px 18px';
    table.firstElementChild.children[table.firstElementChild.children.length - 1].lastElementChild.style.borderRadius = '0px 0px 18px 0px';
  }
}

function createSaveBtn(container) {
  let saveBtn = document.createElement('button');
  saveBtn.classList.add('saveBtn');
  saveBtn.insertAdjacentHTML('afterbegin', '<i class="fa-solid fa-star"></i>');
  container.append(saveBtn);
}

function loadImage(image, container, resultsContainer, path) {

  if (image) {
    // image.delete();
    image.style.width = "250vw";
    image.style.height = (container.clientHeight * 1.01) + "px";;
    if (container.clientHeight < container.clientWidth) {
      image.style.width = "100vw";
      image.style.height = container.clientHeight + "px";
      image.style.left = "-10%";
      image.style.top = "-50vh";
    } else {
      image.style.position = "relative";
      image.style.left = "-10%";
      image.style.bottom = "0px";
    }

    const options = {
      method: 'GET',
      cache: 'no-cache'
    }

    try {
      image.src = '';
      setTimeout(async () => {
        // image.src = '';
        let response = await fetch(path, options);
        let test = await response.blob();
        let urlObj = URL.createObjectURL(await test);
        image.src = await urlObj;
        // let image = new Image(test);
        // image.width = '300px';
        // console.log(image);
        // console.log(test);
        // image.src = await path;
      }, 500);
      image.addEventListener('load', () => {
        // image.src = await path;
        // console.log('load...');
        container.append(image);
      });
    } catch {
      console.log(error);
    }

    resultsContainer.scrollTo(0, 0);

    resultsContainer.addEventListener('scroll', (event) => {
      image.style.left = (-((event.target.scrollLeft / (event.target.scrollWidth - event.target.clientWidth)) * 100)) - 10 + '%';
    });
  } else {
    let image = document.createElement('img');
    image.style.width = "250vw";
    image.style.height = (container.clientHeight) + "px";

    if (container.clientHeight < container.clientWidth) {
      image.style.width = "100vw";
      image.style.height = container.clientHeight + "px";
      image.style.top = "-50vh";
      image.style.left = "-10%";
    } else {
      image.style.position = "relative";
      image.style.left = "-10%";
      image.style.bottom = "0px";
    }
    image.src = '';

    try {
      setTimeout(async () => {
        image.src = await path;
      }, 1200);

      image.addEventListener('load', () => {
        // image.src = await path;
        // console.log('load...');
        container.append(image);
      });
    } catch {
      setTimeout(async () => {
        image.src = await path;
      }, 1200);

      image.addEventListener('load', () => {
        // image.src = await path;
        // console.log('load...');
        container.append(image);
      });
    }

    resultsContainer.addEventListener('scroll', (event) => {
      image.style.left = (-((event.target.scrollLeft / (event.target.scrollWidth - event.target.clientWidth)) * 100)) - 10 + '%';
    });
  }
}

async function searchCity(input) {
  let cityData = new CityData(input, mainContainer);
  try {
    let info = await cityData.cityInfo();
    try {
      let queryResponse = await cityData.cityQueryDb();
      let infoScores;
      if (queryResponse.status == 'success' && queryResponse.action == 'Not in database') {
        infoScores = await cityData.notInDatabase();
      } else if (queryResponse.status == 'success' && queryResponse.action == 'read from db') {
        infoScores = await cityData.inDatabase();
      }
      cityData.createElements(infoScores);
    } catch {
      cityData.createAlternatives(info);
    }
  } catch {
    cityData.somethingWrong();
  }

}

async function disappearElement(elem, delay) {
  let opacity = 1.0;
  return await new Promise((resolve) => {
    setTimeout(() => {
      let interval = setInterval(() => {
        opacity = opacity - 0.1;
        elem.style.opacity = opacity;
        if (opacity < 0) {
          clearInterval(interval);
          elem.style.display = 'none';
          // elem.remove();
        }
      }, 20);
    }, delay);
    resolve();
  });
}

async function appearElement(elem, delay, display) {
  let appearGrid = new AppearElems(display, delay, elem);
  appearGrid.show();
}

function createNavButton(direction, container, position) {
  let directionBtn = document.createElement('button');
  directionBtn.style.placeItems = 'center';
  directionBtn.classList.add('directionBtn');
  directionBtn.style.position = position;

  switch (direction) {
    case 'left':
      directionBtn.style.width = '5vw';
      directionBtn.style.height = '50vh';
      directionBtn.style.left = '0%';
      directionBtn.style.borderRadius = '0px 10px 10px 0px';
      directionBtn.classList.add('leftDirection');
      directionBtn.insertAdjacentHTML('afterbegin', '<i class="fa-solid fa-chevron-left"></i>');
      break;
    case 'right':
      directionBtn.style.width = '5vw';
      directionBtn.style.height = '50vh';
      directionBtn.style.right = '0%';
      directionBtn.style.borderRadius = '10px 0px 0px 10px';
      directionBtn.classList.add('rightDirection');
      directionBtn.insertAdjacentHTML('afterbegin', '<i class="fa-solid fa-chevron-right"></i>');
      break;
    case 'down':
      directionBtn.style.width = container.clientWidth + 'px';
      directionBtn.style.height = container.clientHeight / 11 + 'px';
      directionBtn.classList.add('downDirection');
      directionBtn.insertAdjacentHTML('afterbegin', '<i class="fa-solid fa-chevron-down"></i>');
      break;
    case 'up':
      directionBtn.style.width = '50vw';
      directionBtn.style.height = '5vh';
      directionBtn.style.left = '0%';
      directionBtn.insertAdjacentHTML('afterbegin', '<i class="fa-solid fa-chevron-up"></i>');
      break;
  }
  container.append(directionBtn);
}

function setInfoButtons(scrollTarget) {
  createNavButton('left', mainContainer, 'fixed');
  createNavButton('right', mainContainer, 'fixed');
  let leftBtn = document.querySelector('.leftDirection');
  let rightBtn = document.querySelector('.rightDirection');

  scrollTarget.addEventListener('scroll', (event) => {

    if (event.target.scrollLeft >= event.target.children[0].clientWidth) {
      leftBtn.style.display = 'grid';
    } else {
      leftBtn.style.display = 'none';
    }

    if (event.target.scrollLeft >= (event.target.children[0].clientWidth + event.target.children[1].clientWidth)) {
      rightBtn.style.display = 'none';
    } else {
      rightBtn.style.display = 'grid';
    }
  });

  mainContainer.addEventListener('click', (event) => {
    if (event.target == rightBtn || event.target.contains(rightBtn.querySelector('i'))) {
      scrollTarget.scrollBy({
        top: 0,
        left: scrollTarget.children[0].clientWidth,
        behavior: 'smooth'
      });

    }
    if (event.target == leftBtn || event.target.contains(leftBtn.querySelector('i'))) {
      scrollTarget.scrollBy({
        top: 0,
        left: -(scrollTarget.children[0].clientWidth),
        behavior: 'smooth'
      });
    }
  });
}

function createPointButtons(container) {
  let pointButtons = new PointButtons(container);
  pointButtons.createButtons();
}

async function createIconBtn(container, icon) {
  let menuBtn = document.createElement('button');
  menuBtn.classList.add('menuBtn');
  menuBtn.insertAdjacentHTML('afterbegin', icon);
  container.append(menuBtn);
}

// 

// forse inutile ai fini pratici
window.addEventListener('resize', () => {
  mainContainer.style.height = '100vh';
  document.querySelector('#imgContainer').style.width = '100vw';
  document.querySelector('#imgContainer').style.height = '100vh';
  document.querySelector('#secondImgContainer').style.width = '100vw';
  document.querySelector('#secondImgContainer').style.height = '100vh';
  document.querySelector('#imgContainer').querySelector('img').style.height = '100vh';
  document.querySelector('#secondImgContainer').querySelector('img').style.height = '100vh';
});

// document.body.addEventListener('scroll', () => {
//   mainContainer.scrollTo(0, 0);
// });
// forse inutile ai fini pratici