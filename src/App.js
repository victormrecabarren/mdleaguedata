import "./App.css";
import logo from "./Nfl_Black_Svg.svg";
import leagueAvi from "./league-avi.png";
import { useEffect, useState } from "react";
import { getStandings } from "./utils";

import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";

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
  userDictionary,
} from "./config";
import { users } from "./league-users";
// import { DataTable } from "./components/DataTable";
import { Select } from "antd";

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

  const handleChartSelection = (selection) => {
    console.log(selection);
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
          userName: user.display_name,
          realName: userDictionary[user.display_name],
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
        <div className="title-container">
          <span className="App-title">MDL Dash</span>
          <img src={logo} id="nfl-avi" alt="nfl avi" />
        </div>
        <div>
          <a
            className="unset-link-style"
            target="_blank"
            rel="noreferrer"
            href="https://sleeper.com/leagues/979172943752171520/league"
          >
            <img src={leagueAvi} id="league-avi" alt="league avi" />
          </a>
        </div>
      </div>
      <div className="App-navbar noselect">
        <div className="navbar-buttons-container">
          <div className="nav-buttons selected-nav-button">Dashboard</div>
          <div className="nav-buttons">Owners</div>
          <div className="nav-buttons">Trends</div>
        </div>
      </div>
      <div className="App-content">
        <div className="top-row">
          <div className="top-left-col">
            <div className="one-seed-box">
              <div className="one-seed-text">The #1 Seed</div>
              <div className="one-seed-owner">Carlos</div>
              <div className="one-seed-details">8-3 / 1200 PF</div>
            </div>
            <div className="best-performance-box">
              <div className="perf-top-row">Top Performance</div>
              <div className="perf-bottom-row">
                <div className="perf-left-col">180.98</div>
                <div className="perf-right-col">
                  <div className="perf-week">Week 4</div>
                  <div className="perf-team">Ryan</div>
                </div>
              </div>
            </div>
          </div>
          <div className="top-right-col">
            <div className="summary-box">
              <div className="summary-header">Leaders</div>
              <div className="summary-items-container">
                <div className="summary-item">
                  <div className="summary-data-point">1300</div>
                  <div className="summary-description-container">
                    <div className="summary-description">Points For</div>
                    <div className="summary-description-leader">carlos</div>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-data-point">91%</div>
                  <div className="summary-description-container">
                    <div className="summary-description">
                      Start/Sit Accuracy
                    </div>
                    <div className="summary-description-leader">victor</div>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-data-point">5</div>
                  <div className="summary-description-container">
                    <div className="summary-description">Win Streak</div>
                    <div className="summary-description-leader">victor</div>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-data-point negative">140</div>
                  <div className="summary-description-container">
                    <div className="summary-description">Bench Points</div>
                    <div className="summary-description-leader">oscar</div>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-data-point negative">6</div>
                  <div className="summary-description-container">
                    <div className="summary-description">Loss Streak</div>
                    <div className="summary-description-leader">nova</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="line-chart-box">
            <div className="line-chart-header">
              <div className="line-chart-title">Average Score</div>
              <div className="line-chart-selector">
                <Select
                  className="antd-selector"
                  defaultValue="league"
                  style={{ width: 90 }}
                  selectedStyle={{ backgroundColor: "transparent" }}
                  onChange={handleChartSelection}
                >
                  <Select.Option value="league">League</Select.Option>
                  <Select.Option value="ryan">Ryan</Select.Option>
                  <Select.Option value="carlos">Carlos</Select.Option>
                  <Select.Option value="carlos">Teferi</Select.Option>
                  <Select.Option value="carlos">Brandon</Select.Option>
                  <Select.Option value="carlos">Nova</Select.Option>
                </Select>
              </div>
            </div>
            <div className="line-chart-container">
              <Line
                data={{
                  labels: [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                  ],
                  datasets: [
                    {
                      label: "My First Dataset",
                      data: [65, 59, 80, 81, 56, 55, 77, 55, 69, 75, 77],
                      fill: true,
                      backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 90);
                        gradient.addColorStop(0, "rgba(231,255,133,1)");
                        gradient.addColorStop(1, "rgba(231,255,133,0)");
                        return gradient;
                      },
                      borderColor: "rgb(231,255,133)",
                      borderWidth: 4,
                      tension: 0.1,
                      pointRadius: 0,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                        color: "#FFFFFF",
                      },
                      ticks: {
                        display: false,
                      },
                    },
                    y: {
                      min: 20,
                      max: 100,
                      grid: {
                        display: true,
                        color: "rgba(255,255,255, 0.3)",
                      },
                      ticks: {
                        color: "rgb(0,71,255)",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="line-chart-box"></div>
        </div>
      </div>
      {/* <div className="App-header">
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
      </div> */}
    </div>
  );
}

export default App;
