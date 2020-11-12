
let getAllDataCounter = 0
let mk_df_tableCounter = 0

function getAllData(){
    console.log(
        "fpl_mk_DF_Table.js-getAllData called:", getAllDataCounter++ , 
        "FPLTeams.length" , FPLTeams.length 
    )
}

function showEvent(id){
    for(let e=0; e< FPLData.length; e++){ if( FPLData[e].id == id ){ return FPLData[e];}}
}

function mkDFTable(){

    console.log(
        "fpl_mk_DF_Table.js-mk_df_table called:", mk_df_tableCounter++, 
        "FPL_TD", FPL_TD.length ,
        "FPLData.length", FPLData.length
    )


    for (let evid=0; evid<10 ; evid++ ){

        console.log(" showEvent(evid)",  showEvent(evid) )
    
        /*        
        let testEvent = showEvent(evid)
                
                console.log(
                        "testEvent.HOME:", testEvent.team_h_nm, testEvent.team_h, testEvent.team_h_difficulty, "/r",
                        "cmp_DF( team_h, 'H', team_h_difficulty )", cmp_DF( testEvent.team_h, "H", testEvent.team_h_difficulty ) ,"/r",
                        "testEvent.AWAY:", testEvent.team_a_nm, testEvent.team_a, testEvent.team_a_difficulty,"/r",
                        "cmp_DF( team_a, 'A', team_a_difficulty )", cmp_DF( testEvent.team_a, "A", testEvent.team_a_difficulty ) ,"/r",
                        "cmp_OppDF(e)", cmp_OppDF(  testEvent ) 
                )
        */
    }

    /*
        getMatchInfo.js:262 253 "LEI" " (" 3 ") v" "ARS" " (" 4 ")"
        getMatchInfo.js:262 43 "LEI" " (" 2 ") v" "AVL" " (" 4 ")"
        getMatchInfo.js:262 114 "LEI" " (" 2 ") v" "BHA" " (" 4 ")"
        getMatchInfo.js:262 14 "LEI" " (" 3 ") v" "BUR" " (" 4 ")"
        getMatchInfo.js:262 173 "LEI" " (" 3 ") v" "CHE" " (" 4 ")"
        getMatchInfo.js:262 323 "LEI" " (" 2 ") v" "CRY" " (" 4 ")"
        getMatchInfo.js:262 123 "LEI" " (" 2 ") v" "EVE" " (" 4 ")"
        getMatchInfo.js:262 94 "LEI" " (" 2 ") v" "FUL" " (" 4 ")"
        getMatchInfo.js:262 204 "LEI" " (" 2 ") v" "LEE" " (" 4 ")"
        getMatchInfo.js:262 234 "LEI" " (" 4 ") v" "LIV" " (" 4 ")"
        getMatchInfo.js:262 143 "LEI" " (" 4 ") v" "MUN" " (" 4 ")"
        getMatchInfo.js:262 294 "LEI" " (" 4 ") v" "MNC" " (" 4 ")"
        getMatchInfo.js:262 343 "LEI" " (" 2 ") v" "NEW" " (" 4 ")"
        getMatchInfo.js:262 274 "LEI" " (" 3 ") v" "SHU" " (" 4 ")"
        getMatchInfo.js:262 183 "LEI" " (" 3 ") v" "SOU" " (" 4 ")"
        getMatchInfo.js:262 373 "LEI" " (" 3 ") v" "TOT" " (" 4 ")"
        getMatchInfo.js:262 314 "LEI" " (" 2 ") v" "WBA" " (" 4 ")"
        getMatchInfo.js:262 34 "LEI" " (" 2 ") v" "WHU" " (" 4 ")"
        getMatchInfo.js:262 74 "LEI" " (" 3 ") v" "WOL" " (" 4 ")"
    */

}


function cmp_OppDF(e){
    return ( e.team_h_difficulty == e.team_a_difficulty )? 0:(e.team_h_difficulty > e.team_a_difficulty)? e.team_h_difficulty-e.team_a_difficulty:e.team_a_difficulty-e.team_h_difficulty
}

function cmp_DF(tm, ha, df_from_json){
    // checks the events json for the DF of a certain team against the data in FPL_TD (later FPL data)
    let retval = 0;
    retval = ( ha=="H" )? FPL_TD[tm].tmHm:FPL_TD[tm].tmAw ;

    let cmpRes = ( parseInt( retval ) === parseInt( df_from_json ) );

    console.log( 
        "cmp_DF retval tm:", tm,
        "H-A:", ha, 
        "FPL_TD", retval, 
        "DF:", df_from_json, 
        "cmpRes", cmpRes
    ) 

    return cmpRes;

}

function getEventsTeam(id){
    let retEventsArr = [];

    for(let e=0; e< FPLData.length; e++){ 
        
        if(( FPLData[e].team_h == id ) || ( FPLData[e].team_a == id ) ){ 
            retEventsArr.push( FPLData[e] )
        }
    
    }

    return retEventsArr;

}

function fillTmDFTable(){
    console.log("fillTmDFTable fplMakeTableDF.js")

    for (let t = 1; t < 21; t++) {  
    
        let dfTeam      = FPL_TD[t]
        let targetRow   = $( "#tm_df_tbl tr[tmid='" + dfTeam.tmId + "']" ) 
        
        $( "#tm_df_tbl tr[tmid='" + dfTeam.tmId + "'] > td" ).remove();
        
        console.log( "removed fpl-td cells", $( "#tm_df_tbl tr[tmid='" + dfTeam.tmId + "'] > td" ).length  );

        // $( "#tm_df_tbl tr[tmid='1']" ).length

        console.log("fillTmDFTable-dfTeam", dfTeam.tmNm, dfTeam,"targetRow", targetRow.length)

        $(
            "<td class='"   + "df_hm"       + 
            "' df="         + dfTeam.tmHm   + 
            ">"             + dfTeam.tmHm   + 
            "</td><td> - </td>" +
            "<td class='"   + "df_aw"       + 
            "' df="         + dfTeam.tmAw   + 
            ">"             + dfTeam.tmAw   + 
            "</td>"
        ).appendTo(targetRow);

    }
}
