export default class InvalidPurchaseException extends Error {

    constructor(message, status) {
        super(message);
        this.name = "InvalidPurchaseException";
        this.status = status;
    }


}
