"use strict"
document.addEventListener('DOMContentLoaded', () => {
    const uiCon = new UIController();
    const directCon = new DirectoryController(uiCon);

    directCon.updateInitailValues();
    directCon.displayAllUsers();

    const clearResults = document.getElementById("clearall");
    const searchForm = document.getElementById("searchsort");
    const sideMenu = document.getElementById("sidemenu");
    searchForm.addEventListener("submit",(event)=> {
    event.preventDefault();
    directCon.searchSortUser(searchForm);
    clearResults.classList.remove("hidden");

    });

    clearResults.addEventListener("click",()=> {
    searchForm.reset();
    directCon.displayAllUsers();
    clearResults.classList.add("hidden");
    });

   const nameSearch = document.getElementById("searchbox");
   nameSearch.addEventListener("keyup",()=>{
        directCon.searchUserByName(nameSearch.value);
   });

   const applyFilter = document.getElementById("applyFilter");
   applyFilter.addEventListener("click",()=>{
    applyFilter.textContent == "Close" ? applyFilter.textContent = "Apply Filter" : applyFilter.textContent = "Close" ;
    sideMenu.classList.toggle("hidden");
   })
})

class DirectoryController {
    constructor(uiCon){
        this.filterTags = [ 
            {role:"Role"}, 
            {age:'Age'},
            {gender:'Gender'},
            {bloodGroup : "Blood Group"},
        ];
        this.sortTags = [ 
            {id :"Id"}, 
            {firstName :"First Name"}, 
            {lastName:"Last Name"},
            {age:'Age'},
            {birthDate:'Date of Birth'},
            {height : 'Height'},
            {weight : 'Weight'}
        ];
        this.uiCon = uiCon;
        this.userApi = new APIService();
    }

    updateInitailValues(){
        this.uiCon.setDropDown(this.filterTags, 'filter');
        this.uiCon.setDropDown(this.sortTags, 'sort');
        this.uiCon.setTableHeadings();
    }


    async searchSortUser(form){
        
        const sortValue = form.sortselect.value;
        const filterSelect = form.filterselect.value;
        const searchBox = form.search.value;
   
       try{
        if(sortValue==0 && filterSelect==0 && !searchBox){
            throw new Error("No Feilds were selected");
        }

        if(filterSelect !=0 && searchBox){
            const filteredUsers = await this.userApi.filterUsers(filterSelect, searchBox);
            if(filteredUsers.total ===0){
                UIController.displayMessage("No results found", 'message');
            }
            this.uiCon.populateUsersTable(filteredUsers.users);
            return;
        }

        if(sortValue != 0){
            const order = form.sorttoggle.checked ? 'asc' : 'desc';
            const sortedUsers = await this.userApi.sortUsers(sortValue, order);
            if(sortedUsers.total === 0){
                UIController.displayMessage("No results found", 'message');
            }
            this.uiCon.populateUsersTable(sortedUsers.users);
            return;
        }
        }
        catch(e){
            UIController.displayMessage(e.message,'error');
        }
    }   

    async searchUserByName(name){
        try{
            const users = await this.userApi.searchUser(name);
            if(users.total == 0){
                UIController.displayMessage("No results found", 'message');
            }
            this.uiCon.populateUsersTable(users.users);
            return;
        }
        catch(e){
            UIController.displayMessage(e.message,'message')
        }
    }

    async displayAllUsers(){
        try{
        const allusers = await this.userApi.getAllUsers();
        this.uiCon.populateUsersTable(allusers.users);
        }
        catch(e){
            UIController.displayMessage(e.message,'message')
        }
    }
}


class APIService{
    constructor(){
        this.baseURL = 'https://dummyjson.com/users';
    }
    
    async tryFetchingData(url){
        try {
            const response = await fetch(url,{ method: 'GET'});
            if(!response.ok){
                throw new Error("Unable to Fetch");
            }
            return response.json();
        }
        catch(e){
            throw e;
        }
    }

    async getAllUsers(){
        return await this.tryFetchingData(`${this.baseURL}`);
    }

    
    async sortUsers(value, order){
        return await this.tryFetchingData(`${this.baseURL}?sortBy=${value}&order=${order}`);
    }
    
