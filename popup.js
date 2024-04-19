// Make an API request to fetch all brands data

let searchBoolean = false;
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (chrome.runtime.lastError) {
    console.error("Error querying tabs:", chrome.runtime.lastError.message);
    return;
  }

  if (tabs && tabs.length > 0) {
    const currentTabUrl = tabs[0].url;
    const apiUrl = currentTabUrl.replace('http://127.0.0.1', 'http://127.0.0.1/api')

    // Fetch data from the current tab URL
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        return response.json();
      })

      // .then(data => {
      //   let brandsArray = [];
      //   // Check if 'data' contains a 'data' property and if it's an array
      //   if (!Array.isArray(data.data)) {
      //     brandsArray.push(data.data);
      //     const brands = brandsArray;
      //     displayBrands(brands);
      //   } else {
      //     const brands = data.data;
      //     displayBrands(brands);
      //   }
      // })

      .then(data => {
        const brands = data.data
        if (apiUrl.length === 32) {
          displayExtensionMenu();
        }
        else {
          let brandsArray = [];
          if (!Array.isArray(data.data)) {
            brandsArray.push(data.data);
            const brands = brandsArray;
            displayBrands(brands);
          } else {
            const brands = data.data;
            displayBrands(brands);
          }
        }
      })

      .catch(error => {
        console.error('Error fetching brands:', error);
      });

  } else {
    console.error('No active tabs found');
  }
});

