const CODE = "KP7";

/* =========================
   DANE DRUŻYN
========================= */

const groupA = [
    { name: "Cadovia", M: 0, scored: 0, conceded: 0, P: 0 },
    { name: "OSP Niedośpielin", M: 0, scored: 0, conceded: 0, P: 0 },
    { name: "Niedośpielin", M: 0, scored: 0, conceded: 0, P: 0 },
    { name: "Rogi", M: 0, scored: 0, conceded: 0, P: 0 },
    { name: "Fc Żubry", M: 0, scored: 0, conceded: 0, P: 0 }
];

const groupB = [
    { name: "OSP Karczów", M: 0, scored: 0, conceded: 0, P: 0 },
    { name: "Kruszyna", M: 0, scored: 0, conceded: 0, P: 0 },
    { name: "Laga United", M: 0, scored: 0, conceded: 0, P: 0 },
    { name: "Arka", M: 0, scored: 0, conceded: 0, P: 0 }
];

/* =========================
   HARMONOGRAM
========================= */

const matches = [
    ["Cadovia","OSP Niedośpielin"],
    ["Cadovia","Niedośpielin"],
    ["Cadovia","Rogi"],
    ["Cadovia","Fc Żubry"],
    ["OSP Niedośpielin","Niedośpielin"],
    ["OSP Niedośpielin","Rogi"],
    ["OSP Niedośpielin","Fc Żubry"],
    ["Niedośpielin","Rogi"],
    ["Niedośpielin","Fc Żubry"],
    ["Rogi","Fc Żubry"],

    ["OSP Karczów","Kruszyna"],
    ["OSP Karczów","Laga United"],
    ["OSP Karczów","Arka"],
    ["Kruszyna","Laga United"],
    ["Kruszyna","Arka"],
    ["Laga United","Arka"]
];

let playedMatches = {};

/* =========================
   FUNKCJE POMOCNICZE
========================= */

function getAllTeams() {
    return [...groupA, ...groupB];
}

function findTeam(name) {
    return getAllTeams().find(t => t.name === name);
}

function resetTable() {
    getAllTeams().forEach(t => {
        t.M = 0;
        t.scored = 0;
        t.conceded = 0;
        t.P = 0;
    });
}

function sortGroup(group) {
    group.sort((a, b) => {
        if (b.P !== a.P) return b.P - a.P;
        const diffA = a.scored - a.conceded;
        const diffB = b.scored - b.conceded;
        return diffB - diffA;
    });
}

/* =========================
   AKTUALIZACJA TABELI
========================= */

function recalculateTable() {

    resetTable();

    Object.values(playedMatches).forEach(match => {
        const { teamA, teamB, scoreA, scoreB } = match;

        const A = findTeam(teamA);
        const B = findTeam(teamB);

        A.M++;
        B.M++;

        A.scored += scoreA;
        A.conceded += scoreB;

        B.scored += scoreB;
        B.conceded += scoreA;

        if (scoreA > scoreB) A.P += 3;
        else if (scoreB > scoreA) B.P += 3;
        else {
            A.P += 1;
            B.P += 1;
        }
    });

    renderTable();
    renderPlayoff();
}

/* =========================
   RENDER TABELI
========================= */

function renderTable() {

    sortGroup(groupA);
    sortGroup(groupB);

    const tbodyA = document.querySelector("#groupA tbody");
    const tbodyB = document.querySelector("#groupB tbody");

    tbodyA.innerHTML = "";
    tbodyB.innerHTML = "";

    groupA.forEach((team, index) => {
        tbodyA.innerHTML += `
            <tr>
                <td>${index+1}</td>
                <td>${team.name}</td>
                <td>${team.M}</td>
                <td>${team.scored}:${team.conceded}</td>
                <td>${team.P}</td>
            </tr>
        `;
    });

    groupB.forEach((team, index) => {
        tbodyB.innerHTML += `
            <tr>
                <td>${index+1}</td>
                <td>${team.name}</td>
                <td>${team.M}</td>
                <td>${team.scored}:${team.conceded}</td>
                <td>${team.P}</td>
            </tr>
        `;
    });
}

/* =========================
   RENDER HARMONOGRAMU
========================= */

function renderSchedule() {

    const container = document.getElementById("matches");
    container.innerHTML = "";

    matches.forEach((match, i) => {

        const isPlayed = playedMatches[i];

        const div = document.createElement("div");
        div.classList.add("match");

        div.innerHTML = `
            <div class="match-row">
                <span>${match[0]}</span>
                <input type="number" min="0" id="a${i}" value="${isPlayed ? isPlayed.scoreA : ""}">
                <span>:</span>
                <input type="number" min="0" id="b${i}" value="${isPlayed ? isPlayed.scoreB : ""}">
                <span>${match[1]}</span>
                <button class="${isPlayed ? "confirmed" : ""}">
                    ${isPlayed ? "Zmień wynik" : "Zatwierdź wynik"}
                </button>
            </div>
        `;

        const button = div.querySelector("button");

        button.addEventListener("click", () => {

            const inputCode = prompt("Podaj kod:");
            if (inputCode !== CODE) {
                alert("Nieprawidłowy kod!");
                return;
            }

            const scoreA = parseInt(document.getElementById(`a${i}`).value);
            const scoreB = parseInt(document.getElementById(`b${i}`).value);

            if (isNaN(scoreA) || isNaN(scoreB)) {
                alert("Podaj poprawne wyniki!");
                return;
            }

            playedMatches[i] = {
                teamA: match[0],
                teamB: match[1],
                scoreA,
                scoreB
            };

            recalculateTable();
            renderSchedule();
        });

        container.appendChild(div);
    });
}

/* =========================
   PLAYOFF
========================= */

function renderPlayoff() {

    sortGroup(groupA);
    sortGroup(groupB);

    document.getElementById("semi1").textContent =
        `${groupA[0].name} vs ${groupB[1].name}`;

    document.getElementById("semi2").textContent =
        `${groupA[1].name} vs ${groupB[0].name}`;

    document.getElementById("final").textContent =
        "Zwycięzca SF1 vs Zwycięzca SF2";
}

/* =========================
   ZAKŁADKI
========================= */

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelectorAll(".tab-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const tab = btn.dataset.tab;

        document.querySelectorAll(".tab-content")
            .forEach(c => c.classList.add("hidden"));

        document.getElementById(tab).classList.remove("hidden");
    });
});

/* =========================
   START
========================= */

renderTable();
renderSchedule();
renderPlayoff();
