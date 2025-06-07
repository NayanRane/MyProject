let data = [
  {
    column1: null,
    column2: "Cluster",
    Garben: "West viselia",
    Hamstra: "North viselia",
    Laydekar: "West viselia",
    Degroot: "West viselia",
    DoubleJ: "North viselia",
    taend: "Kern",
    dydf: "Dout",
    syjfdmb: "Dout",
    dsjydfjhd: "Kern",
    dfjhfdhjd: "Kern",
    savsds: "Gmmbtu",
    dfhfdj: "Scf",
    fhf: "Scf",
    dhdmdf: "NetMmmbtu",
    djhfjh: "Gmmbtu",
  },
];

// Step 1: Get values from index 2 onward
let values = Object.values(data[0]).slice(2);

// Step 2: Count occurrences
let counts = {};
values.forEach((val) => {
  counts[val] = (counts[val] || 0) + 1;
});

// Step 3: Avoid duplicates and build <th> with colspan
let thRow = "<tr>";

$.each(counts, function (key, val) {
  thRow += `<th class="text-center" colspan="${val}">${key}</th>`;
});

// values.forEach((val) => {
//   if (!added.has(val)) {
//     thRow += `<th class="text-center" colspan="${counts[val]}">${val}</th>`;
//     added.add(val);
//   }
// });

thRow += "</tr>";

// Step 4: Inject into the table
document.getElementById("myThead").innerHTML = thRow;
