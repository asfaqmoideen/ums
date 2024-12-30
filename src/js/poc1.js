"use strict";

class UserLogic {
    constructor() {
        this.baseURL = "https://dummyjson.com/users";
    }

    async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error during fetch:", error);
            throw error;
        }
    }

    async addUser(userData) {
        const url = `${this.baseURL}/add`;
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        };
        return await this.fetchData(url, options);
    }

    async updateUser(userId, updatedData) {
        const url = `${this.baseURL}/${userId}`;
        const options = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        };
        return await this.fetchData(url, options);
}

}

class UserUI {
    collectFormData(form) {
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries());
    }

    renderResponse(data) {
        console.log('Response:', JSON.stringify(data, null, 2));
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
}

document.addEventListener("DOMContentLoaded", () => {
    const submit = document.getElementById("user-form");
    const errormsg = document.querySelector(".error-msg");
    const formHeading = document.getElementById('form-heading');
    const addBtn = document.getElementById("add-user-btn");
    const updateBtn = document.getElementById("modify-user-btn"); 
    const userLogic = new UserLogic();
    const userUI = new UserUI();

    let currentUserId = null; 

    
    addBtn.addEventListener("click", () => {
        formHeading.textContent = 'Add User';  
        submit.reset(); 
        errormsg.textContent = "";
        currentUserId = null; 
    });

    updateBtn.addEventListener("click", () => {
        formHeading.textContent = 'Update User';
        const sampleUserData = {
            userId: 1,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            birthDate: "1990-01-01",
            gender: "male",
        };

        currentUserId = sampleUserData.userId;
        userUI.populateForm(sampleUserData);
    });

    submit.addEventListener("submit", async (event) => {
        event.preventDefault();
        errormsg.textContent = "";

        const formID = document.getElementById("user-form");
        const userData = userUI.collectFormData(formID);
        console.log("User data collected:", userData);

        if (formHeading.textContent === 'Add User') {
            await handleAddUser(userData);
        } else if (formHeading.textContent === 'Update User') {
            await handleUpdateUser(userData, currentUserId);
        }
    });

    async function handleAddUser(userData) {
        try {
            const addedUser = await userLogic.addUser(userData);
            userUI.renderResponse(addedUser);
            errormsg.textContent = "User Added Successfully!";
        } catch (error) {
            errormsg.textContent = error.message;
        }
    }

    async function handleUpdateUser(userData, userId) {
    
        try {
            const updatedUser = await userLogic.updateUser(userId, userData);
            userUI.renderResponse(updatedUser);
            errormsg.textContent = "User Updated Successfully!";
        } catch (error) {
            errormsg.textContent = error.message;
        }
    }
});
