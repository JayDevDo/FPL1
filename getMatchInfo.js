/* this works */
/* 
    FPLTeams array has 'team' on idx 0 
    1: to be in sync with FPL teamIds (start with Arsenal = 1) 
    2: to be in sync with table rows.
*/

const FPLTeams = [  
/* 0 */ "Team", 
/* 1 */ "ARS",  
/* 2 */ "AVL", 
/* 3 */ "BHA", 
/* 4 */ "BUR", 
/* 5 */ "CHE", 
/* 6 */ "CRY", 
/* 7 */ "EVE", 
/* 8 */ "FUL", 
/* 10 seems odd LEE comes before LEI */ "LEI", 
/* 9  seems odd LEE comes before LEI */ "LEE", 
/* 11 */ "LIV", 
/* 12 */ "MNC", 
/* 13 */ "MUN", 
/* 14 */ "NEW", 
/* 15 */ "SHU", 
/* 16 */ "SOU",  
/* 17 */ "TOT", 
/* 18 */ "WBA", 
/* 19 */ "WHU", 
/* 20 */ "WOL"
];

/* url from FPL with data */
const json_string = 'https://fantasy.premierleague.com/api/fixtures/?event>0';

/* CORS workaround to avoid cross origin header blockage */
const cors_api_url = 'https://cors-anywhere.herokuapp.com/';

/* 
    heroku app has tightened rest request amounts, 
    so when devloping first get the latest event file and save as json 
*/
const localJsonFile = "events_2020-2021.json";

/* 
    rndsPlayed  will be changed once FPL data is loaded 
    Due to changes in the calendar the eventround is now set manually
*/
let rndsPlayed  = 8;

let ppEevents   =   [ 
						{"id": 379, "oldRnd": 1, "newRnd": 39 }, // 1  
						{"id": 380, "oldRnd": 1, "newRnd": 39 }  // 2  
						/* 
						{"id": 379, "oldRnd": 1, "newRnd": 38 }, // 1
						*/  
					];


/*  Array to store the event data from FPL */
let FPLData = [];
let FPL_TD = [ 
                {   
                    "tmId": 0,
                    "tmNm": "Team",
                    "tmHm": 0,
                    "tmAw": 0
                },
                {},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{} ];

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
                    
                        if( evId == 379 ) {
                            // 379: BUR V MNU summer break uefa
                            arrB4Sort[ev].event = 38; 
                        }else if( evId == 380 ){
                            //  380: MNC v AVL summer break uefa
                            arrB4Sort[ev].event = 38;
                        }
                    
            }

            /* localhost://JAVA/FPL/FPL/index.html */

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
        console.log("served local. data from ", localJsonFile)
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
    for (let c = 1; c < 40; c++) {
        if ( c == curRound ) { tblHdr[c].classList += "curRound"; }
    }
}

function hideRoundsPlayed(curRound) {
    /* to hide table header rounds that have finished */
    let tblHdr = $('#tbl thead tr th').toArray();
    console.log("hideRoundsPlayed > tblHdr len", tblHdr.length )
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
    console.log("getAllTeams r+", rndCnt);
    for (let t = 1; t < 21; t++) { getTeams(t, rndCnt); }
    console.log("marking postponed..", markPostponed() )
    console.log("hiding played games..", hidePastEvents() )
   // console.log("fillTmDFTable..", fillTmDFTable() )
}

function hidePastEvents(){
    let tdevents = $( "td[plyd='true']" ); 
    let tdRounds = $( "td[insel='false']" ); 
    console.log("td_inselection=false", tdRounds.length )
    if( tdRounds.length >= 0 ) { tdRounds.addClass( "tchide" ); } 
    return tdRounds.length + " hidden";
}

function markPostponed(){
    // ppEevents is an array with postponed games declared earlier
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

function fltrFPLData(dataArr, tmId){
    let retResArr = [];
    console.log("fltrFPLData","tmId", tmId, dataArr.length )

    retResArr = dataArr.filter(
        function (a) {
            let A = a.team_h;
            let B = a.team_a;
                // console.log( "comparing events:", a.id, "and ", b.id );
                if ( (parseInt(A)==parseInt(tmId)) || (parseInt(B)==parseInt(tmId)) ) 
                    { return 1; }
                else
                    { return -1; }
        }
    );

    console.log("dataArr after filter: ", retResArr.length )
    return retResArr;
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
        //  console.log("FPLData len:", FPLData.length );
        console.log("filtered FPLData:", fltrFPLData(FPLData, tmId) )

        for (let i = 0; i < FPLData.length; i++ ) {
            let event = FPLData[i];
            let gtres;
            
            /* Only count games not played and selected number of rounds by user */
            let rndSelected = ((event.event > rndsPlayed) && (event.event <= (rndsPlayed + rnds)));
            // console.log("event.event",event.event ,"rndsPlayed",rndsPlayed , "rnds", rnds, ' rndSelected', rndSelected)
            // console.log("rndSelected = ", rndSelected )

            if (event.team_h == tmId) { /* selected team is playing at Home */

                console.log(
                    "getTeams_FPLData: event.team_h:", 
                    tmId, "nm:", FPLTeams[tmId],"rnds:", rnds);

                if (rndSelected) { ttlDF += event.team_h_difficulty; }

                FPL_TD[tmId].tmId = tmId;
                FPL_TD[tmId].tmNm = FPLTeams[tmId],
                FPL_TD[tmId].tmHm = event.team_h_difficulty;

                OppList.push({ 
                    "eventId": event.id ,
                    "evround": event.event,
                    "loc": "H", 
                    "curTmId": event.team_h,
                    "Hdfc": event.team_h_difficulty, 
                    "opp": event.team_a, 
                    "OpNm": FPLTeams[event.team_a], 
                    "dfc": event.team_a_difficulty, 
                    "plyd": event.finished, 
                    "inSel": rndSelected
                });
            } else if (event.team_a == tmId) { /* selected team is playing Away */
                if (rndSelected) { ttlDF += event.team_a_difficulty; }
                FPL_TD[tmId].tmId = tmId;
                FPL_TD[tmId].tmNm = FPLTeams[tmId],
                FPL_TD[tmId].tmAw = event.team_a_difficulty;

                OppList.push({ 
                    "eventId": event.id ,
                    "evround": event.event,
                    "loc": "A", 
                    "curTmId": event.team_a,
                    "Hdfc": event.team_a_difficulty, 
                    "opp": event.team_h, 
                    "OpNm": FPLTeams[event.team_h], 
                    "dfc": event.team_h_difficulty, 
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
            " df="          + val.Hdfc + 
            " plyd="        + val.plyd + 
            " inSel="       + val.inSel + 
            " evId="        + val.eventId +   
            " evRnd="       + val.evround +
            " evCtmID="     + val.curTmId +
            " evOtmID="     + val.opp +
            " title='"       + val.eventId + 
            ": "            + val.OpNm + 
            " df="          + val.Hdfc +
            " ("            + val.loc + 
            ")' >"    /*      + val.evround + 
            ": "       */     + val.OpNm + 
            " ("            + val.loc + 
            ") " 		+ val.dfc +
		"</td>"
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

function fillTmDFTable(){
    let targetTable = $(".tm_df_tbl")
    console.log("FPL_TD", FPL_TD)

//         for (let t = 1; t < 21; t++) {  let targetRow   = targetTable.row(t+1) }
}


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

