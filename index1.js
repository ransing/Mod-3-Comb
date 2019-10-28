let formContainer = document.getElementById("form-container");
let formContainerDropdown = document.getElementById("form-container-dropdown");
url = "http://localhost:3000/trains"; //*  get all trains
let ulList = document.getElementById("list");
let sideBar = document.getElementById("mySidebar");
// let newArray = [{ 
//   name: "Rei"
// }, 
// {
//   name: "Leizl"
// }]

// let newArrayLocation = document.getElementById("mySidebar")
// for(let i = 0; i < newArray.length; i++){
// let name = document.createElement("BUTTON")
// name.className = "test";
// name.innerHTML += newArray[i].name;

// newArrayLocation.appendChild(name)
// }

// newArrayLocation.addEventListener("click", (evt) => {

//   if(evt.target.className === "test"){
//   fetch("http://localhost:3000/trains",{
//     method: 'POST',
//     'body': JSON.stringify({
//       name: evt.target.innerText
//     }),
//     headers:{
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//     }
//   })
//   .then(r=>r.json())
//   .then(r=>{
//     // let newTrain = document.createElement("LI")
//     // newTrain.innerText = r.name;
//     // newTrain.dataset.id = r.id;
//     // newTrain.id = "train-li"
//     // sideBar.append(newTrain)
    
//     // debugger 
//     sideBar.innerHTML += 


//     `
//     <div class="w3-bar-block">
//           <ul id="trains-list">
//           <li  data-id = "${r.id}" id="train-li">${r.name}</li>
//           </ul>
//           </div>
//     `
//   }
//     )



//   }
// })


