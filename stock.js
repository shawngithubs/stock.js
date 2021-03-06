//Use , at the beginging before assigning variable, we are able to assign many const variable with one const keywords
const canvas = document.querySelector('#chart')
const context = canvas.getContext('2d')
, dataset = []
, detail_dataset = []
, info_price = document.querySelector('#info_price')
, info_date = document.querySelector('#info_date')
, parent_of_canvas = document.querySelector('#parent_of_canvas')
, input = document.querySelector('input[type=text]')
,loader = document.querySelector('.loader')
,my_watched_button = document.querySelector('#add_to_watchlist')
, delete_button = document.querySelector('#deletebutton')
let current_Index = 0
let max_value, min_value, raw_data, global_time, clientX, date_latest, myChart, isInsideCanvas, valid_data_number, timestamp, closed_price, isMouseDown, difference_time, variable_name, button_being_clicked, parameter_list,clientY,symbol, horizonalLinePlugin;
let [isVisible, isWaiting_one,isWaiting_two,isWaiting_three] = [true, true,false,false]
let [label, grid_color,symbol_full_list,symbol_price_list,symbol_name_list,symbol_full_name_list] = [
  [],
  [],
  [],
  [],
  [],
  []
]


let my_watched_list =JSON.parse(localStorage.getItem('my_watched_list'))
if(!my_watched_list) my_watched_list = []
let all_fetch_data = {
  "one_day": null,
  "one_week": null,
  "one_month": null,
  "two_month": null,
  "three_month": null,
  "all_data": null

}


 delete_button.addEventListener('click', (e) => {
  input.blur();
  input.value = ""
  e.target.style.visibility = 'hidden'
  create_sections(symbol_full_name_list,false)

})

document.querySelector('#search_icon').addEventListener('click', () => {
  document.activeElement === input ? input.blur() : input.focus()
})

function search_through(value){
    let list=[]
   const expected_first_letter =value[0]
  for(let i =0;i< symbol_name_list.length;i++){

    if(symbol_name_list[i][0] === expected_first_letter){

      symbol_name_list[i].forEach((values,index)=>{

        if(values.startsWith(value)){
          let global_index = 0
          for(let a =0;a<symbol_name_list.slice(0,i).length;a++) global_index += symbol_name_list.slice(0,i)[a].length
          list.push(global_index+index)
      }
      })
      break
    }

  }

     if(value.length > 1){
    for(let i =0;i< symbol_full_name_list.length;i++){
         if( symbol_full_name_list[i].toUpperCase().indexOf(value) > -1&& !symbol_full_name_list[i].endsWith(value)){
          list.push(i)
        }
      
        
      }
    }


 //use new Set to remove all duplicate values and sort from lowerest to greatest
list =[...new Set(list)].sort((a,b)=>{
return a -b
})
const extra_list = []
if(my_watched_list.length > 0){
my_watched_list.forEach((i,index)=>{
  console.log(i.data_section['0'],value)
  if(i.data_section['0'].startsWith(value) || i.data_section['1'].toUpperCase().indexOf(value) > -1)
    extra_list.push(index)

})

}
console.log(extra_list)

create_sections(list,true,extra_list)
}

input.addEventListener('keyup',(e) =>{
  //immediately return if  key is enter
  if (e.key === 'Enter' || e.keyCode === 13) return;
   const search_value  = input.value.toUpperCase()
  if(search_value === ""){
     delete_button.style.visibility = 'hidden'
     return
  }
   delete_button.style.visibility = 'visible'
   search_through(search_value)

  if(symbol_full_name_list.length === 0 ) {
       document.querySelector("#data_section").innerHTML =`
       <div id='loader'>
       </div>
       `
       isWaiting_three = true
       return
    }
 

})



function fetchData(symbol, range) {
  //apikey=c38b723e031c88753f0c9e66f505f557
  //apikey=136fb4fa07e6ac6ae9a246d24029dfbc
  //apikey=ee684c5f9b04a3e914f9e39630f0f929

  return fetch(`https://financialmodelingprep.com/api/v3/historical-chart/${range}/${symbol.toUpperCase()}?apikey=136fb4fa07e6ac6ae9a246d24029dfbc`)
    .then(res => res.json())

}
//only screenX works here, clientX doesn't work expected.
document.body.addEventListener('mousemove', e => {
  isInsideCanvas = isInCanvas(e.clientX, e.clientY)
  if (isInsideCanvas && isVisible) {
     clientY =e.clientY
    clientX = e.clientX;
    info_price.style.visibility = 'visible'
    info_date.style.visibility = 'visible'

  } else {
    info_price.style.visibility = 'hidden'
    info_date.style.visibility = 'hidden'
     document.querySelectorAll('#range > button').forEach(i=>i.style.visibility = 'visible')
  }

})

//Detect if the mouse is in the chart (not the whole canvas)
function isInCanvas(posX, posY) {

  if (!myChart) return false;
  const canvas_pos = canvas.getBoundingClientRect();
  return myChart.chartArea.left <= posX && posX <= myChart.chartArea.right + canvas_pos.left && myChart.chartArea.top <= posY - canvas_pos.top && posY - canvas_pos.top <= myChart.chartArea.bottom;



}
canvas.addEventListener('mousedown', function(e) {
  if (!isInsideCanvas) return;
  isMouseDown = true;



})
canvas.addEventListener('mouseup', function() {
  isMouseDown = false;
})
function format_date(dateobject) {
  return new Date(dateobject.substring(0, 4), dateobject.substring(5, 7) - 1, dateobject.substring(8, 10), dateobject.substring(11, 13), dateobject.substring(14, 16), "00")
}


