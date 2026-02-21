const groupA = [
  {name: "Drużyna A1"},
  {name: "Drużyna A2"},
  {name: "Drużyna A3"},
  {name: "Drużyna A4"}
];

const groupB = [
  {name: "Drużyna B1"},
  {name: "Drużyna B2"},
  {name: "Drużyna B3"},
  {name: "Drużyna B4"}
];

function resetStats(team){
  team.M = 0;
  team.GF = 0;
  team.GA = 0;
  team.P = 0;
}

[groupA, groupB].forEach(group => group.forEach(resetStats));

const matches = [
  {group: "A", home: "Drużyna A1", away: "Drużyna A2"},
  {group: "A", home: "Drużyna A3", away: "Drużyna A4"},
  {group: "B", home: "Drużyna B1", away: "Drużyna B2"},
  {group: "B", home: "Drużyna B3", away: "Drużyna B4"},
];

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

function renderTable(group, elementId){
  group.sort((a,b)=>{
    if(b.P !== a.P) return b.P - a.P;
    return (b.GF - b.GA) - (a.GF - a.GA);
  });

  let html = `
    <tr>
      <th>#</th><th>Drużyna</th><th>M</th><th>B</th><th>P</th>
    </tr>
  `;

  group.forEach((t,i)=>{
    html += `
      <tr>
        <td>${i+1}</td>
        <td>${t.name}</td>
        <td>${t.M}</td>
        <td>${t.GF}:${t.GA}</td>
        <td>${t.P}</td>
      </tr>
    `;
  });

  document.getElementById(elementId).innerHTML = html;
}

function renderMatches(){
  const container = document.getElementById("matches");
  container.innerHTML = "";

  matches.forEach((m,i)=>{
    container.innerHTML += `
      <div class="match">
        <span>${m.home}</span>
        <input type="number" id="h${i}">
        :
        <input type="number" id="a${i}">
        <span>${m.away}</span>
        <button onclick="submitMatch(${i})">OK</button>
      </div>
    `;
  });
}

function submitMatch(index){
  const match = matches[index];
  const h = parseInt(document.getElementById("h"+index).value);
  const a = parseInt(document.getElementById("a"+index).value);

  if(isNaN(h) || isNaN(a)) return;

  const group = match.group === "A" ? groupA : groupB;
  const home = group.find(t=>t.name === match.home);
  const away = group.find(t=>t.name === match.away);

  home.M++; away.M++;
  home.GF += h; home.GA += a;
  away.GF += a; away.GA += h;

  if(h>a) home.P+=3;
  else if(h<a) away.P+=3;
  else { home.P+=1; away.P+=1; }

  renderAll();
}

function renderAll(){
  renderTable(groupA, "groupA");
  renderTable(groupB, "groupB");
}

renderAll();
renderMatches();
