
import { database } from "../../firebase-config.js";
import { ref, get, push, remove, set, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
function showAddCategoryForm()
{
    const form=document.getElementById('addCategoryForm');
    form.style.display="block";
    //now this form is visible
    //and block because now it will disply the form in bock style
}

function cancelAddCategory()
{
    const input=document.getElementById('categoryName')
    const form =document.getElementById('addCategoryForm')
    const image=document.getElementById('categoryImage')
    
    input.value="";
    image.value="";
    form.style.display="none";
}

function addCategory(){
    const input=document.getElementById('categoryName').value.trim();
    const imageInput=document.getElementById('categoryImage');
    const imageFile=imageInput.files[0];
    if(input=="")
    {
        alert("Category name cannot be empty");
        return;
    }
    if (!imageFile) {
        alert("Please upload an image for the category");
        return;
    }

    //read the image file as data url
    const reader=new FileReader();
    reader.onload=function(e)
    {
        const imageUrl=e.target.result;
        //base encode as image url

    //adding category to firebase
        const categoryRef=ref(database,"categories");
        const newcategory=push(categoryRef);
    //generating a unique key for category

        const categoryData={
            id:newcategory.key,
            name:input,
            image:imageUrl,
    };

    set(newcategory, categoryData)
    .then(() => {
        alert("Category successfully added!");
        displayCategory(categoryData);
        cancelAddCategory();
    })
    .catch(() => {
        alert("Failed to add category! Please try again.");
    });
};
reader.onerror = function () {
    alert("Failed to read the image. Please try again.");
};
    reader.readAsDataURL(imageFile);
}

function displayCategory(categoryData)
{
    const table=document.getElementById('categoryTable');
    const newRow=document.createElement('tr');

    newRow.setAttribute("data-id",categoryData.id);
    //store category id for easy access

    newRow.innerHTML=
    `<td>${categoryData.name}</td>
    <td><img src="${categoryData.image} alt="${categoryData.name}" style="width: 100px; height: auto; "></td>
    <td>
    <button class="btn"onclick="editCategory('${categoryData.id}')">Edit</button>
    <button class="btn"onclick="deleteCategory('${categoryData.id}')">Delete</button>
    </td>`;
    table.append(newRow);
}
//function to load all categories from firebase

function loadCategories()
{
    const categoryRef=ref(database,"categories");
    get(categoryRef)
    .then((snapshot)=>{
        if(snapshot.exists())
        {
            const categories=snapshot.val();

            Object.values(categories).forEach((category)=>{
                displayCategory(category);
            });
            
        }
        else{
            console.log("No categories found")
        }
    })
}
function editCategory(categoryId)
{
    const newName=prompt("Enter the new Category")

    if(newName && newName.trim()!="")
    {
        const categoryRef=ref(database,`categories/${categoryId}`);
        update(categoryRef,{name:newName.trim()})
        .then(()=>{
            alert(`category updated successfully`);
            //update UI
            const row=document.querySelector(`tr[data-id="${categoryId}"]`)
            if(row)
            {
                row.cells[0].textContent=newName.trim();
            }
        })
        .catch((e)=>{
            alert("Failed to update category!");
        })
    }
}

function deleteCategory(categoryId)
{
    //firebase se delete
    const confirmation=confirm("Are you sure you want to delete category!");

    if(!confirmation) return
    //agar humne confirm nahi kiya then return to its previous state

    const categoryRef=ref(database,`categories/${categoryId}`)

    remove(categoryRef)
    .then(()=>{
        alert("Category deleted successfully!")

        //remove from ui
        const row=document.querySelector(`tr[data-id="${categoryId}"]`);

        if(row)
        {
            row.remove();
        }
    })
    .catch((err)=>{
        alert("Failed to delete!")
    })

    //ui se delete
}
window.onload = loadCategories; // Load categories when the page is loaded
window.showAddCategoryForm=showAddCategoryForm;
window.addCategory=addCategory;
window.editCategory=editCategory;
window.deleteCategory=deleteCategory;
window.cancelAddCategory=cancelAddCategory;