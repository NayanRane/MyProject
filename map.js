var map, datasource, routePoints = [], currentScenario, resultsPanel, popup, radarLayer, infraredLayer, contourNumbersLayer, contourLayer, searchInput, locateMeButton, resultsPanel, searchInputLength, radarButton, infraredButton, contoursButton, clearButton, userPosition = [-96.7958, 32.7637], userPositionUpdated = !1, layerStyle = "road", centerMapOnResults = !1, weatherUrl = "https://{azMapsDomain}/weather/currentConditions/json?api-version=1.1&query={query}", tileUrl = "https://{azMapsDomain}/map/tile?api-version=2022-08-01&tilesetId={tilesetId}&zoom={z}&x={x}&y={y}&tileSize={tileSize}&view=Auto", airQualityUrl = "https://{azMapsDomain}/weather/airQuality/current/json?api-version=1.1&query={query}", routeURL, searchURL, resultsBoundaryPanel, layer, popup, displayedLocation;
var serachInputIdForMap = null;
var coordinateRx = /^-?[0-9]+\.?[0-9]*\s*,+\s*-?[0-9]+\.?[0-9]*$/;
var geocodeRequestUrl = 'https://{azMapsDomain}/geocode?api-version=2023-06-01&query={query}&view=Auto';
var carRoutingRequestUrl = 'https://{azMapsDomain}/route/directions/json?api-version=1.0&query={query}&routeRepresentation=polyline&travelMode=car&view=Auto';
var truckRoutingRequestUrl = 'https://{azMapsDomain}/route/directions/json?api-version=1.0&query={query}&routeRepresentation=polyline&vehicleLength={vehicleLength}&vehicleHeight={vehicleHeight}&vehicleWidth={vehicleWidth}&vehicleWeight={vehicleWeight}&travelMode=truck&view=Auto';
var routeURL;
var searchURL;
var scenarios = [
    { from: '47.632241,-122.299189', to: '47.634676,-122.300302', height: '5', width: '3', length: '', weight: '', load: [], description: 'Low bridge', streetsideLink: 'https://binged.it/2oT6d4V' },
    { from: '47.586514,-122.245874', to: '47.584868,-122.243094', height: '', width: '', length: '30', weight: '', load: [], description: 'Tight turn', streetsideLink: 'https://binged.it/2v2gal8' },
    { from: '40.429993,-79.998690', to: '40.414211,-80.009550', height: '', width: '', length: '', weight: '', load: ['USHazmatClass3'], description: 'Flammable load', streetsideLink: 'https://binged.it/2hd6P3s' }
];
const factor = 0.621371;
// Your Azure Maps client id for accessing your Azure Maps account.
var azureMapsClientId = 'e6b6ab59-eb5d-4d25-aa57-581135b927f0';

// URL to your authentication service that retrieves an Microsoft Entra ID Token.
var tokenServiceUrl = 'https://samples.azuremaps.com/api/GetAzureMapsToken';
var geocodeUrl = 'https://{azMapsDomain}/geocode?api-version=2023-06-01&top=10&view=Auto&query={query}';
var polygonUrl = 'https://{azMapsDomain}/search/polygon?api-version=2023-06-01&coordinates={coordinates}&view=Auto&resultType={resultType}';
var boundaryEntityTypes = ['adminDistrict', 'adminDistrict2', 'countryRegion', 'locality', 'neighborhood', 'postalCode', 'postalCode2', 'postalCode3', 'postalCode4'];
var boundaryCache = {};

$("#mapIntity").on("click", async () => {
    const from = $("#fromTbx").val();
    const to = $("#toTbx").val();
    if (from == "" && to == "") {
        loader.classList.remove("d-none");
        aa = await getMap();
    }
});

// Function to retrieve an Azure Maps access token.
function getToken(resolve, reject, map) {
    fetch(tokenServiceUrl).then(response => {
        if (response.ok) {
            return response.text();
        }
        throw new Error('Failed to retrieve Azure Maps token.');
    }).then(token => resolve(token)).catch(error => reject(error));
}


