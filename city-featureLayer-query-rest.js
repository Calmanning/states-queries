
const apiKey = "AAPK115d19ab66264ef1b7cdbdd54b6804f4whm-2t82h02UCQQ1zigAlbT-GPsbqzkH4Cd1xDjXtPoshgyibnsGBM4zg-eklxut";

const townPopulationLayerUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer/0"

const stateBoudariesLayerUrl= "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0"

arcgisRest.queryFeatures(
    {
        url: townPopulationLayerUrl,
        where: "ST = 'CO'",
        resultRecordCount: 5
    }
).
then(response => {
        console.log(response)
})
// NOTE: still need to get the city point locations to appear on the map
function getCitiesFromState(state){
    arcgisRest.queryFeatures(
        {
        url:townPopulationLayerUrl,
        where: `ST = '${state}'`,
        outFields: "NAME, POPULATION",
        returnGeometry: true
        }
    ).then(response => {
        console.log(response)
        getCityListHeadings(response)
    }).catch(err => {
        console.log(err)
    })
}



arcgisRest.queryFeatures(
    {
        url: stateBoudariesLayerUrl,
        where: "FID > 0",
        outFields: "STATE_NAME, STATE_ABBR"
    }
).
then(response => {
        console.log(response)
})

console.log("https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0/query?where=FID>0&outFields=STATE_NAME,STATE_ABBR&returnGeometry=true&returnIdsOnly=false")


    
