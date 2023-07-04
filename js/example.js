

  
  var item7 = '<div data-eventid=1234 class=event data-color=1><img class=eventimg src="./uploads/tree.png">item7</div>';
  var item9 = '<b class=eventemoji>&#129424;</b>item7';
  let item8=`<b>item7</b><br>
    <div class='subrange-container' style='grid-template-columns:1fr 1fr;'>
      <div class="subrange">
        <b>item7</b><br>
         <div class='subrange-container' style='grid-template-columns:1fr 1fr;'>
          <div class="subrange">
            <div style="left: 0px;"><b>item4</b></div>
          </div>
          <div class="subrange">
            <div data-id=2 style="left: 0px;"><b>item 2</b></div>
          </div>
        </div>
      </div>
      <div class="subrange">
        <div data-id=2 style="left: 0px;"><b>item 2</b></div>
      </div>
    </div>`
  
  var container = document.getElementById('timeline-container');
  var items = [
    {id: 1, content: 'item 1', start: '2013',className:"timeline-red",order:4},
    {id: 2, content: item9, start: '2013',order:5},
    {id: 3, content: item7, start: '2013',order:1},
    {id: 4, content: 'item 4', start: '2013-03-16', end: '2013-04-19',className:"color-range red",order:8,type:"range"},
    {id: 7, content: item8, start: '2013-04-20', end: '2013-04-28',className:"color-range",order:4,type:"range"},
    {id: 5, content: 'item 5', start: '2013-04-25',order:7,type:"point"},
    {id: 6, content: "item7", start: '2013-04-27', end: '2013-05-02',className:"line-range",order:2}
  ];

  var options = {
    height:'300px',width:"100%",margin:{
      item:10,axis:0
    },order:(i1,i2)=>{
      return i1.type==="range"?1:-1
    },showCurrentTime:true
    
  };
  var timeline = new vis.Timeline(container, items, options);
//   timeline.on('select', function (properties) {
//   console.log(properties.items);
// });
timeline.on('rangechanged',function(s){
  const {start,end}=s
  console.log("date range:")
  console.log(Math.abs(end-start)/(1000*60*60*24)+" days")
});


btn=document.querySelector('.subrange');

btn.addEventListener('click', function (e) {
  console.log("blicksub")
  e.stopPropagation()

});
//define data array
var tabledata = [
    {id:1, name:"Oli Bob", progress:12, gender:"male", rating:1, col:"red", dob:"19/02/1984", car:1},
    {id:2, name:"Mary May", progress:1, gender:"female", rating:2, col:"blue", dob:"14/05/1982", car:true},
    {id:3, name:"Christine Lobowski", progress:42, gender:"female", rating:0, col:"green", dob:"22/05/1982", car:"true"},
    {id:4, name:"Brendon Philips", progress:100, gender:"male", rating:1, col:"orange", dob:"01/08/1980"},
    {id:5, name:"Margret Marmajuke", progress:16, gender:"female", rating:5, col:"yellow", dob:"31/01/1999"},
    {id:6, name:"Frank Harbours", progress:38, gender:"male", rating:4, col:"red", dob:"12/05/1966", car:1},
];

var table = new Tabulator("#example-table", {
    data:tabledata,           //load row data from array
    layout:"fitColumns",      //fit columns to width of table
    responsiveLayout:"hide",  //hide columns that don't fit on the table
    addRowPos:"top",          //when adding a new row, add it to the top of the table
    history:true,             //allow undo and redo actions on the table
    pagination:"local",       //paginate the data
    paginationSize:10,         //allow 7 rows per page of data
    paginationCounter:"rows", //display count of paginated rows in footer
    movableColumns:false,      //allow column order to be changed
    initialSort:[             //set the initial sort order of the data
        {column:"name", dir:"asc"},
    ],
    columnDefaults:{
        tooltip:true,         //show tool tips on cells
    },
    columns:[                 //define the table columns
        {title:"Name", field:"name", editor:false},
        {title:"Task Progress", field:"progress", hozAlign:"left", formatter:"progress", editor:false},
        {title:"Gender", field:"gender", width:95, editor:false, editorParams:{values:["male", "female"]}},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100, editor:false},
        {title:"Color", field:"col", width:130, editor:false},
        {title:"Date Of Birth", field:"dob", width:130, sorter:"date", hozAlign:"center"},
        {title:"Driver", field:"car", width:90,  hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:false},
    ],
});
tippy('#btn', {
        content: 'My tooltip!',
      });
      var quill = new Quill('#editor', {
        theme: 'snow'
      });