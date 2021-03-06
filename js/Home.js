// employee payroll is an array which will contain objects read from local storage
// using this we will populate th table
let empPayrollList;
//as soon the page loades we want this inner html function to be called
window.addEventListener('DOMContentLoaded',(event)=>
{
  if(site_properties.use_local_storage.match("true"))
  {
      getEmployeePayrollDataFromStorage();
  }
  else
      //if we want to use the json server then we will get data from json server
      getEmployeePayrollDataFromServer();
});

//calling from eventlistener as soon as the web page is loaded
const getEmployeePayrollDataFromStorage= ()=>{
    //it will go the local storage fetch the info if it is there convert to json otherwise return empty list
    empPayrollList= localStorage.getItem('EmployeePayrollList')?JSON.parse(localStorage.getItem('EmployeePayrollList')):[];
    processEmployeePayrollDataResponse();
}
//this method is created to get common function calls from getEmployeeDataStorage and getEmpFromJsonServer
//it will create inner html and update count
//it will receive synchronous calls from loacl storage func and async calls from json server response func
const processEmployeePayrollDataResponse=()=>{
  document.querySelector(".emp-count").textContent=empPayrollList.length;
  createInnerHtml();
  localStorage.removeItem('editEmp');
}

const getEmployeePayrollDataFromServer=()=>
{
    makeServiceCall("GET",site_properties.server_url,true)
        .then(responseText=>{
            empPayrollList= JSON.parse(responseText);
            processEmployeePayrollDataResponse();
        })
        .catch(error=>{
            console.log("GET Error Status: "+JSON.stringify(error));
            empPayrollList=[];
            processEmployeePayrollDataResponse();
        })
}

//creating inner html to dynamically input data during run time from js file
//we are using template literals which allows embedded expression
//template literals are enclosed by a backticl ``
//we can also inject expressions in template literal using $ sign
const createInnerHtml=()=>{
    if(empPayrollList.length==0) return;
    const headerHtml= "<tr><th></th><th>Name</th><th>Gender</th><th>Department</th><th>Salary</th><th>Start Date</th><th>Actions</th></tr>"
    //using template literal
    let innerHtml= `${headerHtml}`;
    for(const empPayrollData of empPayrollList){
    innerHtml= `${innerHtml}
    <tr>
          <td><img class="profile" alt="profilepic" src="${empPayrollData._profilePic}"></td>
          <td>${empPayrollData._name}</td>
          <td>${empPayrollData._gender}</td>
          <td>${getDeptHtml(empPayrollData._department)}
          </td>
          <td>${empPayrollData._salary}</td>
          <td>${stringifyDate(empPayrollData._startDate)}</td>
          <td><img id="${empPayrollData.id}" onclick= "remove(this)" alt="delete" src="../assets/delete-black-18dp (1).svg">
            <img id="${empPayrollData.id}" onclick= "update(this)" alt="edit" src="../assets/create-black-18dp (1).svg "></td>
    </tr>`;
    }
    document.querySelector('#table-display').innerHTML=innerHtml;
}

//since we can have multiple departments so using for loop fetching each department
const getDeptHtml= (deptList)=>
{
    let deptHtml='';
    for(const dept of deptList)
    {
        //the format is similar like we were doing for inner html
        //we are printing value for each dept in json file
        deptHtml= `${deptHtml}
        <div class="dept-label">${dept}</div>`
    }
    return deptHtml;
}  

//uc1-Remove function
//Function to delete the contact using icon of remove
//Above in the createinner html we are pasing onclick="remove(this)"
//here this is node that is passed 
const remove= (node)=>{
  //using empPayrollList we are retrieving the employee data  whose employee id is same as node id
  let empPayrollData= empPayrollList.find(empData=>empData.id == node.id);
  //if data does not exist then function is returned
  if(!empPayrollData) return;
  //employeepayrolllist is converted into a map array of ids for finding index
  const index= empPayrollList.map(empData=>empData.id).indexOf(empPayrollData.id);
  //using splice to remove element from array
  empPayrollList.splice(index,1);
  //setting into local storage by converting into json format
  if(site_properties.use_local_storage.match("true"))
      {
      //updating the data into local storage
      localStorage.setItem("EmployeePayrollList",JSON.stringify(empPayrollList));
      //updating the count of employees here, otherwise refresh will be required to update count
      //refresh slows the code, hence update of count is done here only.
      document.querySelector(".emp-count").textContent= empPayrollList.length;
      }
      else
      {
          const deleteURL= site_properties.server_url+empPayrollData.id.toString();
          makeServiceCall("DELETE",deleteURL,false)
          .then(responseText=>
            {
                document.querySelector(".emp-count").textContent= empPayrollList.length;
                createInnerHtml();
            })
            .catch(error=>{
                console.log("DELETE Error status: "+JSON.stringify(error));
            })
      }
      //showing updated data of local storage
      createInnerHtml();
}

//uc2 update function
const update= (node)=>{
  //using empPayrollList we are retrieving the employee data  whose employee id is same as node id
  let empPayrollData= empPayrollList.find(empData=>empData.id == node.id);
  //if emplPayrollData is null then it is returned
  if(!empPayrollData) return;
  //setting local storage by converting into json
  //we are creating the local storage with a key 
  localStorage.setItem('editEmp',JSON.stringify(empPayrollData));
  //this will change the window location to the directed site but here we wont get the details filled in the form
  //so we need to write a func to get details
  window.location.replace(site_properties.emp_payroll_page);
}


//creating a employeepayroll data in json format called from createinnerhtml function
const createEmployeePayrollJSON = () => {
    let empPayrollListLocal = [
      {       
        _name: 'Daisy',
        _gender: 'female',
        _department: [
            'Engineering',
            'Finance'
        ],
        _salary: '500000',
        _startDate: '29 Oct 2019',
        _note: '',
        id: new Date().getTime(),
        _profilePic: '..\assets\Ellipse 1.png'
      },
      {
        _name: 'James',
        _gender: 'male',
        _department: [
            'Sales'
        ],
        _salary: '400000',
        _startDate: '15 Nov 2016',
        _note: '',
        id: new Date().getTime() + 1,
        _profilePic: '..\assets\Ellipse -5.png'
      }
    ];
    return empPayrollListLocal;
  }

