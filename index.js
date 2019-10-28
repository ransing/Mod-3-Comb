url = "http://localhost:3000/trains"; //*  get all trains
let ulList = document.getElementById("list");
let sideBar = document.getElementById("mySidebar");

fetch(url)
  .then(r => r.json())
  .then(trains => {
    // debugger;

    trains.forEach(train => {
      // *  put trains in sidebar
      sideBar.innerHTML += `
          <div class="w3-bar-block">
          <ul id="trains-list">
          <li data-id="${train.id}" id="train-li">${train.name}</li>
          </ul>
          </div>
        `;
    });
  });
let stationsDiv = document.getElementById("stations-div");
sideBar.addEventListener("click", evt => {
  // ! click to see train stops and other info show up
  if (evt.target.id === "train-li") {
    let id = evt.target.dataset.id;
    fetch(`http://localhost:3000/trains/${id}`) //get specific train
      .then(res => res.json())
      .then(train => {
        let stopsList = document.getElementById("stops-list");
        let stopColumn = document.getElementById("stopBlock");
        stationsDiv.innerHTML = null;
        train.stops.forEach(stop => {
          // ! list existing stops of that train
          let stopLi = document.createElement("LI");
          stopLi.innerHTML = "";
          stopLi.innerHTML = `${stop.time} - ${stop.station_name}`;
          stopLi.dataset.id = stop.id;
          stopLi.id = `li-${stop.id}`;
          // stationsDiv.innerHTML = ""
          stationsDiv.appendChild(stopLi); //! puts stops in stationsDiv
          stopLi.addEventListener("click", evt => {
            if (evt.target.dataset.id === `${stop.id}`) {
              // debugger
              let editForm = document.createElement("form"); //form pops up when you click
              editForm.id = "edit-form";
              // ! from the stops in the stationsDiv -> creates from
              editForm.innerHTML = "";
              editForm.innerHTML = `
                <input name = "newTime" value=${stop.time} />
                <div id = "updateDiv">
                <input data-id = "update" id = "updateStop" type="submit" value = "update" />
                </div>
                <div id = "deleteDiv">
                <button name = "delete" id = "delete-stop" type="submit" value="Delete">Delete</button>
                </div>
              `;
              let liStop = document.getElementById(
                `li-${evt.target.dataset.id}`
              );
              liStop.append(editForm);
              let upButton = document.getElementById("updateDiv");
              let delButton = document.getElementById("delete-stop");

              delButton.addEventListener("click", evt => {
                if (evt.target.id === "delete-stop")
                  // console.log("delete");
                  fetch(
                    `http://localhost:3000/stops/${evt.target.parentElement.parentElement.parentElement.dataset.id}`,
                    {
                      method: "DELETE" // or 'PUT'
                    }
                  );
                // debugger
                evt.target.parentElement.parentElement.parentElement.remove();
              });

              editForm.addEventListener("submit", evt => {
                //* update or submit click
                evt.preventDefault();
                // debugger
                if (
                  // evt.target.id === "edit-form" &&
                  evt.target.children[1].id === "updateDiv" &&
                  evt.target.id !== "delete-stop"
                ) {
                  console.log("update");
                  // debugger
                  fetch(
                    `http://localhost:3000/stops/${evt.target.parentElement.dataset.id}`,
                    {
                      method: "PATCH", // or 'PUT'
                      body: JSON.stringify({
                        time: `${evt.target.newTime.value}`
                      }), // data can be `string` or {object}!
                      headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                      }
                    }
                  )
                    .then(r => r.json())
                    .then(r => {
                      // debugger
                      console.log(r);
                      // debugger;
                      let updatedTime = `${evt.target.newTime.value} - ${stop.station_name}`;
                      // debugger
                      let oldLi = evt.target.parentElement;
                      oldLi.innerText = "";
                      oldLi.innerText += updatedTime;
                    });
                }
              });
            }
          });
        });
        let stationArray = train.stations_array;
        let select = document.getElementById("train-Array");
        let nothing = "";
        select.append(nothing);
        select.innerHTML = `
                      <ul>
                      <li id = "trainHelp" data-id = ${train.id}> ${train.name} </li>
                      </ul>
                      <select id = "stations-Dropdown">  
                      </select>
                      <input id='btn-create' type="submit" value='Create Stop'></input>

                    `;
        // debugger

        let stationsDropdown = document.getElementById("stations-Dropdown");
        stationsDropdown.length = 0;

        let defaultStation = document.createElement("stationOption");
        defaultStation.text = "Choose Station";

        stationsDropdown.append(defaultStation);
        stationsDropdown.selectedIndex = 0;

        const stationsUrl = "http://localhost:3000/stations";

        fetch(stationsUrl)
          .then(r => r.json())
          .then(r => {
            console.log(r);
            // debugger
            let station = r[0];
            for (let i = 0; i < r.length; i++) {
              stationOption = document.createElement("option");
              stationOption.text = r[i].name;
              stationOption.value = r[i].id;
              stationsDropdown.append(stationOption);
            }
          });

        btnCreate = document.getElementById("btn-create"); // creating from dropdown
        btnCreate.addEventListener("click", evt => {
          if (evt.target.id === "btn-create") {
            let newTrainForm = document.createElement("form");
            console.log(evt);
            // newTrainFrom.id = "new-train-form"
            newTrainForm.dataset.id = evt.target.id;
            newTrainForm.innerHTML = " ";
            newTrainForm.innerHTML = `
                <input name = "createStop" value="enter time"" />
                <input type="submit" value = "create" /> 
              `;

            // debugger
            let existingStation = evt.target.parentElement;
            existingStation.id = evt.target.id;
            existingStation.append(newTrainForm);
            // ! Create
            newTrainForm.addEventListener("submit", evt => {
              // debugger
              evt.preventDefault();
              if (evt.target.tagName === "FORM") {
                // debugger
                fetch("http://localhost:3000/stops", {
                  method: "POST", // or 'PUT'
                  body: JSON.stringify({
                    time: evt.target.parentElement.querySelector(
                      'input[name="createStop"]'
                    ).value,
                    train_id: evt.target.parentElement
                      .querySelector('input[name="createStop"]')
                      .parentElement.parentElement.querySelector("#trainHelp")
                      .dataset.id,
                    station_id: parseInt(
                      evt.target.parentElement.querySelector(
                        "#stations-Dropdown"
                      ).value
                    )
                  }), // data can be `string` or {object}!
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                  }
                })
                  .then(r => r.json())
                  .then(r => {
                    // TODO: REPLACE WITH THE SAME FUNCTIONALITY AS LINE 48
                    let stopLi = document.createElement("LI");
                    stopLi.id = r.id;
                    stopLi.innerHTML = `${r.time} - ${r.station_name}`;

                    stationsDiv.appendChild(stopLi);
                    // debugger
                  });
              }
            });
          }
        });

        for (var i = 0; i < stationArray.length; i++) {
          //looping through existing stations
          var opt = document.createElement("option");
          opt.innerHTML = stationArray[i]["name"];
          opt.value = stationArray[i]["name"];
          opt.name = "Station_name";
          opt.id = stationArray[i]["station_id"];
          // console.log(stationArray);
          select.appendChild(opt);
          // debugger
        }

        select.addEventListener("click", evt => {
          //click over the existing stations to create new stop
          // if (evt.target.dataset.id = )
          // console.log(evt);
          // debugger
          //! creating stop from clicking on existing stations
          if (evt.target.tagName === "OPTION") {
            let newTrainForm = document.createElement("form");
            console.log(evt);
            // newTrainFrom.id = "new-train-form"
            newTrainForm.dataset.id = evt.target.id;
            newTrainForm.innerHTML = null;
            newTrainForm.innerHTML = `
              <input name = "createStop" value="HH:MM"" />
              <input type="submit" value = "create" /> 
            `;

            // debugger
            let existingStation = evt.target.parentElement;
            existingStation.id = evt.target.id;
            // existingStation.innerHTML = null
            existingStation.append(newTrainForm);
            // debugger
            newTrainForm.addEventListener("submit", evt => {
              // debugger
              // debugger
              evt.preventDefault();
              if (evt.target.tagName === "FORM") {
                // debugger
                fetch("http://localhost:3000/stops", {
                  method: "POST", // or 'PUT'
                  body: JSON.stringify({
                    time: evt.target.parentElement.querySelector(
                      'input[name="createStop"]'
                    ).value,
                    train_id: evt.target.parentElement
                      .querySelector('input[name="createStop"]')
                      .parentElement.parentElement.querySelector("#trainHelp")
                      .dataset.id,
                    station_id: parseInt(
                      evt.target.parentElement.querySelector(
                        'input[name="createStop"]'
                      ).parentElement.dataset.id
                    )
                  }), // data can be `string` or {object}!
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                  }
                })
                  .then(r => r.json())
                  .then(r => {
                    let stopLi = document.createElement("LI");
                    stopLi.innerHTML = `${r.time} - ${r.station_name}`;

                    stationsDiv.appendChild(stopLi);
                    // debugger
                  });
              }
            });
          }
        });
      });
  }
});

// * Eric said no to refresh page button

let refreshBtn = document.getElementById("btn-refresh");
let refreshSidebar = document.getElementById("refreshDiv");
let sideBarx = document.getElementById("mySidebar");
sideBarx.addEventListener("click", evt => {
  if (evt.target.id === "btn-refresh") {
    let empty = "";
    let select = document.getElementById("train-Array");
    stationsDiv.innerHTML = empty;
    select.innerHTML = empty;
  }
});

//* real-time time

startTime();
function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById("datetime").innerHTML = h + ":" + m + ":" + s;
  var t = setTimeout(startTime, 500);
}
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  } // add zero in front of numbers < 10
  return i;
}

// function display_ct() {
// var dt = new Date()
// document.getElementById('datetime').innerHTML = dt.toLocaleTimeString();
// display_c();

//   function display_c(){
//   var refresh=1000; // Refresh rate in milli seconds
//   setTimeout('display_ct()',refresh)
//   }
//  }

//  var dt = new Date();
//  function display_c(){var refresh = 1000; mytime=setTimeout('display_ct()',refresh) }
//  document.getElementById("datetime").innerHTML = dt.toLocaleTimeString(); display_c()
