 'use strict';
document.addEventListener('DOMContentLoaded', () => {
    const uiCon = new UIController();
   const directCon = new DirectoryController(uiCon);

    directCon.updateDropDown();
    directCon.displayAllUsers();

   const filterSelect = document.getElementById("filter-select");
   filterSelect.addEventListener("change", () => {
        console.log(filterSelect.value);
        uiCon.populateSelectedTags(filterSelect.value);
   })

   const sortSelect = document.getElementById("sort-select");
   sortSelect.addEventListener("change", () => {
        console.log(sortSelect.value);
        uiCon.populateSelectedTags(sortSelect.value);
   })

   const searchForm = document.getElementById("search-sort");
   searchForm.addEventListener("submit",(event)=> {
    event.preventDefault();
    directCon.searchSortUser(searchForm);
   });

   const paginateControls = document.querySelectorAll(".pg-btn");
   paginateControls.forEach(paginateControl => {
        paginateControl.addEventListener("click",()=> {
            uiCon.updatePages(paginateControl.id);
        })
   });

})

class APIService{
    constructor(){}

    async getAllUsers(){
        const reponse = await fetch(`https://dummyjson.com/users`);
        return reponse.json();
    }

    async searchUser(user){
        const response = await fetch(`https://dummyjson.com/users/search?q=${user}`);
        return response.json();
    }

    async getUsers(limit, skip){
        const reponse = await fetch(`https://dummyjson.com/users?limit=${limit}&skip=${skip}`);
        return reponse.json();
    }

    async sortUsers(value, order){
        const response = fetch(`https://dummyjson.com/users?sortBy=${value}&order=${order}`);
        response.json();
    }
}

class UIController {
    constructor() {
        this.tableHeadings = ["Id", "FirstName", "LastName", "EMail", "Phone", "Role"];
        this.currentPage = 1;
        this.maxPage ;
        this.usersPerPage = 9;
    }

    setDropDown(tags, type){
        const dropDown = document.getElementById(`${type}-select`);
        tags.forEach(tag => {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            dropDown.appendChild(option);
        });
    }

    populateSelectedTags(tag){
        const container = document.getElementById(`field-container`);
        const div = document.createElement('div');
        div.className = 'selectedfield';
        const name = document.createElement('p');
        name.textContent = tag;
        const btn = document.createElement("button");
        btn.className = "icon-btn";
        btn.textContent = 'X';
        div.appendChild(name);
        div.appendChild(btn);
        container.appendChild(div);
        btn.onclick = () => {
            container.removeChild(div);
        }
    }

    clearAllTags(){

    }

    populateUsersTable(users){
        this.setTableHeadings();

        const usersTable = document.querySelector("#users-tb tbody");
        usersTable.textContent = " "; 
        console.log(users);
        users.forEach(user => {
            const row = document.createElement('tr');
                for(let key in user){
                    if(this.includesTableHeading(key)){
                        const cell = document.createElement('td');
                        cell.textContent = user[key];
                        row.appendChild(cell);
                    }
                }
                usersTable.appendChild(row); 
        });

    }

    includesTableHeading(key){
        return this.tableHeadings.find(a => a.toLowerCase() === key.toLowerCase());
    }

    setTableHeadings(){
        const tableHead = document.querySelector("#users-tb thead");
        tableHead.textContent = "";
        const row = document.createElement("tr");
        this.tableHeadings.forEach(heading =>{
            const td = document.createElement('td');
            td.textContent = heading;
            row.appendChild(td);
        })
        tableHead.appendChild(row);
    }   

    
    updatePages(id){
        if(id == "first"){
            this.currentPage = 1;
        }
        else if(id == "last"){
            this.currentPage = this.maxPage;
        }
        else if(id=="next"){
            this.currentPage++;
        }
        else if (id=="prev"){
            this.currentPage--;
        }
    }
}

class DirectoryController {
    constructor(uiCon){
        this.filterTags = ['Gender', 'Age', 'BloodGroup', 'University', 'Role'];
        this.sortTags = ['Name', 'Age', 'BirthDate', 'Height', 'Weight'];
        this.uiCon = uiCon;
        this.userApi = new APIService();
    }

    updateDropDown(){
        this.uiCon.setDropDown(this.filterTags, 'filter');
        this.uiCon.setDropDown(this.sortTags, 'sort');
    }


    async searchSortUser(form){
        if(form.searchbox.value){
            const users = await this.userApi.searchUser(form.searchbox.value);
            this.uiCon.populateUsersTable(users.users);
        }

        if(form.sortselect.value){
            const order = 'asc' ? form.sorttoggle.checked : 'dsc'
            console.log(form.sortselect.value, order);
            const sortedUsers = await this.userApi.sortUsers(form.filter-select.value, order);
            this.uiCon.populateUsersTable(sortedUsers.users);
        }
    }

    async displayAllUsers(){
        const allusers = await this.userApi.getAllUsers();
        this.uiCon.maxPage = Math.ceil(allusers.total / this.uiCon.usersPerPage);
        if(allusers.total > this.uiCon.usersPerPage){
            const skip = this.uiCon.currentPage ===1 ? 0 :  skip = (this.currentPage-1)*this.uiCon.usersPerPage;
            console.log(this.uiCon.usersPerPage, skip);
            const users = await this.userApi.getUsers(this.uiCon.usersPerPage, skip);
            this.uiCon.populateUsersTable(users.users);
            return;
        }
        this.uiCon.populateUsersTable(allusers.users);
    }


}