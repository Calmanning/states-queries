// const statesFeatureViewQuery = ({query, state, stateQueryResult}, setState) => {

//         if(stateQueryResult && 
//            stateQueryResult.features[0].attributes.STATE_ABBR === state) {
//             return
//         };

//         flStateBoundaries.queryFeatures(query)
//             .then((queryResults) => {
//                 stateQueryResult = queryResults;
//                 setState(stateQueryResult.features[0].attributes.STATE_ABBR, stateQueryResult)
//             });
//         };