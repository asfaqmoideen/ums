"use strict";
import { APIService } from "../services/apiService";
import { UIController } from "./uiController";
import { PaginationController } from "./paginationController";
document.addEventListener("DOMContentLoaded", () => {
  const accessToken = sessionStorage.getItem("accessToken");
  const getcurrentUser = async () => {
    if (!accessToken) {
      document.location = "/";
      return
    }
    try {
      const response = await fetch('https://dummyjson.com/auth/me', {
        method: "GET",
        headers: {
          "Authorization": accessToken,
        },
      })
      if (response.status === 401) {
        document.location = "/";
        sessionStorage.removeItem('accessToken')
        return
      }
      if (response.status !== 200) {
        throw new Error("Could not fetch data");
      }
      const jsonData = await response.json();
      sessionStorage.setItem("user", JSON.stringify(jsonData))
    } catch (err) {
      console.log("Err :", err)
    }
  };
  getcurrentUser()
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem("accessToken");
    document.location = "/"
  })
  const directCon = new DirectoryController();
  directCon.updateInitailValues();
  directCon.displayAllUsers();

  const clearResults = document.getElementById("clearall");
  const filterForm = document.getElementById("filterform");
  const filterMenu = document.getElementById("filtermenu");
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    directCon.filterUsers(filterForm);
    clearResults.classList.remove("hidden");
    filterMenu.classList.add("hidden");
  });

  clearResults.addEventListener("click", () => {
    filterForm.reset();
    directCon.displayAllUsers();
    clearResults.classList.add("hidden");
  });

  const nameSearch = document.getElementById("searchbox");
  nameSearch.addEventListener("keyup", () => {
    directCon.searchUserByName(nameSearch.value);
  });

  const applyFilter = document.getElementById("applyFilter");
  applyFilter.addEventListener("click", () => {
    filterMenu.classList.remove("hidden");
  });

  document.getElementById("filterclosebtn").addEventListener("click", () => {
    filterMenu.classList.add("hidden");
  });

  document.getElementById("agefilter").addEventListener("change", (event) => {
    document.getElementById("agefilterspan").textContent = event.target.value;
  });

  const formHeading = document.getElementById('form-heading');
  const addBtn = document.getElementById("addUser");
  const submit = document.getElementById("user-form");

  addBtn.addEventListener("click", () => {
    formHeading.textContent = 'Add User';
    submit.reset();
  });
  submit.addEventListener("submit", async (event) => {
    event.preventDefault();
    directCon.tryCollectingFormData(formHeading);
  });
});

class DirectoryController {
  constructor() {
    this.uiCon = new UIController(this);
    this.paginate = new PaginationController();
    this.userApi = new APIService();
    this.sortBtnState = 0;
    this.currentUserId;
  }

  updateInitailValues() {
    this.uiCon.populateIniatialValues();
  }
  async tryAddingUser(userData) {
    try {
      const addedUser = await this.userApi.addUser(userData);
      console.log("newuser", addedUser);
      UIController.displayMessage("User Added Successfully!")
    } catch (error) {
      UIController.displayMessage(error, 'message')
    }
  }

  async tryUpdatingUser(user) {
    try {
      const updatedUser = await this.userApi.updateUser(this.currentUserId, user);
      console.log("updated", updatedUser);
      UIController.displayMessage("User Updated Successfully")
    } catch (error) {
      UIController.displayMessage(error, 'message')
    }
  }
  async tryCollectingFormData(formHeading) {
    const formID = document.getElementById("user-form");
    const userData = this.uiCon.collectFormData(formID);
    if (formHeading.textContent === 'Add User') {
      await this.tryAddingUser(userData);
    } else if (formHeading.textContent === 'Update User') {
      await this.tryUpdatingUser(userData);
    }
  }

  async filterUsers(form) {
    const roleFilter = form.rolefilter.value;
    const ageFilter = form.agefilter.value;
    const genderFilter = form.genderfilter.value;
    const bloodGroupFilter = form.bloodgroupfilter.value;

    try {
      if (
        roleFilter == 0 &&
        ageFilter == 20 &&
        genderFilter == 0 &&
        bloodGroupFilter == 0
      ) {
        throw new Error("No Feilds were selected");
      }

      if (roleFilter != 0) {
        const filteredUsers = await this.userApi.filterUsers("role", roleFilter);
        this.displayNoresultsFoundIfTotalZero(filteredUsers);
        this.uiCon.populateUsersTable(filteredUsers);
        return;
      }
      if (ageFilter > 20) {
        const filteredUsers = await this.userApi.filterUsers("age", ageFilter);
        this.displayNoresultsFoundIfTotalZero(filteredUsers);
        this.uiCon.populateUsersTable(filteredUsers);
        return;
      }
      if (bloodGroupFilter != 0) {
        const filteredUsers = await this.userApi.filterUsers("bloodGroup", bloodGroupFilter);
        this.displayNoresultsFoundIfTotalZero(filteredUsers);
        this.uiCon.populateUsersTable(filteredUsers);
        return;
      }
      if (genderFilter != 0) {
        const filteredUsers = await this.userApi.filterUsers("gender", genderFilter);
        this.displayNoresultsFoundIfTotalZero(filteredUsers);
        this.uiCon.populateUsersTable(filteredUsers);
        return;
      }
    } catch (e) {
      UIController.displayMessage(e.message, "error");
    }
  }

  displayNoresultsFoundIfTotalZero(filteredUsers) {
    if (filteredUsers.total === 0) {
      UIController.displayMessage("No results found", "message");
    }
  }

  async searchUserByName(name) {
    try {
      const users = await this.userApi.searchUser(name.trim());
      if (users.total === 0) {
        UIController.displayMessage("No results found", "message");
      }
      this.uiCon.populateUsersTable(users);
      return;
    } catch (e) {
      UIController.displayMessage(e.message, "message");
    }
  }

  async displayAllUsers() {
    this.uiCon.setResultsHeading("All Users");
    try {
      console.log(this.paginate.limit, this.paginate.skip);
      const users = await this.userApi.getUsers(this.paginate.limit, this.paginate.skip);
      const allusers = await this.userApi.getAllUsers();
      this.uiCon.populateUsersTable(allusers);
    } catch (e) {
      UIController.displayMessage(e.message, "message");
    }
  }

  async tryDeletingUser(user) {
    const result = await this.uiCon.getUserConfirmation(
      `delete ${user.firstName}`
    );
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

  async trySortingData(sortValue) {
    if (this.sortBtnState >= 2) {
      this.sortBtnState = 0;
      this.displayAllUsers();
      return;
    }
    if (sortValue == "name") {
      sortValue = "firstName";
    }
    const sortBtnValues = ["asc", "desc"];
    const sortedUsers = await this.userApi.sortUsers(
      sortValue,
      sortBtnValues[this.sortBtnState]
    );
    this.uiCon.setResultsHeading(
      `Sorted based on ${sortValue} in ${sortBtnValues[this.sortBtnState]
      } order`
    );
    this.uiCon.populateUsersTable(sortedUsers);
    this.sortBtnState++;
  }
}
