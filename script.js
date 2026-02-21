// Tab switching
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    tabContents.forEach(c => c.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Drużyny
const groups = {
  A: ["Cadovia","OSP Niedośpielin","Niedośpielin","Rogi","Fc Żubry"],
  B: ["OSP Karczów","Kruszyna","Laga United","Arka"]
};

// Mecze: [Grupa, teamIndex1, teamIndex2]
const matches = [
  ["A",0,1],
  ["B",0,3],
  ["A",2,3],
  ["B",1,2],
  ["A",0,2],
  ["B",0,2],
  ["A",1,4],
  ["B",3,1],
  ["A",0,3],
  ["B",0,1],
  ["A",3,4],
  ["B",2,3],
  ["A",1,2],
  ["A",0,4],
  ["A",1,3],
  ["A",2,4]
];

// Statystyki
let standings = {A:[], B:[]};
groups.A.forEach(t=>standings.A.push({name:t,M:0,GF:0,GA:0,Bil:0,Pkt:0}));
groups.B.forEach(t=>standings.B.push({name:t,M:0,GF:0,GA:0,Bil:0,Pkt:0}));

// Render tabel grup
function renderTables(){
  ["A","B"].forEach(g=>{
    const tbody = document.createElement("tbody");
    standings[g].forEach(t=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${t.name}</td><td>${t.M}</td><td>${t.GF}</td><td>${t.GA}</td><td>${t.Bil}</td><td>${t.Pkt}</td>`;
      tbody.appendChild(tr);
    });
    const table = document.getElementById("group"+g);
    table.innerHTML = `<thead><tr><th>Zespół</th><th>M</th><th>GF</th><th>GA</th><th>Bil</th><th>Pkt</th></tr></thead>`;
    table.appendChild(tbody);
  });
}

// Render harmonogram z przyciskiem zatwierdz/zmień wynik
function renderSchedule(){
  const scheduleTable = document.getElementById("schedule");
  scheduleTable.innerHTML = `<thead><tr><th>Mecz</th><th>Wynik</th></tr></thead><tbody></tbody>`;
  const tbody = scheduleTable.querySelector("tbody");

  matches.forEach((m,i)=>{
    const tr = document.createElement("tr");
    const team1 = groups[m[0]][m[1]];
    const team2 = groups[m[0]][m[2]];
    tr.innerHTML = `
      <td>${team1} vs ${team2}</td>
      <td>
        <input type="number" class="score-input" min="0" data-group="${m[0]}" data-match="${i}" data-team="0"> -
        <input type="number" class="score-input" min="0" data-group="${m[0]}" data-match="${i}" data-team="1">
        <button class="score-btn" data-match="${i}">Zatwierdź wynik</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Aktualizacja statystyk
function updateStandings(){
  ["A","B"].forEach(g=>{
    standings[g].forEach(t=>Object.assign(t,{M:0,GF:0,GA:0,Bil:0,Pkt:0}));
  });

  document.querySelectorAll(".score-input").forEach(input=>{
    const group = input.dataset.group;
    const matchIndex = input.dataset.match;
    const match = matches[matchIndex];
    const score0 = parseInt(document.querySelector(`input[data-group="${group}"][data-match="${matchIndex}"][data-team="0"]`).value) || null;
    const score1 = parseInt(document.querySelector(`input[data-group="${group}"][data-match="${matchIndex}"][data-team="1"]`).value) || null;

    if(score0 !== null && score1 !== null){
      const t0 = standings[group][match[1]];
      const t1 = standings[group][match[2]];

      t0.M++; t1.M++;
      t0.GF += score0; t0.GA += score1;
      t1.GF += score1; t1.GA += score0;
      t0.Bil = t0.GF - t0.GA;
      t1.Bil = t1.GF - t1.GA;

      if(score0 > score1){ t0.Pkt+=3; }
      else if(score0 < score1){ t1.Pkt+=3; }
      else{ t0.Pkt++; t1.Pkt++; }
    }
  });

  renderTables();
  updatePlayoff();
}

// Playoff – tylko jeśli miejsca pewne
function updatePlayoff(){
  ["A","B"].forEach(g=>standings[g].sort((a,b)=>b.Pkt - a.Pkt || (b.Bil - a.Bil)));
  const a = standings.A;
  const b = standings.B;

  const a1Cert = a[0].Pkt - a[1].Pkt >= 0 && a[0].Pkt - (a[2]?.Pkt||0) >= 0;
  const a2Cert = a[1].Pkt - (a[2]?.Pkt||0) > 0;
  const b1Cert = b[0].Pkt - b[1].Pkt >= 0 && b[0].Pkt - (b[2]?.Pkt||0) >= 0;
  const b2Cert = b[1].Pkt - (b[2]?.Pkt||0) > 0;

  document.getElementById("semi1").innerText = (a1Cert && b2Cert) ? `${a[0].name} vs ${b[1].name}` : "-";
  document.getElementById("semi2").innerText = (b1Cert && a2Cert) ? `${b[0].name} vs ${a[1].name}` : "-";
  document.getElementById("final").innerText = "-";
}

// Obsługa przycisku zatwierdź/zmień wynik
document.addEventListener("click", e=>{
  if(e.target.classList.contains("score-btn")){
    const btn = e.target;
    const matchIndex = btn.dataset.match;
    const inputs = document.querySelectorAll(`.score-input[data-match="${matchIndex}"]`);
    const locked = btn.dataset.locked === "true";

    if(!locked){
      // zatwierdź
      inputs.forEach(inp=>inp.disabled = true);
      btn.innerText = "Zmień wynik";
      btn.dataset.locked = "true";
    } else {
      // zmień wynik
      inputs.forEach(inp=>inp.disabled = false);
      btn.innerText = "Zatwierdź wynik";
      btn.dataset.locked = "false";
    }
    updateStandings();
  }
});

// Event listener dla inputów (dynamiczna aktualizacja przed zatwierdzeniem)
document.addEventListener("input", e=>{
  if(e.target.classList.contains("score-input")) updateStandings();
});

// Inicjalizacja
renderSchedule();
renderTables();
