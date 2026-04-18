import {
    formattedDate,
    formattedName,
    generateRandomColor,
    renderElement
} from "../utils/helper.js";
import { data } from "../assets/data/data.js";

// ===============================
// SUPABASE INIT
// ===============================
const supabase = window.supabase.createClient(
    "https://vccqbcooezemimdwemui.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjY3FiY29vZXplbWltZHdlbXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0OTk0MTUsImV4cCI6MjA5MjA3NTQxNX0.GW_jwb98pY5f2yTquL6bfd2ZbZ1gveODjg5K9pbQ0oA"
);

export const wishas = () => {

    const wishasContainer = document.querySelector('.wishas');
    const [_, form] = wishasContainer.children[2].children;
    const [peopleComentar, ___, containerComentar] = wishasContainer.children[3].children;
    const buttonForm = form.children[6];
    const pageNumber = wishasContainer.querySelector('.page-number');
    const [prevButton, nextButton] = wishasContainer.querySelectorAll('.button-grup button');

    // ===============================
    // STATE
    // ===============================
    let currentPage = 1;
    let itemsPerPage = 4;
    let startIndex = 0;
    let endIndex = itemsPerPage;
    let allData = [];
    let ids = new Set(); // 🔥 anti double

    // ===============================
    // BANK
    // ===============================
    const listItemBank = (data) => (
        `<figure>
            <img src=${data.icon}>
            <figcaption>No. Rekening ${data.rekening.slice(0, 4)}xxxx <br>A.n ${data.name}</figcaption>
            <button data-rekening=${data.rekening}>Salin No. Rekening</button>
        </figure>`
    );

    const initialBank = () => {
        const wishasBank = wishasContainer.children[1];
        const [_, __, containerBank] = wishasBank.children;

        renderElement(data.bank, containerBank, listItemBank);

        containerBank.querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const rekening = e.target.dataset.rekening;
                try {
                    await navigator.clipboard.writeText(rekening);
                    button.textContent = 'Berhasil menyalin';
                } catch {
                    console.log("Gagal copy");
                } finally {
                    setTimeout(() => {
                        button.textContent = 'Salin No. Rekening';
                    }, 2000);
                }
            });
        });
    };

    // ===============================
    // FORMAT DATA
    // ===============================
    const mapData = (item) => ({
        id: item.id,
        name: item.name,
        status: item.status === 'y' ? 'Hadir' : 'Tidak Hadir',
        message: item.message,
        date: item.created_at,
        color: generateRandomColor()
    });

    const listItemComentar = (data) => {
        const name = formattedName(data.name);
        const newDate = formattedDate(data.date);

        let date = "";

        if (newDate.days < 1) {
            date = newDate.hours < 1
                ? `${newDate.minutes} menit yang lalu`
                : `${newDate.hours} jam, ${newDate.minutes} menit yang lalu`;
        } else {
            date = `${newDate.days} hari, ${newDate.hours} jam yang lalu`;
        }

        return `<li>
            <div style="background-color:${data.color}">
                ${data.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h4>${name}</h4>
                <p>${date} <br>${data.status}</p>
                <p>${data.message}</p>
            </div>
        </li>`;
    };

    // ===============================
    // RENDER
    // ===============================
    const renderPage = () => {
        containerComentar.innerHTML = "";
        const slice = allData.slice(startIndex, endIndex);
        renderElement(slice, containerComentar, listItemComentar);
        pageNumber.textContent = currentPage.toString();
    };

    // ===============================
    // LOAD DATA AWAL
    // ===============================
    const loadData = async () => {
        containerComentar.innerHTML = `<h1>Loading...</h1>`;

        const { data, error } = await supabase
            .from("wishes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        allData = data.map(mapData);
        ids = new Set(data.map(item => item.id));

        peopleComentar.textContent = allData.length > 0
            ? `${allData.length} Orang telah mengucapkan`
            : `Belum ada yang mengucapkan`;

        renderPage();
    };

    // ===============================
    // SUBMIT (fallback + realtime safe)
    // ===============================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        buttonForm.textContent = 'Loading...';

        const name = e.target.name.value;
        const status = e.target.status.value;
        const message = e.target.message.value;

        const { data, error } = await supabase
            .from("wishes")
            .insert([{ name, status, message }])
            .select();

        if (error) {
            console.error(error);
            alert(error.message);
            buttonForm.textContent = 'Kirim';
            return;
        }

        const item = data[0];

        // 🔥 anti double
        if (!ids.has(item.id)) {
            ids.add(item.id);

            const newItem = mapData(item);
            allData.unshift(newItem);

            peopleComentar.textContent = `${allData.length} Orang telah mengucapkan`;
            renderPage();
        }

        form.reset();
        buttonForm.textContent = 'Kirim';
    });

    // ===============================
    // REALTIME (anti double)
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

                const item = payload.new;

                // 🔥 cegah double
                if (ids.has(item.id)) return;

                ids.add(item.id);

                const newItem = mapData(item);
                allData.unshift(newItem);

                peopleComentar.textContent = `${allData.length} Orang telah mengucapkan`;
                renderPage();
            }
        )
        .subscribe();

    // ===============================
    // PAGINATION
    // ===============================
    nextButton.addEventListener('click', () => {
        if (endIndex < allData.length) {
            currentPage++;
            startIndex = (currentPage - 1) * itemsPerPage;
            endIndex = startIndex + itemsPerPage;
            renderPage();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            startIndex = (currentPage - 1) * itemsPerPage;
            endIndex = startIndex + itemsPerPage;
            renderPage();
        }
    });

    // ===============================
    // INIT
    // ===============================
    loadData();
    initialBank();
};
