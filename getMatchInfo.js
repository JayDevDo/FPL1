/* this works */
/* 
    FPLTeams array has 'team' on idx 0 
    1: to be in sync with FPL teamIds (start with Arsenal = 1) 
    2: to be in sync with table rows.
*/
const FPLTeams = ["Team", "ARS", "AVL", "BOU", "BHA", "BUR", "CHE", 'CRY', "EVE",
    "LEI", "LIV", "MNC", "MUN", "NEW", "NOR", "SHU", "SOU", "TOT", "WAT", "WHU", "WOL"];

/* url from FPL with data */
const json_string = 'https://fantasy.premierleague.com/api/fixtures/?event>0';

/* CORS workaround to avoid cross origin header blockage */
const cors_api_url = 'https://cors-anywhere.herokuapp.com/';

/* 
    rndsPlayed  will be changed once FPL data is loaded 
    Due to changes in the calendar the eventround is now set manually
*/
let rndsPlayed = 28;

/*  Array to store the event data from FPL */
let FPLData = [];

function loadDoc() {
    /* Get the data from FPL thru CORS evasion site and save data */

    let xhttp = new XMLHttpRequest();
    let arrB4Sort = [];

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            arrB4Sort = JSON.parse(this.responseText);

            /* Adding team names to events */
            for (let ev = 0; ev < arrB4Sort.length; ev++) {
                arrB4Sort[ev].team_h_nm = FPLTeams[arrB4Sort[ev].team_h];
                arrB4Sort[ev].team_a_nm = FPLTeams[arrB4Sort[ev].team_a];

                let evId = arrB4Sort[ev].id; 
                    if( evId == 337 ){
                        //  337: MNC v NEW league cup reschedules
                        arrB4Sort[ev].event = 34;   
                    }else if( evId == 271 ) {
                        // 271: AVL v SHU league cup reschedules
                        arrB4Sort[ev].event = 38;   
                    }else if( evId == 302 ) {
                        // 302: CHE v MNC FA cup tie
                        arrB4Sort[ev].event = 31;   
                    }else if( evId == 303 ) {
                        // 303: LEI v BHA FA cup tie
                        arrB4Sort[ev].event = 31;   
                    }else if( evId == 305 ) {
                        // 305: MNU v SHE FA cup tie
                        arrB4Sort[ev].event = 31;   
                    }else if( evId == 306 ) {
                        // 306: NEW v AVL FA cup tie
                        arrB4Sort[ev].event = 31;   
                    }else if( evId == 307 ) {
                        // 307: NOR v EVE FA cup tie
                        arrB4Sort[ev].event = 31;   
                    }else if( evId == 308 ) {
                        //  308: SOU v ARS FA cup tie                           
                        arrB4Sort[ev].event = 31;                        
                    }
            }

            FPLData = arrB4Sort.sort(
                function (a, b) {
                    let A = a.event;
                    let B = b.event;
                    // console.log( "comparing events:", a.id, "and ", b.id );
                    if (parseInt(A) < parseInt(B)) { return -1; }
                    if (parseInt(A) > parseInt(B)) { return 1; }
                    return 0;
                }
            );

            /* Now the data is available activate buttons for selection of rounds */
            $("button").attr("disabled", false);

            /* Determine which rounds have finished, which are still to play */
            
            // rndsPlayed = getNextRound();
        }
    };

    xhttp.open("GET", cors_api_url + json_string, true);
    xhttp.send();
}

loadDoc();

function markCurrentRound(curRound){
    let tblHdr = $('#tbl thead tr th').toArray();
    for (let c = 0; c < 40; c++) {
        if ( c == curRound ) { tblHdr[c].classList += "curRound"; }
    }
}

function hideRoundsPlayed(curRound) {
    /* to hide table header rounds that have finished */
    let tblHdr = $('#tbl thead tr th').toArray();
    for (let c = 0; c < 40; c++) {
        tblHdr[c].classList = "";
        if ((c > 1) && (c <= (curRound + 1))) { tblHdr[c].classList += "clmnHide"; }
    }

}