function format_data(difference) {

  date_latest = format_date(raw_data[raw_data.length - 1].date)
  const expected_end_date = (timestamp === '1min' ? new Date(date_latest.getFullYear(), date_latest.getMonth(), date_latest.getDate(), 9, 30) : new Date(global_time.getFullYear(), global_time.getMonth(), global_time.getDate() - difference, 9, 30))


  raw_data.forEach((item, index) => {

    this.newdate = format_date(item.date)

    if (this.newdate >= expected_end_date) {

      label.push(this.newdate)
      detail_dataset.push(item)
      dataset.push(item.close.toFixed(2))
    }
  })


  valid_data_number = label.length
  max_value = Math.max.apply(null, dataset)
  min_value = Math.min.apply(null, dataset)
  if (timestamp === '1min') {
    label = label.map(i => new Date(i).getHours())

  if (return_market_status()) fill_label_array_1min()
   
    label = label.map(i => i + (i < 12 ? 'am' : 'pm'))
    grid_color = Array(label.length).fill("transparent")

    for (let i = 30 / range; i < label.length; i += 60 / range) grid_color[i] = "rgba(255,255,255,0.4)"
  

  } else if (timestamp === "5min") {
    label = label.map(i => new Date(i).getDate())
    fill_label_array_5min()

    grid_color = Array(label.length).fill("transparent")

    for (let i = 0; i < label.length; i += Math.ceil(79 / range)) grid_color[i] = "rgba(255,255,255,0.4)"


  } else if (timestamp === "30min") {
    let startingDate = new Date(label[0]).getDate()
    label = label.map(i => {
      const label_date = new Date(i).getDate()
      if (label_date >= startingDate + 7) startingDate = label_date
      return startingDate
    })
    grid_color = Array(label.length).fill("transparent");
    for (let i = 0; i < label.length; i += 70 / range) grid_color[i] = "rgba(255,255,255,0.4)"


  } else if (timestamp === '1hour') {
    //Use internationalization API to convert number of month to full name (e.g. 0=> January)
    let currentMonth = new Date(label[0]).toLocaleString("default", {
      month: 'long'
    });
    const passed_range = [];
    label = label.map((i, index) => {
      const label_month = new Date(i).toLocaleString("default", {
        month: 'long'
      });
      if (label_month !== currentMonth) {
        currentMonth = label_month
        passed_range.push(index)
      };
      return label_month

    })
    grid_color = Array(label.length).fill("transparent");
    //Sometimes there will not be enough (three) labels, so we could push the start month as well.
    if (passed_range.length < 3) passed_range.unshift(0)

    for (let i = 0; i < label.length; i++) {
      if (passed_range.includes(i))
        grid_color[i] = "rgba(255,255,255,0.4)"
    }
  }
    grid_color[grid_color.length - 1] = "rgba(255,255,255,0.4)"
  }




function format_data_two(difference, isYear, filter_value, filter_data_range = 1, label_by_year) {
  Chart.unregister(horizonalLinePlugin);
  dataset.length = 0
  const lastest_date = new Date(all_fetch_data['all_data'][all_fetch_data['all_data'].length - 1].date)
  const oldest_date = (!isYear ? new Date(lastest_date.getFullYear(), lastest_date.getMonth() - difference, lastest_date.getDate(), 23, 59) : new Date(lastest_date.getFullYear() - difference, lastest_date.getMonth(), lastest_date.getDate(), 23, 59))

  raw_data.forEach((item, index) => {

    let current_date = new Date(item.date)
    /*
    Important notice:
    The default timestamp for new date constructor is EDT timestamp,
    but the item.date retrieving from API is UTC/GMT timestamp,
    they have four hour difference 
    For example, in EDT time is 8:00, in UTC/GMT, the time will be 12:00
    So we must add 4 hours to GMT timestamp to make them the same
    Should be very careful handle this
    P.S. spend 2 hours find out the bug caused by this
    */

    if (index % filter_data_range === 0) {

      current_date = new Date(current_date.setHours(current_date.getHours() + 4))
      if (difference) {
        if (current_date >= oldest_date) {
          label.push(current_date)
          detail_dataset.push(item)
          dataset.push(item.price.toFixed(2))
        }

      } else {
        label.push(new Date(current_date.setHours(current_date.getHours() + 4)))
        detail_dataset.push(item)
        dataset.push(item.price.toFixed(2))
      }

  
  }
})


  valid_data_number = label.length
  max_value = Math.max.apply(null, dataset)
  min_value = Math.min.apply(null, dataset)
  grid_color = Array(valid_data_number).fill('transparent')

  let passed_value = [0];

  if (!label_by_year) {
    let currentMonth = new Date(label[0]).toLocaleString("default", {
      month: 'long'
    });
    label = label.map((i, index) => {
      const label_month = new Date(i).toLocaleString("default", {
        month: 'long'
      });
      if (label_month !== currentMonth) {
        passed_value.push(index)
        currentMonth = label_month
      };

      return label_month
    })

  } else {
    let currentYear = new Date(label[0]).getFullYear()
    label = label.map((i, index) => {
      const label_year = new Date(i).getFullYear()

      if (label_year !== currentYear) {
        passed_value.push(index)
        currentYear = label_year
      };

      return label_year
    })

  }



  if (filter_value) passed_value  = passed_value.filter((i, index) => {
    return index % filter_value === 0
  })

  for (let i = 0; i < label.length; i++) {
    if (passed_value.includes(i))
      grid_color[i] = "rgba(255,255,255,0.4)"
  }

  grid_color[grid_color.length - 1] = "rgba(255,255,255,0.4)"


}


