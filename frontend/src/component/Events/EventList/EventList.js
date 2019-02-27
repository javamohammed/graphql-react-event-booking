import React from 'react';
import EventItem from './EventItem/EventItem'

import './EventList.css'


const eventList = props => {
    const listEvents = props.events.map(event => {
            return <EventItem 
                        key={event._id} 
                        eventId ={event._id}
                        date={event.date} 
                        price={event.price} 
                        title= {event.title} 
                        userId={props.authUserId} 
                        creatorId={event.creator._id}
                        onDetail={props.onViewDetail}
                        />
        })
    return (
            <ul className="event__list">
                {listEvents}
            </ul>
    )
}

export default eventList