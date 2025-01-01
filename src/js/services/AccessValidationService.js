"use strict";
export class AccessValidationService {
  validateCurrentUser = async (accessToken) => {
    if (!accessToken) {
      document.location = "/";
      return;
    }
    try {
      const response = await fetch('https://dummyjson.com/auth/me', {
        method: "GET",
        headers: {
          "Authorization": accessToken,
        },
      });
      if (response.status === 401) {
        document.location = "/";
        sessionStorage.removeItem('accessToken');
        return;
      }
      if (response.status !== 200) {
        throw new Error("Could not fetch data");
      }
      const jsonData = await response.json();
      sessionStorage.setItem("user", JSON.stringify(jsonData));
    } catch (err) {
      console.log("Err :", err);
    }
  };
}