function create_sections(data,isSearch,watch_list){

  const data_section = document.querySelector("#data_section")
   data_section.innerHTML=""
  if(data.length === 0){

  data_section.innerHTML =`
  <h3>No result for "${input.value}" </h3>
  `
     data_section.style.textAlign = 'center'
     return
   }
     if(watch_list && watch_list.length > 0){
       data_section.innerHTML += `
  <h2 id='header'>My watch_list:</h2>
  `
     watch_list.forEach(i=>{
      console.log(my_watched_list[i].data_section['0'])
      data_section.innerHTML +=`
      <div id='element_${my_watched_list[i].index}'>
    <div id='symbol'>${my_watched_list[i].data_section['0']}</div>
    <span id='exchange_market_symbol'>${my_watched_list[i].data_section["4"]}</span>
    <div id='company_name'>${my_watched_list[i].data_section["1"]}</div>
    <div id='current_price'>${my_watched_list[i].data_section["2"].toFixed(2)}</div>
    </div>
     `
     })

  }

 

data_section.style.textAlign = 'left'

  data_section.innerHTML += `
  <h2 id='header'>${!isSearch ? "Recommand" : "Symbols" }:</h2>
  `
  //The list contains 15 random non-repeating choosed index for data that going to be displayed
  let display_list = []
  //The list contains others indexes that are not chosen which will be used if user later clicked the load_more button
  const rest_list = data.slice()
if(data.length > 15){
  while(display_list.length<15){
    const selected_index = Math.floor(Math.random()*rest_list.length)
  if(symbol_full_list[selected_index]["2"] < 100 ) continue;
   display_list.push(isSearch ? rest_list[selected_index] : selected_index)
    rest_list.splice(selected_index,1)
   
  }
}
else display_list = data.slice()

  display_list.forEach((i,index)=>{
    const current_data = symbol_full_list[i];

    data_section.innerHTML+=`
    <div id='element_${i}'>
    <div id='symbol'>${current_data['0']}</div>
    <span id='exchange_market_symbol'>${current_data["4"]}</span>
    <div id='company_name'>${current_data["1"]}</div>
    <div id='current_price'>${current_data["2"].toFixed(2)}</div>
    </div>
    `
  })
//use regular expression in dom here, to select any divs have id starts with element_ 
document.querySelectorAll("div[id^='element_']").forEach(div=>{
div.addEventListener('click',function(e){

  //remove the string and leave with number only
  const index = e.target.id.split('element_')[1]

  if(document.querySelector('.active')) document.querySelector('.active').classList.toggle('active')
  event.target.classList.add('active')
  setup(index)
})
})
}


function create_small_animated_chart(){
   
   setTimeout(()=>{
    const last_text_element = document.querySelector('text:last-child')
    last_text_element.textContent ="Let's get start!"
   last_text_element.style.animation = "draw2 12s forwards, appearing 3s "
   },10000)
    const data_one = []
    const data_two = [];
    let previous_point_one = 50;
    let previous_point_two = 40
    for(let i =0;i<500;i++){
      data_one.push({x:i,y:previous_point_one})
      previous_point_one += 5-Math.random()*10
      data_two.push({x:i,y:previous_point_two})
       previous_point_two += 5-Math.random()*10
    }
 //10 seconds animation
 const delay = 10000 / data_one.length;
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;

  const animation = {
  x: {
    type: 'number',
    easing: 'linear',
   
    duration:  delay ,
    from: NaN, 
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.xStarted) return 0;
      ctx.xStarted = true;
      return ctx.index * delay;
    }
  },
  y: {
    type: 'number',
    easing: 'linear',
    duration: 10000 / data_one.length,
    from: previousY,
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.yStarted) return 0; 
      ctx.yStarted = true;
      return ctx.index * delay;
    }
  }
}
   const starting_chart  = new Chart(document.querySelector('#animated_effect'),{
  type: 'line',
  data: {
    datasets: [{
      borderColor: "red",
      borderWidth: 1.5,
      radius: 0,
      pointHoverRadius:0,
      data: data_one,
    },
    {
      borderColor: "lawngreen",
      borderWidth: 1,
      radius: 0,
      pointHoverRadius:0,
      data: data_two,
    }]
  },
  options: {
    animation,
      responsive: true,
      maintainAspectRatio: false,
    tooltips: {
        enabled: false
      },
    interaction: {
      intersect: false
    },
     plugins: {
            tooltip: { 
              enabled: false 
            },
            legend:false
    },
    scales: {
      x: {
        type: 'linear',
         ticks: {
          //only disable the x-axis label from showing 
                  display: false 
                },
                grid:{
                  //display:false
                  color:"rgba(256,256,256,0.25)"
                }
      },
      y:{
        ticks: {
                    //only disable the y-axis label from showing 
                    display: false 
                },
                grid:{
                  //display:false
                  color:"rgba(256,256,256,0.25)"
                }

      }
    }
  }
})

}


function size_calculation(word, fontSize) {
  const div = document.body.appendChild(document.createElement('div'));
  div.textContent = word;
  div.style.cssText = `
  font-size:${fontSize}px;
  width:auto;
  position:absolute;
  visibility:hidden;
  `
  //object destrusturing: const {} = object; ES6 feature 
  const {
    width,
    height
  } = window.getComputedStyle(div)

  div.remove();
  return ({
    width: parseFloat(width),
    height: parseFloat(height)
  })
}


function get_global_time() {
  //fetch the time from new york timezone 
  return fetch("https://worldtimeapi.org/api/timezone/america/new_york")
    .then(res => res.json())
    .then(raw_data => new Date(raw_data.datetime))
}


function fill_label_array_5min() {

  const expectedDate = new Date(date_latest.getFullYear(), date_latest.getMonth(), date_latest.getDate(), 16, 0)
  const amountToAdd = (expectedDate - date_latest) / 1000 / 60 / 5
  label.push.apply(label, Array(Math.ceil(amountToAdd / range)).fill(expectedDate.getDate()))

}

function fill_label_array_1min() {
 const expectedDate =new Date(date_latest.getFullYear(), date_latest.getMonth(), date_latest.getDate(), 15,59)


  const amountToAdd = (expectedDate - date_latest) / 1000 / 60;

  //Add null dataset to array with numbers of minutes left to the close market which is 4 p.m.
  //first fill the label_array to full hour (60 min)
  label.push.apply(label, Array(Math.floor((59 - date_latest.getMinutes()) / range)).fill(date_latest.getHours()))

  for (let i = date_latest.getHours()+1; i < 16; i++) label.push.apply(label, Array(60 / range).fill(i))

  //at last 16:00
  label.push(16)

}


function find_closed_price() {
  if (!closed_price) {
    for (let i = raw_data.length - 1; i >= 0; i--) {
      if (date_latest.getDate() !== format_date(raw_data[i].date).getDate())
        return raw_data[i].close;
    }
  }
  return closed_price

}


