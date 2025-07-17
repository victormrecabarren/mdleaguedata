import { useState, useEffect } from "react";
import { leagueEndpoint } from "../config";
import { matchupsEndpoint } from "../config";
import { compileWeeklySeeds } from "../utils";

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

    // Run the seed compilation when all matchups are fetched
    useEffect(() => {
        if (allMatchupsInYear.length > 0) {
            compileWeeklySeeds(props.owners, allMatchupsInYear);
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