function getMap() {
    //Initialize a map instance.
    // $('.skeleton-loader').show();
    var t, n;
    map = new atlas.Map('myMap', {
        center: userPosition,
        view: 'Auto',
        zoom: 16,
        style: layerStyle,
        preserveDrawingBuffer: true,
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: '1PWnxpAJv8amklZ7gJgcIp8gXi8ysiBxApSFRcVyvSNW7hhEjGxPJQQJ99AEAC8vTInbKWZLAAAgAZMPwKrH',
            getToken: getToken

        }
    });
    resultsPanel = document.getElementById("results-panel");
    resultsBoundaryPanel = document.getElementById("results-boundary");

    searchInput = document.getElementById("fromTbx");

    searchInput.addEventListener("search", function () {
        if (searchInput.value.trim().length < 3) {
            resultsPanel.innerHTML = "";
            if (resultsBoundaryPanel !== null) {
                resultsBoundaryPanel.innerHTML = "";
            }
        }
    });

    t = document.getElementById("search-country");
    t.addEventListener("change", search);
    n = atlas.service.MapsURL.newPipeline(new atlas.service.MapControlCredential(map));
    routeURL = new atlas.service.RouteURL(n);
    searchURL = new atlas.service.SearchURL(n);
    // locateMeButton = document.getElementById("locate-me-button");
    // locateMeButton.addEventListener("click", locateMe);
    popup = new atlas.Popup;

    //Wait until the map resources are ready.
    map.events.add('ready', function () {

        datasource = new atlas.source.DataSource();
        map.sources.add(datasource);
        // map.imageSprite.add("geo-icon", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0iIzUxN0NFRCIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDFhMyAzIDAgMSAwIDAgNiAzIDMgMCAwIDAgMC02ek00IDRhNCA0IDAgMSAxIDQuNSAzLjk2OVYxMy41YS41LjUgMCAwIDEtMSAwVjcuOTdBNCA0IDAgMCAxIDQgMy45OTl6bTIuNDkzIDguNTc0YS41LjUgMCAwIDEtLjQxMS41NzVjLS43MTIuMTE4LTEuMjguMjk1LTEuNjU1LjQ5M2ExLjMxOSAxLjMxOSAwIDAgMC0uMzcuMjY1LjMwMS4zMDEgMCAwIDAtLjA1Ny4wOVYxNGwuMDAyLjAwOGEuMTQ3LjE0NyAwIDAgMCAuMDE2LjAzMy42MTcuNjE3IDAgMCAwIC4xNDUuMTVjLjE2NS4xMy40MzUuMjcuODEzLjM5NS43NTEuMjUgMS44Mi40MTQgMy4wMjQuNDE0czIuMjczLS4xNjMgMy4wMjQtLjQxNGMuMzc4LS4xMjYuNjQ4LS4yNjUuODEzLS4zOTVhLjYxOS42MTkgMCAwIDAgLjE0Ni0uMTUuMTQ4LjE0OCAwIDAgMCAuMDE1LS4wMzNMMTIgMTR2LS4wMDRhLjMwMS4zMDEgMCAwIDAtLjA1Ny0uMDkgMS4zMTggMS4zMTggMCAwIDAtLjM3LS4yNjRjLS4zNzYtLjE5OC0uOTQzLS4zNzUtMS42NTUtLjQ5M2EuNS41IDAgMSAxIC4xNjQtLjk4NmMuNzcuMTI3IDEuNDUyLjMyOCAxLjk1Ny41OTRDMTIuNSAxMyAxMyAxMy40IDEzIDE0YzAgLjQyNi0uMjYuNzUyLS41NDQuOTc3LS4yOS4yMjgtLjY4LjQxMy0xLjExNi41NTgtLjg3OC4yOTMtMi4wNTkuNDY1LTMuMzQuNDY1LTEuMjgxIDAtMi40NjItLjE3Mi0zLjM0LS40NjUtLjQzNi0uMTQ1LS44MjYtLjMzLTEuMTE2LS41NThDMy4yNiAxNC43NTIgMyAxNC40MjYgMyAxNGMwLS41OTkuNS0xIC45NjEtMS4yNDMuNTA1LS4yNjYgMS4xODctLjQ2NyAxLjk1Ny0uNTk0YS41LjUgMCAwIDEgLjU3NS40MTF6IiAvPjwvc3ZnPg==");
        // map.imageSprite.add("signpost-icon", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0iIzA0MjU3QyIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNyAxLjQxNFY0SDJhMSAxIDAgMCAwLTEgMXY0YTEgMSAwIDAgMCAxIDFoNXY2aDJ2LTZoMy41MzJhMSAxIDAgMCAwIC43NjgtLjM2bDEuOTMzLTIuMzJhLjUuNSAwIDAgMCAwLS42NEwxMy4zIDQuMzZhMSAxIDAgMCAwLS43NjgtLjM2SDlWMS40MTRhMSAxIDAgMCAwLTIgMHpNMTIuNTMyIDVsMS42NjYgMi0xLjY2NiAySDJWNWgxMC41MzJ6IiAvPjwvc3ZnPg==");
        // map.imageSprite.add("signpost2-icon", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0iIzg2MkE2RiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNyA3VjEuNDE0YTEgMSAwIDAgMSAyIDBWMmg1YTEgMSAwIDAgMSAuOC40bC45NzUgMS4zYS41LjUgMCAwIDEgMCAuNkwxNC44IDUuNmExIDEgMCAwIDEtLjguNEg5djEwSDd2LTVIMmExIDEgMCAwIDEtLjgtLjRMLjIyNSA5LjNhLjUuNSAwIDAgMSAwLS42TDEuMiA3LjRBMSAxIDAgMCAxIDIgN2g1em0xIDNWOEgybC0uNzUgMUwyIDEwaDZ6bTAtNWg2bC43NS0xTDE0IDNIOHYyeiIgLz48L3N2Zz4=");
        // map.imageSprite.add("map-icon", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0iIzQyNEY4NSIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNS44MTcuMTEzQS41LjUgMCAwIDEgMTYgLjV2MTRhLjUuNSAwIDAgMS0uNDAyLjQ5bC01IDFhLjUwMi41MDIgMCAwIDEtLjE5NiAwTDUuNSAxNS4wMWwtNC45MDIuOThBLjUuNSAwIDAgMSAwIDE1LjV2LTE0YS41LjUgMCAwIDEgLjQwMi0uNDlsNS0xYS41LjUgMCAwIDEgLjE5NiAwTDEwLjUuOTlsNC45MDItLjk4YS41LjUgMCAwIDEgLjQxNS4xMDN6TTEwIDEuOTFsLTQtLjh2MTIuOThsNCAuOFYxLjkxem0xIDEyLjk4IDQtLjhWMS4xMWwtNCAuOHYxMi45OHptLTYtLjhWMS4xMWwtNCAuOHYxMi45OGw0LS44eiIgLz48L3N2Zz4=");
        // map.imageSprite.add("compass-icon", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0iI0M4NUVBRSIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNOCAxNi4wMTZhNy41IDcuNSAwIDAgMCAxLjk2Mi0xNC43NEExIDEgMCAwIDAgOSAwSDdhMSAxIDAgMCAwLS45NjIgMS4yNzZBNy41IDcuNSAwIDAgMCA4IDE2LjAxNnptNi41LTcuNWE2LjUgNi41IDAgMSAxLTEzIDAgNi41IDYuNSAwIDAgMSAxMyAweiIgLz48cGF0aCBkPSJtNi45NCA3LjQ0IDQuOTUtMi44My0yLjgzIDQuOTUtNC45NDkgMi44MyAyLjgyOC00Ljk1eiIgLz48L3N2Zz4=");

        // var t = new atlas.layer.SymbolLayer(datasource, null, {
        //     iconOptions: {
        //         image: ["get", "icon"],
        //         anchor: "center",
        //         allowOverlap: !0
        //     },
        //     filter: ["==", "layer", "searchLayer"]
        // })
        //     , i = new atlas.layer.LineLayer(datasource, null, {
        //         strokeColor: ["get", "strokeColor"],
        //         strokeWidth: ["get", "strokeWidth"],
        //         strokeOpacity: 1,
        //         lineJoin: "round",
        //         lineCap: "round",
        //         filter: ["==", "layer", "routeLayer"]
        //     })
        //     // Add a layers for rendering the boundaries as polygons.
        //     , r = new atlas.layer.PolygonLayer(datasource, null, {
        //         // fillColor: "rgba(0, 200, 0, 0.4)",
        //         fillColor: 'hotpink',
        //         filter: ["==", "layer", "isochroneLayer"]
        //     })
        //     , u = new atlas.layer.LineLayer(datasource, null, {
        //         strokeColor: "green",
        //         filter: ["==", "layer", "isochroneLayer"]
        //     })
        //     , f = new atlas.layer.PolygonLayer(datasource, null, {
        //         fillColor: "rgba(0, 153, 255, 0.5)",
        //         filter: ["==", "layer", "locateMe"]
        //     })
        //     , e = new atlas.layer.SymbolLayer(datasource, null, {
        //         iconOptions: {
        //             image: "marker-red",
        //             anchor: "center",
        //             allowOverlap: !0
        //         },
        //         filter: ["==", "layer", "locateMe"]
        //     });
        // map.layers.add([e, f, t, r, u]);
        // map.layers.add(i, "labels");

        // // Add a layers for rendering the boundaries as polygons.
        // i = new atlas.layer.PolygonLayer(datasource, null, {
        //     fillColor: 'hotpink'
        // });
        // map.layers.add(i, 'labels');

        // // Create a popup but leave it closed so we can update it and display it later.
        // popup = new atlas.Popup();

        // // Add a click event to the layer.
        // map.events.add('click', i, layerClicked);
        // // });
        // map.events.add("click", t, function (n) {
        //     n.shapes && n.shapes.length > 0 && showPopupPOI(n.shapes[0])
        // });
        // map.events.add("click", function (n) {
        //     n.shapes && n.shapes.length > 0 && n.shapes[0].source && showPopup(n.position)
        // });
        // n = new atlas.drawing.DrawingManager(map, {
        //     interactionType: "click",
        //     toolbar: new atlas.control.DrawingToolbar({
        //         position: "bottom-right"
        //     })
        // });
        // map.events.add("drawingstarted", n, () => {
        //     n.getOptions().interactionType === "click" && map.setUserInteraction({
        //         dragPanInteraction: !0
        //     })
        // }
        // );
        // map.controls.add([new atlas.control.StyleControl({
        //     autoSelectionMode: !0,
        //     mapStyles: ["road", "road_shaded_relief", "grayscale_light", "night", "grayscale_dark", "satellite", "satellite_road_labels", "high_contrast_dark"]
        // }), new atlas.control.TrafficControl, new atlas.control.ZoomControl, new atlas.control.PitchControl, new atlas.control.CompassControl,], {
        //     position: "top-right"
        // });
        // map.controls.add(new atlas.control.TrafficLegendControl, {
        //     position: "bottom-left"
        // });
        //Add a layer for rendering line data.
        map.layers.add(new atlas.layer.LineLayer(datasource, null, {
            strokeColor: ['get', 'strokeColor'],
            strokeWidth: 5
        }), 'labels');

        //Add a layer for rendering point data.
        map.layers.add(new atlas.layer.SymbolLayer(datasource, null, {
            iconOptions: {
                image: ['get', 'icon']
            },
            textOptions: {
                textField: ['get', 'title'],
                size: 14,
                font: ['SegoeUi-Bold'],
                offset: [0, 1.2]
            },
            filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
        }));

        //Load scenarios
        var scenarioHtml = [];

        for (var i = 0; i < scenarios.length; i++) {
            scenarioHtml.push('<input type="button" value="', scenarios[i].description, '" onclick="loadScenario(', i, ')" /> ');
        }
        map.resize();
        loader.classList.add("d-none");
    });
}

