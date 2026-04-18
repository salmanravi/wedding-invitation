import { home } from "./js/home.js";
import { bride } from "./js/bride.js";
import { time } from "./js/time.js";
import { galeri } from "./js/galeri.js";
import { wishas } from "./js/wishas.js";
import { navbar } from "./js/navbar.js";
import { welcome } from "./js/welcome.js";

// ===============================
// Ambil nama tamu dari URL
// ===============================
const urlParams = new URLSearchParams(window.location.search);
const guestSlug = urlParams.get("to");

function slugToName(slug) {
  if (!slug) return "Tamu Undangan";

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

const guestName = slugToName(guestSlug);

// ===============================
// Supabase Init
// ===============================
const supabase = window.supabase.createClient(
  "https://vccqbcooezemimdwemui.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjY3FiY29vZXplbWltZHdlbXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0OTk0MTUsImV4cCI6MjA5MjA3NTQxNX0.GW_jwb98pY5f2yTquL6bfd2ZbZ1gveODjg5K9pbQ0oA"
);

// ===============================
// MAIN APP
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // Set nama tamu
  document.querySelectorAll(".guest-name").forEach(el => {
    el.textContent = guestName;
  });

  // Init UI
  AOS.init();
  welcome();
  navbar();
  home();
  bride();
  time();
  galeri();
  wishas();

  // Ambil element
  const form = document.querySelector("form");
  const list = document.querySelector("ul[aria-label='list comentar']");

  // ===============================
  // RENDER ITEM
  // ===============================
  function renderItem(data) {
    const li = document.createElement("li");

    li.innerHTML = `
      <div style="padding:10px 0; border-bottom:1px solid #eee;">
        <strong>${data.name}</strong> 
        <span style="font-size:12px; color:gray;">
          (${data.status === "y" ? "Hadir" : "Tidak Hadir"})
        </span>
        <p style="margin:5px 0;">${data.message}</p>
        <small style="color:#999;">
          ${new Date(data.created_at).toLocaleString()}
        </small>
      </div>
    `;

    list.prepend(li);
  }

  // ===============================
  // LOAD DATA AWAL
  // ===============================
  async function loadInitial() {
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load error:", error);
      return;
    }

    list.innerHTML = "";
    data.forEach(renderItem);
  }

  // ===============================
  // SUBMIT FORM
  // ===============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const status = document.getElementById("status").value;
    const message = document.getElementById("message").value;

    const { error } = await supabase.from("wishes").insert([
      { name, status, message }
    ]);

    if (error) {
      console.error(error);
      alert("Gagal kirim ucapan");
    } else {
      form.reset();
    }
  });

  // ===============================
  // REALTIME LISTENER
  // ===============================
  supabase
    .channel("wishes-channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "wishes",
      },
      (payload) => {
        renderItem(payload.new);
      }
    )
    .subscribe();

  // ===============================
  // INIT LOAD
  // ===============================
  loadInitial();

});
