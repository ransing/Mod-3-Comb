let formContainer = document.getElementById("form-container");
let formContainerDropdown = document.getElementById("form-container-dropdown");
url = "http://localhost:3000/trains"; //*  get all trains
let ulList = document.getElementById("list");
let sideBar = document.getElementById("mySidebar");

fetch(url)
  .then(r => r.json())
  .then(trains => {
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

//   Individual Train Page/Get specific train

let stationsDiv = document.getElementById("stations-div");
sideBar.addEventListener("click", evt => {
  if (evt.target.id === "train-li") {
    formContainer.innerHTML = "";
    formContainerDropdown.innerHTML = "";
    let id = evt.target.dataset.id;
    fetch(`http://localhost:3000/trains/${id}`) 
      .then(res => res.json())
      .then(train => {
        let stopsList = document.getElementById("stops-list");
        let stopColumn = document.getElementById("stopBlock");
        stationsDiv.innerHTML = "";
        train.stops.forEach(stop => {
          // ! list existing stops of that train
          let stopLi = document.createElement("LI");
          stopLi.innerHTML = `${stop.time} - ${stop.station_name}`;
          stopLi.dataset.id = stop.id;
          stopLi.id = `li-${stop.id}`;
          stationsDiv.appendChild(stopLi); //! puts stops in stationsDiv
          

        //   Creates Update Form
          stopLi.addEventListener("click", evt => {
            if (evt.target.lastElementChild) {
              evt.target.lastElementChild.remove();
            }
            if (evt.target.dataset.id === `${stop.id}`) {
              let editForm = document.createElement("form"); //form pops up when you click
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

            // Delete Stop
              delButton.addEventListener("click", evt => {
                if (evt.target.id === "delete-stop")
                  fetch(
                    `http://localhost:3000/stops/${evt.target.parentElement.parentElement.parentElement.dataset.id}`,
                    {
                      method: "DELETE"
                    }
                  ); 
                evt.target.parentElement.parentElement.parentElement.remove();
              });

            //   Update Stop
              editForm.addEventListener("submit", evt => {
                evt.preventDefault();
                if (
                  evt.target.children[1].id === "updateDiv" &&
                  evt.target.id !== "delete-stop"
                ) {
                  console.log("update");
                  fetch(
                    `http://localhost:3000/stops/${evt.target.parentElement.dataset.id}`,
                    {
                      method: "PATCH", 
                      body: JSON.stringify({
                        time: `${evt.target.newTime.value}`
                      }), 
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
        
        //  Dropdown Station Container
        let stationArray = train.stations_array;
        let select = document.getElementById("train-Array");
        select.innerHTML = "";
        select.innerHTML += `
                      <h4> Your Selected Train </h4> 
                      <ul>
                      <li id = "trainHelp" data-id = ${train.id}> ${train.name} </li>
                      </ul>
                      <h6> Select a station below to create a stop </h6>
                      <select id = "stations-Dropdown">  
                      </select>
                      <input  id='btn-create' type="submit" value='Create Stop'></input>
                    `;
      
                    //  Dropdown Station Menu
        let stationsDropdown = document.getElementById("stations-Dropdown");
        stationsDropdown.length = 0;

        const stationsUrl = "http://localhost:3000/stations";

        fetch(stationsUrl)
          .then(r => r.json())
          .then(r => {
            console.log(r);
            let station = r[0];
            for (let i = 0; i < r.length; i++) {
              stationOption = document.createElement("option");
              stationOption.text = r[i].name;
              stationOption.value = r[i].id;
              stationsDropdown.append(stationOption);
            }
          });

        //   Create Stop from Dropdown/Click button for form 
        btnCreate = document.getElementById("btn-create"); 
        btnCreate.addEventListener("click", evt => {
          if (evt.target.id === "btn-create") {
            formContainerDropdown.innerHTML = "";
            let newTrainFormDropdown = document.createElement("form");
            console.log(evt);
            newTrainFormDropdown.dataset.id = evt.target.id;
            newTrainFormDropdown.innerHTML = 
              `
                <input name = "createStop" value="enter time"" />
                <input type="submit" value = "create" /> 
              `;
            formContainerDropdown.append(newTrainFormDropdown);

            // ! Create Stop from Dropdown
            newTrainFormDropdown.addEventListener("submit", evt => {
              evt.preventDefault();
              if (evt.target.tagName === "FORM") {
                
                fetch("http://localhost:3000/stops", {
                  method: "POST", 
                  body: JSON.stringify({
                    time: evt.target.parentElement.querySelector(
                      'input[name="createStop"]'
                    ).value,
                    train_id: document.querySelector("#trainHelp").dataset.id,
                    station_id: document.querySelector("#stations-Dropdown")
                      .value
                  }), 
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
                  });
              }
            });
          }
        });

        //Looping through existing stations
        for (var i = 0; i < stationArray.length; i++) {
          var opt = document.createElement("option");
          opt.innerHTML = stationArray[i]["name"];
          opt.value = stationArray[i]["name"];
          opt.name = "Station_name";
          opt.id = stationArray[i]["station_id"];
          select.appendChild(opt);
          select.innerHTML += `<button data-id=" ${stationArray[i]["station_id"]} id= "deliverable">button</button>`
        }

        select.addEventListener("click", evt =>{
          if (evt.target.id === "reverse"){
            let stopOption = evt.target.previousElementSibling
            
          }
        } )

        //! Create stop form for Dropdown
        // select.addEventListener("click", evt => {
        //   if (evt.target.dataset.id === "btn-create") {
        //     formContainer.innerHTML = "";
        //     let newTrainForm = document.createElement("form");
          
        //     newTrainForm.dataset.id = evt.target.id; 
        //     newTrainForm.innerHTML = `
        //       <input name = "createStop" value="HH:MM"" />
        //       <input type="submit" value = "create" /> 
        //     `;
        //     formContainer.append(newTrainForm);
      
            //! Create Stop from Form
            // formContainer.addEventListener("submit", evt => {
            //   evt.preventDefault();
            //   if (evt.target.tagName === "FORM") {
                
            //     fetch("http://localhost:3000/stops", {
            //       method: "POST", 
            //       body: JSON.stringify({
            //         time: evt.target.parentElement.querySelector(
            //           'input[name="createStop"]'
            //         ).value,
            //         train_id: document.querySelector("#trainHelp").dataset.id,
            //         station_id: document.querySelector("#stations-Dropdown")
            //           .value
            //       }), 
            //       headers: {
            //         "Content-Type": "application/json",
            //         "Accept": "application/json"
            //       }
            //     })
            //       .then(r => r.json())
            //       .then(r => {
            //         let stopLi = document.createElement("LI");
            //         stopLi.innerHTML = `${r.time} - ${r.station_name}`;
            //         stationsDiv.appendChild(stopLi);
            //       });
            //   }

            // select.addEventListener("click", (evt) =>  {
            //   if (evt.target.id === "btn-whatever"){
            //   // debugger
            //   fetch(http://localhost:3000/stations/${evt.target.name}, {
            //     method: 'PATCH', // or 'PUT'
            //     body: JSON.stringify({
            //       name: evt.target.previousElementSibling.value.split("").reverse().join("")
            //     }), // data can be string or {object}!
            //     headers: {
            //       'Content-Type': 'application/json',
            //       'Accept': 'application/json'
            //     }
            //   })
            //   .then(r => r.json())
            //   .then (r => {
            //     evt.target.previousElementSibling.innerText = r.name
            //   })
            //   }
            // });
          })
        };
      });
//   }
// });

//! new 'option'

// Create Stop Form for Stops below dropdown

let select = document.getElementById("train-Array");
select.addEventListener("click", evt => {
if (evt.target.tagName === "OPTION") {
  formContainer.innerHTML = "";
  let newTrainForm = document.createElement("form");
  
  newTrainForm.dataset.id = evt.target.id; //!createStop2
  newTrainForm.id = "belowDropdown"
  newTrainForm.innerHTML = 
  `
    <h6> Enter time for ${evt.target.value} </h6>
    <input name = "createStop" value="HH:MM"" />
    <input type="submit" value = "create" /> 
  `
    formContainer.append(newTrainForm);


  // Create Stop from below dropdown menu

  formContainer.addEventListener("submit", evt => {
    evt.preventDefault();
    if (evt.target.id === "belowDropdown"){
      
      fetch("http://localhost:3000/stops", {
        method: "POST", 
        body: JSON.stringify({
          time: evt.target.createStop.value,
          train_id: document.querySelector("#trainHelp").dataset.id,
          station_id: evt.target.dataset.id
        }), 
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })
        .then(r => r.json())
        .then(r => {
          let stopLi = document.createElement("LI");
          stopLi.innerHTML = `${r.time} - ${r.station_name}`;

          stationsDiv.appendChild(stopLi);
         
        });
    }
  });
}
})


// * Eric says this is not the preferred way to refresh page 

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