// let fieldStatus = false;
function calculateDirections() {
    routePoints = [];
    document.getElementById('output').innerHTML = '';
    document.getElementById('computedMileage').innerHTML = ''
    datasource !== undefined && datasource.clear();
    document.getElementById("ActualMile").value = "";
    document.getElementById('actualMileidAmount').innerHTML = '';
    document.getElementById("mileshide").classList.add("d-none");
    if (window.location.pathname.split('/').at(-1) !== "Create") {
        if ($("#AddDataModalLabel").hasClass("d-none")) {
            let mileageNote = document.getElementById("actualMileageNote")
            mileageNote.classList.add("d-none");
            document.getElementById("actualMileageNoteVal").innerHTML = ''
        }
    }
    var from = document.getElementById('fromTbx').value;

    loader.classList.remove("d-none");
    geocodeQuery(from, function (fromCoord) {
        try {
            var to = document.getElementById('toTbx').value;
            geocodeQuery(to, function (toCoord) {

                //Create pins for the start and end of the route.
                var startPoint = new atlas.data.Point(fromCoord);
                var startPin = new atlas.data.Feature(startPoint, {
                    // title: 'Start',
                    icon: 'pin-round-blue'
                });

                var endPoint = new atlas.data.Point(toCoord);
                var endPin = new atlas.data.Feature(endPoint, {
                    // title: 'End',
                    icon: 'pin-round-red'
                });

                //Fit the map window to the bounding box defined by the start and end points.
                map.setCamera({
                    bounds: atlas.data.BoundingBox.fromData([toCoord, fromCoord]),
                    padding: 50
                });

                //Add pins to the map for the start and end point of the route.
                datasource.add([startPin, endPin]);

                //Convert lon,lat into lat,lon.
                fromCoord.reverse();
                toCoord.reverse()

                var query = fromCoord.join(',') + ':' + toCoord.join(',');

                var carRequestUrl = carRoutingRequestUrl.replace('{query}', query);
                

                processRequest(carRequestUrl).then(r => {
                    // loader.classList.remove("d-none");
                    const travelTimeInSeconds = r.routes[0].summary.travelTimeInSeconds;
                    const totalMinutes = Math.round(travelTimeInSeconds / 60);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;

                    addRouteToMap(r.routes[0], 'red');
                    let newValue = Math.round(r.routes[0].summary.lengthInMeters / 10) / 100 * factor;
                    // document.getElementById('output').innerHTML += 'Car Distance: ' + Math.round(r.routes[0].summary.lengthInMeters / 10) / 100 + ' km<br/>';
                    // document.getElementById('output').innerHTML += 'Car Time: ' + Math.round(r.routes[0].summary.travelTimeInSeconds / 60) + ' minutes<br/>';
                    document.getElementById('output').innerHTML += `<div class="col-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-car-front-fill" viewBox="0 0 16 16">
                                <path
                                    d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848ZM3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2zM2.906 5.189a.51.51 0 0 0 .497.731c.91-.073 3.35-.17 4.597-.17s3.688.097 4.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 11.691 3H4.309a.5.5 0 0 0-.447.276L2.906 5.19Z" />
                            </svg>
                        </div>
                        <div class="col-5">

                        </div>
                        <div class="col-6">
                            <h1 class="text-success">${hours} hours ${minutes} minutes</h1>
                            <h4>${newValue.toFixed(2)} Miles</h4>
                        </div>`

                    document.getElementById("computedMileage").innerHTML = `${newValue.toFixed(2)}`
                    document.getElementById("mileshide").classList.remove("d-none");
                    // const actualMileage = document.getElementById("ActualMile").value;
                    // const mileage = document.getElementById("mileage").value;
                    document.getElementById("ActualMile").value = `${newValue.toFixed(2)}`
                    const finalAmount = (mileageRate * newValue.toFixed(2));
                    $('#actualMileidAmount').html(finalAmount.toFixed(2));
                    if (window.location.pathname.split('/').at(-1) !== "Create") {
                        if ($("#AddDataModalLabel").hasClass("d-none")) {
                            if (newValue.toFixed(2) != mileageClaimsArray[hdautoId].ActualMileage) {
                                let mileageNote = document.getElementById("actualMileageNote")
                                mileageNote.classList.remove("d-none");
                                document.getElementById("actualMileageNoteVal").innerHTML = `${mileageClaimsArray[hdautoId].ActualMileage}`
                            }
                        }
                    }
                    // if (!IsEdit) {
                    //     if ((actualMileage != "" && mileage != "") || !fieldStatus) {
                    //         Swal.fire({
                    //             title: "Are you sure actual mileage will be recalculated according to new destination",
                    //             icon: "question",
                    //             showCancelButton: true   ,
                    //             confirmButtonColor: "#3085d6",
                    //             cancelButtonColor: "#d33",
                    //             confirmButtonText: "OK",
                    //             customClass: {
                    //                 confirmButton: "btn button-base text-white me-1",
                    //                 cancelButton: "btn button-base-white",
                    //             },
                    //             allowOutsideClick: false,
                    //             buttonsStyling: false,
                    //         }).then(async function (result) {
                    //             if (result.isConfirmed) {
                    //                 document.getElementById("ActualMile").value = `${newValue.toFixed(2)}`
                    //                 document.getElementById("mileage").value = `${newValue.toFixed(2)}`
                    //                 const finalAmount = (MileageRate * newValue);
                    //                 $('#actualMileidAmount').html(finalAmount.toFixed(2));
                    //             }
                    //         });

                    //     } else {
                    //         document.getElementById("ActualMile").value = `${newValue.toFixed(2)}`
                    //         document.getElementById("mileage").value = `${newValue.toFixed(2)}`
                    //         const finalAmount = (MileageRate * newValue);
                    //         $('#actualMileidAmount').html(finalAmount.toFixed(2));
                    //     }
                    // } else {

                    // }
                    loader.classList.add("d-none");
                });

                // var truckRequestUrl = truckRoutingRequestUrl.replace('{query}', query);

                // var loadType = getSelectValues('vehicleLoadType');
                // if (loadType && loadType !== '') {
                //     truckRequestUrl += '&vehicleLoadType=' + loadType;
                // }

                // truckRequestUrl = setValueOptions(truckRequestUrl, ['vehicleWeight', 'vehicleWidth', 'vehicleHeight', 'vehicleLength']);

                // processRequest(truckRequestUrl).then(r => {
                //     const travelTimeInSeconds = r.routes[0].summary.travelTimeInSeconds;
                //     const totalMinutes = Math.round(travelTimeInSeconds / 60);
                //     const hours = Math.floor(totalMinutes / 60);
                //     const minutes = totalMinutes % 60;
                // });
            });
        } catch {
            loader.classList.add("d-none");
        }
    });


}

