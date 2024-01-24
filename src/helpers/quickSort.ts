import { IPriceList } from "../interfaces/price_list.interface";
import IUser from "../interfaces/users.interface";

function quickSort<T extends IPriceList | IUser>(
  array: T[],
  key: keyof T,
): T[] {
  // base case
  if (array.length <= 1) {
    return array;
  }

  const pivot: T = array[0];
  const pivotKeyValue = pivot[key]; // Access the key using dynamic key

  const left: T[] = [];
  const right: T[] = [];

  for (let i = 1; i < array.length; i++) {
    // Pivot as the main comparison
    if (array[i][key] < pivotKeyValue) {
      left.push(array[i]);
    } else {
      right.push(array[i]);
    }
  }

  return quickSort(left, key).concat(pivot, quickSort(right, key));
}

export default quickSort;
