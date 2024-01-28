"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Content we want to send to server
const requestHeaders = new Headers();
requestHeaders.set("Content-Type", "application/json");
/*
    Dynamic function accepting multiple data types for request to send to
    Pre Condition: Take in a generic containing the data we get from the request and the type of data we want to send to the server
    Post Condition: The datatype U gets sent back to client as a promise with the data if any to handle

    @param url - The url we want to handle the request to
*/
function makePostRequest(url, dataToSend) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(url, {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(Object.assign({}, dataToSend)),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // Return a created promise for the data found
            const data = yield response.json();
            return { data_response: Promise.resolve(data), error: null };
        }
        catch (error) {
            console.error("Error making post request:", error);
            return { data_response: null, error: null };
        }
    });
}
exports.default = makePostRequest;
