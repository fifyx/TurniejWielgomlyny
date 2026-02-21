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

// Render harmonogram
const scheduleBody = document.querySelector("#schedule tbody");
matches.forEach((m,i)=>{
  const tr = document.createElement("tr");
  const team1 = groups[m[0]][m[1]];
  const team2 = groups[m[0]][m[2]];
  tr.innerHTML = `
    <td>${team1} vs ${team2}</td>
    <td>
      <input type="number" class="score-input" min="0" data-group="${m[0]}" data-match="${i}" data-team="0"> -
      <input type="number" class="score-input" min="0" data-group="${m[0]}" data-match="${i}" data-team="1">
    </td>
  `;
  scheduleBody.appendChild(tr);
});

// Standings data
let standings = {A:[], B:[]};
groups.A.forEach(t=>standings.A.push({name:t, M:0,Z:0,P:0,Br:0,Pkt:0}));
groups.B.forEach(t=>standings.B.push({name:t, M:0,Z:0,P:0,Br:0,Pkt:0}));

function updateStandings() {
  // Reset
  standings.A.forEach(t=>Object.assign(t,{M:0,Z:0,P:0,Br:0,Pkt:0}));
  standings.B.forEach(t=>Object.assign(t,{M:0,Z:0,P:0,Br:0,Pkt:0}));

  document.querySelectorAll(".score-input").forEach(input=>{
    const group = input.dataset.group;
    const matchIndex = input.dataset.match;
    const match = matches[matchIndex];
    const score0 = parseInt(document.querySelector(`input[data-group="${group}"][data-match="${matchIndex}"][data-team="0"]`).value) || 0;
    const score1 = parseInt(document.querySelector(`input[data-group="${group}"][data-match="${matchIndex}"][data-team="1"]`).value) || 0;

    const t0 = standings[group][match[1]];
    const t1 = standings[group][match[2]];

    // Update stats
    t0.M = t0.Z + t0.P + ((score0||score1)?1:0);
    t1.M = t1.Z + t1.P + ((score0||score1)?1:0);
    t0.Br += score0;
    t1.Br += score1;

    if(score0 > score1) { t0.Z++; t0.Pkt+=3; t1.P++; }
    else if(score0 < score1) { t1.Z++; t1.Pkt+=3; t0.P++; }
    else if(score0===score1 && (score0||score1)) { t0.Pkt++; t1.Pkt++; }
  });

  renderStandings();
  updatePlayoff();
}

function renderStandings(){
  const tbody = document.querySelector("#standings tbody");
  tbody.innerHTML = "";
  ["A","B"].forEach(g=>{
    standings[g].forEach(t=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${g}</td><td>${t.name}</td><td>${t.M}</td><td>${t.Z}</td><td>${t.P}</td><td>${t.Br}</td><td>${t.Pkt}</td>`;
      tbody.appendChild(tr);
    });
  });
}

// Event listeners for score inputs
document.querySelectorAll(".score-input").forEach(input=>{
  input.addEventListener("input", updateStandings);
});

// Update playoff
function updatePlayoff(){
  // Sort teams by points in each group
  const sortedA = [...standings.A].sort((a,b)=>b.Pkt-a.Pkt || b.Br-a.Br);
  const sortedB = [...standings.B].sort((a,b)=>b.Pkt-a.Pkt || b.Br-a.Br);

  document.getElementById("semi1").innerText = `${sortedA[0].name} vs ${sortedB[1].name}`;
  document.getElementById("semi2").innerText = `${sortedB[0].name} vs ${sortedA[1].name}`;
}
