import { database } from "../../firebase-config.js";
import { ref, get, set, update, remove, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
function showAddAreaForm()
{
    const form=document.getElementById('addAreaForm');
    form.style.display="block";
    const citySelect=document.getElementById('citySelect');
    const cityRef=ref(database,"cities");
    get(cityRef)
    .then((snapshot)=>{
        if(snapshot.exists()){
            const cities=snapshot.val();

            citySelect.innerHTML=`<option value=''>Select City</option>`;

            Object.values(cities).forEach((city)=>{
                const option=document.createElement('option');
                option.value=city.id;
                option.textContent=city.name;
                citySelect.appendChild(option);
            })
        }
        else{
            alert("No city found")
        }
    })
    .catch((error) => {
        console.error("Error fetching cities: ", error);
    });
}

function cancelAddArea()
{
    console.log("cancel button clicked")
    const input=document.getElementById('areaName');
    const form=document.getElementById('addAreaForm');
    input.value="";
    form.style.display="none";
}

function addArea()
{
    const input=document.getElementById('areaName').value.trim();
    const citySelect = document.getElementById('citySelect');

    if (!citySelect) {
        console.error('City select element not found!');
        alert('City select element is not found. Please check your HTML structure.');
        return;
    }
    const selectedCity=citySelect.value;
    if(input==="" || selectedCity==="")
    {
        alert("Please enter a valid area name and select a city");
        return;
    }
    const areaRef=ref(database,"areas")
    const newArea=push(areaRef);

    const AreaData={
        id:newArea.key,
        name:input,
        cityId:selectedCity
    }
    set(newArea,AreaData)
    .then(()=>{
        alert("area successfully added");
        displayArea(AreaData);

        cancelAddArea();

    })
    .catch((e)=>{
        alert("Failed to add area!.Please try again")
    })

}

function displayArea(AreaData)
{
    const table=document.getElementById('areaTable');
    const newRow=document.createElement('tr');

    newRow.setAttribute("data-id",AreaData.id);

    const cityRef = ref(database, `cities/${AreaData.cityId}`);
    get(cityRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const city = snapshot.val();
                newRow.innerHTML = `
                    <td>${AreaData.name}</td>
                    <td>${city.name}</td>
                    <td>
                        <button class="btn" onclick="editArea('${AreaData.id}')">Edit</button>  
                        <button class="btn" onclick="deleteArea('${AreaData.id}')">Delete</button>                  
                    </td>
                `;
                table.append(newRow);
            } else {
                console.log("City not found for area");
            }
        })
        .catch((e) => {
            console.error("Error fetching city data: ", e);
        });

}
function editArea(AreaId)
{
    const newName=prompt("Enter new area")
    if(newName && newName.trim()!="")
    {
        const areaRef=ref(database,`areas/${AreaId}`)
        update(areaRef,{name:newName.trim()})
        .then(()=>{
            //update UI
            const row=document.querySelector(`tr[data-id="${AreaId}"]`)
            if(row)
            {
                row.cells[0].textContent=newName.trim();
            }
            alert(`area updated successfully`);
        })
        .catch((e)=>{
            alert("Failed to update area!");
        })
    }
}

function deleteArea(AreaId)
{
    const confirmation=confirm("Are u sure you want to delete it");
    if(!confirmation) return;
    const areaRef=ref(database,`areas/${AreaId}`)
    remove(areaRef)
    .then(()=>{

        //remove from ui
        const row=document.querySelector(`tr[data-id="${AreaId}"]`);

        if(row)
        {
            row.remove();
        }
        alert("Area deleted successfully!")
    })
    .catch((err)=>{
        alert("Failed to delete!")
    })

    //ui se delete
}

function loadArea()
{
    const areaRef=ref(database,'areas');
    get(areaRef)
    .then((snapshot)=>{
        if(snapshot.exists())
        {
            const areas=snapshot.val();

            Object.values(areas).forEach((area)=>{
                displayArea(area);
            })
        }
        else{
            console.log("No area Found")
        }
    })
}


window.onload=loadArea;
window.showAddAreaForm=showAddAreaForm
window.cancelAddArea=cancelAddArea
window.addArea=addArea;
window.displayArea=displayArea;
window.editArea=editArea;
window.deleteArea=deleteArea;