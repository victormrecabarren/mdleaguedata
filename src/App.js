import "./App.css";
import logo from "./Nfl_Black_Svg.svg";
import leagueAvi from "./league-avi.png";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import SeedTrends from "./components/SeedTrends";
import { getStandings, getLongestStreak } from "./utils/utils";

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
  matchupsEndpoint,
  columnDefs,
  userDictionary,
} from "./config";
import { users } from "./league-users";
// import { DataTable } from "./components/DataTable";
import { Select } from "antd";

function App() {
  const [owners, setOwners] = useState([]);
  const [matchups, setMatchups] = useState([]);
  const [metadata, setMetadata] = useState({});
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
  const [selectedOwner, setSelectedOwner] = useState();

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
    setSelectedOwner(selection);
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
          seeds: {},
          winCount: 0,
          pointsCount: 0,
          maxPF: userMaxPF,
          PF: userPF,
          PA: userPA,
          accuracy: Math.round((userPF / userMaxPF) * 100) / 100,
          record: `${roster.settings.wins}-${roster.settings.losses}`,
          wins: roster.settings.wins,
          losses: roster.settings.losses,
          leftOnBench: Math.round((userMaxPF - userPF) * 100) / 100,
          leftOnBenchAvg:
            Math.round(((userMaxPF - userPF) / gamesPlayed) * 100) / 100,
          averagePF: Math.round((userPF / gamesPlayed) * 100) / 100,
          averageMaxPF: Math.round((userMaxPF / gamesPlayed) * 100) / 100,
          winStreak: getLongestStreak(roster.metadata.record, "W"),
          lossStreak: getLongestStreak(roster.metadata.record, "L"),
          rosterId: roster.roster_id,
        };
      });
      const formattedWithStandings = getStandings(formattedUserData);
      setOwners(formattedWithStandings);

      let bestPerformance = {
        points: 0,
        rosterId: null,
        week: 0,
      };

      // Get matchup data:
      const matchupPromises = Array.from(Array(gamesPlayed))
        .fill(0)
        .map((n, i) => {
          return fetch(`${matchupsEndpoint}/${i + 1}`);
        });
      Promise.all(matchupPromises)
        .then((promises) =>
          Promise.all(promises.map((matchupRes) => matchupRes.json()))
        )
        .then((allJson) => {
          const updatedMatchups = allJson.map((week, i) => {
            let combinedPoints = week.reduce((agg, b) => {
              if (b.points > bestPerformance.points) {
                bestPerformance.points = b.points;
                bestPerformance.rosterId = b.roster_id;
                bestPerformance.week = i + 1;
              }
              return agg + b.points;
            }, 0);
            combinedPoints = Math.round(combinedPoints * 100) / 100;
            const averageOutput = Math.round((combinedPoints / 12) * 100) / 100;
            return {
              week: i + 1,
              combinedPoints,
              averageOutput,
              rosters: week.map((roster) => {
                const currUser = formattedWithStandings.find(
                  (formattedUser) => formattedUser.rosterId === roster.roster_id
                );
                return {
                  rosterId: roster.roster_id,
                  points: roster.points,
                  owner: currUser.userName,
                  realName: currUser.realName,
                };
              }),
            };
          });
          setMetadata((prevData) => ({
            ...prevData,
            bestPerformance: {
              owner: formattedWithStandings.find(
                (owner) => owner.rosterId === bestPerformance.rosterId
              ),
              score: bestPerformance.points,
              week: bestPerformance.week,
            },
          }));

          setMatchups(updatedMatchups);
        });

        
      // Get other metadata and store in state:
      let highestPointsFor;
      let startSitAccuracy;
      let longestWinStreak;
      let benchPointsWinner;
      let longestLossStreak;

      formattedWithStandings.forEach((owner) => {
        if (!highestPointsFor) {
          highestPointsFor = owner;
          startSitAccuracy = owner;
          longestWinStreak = owner;
          benchPointsWinner = owner;
          longestLossStreak = owner;
        } else {
          if (owner.PF > highestPointsFor.PF) {
            highestPointsFor = owner;
          }
          if (owner.accuracy > startSitAccuracy.accuracy) {
            startSitAccuracy = owner;
          }
          if (owner.winStreak > longestWinStreak.winStreak) {
            longestWinStreak = owner;
          }
          if (owner.leftOnBench > benchPointsWinner.leftOnBench) {
            benchPointsWinner = owner;
          }
          if (owner.lossStreak > longestLossStreak.lossStreak) {
            longestLossStreak = owner;
          }
        }
      });
      setMetadata((prevData) => ({
        ...prevData,
        highestPointsFor,
        startSitAccuracy,
        benchPointsWinner,
        longestLossStreak,
        longestWinStreak,
      }));
    };
    fetchLeagueData();
  }, []);

  const oneSeed = owners.find((owner) => owner.standing === 1);
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <>
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
                      <div className="one-seed-owner">{oneSeed?.realName}</div>
                      <div className="one-seed-details">
                        {`${oneSeed?.record} / ${oneSeed?.PF}`}
                      </div>
                    </div>
                    <div className="best-performance-box">
                      <div className="perf-top-row">Top Performance</div>
                      <div className="perf-bottom-row">
                        <div className="perf-left-col">
                          {metadata.bestPerformance?.score}
                        </div>
                        <div className="perf-right-col">
                          <div className="perf-week">
                            Week {metadata.bestPerformance?.week}
                          </div>
                          <div className="perf-team">
                            {metadata.bestPerformance?.owner.realName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="top-right-col">
                    <div className="summary-box">
                      <div className="summary-header">Leaders</div>
                      <div className="summary-items-container">
                        <div className="summary-item">
                          <div className="summary-data-point">
                            {metadata.highestPointsFor
                              ? Math.trunc(metadata.highestPointsFor.PF)
                              : "..."}
                          </div>
                          <div className="summary-description-container">
                            <div className="summary-description">Points For</div>
                            <div className="summary-description-leader">
                              {metadata.highestPointsFor
                                ? metadata.highestPointsFor.realName.toLowerCase()
                                : "..."}
                            </div>ƒconsole
                          </div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-data-point">
                            {metadata.highestPointsFor
                              ? `${metadata.startSitAccuracy.accuracy * 100}%`
                              : "..."}
                          </div>
                          <div className="summary-description-container">
                            <div className="summary-description">
                              Start/Sit Accuracy
                            </div>
                            <div className="summary-description-leader">
                              {metadata.highestPointsFor
                                ? metadata.startSitAccuracy.realName.toLowerCase()
                                : "..."}
                            </div>
                          </div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-data-point">
                            {metadata.longestWinStreak
                              ? metadata.longestWinStreak.winStreak
                              : "..."}
                          </div>
                          <div className="summary-description-container">
                            <div className="summary-description">Win Streak</div>
                            <div className="summary-description-leader">
                              {metadata.longestWinStreak
                                ? metadata.longestWinStreak.realName.toLowerCase()
                                : "..."}
                            </div>
                          </div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-data-point negative">
                            {metadata.benchPointsWinner
                              ? Math.trunc(metadata.benchPointsWinner.leftOnBench)
                              : "..."}
                          </div>
                          <div className="summary-description-container">
                            <div className="summary-description">Bench Points</div>
                            <div className="summary-description-leader">
                              {metadata.highestPointsFor
                                ? metadata.benchPointsWinner.realName.toLowerCase()
                                : "..."}
                            </div>
                          </div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-data-point negative">
                            {metadata.longestLossStreak
                              ? metadata.longestLossStreak.lossStreak
                              : "..."}
                          </div>
                          <div className="summary-description-container">
                            <div className="summary-description">Loss Streak</div>
                            <div className="summary-description-leader">
                              {metadata.longestLossStreak
                                ? metadata.longestLossStreak.realName.toLowerCase()
                                : "..."}
                            </div>
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
                          {owners.map((owner) => {
                            return (
                              <Select.Option value={owner.realName} key={owner.id}>
                                {owner.realName}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </div>
                    </div>
                    <div className="line-chart-container">
                      <Line
                        data={{
                          labels: matchups.map((week, i) => i + 1),
                          datasets: [
                            {
                              label: "Avg PF",
                              data: matchups.map((week) => week.averageOutput),
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
                            ...(selectedOwner && selectedOwner !== "league"
                              ? [
                                {
                                  label: "Points Scored",
                                  data: matchups.map((week) => {
                                    const currRoster = week.rosters.find(
                                      (roster) => roster.realName === selectedOwner
                                    );
                                    return currRoster.points;
                                  }),
                                  fill: true,
                                  backgroundColor: (context) => {
                                    const ctx = context.chart.ctx;
                                    const gradient = ctx.createLinearGradient(
                                      0,
                                      0,
                                      0,
                                      90
                                    );
                                    gradient.addColorStop(0, "rgba(0,71,255,1)");
                                    gradient.addColorStop(1, "rgba(0,71,255,0)");
                                    return gradient;
                                  },
                                  borderColor: "rgb(0,71,255)",
                                  borderWidth: 4,
                                  tension: 0.1,
                                  pointRadius: 0,
                                },
                              ]
                              : []),
                          ],
                        }}
                        options={{
                          maintainAspectRatio: false,
                          hover: {
                            mode: "nearest",
                            intersect: false,
                          },
                          interaction: {
                            intersect: false,
                            mode: "x",
                          },
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
                              // min: 60,
                              // max: 130,
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
                  <div className="last-box">Coming soon...</div>
                </div>
              </div>
            </>
          } />
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

        <Route path="/seed-trends" element={<SeedTrends matchups={matchups} owners={owners}/>} />
      </Routes>
    </div>
  );
}

export default App;
