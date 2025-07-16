import { useState, useEffect } from "react";
import { leagueEndpoint } from "../config";
import { matchupsEndpoint } from "../config";

const SeedTrends = (props) => {
    // console.log('Owners', props.owners)
    const [regularSeasonGames, setRegularSeasonGames] = useState(0);
    const [allMatchupsInYear, setAllMatchupsInYear] = useState([]);
    
    // FETCH LEAGUE DATA 
    useEffect(() => {
        const fetchLeagueData = async () => {
            const leagueResponse = await fetch(leagueEndpoint);
            const leagueData = await leagueResponse.json();
            const regularSeasonGames = leagueData.settings.playoff_week_start - 1;
            setRegularSeasonGames(regularSeasonGames);
            // console.log('Regular Season Games:', regularSeasonGames)
        }
        fetchLeagueData();
    }, []);

    // FETCH ALL MATCHUPS IN YEAR
    useEffect(() => {
        const fetchMatchups = async () => {
            let allMatchups = [];

            for (let i = 1; i <= regularSeasonGames; i++) {
                const response = await fetch(`${matchupsEndpoint}/${i}`);
                const matchupWeek = await response.json();
                allMatchups.push(matchupWeek);
            }
            setAllMatchupsInYear(allMatchups);
            // console.log('All Matchups in Year:', allMatchups);
        };
        fetchMatchups();
    }, [regularSeasonGames]);


    // COMPILE WEEKLY SEEDS
    const compileWeeklySeeds = () => {
        const owners = [...props.owners];

        allMatchupsInYear.forEach((matchupWeek, weekIndex) => {
            const matchupMap = {};

            // Group matchups by matchup_id
            matchupWeek.forEach(team => {
                const id = team.matchup_id;
                if (!matchupMap[id]) matchupMap[id] = [];
                matchupMap[id].push(team);
            });

            // Compare each matchup pair
            Object.values(matchupMap).forEach(pair => {
                if (pair.length === 2) {
                    const [teamA, teamB] = pair;

                    const ownerA = owners.find(o => o.rosterId === teamA.roster_id);
                    const ownerB = owners.find(o => o.rosterId === teamB.roster_id);

                    if (!ownerA || !ownerB) return;

                    ownerA.pointsCount += teamA.points;
                    ownerB.pointsCount += teamB.points;

                    if (teamA.points > teamB.points) {
                        ownerA.winCount += 1;
                    } else if (teamB.points > teamA.points) {
                        ownerB.winCount += 1;
                    }
                }
            });

            // Rank all owners by winCount, then pointsCount
            const rankings = [...owners]
                .sort((a, b) => {
                    if (b.winCount === a.winCount) {
                        return b.pointsCount - a.pointsCount;
                    }
                    return b.winCount - a.winCount;
                });

            // Store weekly seeds
            rankings.forEach((owner, i) => {
                owner.seeds[`Week ${weekIndex + 1} Seed`] = i + 1;
            });
        });

        console.log("Compiled Owners with Weekly Seeds:", owners);
    };

    // Run the seed compilation when all matchups are fetched
    useEffect(() => {
        if (allMatchupsInYear.length > 0) {
            compileWeeklySeeds();
        }
    }, [allMatchupsInYear]);

    return (
        <div className="seed-trends">
            <h1>Seed Trends</h1>
            <p>Data on seed trends will be displayed here.</p>
        </div>
    );
}

export default SeedTrends;