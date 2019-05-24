export default class Likes {
  constructor() {
    this.likes = [];
  }

  addLikes(id, title, author, img) {
    const like = { id, title, author, img };
    this.likes.push(like);

    // Persist Data Storage
    this.persistData();

    return like;
  }

  removeLikes(id) {
    const index = this.likes.findIndex(el => el.id === id);
    this.likes.splice(index, 1);

    // Persist Data Storage
  }

  isLiked(id) {
    return this.likes.findIndex(el => el.id === id) !== -1;
  }

  getNumLikes() {
    return this.likes.length;
  }

  persistData() {
    localStorage.setItem("likes", JSON.stringify(this.likes));
  }

  readStorage() {
    const storage = JSON.parse(localStorage.getItem("likes"));
    // restores from local storage //
    if (storage) this.likes = storage;
  }
}
