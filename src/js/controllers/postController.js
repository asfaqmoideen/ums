"use strict"
document.addEventListener("DOMContentLoaded", async () => {
    renderAllPosts();

    const searchInput = document.querySelector('.searchInput');
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.toLowerCase();

        if (query === '') {
            document.getElementById('no-results').textContent = '';
            renderAllPosts();
        } else {
            const searchedPosts = await fetchSearchedPosts(query);
            if (searchedPosts.total === 0) {
                document.getElementById('no-results').textContent = 'No search results found☹️!';
            }
            console.log('searchedposts', searchedPosts.posts);
            renderAllPosts(searchedPosts.posts);
        }
    });
    const likesDiv = document.getElementById("likes-div");
    const dislikesDiv = document.getElementById("dislikes-div");
    const likesArrowUp = document.getElementById("likes-arrow-up");
    const likesArrowDown = document.getElementById("likes-arrow-down");
    const dislikesArrowUp = document.getElementById("dislikes-arrow-up");
    const dislikesArrowDown = document.getElementById("dislikes-arrow-down");
    const reset = document.getElementById("reset");

    likesDiv.addEventListener("click", () => {
        handleSort("likes", likesArrowUp, likesArrowDown);
    });

    dislikesDiv.addEventListener("click", () => {
        handleSort("dislikes", dislikesArrowUp, dislikesArrowDown);
    });
    reset.addEventListener("click", () => {
        renderAllPosts();
        likesArrowUp.style.display = 'inline';
        dislikesArrowUp.style.display = 'inline';
        likesArrowDown.style.display = 'none';
        dislikesArrowDown.style.display = 'none';
    })
    let currentSort = { type: "", order: "" };
    async function fetchAndSortPosts(sortBy, order) {
        const posts = await fetchAllPosts();
        if (sortBy === "likes" || sortBy === "dislikes") {
            posts.sort((post1, post2) => {
                const val1 = post1.reactions[sortBy];
                const val2 = post2.reactions[sortBy];
                return order === "asc" ? val1 - val2 : val2 - val1;
            });
        }
        renderAllPosts(posts);
    }
    function handleSort(sortBy, arrowUp, arrowDown) {
        const newOrder = currentSort.order === "asc" ? "desc" : "asc";
        currentSort = { type: sortBy, order: newOrder };
        if (newOrder === "asc") {
            arrowUp.style.display = "inline";
            arrowDown.style.display = "none";
        } else {
            arrowUp.style.display = "none";
            arrowDown.style.display = "inline";
        }
        fetchAndSortPosts(sortBy, newOrder);
    }
});

function printToastMessage(error, backgroundColor) {
    Toastify({
        text: `${error}`,
        duration: 2500,
        gravity: "top",
        position: "right",
        className: "toastify",
        backgroundColor: `${backgroundColor}`,
    }).showToast();
}
async function fetchAllPosts() {

    const response = await fetchFromEndPoint('https://dummyjson.com/posts');
    return response.posts;

}

async function fetchFromEndPoint(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch post data.");
        }
        return response.json();
    }
    catch (error) {
        printToastMessage(error.message, "linear-gradient(to right, #dc3545, #c82333)");
    }
}
async function fetchSearchedPosts(query) {
    const response = await fetchFromEndPoint(`https://dummyjson.com/posts/search?q=${query}`);
    console.log('response', response);
    return response;
}

async function fetchSortPosts(sortBy, order) {
    const response = await fetchFromEndPoint(`https://dummyjson.com/posts?sortBy=${sortBy}&order=${order}`);
    return response.posts;
}
async function deletePostsbyId(postId) {

    const response = await fetchFromEndPoint(`https://dummyjson.com/posts/${postId}`, {
        method: 'DELETE',
    });
    return response.posts;

}

async function renderAllPosts(postsToRender) {
    const cardContainer = document.getElementById('custom-cards-container');
    cardContainer.innerHTML = '';

    const posts = postsToRender ? postsToRender : await fetchAllPosts();

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'card custom-card';

        const title = document.createElement('h2');
        title.textContent = post.title;

        const body = document.createElement('p');
        body.className = 'text-muted '
        body.textContent = post.body;

        const likes = document.createElement('span');
        likes.className = 'likes';
        likes.textContent = `❤️ ${post.reactions.likes}`;

        const dislikes = document.createElement('span');
        dislikes.className = 'dislikes';
        dislikes.textContent = `👎 ${post.reactions.dislikes}`;
        const deleteIcon = document.createElement('span');
        deleteIcon.className = 'deleteIcon';
        deleteIcon.textContent = '🗑️';

        deleteIcon.addEventListener('click', () => {
            const removeConfirm = document.getElementById('delete-confirmation');
            const yesBtn = document.getElementById('custom-yes-btn');
            const noBtn = document.getElementById('custom-no-btn');
            removeConfirm.style.display = 'block';
            yesBtn.addEventListener('click', async () => {
                await deletePostsbyId(post.id);
                cardContainer.removeChild(card);
                printToastMessage('post deleted successfully', "linear-gradient(to right,rgb(77, 179, 26),rgb(69, 185, 11))");
                removeConfirm.style.display = 'none';

            })
            noBtn.addEventListener('click', () => {
                removeConfirm.style.display = 'none';
            })
        });
        card.appendChild(deleteIcon);
        card.appendChild(title);
        card.appendChild(body);
        card.appendChild(likes);
        card.appendChild(dislikes);
        cardContainer.appendChild(card);
    });
}
