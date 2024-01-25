"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function quickSort(array, key) {
    // base case
    if (array.length <= 1) {
        return array;
    }
    const pivot = array[0];
    const pivotKeyValue = pivot[key]; // Access the key using dynamic key
    const left = [];
    const right = [];
    for (let i = 1; i < array.length; i++) {
        // Pivot as the main comparison
        if (array[i][key] < pivotKeyValue) {
            left.push(array[i]);
        }
        else {
            right.push(array[i]);
        }
    }
    return quickSort(left, key).concat(pivot, quickSort(right, key));
}
exports.default = quickSort;
