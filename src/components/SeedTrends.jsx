import { useState, useEffect } from "react";
import { leagueEndpoint } from "../config";
import { matchupsEndpoint } from "../config";
import { compileWeeklySeeds } from "../utils/utils";

import SeedTrendChart from "./SeedTrendChart";

const SeedTrends = (props) => {
    // console.log('Owners', props.owners)
    const [regularSeasonGames, setRegularSeasonGames] = useState(0);
    const [allMatchupsInYear, setAllMatchupsInYear] = useState([]);
    const [owners, setOwners] = useState(props.owners || []);

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
        if (allMatchupsInYear.length > 0 && props.owners?.length > 0) {
            const compiled = compileWeeklySeeds(props.owners, allMatchupsInYear);
            setOwners(compiled);
            console.log('Compiled Weekly Seeds:', owners);
        }
    }, [allMatchupsInYear]);

    return (
        <>
        <div className="seed-trends" style={{ width: "95%", height: "100%", margin: "0 auto" }}>
            <h1 style={{textAlign: "center"}}>Seed Trends</h1>
            <SeedTrendChart owners={owners} />
        </div>
        </>
    );
}

export default SeedTrends;