function geocodeQuery(query, callback) {
    if (!callback) return;

    // Show loader before starting (optional)
    loader.classList.remove("d-none");

    try {
        loader.classList.remove("d-none");
        if (coordinateRx.test(query)) {
            const vals = query.split(',');
            callback([parseFloat(vals[1]), parseFloat(vals[0])]);
            // loader.classList.add("d-none"); // Hide loader after processing coordinates
        } else {
            const requestUrl = geocodeRequestUrl.replace('{query}', encodeURIComponent(query));

            processRequest(requestUrl)
                .then(r => {
                    if (r && r.features && r.features.length > 0) {
                        callback([
                            r.features[0].geometry.coordinates[0],
                            r.features[0].geometry.coordinates[1]
                        ]);
                    } else {
                        console.warn("Geocoding response is empty or malformed.");
                        callback(null);
                    }
                })
                .catch(err => {
                    console.error("Error during geocoding request:", err);
                    callback(null);
                })
                .finally(() => {
                    loader.classList.add("d-none"); // Always hide loader
                });
        }
    } catch (err) {
        console.error("Error in geocodeQuery function:", err);
        loader.classList.add("d-none"); // Ensure loader is hidden on sync crash
        callback(null);
    }
}


function addRouteToMap(route, strokeColor) {
    var routeCoordinates = [];

    for (var legIndex = 0; legIndex < route.legs.length; legIndex++) {
        var leg = route.legs[legIndex];

        // Convert the route point data into a format that the map control understands.
        var legCoordinates = leg.points.map(function (point) {
            return [point.longitude, point.latitude];
        });

        // Combine the route point data for each route leg together to form a single path.
        routeCoordinates = routeCoordinates.concat(legCoordinates);

        // Extract road names and landmarks
        leg.points.forEach(function (point) {
            if (point.roadName) {
                var roadName = point.roadName;
                var areaName = point.areaName || 'Unknown Area';
                var landmark = point.landmark || 'No Landmark';

                // Create a label for the road name, area name, and landmark
                var label = `${roadName}, ${areaName}, ${landmark}`;
                var labelPoint = new atlas.data.Point([point.longitude, point.latitude]);

                // Add the label to the data source
                datasource.add(new atlas.data.Feature(labelPoint, {
                    title: label,
                    icon: 'pin-round-blue' // You can customize the icon as needed
                }));
            }
        });
    }

    // Create a LineString from the route path points and add it to the line layer.
    datasource.add(new atlas.data.Feature(new atlas.data.LineString(routeCoordinates), {
        strokeColor: strokeColor
    }));

    // Fit the map window to the bounding box defined by the route points.
    routePoints = routePoints.concat(routeCoordinates);
    map.setCamera({
        bounds: atlas.data.BoundingBox.fromPositions(routePoints),
        padding: 50
    });
}

// Return a set of the selected opion value for a multi-select as a comma delimited string.
function getSelectValues(id) {
    var select = document.getElementById(id);
    var selected = [];

    for (var i = 0; i < select.length; i++) {
        if (select.options[i].selected) {
            selected.push(select.options[i].value);
        }
    }

    return selected.join(',');
}

function setValueOptions(requestUrl, valueOptions) {
    for (var i = 0; i < valueOptions.length; i++) {
        requestUrl = requestUrl.replace('{' + valueOptions[i] + '}', document.getElementById(valueOptions[i]).value);
    }

    return requestUrl;
}

function loadScenario(scenarioNum) {
    var scenario = scenarios[scenarioNum];

    document.getElementById('fromTbx').value = scenario.from;
    document.getElementById('toTbx').value = scenario.to;
    document.getElementById('vehicleWidth').value = scenario.width;
    document.getElementById('vehicleHeight').value = scenario.height;
    document.getElementById('vehicleLength').value = scenario.length;
    document.getElementById('vehicleWeight').value = scenario.weight;

    var vehicleLoadTypeSelect = document.getElementById('vehicleLoadType');

    for (var i = 0; i < vehicleLoadTypeSelect.length; i++) {
        if (scenario.load.indexOf(vehicleLoadTypeSelect.options[i].value) > -1) {
            vehicleLoadTypeSelect.options[i].selected = 'selected';
        } else {
            vehicleLoadTypeSelect.options[i].selected = null;
        }
    }

    calculateDirections();

    document.getElementById('output').innerHTML = '<a href="' + scenario.streetsideLink + '" target="_blank">Streetside</a><br/>';
}

