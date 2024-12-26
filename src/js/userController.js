"use strict";
import { APIService } from "./apiService";
import { UIController } from "./uiController";

document.addEventListener("DOMContentLoaded", () => {
  const directCon = new DirectoryController();

  directCon.updateInitailValues();
  directCon.displayAllUsers();

  const clearResults = document.getElementById("clearall");
  const filterForm = document.getElementById("filterform");
  const sideMenu = document.getElementById("sidemenu");
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    directCon.filterUsers(filterForm);
    clearResults.classList.remove("hidden");
    sideMenu.classList.add("hidden");
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
    sideMenu.classList.remove("hidden");
  });

  document.getElementById("filterclosebtn").addEventListener("click", () => {
    sideMenu.classList.add("hidden");
  });
});

class DirectoryController {
  constructor() {
    this.uiCon = new UIController(this);
    this.userApi = new APIService();
    this.sortBtnState = 0;
  }

  updateInitailValues() {
    this.uiCon.populateIniatialValues();
  }

  async filterUsers(form) {
    const roleFilter = form.rolefilter.value;
    const ageFilter = form.agefilter.value;
    const genderFilter = form.genderfilter.value;
    const bloodGroupFilter = form.bloodgroupfilter.value;

    console.log(roleFilter, ageFilter, genderFilter, bloodGroupFilter);

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
        const filteredUsers = await this.userApi.filterUsers(
          "role",
          roleFilter
        );
        if (filteredUsers.total === 0) {
          UIController.displayMessage("No results found", "message");
        }
        this.uiCon.populateUsersTable(filteredUsers.users);
        return;
      }
      if (ageFilter > 20) {
        const filteredUsers = await this.userApi.filterUsers("age", ageFilter);
        if (filteredUsers.total === 0) {
          UIController.displayMessage("No results found", "message");
        }
        this.uiCon.populateUsersTable(filteredUsers.users);
        return;
      }
      if (bloodGroupFilter != 0) {
        const filteredUsers = await this.userApi.filterUsers(
          "bloodGroup",
          bloodGroupFilter
        );
        if (filteredUsers.total === 0) {
          UIController.displayMessage("No results found", "message");
        }
        this.uiCon.populateUsersTable(filteredUsers.users);
        return;
      }
      if (genderFilter != 0) {
        const filteredUsers = await this.userApi.filterUsers(
          "gender",
          genderFilter
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
    console.log(sortBtnValues[this.sortBtnState]);
    const sortedUsers = await this.userApi.sortUsers(
      sortValue,
      sortBtnValues[this.sortBtnState]
    );
    this.uiCon.populateUsersTable(sortedUsers.users);
    this.sortBtnState++;
  }

  async tryEditingUser(user) {}
}
