import axios from 'axios';

export const getPlacesData = async (serverPath, lat, lng, type) => {
   const URL = serverPath+'/api/places';
   const response = await axios.get(URL, {
       params: {
         lat,
         lng,
         type
       },
       headers: { }
     });

     //console.log(response.data);
     return response.data;
      
}