function return_color() {
  //raw_data[0].close give us latest/current stock price
  if (timestamp === '1min')
    return (raw_data[raw_data.length - 1].close >= find_closed_price() ? "lawngreen" : "red")
  else
    return dataset[0] <= dataset[dataset.length - 1] ? "lawngreen" : "red"
}



function return_linearGarident(color) {
  const canvasHeight = parseInt(window.getComputedStyle(parent_of_canvas).getPropertyValue('height'))
  const gradient = context.createLinearGradient(0, 0, 0, canvasHeight)
  if (color) {
    gradient.addColorStop(0, "#52c4fa");
    gradient.addColorStop(0.3, "rgba(82,196,250,0.3)");
    gradient.addColorStop(0.3, "rgba(82,196,250,0.3)");
    gradient.addColorStop(1, 'transparent')

  } else if (return_color().includes("red")) {
    gradient.addColorStop(0, "rgba(255,0,0,0.8)");
    gradient.addColorStop(0.3, "rgba(255,0,0,0.3)");
    gradient.addColorStop(0.3, "rgba(255,0,0,0.3)");
    gradient.addColorStop(1, 'transparent')

    gradient.addColorStop(1, 'transparent')
  } else if (return_color().includes("green")) {
    gradient.addColorStop(0, "rgba(124,252,0,0.8)");
    gradient.addColorStop(0.3, "rgba(124,252,0,0.3)");
    gradient.addColorStop(0.3, "rgba(124,252,0,0.3)");
    gradient.addColorStop(1, 'transparent')
  }
  return gradient

}


function return_horizontal_gradient(color, pos_start, pos_end) {
  const horizontal_Gradient = context.createLinearGradient(0, pos_start, 0, pos_end)

  if (color === "red") {

    horizontal_Gradient.addColorStop(0, "rgba(255,0,0,0.3)");
    horizontal_Gradient.addColorStop(0.3, "rgba(255,0,0,0.1)");
    horizontal_Gradient.addColorStop(0.3, "rgba(255,0,0,0.15)");
    horizontal_Gradient.addColorStop(1, 'transparent')

  } else if (color === 'lawngreen') {
    horizontal_Gradient.addColorStop(0, "rgba(124,252,0,0.3)");
    horizontal_Gradient.addColorStop(0.3, "rgba(124,252,0,0.1)");
    horizontal_Gradient.addColorStop(0.3, "rgba(124,252,0,0.15)");
    horizontal_Gradient.addColorStop(1, 'transparent')

  }
  return horizontal_Gradient
}


function return_market_status() {
  //390 => 60 * 6 (from 9:30 to 16:00) + 30
  //return true if market open and return false if market close
  return (global_time.getHours() < 16 && global_time.getDay() !== 6 && global_time.getDay() !==  0 ? true : false)


}

function filter_data(input_data, time_range) {
  if (window.innerWidth > 1100) window.range = 1
  else if (window.innerWidth > 800) window.range = 2
  else if (window.innerWidth > 600) window.range = (timestamp !== `30min` ? 3 : 4)
  else if (window.innerWidth > 400) window.range = (timestamp === `${5 || 30}min` ? 6 : 5)
  else {
    parent_of_canvas.style.color = 'white';
    parent_of_canvas.innerHTML = `
      <div style='font-size:1.5em;'>!Window size warning:!</div><br>
      <div>Your interior window size is 
      <span style='color:red'>${window.innerWidth}, ${window.innerHeight}</span>
       which is too small to load the graph </div>
      <div>Please switch to bigger interior </div>
      `

  }

  //filter data by range and sort data based on the date (newest date like 15:59 pm ) to the end 
  if (parseInt(timestamp) < 30 || range < 3) {
    return input_data.sort(({
        date: a
      }, {
        date: b
      }) => a < b ? -1 : (a > b ? 1 : 0))
      .filter(i =>
        format_date(i.date).getMinutes() % (range * time_range) === 0
      )
  }

  return input_data.sort(({
      date: a
    }, {
      date: b
    }) => a < b ? -1 : (a > b ? 1 : 0))
    .filter(i =>
      format_date(i.date).getHours() % (range * time_range / 60) === 0 && format_date(i.date).getMinutes() === 0
    )

}

function judge_color() {
  if (current_Index === static_Index) return "#52c4fa"
  else if (current_Index > static_Index) return dataset[current_Index] >= dataset[static_Index] ? "lawngreen" : "red"
  else return dataset[static_Index] >= dataset[current_Index] ? "lawngreen" : "red"

}



