import 'core-js/es/array';
import 'regenerator-runtime/runtime'
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const mapBox = document.getElementById('map');

// const locations = JSON.parse(document.getElementById('map').dataset.locations);

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

document.querySelector('.form--login').addEventListener('submit', e => {
  e.preventDefault(); //Prevents form from loading any other page
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});