function getNextRound() {

    return rndsPlayed;

    /* determins which rounds have been played (or at least selection is closed) */
    // console.log( " FPLData.length", FPLData.length, "FPLData[r].finished", FPLData[0].finished );

    /* 
        let nrpRetVal = 1;
        for(let r=38; r>0; r--){
            let evtArr=[];
            evtArr = fltrEventsByRound(r);
            function fnIsFin(ev){ return !ev.finished ; }
            
            // console.log("getnxtround check r", r, evtArr.filter(fnIsFin).length)
            
            if( evtArr.filter(fnIsFin).length < 10 ){
                nrpRetVal = r;
                rndsPlayed = nrpRetVal;
                // console.log("nrpRetVal:", nrpRetVal)
                return nrpRetVal; 
            }
        }
    */    
}

function getAllTeams(rndCnt) {
    /* loops through all teams and gets their opponents relevant data */
    for (let t = 1; t < 21; t++) { getTeams(t, rndCnt); }
    console.log("getAllTeams r+", rndCnt);
}

function getTeams(tmId, rnds) {
    /* 
        Gets the data of the coming opponents for 1 team. 
        Adds these games to table body row of the team it's called on.
        Calculates (sum) difficulty factor of each opponent still to play. 
    */
    let OppList = [];
    let ttlDF = 0;

    if (FPLData) {
        console.log("FPLData len:", FPLData.length );
        for (let i = 0; i < FPLData.length; i++) {
            let event = FPLData[i];
            let gtres;
            
            /* Only count games not played and selected number of rounds by user */
        
            let rndSelected = ((event.event > rndsPlayed) && (event.event <= (rndsPlayed + rnds)));

            if (event.team_h == tmId) { /* selected team is playing at Home */
                if (rndSelected) { ttlDF += event.team_h_difficulty; }
                OppList.push({ 
                    "eventId": event.id ,
                    "evround": event.event,
                    "loc": "H", 
                    "opp": event.team_a, 
                    "OpNm": FPLTeams[event.team_a], 
                    "dfc": event.team_h_difficulty, 
                    "plyd": event.finished, 
                    "inSel": rndSelected
                });
            } else if (event.team_a == tmId) { /* selected team is playing Away */
                if (rndSelected) { ttlDF += event.team_a_difficulty; }
                OppList.push({ 
                    "eventId": event.id ,
                    "evround": event.event,
                    "loc": "A", 
                    "opp": event.team_h, 
                    "OpNm": FPLTeams[event.team_h], 
                    "dfc": event.team_a_difficulty, 
                    "plyd": event.finished, 
                    "inSel": rndSelected
                });
            }
        }

    }

    /* clear earlier selections */
    $("#" + FPLTeams[tmId] + " > td").remove();

    /* Add td with sum of selected games difficulty factor/coefficient */
    $("<td class='dfc'>" + ttlDF + "</td>").appendTo("#" + FPLTeams[tmId]);

    /* Add all selected games to the team row after diff. factor */
    jQuery.each(OppList, function (i, val) {
        let evntClassList = ["evtTeamBlock"];
    /* hide cell if round has been played */
        if( ( val.eventId in [ 271,303,337,305,306,307,308 ] ) ){ evntClassList.push( "postponed" );  }
        if( val.plyd ) { evntClassList.push( "played" ); } 
        if( !val.inSel ) { evntClassList.push( "tchide" ); } 
        $(
            "<td class='"   + evntClassList.join(" ") + 
            "' loc="        + val.loc + 
            " df="          + val.dfc + 
            " plyd="        + val.plyd + 
            " inSel="       + val.inSel + 
            " onclick='fn_teamStats(" + tmId + 
            ","             + OppList[i].opp + 
            ")' title='"    + val.eventId + 
            ": "            + val.OpNm + 
            " ("            + val.loc + 
            ")' >"          + val.evround + 
            ": "            + val.OpNm + 
            " ("            + val.loc + 
            ")</td>"
        ).appendTo("#" + FPLTeams[tmId]);
    });

    /* Hide table header column if round has been played */
    hideRoundsPlayed(rndsPlayed);
//    markCurrentRound(rndsPlayed);

    /* Sort table based on difficulty of selected next games */
    sortTable();
}