function create_chart() {
  window.fire = false;
  window.first_index = null
  let [static_clientX, static_clientY] = new Array(2).fill(null)
  window.static_Index = null
  const annotation = {
    id: 'annotationline',

    afterDraw: function(chart) {
      if (!chart.tooltip._active.length || !isInsideCanvas) {
        info_price.style.visibility = 'hidden'
        info_date.style.visibility = 'hidden'
        isVisible = false;
        return;
      } else isVisible = true;
       document.querySelectorAll('#range > button').forEach(i=>i.style.visibility = 'hidden')
      info_price.style.color = "#52c4fa"


      window.left_position = parseFloat(window.getComputedStyle(info_price, null)["left"])
      window.this_position_x = chart.tooltip._active[0].element.x;
      let this_position_y =  chart.tooltip._active[0].element.y;
    
      if (current_Index === 0 && !first_index) first_index = this_position_y


      const pos_X = canvas.getBoundingClientRect().left + myChart.chartArea.left  - info_price.offsetWidth/2
      
      //Notice: do not remove following if statements for improving performance, the following if statement helps user reach the dataset[0] or dataset[dataset.length-1], without the line it will not be much too smooth and easy to reach it due to too many data points in the chart

     /* if (left_position.toFixed(2) === pos_X.toFixed(2) ){
        fire = true
        this_position_x = myChart.chartArea.left
        if(first_index) this_position_y = first_index
      }else  fire = false*/

      context.beginPath()
      context.strokeStyle = (!isMouseDown ? '#52c4fa' : judge_color());
      context.globalCompositeOperation = 'source-over'

      context.setLineDash([])

      context.moveTo(this_position_x, chart.chartArea.top);
      context.lineTo(this_position_x, chart.chartArea.bottom);
      context.lineWidth = context.lineWidth > 2.5 ? context.lineWidth : 2.5
      context.stroke();
      context.closePath();


      context.moveTo(this_position_x, chart.tooltip._active[0].element.y)

      context.beginPath()
      context.fillStyle = (!isMouseDown ? '#52c4fa' : judge_color());
      context.arc(this_position_x, this_position_y, window.innerWidth / 110 > 10 ? window.innerWidth / 110 : 10, 0, 2 * Math.PI);
      context.fill();
      context.strokeStyle = 'rgba(0,0,0,0.8)';
      context.stroke();
      context.closePath();
      /*
      The state saved by context.save() could only be restored only once.
      Every time you call save, all the current default properties of the context are pushed in this stack.
      Every time you call restore, the last state is popped out of the stack, and all its saved properties are set to the context.
      So we need to use context.restore followed by a context.save() in order by keep the customized property for further used.
      */

      context.restore()
      context.save()


      if (isMouseDown) {

        if (!static_clientX) {
          static_clientY = this_position_y;
          static_clientX = this_position_x
          static_Index = current_Index
          return;
        }


        context.beginPath();
        context.globalCompositeOperation = 'source-over'

        context.moveTo(static_clientX, myChart.chartArea.top)
        context.lineTo(static_clientX, myChart.chartArea.bottom)
        context.strokeStyle = judge_color()
        context.stroke()
        context.closePath();
        context.moveTo(static_clientX, static_clientY)
        context.beginPath();
        context.arc(static_clientX, static_clientY, window.innerWidth / 110 > 10 ? window.innerWidth / 110 : 10, 0, 2 * Math.PI);
        context.fillStyle = judge_color()
        context.fill();
        context.strokeStyle = 'rgba(0,0,0,0.8)';
        context.stroke();
        context.closePath()
        context.restore();
        context.save()


        const starting_pos = Math.min(this_position_x, static_clientX)
        const ending_pos = Math.max(this_position_x, static_clientX)
        context.beginPath()
        context.globalCompositeOperation = 'source-over'
        context.fillStyle = return_horizontal_gradient(judge_color(), myChart.chartArea.top, myChart.chartArea.bottom)
        context.fillRect(starting_pos, myChart.chartArea.top, ending_pos - starting_pos, myChart.chartArea.height)
        context.closePath()
        context.restore();
        context.save()
        context.closePath()
        info_price.style.color = judge_color()
        info_price.style.left = (starting_pos + ending_pos) / 2 - info_price.offsetWidth / 2 +canvas.getBoundingClientRect().left + 'px'
      } else {
        static_clientY = null;
        static_clientX = null;
        static_Index = null;
      }



      info_price.style.visibility = 'visible'
      info_date.style.visibility = 'visible'
      if (left_position >= pos_X + myChart.chartArea.width / label.length * valid_data_number) {
        info_price.style.left = pos_X + myChart.chartArea.width / label.length * valid_data_number + "px"
      }
 

      if (isMouseDown && current_Index !== static_Index) return;
      if (current_Index === valid_data_number - 1) return;
       info_price.style.left = clientX - info_price.offsetWidth / 2 + "px"
      left_position = parseFloat(window.getComputedStyle(info_price, null)["left"])

      if (left_position.toFixed(2) <= pos_X.toFixed(2) ) {
        info_price.style.left = pos_X + "px"
        console.log(pos_X)

      } else if (left_position >= pos_X + myChart.chartArea.width / label.length * valid_data_number) {
        console.log(left_position)
        info_price.style.left = pos_X + myChart.chartArea.width / label.length * valid_data_number  +"px"
      }
    }

  }


   horizonalLinePlugin = {
    id: 'horizontalLine',
    afterDraw: function(chartInstance) {


      //the plugins will always be called every time user hover over it. Use this.has_called to prevent calling after first call to save performance. Use this to access has_called in the object horizonalLinePlug
      const canvasWidth = parseInt(window.getComputedStyle(parent_of_canvas).getPropertyValue('width'))
      if(!chartInstance.options.horizontalLine) return
      for (let index = 0; index < chartInstance.options.horizontalLine.length; index++) {
        const line = chartInstance.options.horizontalLine[index];
        if (find_closed_price() > max_value + 0.15) line.y = max_value - 0.1
        yValue = chartInstance.scales["y"].getPixelForValue(line.y)
        context.beginPath()
        context.setLineDash([5, 3])
        context.lineWidth = window.innerHeight / 250
        context.globalCompositeOperation = "source-over"
        context.moveTo(myChart.chartArea.left, yValue);
        context.lineTo(myChart.chartArea.right, yValue);
        context.strokeStyle = 'white';
        context.stroke();
        context.fillStyle = 'white';
        const fontSize = window.innerWidth / 100 * 1.25
        const size_1 = size_calculation("Previous Price:", fontSize);
        const size_2 = size_calculation(line.text, fontSize);
        context.font = `${fontSize}px sans-serif`;
        context.fillText("Previous Price:", myChart.chartArea.right - size_1.width - fontSize / 1.5, yValue + size_1.height);
        context.fillText(line.text, myChart.chartArea.right - size_2.width - fontSize / 1.5, yValue + size_1.height + size_2.height);
        context.restore();
        context.setLineDash([])
        context.save()
        context.closePath()

      }


    }

  };

  if (timestamp === "1min") Chart.register(horizonalLinePlugin);
  //if previous chart existed, clear it and redraw new chart
  if (myChart) myChart.destroy();;

  myChart = new Chart(context, {
    type: 'line',
    data: {
      xLabels: label,
      datasets: [{
        label: 'stock price',
        data: dataset,
        fill: true,
        backgroundColor: return_linearGarident(),
        pointHoverRadius: 0,
        hoverBackgroundColor: return_linearGarident('color'),
        hoverBorderColor: "rgba(82,196,250,0.8)",
        borderColor: return_color()
      }]
    },
    options: {

      responsive: true,
      maintainAspectRatio: false,

      "horizontalLine": [{
        "y": find_closed_price() > min_value - 0.15 ? find_closed_price() : min_value - 0.1,
        "text": find_closed_price()
      }],
      legend: {
        display: false
      },

      interaction: {
        mode: 'index',
        intersect: false,

      },
      elements: {
        point: {
          radius: 0,
          pointHoverRadius: 5
        },
        line: {
          borderWidth: 3.5
        }
      },
      hover: {
        mode: 'dataset',
        intersect: false,

      },
      scales: {
        y: {
          grid: {
            color: 'rgba(255,255,255,0.4)',
            borderColor: "rgba(255,255,255,0.65)",
            borderWidth: 2.5

          },
          ticks: {
            maxTicksLimit: 6,
            max: max_value + 0.15,
            min: min_value - 0.15,
            stepValue: ((max_value - min_value) / 5).toFixed(1),
            color: 'rgba(255,255,255,0.75)',
            font: {
              size: window.innerWidth / 100 * 1.5
            }

          }

        },

        x: {
          grid: {
            color: grid_color,
            borderColor: "rgba(255,255,255,0.65)",
            borderWidth: 2.5
          },
          ticks: {
            //get number of unqiue item in y label
            maxTicksLimit: label.length,
            color: 'rgba(255,255,255,0.75)',
            font: {
              size: window.innerWidth / 100 * 1.5
            },
            callback: function(value, index, values) {
              if (timestamp !== "1min" && index === label.length - 1) return "";

              return grid_color[index] !== "transparent" ? this.getLabelForValue(value) : ""

            }
          }
        }

      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          yAlign: "bottom",
          backgroundColor: 'transparent',
          titleColor: 'transparent',
          displayColors: false,
          bodyColor: 'transparent',
          footerColor: 'transparent',
          callbacks: {
            label: function(tooltipItem) {
              current_Index = tooltipItem.dataIndex
              if(fire && first_index ) current_Index = 0
              

              if (isMouseDown) {
                const current_value = dataset[current_Index];
                const previous_value = dataset[static_Index]
                const sign = (judge_color() === 'lawngreen' ? "+" : "-")
                //Already use white-space: pre-wrap for info_price and info_date so the white space will be significent and "       " will not be parse as " "
                info_price.innerHTML = sign + Math.abs(current_value - previous_value).toFixed(2) + "          " + sign + (Math.abs(current_value / previous_value - 1) * 100).toFixed(2) + '%'

                info_date.innerHTML = 'From <b>' + detail_dataset[Math.min(current_Index, static_Index)].date + '</b>   to   <b>' + detail_dataset[Math.max(current_Index, static_Index)].date +'</b>'
              } else {
                info_price.textContent = dataset[current_Index]
                info_date.textContent = detail_dataset[current_Index].date
              }


              return tooltipItem;
            }
          },
        }
      }
    },
    plugins: [annotation]

  })
  loader.style.display = "none"
  canvas.style.display = 'revert'
  

}


