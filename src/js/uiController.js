export class UIController {
  constructor(directCon) {
    this.directCon = directCon;
    this.tableService = new TableService();
    this.filterTags = [
      { role: "Role" },
      { age: "Age" },
      { gender: "Gender" },
      { bloodGroup: "Blood Group" },
    ];
  }

  populateIniatialValues() {
    this.setDropDown(this.filterTags, "filter");
    this.tableService.setTableHeadings();
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

  populateUsersTable(users) {
    const usersTable = document.querySelector("#users-tb tbody");
    usersTable.textContent = " ";
    const domFrag = document.createDocumentFragment();

    users.forEach((user) => {
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
}

class TableService {
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
        await this.directCon.trySortingData(Object.keys(heading)[0]);
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
      if (await this.directCon.tryDeletingUser(user)) {
        usersTable.removeChild(row);
      }
    };
    editBtn.onclick = async () => {
      if (await this.directCon.tryEditingUser(user)) {
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
}
