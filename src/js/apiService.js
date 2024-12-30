export class APIService {
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

  async getUsers(limit, skip){
    return await this.tryFetchingData(`${this.baseURL}?limit=${limit}&skip=${skip}`)
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
    console.log(`${this.baseURL}/${userId}`);
    const options = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
    };
    return await this.fetchData(url, options);
  }

  async fetchData(url, options = {}) {
    console.log(url, options);
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
