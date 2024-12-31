export class PaginationController {
    constructor() {
      this.currentPage = 1;
      this.maxPage = 0;
      this.usersperpage = document.getElementById("noofusers").value;
      this.limit = 0;
      this.skip = 0;
      this.firstBtn = document.getElementById("first-btn");
      this.nextBtn = document.getElementById("next-btn");
      this.lastBtn = document.getElementById("last-btn");
      this.prevBtn = document.getElementById("prev-btn");
      this.setEventListeners();
    }
  
    setEventListeners() {
      this.firstBtn.addEventListener("click", () => {
        this.currentPage = 1;
        this.setPageNumber();
      });
      this.nextBtn.addEventListener("click", () => {
        this.currentPage++;
        this.setPageNumber();
      });
      this.prevBtn.addEventListener("click", () => {
        this.currentPage--;
        this.setPageNumber();
      });
      this.lastBtn.addEventListener("click", () => {
        this.currentPage = this.maxPage;
        this.setPageNumber();
      });
      document.getElementById("noofusers").addEventListener("change", (event) => {
        this.usersperpage = event.target.value;
      });
  
      this.setLimit();
      this.setSkip();
    }
  
    setPages(totalUsers) {
      this.maxPage = Math.ceil(totalUsers / this.usersperpage);
    }
  
    isPaginationRequired() {
      return this.maxPage > 1;
    }
  
    setPageNumber() {
      document.getElementById("pagenumber").textContent = this.currentPage;
      this.checkFirtLastPage();
      this.setLimit();
      this.setSkip();
    }
  
    checkFirtLastPage() {
      this.firstBtn.disabled = false;
      this.lastBtn.disabled = false;
      this.nextBtn.disabled = false;
      this.prevBtn.disabled = false;
      if (this.currentPage === 1) {
        this.firstBtn.disabled = true;
        this.prevBtn.disabled = true;
      } else if (this.currentPage === this.maxPage) {
        this.nextBtn.disabled = true;
        this.lastBtn.disabled = true;
      }
    }
  
    setLimit() {
      this.limit = this.usersperpage;
    }
  
    setSkip() {
      this.skip = this.usersperpage * (this.currentPage - 1);
    }
  }
  