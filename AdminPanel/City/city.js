import {database} from "../../firebase-config.js";
import { ref, get, set, update, remove, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

function showAddCityForm()
{
    const form=document.getElementById('addCityForm');
    form.style.display="block";
}

function cancelAddCity()
{
    const input=document.getElementById('cityName');
    const form=document.getElementById('addCityForm');
    input.value="";
    form.style.display="none";
}

function addCity()
{
    const input=document.getElementById('cityName').value.trim();
    if(input==="")
    {
        alert("add a city");
        return;
    }
    const cityRef=ref(database,"cities")
    const newCity=push(cityRef);

    const cityData={
        id:newCity.key,
        name:input
    }
    set(newCity,cityData)
    .then(()=>{
        alert("city successfully added");
        displayCity(cityData);

        cancelAddCity();

    })
    .catch((e)=>{
        alert("Failed to add City!.Please try again")
    })

}

function displayCity(cityData)
{
    const table=document.getElementById('cityTable');
    const newRow=document.createElement('tr');

    newRow.setAttribute("data-id",cityData.id);

    newRow.innerHTML=
    `<td class="cityNames">${cityData.name}</td>
            <td>
            <button class="btn" onclick="editCity('${cityData.id}')">Edit</button>
            <button class="btn" onclick="deleteCity('${cityData.id}')">Delete</button>
        </td>`;
    table.append(newRow);


}
function editCity(cityId)
{
    const newName=prompt("Enter new city")
    if(newName && newName.trim()!="")
    {
        const cityRef=ref(database,`cities/${cityId}`)
        update(cityRef,{name:newName.trim()})
        .then(()=>{
            //update UI
            const row=document.querySelector(`tr[data-id="${cityId}"]`)
            if(row)
            {
                row.cells[0].textContent=newName.trim();
            }
            alert(`city updated successfully`);
        })
        .catch((e)=>{
            alert("Failed to update city!");
        })
    }
}

function deleteCity(cityId)
{
    const confirmation=confirm("Are u sure you want to delete it");
    if(!confirmation) return;
    const cityRef=ref(database,`cities/${cityId}`)
    remove(cityRef)
    .then(()=>{

        //remove from ui
        const row=document.querySelector(`tr[data-id="${cityId}"]`);

        if(row)
        {
            row.remove();
        }
        alert("City deleted successfully!")
    })
    .catch((err)=>{
        alert("Failed to delete!")
    })

    //ui se delete
}

function loadCities()
{
    const cityRef=ref(database,'cities');
    get(cityRef)
    .then((snapshot)=>{
        if(snapshot.exists())
        {
            const cities=snapshot.val();

            Object.values(cities).forEach((city)=>{
                displayCity(city);
            })
        }
        else{
            console.log("No categories Found")
        }
    })
}
window.onload=loadCities();
window.showAddCityForm=showAddCityForm
window.cancelAddCity=cancelAddCity
window.addCity=addCity;
window.displayCity=displayCity;
window.editCity=editCity;
window.deleteCity=deleteCity;