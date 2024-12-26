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