function restore_and_fetch(time_range_name, restore_only = false, expected_content = 'Latest Price') {
  canvas.style.display = 'none'
  detail_dataset.length = 0;
  dataset.length = 0
  label.length = 0;

  //use Chart.unregister to remove the horizonalLine which shows previous price if timestamp is not '1min'
  if (timestamp !== '1min' && horizonalLinePlugin) Chart.unregister(horizonalLinePlugin);
   
   const matched_element = document.querySelector('#price_name')
  if(matched_element) matched_element.innerHTML = expected_content +" (AS OF <span style='font-size:0.8em;'>"+new Date(global_time).toString().substring(4,21) + " EDT"+'</span>)'
    
  //const matched_element = document.evaluate(`//span[text()='${search_content}']`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;


  loader.style.display = "revert"
  if (restore_only === true) return;



  if (!all_fetch_data[time_range_name]) {
    fetchData(symbol, timestamp).then(function(result) {
      all_fetch_data[time_range_name] = result
      raw_data = filter_data(result, parseInt(timestamp))
      format_data(difference_time)
      create_chart()

    })
  } else {

    raw_data = filter_data(all_fetch_data[time_range_name], parseInt(timestamp))
    format_data(difference_time)
    create_chart()

  }

}




//Assign web worker to fetch the data 
function assign_web_worker_one() {
  //By using Blob, we are able to run web worker in a single script without putting it in a separate file 
  //Note that we are unable to use web worker in file type website in chrome 
  const blob = new Blob([
    document.querySelector('#web_worker_one').textContent
  ], {
    type: "text/javascript"
  })

  const worker = new Worker(window.URL.createObjectURL(blob));
  worker.onmessage = function(e) {
    all_fetch_data["all_data"] = JSON.parse(e.data)

    if (isWaiting_one && button_being_clicked) {

      setTimeout(() => button_being_clicked.click(),100);
      loader.style.display = 'none'

    }
    isWaiting_one = false;

  }
  //web worker no access to variable in main script, so we need to transfer it 
  worker.postMessage(symbol);
}

