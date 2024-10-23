import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException";
import TicketService from "../src/pairtest/TicketService";

describe('TicketService', () => {
    let ticketService;
    beforeEach(() => {
        ticketService = new TicketService();
    })
    it('should throw unauthorized user error response for invalid account Id', () => {
        const expectedResponse = { statusCode: 403, message: 'Error: Unauthorised user'};
        const response = ticketService.purchaseTickets(0, 'ADULT', 'CHILD');
        expect(response.statusCode).toEqual(expectedResponse.statusCode);
        expect(response.message).toEqual(expectedResponse.message);

        const actual = ticketService.purchaseTickets('errorAccountId');
        expect(actual.statusCode).toEqual(expectedResponse.statusCode);
        expect(actual.message).toEqual(expectedResponse.message);
    });
    it('should throw InvalidPurchaseException error for all invalid ticket types', () => {
        expect(() => ticketService.purchaseTickets(1, 'INFANT'))
            .toThrowError(new InvalidPurchaseException('Invalid ticket requests', 400));
        expect(() => ticketService.purchaseTickets(1, { type: 'ADULT', count: 3}, { type: 'CHILD', missingCount: 'missing'}))
            .toThrowError(new InvalidPurchaseException('Invalid ticket requests', 400));
    });
    it('should throw InvalidPurchaseException error if user tries to purchase tickets with NO adult tickets ', () => {
        const expectedErrorMessage = 'At least one adult ticket needs to be purchased';
        const expectedErrorCode = 400;
        expect(() => ticketService.purchaseTickets(33345, { type: 'CHILD', count: 3}, { type: 'INFANT', count: 3}))
            .toThrowError(new InvalidPurchaseException(expectedErrorMessage, expectedErrorCode));
        expect(() => ticketService.purchaseTickets(3345, { type: 'ADULT', count: 0}, { type: 'CHILD', count: '2'}, { type: 'INFANT', count: '2'}))
            .toThrowError(new InvalidPurchaseException(expectedErrorMessage, expectedErrorMessage));
        expect(() => ticketService.purchaseTickets(33345))
            .toThrowError(new InvalidPurchaseException(expectedErrorMessage, expectedErrorCode));
    });
    it('should throw InvalidPurchaseException error if number of infant ticket is greater than number of adult ticket', () => {
        expect(() => ticketService.purchaseTickets(1,
            { type: 'ADULT', count: 1 },
            { type: 'CHILD', count: 1 },
            { type: 'INFANT', count: 5 }))
            .toThrowError(new InvalidPurchaseException('Number of infant tickets cannot exceed number of adult tickets', 400));
    });
    it('should throw InvalidPurchaseException errors if total requested ticket is greater than 25', () => {
        expect(() => ticketService.purchaseTickets(1,
            {type: 'ADULT', count: 20},
            { type: 'CHILD', count: 30},
            {type: 'INFANT', count: 10}))
            .toThrowError(new InvalidPurchaseException('Ticket request exceeded maximum allowed count of 25', 400));
    });

    it('should successfully purchase ticket for authorised users with valid ticket requests', () => {
        const result = ticketService.purchaseTickets(456543, {type: 'ADULT', count: 1}, {
            type: 'CHILD', count: 2}, {type: 'INFANT', count: 1} );
        expect(result).toEqual({
            statusCode: 200,
            message: "Your purchase has been successful. 3 seats has been allocated for the payment of GBP 55."
        });
    });

});