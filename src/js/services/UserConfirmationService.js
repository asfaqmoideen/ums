export class UserConfirmationService{
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
}