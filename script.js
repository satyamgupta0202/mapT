'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map, mapEvent;

class workout {
  date = new Date();
  id = String(Date.now()).slice(-10); //string par hi lagate hai slice method
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}
class running extends workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.eleva = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class cycling extends workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.time / 60);
    return this.speed;
  }
}

const run1 = new running([39, 12], 100, 600, 500);
const cycle1 = new running([39, 12], 100, 600, 100);
console.log(run1, cycle1);

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    ////////////////////////////////////////////////////////////////
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Position Not found');
        }
      );
  }

  _loadMap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const positiveInput = (...inputs) => inputs.every(inp => inp > 0);
    //Get data from the field
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    //check validation

    //If workout is cycling proceed for cycling
    if (type === 'cycling') {
      const elevations = +inputElevation.value;
      //check ifValid
      if (
        !validInput(distance, duration, elevations) ||
        !positiveInput(distance, duration)
      )
        return alert('Invalid vro!!!!!');
      workout = new cycling([lat, lng], distance, duration, elevations);
      this.#workouts.push(workout);
    }
    console.log(workout);

    // if workout is running proceed for running
    if (type === 'running') {
      const cadence = +inputElevation.value;
      if (
        !validInput(distance, duration, cadence) ||
        !positiveInput(distance, duration)
      )
        return alert('Invalid vro!!!!!');
      workout = new running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
    }
    console.log(workout);

    //add new object in workout

    // render that on the map
    this.renderWorkoutMarker(workout);
    //render workout on the list

    //Clear Fields' + hide the workout list
    inputDistance.value =
      inputCadence.value =
      inputElevation.value =
      inputDuration.value =
        '';
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('Workout!!')
      .openPopup();
  }
}

const app = new App();
