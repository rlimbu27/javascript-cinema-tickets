import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import TicketService from './src/pairtest/TicketService.js';

console.log('||||||||| CINEMA TICKETS |||||||||| \n');

const line = readline.createInterface({ input, output });

const ticketRequestedForAdult = { 'type': 'ADULT', 'count': await line.question('Enter required number of adult tickets: ') };

const ticketRequestedForChild = { 'type': 'CHILD', 'count': await line.question('Enter required number of child tickets: ') };

const ticketRequestedForInfant = { 'type': 'INFANT', 'count': await line.question('Enter required number of infant tickets: ') };

const accountId = await line.question('Enter your account id: ');

const ticketService = new TicketService();
const response = ticketService.purchaseTickets(accountId,
	ticketRequestedForAdult,
	ticketRequestedForChild,
	ticketRequestedForInfant
);
console.log(response);
line.close();