export const arrayCouples = (number:number)=>{

    const arr:number[] = Array(number).fill(0).map((elem,index)=>index);

    const arrCouple = arr.reduce((acc, elem, index, array )=>{
      const restArray = array.slice(index+1);
      if (!restArray.length) return acc;
      const couples: [number, number][] = restArray.reduce((acc,e)=>{
        if (e===elem) return acc;
        return [...acc, [elem,e]]
      },[]  as [number, number][]);
        return [...acc, ...couples]

    }, [] as [number, number][])

    return arrCouple

}