const inputFieldtoTb = document.getElementById('toTbx');
const inputFieldfromTbx = document.getElementById('fromTbx');
const svgIconiconfromTbx = document.querySelector('.input-iconfromTbx');
const svgIcontoTbx = document.querySelector('.input-icontoTbx');

// inputFieldfromTbx.addEventListener('focus', () => {
//     svgIconiconfromTbx.style.display = 'block';
// });

// inputFieldtoTb.addEventListener('focus', () => {
//     svgIcontoTbx.style.display = 'block';
// });

// inputFieldfromTbx.addEventListener('blur', () => {
//     svgIconiconfromTbx.style.display = 'none';
// });
// inputFieldtoTb.addEventListener('blur', () => {
//     svgIcontoTbx.style.display = 'none';
// });


svgIconiconfromTbx.addEventListener('click', () => {
    // svgIconiconfromTbx.style.display = 'block';
    inputFieldfromTbx.focus();
    // var fromLocation = $("#fromTbx").val();
    // var endLocation = $("#toTbx").val();
    serachInputIdForMap = 'fromTbx';
    searchInputKeyup('fromTbx');
});

svgIcontoTbx.addEventListener('click', () => {
    // svgIcontoTbx.style.display = 'block';
    inputFieldtoTb.focus();
    // var fromLocation = $("#fromTbx").val();
    // var endLocation = $("#toTbx").val();
    serachInputIdForMap = 'toTbx';
    searchInputKeyup('toTbx');
});

svgIcontoTbx.addEventListener('mousedown', (event) => {
    event.preventDefault();
});
svgIconiconfromTbx.addEventListener('mousedown', (event) => {
    event.preventDefault();
});


function fuzzySearch(query, countryCode) {
    searchURL.searchFuzzy(atlas.service.Aborter.timeout(1e4), query, {
        lon: map.getCamera().center[0],
        lat: map.getCamera().center[1],
        countrySet: [countryCode],
        typeahead: true,
        view: "Auto"
    }).then(response => {
        // datasource ? datasource.clear() : "";
        var data = response.geojson.getFeatures();
        var resultsHTML = generateResultsHTML(data);

        resultsPanel.innerHTML = resultsHTML;
        // datasource.add(data);
        if (resultsHTML == "") {
            $('.results-paneltag').addClass('d-none');
        } else {
            $('.results-paneltag').removeClass('d-none');
        }
        // loader.classList.add("d-none");
        // if (centerMapOnResults) {
        //     map.setCamera({
        //         bounds: data.bbox
        //     });
        // }
    });
}



function search(id) {
    const searchInput = document.getElementById(id);
    var n = searchInput.value;
    t = document.getElementById("search-country"),
        countryCode = t.options[t.selectedIndex].value;
    if (n) {
        fuzzySearch(n, countryCode);
    }
}


let screenshotCounter = 0;
async function mapImageUrl() {
    let imageUrl2 = '';
    imageUrl2 = await html2canvas(document.getElementById('captureScreenshot'), { useCORS: true }).then(canvas => {
        imageUrl1 = canvas.toDataURL('image/png');
        return imageUrl1;
    });

    const blob = dataURLToBlob(imageUrl2);

    const file = new File([blob], `screenshot_${screenshotCounter++}.png`, { type: 'image/png' });
    loader.classList.add("d-none");
    return file;
};


// Utility function to convert dataURL to Blob
function dataURLToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}

function boundarySearch(query) {
    var geocodeRequestUrl = geocodeUrl.replace('{query}', encodeURIComponent(query));

    processRequest(geocodeRequestUrl).then(fc => {
        var r = fc.features;
        var boundaryResultsHTML = generateBoundaryResultsHTML(r);

        // resultsPanel.innerHTML += boundaryResultsHTML;

        // if (boundaryResultsHTML.includes('<li>')) {
        var firstBoundaryId = getFirstBoundaryId(r);
        getPolygon(firstBoundaryId); // Focus on the first polygon
        // }
    });


}

var feature = '';
var u = '';
var displayName = '';
var distance = '';
function generateResultsHTML(data) {
    let html = [];
    for (let u = 0; u < data.features.length; u++) {
        let feature = data.features[u];
        let iconType = "map-icon";
        let displayName = "Location";
        // let distance1 = feature.properties.dist < 1 ? 0 : (feature.properties.dist / 1e3).toFixed(1);
        let distance = feature.properties.dist < 1 ? 0 : (feature.properties.dist / 1609.34).toFixed(2);  // rounded to 1 decimal
        switch (feature.properties.type) {
            case "POI":
                iconType = "geo-icon";
                displayName = feature.properties.poi.name;
                break;
            case "Street":
            case "Point Address":
                iconType = "signpost-icon";
                displayName = feature.properties.address.streetName;
                break;
            case "Geography":
                iconType = "compass-icon";
                displayName = feature.properties.address.country;
                break;
            case "Address Range":
                iconType = "map-icon";
                displayName = "Address Range";
                break;
            case "Cross Street":
                iconType = "signpost2-icon";
                displayName = feature.properties.address.streetName;
                break;
        }

        feature.properties.icon = iconType;
        feature.properties.layer = "searchLayer";

        html.push(`
            <a class="list-group-item list-group-item-action d-flex gap-3 py-3" 
               onclick="itemClicked(this,'${feature.id}','${u}','${serachInputIdForMap}')" >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-geo-alt" viewBox="0 0 16 16">
                    <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
                    <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                </svg>
                <div class="d-flex gap-2 w-100 justify-content-between">
                    <div>
                        <h6 class="mb-0">${displayName}</h6>
                        <p class="mb-0 opacity-75">${feature.properties.address.freeformAddress}</p>
                    </div>
                    <small class="text-nowrap">${distance} miles</small>
                </div>
            </a>`);
    }

    return html.join('');
}

function searchInputKeyup(id) {
    if ($("#fromTbx").val() !== "" && $("#toTbx").val() !== "") {
        loader.classList.remove("d-none");
    }
    const searchInput = document.getElementById(id);
    centerMapOnResults = false;
    if (searchInput.value.length >= 3) {
        centerMapOnResults = true;
        setTimeout(function () {
            if (prospectSearchInputLength === searchInput.value.length) {
                search(id);
                // $('.results-paneltag').addClass('d-none');
                var fromLocation = $("#fromTbx").val();
                var endLocation = $("#toTbx").val();
                if (fromLocation != "" && endLocation == "") {
                    validator2.validateField('MapTo');
                } else {
                    try {
                        calculateDirections();
                    } catch {
                        loader.classList.add("d-none");
                    }
                }
            }
        }, 250);
    } else {
        $('#results-panel').html("");
    }
    prospectSearchInputLength = searchInput.value.length;
}

