const express = require('express')
const BodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const isAuth = require('./middleware/is-auth')


const buildSchema  = require('./graphql/schema/index')
const rootValue = require('./graphql/resolvers/index')



const app  = express()
app.use(BodyParser.json())
app.use( (req, res, next)=> {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if(req.method === 'OPTIONS'){
        return res.sendStatus(200)
    }
    return next()
})
app.use(isAuth)




app.use('/graphql', graphqlHttp({
    schema: buildSchema,
    rootValue: rootValue,
    graphiql: true
}))


const MyConfig = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-lth4s.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
mongoose.connect(MyConfig,{ useNewUrlParser: true}).then( () => {
                    console.log('MongoDB connected with success !!')
                    app.listen(8000)
                }).catch(err => {
                    console.log(err)
                })