/* 
    This will return the events array (= FPLData) filtered by the rounds from parameters
    The paramater will be a logical string condition ie "= 1" or ""> 4"
*/

let eventRndFltrVal = 1;

function rndFltrFnc(arrVal) { return ( parseInt(arrVal.event) === eventRndFltrVal ); }
function pstpndRndFltrFnc(arrVal) { return ( arrVal.event === 0 ); }

function fltrEventsByRound(EvtRnd){ 
    eventRndFltrVal = EvtRnd;
    let retEvtsArr = [];
    retEvtsArr = FPLData.filter(rndFltrFnc) ;
    return retEvtsArr ;
}

function showRoundCount(startRound){ 
    if( !startRound ){ startRound = getNextRound(); }

    for(let i=startRound; i<39; i++){ 
        let a= fltrEventsByRound(i); 
        console.log("round", i, a.length )
    }

    let b = FPLData.filter(pstpndRndFltrFnc) ;
    console.log("not planned", b.length )

}

/* 
    This will return the events array filtered by the team id from parameters
    The paramater will be an integer
*/
function fltrEventsByTeam(){ 
    
    if (FPLData) {}

}


/* 
    This will return the events array filtered by the state (finished) from parameters
    The paramater will be a boolean
*/
function fltrEventsByState(){ 

    if (FPLData) {}

}

/* 
    This will check for event (round) status.
    all events finihed means round finished,
    no events finished means round to play,
    any other combination means rouns active.
*/
function determineActiveRound(){
let darRetVal = 1; 
    if (FPLData) {
        for(let r=1;r<39;r++){ 
            if( fltrEventsByRound(r).length === 0 ){ 
                darRetVal = (r-1) ;
                rndsPlayed = darRetVal ; 
                console.log("determineActiveRound.rndsPlayed:", darRetVal )
                return darRetVal;
            } 
        }    
    }

}

function sortTable() {
    /* Sort table based on difficulty of selected next games */
    let rows = $('#tbl tbody tr').get();
    rows.sort(
        function (a, b) {
            let A = $(a).children('td.dfc').text();
            let B = $(b).children('td.dfc').text();
            if (parseInt(A) < parseInt(B)) { return -1; }
            if (parseInt(A) > parseInt(B)) { return 1; }
            return 0;
        }
    );
    $.each(rows, function (index, row) {
        $('#tbl').children('tbody').append(row);
    });
}

/* below this is new (
    error:
        getMatchInfo.js:282 Uncaught TypeError: Cannot read property 'undefined' of undefined
        at XMLHttpRequest.PlyrLiveStatsXhttp.onreadystatechange (getMatchInfo.js:282)
        PlyrLiveStatsXhttp.onreadystatechange @ getMatchInfo.js:282
        XMLHttpRequest.send (async)
        getPlLiveStats @ getMatchInfo.js:288
        (anonymous) @ getMatchInfo.js:292
        getMatchInfo.js:60  FPLData.length 380 FPLData[r].finished false
        getMatchInfo.js:79 exit for loop at  252 rounds played is 25
        getMatchInfo.js:200 stats data loaded    
    ) 
*/


/* url from FPL with data */
const statsDataUrl = "https://fantasy.premierleague.com/api/bootstrap-static/";

/* the different stats available (goals, clean sheets, bonus points etc.)  */
const elmStatsHdrs = "";

/* What kind of player (GK, DEF, MID, FRW)*/
const elmStatsTypes = "";

/* all players */
const elmnts = "elements";

