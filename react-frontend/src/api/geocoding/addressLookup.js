import axios from 'axios';

export const addressLookup = async (serverPath, lat, lng) => {
   const URL = serverPath+'/api/addresslookup';
   const response = await axios.get(URL, {
       params: {
         lat,
         lng
       },
       headers: { }
     });

     //console.log(response.data);
     return response.data;
      
}
