// "use client";

// import Feature from "ol/Feature";
// import Map from "ol/Map";
// import Overlay from "ol/Overlay";
// import View from "ol/View";
// import Point from "ol/geom/Point";
// import TileLayer from "ol/layer/Tile";
// import VectorLayer from "ol/layer/Vector";
// import "ol/ol.css";
// import { fromLonLat } from "ol/proj";
// import Cluster from "ol/source/Cluster";
// import OSM from "ol/source/OSM";
// import VectorSource from "ol/source/Vector";
// import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";
// import { useEffect, useRef, useState } from "react";

// const generateVehicleLocations = (count: number) => {
//      // Approximate boundaries of Anambra State
//      const minLon = 6.7;
//      const maxLon = 7.3;
//      const minLat = 5.8;
//      const maxLat = 6.9;

//      const vehicleTypes = ["Car", "Truck", "Van", "Bus", "MOTOR_CYCLE"];
//      const majorRoads = ["Onitsha-Owerri Expressway", "Enugu-Onitsha Expressway", "Awka Road", "Zik Avenue", "Old Onitsha Road", "Nnamdi Azikiwe Avenue"];

//      return Array.from({ length: count }, (_, i) => ({
//           id: i + 1,
//           position: [minLon + Math.random() * (maxLon - minLon), minLat + Math.random() * (maxLat - minLat)],
//           type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
//           registrationNumber: `AN-${100 + Math.floor(Math.random() * 900)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
//           lastKnownRoad: majorRoads[Math.floor(Math.random() * majorRoads.length)],
//           speed: Math.floor(Math.random() * 100) + 10,
//      }));
// };

// const vehicles = generateVehicleLocations(100);

// export default function AnambraVehicleTrackerOL() {
//      const mapRef = useRef<HTMLDivElement>(null);
//      const [map, setMap] = useState<Map | null>(null);
//      const [popup, setPopup] = useState<Overlay | null>(null);

//      useEffect(() => {
//           if (!mapRef.current) return;

//           const features = vehicles.map((vehicle) => {
//                const feature = new Feature(new Point(fromLonLat(vehicle.position)));
//                feature.setProperties(vehicle);
//                return feature;
//           });

//           const vectorSource = new VectorSource({
//                features: features,
//           });

//           const clusterSource = new Cluster({
//                distance: 40,
//                source: vectorSource,
//           });

//           const styleCache: { [key: number]: Style } = {};
//           const clusters = new VectorLayer({
//                source: clusterSource,
//                style: (feature) => {
//                     const size = feature.get("features").length;
//                     let style = styleCache[size];
//                     if (!style) {
//                          style = new Style({
//                               image: new CircleStyle({
//                                    radius: 10 + Math.min(size, 20),
//                                    fill: new Fill({
//                                         color: "rgba(255, 153, 0, 0.8)",
//                                    }),
//                                    stroke: new Stroke({
//                                         color: "#fff",
//                                    }),
//                               }),
//                               text: new Text({
//                                    text: size.toString(),
//                                    fill: new Fill({
//                                         color: "#fff",
//                                    }),
//                                    font: "12px sans-serif",
//                               }),
//                          });
//                          styleCache[size] = style;
//                     }
//                     return style;
//                },
//           });

//           const newMap = new Map({
//                target: mapRef.current,
//                layers: [
//                     new TileLayer({
//                          source: new OSM(),
//                     }),
//                     clusters,
//                ],
//                view: new View({
//                     center: fromLonLat([7.0, 6.2]),
//                     zoom: 11,
//                }),
//           });

//           const popupElement = document.createElement("div");
//           popupElement.className = "ol-popup";
//           const newPopup = new Overlay({
//                element: popupElement,
//                positioning: "bottom-center",
//                stopEvent: false,
//                offset: [0, -10],
//           });
//           newMap.addOverlay(newPopup);

//           newMap.on("click", (evt) => {
//                const feature = newMap.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
//                if (feature) {
//                     // @ts-expect-error
//                     const coordinates = feature.getGeometry().getCoordinates();
//                     const properties = feature.get("features")[0].getProperties();
//                     popupElement.innerHTML = `
//                          <div class="bg-white p-2 rounded shadow">
//                          <h3 class="font-bold">${properties.type}</h3>
//                          <p>Reg. Number: ${properties.registrationNumber}</p>
//                          <p>Last Known Road: ${properties.lastKnownRoad}</p>
//                          <p>Speed: ${properties.speed} km/h</p>
//                          </div>
//                     `;
//                     newPopup.setPosition(coordinates);
//                } else {
//                     newPopup.setPosition(undefined);
//                }
//           });

//           setMap(newMap);
//           setPopup(newPopup);

//           return () => {
//                newMap.setTarget(undefined);
//           };
//      }, []);

//      return (
//           <div className="relative h-[90svh] w-full">
//                <div ref={mapRef} className="h-full w-full" />
//           </div>
//      );
// }
