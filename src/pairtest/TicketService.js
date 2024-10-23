import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import {PRICE_ADULT, PRICE_CHILD, CURRENCY} from './constants/payments.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
    /**
     * Should only have private methods other than the one below.
     */

    #validateTicketRequestType(tickets) {
        let status = true;
        let noOfAdultTickets = 0;
        let noOfInfantTickets = 0;
        let noOfChildTickets = 0;
        let message = "";
        let data = {};
        let totalRequested = 0;
        try {
            for (let i = 0; i < tickets.length; i++) {
                if (!tickets[i].hasOwnProperty('type') || !tickets[i].hasOwnProperty('count')) {
                    return {
                        message: "Invalid ticket requests", status: false
                    }
                }
                const ticketTypeRequest = new TicketTypeRequest(tickets[i]['type'], parseInt(tickets[i]['count']));
                totalRequested += ticketTypeRequest.getNoOfTickets();
                switch (ticketTypeRequest.getTicketType()) {
                    case 'ADULT':
                        noOfAdultTickets = ticketTypeRequest.getNoOfTickets();
                        break;
                    case 'INFANT':
                        noOfInfantTickets = ticketTypeRequest.getNoOfTickets();
                        break;
                    case 'CHILD':
                        noOfChildTickets = ticketTypeRequest.getNoOfTickets();
                        break;
                    default:
                        break;
                }
            }
        } catch (error) {
            return {
                message: error.message, status: false
            };
        }
        if (totalRequested <= 0 || noOfAdultTickets <= 0) {
            return {
                message: "At least one adult ticket needs to be purchased", status: false
            };
        }
        if (noOfAdultTickets < noOfInfantTickets) {
            return {
                message: "Number of infant tickets cannot exceed number of adult tickets", status: false
            };
        }
        if (totalRequested > 25) {
            return {
                message: "Ticket request exceeded maximum allowed count of 25", status: false
            };
        }
        return {
            data: {'ADULT': noOfAdultTickets, 'CHILD': noOfChildTickets}, message: message, status: status
        };
    }

    #isAuthorisedUser(accountId) {
        return !(!Number.isInteger(parseInt(accountId)) || parseInt(accountId) <= 0);
    }

    purchaseTickets(accountId, ...ticketTypeRequests) {
        if (!this.#isAuthorisedUser(accountId)) {
            return {
                statusCode: 403,
                message: "Error: Unauthorised user"
            }
        }
        accountId = parseInt(accountId);

        const isValidRequest = this.#validateTicketRequestType(ticketTypeRequests);

        if (!isValidRequest.status) {
            throw new InvalidPurchaseException(isValidRequest.message, 400);
        }

        const noOfAdultTickets = isValidRequest.data.ADULT;
        const noOfChildTickets = isValidRequest.data.CHILD;
        const totalAmountToPay = (noOfAdultTickets * PRICE_ADULT) + (noOfChildTickets * PRICE_CHILD);

        const ticketService = new TicketPaymentService();
        ticketService.makePayment(accountId, totalAmountToPay);

        const totalNoOfSeats = noOfChildTickets + noOfAdultTickets;
        const seatService = new SeatReservationService();
        seatService.reserveSeat(accountId, totalNoOfSeats);

        return {
            statusCode: 200,
            message: "Your purchase has been successful. " +totalNoOfSeats + " seats has been allocated for the payment of "+ CURRENCY + " " + totalAmountToPay+ "."
        };

    }
}