function assign_web_worker_two(){

  const blob = new Blob([
    document.querySelector('#web_worker_two').textContent
  ], {
    type: "text/javascript"
  })

  const worker = new Worker(window.URL.createObjectURL(blob));

  worker.onmessage = function(e) {
    /* 
    In order to improve efficency and optimize performance, the object keys have all been renamed, now the symbol_list looks  something like this:
    {
    "0":"CMCSA",
    "1":"Comcast Corporation",
     "2":43.8,
     "3":"NASDAQ Global Select",
     "4":"NASDAQ"
     }
    */

    //check the type of the return data to determine which list it should go to
    //altough check if item is object includes array, function and null
    const retrieved_data = JSON.parse(e.data)
     if(Array.isArray(retrieved_data[0])) symbol_name_list =  retrieved_data

      else if(isNaN(retrieved_data[0]) && retrieved_data[0].length > 0) symbol_full_name_list = retrieved_data


    
      else if(!isNaN(retrieved_data[0])) symbol_price_list =  retrieved_data

      else if(typeof retrieved_data[0] === "object") symbol_full_list = retrieved_data
       
      if(symbol_price_list.length > 0 && symbol_name_list.length > 0 && symbol_full_list.length > 0 && symbol_full_name_list.length > 0){
        if(isWaiting_two) 
        create_sections(symbol_full_name_list,false)
      else if(isWaiting_three)
        search_through(input.value.toUpperCase())
    }
    
}
  //web worker no access to variable in main script, so we need to transfer it 
  worker.postMessage("Start");
}




window.onload = function() {
  create_small_animated_chart()
  assign_web_worker_two()

  get_global_time().then(function(result){
    global_time = new Date(result)
    document.querySelector('#market_status').textContent = return_market_status() ? "Market Open" : "Market Closed";    
  const time_element = document.querySelector("#current_time")
  let time =  global_time
  time_element.textContent = time.toString().split(" GMT")[0] +' EDT'
    setInterval(()=>{
      time = new Date(time.getTime() + 1000)
      time_element.textContent = time.toString().split(" GMT")[0] +' EDT'
    },1000)
    load_main_page()
      
  })


    //Note that we should only change the default value for canvas after the chart is successfully created, otherwise, the default value I set will be overwritten by chart.js when it creating the graph.
    context.strokeStyle = '#52c4fa';
    context.fillStyle = "#52c4fa";
    context.setLineDash([])
    context.strokeStyle = '#52c4fa'
    context.lineWidth = window.innerWidth / 500 > 2.5 ? window.innerWidth / 500 : 2.5
    context.globalCompositeOperation = 'destination-over'
    context.save()


}


function load_main_page(){
  document.querySelector('#data_section').innerHTML=`
  <div id='starting_buttons'>
  <div id='stock_market_button'>
  <h2>Stock Market</h2>
  <div>Status: 
  <span style='color:${return_market_status() ? "green" : "red"}'>${return_market_status() ? "Market Open" : "Market Closed"}</span>
  </div>
  </div>
  <div id='watch_list' '>
  <h2 style='background-image:${return_color_gradient()}'>My Watch List</h2>
  </div>
  <div id='simulator'>
  <h2 style='background-image:${return_color_gradient()}'>Stock simulator</h2>
  </div>
  </div>

  `
  document.querySelector('#stock_market_button').addEventListener('click',function(){
    if(symbol_full_name_list.length === 0 ) {
       document.querySelector("#data_section").innerHTML =`
       <div id='loader'>
       </div>
       `
       isWaiting_two = true
    }else{
      create_sections(symbol_full_name_list,false)

    } 
  })

}
function return_color_gradient(){
  const color_list =  ['#58D68D', '#F1C40F', '#68C4EC', '#EC7063', "#F39C12", "#f05463", "#40B5AD", "#A52A2A","#e833c7"];
const color_one = color_list[Math.floor(Math.random() * color_list.length)]
color_list.splice(color_one,1)
    const color_two = color_list[Math.floor(Math.random() * color_list.length)]

    return  `-webkit-linear-gradient(left,${color_one},${color_two})`
  }



function setup(index){
   //Prevent all buttons to be clicked 
   my_watched_button.textContent ='+Add to Watchlist' 
      my_watched_button.classList.remove('has_clicked')
  
    document.querySelectorAll('button').forEach(i => i.style.pointerEvents = 'none')
    document.querySelector('#starting').style.display = 'none'
    parent_of_canvas.style.display = 'revert'

    restore_and_fetch('',true,"At Close")
    symbol = symbol_full_list[index]["0"]

    assign_web_worker_one(symbol)
    variable_name = "one_day"
    timestamp = "1min"
    //specify the date difference being used in the format function, for 1 day, it is 0, 1 week is 7, 1 month is 30....
    difference_time = 0
     Promise.all([get_global_time(), fetchData(symbol, timestamp)]).then(function(values) {

  
    all_fetch_data[variable_name] = values[1]


    raw_data = filter_data(values[1], parseInt(timestamp))
    format_data(difference_time)

    const price_element = document.querySelector('#price')
    price_element.querySelector('#dollar').innerHTML = raw_data[raw_data.length - 1].close.toFixed(2);
    const difference = raw_data[raw_data.length - 1].close - find_closed_price();
    const percentage = price_element.querySelector('#percent');

    percentage.textContent = (return_color().includes('green') ? "+" : "-") + Math.abs(difference / find_closed_price() * 100).toFixed(2) + "%";
    percentage.style.color = return_color();
    info_price.textContent = find_closed_price();
    if(!document.querySelector('#price_name')){
    const created_span = document.createElement('div')
    created_span.style.color = 'grey';
    created_span.id='price_name'
    const shortened_date = new Date(global_time).toString().substring(4,21) + "EDT"
    created_span.innerHTML = `At Close <span style='font-size:0.8em'>(AS OF ${shortened_date}) </span>`
    price_element.appendChild(created_span)
  }
    
    document.querySelector('#name > h2').textContent = symbol_full_list[index]["0"]
    document.querySelector("#name > h4").textContent = symbol_full_list[index]["1"]

    create_chart()
    document.querySelectorAll('button').forEach(i => i.style.pointerEvents = 'auto')
})    
}



