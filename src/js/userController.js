"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const uiCon = new UIController();
  const directCon = new DirectoryController(uiCon);

  directCon.updateInitailValues();
  directCon.displayAllUsers();

  const clearResults = document.getElementById("clearall");
  const searchForm = document.getElementById("searchsort");
  const sideMenu = document.getElementById("sidemenu");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    directCon.searchSortUser(searchForm);
    clearResults.classList.remove("hidden");
    sideMenu.classList.add("hidden");
  });

  clearResults.addEventListener("click", () => {
    searchForm.reset();
    directCon.displayAllUsers();
    clearResults.classList.add("hidden");
  });

  const nameSearch = document.getElementById("searchbox");
  nameSearch.addEventListener("keyup", () => {
    directCon.searchUserByName(nameSearch.value);
  });

  const applyFilter = document.getElementById("applyFilter");
  applyFilter.addEventListener("click", () => {
    sideMenu.classList.remove("hidden");
  });

  document.getElementById("filterclosebtn").addEventListener("click", () => {
    sideMenu.classList.add("hidden");
  });
});

class DirectoryController {
  constructor(uiCon) {
    this.filterTags = [
      { role: "Role" },
      { age: "Age" },
      { gender: "Gender" },
      { bloodGroup: "Blood Group" },
    ];
    this.uiCon = uiCon;
    this.userApi = new APIService();
  }

  updateInitailValues() {
    this.uiCon.setDropDown(this.filterTags, "filter");
    this.uiCon.setTableHeadings();
  }

  async searchSortUser(form) {
    const filterSelect = form.filterselect.value;
    const searchBox = form.search.value;

    try {
      if (filterSelect == 0 && !searchBox) {
        throw new Error("No Feilds were selected");
      }

      if (filterSelect != 0 && searchBox) {
        const filteredUsers = await this.userApi.filterUsers(
          filterSelect,
          searchBox
        );
        if (filteredUsers.total === 0) {
          UIController.displayMessage("No results found", "message");
        }
        this.uiCon.populateUsersTable(filteredUsers.users);
        return;
      }
    } catch (e) {
      UIController.displayMessage(e.message, "error");
    }
  }

  async searchUserByName(name) {
    try {
      const users = await this.userApi.searchUser(name);
      if (users.total == 0) {
        UIController.displayMessage("No results found", "message");
      }
      this.uiCon.populateUsersTable(users.users);
      return;
    } catch (e) {
      UIController.displayMessage(e.message, "message");
    }
  }

  async displayAllUsers() {
    try {
      const allusers = await this.userApi.getAllUsers();
      this.uiCon.populateUsersTable(allusers.users);
    } catch (e) {
      UIController.displayMessage(e.message, "message");
    }
  }
}

class APIService {
  constructor() {
    this.baseURL = "https://dummyjson.com/users";
  }