/* team stats (attacking power, defensive power etc. */
const statsTeams = "";

/* player ids of the team selected in row */
let sTeamElm = [["POS"], [], [], [], []];

/* player ids of the team selected in column (opponent) */
let oTeamElm = [["POS"], [], [], [], []];

/* container for data from statsDataUrl */
let allStatsData = [];

function loadStats() {
    /* Get the data from FPL thru CORS evasion site and save data */

    let statsXhttp = new XMLHttpRequest();

    statsXhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            allStatsData = JSON.parse(this.responseText);
            console.log("stats data loaded");
        }
    };

    statsXhttp.open("GET", cors_api_url + statsDataUrl, true);
    statsXhttp.send();
}

loadStats();

/* 
    Team id's are given in the onclick event
    First team given is the team of the table row
    Second team is the opponent team (column)

    Now that we have loaded the stats 
    we are going to gather all players points for the chosen game 
    by looping thru the 'elements' section of allStatsData, and adding
    the elements belonging to the team in 

*/

/*
   https://fantasy.premierleague.com/api/event/7/live/ 
   
*/

function fn_teamStats(sTeam, oTeam) {
    console.log(
        "getting game stats for", sTeam, ": ", FPLTeams[sTeam],
        "and opp:", oTeam, ": ", FPLTeams[oTeam]
    );

   // let footbllerCount = allStatsData.elements.length;

    if (allStatsData.elements) {
        for (let f = 0; f < footbllerCount; f++) {
            let baller = allStatsData.elements[f];

            if (baller.team == sTeam) {
                sTeamElm[baller.element_type].push({ "id": baller.id, "nm": baller.web_name, "total": baller.total_points });
            } else if (baller.team == oTeam) {
                oTeamElm[baller.element_type].push({ "id": baller.id, "nm": baller.web_name, "total": baller.total_points });
            }
        }

        /* sort by points */
        for (ps = 1; ps < 5; ps++) {
            sTeamElm[ps].sort((a, b) => { return b.total - a.total; });
        }

        console.log("rowteam:", FPLTeams[sTeam], sTeamElm);
        console.log("oppteam:", FPLTeams[oTeam], oTeamElm);

        jQuery.each(sTeamElm, function (i, val) {
            console.log("i:", i, "val:", val);
            // we have the team, now geting live data
            // 4 sections
            // variable nr of players in sections
            if (val != "POS") {
                for (sp = 0; sp < val.length; sp++) {
                    //console.log("i", i, "sp", sp, "val[sp]", val[sp]);
//                  console.log( getPlLiveStats( val[sp].id,  val[sp].nm) ) ;
                    // getPlLiveStats( val[sp].id,  val[sp].nm,i,sp ) ;
                }
            }

            // $("<td class='" + rndPld + "' loc=" + val.loc + " df=" + val.dfc + " plyd=" + val.plyd + " inSel=" + val.inSel + " onclick='fn_teamStats(" + tmId + "," + oppList[i].opp + ")'" + " title='" + val.OpNm + " (" + val.loc + ")' >" + val.OpNm + " (" + val.loc + ")</td>").appendTo("#" + FPLTeams[tmId]);
        });
    }
}


function getPlLiveStats(playerId, nm, i, sp) {
    /* Get the data from FPL thru CORS evasion site and save data */
    let PlyrLiveStatsXhttp = new XMLHttpRequest();

    PlyrLiveStatsXhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let plyrStat;        
            plyrStat = JSON.parse(this.responseText);
            //console.log( nm, "player stats data loaded", plyrStat);
            sTeamElm[i][sp].stats = plyrStat;
        }
    };

    let plyrLiveUrl = "https://fantasy.premierleague.com/api/element-summary/" + playerId + "/";
    PlyrLiveStatsXhttp.open("GET", cors_api_url + plyrLiveUrl, true);
    PlyrLiveStatsXhttp.send();

}

getPlLiveStats( 168 , "test" );

