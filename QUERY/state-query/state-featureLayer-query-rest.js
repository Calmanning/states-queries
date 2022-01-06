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

function statesQuery(query, callback) {
    console.log(query)
    
    arcgisRest.queryFeatures(query).
    then(response => {
        
        let res = response
        console.log(res)
        callback(res)
    }).
    catch((err) => {
        
        console.log(err)
    })

    //NOTE: To be used later. Left for reference.
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