    async filterUsers(filter, value){
        return await this.tryFetchingData(`${this.baseURL}/filter?key=${filter}&value=${value}`)
    }
    
    
    async searchUser(user){
        return this.tryFetchingData(`${this.baseURL}/search?q=${user}`);
    }

    async deleteUser(userId){
        try {
            const response = await fetch(`${this.baseURL}/${userId}`, {
                method: 'DELETE',
            })
            if(!response.ok){
                throw new Error("Unable to delete User");
            }
            return response.json();
        }
        catch(e){
            throw e;
        }
    }
}


class UIController {
    constructor() {
        this.tableHeadings = [
            {id :"Id"}, 
            {firstName :"First Name"}, 
            {lastName:"Last Name"},
            {age:'Age'},
            {gender:'Gender'},
            {birthDate:'Date of Birth'},
            {bloodGroup : "Blood Group"},
            {height:"Height"},
            {weight:"Weight"},
            {role:"Role"},
            {action:"Action"}
        ];
        this.userApi=new APIService();
    }

    setDropDown(tags, type){
        const dropDown = document.getElementById(`${type}select`);
        tags.forEach(tag => {
            const option = document.createElement("option");
            option.value = Object.keys(tag)[0]; 
            option.textContent = Object.values(tag);
            dropDown.appendChild(option);
        });
    }

    setTableHeadings(){
        const tableHead = document.querySelector("#users-tb thead");
        tableHead.textContent = "";
        const row = document.createElement("tr");
        this.tableHeadings.forEach(heading =>{
            const td = document.createElement('td');
            td.textContent = Object.values(heading);
            row.appendChild(td);
        })
        tableHead.appendChild(row);
    }   
    
    populateUsersTable(users){
        const usersTable = document.querySelector("#users-tb tbody");
        usersTable.textContent = " "; 
        const domFrag = document.createDocumentFragment();

        users.forEach(user => {
            const row = document.createElement('tr');
                for(let key in user){
                    if(this.includesTableHeading(key)){
                        const cell = this.createUserCells(key, user);
                        row.appendChild(cell);
                    }
                }
                const butcell = document.createElement("td");
                const delBtn = this.createButton(`Remove`);
                butcell.appendChild(delBtn);
                row.appendChild(butcell);
                delBtn.onclick = async () => {
                    if(await this.tryDeletingUser(user)){
                        usersTable.removeChild(row);
                    }
                }
                domFrag.appendChild(row); 
        });

        usersTable.appendChild(domFrag);
    }

    createUserCells(key, user) {
        const cell = document.createElement('td');
        if (key == "gender") {
            cell.textContent = user[key][0].toUpperCase();
        }
        else {
            cell.textContent = user[key];
            if (key == "role") {
                cell.classList.add("role", `${key}`);
            }
        }
        return cell;
    }

    async tryDeletingUser(user) {
        const result = await this.getUserConfirmation(`delete ${user.firstName}`);
        if (result) {
            try{
                const deletedUser = await this.userApi.deleteUser(user.id);
                UIController.displayMessage(`User ${deletedUser.firstName} deleted`, 'message');
                return true;
            }
            catch(e){
                UIController.displayMessage(e.message,'message');
            }
        }
    }

    includesTableHeading(key){
        return this.tableHeadings.find(a => 
            Object.keys(a)[0].toLowerCase() === key.toLowerCase()
        );
    }

    
    createButton(textContent){
        const btn = document.createElement('button');
        btn.className = "icon-btn";
        btn.textContent = textContent;
        return btn;
    }
    
    getUserConfirmation(context) {
        this.showConfirmationBlock(true);
        document.getElementById('confirm-title').textContent = `Are you sure to ${context}?`;
        
        return new Promise((resolve) => {
            document.getElementById('yesbtn').onclick = () => {
                this.showConfirmationBlock(false);
                resolve(true);
            };
            document.getElementById('nobtn').onclick = () => {
                this.showConfirmationBlock(false);
                resolve(false);
            };
        });
    }
    
    showConfirmationBlock(value){
        const confirm = document.getElementById('confirmation');
        if(value){
            confirm.classList.remove("hidden");
            return;
        }
        confirm.classList.add("hidden");
    }

    static displayMessage(message,type){
        const errorDiv =  document.getElementById(`${type}p`);
        errorDiv.textContent = message;
        setTimeout(function(){errorDiv.textContent = ""}, 3000);//
    }
}
