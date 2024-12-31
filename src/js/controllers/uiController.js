import { TableService } from "../services/tableService";
import { PaginationController } from "./paginationController";

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



