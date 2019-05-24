import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";

/**  Global state of the app **
// Search Object
// Current Recipe Object
// Shopping list object
// liked recipes
*/

const state = {};

////////////////////////////////////////////////////////
//  Search Controller
////////////////////////////////////////////////////////

const controlSearch = async () => {
  // 1) get query from view
  const query = searchView.getInput();

  if (query) {
    // 2) new search object and add to state
    state.search = new Search(query);

    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4) Search for recipe
      await state.search.getResults();
      // 5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert(`Something went wrong in 'controlSearch()' of 'index.js'`);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

////////////////////////////////////////////////////////
//  Recipe Controller
////////////////////////////////////////////////////////

const controlRecipe = async () => {
  const id = window.location.hash.replace("#", "");

  if (id) {
    // prepare UI for changes
    recipeView.clearRecipe();

    // highlight active search item
    if (state.search) {
      searchView.highlightSelected(id);
    }

    // create new recipe object
    renderLoader(elements.recipe);

    state.recipe = new Recipe(id);
    // window.r = state.recipe;

    try {
      // get recipe data
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // add recipe time and servings
      state.recipe.calcTime();
      state.recipe.calcServings();

      // render recipe to UI
      clearLoader();
      if (state.likes) {
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
      } else {
        recipeView.renderRecipe(state.recipe);
      }
    } catch (error) {
      alert(`Something failed in 'controlRecipe()' of 'index.js'`);
    }
  }
};

["hashchange" /**'load'*/].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

////////////////////////////////////////////////////////
//  List Controller
////////////////////////////////////////////////////////

const controlList = () => {
  // create new list if there is none yet
  if (!state.list) state.list = new List();

  // add each ingredient to the list
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Handle delete and update commands
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // delete event
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //  delete from state
    state.list.deleteItem(id);

    // delete from UI
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

////////////////////////////////////////////////////////
//  Likes Controller
////////////////////////////////////////////////////////

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  // If recipe is NOT liked
  if (!state.likes.isLiked(currentID)) {
    // Add like to state
    const newLike = state.likes.addLikes(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    // toggle like button
    likesView.toggleLikeBtn(true);

    // add like to UI list
    likesView.renderLike(newLike);
  }

  // If recipe IS liked
  else {
    // remove like from state
    state.likes.removeLikes(currentID);

    // toggle like button
    likesView.toggleLikeBtn(false);

    // remove like from UI list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener("load", () => {
  state.likes = new Likes();

  // read local storgae
  state.likes.readStorage();

  // bring menu for likes if they exist
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // render existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  }
});