window.addEventListener('resize', function() {
  if (document.querySelector('.warning')) return;

  const warning = document.createElement('div');
  const button_style = `
  color:rgba(0,0,200,0.8);
border:none; 
background:none;
text-decoration:underline;
font-size:0.8em`
  warning.innerHTML = `
  <div style='position:absolute;left:1vw;">
  <span style='font-weight:900;font-size:1.3em'>???</span>
  Warning: 
  </div>
  <span style='font-weight:500; color:rgba(0,0,0,0.8); font-size:0.9em'>Window get resized</span>  
  <a style='text-decoration:underline; font-style:italic; font-weight:500;font-size:0.5em;color:darkblue; margin-left:5px;margin-top:5px;'>Learn more</a>
  <button class='resize_button' style='${button_style};position:fixed; right:10%;'>Resize</button>
  <button class='remove_button' style='position:fixed; right:3%;'></button>
  `
  warning.className = 'warning'
  const timeout = setTimeout( ()=>warning.remove(), 5000)

  const remove_button = warning.querySelector('.remove_button')
  remove_button.addEventListener('click', () => {
    window.clearTimeout(timeout)
    warning.classList.add('remove_class')
    setTimeout(() => warning.remove(), 500)
  })


  warning.querySelector('.resize_button').addEventListener('click', function() {

    restore_and_fetch("", true)
    if (timestamp) {
      raw_data = filter_data(all_fetch_data[variable_name], parseInt(timestamp))
      format_data(difference_time)
    } else button_being_clicked.click()

    create_chart()
    warning.remove()
  })
  document.body.appendChild(warning)


})

document.querySelector('#one_day').addEventListener('click', function() {
  timestamp = '1min'
  difference_time = 0;
  variable_name = "one_day"

  restore_and_fetch(variable_name, false, "At Close")
})

document.querySelector('#one_week').addEventListener('click', function() {
  timestamp = '5min'
  difference_time = 7
  variable_name = 'one_week'

  restore_and_fetch(variable_name)
})

document.querySelector('#one_month').addEventListener('click', function() {
  timestamp = '30min'
  difference_time = 30
  variable_name = 'one_month'
  restore_and_fetch(variable_name)

})

document.querySelector('#two_month').addEventListener('click', function() {
  timestamp = '1hour'

  difference_time = 60
  variable_name = 'two_month'
  //pass by parameter without diretly access  global variable variable_name reduce the run time a little bit since it takes more performance time for JS run search for a global variable
  restore_and_fetch(variable_name)
})

document.querySelector('#three_month').addEventListener('click', function(event) {
  restore_and_fetch("", true)
  timestamp = false;
  difference = 3
  variable_name = 'all_data'
  parameter_list = [difference, false, 0]
  if (isWaiting_one) {
    loader.style.display = 'revert'
    button_being_clicked = event.target
    return
  }

  raw_data = all_fetch_data[variable_name]
  format_data_two(...parameter_list)
  create_chart()



})
document.querySelector("#six_month").addEventListener('click', function(event) {
  restore_and_fetch("", true)
  timestamp = false
  variable_name = 'all_data'
  difference = 6;
  parameter_list = [difference, false, 0]
  if (isWaiting_one) {
    button_being_clicked = event.target
    return
  }

  raw_data = all_fetch_data[variable_name]
  format_data_two(...parameter_list)
  create_chart()

})
document.querySelector('#one_year').addEventListener('click', function(event) {
  restore_and_fetch("", true)
  timestamp = false
  variable_name = 'all_data'
  difference = 2;
  parameter_list = [difference, true, 2, 2]
  if (isWaiting_one) {
    button_being_clicked = event.target
    return
  }

  raw_data = all_fetch_data[variable_name]
  format_data_two(...parameter_list)
  create_chart()
})

document.querySelector('#two_year').addEventListener('click', function(event) {
  restore_and_fetch("", true)
  timestamp = false
  variable_name = 'all_data'
  difference = 2;
  parameter_list = [difference, true, 4, 3]
  if (isWaiting_one) {
    button_being_clicked = event.target
    return;
  }

  raw_data = all_fetch_data[variable_name]
  format_data_two(...parameter_list)
  create_chart()

})
document.querySelector('#five_year').addEventListener('click', function(event) {
  restore_and_fetch("", true)
  timestamp = false
  variable_name = 'all_data'
  difference = 5;
  parameter_list = [difference, true, 0, 10, true]
  if (isWaiting_one) {
    button_being_clicked = event.target
    return;
  }
  raw_data = all_fetch_data[variable_name]
  format_data_two(...parameter_list)
  create_chart()


})

document.querySelector("#ten_year").addEventListener("click", function(event) {
  restore_and_fetch("", true)

  timestamp = false
  variable_name = 'all_data'
  difference = 10;
  parameter_list = [difference, true, 2, 20, true]
  if (isWaiting_one) {
    button_being_clicked = event.target
    return;
  }

  raw_data = all_fetch_data[variable_name]
  format_data_two(...parameter_list)
  create_chart()

})

document.querySelector('#all_time').addEventListener('click', function() {
  restore_and_fetch("", true)
  timestamp = false
  variable_name = 'all_data'
  difference = null;
  parameter_list = [difference, true, 3, 30, true]
  if (isWaiting_one) {
    button_being_clicked = event.target
    return;
  }
  raw_data = all_fetch_data[variable_name]
  format_data_two(...parameter_list)
  create_chart()
})


document.querySelector('#add_to_watchlist').addEventListener('click',function(event){
  
  if(!event.target.classList.contains('has_clicked')){
    event.target.classList.add('has_clicked')
    event.target.innerHTML = '&#10004;Added'
    //select item with id starts with element_ and with class name active
    const index_of_stock =document.querySelector(" div[id^='element_'].active").id.split('element_')[1]
    my_watched_list.push({
      index:index_of_stock,
      data_section:symbol_full_list[index_of_stock],
      date_added: global_time.toString().substring(4,24)
    })
  }else{
    event.target.classList.remove('has_clicked')
     event.target.textContent = '+Add to Watchlist'
    my_watched_list =  my_watched_list.filter(i=>i['index'] !== document.querySelector(" div[id^='element_'].active").id.split('element_')[1])

  }
  console.log(my_watched_list)

})

document.querySelector('#back_button').addEventListener("click",function(){
  load_main_page()
})

    window.addEventListener('beforeunload', function(e) {
      localStorage.setItem('my_watched_list', JSON.stringify(my_watched_list));
    })








