import {home} from "./js/home.js";
import {bride} from "./js/bride.js";
import {time} from "./js/time.js";
import {galeri} from "./js/galeri.js";
import {wishas} from "./js/wishas.js";
import {navbar} from "./js/navbar.js";
import {welcome} from "./js/welcome.js";

// load content
// Ambil parameter dari URL
const urlParams = new URLSearchParams(window.location.search);
const guestSlug = urlParams.get("to");

// Ubah slug → nama normal
function slugToName(slug) {
  if (!slug) return "Tamu Undangan";

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

const guestName = slugToName(guestSlug);

document.addEventListener('DOMContentLoaded', () => {
    AOS.init();

    welcome();
    navbar();
    home();
    bride()
    time();
    galeri();
    wishas();
});
