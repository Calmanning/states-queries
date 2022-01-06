const stateBoudariesLayerUrl= "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0"

arcgisRest.queryFeatures(
    {
        url: stateBoudariesLayerUrl,
        where: "FID > 0",
        outFields: "STATE_NAME, STATE_ABBR"
    }
).
then(response => {
        populateStateDropdownList(response.features)
});

function statesQuery(query, state) {
    console.log(query)
    
    arcgisRest.queryFeatures(
        query
    ).
    then(response => {
        console.log(response)
        return response
    }).catch((err) => {
        console.log(err)
    })
    // if(stateQueryResult && 
    //     stateQueryResult.features[0].attributes.STATE_ABBR === state) {
    //     return
    // };

    // stateBoudariesLayerUrl.queryFeatures(query)
    //     .then((queryResults) => {
    //         // stateQueryResult = queryResults;
    //         setState(stateQueryResult.features[0].attributes.STATE_ABBR, stateQueryResult)
    //     });
};
