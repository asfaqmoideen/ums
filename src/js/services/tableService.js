export class TableService {
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