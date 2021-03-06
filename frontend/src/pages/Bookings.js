import React, { Component } from 'react';
import AuthContext from '../context/auth-context'
import Spinner from '../component/Spinner/Spinner'
import BookingsList from '../component/Bookings/BookingsList/BookingsList'
import BookingsChart from '../component/Bookings/BookingsChart/BookingsChart'
import BookingsControls from '../component/Bookings/bookingsControls/bookingsControls'
class BookingsPage extends Component {
    state = {
        isLoading: false,
        bookings: [],
        outputType: 'list'
    }
    static contextType = AuthContext
    componentDidMount(){
        this.fetchBookings()
    }
     fetchBookings = () => {
        this.setState({isLoading:true})
         const requestBody = {
            query: `query{
                         bookings {
                            _id
                            event{
                                _id
                                title
                                date
                                price
                            }
                            createdAt
                            updatedAt
                         }
                    }
            `
        }
        const token = this.context.token
         fetch('http://localhost:8000/graphql', {
             method: 'POST',
             body: JSON.stringify(requestBody),
             headers: {
                 'Content-Type': 'application/json',
                 Authorization: 'Bearer ' + token
             }
         }).then(res => {
             if (res.status !== 200 && res.status !== 201) {
                 throw new Error('Failed!')
             }
             return res.json()
         }).then(resData => {
            this.setState({bookings: resData.data.bookings, isLoading: false})
         }).catch(err => {
             console.log(err)
             this.setState({isLoading:false})
         })
    }
    deleteBookingHandler = bookingId => {
        this.setState({isLoading:true})
         const requestBody = {
            query: `mutation CancelBooking($id: ID!) {
                        cancelBooking(bookingId: $id) {
                                _id
                                title

                        }
                    }
            `,
            variables: {
                id: bookingId
            }
        }
        const token = this.context.token
        //console.log(JSON.stringify(requestBody), token)
         fetch('http://localhost:8000/graphql', {
             method: 'POST',
             body: JSON.stringify(requestBody),
             headers: {
                 'Content-Type': 'application/json',
                 Authorization: 'Bearer ' + token
             }
         }).then(res => {
             if (res.status !== 200 && res.status !== 201) {
                 throw res
             }
             return res.json()
         }).then(resData => {
            this.setState( prevState=> {
                const UpdatedBookings = prevState.bookings.filter(booking =>{
                    return booking._id !== bookingId
                })

                return {
                    bookings: UpdatedBookings,
                    isLoading: false
                }
            })
         }).catch(err => {
             console.log(err)
             this.setState({isLoading:false})
         })

    }
    changeOutputTypeHandler = outputType => {
        if(outputType === 'list'){
            this.setState({outputType: 'list'})
        }else{
            this.setState({outputType: 'chart'})
        }

    }
    render() {

        let content = <Spinner/>
        if(! this.state.isLoading){
            content = (
                <React.Fragment>
                    <BookingsControls activeOutputType={this.state.outputType} onChange = {this.changeOutputTypeHandler} />
                    <div>
                        { this.state.outputType === 'list' ? 
                            <BookingsList bookings={this.state.bookings} onDelete={this.deleteBookingHandler}/> :
                            <BookingsChart  bookings={this.state.bookings}/>
                        }
                    </div>
                </React.Fragment>
            )
        }

        return (
                <React.Fragment >
                    {content}
                </React.Fragment>
                )

    }
}

export default BookingsPage;