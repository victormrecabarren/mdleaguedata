import "./App.css";
import logo from "./Nfl_Black_Svg.svg";
import { useEffect, useState } from "react";
import { getStandings } from "./utils";

import {
  maxPF,
  maxPFDec,
  PF,
  PFDec,
  PA,
  PADec,
  leagueEndpoint,
  rostersEndpoint,
  columnDefs,
} from "./config";
import { users } from "./league-users";
import { DataTable } from "./components/DataTable";
import { Tag } from "antd";

function App() {
  const [owners, setOwners] = useState([]);
  const [columns, setCurrentColumns] = useState([]);
  const [selections, setSelections] = useState({
    record: false,
    user: true,
    PF: true,
    maxPF: true,
    accuracy: false,
    PA: false,
    leftOnBench: false,
  });

  const handleSelection = (selection) => {
    setSelections((prevSelected) => {
      const prevValue = prevSelected[selection];
      const updatedSelections = {
        ...prevSelected,
        [selection]: !prevValue,
      };
      return updatedSelections;
    });
  };

  useEffect(() => {
    const updatedColumns = columnDefs.filter(
      (column) => selections[column.field]
    );
    setCurrentColumns(updatedColumns);
  }, [selections]);

  useEffect(() => {
    const fetchLeagueData = async () => {
      const rostersRes = await fetch(rostersEndpoint);
      const rosters = await rostersRes.json();
      const leagueRes = await fetch(leagueEndpoint);
      const league = await leagueRes.json();
      const gamesPlayed = league.settings.last_scored_leg;
      const formattedUserData = rosters.map((roster) => {
        const user = users.find((user) => user.user_id === roster.owner_id);
        const userMaxPF =
          roster.settings[maxPF] + roster.settings[maxPFDec] / 100;
        const userPF = roster.settings[PF] + roster.settings[PFDec] / 100;
        const userPA = roster.settings[PA] + roster.settings[PADec] / 100;
        return {
          id: user.user_id,
          user: user.display_name,
          standing: 0,
          maxPF: userMaxPF,
          PF: userPF,
          PA: userPA,
          accuracy: Math.round((userPF / userMaxPF) * 100) / 100,
          record: `${roster.settings.wins}-${roster.settings.losses}`,
          wins: roster.settings.wins,
          losses: roster.settings.losses,
          leftOnBench: `${Math.round((userMaxPF - userPF) * 100) / 100} (${
            Math.round(((userMaxPF - userPF) / gamesPlayed) * 100) / 100
          })`,
          averagePF: Math.round((userPF / gamesPlayed) * 100) / 100,
          averageMaxPF: Math.round((userMaxPF / gamesPlayed) * 100) / 100,
        };
      });
      const formattedWithStandings = getStandings(formattedUserData);
      setOwners(formattedWithStandings);
    };
    fetchLeagueData();
  }, []);
  const selectedStyle = "#1a4486";
  const nonSelectedStyle = "#1d1d1d";
  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} height="50px" className="logo" />
        <span className="title">Maryland League</span>
      </div>
      <div className="App-content">
        <div className="dashboard-header noselect">
          <Tag
            onClick={() => handleSelection("standing")}
            color={`${selections.standing ? selectedStyle : nonSelectedStyle}`}
            className="dash-tabs"
          >
            Record
          </Tag>
          <Tag
            onClick={() => handleSelection("PF")}
            color={`${selections.PF ? selectedStyle : nonSelectedStyle}`}
            className="dash-tabs"
          >
            Points For
          </Tag>
          <Tag
            onClick={() => handleSelection("maxPF")}
            color={`${selections.maxPF ? selectedStyle : nonSelectedStyle}`}
            className="dash-tabs"
          >
            Max PF
          </Tag>
          <Tag
            onClick={() => handleSelection("accuracy")}
            color={`${selections.accuracy ? selectedStyle : nonSelectedStyle}`}
            className="dash-tabs"
          >
            Start/Sit Accuracy
          </Tag>
          <Tag
            onClick={() => handleSelection("leftOnBench")}
            color={`${
              selections.leftOnBench ? selectedStyle : nonSelectedStyle
            }`}
            className="dash-tabs"
          >
            Bench
          </Tag>
          <Tag
            onClick={() => handleSelection("PA")}
            color={`${selections.PA ? selectedStyle : nonSelectedStyle}`}
            className="dash-tabs"
          >
            Points Against
          </Tag>
        </div>

        <div
          className="grid ag-theme-alpine-dark"
          style={{
            height: "70vh",
            width: "100%",
            textAlign: "left",
            fontSize: "12px",
          }}
        >
          <DataTable owners={owners} columnDefs={columns} />
        </div>
      </div>
    </div>
  );
}

export default App;