function displayBrands(brands) {
  const popupContent = document.getElementById('popup');
  // popupContent.innerHTML = '';

  brands.forEach(brand => {
    //Creates a div that will contain each brand element
    const brandDiv = document.createElement('div');
    brandDiv.classList.add('brands');

    //-----------------------------------------------------------------------

    //----Brand Name and Logo----
    const brandInfo = document.createElement('div');
    const brandLogo = document.createElement('img');
    brandLogo.src = 'http://127.0.0.1' + brand.brand_logo;
    brandLogo.classList.add('brand-logo');
    brandInfo.appendChild(brandLogo);

    const brandName = document.createElement('div');
    brandName.textContent = brand.brand_name;
    brandInfo.appendChild(brandName);
    brandInfo.classList.add('brand-heading');
    brandDiv.appendChild(brandInfo);

    //-----------------------------------------------------------------------

    // ----Brand Rating----
    const brandRating = document.createElement('div');

    //Creates the title
    const ratingTitle = document.createElement('h1')
    ratingTitle.textContent = 'Brand Rating'
    brandRating.appendChild(ratingTitle);

    //CREATING THE GAUGE CHART
    const canvas = document.createElement('canvas');
    canvas.id = 'gaugeChart';
    canvas.width = 200;
    canvas.height = 180;

    // Create container div and append canvas to it
    const container = document.createElement('div');
    container.id = 'gaugeChartContainer';
    brandRating.appendChild(canvas);

    // Append container to body
    brandRating.appendChild(container);

    // Get canvas context
    const ctx = canvas.getContext('2d');

    // Define gauge properties
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2 + 10;

    const radius = (canvas.width, canvas.height) / 2
    const arcWidth = 30;

    const startAngle = (1) * Math.PI;
    const endAngle = (2) * Math.PI;

    const startAngleLow = (1) * Math.PI;
    const endAngleLow = (1.35) * Math.PI;

    const startAngleMid = (1.35) * Math.PI;
    const endAngleMid = (1.65) * Math.PI;

    const startAngleEnd = (1.65) * Math.PI;
    const endAngleEnd = (2) * Math.PI;

    //CREATING THE GAUGE ARC

    //Draws the stroke around gauge arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - arcWidth / 2, startAngle, endAngle);
    ctx.lineWidth = arcWidth + 3;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draws the low/red arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - arcWidth / 2, startAngleLow, endAngleLow);
    ctx.lineWidth = arcWidth;
    ctx.strokeStyle = '#EA4335';
    ctx.stroke();

    // Draws the mid/orange arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - arcWidth / 2, startAngleMid, endAngleMid);
    ctx.lineWidth = arcWidth;
    ctx.strokeStyle = '#FBBC05';
    ctx.stroke();

    // Draws the end/green arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - arcWidth / 2, startAngleEnd, endAngleEnd);
    ctx.lineWidth = arcWidth;
    ctx.strokeStyle = '#34A853';
    ctx.stroke();

    //CREATING THE NEEDLE

    // Defines needle values
    const needleLength = 70;
    const angle = startAngle + (endAngle - startAngle) * (brand.rating / 100);
    const needleX = centerX + Math.cos(angle) * needleLength;
    const needleY = centerY + Math.sin(angle) * needleLength;

    console.log(needleX, needleY)

    // Draws needle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleX, needleY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();


    // CREATING THE TICK

    //Defines tick values
    let textNum = 10;
    let numTicks = 10;
    let tick = 10;
    let tickPos1 = 50
    let tickPos2 = 65

    //Loop for creating each tick
    for (let i = 0; i < numTicks - 1; i++) {

      //Finds the angle that positions the tick onto the gauge
      const tickAngle = startAngle + (endAngle - startAngle) * (tick / 100);
      const tickX = centerX + Math.cos(tickAngle) * tickPos1
      const tickY = centerY + Math.sin(tickAngle) * tickPos1

      //Finds the angle that allows the tick to point towards the center of the canvas
      const tickEndX = centerX + Math.cos(tickAngle) * (tickPos2);
      const tickEndY = centerY + Math.sin(tickAngle) * (tickPos2);

      //Draws the tick
      ctx.beginPath();
      ctx.moveTo(tickX, tickY);
      ctx.lineTo(tickEndX, tickEndY)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.stroke();

      ctx.textAlign = "center"
      ctx.fillText(textNum, tickX, tickY + 8);
      //Before the loop resets, 10 is added to each value for the next tick

      textNum = textNum + 10
      tick = tick + 10
    }

    // Draws the bottom stroke of the gauge
    ctx.beginPath();
    ctx.moveTo(8, 100);
    ctx.lineTo(canvas.width - 8, 100);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    //Displays the rating number text
    ctx.font = " 30px Arial";
    ctx.textAlign = 'center';
    ctx.fillText(brand.rating + "/100", centerX, centerY + 55);

    const ratingResult = document.createElement('h1')
    const ratingText = document.createElement('p')
    if (brand.rating <= 33) {
      ratingResult.style.color = "red";
      ratingResult.textContent = "Bad";
      ratingText.textContent = "This brand shows signs of poor sustainability.";

    }
    else if (brand.rating > 33 && brand.rating < 65) {
      ratingResult.style.color = "orange";
      ratingResult.textContent = "Medicore";
      ratingText.textContent = "This brand shows some signs of sustainability, but still has room for improvement.";
    }
    else {
      ratingResult.style.color = "green";
      ratingResult.textContent = "Good";
      ratingText.textContent = "This brand shows signs of good sustainabilty.";
    }
    //adds styling classes for css
    brandRating.classList.add('brand-rating');
    ratingTitle.classList.add('brand-rating-title');
    ratingResult.classList.add('brand-rating-result');
    ratingText.classList.add('brand-rating-p');
    // rating.classList.add('rating');

    brandRating.appendChild(ratingResult);
    brandRating.appendChild(ratingText);
    brandDiv.appendChild(brandRating);

    //-----------------------------------------------------------------------

    //----Brand Country----
    const brandCountry = document.createElement('div');
    brandCountry.classList.add('brand-country');

    //Creates the title
    const countryTitle = document.createElement('h1')
    countryTitle.textContent = 'Source Country';
    brandCountry.appendChild(countryTitle);

    //Country Flags - uses the Flagpedia pubic api
    const countryFlag = document.createElement('img');
    if (brand.origin_country == 'China') {
      countryFlag.src = 'https://flagcdn.com/w160/cn.png'
    }
    else if (brand.origin_country == 'Vietnam') {
      countryFlag.src = 'https://flagcdn.com/w160/vn.png'
    }
    else if (brand.origin_country == 'Indonesia') {
      countryFlag.src = 'https://flagcdn.com/w160/id.png'
    }
    else if (brand.origin_country == 'Malasia') {
      countryFlag.src = 'https://flagcdn.com/w160/my.png'
    }
    else if (brand.origin_country == 'Cambodia') {
      countryFlag.src = 'https://flagcdn.com/w160/kh.png'
    }
    else if (brand.origin_country == 'Turkey') {
      countryFlag.src = 'https://flagcdn.com/w160/tr.png'
    }
    countryFlag.classList.add('brand-country-flag');
    brandCountry.appendChild(countryFlag);

    //Country Name
    const country = document.createElement('p')
    country.textContent = brand.origin_country;
    brandCountry.appendChild(country);

    const countryText = document.createElement('p')
    countryText.textContent = "This brand's main source of materials come from this country.";
    countryText.classList.add('brand-country-p');
    brandCountry.appendChild(countryText);

    brandDiv.appendChild(brandCountry);

    //-----------------------------------------------------------------------

    //----Brand Ethical----
    const brandEthical = document.createElement('div');
    brandEthical.classList.add('brand-ethical');

    //Creates the title
    const ethicalTitle = document.createElement('h1')
    ethicalTitle.textContent = 'Summary'
    brandEthical.appendChild(ethicalTitle)

    const ethicalResult = document.createElement('h4')
    const ethicalText = document.createElement('p')
    if (brand.ethical == 'Yes' && brand.rating >= 65) {
      ethicalResult.textContent = 'This brand is ethical';
      ethicalText.textContent = 'We recommend purchasing from this brand.';
    } 
    else if(brand.ethical == 'Yes' && brand.rating < 65 ){
      ethicalResult.textContent = 'This brand is somewhat ethical';
      ethicalText.textContent = 'We recommend to be cautious when purchasing from this brand.';
    }
    else if(brand.ethical == 'No' && brand.rating < 34 ){
      ethicalResult.textContent = 'This brand is NOT ethical';
      ethicalText.textContent = 'We recommend not purchasing from this brand.';
    }
    else if(brand.ethical == 'No' && brand.rating < 65 ){
      ethicalResult.textContent = "This brand isn't very ethical";
      ethicalText.textContent = 'We recommend to be cautious when purchasing from this brand.';
    }
    
    brandEthical.appendChild(ethicalResult)
    brandEthical.appendChild(ethicalText)
    brandDiv.appendChild(brandEthical);


    //Brings everything within 'brandDiv' into popupContent
    popupContent.appendChild(brandDiv);
  });

}
//-----------------------------------------------------------------------
{
  function displayExtensionMenu() {
    const popupContent = document.getElementById('popup');
    const extensionMenu = document.createElement('div')

    const menuHeading = document.createElement('h1')
    menuHeading.textContent = "Welcome to Ecognito!"
    extensionMenu.appendChild(menuHeading);

    const menuSubHeading = document.createElement('h2')
    menuSubHeading.textContent = "This browser extension gives an ethical insight on some of the top brands."
    extensionMenu.appendChild(menuSubHeading);

    const menuText = document.createElement('p')
    menuText.textContent = "Please select a supported brand from our website."
    extensionMenu.appendChild(menuText);


    extensionMenu.classList.add('extension-menu');
    popupContent.appendChild(extensionMenu);
  };
}

