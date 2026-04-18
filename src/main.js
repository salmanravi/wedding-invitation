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

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".guest-name").forEach(el => {
    el.textContent = guestName;
  });
});

const supabase = window.supabase.createClient(
  "https://vccqbcooezemimdwemui.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjY3FiY29vZXplbWltZHdlbXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0OTk0MTUsImV4cCI6MjA5MjA3NTQxNX0.GW_jwb98pY5f2yTquL6bfd2ZbZ1gveODjg5K9pbQ0oA"
);

const form = document.querySelector("form");
const list = document.querySelector("ul[aria-label='list comentar']");

// === INSERT DATA ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const status = document.getElementById("status").value;
  const message = document.getElementById("message").value;

  const { error } = await supabase.from("wishes").insert([
    { name, status, message }
  ]);

  if (error) {
    alert("Gagal kirim");
  } else {
    form.reset();
  }
});

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
