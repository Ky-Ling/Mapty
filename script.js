'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


class Workout {
  data = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in minus
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;

    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calSpeed();
  }

  calSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);

    return this.speed;
  }
}

// const run1 = new Running([23, -34], 5.3, 12, 178);
// const cyc1 = new Cycling([56, -64], 6.5, 23, 198);
// console.log(run1, cyc1);

///////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Constructor method is called immediately when a new object is created from this class.
    this._getPosition();

    // Normally, _newWorkout will point to the form, it is used for a event handler function, but this time, we wanna this
    //  function point to object itself, so we use bind.
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position.');
        }
      );
  }

  _loadMap(position) {
    // console.log(position);

    const { latitude } = position.coords;
    // const latitude = position.coords.altitude;
    const longitude = position.coords.longitude;
    // console.log(latitude, longitude);
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map', {
      center: [40, -80],
      zoom: 16,
    }).setView(coords, 13);
    // console.log(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    // This _showForm function will be set to the object onto which event handler is attached
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

    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // 1: Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    
    
    // 2: If workout running, crate running object
    if (type === "running") {
      
      const cadence = +inputCadence.value;
      
      // 3: Check if data is valid
      // if(!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence)) 
      if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence))
        return alert("Inputs have to be positive numbers!!")

      workout = new Running([lat, lng], distance, cadence);

    }

    // 4: If workout cycling, create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;

      if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration))
      return alert("Inputs have to be positive numbers!!")

      workout = new Cycling([lat, lng], distance, elevation);

    }



    // 5: Add new object to workout array
    this.#workouts.push(workout);

    // 6: Render workout on the map as marker
    // console.log(workout);
    this.renderWorkoutMarker(workout);

    // console.log(this);
    
    // 7: Render workout on list



    // 8: Hide form and clear input fields
    inputDistance.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    // console.log(mapEvent);
  }
    renderWorkoutMarker(workout) {
      L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent("Workout")
      .openPopup();
    }
}

const app = new App();