/*

    player example
	"elements":[

		{
			"chance_of_playing_next_round":null,
			"chance_of_playing_this_round":null,
			"code":69140,"cost_change_event":0,
			"cost_change_event_fall":0,
			"cost_change_start":-2,
			"cost_change_start_fall":2,
			"dreamteam_count":0,
			"element_type":2,
			"ep_next":"0.5",
			"ep_this":"0.0",
			"event_points":0,
			"first_name":"Shkodran",
			"form":"0.0",
			"id":1,
			"in_dreamteam":false,
			"news":"",
			"news_added":null,
			"now_cost":53,
			"photo":"69140.jpg",
			"points_per_game":"0.0",
			"second_name":"Mustafi",
			"selected_by_percent":"0.4",
			"special":false,
			"squad_number":null,
			"status":"a",
			"team":1,
			"team_code":3,
			"total_points":0,
			"transfers_in":5179,
			"transfers_in_event":118,
			"transfers_out":25695,
			"transfers_out_event":320,
			"value_form":"0.0",
			"value_season":"0.0",
			"web_name":"Mustafi",
			"minutes":0,
			"goals_scored":0,
			"assists":0,
			"clean_sheets":0,
			"goals_conceded":0,
			"own_goals":0,
			"penalties_saved":0,
			"penalties_missed":0,
			"yellow_cards":0,
			"red_cards":0,
			"saves":0,
			"bonus":0,
			"bps":0,
			"influence":"0.0",
			"creativity":"0.0",
			"threat":"0.0",
			"ict_index":"0.0"
		},


playerInfo:
{
    "fixtures":[
        {
            "code":1059774,
            "team_h":5,
            "team_h_score":null,
            "team_a":8,
            "team_a_score":null,
            "event":8,
            "finished":false,
            "minutes":0,
            "provisional_start_time":false,
            "kickoff_time":"2019-10-05T14:00:00Z",
            "event_name":"Gameweek 8",
            "is_home":true,
            "difficulty":2
        },{
            "code":1059787,
            "team_h":9,
            "team_h_score":null,
            "team_a":5,
            "team_a_score":null,
            "event":9,
            "finished":false,
            "minutes":0,
            "provisional_start_time":false,
            "kickoff_time":"2019-10-19T14:00:00Z",
            "event_name":"Gameweek 9",
            "is_home":false,
            "difficulty":3
        },{
            "code":1059794,"team_h":5,"team_h_score":null,
            "team_a":6,"team_a_score":null,"event":10,"finished":false,
            "minutes":0,"provisional_start_time":false,
            "kickoff_time":"2019-10-26T16:30:00Z","event_name":"Gameweek 10",
            "is_home":true,"difficulty":4
        },{
            "code":1059809,"team_h":15,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":11,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-11-02T15:00:00Z",
            "event_name":"Gameweek 11","is_home":false,"difficulty":2
        },{
            "code":1059812,"team_h":5,"team_h_score":null,"team_a":19,
            "team_a_score":null,"event":12,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-11-09T15:00:00Z",
            "event_name":"Gameweek 12","is_home":true,"difficulty":3
        },{
            "code":1059830,"team_h":18,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":13,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-11-23T15:00:00Z",
            "event_name":"Gameweek 13","is_home":false,"difficulty":2
        },{
            "code":1059832,"team_h":5,"team_h_score":null,"team_a":7,
            "team_a_score":null,"event":14,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-11-30T15:00:00Z",
            "event_name":"Gameweek 14","is_home":true,"difficulty":2
        },{
            "code":1059843,"team_h":5,"team_h_score":null,"team_a":11,
            "team_a_score":null,"event":15,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-12-03T19:45:00Z",
            "event_name":"Gameweek 15","is_home":true,"difficulty":4
        },{
            "code":1059859,"team_h":17,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":16,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-12-07T15:00:00Z",
            "event_name":"Gameweek 16","is_home":false,"difficulty":4
        },{
            "code":1059863,"team_h":5,"team_h_score":null,"team_a":13,
            "team_a_score":null,"event":17,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-12-14T15:00:00Z",
            "event_name":"Gameweek 17","is_home":true,"difficulty":2
        },{
            "code":1059872,"team_h":3,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":18,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-12-21T15:00:00Z",
            "event_name":"Gameweek 18","is_home":false,"difficulty":3
        },{
            "code":1059886,"team_h":8,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":19,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-12-26T15:00:00Z",
            "event_name":"Gameweek 19","is_home":false,"difficulty":4
        },{
            "code":1059894,"team_h":5,"team_h_score":null,"team_a":12,
            "team_a_score":null,"event":20,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2019-12-28T15:00:00Z",
            "event_name":"Gameweek 20","is_home":true,"difficulty":4
        },{
            "code":1059904,"team_h":5,"team_h_score":null,"team_a":2,
            "team_a_score":null,"event":21,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-01-01T15:00:00Z",
            "event_name":"Gameweek 21","is_home":true,"difficulty":2
        },{
            "code":1059914,"team_h":6,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":22,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-01-11T15:00:00Z",
            "event_name":"Gameweek 22","is_home":false,"difficulty":4
        },{
            "code":1059924,"team_h":5,"team_h_score":null,"team_a":9,
            "team_a_score":null,"event":23,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-01-18T15:00:00Z",
            "event_name":"Gameweek 23","is_home":true,"difficulty":3
        },{
            "code":1059936,"team_h":12,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":24,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-01-21T20:00:00Z",
            "event_name":"Gameweek 24","is_home":false,"difficulty":4
        },{
            "code":1059943,"team_h":5,"team_h_score":null,"team_a":1,
            "team_a_score":null,"event":25,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-02-01T15:00:00Z",
            "event_name":"Gameweek 25","is_home":true,"difficulty":4
        },{
            "code":1059960,"team_h":16,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":26,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-02-08T15:00:00Z",
            "event_name":"Gameweek 26","is_home":false,"difficulty":2
        },{
            "code":1059963,"team_h":5,"team_h_score":null,"team_a":3,
            "team_a_score":null,"event":27,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-02-22T15:00:00Z",
            "event_name":"Gameweek 27","is_home":true,"difficulty":2
        },{
            "code":1059977,"team_h":13,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":28,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-02-29T15:00:00Z",
            "event_name":"Gameweek 28","is_home":false,"difficulty":2
        },{
            "code":1059983,"team_h":5,"team_h_score":null,"team_a":17,
            "team_a_score":null,"event":29,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-03-07T15:00:00Z",
            "event_name":"Gameweek 29","is_home":true,"difficulty":4
        },{
            "code":1059996,"team_h":11,"team_h_score":null,"team_a":5,
            "team_a_score":null,"event":30,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-03-14T15:00:00Z",
            "event_name":"Gameweek 30","is_home":false,"difficulty":5
        },{
            "code":1060002,"team_h":5,"team_h_score":null,"team_a":18,
            "team_a_score":null,"event":31,"finished":false,"minutes":0,
            "provisional_start_time":false,"kickoff_time":"2020-03-21T15:00:00Z",
            "event_name":"Gameweek 31","is_home":true,"difficulty":2
        },{
            "code":1060016,"team_h":7,"team_h_score":null,"team_a":5,"team_a_score":null,"event":32,"finished":false,"minutes":0,"provisional_start_time":false,"kickoff_time":"2020-04-04T14:00:00Z","event_name":"Gameweek 32","is_home":false,"difficulty":2
        },{
            "code":1060022,"team_h":5,"team_h_score":null,"team_a":15,"team_a_score":null,"event":33,"finished":false,"minutes":0,"provisional_start_time":false,"kickoff_time":"2020-04-11T14:00:00Z","event_name":"Gameweek 33","is_home":true,"difficulty":2
        },{
            "code":1060041,"team_h":19,"team_h_score":null,"team_a":5,"team_a_score":null,"event":34,"finished":false,"minutes":0,"provisional_start_time":false,"kickoff_time":"2020-04-18T14:00:00Z","event_name":"Gameweek 34","is_home":false,"difficulty":3
        },{
            "code":1060045,"team_h":10,"team_h_score":null,"team_a":5,"team_a_score":null,"event":35,"finished":false,"minutes":0,"provisional_start_time":false,"kickoff_time":"2020-04-25T14:00:00Z","event_name":"Gameweek 35","is_home":false,"difficulty":5
        },{
            "code":1060053,"team_h":5,"team_h_score":null,"team_a":20,"team_a_score":null,"event":36,"finished":false,"minutes":0,"provisional_start_time":false,"kickoff_time":"2020-05-02T14:00:00Z","event_name":"Gameweek 36","is_home":true,"difficulty":2
        },{
            "code":1060067,"team_h":14,"team_h_score":null,"team_a":5,"team_a_score":null,"event":37,"finished":false,"minutes":0,"provisional_start_time":false,"kickoff_time":"2020-05-09T14:00:00Z","event_name":"Gameweek 37","is_home":false,"difficulty":3
        },{
            "code":1060073,"team_h":5,"team_h_score":null,"team_a":4,"team_a_score":null,"event":38,"finished":false,"minutes":0,"provisional_start_time":false,"kickoff_time":"2020-05-17T14:00:00Z","event_name":"Gameweek 38","is_home":true,"difficulty":2
        }
    ],
    "history":[
        {
            "element":93,
            "fixture":3,
            "opponent_team":16,
            "total_points":8,
            "was_home":true,
            "kickoff_time":"2019-08-10T14:00:00Z",
            "team_h_score":3,
            "team_a_score":0,
            "round":1,
            "minutes":90,
            "goals_scored":0,
            "assists":0,
            "clean_sheets":1,
            "goals_conceded":0,
            "own_goals":0,
            "penalties_saved":0,
            "penalties_missed":0,
            "yellow_cards":0,
            "red_cards":0,
            "saves":3,
            "bonus":1,
            "bps":28,
            "influence":"25.6",
            "creativity":"10.0",
            "threat":"0.0",
            "ict_index":"3.6",
            "value":45,
            "transfers_balance":0,
            "selected":344271,
            "transfers_in":0,
            "transfers_out":0
        },{
            "element":93,"fixture":11,"opponent_team":1,"total_points":3,"was_home":false,"kickoff_time":"2019-08-17T11:30:00Z","team_h_score":2,"team_a_score":1,"round":2,"minutes":90,"goals_scored":0,"assists":0,"clean_sheets":0,"goals_conceded":2,"own_goals":0,"penalties_saved":0,"penalties_missed":0,"yellow_cards":0,"red_cards":0,"saves":7,"bonus":0,"bps":24,"influence":"54.0","creativity":"10.3","threat":"2.0","ict_index":"6.6","value":45,"transfers_balance":55141,"selected":457584,"transfers_in":82331,"transfers_out":27190},{"element":93,"fixture":30,"opponent_team":20,"total_points":2,"was_home":false,"kickoff_time":"2019-08-25T15:30:00Z","team_h_score":1,"team_a_score":1,"round":3,"minutes":90,"goals_scored":0,"assists":0,"clean_sheets":0,"goals_conceded":1,"own_goals":0,"penalties_saved":0,"penalties_missed":0,"yellow_cards":0,"red_cards":0,"saves":2,"bonus":0,"bps":14,"influence":"9.4","creativity":"0.0","threat":"0.0","ict_index":"0.9","value":45,"transfers_balance":90981,"selected":573817,"transfers_in":127275,"transfers_out":36294},{"element":93,"fixture":32,"opponent_team":10,"total_points":2,"was_home":true,"kickoff_time":"2019-08-31T16:30:00Z","team_h_score":0,"team_a_score":3,"round":4,"minutes":90,"goals_scored":0,"assists":0,"clean_sheets":0,"goals_conceded":3,"own_goals":0,"penalties_saved":0,"penalties_missed":0,"yellow_cards":0,"red_cards":0,"saves":5,"bonus":0,"bps":23,"influence":"32.2","creativity":"0.0","threat":"0.0","ict_index":"3.2","value":45,"transfers_balance":99178,"selected":693050,"transfers_in":143033,"transfers_out":43855},{"element":93,"fixture":43,"opponent_team":4,"total_points":3,"was_home":false,"kickoff_time":"2019-09-14T14:00:00Z","team_h_score":1,"team_a_score":1,"round":5,"minutes":90,"goals_scored":0,"assists":0,"clean_sheets":0,"goals_conceded":1,"own_goals":0,"penalties_saved":0,"penalties_missed":0,"yellow_cards":0,"red_cards":0,"saves":4,"bonus":0,"bps":19,"influence":"31.4","creativity":"0.0","threat":"0.0","ict_index":"3.1","value":46,"transfers_balance":153960,"selected":870790,"transfers_in":183463,"transfers_out":29503},{"element":93,"fixture":52,"opponent_team":14,"total_points":6,"was_home":true,"kickoff_time":"2019-09-21T14:00:00Z","team_h_score":2,"team_a_score":0,"round":6,"minutes":90,"goals_scored":0,"assists":0,"clean_sheets":1,"goals_conceded":0,"own_goals":0,"penalties_saved":0,"penalties_missed":0,"yellow_cards":0,"red_cards":0,"saves":2,"bonus":0,"bps":24,"influence":"15.0","creativity":"0.0","threat":"0.0","ict_index":"1.5","value":46,"transfers_balance":40882,"selected":909245,"transfers_in":62455,"transfers_out":21573},{"element":93,"fixture":61,"opponent_team":2,"total_points":1,"was_home":false,"kickoff_time":"2019-09-28T14:00:00Z","team_h_score":2,"team_a_score":2,"round":7,"minutes":90,"goals_scored":0,"assists":0,"clean_sheets":0,"goals_conceded":2,"own_goals":0,"penalties_saved":0,"penalties_missed":0,"yellow_cards":0,"red_cards":0,"saves":1,"bonus":0,"bps":10,"influence":"6.6","creativity":"0.0","threat":"0.0","ict_index":"0.7","value":46,"transfers_balance":75141,"selected":993837,"transfers_in":91322,"transfers_out":16181}],"history_past":[{"season_name":"2016/17","element_code":98747,"start_cost":40,"end_cost":39,"total_points":0,"minutes":0,"goals_scored":0,"assists":0,"clean_sheets":0,"goals_conceded":0,"own_goals":0,"penalties_saved":0,"penalties_missed":0,"yellow_cards":0,"red_cards":0,"saves":0,"bonus":0,"bps":0,"influence":"0.0","creativity":"0.0","threat":"0.0","ict_index":"0.0"},{"season_name":"2017/18","element_code":98747,"start_cost":45,"end_cost":50,"total_points":152,"minutes":3114,"goals_scored":0,"assists":0,"clean_sheets":11,"goals_conceded":35,"own_goals":0,"penalties_saved":1,"penalties_missed":0,"yellow_cards":3,"red_cards":0,"saves":113,"bonus":19,"bps":701,"influence":"862.4","creativity":"40.0","threat":"0.0","ict_index":"90.1"},{"season_name":"2018/19","element_code":98747,"start_cost":50,"end_cost":48,"total_points":0,"minutes":0,"goals_scored":0,"assists":0,"clean_sheets":0,"goals_conceded":0,"own_goals":0,"penalties_saved":0,"penalties_missed":0,"yellow_cards":0,"red_cards":0,"saves":0,"bonus":0,"bps":0,"influence":"0.0","creativity":"0.0","threat":"0.0","ict_index":"0.0"}]}

*/
