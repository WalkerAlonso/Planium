import React, { useState, useEffect } from "react";
import { CssBaseline, Grid } from "@material-ui/core";

import { getPlacesData } from './api/nearbysearch/getPlacesData';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

const App = () => {
    const serverPath = process.env.REACT_APP_SERVER_API
    const [places, setPlaces] = useState([])
    const [filteredPlaces, setFilteredPlaces] = useState([])
    const [hasFilteredRating, setHasFilteredRating] = useState(false)
    const [coords, setCoords] = useState({})
    const [bounds, setBounds] = useState(null)
    const [photos, setPhotos] = useState({})
    const [childClicked, setChildClicked] = useState(null)
    const [type, setType] = useState('tourist_attraction');
    const [rating, setRating] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    
    // Using Browse Geolocation API to get Current Position
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            setCoords({ lat: latitude, lng: longitude });
        });
    }, []);

    useEffect(() => {
        const filteredPlaces = places.filter((place) => place.rating > rating);
        setFilteredPlaces(filteredPlaces);
        setHasFilteredRating(true)
    },[rating, places]);

    // Handle Google Maps Map  
    useEffect(() => {
        if(bounds!=null && bounds.hasOwnProperty('sw') && bounds.hasOwnProperty('ne')){
            let isCached = false
            let isChangedType = false
            // Reduce calls to API by setting a minimum distance
            if(places.length){
                if(places.hasOwnProperty('cached_lat')){
                    let minimumDistance = 0.047
                    let deltaMoved = Math.abs(places.cached_lat-coords.lat)+Math.abs(places.cached_lng-coords.lng)
                    isCached = deltaMoved < minimumDistance
                    if(isCached){
                        console.log("NOT Making a Google Maps JS API Call")
                    } 
                }
            }

            // Check if a previous type has been cached
            if(places.hasOwnProperty('cached_type')){
                isChangedType = places.cached_type !== type
            }

            // Call Google Maps API
            if(((!isCached) || isChangedType)&&(!isLoading)){
                console.log("Making a Google Maps JS API Call")
                setIsLoading(true);
                getPlacesData(serverPath, coords.lat, coords.lng, type)
                .then((data) => {
                    data=data.slice(0,5) //REMOVE SLICE
                    // Cache the Request Coords for the current API Call
                    data = data?.filter((place)=> place.name && place.user_ratings_total > 0)
                    data.cached_lat = coords.lat 
                    data.cached_lng = coords.lng
                    data.cached_type = type
                    setPlaces(data)
                    setFilteredPlaces([])
                    setHasFilteredRating(false)
                    setIsLoading(false)
                });
            }
        } 
    }, [bounds, coords, type]);

    return (
        <>
            <CssBaseline />
            <Header setCoords={setCoords} />
            <Grid container spacing={3} style={{ width: '100%' }}>
                <Grid item xs={12} md={4}>
                    <List 
                        places={filteredPlaces.length||hasFilteredRating ? filteredPlaces : places} 
                        photos={photos} 
                        setPhotos={setPhotos} 
                        childClicked={childClicked}
                        isLoading={isLoading}
                        type={type}
                        setType={setType}
                        rating={rating}
                        setRating={setRating}
                    />
                </Grid> 
                <Grid item xs={12} md={8}>
                    <Map 
                        setCoords={setCoords}
                        setBounds= {setBounds}
                        coords={coords}
                        places={filteredPlaces.length||hasFilteredRating ? filteredPlaces : places}
                        photos={photos}
                        setChildClicked={setChildClicked}
                    />
                </Grid> 
            </Grid>
        </>
    );
}


export default App;