function locateMe() {
    var n = document.getElementById("locate-me-icon")
    // , t = document.getElementById("locate-me-spinner");
    // locateMeButton.disabled = !0;
    // locateMeButton.className = "btn btn-warning";
    // n.style.display = "none";
    // t.style.display = "block";
    navigator.geolocation.getCurrentPosition(function (i) {
        userPositionUpdated = !0;
        userPosition = [i.coords.longitude, i.coords.latitude];
        map.setCamera({
            center: userPosition,
            zoom: 15,
            pitch: 0,
            bearing: 0
        });
        searchURL.searchAddressReverse(atlas.service.Aborter.timeout(1e4), userPosition, {
            view: "Auto"
        }).then(r => {
            r.addresses.length > 0 && (document.querySelector(".form-select").value = r.addresses[0].address.countryCode,
                search());
            var u = new atlas.data.Point(userPosition);
            datasource.add(new atlas.data.Feature(u, {
                layer: "locateMe",
                subType: "Circle",
                radius: i.coords.accuracy
            }));
            locateMeButton.disabled = !1;
            // locateMeButton.className = "btn btn-outline-secondary";
            // n.style.display = "block";
            // t.style.display = "none"
        }
        )
    }, function () {
        Swal.fire({
            title: "Sorry, your position information is unavailable!",
            icon: "info",
            buttonsStyling: false,
            confirmButtonText: "Ok",
            customClass: {
                confirmButton: "btn btn-sm btn-info"
            }
        });
        locateMeButton.disabled = !1;
        locateMeButton.className = "btn btn-outline-secondary";
        n.style.display = "block";
        t.style.display = "none"
    })
}


// $('#bnt_Coordinates').on('click', function () {
//     var prospectAddress = $('#prospect_Address').val();
//     $('#toTbx').val(prospectAddress)
//     $('#AddDataModal').modal('show');
// })

$('#toTbx').on('keyup', function () {
    var searchVal = $(this).val();
    // prospectAddress.val(searchVal);
});

function generateBoundaryResultsHTML(features) {
    // let html = '<h3>Boundary Results</h3><ol>';
    let hasBoundaries = false;
    let firstResult = null;

    for (let i = 0; i < features.length; i++) {
        let typeValue = features[i].properties.type;

        switch (typeValue) {
            case 'CountryRegion':
                typeValue = 'countryRegion';
                break;
            case 'AdminDivision1':
                typeValue = 'adminDistrict';
                break;
            case 'AdminDivision2':
                typeValue = 'adminDistrict2';
                break;
            case 'Postcode1':
                typeValue = 'postalCode1';
                break;
            case 'Postcode2':
                typeValue = 'postalCode2';
                break;
            case 'Postcode3':
                typeValue = 'postalCode3';
                break;
            case 'Postcode4':
                typeValue = 'postalCode4';
                break;
            case 'PopulatedPlace':
                typeValue = 'locality';
                break;
            case 'Neighborhood':
                typeValue = 'neighborhood';
                break;
        }

        if (boundaryEntityTypes.indexOf(typeValue) !== -1) {
            let id = `${features[i].properties.address.formattedAddress}|${typeValue}`;

            boundaryCache[id] = {
                position: features[i].geometry.coordinates,
                entityType: typeValue
            };

            if (!firstResult) {
                firstResult = id;
            }

            hasBoundaries = true;
        }
    }

    // html += '</ol>';
    // resultsPanel.innerHTML = html;  

    if (hasBoundaries && firstResult) {
        getPolygon(firstResult);
    }

    // return html;
}

function getFirstBoundaryId(features) {
    for (let i = 0; i < features.length; i++) {
        let typeValue = features[i].properties.type;

        if (boundaryEntityTypes.indexOf(typeValue) != -1) {
            return `${features[i].properties.address.formattedAddress}|${typeValue}`;
        }
    }
    return null;
}

function layerClicked(e) {
    var f = e.shapes[0].toJson();
    var numPos = 0, numPolygons = 0, i, j;

    if (f.geometry.type === 'Polygon') {
        numPolygons = 1;

        for (i = 0; i < f.geometry.coordinates.length; i++) {
            numPos += f.geometry.coordinates[i].length;
        }
    } else {
        numPolygons = f.geometry.coordinates.length;

        for (i = 0; i < f.geometry.coordinates.length; i++) {
            for (j = 0; j < f.geometry.coordinates[i].length; j++) {
                numPos += f.geometry.coordinates[i][j].length;
            }
        }
    }

    // Set the popup options.
    popup.setOptions({
        // Update the content of the popup.
        content: `<div style='padding:15px;'>Type: ${f.geometry.type}<br/># polygons: ${numPolygons.toLocaleString()}<br/># positions: ${numPos.toLocaleString()}</div>`,

        // Place the popup where the user clicked.
        position: e.position
    });

    // Open the popup.
    popup.open(map);
}

function truckClicked(n) {
    var t = datasource.getShapeById(n)
        , i = t.getCoordinates()
        , r = userPosition;
    routeURL.calculateRouteDirections(atlas.service.Aborter.timeout(1e4), [r, i], {
        traffic: !0,
        travelMode: "truck"
    }).then(n => {
        var i = n.geojson.getFeatures()
            , t = i.features[0];
        t.properties.strokeColor = "#2272B9";
        t.properties.strokeWidth = 9;
        t.properties.layer = "routeLayer";
        datasource.add(t, 0)
    }
        , () => {
            Swal.fire({
                title: "Sorry, it was not possible to route to this location.",
                icon: "info",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-sm btn-primary"
                }
            });
        }
    );
    popup.close(map)
}
function startpositionClicked(n) {
    userPosition = n;
    var t = new atlas.data.Point(userPosition);
    datasource.add(new atlas.data.Feature(t, {
        layer: "locateMe"
    }));
    map.setCamera({
        center: userPosition
    });
    userPositionUpdated = !0;
    popup.close()
}
function isochroneClicked(n) {
    var t = new atlas.data.Point(n);
    datasource.add(new atlas.data.Feature(t, {
        layer: "locateMe"
    }));
    map.setCamera({
        center: n,
        zoom: 11,
        pitch: 0,
        bearing: 0
    });
    Promise.all([routeURL.calculateRouteRange(atlas.service.Aborter.timeout(1e4), n, {
        traffic: !0,
        timeBudgetInSec: 900
    }), routeURL.calculateRouteRange(atlas.service.Aborter.timeout(1e4), n, {
        traffic: !0,
        timeBudgetInSec: 1800
    })]).then(n => {
        for (var i, t = 0; t < n.length; t++)
            i = n[t].geojson.getFeatures().features[0],
                i.properties.layer = "isochroneLayer",
                datasource.add(i)
    }
        , () => {
            Swal.fire({
                title: "Sorry, it was not possible to calculate travel time for this location.",
                icon: "info",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-sm btn-primary"
                }
            });
        }
    );
    popup.close()
}

