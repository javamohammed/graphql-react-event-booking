const Event = require('../../models/event')
const User = require('../../models/user')
const {transformEvent}  = require('./merge')


module.exports = {
    events: async () => {
            try {
                const events = await Event.find()
                return events.map(event => {
                    //console.log(...event._doc)
                    return transformEvent(event)
                })
            } catch (err) {
                throw err
            }
        },
    createEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated !!' + req.isAuth)
        }
        let createdEvents;
        try{
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date), //new Date().toISOString()
                creator: req.userId
            })
            const result = await event.save()
            createdEvents = transformEvent(result)
            const creator = await User.findById(req.userId)
            if (!creator) {
                throw new Error('user not found !')
            }
            creator.createdEvents.push(event)
            await creator.save()
            return createdEvents
        }catch(err){
            console.log(err)
            throw err
        }
    }
}