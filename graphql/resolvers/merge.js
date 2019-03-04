const DataLoader = require('dataloader')
const User = require('../../models/user')
const Event = require('../../models/event')
const {dateToString}  = require('../../helpers/date')


const eventsLoader = new DataLoader(eventIds => events(eventIds));
const userLoader = new DataLoader(userIds => {
    return User.find({_id: {$in: userIds}})
});
const events = async eventIds => {
    try {
        const events = await Event.find({
            _id: {
                $in: eventIds
            }
        })
        events.sort((a,b) => {
            return eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
        })
        return events.map(event => {
            return transformEvent(event)
        })
    } catch (err) {
        throw err
    }
}
const user = async userId => {
    try {
        const user = await userLoader.load(userId.toString())
        return {
            ...user._doc,
            id: user.id,
            createdEvents: () => eventsLoader.loadMany( user._doc.createdEvents)
        }
    } catch (err) {
        throw err
    }
}


const transformEvent = event => {
    return {
        ...event._doc,
        id: event.id,
        title: event.title,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator),
    }
}

const transformBooking = booking => {
    //console.log(booking.event)
    return {
        ...booking._doc,
        id: booking.id,
        event: SingleEvent.bind(this, booking.event),
        user: user.bind(this, booking.user),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt),
    }
}




const SingleEvent = async eventId => {
    try {
        const event = await eventsLoader.load(eventId.toString())
        return event
    } catch (err) {
        throw err
    }
}

exports.transformEvent = transformEvent
exports.transformBooking = transformBooking
exports.user = user
exports.events = events
exports.SingleEvent = SingleEvent