function showPopup(n) {
    popup.close();
    searchURL.searchAddressReverse(atlas.service.Aborter.timeout(1e4), n, {
        view: "Auto"
    }).then(t => {
        if (t.addresses.length > 0) {
            var i = t.addresses[0]
                , r = i.address.street ? i.address.street : i.address.freeformAddress
                , u = `<div class="card" style="width:420px;">
  <div class="card-header">
    <h5 class="card-title text-wrap">${r}</h5>
  </div>
  <div class="card-body">
    <div class="list-group">

      <!-- Starting Point (using Bootstrap bullseye icon) -->
      <a href="#" onclick="startpositionClicked([${n[0]},${n[1]}])" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-bullseye" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M8 13A5 5 0 1 1 8 3a5 5 0 0 1 0 10m0 1A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/>
  <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
</svg>
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div>
            <h6 class="mb-0">Use as starting point</h6>
            <p class="mb-0 opacity-75 text-wrap">${i.address.freeformAddress}</p>
          </div>
        </div>
        <small class="text-nowrap">Geocoding</small>
      </a>

      <!-- Travel Time (using Bootstrap clock icon) -->
      <a href="#" onclick="isochroneClicked([${n[0]},${n[1]}])" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
</svg>
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div>
            <h6 class="mb-0">Travel time around this point</h6>
            <p class="mb-0 opacity-75 text-wrap">How far can you drive in 15 and 30 minutes from this location including traffic conditions?</p>
          </div>
        </div>
        <small class="text-nowrap">Isochrone</small>
      </a>

    </div>
  </div>
</div>
`;
            popup.setOptions({
                position: n,
                content: u
            });
            popup.open(map)
        }
    }
        , () => {
            Swal.fire({
                title: "Sorry, we where unable to find address details for this location.",
                icon: "info",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-sm btn-primary"
                }
            });
        }
    )
}
async function showPopupPOI(n) {
    popup.close();
    var t = n.getProperties()
        , r = n.getCoordinates()
        , u = "Location"
        , s = t.dist < 1 ? 0 : (t.dist / 1e3).toFixed(1)
        , f = ""
        , e = "";
    switch (t.type) {
        case "POI":
            u = t.poi.name;
            t.poi.phone && (f = t.poi.phone);
            t.poi.url && (e = t.poi.url);
            break;
        case "Street":
        case "Point Address":
        case "Cross Street":
            u = t.address.streetName;
            break;
        case "Geography":
            u = t.address.country;
            break;
        case "Address Range":
            u = "Address Range"
    }
    var h = weatherUrl.replace("{query}", r[1] + "," + r[0])
        , i = await processRequest(h).then(n => n && n.results && n.results[0] ? n.results[0] : null)
        , c = airQualityUrl.replace("{query}", r[1] + "," + r[0])
        , o = await processRequest(c).then(n => n && n.results && n.results[0] ? n.results[0] : null)
        , l = `<div class="card" style="width:420px;">
  <div class="card-header">
    <h5 class="card-title text-wrap">${u}</h5>
  </div>
  <div class="card-body">
    <div class="list-group">
      <!-- Address Icon (using Bootstrap cursor icon) -->
      <a href="#" onclick="addressClicked('${n.data.id}')" class="list-group-item list-group-item-action d-flex gap-3 py-3">
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pin-map" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M3.1 11.2a.5.5 0 0 1 .4-.2H6a.5.5 0 0 1 0 1H3.75L1.5 15h13l-2.25-3H10a.5.5 0 0 1 0-1h2.5a.5.5 0 0 1 .4.2l3 4a.5.5 0 0 1-.4.8H.5a.5.5 0 0 1-.4-.8z"/>
  <path fill-rule="evenodd" d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999z"/>
</svg>
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div>
            <h6 class="mb-0">Address</h6>
            <p class="mb-0 opacity-75 text-wrap">${t.address.freeformAddress}</p>
          </div>
        </div>
        <small class="text-nowrap">Directions</small>
      </a>

      <!-- Truck Route Icon (using Bootstrap truck icon) -->
      <a href="#" onclick="truckClicked('${n.data.id}')" class="list-group-item list-group-item-action d-flex gap-3 py-3">
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
  <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
</svg>
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div>
            <h6 class="mb-0">Truck Route</h6>
            <p class="mb-0 opacity-75 text-wrap">Route that is optimized for commercial vehicles, like for trucks.</p>
          </div>
        </div>
        <small class="text-nowrap">Directions</small>
      </a>

      <!-- Phone Icon (using Bootstrap telephone icon) -->
      <a target="_blank" href="tel:${f.replace(/\s/g, "")}" class="list-group-item list-group-item-action d-flex gap-3 py-3 ${f === "" ? "d-none" : ""}">
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16">
  <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
</svg>
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div>
            <h6 class="mb-0">Phone</h6>
            <p class="mb-0 opacity-75">${f}</p>
          </div>
        </div>
        <small class="text-nowrap">POI</small>
      </a>

      <!-- Website Icon (using Bootstrap link icon) -->
      <a target="_blank" href="http://${e.replace(/^https?\:\/\//i, "")}" class="list-group-item list-group-item-action d-flex gap-3 py-3 ${e === "" ? "d-none" : ""}">
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
</svg>
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div>
            <h6 class="mb-0">Website</h6>
            <p class="mb-0 opacity-75">${e.replace(/^https?\:\/\//i, "")}</p>
          </div>
        </div>
        <small class="text-nowrap">POI</small>
      </a>

      <!-- Weather Icon (Bootstrap doesn't have a weather icon, so custom SVG/image can be used here) -->
      <a target="_blank" href="https://docs.microsoft.com/rest/api/maps/weather/get-current-conditions" class="list-group-item list-group-item-action d-flex gap-3 py-3 ${i ? "" : "d-none"}">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-thermometer-sun" viewBox="0 0 16 16">
  <path d="M5 12.5a1.5 1.5 0 1 1-2-1.415V2.5a.5.5 0 0 1 1 0v8.585A1.5 1.5 0 0 1 5 12.5"/>
  <path d="M1 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM3.5 1A1.5 1.5 0 0 0 2 2.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0L5 10.486V2.5A1.5 1.5 0 0 0 3.5 1m5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5m4.243 1.757a.5.5 0 0 1 0 .707l-.707.708a.5.5 0 1 1-.708-.708l.708-.707a.5.5 0 0 1 .707 0M8 5.5a.5.5 0 0 1 .5-.5 3 3 0 1 1 0 6 .5.5 0 0 1 0-1 2 2 0 0 0 0-4 .5.5 0 0 1-.5-.5M12.5 8a.5.5 0 0 1 .5-.5h1a.5.5 0 1 1 0 1h-1a.5.5 0 0 1-.5-.5m-1.172 2.828a.5.5 0 0 1 .708 0l.707.708a.5.5 0 0 1-.707.707l-.708-.707a.5.5 0 0 1 0-.708M8.5 12a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5"/>
</svg>
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div>
            <h6 class="mb-0">${i.phrase}</h6>
            <p class="mb-0 opacity-75 text-wrap">Temperature ${i.temperature.value}&#176;${i.temperature.unit} and feels like ${i.realFeelTemperature.value}&#176;${i.realFeelTemperature.unit}</p>
          </div>
        </div>
        <small class="text-nowrap">Weather</small>
      </a>

      <!-- Air Quality Icon (using Bootstrap balloon icon) -->
      <a target="_blank" href="https://docs.microsoft.com//rest/api/maps/weather/get-current-air-quality" class="list-group-item list-group-item-action d-flex gap-3 py-3 ${o ? "" : "d-none"}">
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-balloon" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 9.984C10.403 9.506 12 7.48 12 5a4 4 0 0 0-8 0c0 2.48 1.597 4.506 4 4.984M13 5c0 2.837-1.789 5.227-4.52 5.901l.244.487a.25.25 0 1 1-.448.224l-.008-.017c.008.11.02.202.037.29.054.27.161.488.419 1.003.288.578.235 1.15.076 1.629-.157.469-.422.867-.588 1.115l-.004.007a.25.25 0 1 1-.416-.278c.168-.252.4-.6.533-1.003.133-.396.163-.824-.049-1.246l-.013-.028c-.24-.48-.38-.758-.448-1.102a3 3 0 0 1-.052-.45l-.04.08a.25.25 0 1 1-.447-.224l.244-.487C4.789 10.227 3 7.837 3 5a5 5 0 0 1 10 0m-6.938-.495a2 2 0 0 1 1.443-1.443C7.773 2.994 8 2.776 8 2.5s-.226-.504-.498-.459a3 3 0 0 0-2.46 2.461c-.046.272.182.498.458.498s.494-.227.562-.495"/>
</svg>
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div>
            <h6 class="mb-0">${o.category}</h6>
            <p class="mb-0 opacity-75 text-wrap">${o.description}</p>
          </div>
        </div>
        <small class="text-nowrap">Air Quality</small>
      </a>
    </div>
  </div>
  <div class="card-footer text-muted">${s} km away from ${userPositionUpdated === !0 ? "you" : "the Tower of London"}</div>
</div>`;
    popup.setOptions({
        position: r,
        content: l
    });
    popup.open(map)
}


