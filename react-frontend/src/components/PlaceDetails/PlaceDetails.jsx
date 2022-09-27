import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Chip } from '@material-ui/core'
import LocationOnIcon from '@material-ui/icons/LocationOn';
import LoyaltyOutlinedIcon from '@material-ui/icons/LoyaltyOutlined';
import Rating from '@material-ui/lab/Rating'
import { addressLookup } from '../../api/geocoding/addressLookup';

import useStyles from  './styles'

const PlaceDetails = ({ place, photos, setPhotos, selected, refProp }) => {
    const serverPath = process.env.REACT_APP_SERVER_API

    const classes = useStyles();
    const [address, setAddress] = useState('')
    const [photoUrl, setPhotoUrl] = useState('')

    if(selected) refProp?.current?.scrollIntoView({ behavior: "smooth", block: "start"})

    // Get Photo
    useEffect(() => {
        // If the Photo is already Cached, read from Cache
        if(photos.hasOwnProperty(place.place_id) && photos[place.place_id] !== ''){
            setPhotoUrl(photos[place.place_id])
        }
        else if(place.photos && place.photos[0].photo_reference){ // Call Google Places Photo API
            const photoreference = place.photos[0].photo_reference;
            const URL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=4111&photoreference=${photoreference}&sensor=false&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
            // Enrich current Places Object with Additional Data
            photos[place.place_id] = URL
            setPhotos(photos)
            setPhotoUrl(URL)
        } 
    }, [place]);

    // Get Address From Coords
    //TODO ENABLE THE CODE BELOW IN FINAL RELEASE
    /*
    useEffect(() => {
        addressLookup(serverPath, place.geometry.location.lat, place.geometry.location.lng)
            .then((data) => {
                // Enrich current Places Object with Additional Data
                place.cached_address = data

                setAddress(data) 
            });
    }, [place]);
    */

    return (
        <Card elevation={6}>
            <CardMedia 
                style=  {{ height: 350 }}
                image=  { 
                            photoUrl!==''
                            ? 
                            photoUrl
                            :
                            'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg'  
                        }
                title=  {place.name}
            />
            <CardContent>
                <Typography gutterBottom variant="h5">{place.name}</Typography>
                {    // Render Rating Count
                       place.user_ratings_total ? 
                       <Box display="flex" justifyContent="space-between">
                            <Rating name="read-only" value={Number(place.rating)} readOnly />
                            <Typography component="legend">{place.rating ? place.rating.toString()+" - ":""}{place.user_ratings_total} review{place.user_ratings_total > 1 && 's'}</Typography>
                        </Box>
                        : "" 
                }
                {   // Render Open Now 
                    place.opening_hours && place.opening_hours.open_now ?
                    <Typography gutterBottom variant="subtitle1">{place.opening_hours.open_now ? "Currently Opened" : "Currently Closed" }</Typography>
                    : ""
                }
                {    // Render Business Status
                       place.business_status ? 
                           <Box display="flex" justifyContent="space-between">
                               <Typography variant="subtitle1">Business Status</Typography>
                               <Typography gutterBottom variant="subtitle1">
                                   {place.business_status}
                               </Typography>
                           </Box>
                       : "" 
                }
                {   // Render Categories
                    place?.types?.map((type) => (
                        <Chip key={type} size="small" label={type} className={classes.chip} />
                    ))
                }
                {   // Render Address Given Location
                    address !== '' ?
                    <Typography gutterBottom variant="body2" color="textSecondary" className={classes.subtitle}>
                        <LocationOnIcon />{address}
                    </Typography>
                    : ""
                }
                <CardActions>
                    <Button size="small" color="primary" onClick={() => window.open("https://www.tripadvisor.com/", '_blank')}>
                    Trip Advisor
                    </Button>
                    <Button size="small" color="primary" onClick={() => window.open("https://www.tripadvisor.com/", '_blank')}>
                    Web-ReplaceAction
                    </Button>
                </CardActions>
            </CardContent>
        </Card>
    );
}

export default PlaceDetails;

