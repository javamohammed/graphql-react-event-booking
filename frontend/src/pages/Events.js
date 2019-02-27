import React from 'react';
import Modal from '../component/Modal/Modal'
import Backdrop from '../component/Backdrop/Backdrop'
import AuthContext from '../context/auth-context'
import Spinner from '../component/Spinner/Spinner'
import EventList from '../component/Events/EventList/EventList'
import './Events.css';
class EventsPage extends React.Component {
    state = {
        creating : false,
        events : [],
        isLoading: false,
        selectedEvent: null
    }
    static contextType = AuthContext
    constructor(props){
        super(props)
        this.titleElRef = React.createRef()
        this.priceElRef = React.createRef()
        this.dateElRef = React.createRef()
        this.descriptionElRef = React.createRef()

    }
    componentDidMount(){
        this.fetchEvents()
    //console.log(this.state.events)
    }
    startCreateEventHandler = () => {
         this.setState({ creating: true})
    }
    modalCancelHandler = () => {
        this.setState({ creating: false, selectedEvent:null})
    }
    bookEventHandler = ()=>{}

    modalConfirmHandler = () => {
        this.setState({ creating: false})
        const title = this.titleElRef.current.value
        const price = this.priceElRef.current.value
        const date = this.dateElRef.current.value
        const description = this.descriptionElRef.current.value

        if (title.trim().length === 0 || price <= 0 || date.trim().length === 0 || description.trim().length === 0 ) {
            return
        }
        const event = {title, price, date, description}
        console.log(event)

        const requestBody = {
            query: `mutation{
                        createEvent(eventInput: {
                                title: "${title}",
                                price: ${price},
                                date: "${date}",
                                description: "${description}",
                            }) {
                            _id
                            title
                            description
                            price
                            date
                        }
                    }
            `
        }
        const token = this.context.token
        console.log(this.context)

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers:{
                'Content-Type':'application/json',
                Authorization:'Bearer '+token
            }
        }).then(res => {
            if(res.status !==200  && res.status !== 201){
                throw new Error('Failed!')
            }
            return res.json()
        }).then( resData=> {
            //this.fetchEvents()
            this.setState( prevState => {
                const updatedEvents = [...prevState.events]
                updatedEvents.push({
                    _id: resData.data.createEvent._id,
                    title: resData.data.createEvent.title,
                    description: resData.data.createEvent.description,
                    price: resData.data.createEvent.price,
                    date: resData.data.createEvent.date,
                    creator: {
                        _id: this.context.userId
                    }
                })
                return {events:updatedEvents}
            })

            //console.log(resData)
        }).catch(err => {
            throw err
        })
    }
    fetchEvents = () => {
        this.setState({isLoading:true})
         const requestBody = {
            query: `query{
                         events {
                             _id
                             title
                             description
                             price
                             date
                             creator {
                                 _id
                                 email
                             }
                         }
                    }
            `
        }
         fetch('http://localhost:8000/graphql', {
             method: 'POST',
             body: JSON.stringify(requestBody),
             headers: {
                 'Content-Type': 'application/json',
             }
         }).then(res => {
             if (res.status !== 200 && res.status !== 201) {
                 throw new Error('Failed!')
             }
             return res.json()
         }).then(resData => {
            this.setState({events: resData.data.events, isLoading: false})
         }).catch(err => {
             console.log(err)
             this.setState({isLoading:false})
         })
    }
    showDetailHandler = eventId =>{
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId)
            return { selectedEvent: selectedEvent }
        })
    }
    render() {

        return <React.Fragment>
            { (this.state.creating || this.state.selectedEvent) && <Backdrop/>}
            { this.state.creating && 
                <Modal 
                    title="Add Event" 
                    canCancel 
                    canConfirm 
                    onCancel={this.modalCancelHandler} 
                    onConfirm={this.modalConfirmHandler}
                    confirmText="Confirm"
                    >
               <form>
                    <div className="form-control">
                        <label htmlFor="title">Title</label>
                        <input type="text" id="title" ref={this.titleElRef} />
                   </div>

                   <div className="form-control">
                        <label htmlFor="price">Price</label>
                        <input type="number" id="price" ref={this.priceElRef} />
                   </div>

                    <div className="form-control">
                        <label htmlFor="date">Date</label>
                        <input type="datetime-local" id="date"  ref={this.dateElRef}/>
                   </div>

                   <div className="form-control">
                        <label htmlFor="description">Description</label>
                        <textarea  id="description"  rows="4" ref={this.descriptionElRef}/>
                   </div>
               </form>
                </Modal> }
            {this.state.selectedEvent &&
                         (<Modal 
                            title={this.state.selectedEvent.title}
                            canCancel
                            canConfirm
                            onCancel={this.modalCancelHandler}
                            onConfirm={this.bookEventHandler}
                            confirmText = "Book"
                            >
                            <h1>{this.state.selectedEvent.title}</h1>
                            <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
                            <p>
                                {this.state.selectedEvent.description}
                            </p>
                </Modal>)}
            {this.context.token &&
            <div className="events-control">
            <p>Share your own Event !</p>
                    <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
            </div>
            }
            {this.state.isLoading ?
                <Spinner/>:
                <EventList events={this.state.events} authUserId={this.context.userId} onViewDetail={this.showDetailHandler}/>
            }

        </React.Fragment>
    }
}

export default EventsPage;