fetch(url)
  .then(r => r.json())
  .then(trains => {
    // debugger;
    //!populating the list of trains in the sidebar
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
let stationsDiv = document.getElementById("stations-div");  //! where stops go 
sideBar.addEventListener("click", evt => {                          //! EL-1
  // ! click to train stops and other info show up
  if (evt.target.id === "train-li") {
    // debugger;
    formContainer.innerHTML = "";
    formContainerDropdown.innerHTML = "";
    let id = evt.target.dataset.id;
    fetch(`http://localhost:3000/trains/${id}`) //get specific train
      .then(res => res.json())
      .then(train => {
        let stopsList = document.getElementById("stops-list");
        let stopColumn = document.getElementById("stopBlock");
        stationsDiv.innerHTML = "";
        train.stops.forEach(stop => {
          // ! list existing stops of that train along with the station name 
          let stopLi = document.createElement("LI");  //! each li with the stop info
          stopLi.innerHTML = `${stop.time} - ${stop.station_name}`;
          stopLi.dataset.id = stop.id;
          stopLi.id = `li-${stop.id}`;
          // stationsDiv.innerHTML = ""
          stationsDiv.appendChild(stopLi); //! puts stops in stationsDiv
          stopLi.addEventListener("click", evt => {  //! click on the stops EL-2
            // debugger;
            if (evt.target.lastElementChild) {
              evt.target.lastElementChild.remove();
            }
            if (evt.target.dataset.id === `${stop.id}`) {
              // debugger;
              // formContainer.innerHTML = "";
              let editForm = document.createElement("form"); //!form pops up when you click to edit/delete stop 
              editForm.id = "edit-form";
              // ! from the stops in the stationsDiv -> creates form
              editForm.innerHTML = "";
              editForm.innerHTML = `
                <input name = "newTime" value=${stop.time} - ${stop.station_name} />
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

              delButton.addEventListener("click", evt => { // ! delete stop ! EL-3.5
                if (evt.target.id === "delete-stop")
                  // console.log("delete");
                  fetch(
                    `http://localhost:3000/stops/${evt.target.parentElement.parentElement.parentElement.dataset.id}`,
                    {
                      method: "DELETE" // or 'PUT'
                    }
                  );
                evt.target.parentElement.parentElement.parentElement.remove();
              });

              editForm.addEventListener("submit", evt => {   //! EL-3
                //* update or submit click
                evt.preventDefault();
                if (
                  evt.target.children[1].id === "updateDiv" &&
                  evt.target.id !== "delete-stop"        //! this is for PATCH stop
                ) {
                  fetch(
                    `http://localhost:3000/stops/${evt.target.parentElement.dataset.id}`,
                    {
                      method: "PATCH", // or 'PUT'
                      body: JSON.stringify({
                        time: `${evt.target.newTime.value}`
                      }), // data can be `string` or {object}!
                      headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                      }
                    }
                  )
                    .then(r => r.json())
                    .then(r => {
                      console.log(r);
                      let updatedTime = `${evt.target.newTime.value} - ${stop.station_name}`;
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
        let trainStationsList = document.getElementById("train-Array");
        trainStationsList.innerHTML = "";
        trainStationsList.innerHTML += `
                      <h4> Your Selected Train </h4> 
                      <ul>
                      <li id = "trainHelp" data-id = ${train.id}> ${train.name} </li>
                      </ul>
                      <h6> Select a station below to create a stop </h6>
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
              // stationOption.innerHTML = `
              // <button> Button </button>`
              
            }
          });

        btnCreate = document.getElementById("btn-create"); // ! creating from dropdown EL-5
        btnCreate.addEventListener("click", evt => {
          if (evt.target.id === "btn-create") {
            formContainerDropdown.innerHTML = "";
            let newTrainFormDropdown = document.createElement("form");
            console.log(evt);
            // debugger
            // newTrainFrom.id = "new-train-form"
            newTrainFormDropdown.dataset.id = evt.target.id;
            // newTrainFormDropdown.innerHTML = ""; //!enter time form
            newTrainFormDropdown.innerHTML = 
              `
                <input name = "createStop" value="enter time"" />
                <input type="submit" value = "create" /> 
              `;

            formContainerDropdown.append(newTrainFormDropdown);

            // debugger
            // let existingStation = evt.target.parentElement;
            // existingStation.id = evt.target.id;
            // existingStation.append(newTrainForm);
            // debugger;
            // ! Create dropdown                                                    EL-6
            newTrainFormDropdown.addEventListener("submit", evt => { 
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
                    train_id: document.querySelector("#trainHelp").dataset.id,
                    station_id: document.querySelector("#stations-Dropdown")
                      .value
                  }), // data can be `string` or {object}!
                  headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                  }
                })
                  .then(r => r.json())
                  .then(r => {
                    // TODO: REPLACE WITH THE SAME FUNCTIONALITY AS LINE 48
                    let stopLi = document.createElement("LI");
                    stopLi.id = r.id;
                    stopLi.innerHTML = "";
                    stopLi.innerHTML = `${r.time} - ${r.station_name}`;
                    stationsDiv.appendChild(stopLi);
                    // debugger
                  });
              }
            });
          }
        });
        //! looping over existing stations of a selected train 
        for (var i = 0; i < stationArray.length; i++) {
          //looping through existing stations
          var opt = document.createElement("P");
          opt.className = "stationClass"
          opt.innerHTML = stationArray[i]["name"];
          opt.value = stationArray[i]["name"];
          opt.name = "Station_name";
          opt.id = stationArray[i]["station_id"];
          
          opt.innerHTML += `<button class ="buttonClass" id = '${stationArray[i]["name"]}'> Button </button>`
          trainStationsList.appendChild(opt);
          // trainStationsList.innerHTML += `<button data-id=" ${stationArray[i]["station_id"]} id= "deliverable">buttonX</button>`
        
        }

        // let stationButton = document.querySelectorAll(".buttonClass")
        
            //! EL-9
        trainStationsList.addEventListener("click", (evt) =>  {

          if(evt.target.className === "buttonClass"){
            console.log(evt.target.id);
           

          }
        })
        //! click on the station to make a  stop 
        trainStationsList.addEventListener("click", evt => {                   //! EL-7
          if (evt.target.dataset.id === "btn-create") {
            formContainer.innerHTML = "";
            let newTrainForm = document.createElement("form");
            newTrainForm.dataset.id = evt.target.id; //! createStop form
            newTrainForm.id = "belowDropdown"
            newTrainForm.innerHTML = `
              <input name = "createStop" value="HH:MM"" />
              <input type="submit" value = "create" /> 
            `;

            formContainer.append(newTrainForm);
            
            //! create from form that just popped up 
            formContainer.addEventListener("submit", evt => {   //! EL-8
              evt.preventDefault();
              if (evt.target.tagName === "FORM") {
                // debugger
                fetch("http://localhost:3000/stops", {
                  method: "POST", // or 'PUT'
                  body: JSON.stringify({
                    time: evt.target.parentElement.querySelector(
                      'input[name="createStop"]'
                    ).value,
                    train_id: document.querySelector("#trainHelp").dataset.id,
                    station_id: document.querySelector("#stations-Dropdown")
                      .value
                  }), // data can be `string` or {object}!
                  headers: {
                    "Content-Type": "application/json",
                    'Accept': "application/json"
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





//! new 'option' create station from the list of existing stations .unique (mb EL-7)

let trainStationsList = document.getElementById("train-Array");
trainStationsList.addEventListener("click", evt => {
  if (evt.target.tagName === "P") {
    // debugger
    formContainer.innerHTML = "";
    let newTrainForm = document.createElement("form");
    // console.log(evt);
    // newTrainFrom.id = "new-train-form"
    newTrainForm.dataset.id = evt.target.id; //!createStop2
    newTrainForm.innerHTML = `
    <h6> Enter time for ${evt.target.value} </h6>
    <input name = "createStop" value="HH:MM"" />
    <input type="submit" value = "create" />   
  `;

    formContainer.append(newTrainForm);
    //! create from form      (mb EL-8)
    formContainer.addEventListener("submit", evt => {
      evt.preventDefault();
      // if (evt.target.className === "FORM"){
        
        fetch("http://localhost:3000/stops", {
          method: "POST", // or 'PUT'
          body: JSON.stringify({
            time: evt.target.parentElement.querySelector(
              'input[name="createStop"]'
            ).value,
            train_id: document.querySelector("#trainHelp").dataset.id,
            station_id: evt.target.parentElement.querySelector(
              'input[name="createStop"]'
            ).parentElement.dataset.id
          }), // data can be `string` or {object}!
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        })
        .then(r => r.json())
        .then(r => {
            // console.log(r);
            // debugger
            let stopLi = document.createElement("LI");
            stopLi.innerHTML = `${r.time} - ${r.station_name}`;
            formContainer.innerHTML = ""
            stationsDiv.appendChild(stopLi);
            // debugger
          });
      // }
    });
  }
});

// * this is not the preferred way to refresh page

let refreshBtn = document.getElementById("btn-refresh");
let refreshSidebar = document.getElementById("refreshDiv");
let sideBarx = document.getElementById("mySidebar");
sideBarx.addEventListener("click", evt => {
  if (evt.target.id === "btn-refresh") {
    let empty = "";
    let trainStationsList = document.getElementById("train-Array");
    stationsDiv.innerHTML = empty;
    trainStationsList.innerHTML = empty;
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
