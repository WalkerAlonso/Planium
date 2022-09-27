const path = require('path')
const dotenv = require('dotenv').config()
const cors = require('cors')
const axios = require('axios')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../../react-frontend/public')

app.use(express.static(publicDirectoryPath))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//app.use('/api', router);
/*
router.use((request, response, next) => {
    console.log("============ MIDDLEWARE ============");
    next();
});*/

// Google Places API
app.get('/api/places', (req, res) => {
    //console.log("THE API HAS BEEN CALLED")
    //console.log(req.query)
    const lat = req.query.lat
    const lng = req.query.lng
    const type = req.query.type
    try{
        //console.log("GETTING PLACES")
        //console.log(lat, lng)
        const URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        axios.get(URL, {
            params: {
              location:`${lat},${lng}`,
              radius: '50000',
              rankby: 'prominence',
              key: process.env.GOOGLE_MAPS_API_KEY,
              type: `${type}`
            },
            headers: { }
          })
          .then( (response) => {
            //console.log("RESPONSE")
            //console.log(response.data.results)
            /*if(response.data.results.length>3){
                console.log(response.data.results.slice(0,4))
            }*/
            res.send(response.data.results)
          })
          .catch(err => {
            console.log(err)       
          });
          
        // In case you want to fetch more than 20 results
        // You have to make another call and add the parameter pagetoken = data.next_page_token
        
    }catch(error){
        console.log(error)
    }   
})

// Google Geocoding API
app.get('/api/addresslookup', (req, res) => {
    //console.log("THE API HAS BEEN CALLED")
    //console.log(req.query)
    const lat = req.query.lat
    const lng = req.query.lng
    try{
        //console.log("GETTING PLACES")
        //console.log(lat, lng)
        const URL = 'https://maps.googleapis.com/maps/api/geocode/json';
        axios.get(URL, {
            params: {
              latlng:`${lat},${lng}`,
              key: process.env.GOOGLE_MAPS_API_KEY,
            },
            headers: { }
          })
          .then( (response) => {
            //console.log("RESPONSE")
            //console.log(response.data.results)
            /*if(response.data.results.length>3){
                console.log(response.data.results.slice(0,4))
            }*/
            //console.log(response.data.results[0].formatted_address)
            res.send(response.data.results[0].formatted_address)
          })
          .catch(err => {
            console.log(err)       
          });
          
        // In case you want to fetch more than 20 results
        // You have to make another call and add the parameter pagetoken = data.next_page_token  
    }catch(error){
        console.log(error)
    }   
})


// Chat with Web Sockets
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})

