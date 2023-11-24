export const columnDefs = [
  {
    width: 65,
    headerName: "W-L",
    field: "standing",
    sortable: true,
    valueFormatter: ({ data }) => `${data.record}`,
    cellStyle: {
      fontSize: "12px",
      fontWeight: 300,
    },
  },
  {
    width: 100,
    headerName: "Owner",
    field: "user",
    cellStyle: { fontSize: "12px", fontWeight: 300 },
  },
  {
    width: 130,
    headerName: "PF",
    field: "PF",
    sortable: true,
    valueGetter: ({ data }) => `${data.PF} (${data.averagePF})`,
    cellStyle: { fontSize: "12px", fontWeight: 300 },
    type: "numericColumn",
  },
  {
    width: 130,
    headerName: "Max",
    field: "maxPF",
    sortable: true,
    valueGetter: ({ data }) => `${data.maxPF} (${data.averageMaxPF})`,
    cellStyle: { fontSize: "12px", fontWeight: 300 },
    type: "numericColumn",
  },
  {
    width: 70,
    headerName: "Acc",
    field: "accuracy",
    sortable: true,
    cellStyle: { fontSize: "12px", fontWeight: 300 },
    type: "numericColumn",
  },
  {
    width: 130,
    headerName: "Bench",
    field: "leftOnBench",
    sortable: true,
    cellStyle: { fontSize: "12px", fontWeight: 300 },
    type: "numericColumn",
  },
  {
    width: 70,
    headerName: "PA",
    field: "PA",
    sortable: true,
    cellStyle: { fontSize: "12px", fontWeight: 300 },
    type: "numericColumn",
  },
];

export const maxPF = "ppts";
export const maxPFDec = "ppts_decimal";

export const PF = "fpts";
export const PFDec = "fpts_decimal";

export const PA = "fpts_against";
export const PADec = "fpts_against_decimal";

export const mdLeagueId = "979172943752171520";

export const rostersEndpoint = `https://api.sleeper.app/v1/league/${mdLeagueId}/rosters`;
export const leagueEndpoint = `https://api.sleeper.app/v1/league/${mdLeagueId}`;

export const userDictionary = {
  itschriscas: "Chris",
  BigP93: "Phillip",
  slullkrow: "Brandon",
  AlfonsoRose93: "Sergio",
  HurtsLikeH3ll: "Carlos",
  ResurrectionOfBigSex: "Nova",
  itsghosty: "Alejandro ",
  OwnedbyBazooka: "Ryan",
  BigShmegma: "Teferi",
  victormrecabarren: "Victor",
  OMejia91: "Oscar",
  ahuezo: "Alvaro",
};
