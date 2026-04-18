import {
    formattedDate,
    formattedName,
    generateRandomColor,
    generateRandomId,
    getCurrentDateTime,
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
    // BANK (tetap)
    // ===============================
    const listItemBank = (data) => (
        `  <figure data-aos="zoom-in" data-aos-duration="1000">
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
                } catch (error) {
                    console.log(error);
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
            if (newDate.hours < 1) {
                date = `${newDate.minutes} menit yang lalu`;
            } else {
                date = `${newDate.hours} jam, ${newDate.minutes} menit yang lalu`;
            }
        } else {
            date = `${newDate.days} hari, ${newDate.hours} jam yang lalu`;
        }

        return ` <li data-aos="zoom-in" data-aos-duration="1000">
                     <div style="background-color: ${data.color}">${data.name.charAt(0).toUpperCase()}</div>
                     <div>
                         <h4>${name}</h4>
                         <p>${date} <br>${data.status}</p>
                         <p>${data.message}</p>
                     </div>
                 </li>`;
    };

    // ===============================
    // PAGINATION STATE
    // ===============================
    let currentPage = 1;
    let itemsPerPage = 4;
    let startIndex = 0;
    let endIndex = itemsPerPage;
    let allData = [];

    // ===============================
    // LOAD DATA
    // ===============================
    const loadData = async () => {
        containerComentar.innerHTML = `<h1 style="font-size: 1rem;">Loading...</h1>`;
        pageNumber.textContent = '..';

        const { data, error } = await supabase
            .from("wishes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        allData = data.map(mapData);

        if (allData.length > 0) {
            peopleComentar.textContent = `${allData.length} Orang telah mengucapkan`;
        } else {
            peopleComentar.textContent = `Belum ada yang mengucapkan`;
        }

        renderPage();
    };

    const renderPage = () => {
        containerComentar.innerHTML = "";
        const slice = allData.slice(startIndex, endIndex);
        renderElement(slice, containerComentar, listItemComentar);
        pageNumber.textContent = currentPage.toString();
    };

    // ===============================
    // SUBMIT
    // ===============================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        buttonForm.textContent = 'Loading...';

        const name = e.target.name.value;
        const status = e.target.status.value;
        const message = e.target.message.value;

        const { error } = await supabase.from("wishes").insert([
            { name, status, message }
        ]);

        if (error) {
            console.error(error);
        }

        buttonForm.textContent = 'Kirim';
        form.reset();
    });

    // ===============================
    // REALTIME
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
                const newItem = mapData(payload.new);

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