  async tryFetchingData(url) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error("Unable to Fetch");
      }
      return response.json();
    } catch (e) {
      throw e;
    }
  }

  async getAllUsers() {
    return await this.tryFetchingData(`${this.baseURL}`);
  }

  async sortUsers(value, order) {
    return await this.tryFetchingData(
      `${this.baseURL}?sortBy=${value}&order=${order}`
    );
  }

  async filterUsers(filter, value) {
    return await this.tryFetchingData(
      `${this.baseURL}/filter?key=${filter}&value=${value}`
    );
  }

  async searchUser(user) {
    return this.tryFetchingData(`${this.baseURL}/search?q=${user}`);
  }

  async deleteUser(userId) {
    try {
      const response = await fetch(`${this.baseURL}/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to delete User");
      }
      return response.json();
    } catch (e) {
      throw e;
    }
  }
}

class UIController {
  constructor() {
    this.tableHeadings = [
      { name: "Name" },
      { age: "Age" },
      { gender: "Gender" },
      { birthDate: "Date of Birth" },
      { bloodGroup: "Blood Group" },
      { height: "Height" },
      { weight: "Weight" },
      { role: "Role" },
      { action: "Action" },
    ];
    this.superKeys = ["firstName", "lastName", "email", "image"];
    this.superKeyValues = [];
    this.userApi = new APIService();
    this.sortBtnState = 0;
  }

  setDropDown(tags, type) {
    const dropDown = document.getElementById(`${type}select`);
    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = Object.keys(tag)[0];
      option.textContent = Object.values(tag);
      dropDown.appendChild(option);
    });
  }

  setTableHeadings() {
    const tableHead = document.querySelector("#users-tb thead");
    tableHead.textContent = "";
    const row = document.createElement("tr");
    row.appendChild(this.createCheckBox());
    this.tableHeadings.forEach((heading) => {
      const td = document.createElement("td");
      td.textContent = Object.values(heading);
      td.onclick = async () => {
        await this.trySortingData(Object.keys(heading)[0]);
      };
      row.appendChild(td);
    });
    tableHead.appendChild(row);
  }

  async trySortingData(sortValue) {
    if (this.sortBtnState >= 2) {
      this.sortBtnState = 0;
      this.populateUsersTable();
    }
    if (sortValue == "name") {
      sortValue = "firstName";
    }
    const sortBtnValues = ["asc", "desc"];
    console.log(sortBtnValues[this.sortBtnState]);
    const sortedUsers = await this.userApi.sortUsers(
      sortValue,
      sortBtnValues[this.sortBtnState]
    );
    this.populateUsersTable(sortedUsers.users);
    this.sortBtnState++;
  }

  populateUsersTable(users) {
    const usersTable = document.querySelector("#users-tb tbody");
    usersTable.textContent = " ";
    const domFrag = document.createDocumentFragment();

    users.forEach((user) => {
      const row = document.createElement("tr");
      row.appendChild(this.createCheckBox(row));
      for (let key in user) {
        if (this.superKeys.includes(key)) {
          this.superKeyValues.push(user[key]);
        } else if (this.superKeyValues.length > 3) {
          row.appendChild(this.createSuperCell(key, user));
        }
      }
      for (let key in user) {
        if (this.includesTableHeading(key)) {
          row.appendChild(this.createUserCells(key, user));
        }
      }
      row.appendChild(this.createActionCell(row, user, usersTable));
      domFrag.appendChild(row);
    });

    usersTable.appendChild(domFrag);
  }

  createUserCells(key, user) {
    const cell = document.createElement("td");
    if (key == "gender") {
      cell.textContent = user[key][0].toUpperCase();
    } else {
      cell.textContent = user[key];
      if (key == "role") {
        cell.classList.add("role", `${user[key]}`);
      }
    }
    return cell;
  }

  createSuperCell() {
    const cell = document.createElement("td");
    const div = document.createElement("div");
    div.className = "superCell";
    div.appendChild(this.createUserImage());
    div.appendChild(this.createNameEmailDiv());
    cell.appendChild(div);
    this.superKeyValues = [];
    return cell;
  }

  createNameEmailDiv() {
    const nameEmail = document.createElement("div");
    nameEmail.className = "nameEmail";
    const name = document.createElement("p");
    name.textContent = `${this.superKeyValues[0]} ${this.superKeyValues[1]}`;
    nameEmail.appendChild(name);

    const email = document.createElement("p");
    email.textContent = this.superKeyValues[2];
    email.className = "userEmail";
    nameEmail.appendChild(email);
    return nameEmail;
  }

  createUserImage() {
    const image = document.createElement("img");
    image.src = this.superKeyValues[3];
    image.className = "userImage";
    return image;
  }

  async tryDeletingUser(user) {
    const result = await this.getUserConfirmation(`delete ${user.firstName}`);
    if (result) {
      try {
        const deletedUser = await this.userApi.deleteUser(user.id);
        UIController.displayMessage(
          `User ${deletedUser.firstName} deleted`,
          "message"
        );
        return true;
      } catch (e) {
        UIController.displayMessage(e.message, "message");
      }
    }
  }

  includesTableHeading(key) {
    return this.tableHeadings.find(
      (a) => Object.keys(a)[0].toLowerCase() === key.toLowerCase()
    );
  }

  createActionCell(row, user, usersTable) {
    const actionCell = document.createElement("td");
    const actionDiv = document.createElement("div");
    actionDiv.className = "btn-wrap";
    const editBtn = this.createButton([
      "icon-btn",
      "fa-solid",
      "fa-user-pen",
      "edit",
    ]);
    const delBtn = this.createButton([
      "icon-btn",
      "fa-solid",
      "fa-trash-can",
      "del",
    ]);
    actionDiv.appendChild(editBtn);
    actionDiv.appendChild(delBtn);
    delBtn.onclick = async () => {
      if (await this.tryDeletingUser(user)) {
        usersTable.removeChild(row);
      }
    };
    editBtn.onclick = async () => {
      if (await this.tryDeletingUser()) {
      }
    };
    actionCell.appendChild(actionDiv);
    return actionCell;
  }

  createButton(classList) {
    const btn = document.createElement("button");
    btn.classList.add(classList[0], classList[1], classList[2], classList[3]);
    return btn;
  }

  createCheckBox(row) {
    const cell = document.createElement("td");
    const btn = document.createElement("input");
    btn.addEventListener("click", () => {
      row.classList.toggle("selected");
    });
    btn.type = "checkbox";
    cell.appendChild(btn);
    return cell;
  }

  getUserConfirmation(context) {
    this.showConfirmationBlock(true);
    document.getElementById(
      "confirm-title"
    ).textContent = `Are you sure to ${context}?`;

    return new Promise((resolve) => {
      document.getElementById("yesbtn").onclick = () => {
        this.showConfirmationBlock(false);
        resolve(true);
      };
      document.getElementById("nobtn").onclick = () => {
        this.showConfirmationBlock(false);
        resolve(false);
      };
    });
  }

  showConfirmationBlock(value) {
    const confirm = document.getElementById("confirmation");
    if (value) {
      confirm.classList.remove("hidden");
      return;
    }
    confirm.classList.add("hidden");
  }

  static displayMessage(message, type) {
    const errorDiv = document.getElementById(`${type}p`);
    errorDiv.textContent = message;
    setTimeout(function () {
      errorDiv.textContent = "";
    }, 3000); //
  }
}