// function processRequest(n) {
//     return new Promise((t, i) => {
//         n = n.replace("{azMapsDomain}", atlas.getDomain());
//         var r = map.authentication.signRequest({
//             url: n
//         })
//             , u = map.getServiceOptions().transformRequest;
//         u && (r = u(n));
//         fetch(r.url, {
//             method: "GET",
//             mode: "cors",
//             headers: new Headers(r.headers)
//         }).then(n => n.json(), n => i(n)).then(n => {
//             t(n)
//         }
//             , n => i(n))
//     }
//     )
// }


var i;
var s;
var p;
var f;
var a;
var c;
function itemClicked(val, n, item, sf) {
    // search(sf)
    // reloadBoundary()
    const addressText = val.querySelector('p').innerText;
    document.getElementById(sf).value = addressText;
    let currentField = document.getElementById(sf);
    autosize.update(currentField);

    if ($('#fromTbx').val() !== '' && $('#toTbx').val() !== '') {
        calculateDirections()
    }
    $('.results-paneltag').addClass('d-none');
    $('#results-panel').html(`<span class="px-3 text-muted py-4">Search location to get result.</span>`);
    // console.log(searchInput)
    // var t = datasource.getShapeById(n)
    // i = t.getCoordinates();
    // let index = parseInt(item)
    // a = datasource.shapes[index].dataSource.shapes[index].dataSource.shapes[index].data.properties.address
    // // console.log(a)
    // // c = datasource.shapes[index].dataSource.shapes[index].dataSource.shapes[index].data.properties.address.countrySubdivisionCode
    // s = datasource.shapes[index].dataSource.shapes[index].data.properties.address.countrySubdivisionName || [];



    // // s = datasource.shapes[index].dataSource.shapes[index].dataSource.shapes[index].data.properties.address.countrySubdivisionName || [];
    // c = datasource.shapes[index].dataSource.shapes[index].dataSource.shapes[index].data.properties.address.countrySecondarySubdivision
    // p = datasource.shapes[index].dataSource.shapes[index].dataSource.shapes[index].data.properties.address.postalCode
    // f = datasource.shapes[index].dataSource.shapes[index].dataSource.shapes[index].data.properties.address.freeformAddress


    // // var result = await MapsSearchClient.SearchAddressAsync("80201", new SearchAddressOptions { Country = "US" });
    // map.setCamera({
    //     center: i,
    //     zoom: 16
    // });
    // showPopupPOI(t)
    // datasource.clear()
    // boundarySearch(searchInput)

}

function getPolygon(id) {
    // popup.close();

    //Make sure we have information in the cache for the provided ID.
    if (boundaryCache[id]) {
        displayedLocation = id;

        var b = boundaryCache[id];

        //Get the selected resolution type.
        var resolution = document.getElementById('resolutionSelector').value;

        var polygonRequestUrl = polygonUrl
            .replace('{coordinates}', b.position.join(','))
            .replace('{resultType}', b.entityType)
            .replace('{resolution}', resolution);

        processRequest(polygonRequestUrl).then(f => {
            b.boundary = f;

            datasource.setShapes(f);

            //Caclaulte and cache the bounding box of the boundary.
            b.bbox = atlas.data.BoundingBox.fromData(f);

            //Update the map camera so that it focuses on the geometry.
            map.setCamera({ bounds: b.bbox, padding: 40 });

        }, e => {
            Swal.fire({
                title: "Unable to retrieve boundary for this location.",
                icon: "warning",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-sm btn-primary"
                }
            });
            //Fixed by SS on 16-12-24
            if (datasource !== undefined) {
                datasource.clear();
            }

        });
    }
}

function reloadBoundary() {
    if (displayedLocation) {
        getPolygon(displayedLocation);
    }
}


function addressClicked(n) {
    var t = datasource.getShapeById(n)
        , i = t.getCoordinates()
        , r = userPosition;
    routeURL.calculateRouteDirections(atlas.service.Aborter.timeout(1e4), [r, i], {
        traffic: !0,
        travelMode: "car"
    }).then(n => {
        var i = n.geojson.getFeatures()
            , t = i.features[0];
        t.properties.strokeColor = "#B76DAB";
        t.properties.strokeWidth = 5;
        t.properties.layer = "routeLayer";
        datasource.add(t)
    }
        , () => {
            Swal.fire({
                title: "Sorry, it was not possible to route to this location.",
                icon: "info",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-sm btn-primary"
                }
            });
        }
    );
    popup.close(map)
}