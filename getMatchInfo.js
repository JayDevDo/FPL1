/* this works */
/* 
    FPLTeams array has 'team' on idx 0 
    1: to be in sync with FPL teamIds (start with Arsenal = 1) 
    2: to be in sync with table rows.
*/
const FPLTeams = [  "Team", 
                    "ARS", "AVL",
                    "BOU", "BHA", 
                    "BUR", "CHE", 
                    "CRY", "EVE",
                    "LEI", "LIV", 
                    "MNC", "MUN", 
                    "NEW", "NOR", 
                    "SHU", "SOU", 
                    "TOT", "WAT", 
                    "WHU", "WOL"
                ];

/* url from FPL with data */
const json_string = 'https://fantasy.premierleague.com/api/fixtures/?event>0';

/* CORS workaround to avoid cross origin header blockage */
const cors_api_url = 'https://cors-anywhere.herokuapp.com/';

/* 
    heroku app has tightened rest request amounts, 
    so when devloping first get the latest event file and save as json 
*/
const localJsonFile = "events_20200620.json";

/* 
    rndsPlayed  will be changed once FPL data is loaded 
    Due to changes in the calendar the eventround is now set manually
*/
let rndsPlayed  = 39;

let ppEevents   =   [ /*
                        {"id": 271, "oldRnd": 28, "newRnd": 38 }, // 1 
                        {"id": 275, "oldRnd": 28, "newRnd": 38 }, // 2
                        {"id": 293, "oldRnd": 31, "newRnd": 30 }, // 3 
                        {"id": 302, "oldRnd": 31, "newRnd": 31 }, // 4
                        {"id": 303, "oldRnd": 31, "newRnd": 31 }, // 5
                        {"id": 305, "oldRnd": 31, "newRnd": 31 }, // 6
                        {"id": 306, "oldRnd": 31, "newRnd": 31 }, // 7
                        {"id": 307, "oldRnd": 31, "newRnd": 31 }, // 8
                        {"id": 308, "oldRnd": 31, "newRnd": 31 }, // 9
                        {"id": 337, "oldRnd": 34, "newRnd": 34 }  // 10
                      */  
                    ];


/*  Array to store the event data from FPL */
let FPLData = [];

function loadDoc() {
    /* Get the data from FPL thru CORS evasion site and save data */

    let xhttp = new XMLHttpRequest();
    let arrB4Sort = [];

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            arrB4Sort = JSON.parse(this.responseText);
            console.log("arrB4Sort ", arrB4Sort )

            /* Adding team names to events */
            for (let ev = 0; ev < arrB4Sort.length; ev++) {
                arrB4Sort[ev].team_h_nm = FPLTeams[arrB4Sort[ev].team_h];
                arrB4Sort[ev].team_a_nm = FPLTeams[arrB4Sort[ev].team_a];

                let evId = arrB4Sort[ev].id; 
                    /*
                        if( evId == 271 ) {
                            // 271: AVL v SHU league cup reschedules
                            arrB4Sort[ev].event = 38; 
                        }else if( evId == 275 ){
                            //  275: MNC v ARS covid-19
                            arrB4Sort[ev].event = 38;
                        }else if( evId == 293 ){
                            //  293: ARS v BHA FA cup tie
                            arrB4Sort[ev].event = 30;
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
                        }else if( evId == 337 ){
                            //  337: MNC v NEW league cup reschedules
                            arrB4Sort[ev].event = 34;
                        }
                    */
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

    let pageLoc = location.href;
    let serverUrl = pageLoc.split("/")[2];

    if( serverUrl !== "jaydevdo.github.io" ){
      // served local
        console.log("served local. data drom ", localJsonFile)
        xhttp.open("GET", localJsonFile, true);
    }else{
      // served github
        xhttp.open("GET", cors_api_url + json_string, true);
    }

    xhttp.send();
}

loadDoc();

function showEvent(id){
    for(let e=0; e< FPLData.length; e++){ if( FPLData[e].id == id ){ return FPLData[e]; }}
}

function markCurrentRound(curRound){
    let tblHdr = $('#tbl thead tr th').toArray();
    for (let c = 1; c < 48; c++) {
        if ( c == curRound ) { tblHdr[c].classList += "curRound"; }
    }
}

function hideRoundsPlayed(curRound) {
    /* to hide table header rounds that have finished */
    let tblHdr = $('#tbl thead tr th').toArray();
    for (let c = 0; c < 48; c++) {
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
    console.log("getAllTeams r+", rndCnt);
    for (let t = 1; t < 21; t++) { getTeams(t, rndCnt); }
    console.log("marking postponed..", markPostponed() )
    console.log("hiding played games..", hidePastEvents() )
}

function hidePastEvents(){
    let tdevents = $( "td[plyd='true']" ); 
    let tdRounds = $( "td[insel='false']" ); 
    console.log("td[evrnd =< . size = ", tdRounds.length )
    if( tdRounds.length > 0 ) { tdRounds.addClass( "tchide" ); } 
    return tdRounds.length + " hidden";
}

function markPostponed(){
    jQuery.each( 
        ppEevents, 
        function(i,val){
            let tdevents = $( "td[evid='" + val.id + "']"  ); 
            console.log(
                "jQuery.each....", val.id , "check:",
                tdevents.length ,
                tdevents.addClass("postponed") 
            );
        }
    )
    return ppEevents.length + " postponed";
}


/*
<td class="evtTeamBlock" loc="A" df="3" plyd="false" insel="true" evid="303" onclick="fn_teamStats(4,9)" title="303: LEI (A)">31: LEI (A)</td>
*/


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
        if( val.plyd ) { evntClassList.push( "played" ); } 
        $(
            "<td class='"   + evntClassList.join(" ") + 
            "' loc="        + val.loc + 
            " df="          + val.dfc + 
            " plyd="        + val.plyd + 
            " inSel="       + val.inSel + 
            " evId="        + val.eventId +   
            " evRnd="       + val.evround +
            " title='"       + val.eventId + 
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
        for(let r=1;r<49;r++){ 
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

