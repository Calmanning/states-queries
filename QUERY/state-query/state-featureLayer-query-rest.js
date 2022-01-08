//working on this file. Updating request methods. using axios...or possible the ArcGIS JSAPI 'request' package

const stateBoudariesLayerUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0/query?where=FID%3E0&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=STATE_ABBR&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson"

fetch(stateBoudariesLayerUrl).
then(response => response.json()).
then(data => populateStateDropdownList(data.features))

const url = `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_States_Generalized/FeatureServer/0/query`

const params = {
    geometry: mapPoint.toJSON(),
    f: 'json'
}


// const statesRESTQuery = ({ mapPoint, whereClause }, callback) => {
    

//     let stateBoundryQueryURL

//     if(mapPoint){    
//         stateBoundryQueryURL = url + `?${params.geometry}&` 
//     };

//     if(whereClause){
//         stateBoundryQueryURL = `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_States_Generalized/FeatureServer/0/query?where=${whereClause}&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=STATE_ABBR%2C+FID&returnGeometry=true&returnCentroid=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=true&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`
//     };
    
//     fetch(stateBoundryQueryURL).
//     then(result => result.json()).
//     then(data => callback(data.features[0].attributes.STATE_ABBR));

// };
