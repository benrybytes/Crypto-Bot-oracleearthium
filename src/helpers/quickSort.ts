export interface IPriceList {
  key: number;
  value: number;
}

function quickSort(array: IPriceList[]): IPriceList[] {
  // base case
  if (array.length <= 1) {
    return array; // return the array value to concat
  }

  const pivot = array[0]; // Ignore this number on every recursion, we don't want the same number as we want to take out one number and split the arrays

  // Split the arrays to two halves
  const left = [];
  const right = [];

  for (let i = 1; i < array.length; i++) {
    // Pivot as the main comparison
    if (array[i].value < pivot.value) {
      left.push(array[i]);
    } else {
      right.push(array[i]);
    }
  }

  return quickSort(left).concat(pivot, quickSort(right));
}

export default quickSort;
