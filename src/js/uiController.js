export class UIController {
  constructor(directCon) {
    this.directCon = directCon;
    this.tableService = new TableService(this);
    this.paginate = new PaginationController();
    this.filterRoles = [{ moderator: "Moderator" }, { user: "User" }];
    this.filterBloodGroups = [
      { "A+": "A+" },
      { "A-": "A-" },
      { "B+": "B+" },
      { "B-": "B-" },
      { "AB+": "AB+" },
      { "AB-": "AB-" },
      { "O+": "O+" },
      { "O-": "O-" },
    ];
    this.filterGender = [{ male: "Male" }, { female: "Female" }];
  }

  populateIniatialValues() {
    this.setDropDown(this.filterRoles, "role");
    this.setDropDown(this.filterBloodGroups, "bloodgroup");
    this.setDropDown(this.filterGender, "gender");
    this.tableService.setTableHeadings();
  }

  setDropDown(tags, type) {
    const dropDown = document.getElementById(`${type}filter`);
    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = Object.keys(tag)[0];
      option.textContent = Object.values(tag);
      dropDown.appendChild(option);
    });
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
    }, 3000);
  }

  populateUsersTable(usersObj) {
    const usersTable = document.querySelector("#users-tb tbody");
    usersTable.textContent = " ";
    const domFrag = document.createDocumentFragment();

    usersObj.users.forEach((user) => {
      const row = document.createElement("tr");
      row.appendChild(this.tableService.createCheckBox(row));
      this.tableService.populateSuperCell(user, row);
      for (let key in user) {
        if (this.tableService.includesTableHeading(key)) {
          row.appendChild(this.tableService.createUserCells(key, user));
        }
      }
      row.appendChild(
        this.tableService.createActionCell(row, user, usersTable)
      );
      domFrag.appendChild(row);
    });

    usersTable.appendChild(domFrag);
  }

  setResultsHeading(content) {
    document.getElementById("main-cont-title").textContent = content;
  }

  setTotalResults(users) {
    document.getElementById(
      "noofresults"
    ).textContent = `Total Results : ${users}`;
  }

  populateForm(userData) {
    const form = document.getElementById('user-form');
    for (const [key, value] of Object.entries(userData)) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'date') {
                const formattedDate = new Date(value).toISOString().split('T')[0];
                input.value = formattedDate;
            } else if (input.tagName === 'SELECT') {
                input.value = value;
            } else {
                input.value = value || '';
            }
        }
    }
  }
  collectFormData(form) {
    const formData = new FormData(form);
    return Object.fromEntries(formData.entries());
}
}

class TableService {
  constructor(uiCon) {
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
    this.uiCon = uiCon;
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
        await this.uiCon.directCon.trySortingData(Object.keys(heading)[0]);
      };
      row.appendChild(td);
    });
    tableHead.appendChild(row);
  }

  populateSuperCell(user, row) {
    for (let key in user) {
      if (this.superKeys.includes(key)) {
        this.superKeyValues.push(user[key]);
      } else if (this.superKeyValues.length > 3) {
        row.appendChild(this.createSuperCell(key, user));
      }
    }
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
    nameEmail.appendChild(this.createNameTag());
    nameEmail.appendChild(this.createEmailTag());
    return nameEmail;
  }

  createNameTag(){
    const name = document.createElement("p");
    name.textContent = `${this.superKeyValues[0]} ${this.superKeyValues[1]}`;
    return name;
  }

  createEmailTag(){
    const email = document.createElement("p");
    email.textContent = this.superKeyValues[2];
    email.className = "userEmail";
    return email;
  }
  createUserImage() {
    const image = document.createElement("img");
    image.src = this.superKeyValues[3];
    image.className = "userImage";
    return image;
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
    
    actionDiv.appendChild(this.configureEditButton(user));
    actionDiv.appendChild(this.configureDeleteButton(user, usersTable, row));

    actionCell.appendChild(actionDiv);
    return actionCell;
  }

  createButton(classList) {
    const btn = document.createElement("button");
    classList.forEach((className) => {
      btn.classList.add(className);
    })
    return btn;
  }

  configureEditButton(user){
    const editBtn = this.createButton(["icon-btn","fa-solid","fa-user-pen","edit",]); 
    editBtn.setAttribute("data-bs-toggle", "modal");
    editBtn.setAttribute("data-bs-target", "#addUserModal");
    editBtn.onclick = async () => {
      document.getElementById('form-heading').textContent = "Update User";
      this.uiCon.directCon.currentUserId = user.id;
      this.uiCon.populateForm(user);
    };
    return editBtn;
  }

  configureDeleteButton(user, usersTable, row){
    const delBtn = this.createButton(["icon-btn","fa-solid","fa-trash-can","del",]);
    delBtn.onclick = async () => {
      if (await this.uiCon.directCon.tryDeletingUser(user)) {
        usersTable.removeChild(row);
      }
    };
    return delBtn;
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
}

export class PaginationController {
  constructor() {
    this.currentPage = 1;
    this.maxPage = 0;
    this.usersperpage = document.getElementById("noofusers").value;
    this.limit = 0;
    this.skip = 0;
    this.firstBtn = document.getElementById("first-btn");
    this.nextBtn = document.getElementById("next-btn");
    this.lastBtn = document.getElementById("last-btn");
    this.prevBtn = document.getElementById("prev-btn");
    this.setEventListeners();
  }

  setEventListeners() {
    this.firstBtn.addEventListener("click", () => {
      this.currentPage = 1;
      this.setPageNumber();
    });
    this.nextBtn.addEventListener("click", () => {
      this.currentPage++;
      this.setPageNumber();
    });
    this.prevBtn.addEventListener("click", () => {
      this.currentPage--;
      this.setPageNumber();
    });
    this.lastBtn.addEventListener("click", () => {
      this.currentPage = this.maxPage;
      this.setPageNumber();
    });
    document.getElementById("noofusers").addEventListener("change", (event) => {
      this.usersperpage = event.target.value;
    });

    this.setLimit();
    this.setSkip();
  }

  setPages(totalUsers) {
    this.maxPage = Math.ceil(totalUsers / this.usersperpage);
  }

  isPaginationRequired() {
    return this.maxPage > 1;
  }

  setPageNumber() {
    document.getElementById("pagenumber").textContent = this.currentPage;
    this.checkFirtLastPage();
    this.setLimit();
    this.setSkip();
  }

  checkFirtLastPage() {
    this.firstBtn.disabled = false;
    this.lastBtn.disabled = false;
    this.nextBtn.disabled = false;
    this.prevBtn.disabled = false;
    if (this.currentPage === 1) {
      this.firstBtn.disabled = true;
      this.prevBtn.disabled = true;
    } else if (this.currentPage === this.maxPage) {
      this.nextBtn.disabled = true;
      this.lastBtn.disabled = true;
    }
  }

  setLimit() {
    this.limit = this.usersperpage;
  }

  setSkip() {
    this.skip = this.usersperpage * (this.currentPage - 1);
  }
}
